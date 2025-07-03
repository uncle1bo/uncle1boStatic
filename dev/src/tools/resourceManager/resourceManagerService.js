/**
 * 外部资源管理器服务
 * 提供缺失资源检测、下载和管理功能
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const { EventEmitter } = require('events');

// 导入配置
const paths = require('../../config/pathConfig');

class ResourceManagerService extends EventEmitter {
  constructor() {
    super();
    this.prodPath = path.resolve(__dirname, '../../../../prod');
    this.dependencyConfigPath = path.join(this.prodPath, 'js/dependency-manager.js');
    this.historyFile = path.join(paths.temp, 'resource-manager-history.json');
    this.missingResourcesFile = path.join(paths.temp, 'missing-resources.json');
    this.downloadStatus = new Map(); // 下载状态跟踪
    this.dependencyResources = null;
    this.loadDependencyConfig();
    this.ensureHistoryFile();
    this.ensureMissingResourcesFile();
  }

  /**
   * 加载依赖资源配置
   */
  async loadDependencyConfig() {
    try {
      // 动态加载依赖资源配置
      delete require.cache[this.dependencyConfigPath];
      const configModule = require(this.dependencyConfigPath);
      
      // 提取DependencyConfig类的实例
      if (typeof configModule === 'function') {
        const configInstance = new configModule();
        this.dependencyResources = configInstance.cdnResources || {};
      } else if (configModule.CDNConfig) {
        const configInstance = new configModule.CDNConfig();
        this.dependencyResources = configInstance.cdnResources || {};
      } else {
        this.dependencyResources = configModule.cdnResources || configModule || {};
      }
      
      console.log(`已加载 ${Object.keys(this.dependencyResources).length} 个依赖资源配置`);
    } catch (error) {
      console.error('加载依赖资源配置失败:', error);
      this.dependencyResources = {};
    }
  }

  /**
   * 确保历史记录文件存在
   */
  async ensureHistoryFile() {
    try {
      await fs.ensureFile(this.historyFile);
      const exists = await fs.pathExists(this.historyFile);
      if (exists) {
        const content = await fs.readFile(this.historyFile, 'utf8');
        if (!content.trim()) {
          await fs.writeJson(this.historyFile, []);
        }
      } else {
        await fs.writeJson(this.historyFile, []);
      }
    } catch (error) {
      console.error('创建历史记录文件失败:', error);
      await fs.writeJson(this.historyFile, []);
    }
  }

  /**
   * 确保缺失资源文件存在
   */
  async ensureMissingResourcesFile() {
    try {
      await fs.ensureFile(this.missingResourcesFile);
      const exists = await fs.pathExists(this.missingResourcesFile);
      if (exists) {
        const content = await fs.readFile(this.missingResourcesFile, 'utf8');
        if (!content.trim()) {
          await fs.writeJson(this.missingResourcesFile, []);
        }
      } else {
        await fs.writeJson(this.missingResourcesFile, []);
      }
    } catch (error) {
      console.error('创建缺失资源文件失败:', error);
      await fs.writeJson(this.missingResourcesFile, []);
    }
  }

  /**
   * 扫描缺失的资源
   */
  async scanMissingResources(resourceKey = null) {
    await this.loadDependencyConfig(); // 重新加载配置确保最新
    
    const missingResources = [];
    const resourcesToCheck = resourceKey ? 
      { [resourceKey]: this.dependencyResources[resourceKey] } : 
      this.dependencyResources;

    for (const [key, resource] of Object.entries(resourcesToCheck)) {
      if (!resource || !resource.localPath) {
        continue;
      }

      const localFilePath = path.join(this.prodPath, resource.localPath.replace(/^\//, ''));
      const exists = await fs.pathExists(localFilePath);
      
      if (!exists) {
        const resourceInfo = {
          key,
          name: resource.name || key,
          localPath: resource.localPath,
          absolutePath: localFilePath,
          type: resource.type || 'unknown',
          primary: resource.primary,
          fallbacks: resource.fallbacks || [],
          dependencies: resource.dependencies || [],
          size: null,
          lastModified: null
        };

        // 尝试获取远程文件信息
        try {
          const remoteInfo = await this.getRemoteFileInfo(resource.primary);
          resourceInfo.size = remoteInfo.size;
          resourceInfo.lastModified = remoteInfo.lastModified;
        } catch (error) {
          console.warn(`获取远程文件信息失败 ${key}:`, error.message);
        }

        missingResources.push(resourceInfo);
      }
    }

    // 按依赖关系排序
    const sortedResources = this.sortByDependencies(missingResources);

    return {
      total: Object.keys(resourcesToCheck).length,
      missing: sortedResources.length,
      resources: sortedResources,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 获取远程文件信息
   */
  async getRemoteFileInfo(url) {
    const response = await axios.head(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Resource-Manager/1.0'
      }
    });

    return {
      size: response.headers['content-length'] ? parseInt(response.headers['content-length']) : null,
      lastModified: response.headers['last-modified'] || null,
      etag: response.headers['etag'] || null
    };
  }

  /**
   * 按依赖关系排序资源
   */
  sortByDependencies(resources) {
    const resourceMap = new Map(resources.map(r => [r.key, r]));
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (key) => {
      if (visited.has(key)) return;
      if (visiting.has(key)) {
        console.warn(`检测到循环依赖: ${key}`);
        return;
      }

      const resource = resourceMap.get(key);
      if (!resource) return;

      visiting.add(key);
      
      // 先处理依赖
      for (const dep of resource.dependencies) {
        visit(dep);
      }
      
      visiting.delete(key);
      visited.add(key);
      sorted.push(resource);
    };

    for (const resource of resources) {
      visit(resource.key);
    }

    return sorted;
  }

  /**
   * 下载单个资源
   */
  async downloadResource(resourceKey, options = {}) {
    const resource = this.dependencyResources[resourceKey];
    if (!resource) {
      throw new Error(`资源 ${resourceKey} 不存在`);
    }

    if (!resource.localPath) {
      throw new Error(`资源 ${resourceKey} 没有配置本地路径`);
    }

    const localFilePath = path.join(this.prodPath, resource.localPath.replace(/^\//, ''));
    
    // 设置下载状态
    this.downloadStatus.set(resourceKey, {
      status: 'downloading',
      progress: 0,
      startTime: Date.now(),
      error: null
    });

    try {
      // 确保目录存在
      await fs.ensureDir(path.dirname(localFilePath));

      // 尝试从主CDN下载
      let downloadUrl = resource.primary;
      let downloadSuccess = false;
      let lastError = null;

      const urlsToTry = [resource.primary, ...(resource.fallbacks || [])];
      
      for (const url of urlsToTry) {
        try {
          console.log(`尝试从 ${url} 下载 ${resourceKey}`);
          
          const response = await axios.get(url, {
            timeout: 30000,
            responseType: 'stream',
            headers: {
              'User-Agent': 'Resource-Manager/1.0'
            },
            onDownloadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                this.downloadStatus.set(resourceKey, {
                  ...this.downloadStatus.get(resourceKey),
                  progress
                });
                this.emit('downloadProgress', { resourceKey, progress });
              }
            }
          });

          // 写入文件
          const writer = fs.createWriteStream(localFilePath);
          response.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });

          downloadSuccess = true;
          downloadUrl = url;
          break;
        } catch (error) {
          lastError = error;
          console.warn(`从 ${url} 下载失败:`, error.message);
          continue;
        }
      }

      if (!downloadSuccess) {
        throw lastError || new Error('所有依赖源都下载失败');
      }

      // 验证文件完整性
      const fileContent = await fs.readFile(localFilePath);
      const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');
      const fileSize = fileContent.length;

      // 更新下载状态
      this.downloadStatus.set(resourceKey, {
        status: 'completed',
        progress: 100,
        startTime: this.downloadStatus.get(resourceKey).startTime,
        endTime: Date.now(),
        size: fileSize,
        hash: fileHash,
        downloadUrl,
        error: null
      });

      // 记录下载历史
      await this.recordDownload(resourceKey, {
        success: true,
        downloadUrl,
        size: fileSize,
        hash: fileHash,
        localPath: localFilePath
      });

      this.emit('downloadComplete', { resourceKey, success: true });

      return {
        success: true,
        resourceKey,
        localPath: localFilePath,
        size: fileSize,
        hash: fileHash,
        downloadUrl
      };

    } catch (error) {
      // 更新错误状态
      this.downloadStatus.set(resourceKey, {
        status: 'error',
        progress: 0,
        startTime: this.downloadStatus.get(resourceKey).startTime,
        endTime: Date.now(),
        error: error.message
      });

      // 记录失败历史
      await this.recordDownload(resourceKey, {
        success: false,
        error: error.message
      });

      this.emit('downloadComplete', { resourceKey, success: false, error: error.message });

      throw error;
    }
  }

  /**
   * 批量下载资源
   */
  async downloadMultipleResources(resourceKeys, options = {}) {
    const results = [];
    const { concurrent = 3 } = options;

    // 按依赖关系排序
    const resourcesToDownload = resourceKeys.map(key => ({
      key,
      dependencies: this.dependencyResources[key]?.dependencies || []
    }));
    
    const sortedKeys = this.sortByDependencies(resourcesToDownload).map(r => r.key);

    // 分批并发下载
    for (let i = 0; i < sortedKeys.length; i += concurrent) {
      const batch = sortedKeys.slice(i, i + concurrent);
      const batchPromises = batch.map(async (key) => {
        try {
          const result = await this.downloadResource(key, options);
          results.push(result);
          return result;
        } catch (error) {
          const errorResult = {
            success: false,
            resourceKey: key,
            error: error.message
          };
          results.push(errorResult);
          return errorResult;
        }
      });

      await Promise.all(batchPromises);
    }

    return {
      total: resourceKeys.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  /**
   * 下载所有缺失资源
   */
  async downloadAllMissingResources(options = {}) {
    const scanResult = await this.scanMissingResources();
    const missingKeys = scanResult.resources.map(r => r.key);
    
    if (missingKeys.length === 0) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        results: [],
        message: '没有缺失的资源需要下载'
      };
    }

    return await this.downloadMultipleResources(missingKeys, options);
  }

  /**
   * 获取下载状态
   */
  getDownloadStatus(resourceKey = null) {
    if (resourceKey) {
      return this.downloadStatus.get(resourceKey) || { status: 'not-started' };
    }
    
    const allStatus = {};
    for (const [key, status] of this.downloadStatus.entries()) {
      allStatus[key] = status;
    }
    return allStatus;
  }

  /**
   * 清除下载状态
   */
  clearDownloadStatus(resourceKey = null) {
    if (resourceKey) {
      this.downloadStatus.delete(resourceKey);
    } else {
      this.downloadStatus.clear();
    }
  }

  /**
   * 记录下载历史
   */
  async recordDownload(resourceKey, details) {
    try {
      const history = await fs.readJson(this.historyFile);
      const record = {
        id: Date.now().toString(),
        resourceKey,
        timestamp: new Date().toISOString(),
        ...details
      };
      
      history.unshift(record);
      
      // 只保留最近200条记录
      if (history.length > 200) {
        history.splice(200);
      }
      
      await fs.writeJson(this.historyFile, history, { spaces: 2 });
    } catch (error) {
      console.error('记录下载历史失败:', error);
    }
  }

  /**
   * 获取下载历史
   */
  async getDownloadHistory() {
    try {
      return await fs.readJson(this.historyFile);
    } catch (error) {
      console.error('读取下载历史失败:', error);
      return [];
    }
  }

  /**
   * 获取资源映射配置
   */
  getResourceMappings() {
    const mappings = {};
    for (const [key, resource] of Object.entries(this.dependencyResources)) {
      mappings[key] = {
        localPath: resource.localPath,
        primary: resource.primary,
        fallbacks: resource.fallbacks || [],
        type: resource.type,
        dependencies: resource.dependencies || []
      };
    }
    return mappings;
  }

  /**
   * 获取统计信息
   */
  async getStatistics() {
    const history = await this.getDownloadHistory();
    const successful = history.filter(h => h.success).length;
    const failed = history.filter(h => !h.success).length;
    
    const totalSize = history
      .filter(h => h.success && h.size)
      .reduce((sum, h) => sum + h.size, 0);

    return {
      totalDownloads: history.length,
      successful,
      failed,
      totalSize,
      lastDownload: history[0]?.timestamp || null
    };
  }

  /**
   * 记录404错误的资源
   */
  async record404Resource(resourceUrl, referrer = null) {
    try {
      const missingResources = await fs.readJson(this.missingResourcesFile);
      
      // 检查是否已经记录过这个资源
      const existing = missingResources.find(r => r.url === resourceUrl);
      if (existing) {
        existing.count += 1;
        existing.lastSeen = new Date().toISOString();
        if (referrer && !existing.referrers.includes(referrer)) {
          existing.referrers.push(referrer);
        }
      } else {
        const newResource = {
          id: Date.now().toString(),
          url: resourceUrl,
          count: 1,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          referrers: referrer ? [referrer] : [],
          downloaded: false
        };
        missingResources.unshift(newResource);
      }
      
      // 只保留最近500条记录
      if (missingResources.length > 500) {
        missingResources.splice(500);
      }
      
      await fs.writeJson(this.missingResourcesFile, missingResources, { spaces: 2 });
      
      console.log(`记录404资源: ${resourceUrl}`);
      return true;
    } catch (error) {
      console.error('记录404资源失败:', error);
      return false;
    }
  }

  /**
   * 获取404缺失资源列表
   */
  async get404Resources() {
    try {
      return await fs.readJson(this.missingResourcesFile);
    } catch (error) {
      console.error('读取404资源列表失败:', error);
      return [];
    }
  }

  /**
   * 清除404资源记录
   */
  async clear404Resources(resourceId = null) {
    try {
      if (resourceId) {
        const missingResources = await fs.readJson(this.missingResourcesFile);
        const filtered = missingResources.filter(r => r.id !== resourceId);
        await fs.writeJson(this.missingResourcesFile, filtered, { spaces: 2 });
      } else {
        await fs.writeJson(this.missingResourcesFile, []);
      }
      return true;
    } catch (error) {
      console.error('清除404资源记录失败:', error);
      return false;
    }
  }

  /**
   * 标记404资源为已下载
   */
  async mark404ResourceDownloaded(resourceId) {
    try {
      const missingResources = await fs.readJson(this.missingResourcesFile);
      const resource = missingResources.find(r => r.id === resourceId);
      if (resource) {
        resource.downloaded = true;
        resource.downloadedAt = new Date().toISOString();
        await fs.writeJson(this.missingResourcesFile, missingResources, { spaces: 2 });
        return true;
      }
      return false;
    } catch (error) {
      console.error('标记404资源为已下载失败:', error);
      return false;
    }
  }
}

module.exports = ResourceManagerService;