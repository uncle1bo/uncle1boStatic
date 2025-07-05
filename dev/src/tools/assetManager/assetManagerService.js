/**
 * 资源管理器服务
 * 整合外部资源管理和重定向功能的综合服务
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const { EventEmitter } = require('events');

// 导入配置
const paths = require('../../config/pathConfig');
const redirectConfig = require('../../config/redirectConfig');

class AssetManagerService extends EventEmitter {
  constructor() {
    super();
    this.prodPath = path.resolve(__dirname, '../../../../prod');
    this.dependencyConfigPath = path.join(__dirname, 'cdnConfig.js');
    this.historyFile = path.join(paths.temp, 'asset-manager-history.json');
    this.missingResourcesFile = path.join(paths.temp, 'missing-resources.json');
    this.missing404ResourcesFile = path.join(paths.temp, '404-resources.json');
    this.downloadStatus = new Map(); // 下载状态跟踪
    this.dependencyResources = null;
    
    // 重定向相关配置
    this.redirectConfig = redirectConfig;
    this.allRedirectRules = [...this.redirectConfig.rules, ...this.redirectConfig.customRules];
    
    this.init();
  }

  /**
   * 初始化服务
   */
  async init() {
    await this.loadDependencyConfig();
    await this.ensureHistoryFile();
    await this.ensureMissingResourcesFile();
    await this.ensure404ResourcesFile();
  }

  /**
   * 获取资源路径
   * @param {Object} resource - 资源配置对象
   * @param {string} resourceKey - 资源键名（用于错误提示）
   * @returns {string} 资源路径
   */
  getResourcePath(resource, resourceKey) {
    if (!resource.path) {
      throw new Error(`资源 ${resourceKey} 缺少路径配置 (path 属性)`);
    }
    return resource.path;
  }

  /**
   * 加载依赖资源配置
   */
  async loadDependencyConfig() {
    try {
      // 动态加载依赖资源配置
      delete require.cache[this.dependencyConfigPath];
      const configModule = require(this.dependencyConfigPath);
      
      // 提取DependencyManager类的实例
      if (typeof configModule === 'function') {
        const configInstance = new configModule();
        // 优先查找cdnResources，如果没有则使用resources
        this.dependencyResources = configInstance.cdnResources || configInstance.resources || {};
        console.log(`通过类实例加载了 ${Object.keys(this.dependencyResources).length} 个依赖资源配置`);
      } else if (configModule.DependencyManager) {
        const configInstance = new configModule.DependencyManager();
        this.dependencyResources = configInstance.cdnResources || configInstance.resources || {};
        console.log(`通过DependencyManager属性加载了 ${Object.keys(this.dependencyResources).length} 个依赖资源配置`);
      } else if (configModule.CDNConfig) {
        const configInstance = new configModule.CDNConfig();
        this.dependencyResources = configInstance.cdnResources || configInstance.resources || {};
        console.log(`通过CDNConfig属性加载了 ${Object.keys(this.dependencyResources).length} 个依赖资源配置`);
      } else {
        this.dependencyResources = configModule.cdnResources || configModule.resources || configModule || {};
        console.log(`通过直接属性加载了 ${Object.keys(this.dependencyResources).length} 个依赖资源配置`);
      }
      
      console.log(`总共已加载 ${Object.keys(this.dependencyResources).length} 个依赖资源配置`);
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
   * 确保404资源文件存在
   */
  async ensure404ResourcesFile() {
    try {
      await fs.ensureFile(this.missing404ResourcesFile);
      const exists = await fs.pathExists(this.missing404ResourcesFile);
      if (exists) {
        const content = await fs.readFile(this.missing404ResourcesFile, 'utf8');
        if (!content.trim()) {
          await fs.writeJson(this.missing404ResourcesFile, []);
        }
      } else {
        await fs.writeJson(this.missing404ResourcesFile, []);
      }
    } catch (error) {
      console.error('创建404资源文件失败:', error);
      await fs.writeJson(this.missing404ResourcesFile, []);
    }
  }

  // ==================== 资源管理功能 ====================

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
      if (!resource) {
        continue;
      }

      let resourcePath;
      try {
        resourcePath = this.getResourcePath(resource, key);
      } catch (error) {
        console.warn(`跳过资源 ${key}: ${error.message}`);
        continue;
      }

      const localFilePath = path.join(this.prodPath, resourcePath.replace(/^\//g, ''));
      const exists = await fs.pathExists(localFilePath);
      
      if (!exists) {
        const resourceInfo = {
          key,
          name: resource.name || key,
          localPath: resourcePath,
          absolutePath: localFilePath,
          type: resource.type || 'unknown',
          primary: resource.primary,
          fallbacks: resource.fallbacks || [],
          dependencies: resource.dependencies || [],
          size: null,
          lastModified: null
        };

        // 尝试获取远程文件信息（仅当有primary URL时）
        if (resource.primary) {
          try {
            const remoteInfo = await this.getRemoteFileInfo(resource.primary);
            resourceInfo.size = remoteInfo.size;
            resourceInfo.lastModified = remoteInfo.lastModified;
          } catch (error) {
            console.warn(`获取远程文件信息失败 ${key}:`, error.message);
          }
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
   * 按依赖关系排序资源
   */
  sortByDependencies(resources) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (resource) => {
      if (visiting.has(resource.key)) {
        // 检测到循环依赖，跳过
        return;
      }
      if (visited.has(resource.key)) {
        return;
      }

      visiting.add(resource.key);
      
      // 先处理依赖
      if (resource.dependencies && resource.dependencies.length > 0) {
        for (const depKey of resource.dependencies) {
          const depResource = resources.find(r => r.key === depKey);
          if (depResource) {
            visit(depResource);
          }
        }
      }

      visiting.delete(resource.key);
      visited.add(resource.key);
      sorted.push(resource);
    };

    for (const resource of resources) {
      visit(resource);
    }

    return sorted;
  }

  /**
   * 获取远程文件信息
   */
  async getRemoteFileInfo(url) {
    try {
      const response = await axios.head(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      return {
        size: response.headers['content-length'] ? parseInt(response.headers['content-length']) : null,
        lastModified: response.headers['last-modified'] || null,
        contentType: response.headers['content-type'] || null
      };
    } catch (error) {
      throw new Error(`无法获取远程文件信息: ${error.message}`);
    }
  }

  /**
   * 下载单个资源
   */
  async downloadResource(resourceKey, options = {}) {
    const { force = false } = options;
    
    if (!this.dependencyResources[resourceKey]) {
      throw new Error(`未找到资源配置: ${resourceKey}`);
    }

    const resource = this.dependencyResources[resourceKey];
    const resourcePath = this.getResourcePath(resource, resourceKey);
    const localFilePath = path.join(this.prodPath, resourcePath.replace(/^\//g, ''));

    // 检查文件是否已存在
    if (!force && await fs.pathExists(localFilePath)) {
      return {
        success: true,
        message: '文件已存在',
        resourceKey,
        localPath: localFilePath,
        skipped: true
      };
    }

    // 设置下载状态
    this.downloadStatus.set(resourceKey, {
      status: 'downloading',
      progress: 0,
      startTime: Date.now()
    });

    try {
      // 确保目录存在
      await fs.ensureDir(path.dirname(localFilePath));

      // 尝试从主要源下载
      let downloadUrl = resource.primary;
      let downloadSuccess = false;
      let lastError = null;

      const urlsToTry = [resource.primary, ...(resource.fallbacks || [])];

      for (const url of urlsToTry) {
        try {
          await this.downloadFromUrl(url, localFilePath, resourceKey);
          downloadUrl = url;
          downloadSuccess = true;
          break;
        } catch (error) {
          lastError = error;
          console.warn(`从 ${url} 下载失败，尝试下一个源:`, error.message);
        }
      }

      if (!downloadSuccess) {
        throw lastError || new Error('所有下载源都失败');
      }

      // 验证文件完整性
      const isValid = await this.validateFile(localFilePath);
      if (!isValid) {
        await fs.remove(localFilePath);
        throw new Error('文件完整性验证失败');
      }

      // 记录下载历史
      await this.recordDownloadHistory({
        resourceKey,
        downloadUrl,
        localPath: localFilePath,
        timestamp: new Date().toISOString(),
        success: true
      });

      // 更新下载状态
      this.downloadStatus.set(resourceKey, {
        status: 'completed',
        progress: 100,
        endTime: Date.now()
      });

      return {
        success: true,
        message: '下载成功',
        resourceKey,
        downloadUrl,
        localPath: localFilePath
      };

    } catch (error) {
      // 记录失败历史
      await this.recordDownloadHistory({
        resourceKey,
        downloadUrl: downloadUrl || resource.primary,
        localPath: localFilePath,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      });

      // 更新下载状态
      this.downloadStatus.set(resourceKey, {
        status: 'failed',
        error: error.message,
        endTime: Date.now()
      });

      throw error;
    }
  }

  /**
   * 从URL下载文件
   */
  async downloadFromUrl(url, localPath, resourceKey) {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const totalLength = parseInt(response.headers['content-length'] || '0');
    let downloadedLength = 0;

    const writer = fs.createWriteStream(localPath);
    
    response.data.on('data', (chunk) => {
      downloadedLength += chunk.length;
      if (totalLength > 0) {
        const progress = Math.round((downloadedLength / totalLength) * 100);
        this.downloadStatus.set(resourceKey, {
          ...this.downloadStatus.get(resourceKey),
          progress
        });
        this.emit('downloadProgress', { resourceKey, progress, downloadedLength, totalLength });
      }
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
      response.data.on('error', reject);
    });
  }

  /**
   * 验证文件完整性
   */
  async validateFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 批量下载资源
   */
  async downloadBatchResources(resourceKeys, options = {}) {
    const results = [];
    
    for (const resourceKey of resourceKeys) {
      try {
        const result = await this.downloadResource(resourceKey, options);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          resourceKey,
          error: error.message
        });
      }
    }

    return {
      total: resourceKeys.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  /**
   * 记录下载历史
   */
  async recordDownloadHistory(record) {
    try {
      let history = [];
      if (await fs.pathExists(this.historyFile)) {
        history = await fs.readJson(this.historyFile);
      }
      
      history.unshift(record);
      
      // 保留最近1000条记录
      if (history.length > 1000) {
        history = history.slice(0, 1000);
      }
      
      await fs.writeJson(this.historyFile, history, { spaces: 2 });
    } catch (error) {
      console.error('记录下载历史失败:', error);
    }
  }

  /**
   * 获取下载历史
   */
  async getDownloadHistory(limit = 100) {
    try {
      if (await fs.pathExists(this.historyFile)) {
        const history = await fs.readJson(this.historyFile);
        return history.slice(0, limit);
      }
      return [];
    } catch (error) {
      console.error('读取下载历史失败:', error);
      return [];
    }
  }

  /**
   * 记录404资源
   */
  async record404Resource(url, referrer = null) {
    try {
      let resources = [];
      if (await fs.pathExists(this.missing404ResourcesFile)) {
        resources = await fs.readJson(this.missing404ResourcesFile);
      }

      // 检查是否已存在
      const existing = resources.find(r => r.url === url);
      if (existing) {
        existing.count += 1;
        existing.lastSeen = new Date().toISOString();
        if (referrer && !existing.referrers.includes(referrer)) {
          existing.referrers.push(referrer);
        }
      } else {
        resources.push({
          url,
          referrers: referrer ? [referrer] : [],
          count: 1,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString()
        });
      }

      await fs.writeJson(this.missing404ResourcesFile, resources, { spaces: 2 });
    } catch (error) {
      console.error('记录404资源失败:', error);
    }
  }

  /**
   * 获取404资源记录
   */
  async get404Resources() {
    try {
      if (await fs.pathExists(this.missing404ResourcesFile)) {
        return await fs.readJson(this.missing404ResourcesFile);
      }
      return [];
    } catch (error) {
      console.error('读取404资源记录失败:', error);
      return [];
    }
  }

  /**
   * 清理404资源记录
   */
  async clear404Resources() {
    try {
      await fs.writeJson(this.missing404ResourcesFile, []);
      return { success: true, message: '404资源记录已清理' };
    } catch (error) {
      console.error('清理404资源记录失败:', error);
      throw new Error('清理404资源记录失败');
    }
  }

  // ==================== 重定向管理功能 ====================

  /**
   * 处理重定向请求
   */
  processRedirect(requestPath) {
    if (!this.redirectConfig.enabled) {
      return null;
    }

    // 遍历所有重定向规则
    for (const rule of this.allRedirectRules) {
      const match = requestPath.match(rule.pattern);
      if (match) {
        const newPath = rule.redirect(match);
        
        return {
          originalPath: requestPath,
          newPath: newPath,
          ruleName: rule.name,
          description: rule.description,
          statusCode: this.redirectConfig.options.statusCode
        };
      }
    }

    return null;
  }

  /**
   * 添加自定义重定向规则
   */
  addCustomRedirectRule(rule) {
    // 验证规则格式
    if (!rule.name || !rule.pattern || !rule.redirect) {
      throw new Error('重定向规则必须包含 name, pattern 和 redirect 属性');
    }

    // 检查规则名称是否已存在
    const existingRule = this.allRedirectRules.find(r => r.name === rule.name);
    if (existingRule) {
      throw new Error(`重定向规则 '${rule.name}' 已存在`);
    }

    // 转换pattern为正则表达式
    if (typeof rule.pattern === 'string') {
      rule.pattern = new RegExp(rule.pattern);
    }

    this.redirectConfig.customRules.push(rule);
    this.allRedirectRules = [...this.redirectConfig.rules, ...this.redirectConfig.customRules];
    
    return { success: true, message: '重定向规则添加成功' };
  }

  /**
   * 移除自定义重定向规则
   */
  removeCustomRedirectRule(ruleName) {
    const index = this.redirectConfig.customRules.findIndex(rule => rule.name === ruleName);
    if (index === -1) {
      throw new Error(`未找到重定向规则 '${ruleName}'`);
    }

    this.redirectConfig.customRules.splice(index, 1);
    this.allRedirectRules = [...this.redirectConfig.rules, ...this.redirectConfig.customRules];
    
    return { success: true, message: '重定向规则删除成功' };
  }

  /**
   * 获取所有重定向规则
   */
  getAllRedirectRules() {
    return this.allRedirectRules.map(rule => ({
      name: rule.name,
      pattern: rule.pattern.toString(),
      description: rule.description,
      isCustom: this.redirectConfig.customRules.includes(rule)
    }));
  }

  /**
   * 测试重定向
   */
  testRedirect(testPath) {
    const result = this.processRedirect(testPath);
    return {
      testPath,
      matched: !!result,
      result: result || null
    };
  }

  /**
   * 更新重定向配置选项
   */
  updateRedirectOptions(options) {
    this.redirectConfig.options = { ...this.redirectConfig.options, ...options };
    return { success: true, message: '重定向配置更新成功' };
  }

  /**
   * 记录重定向日志
   */
  logRedirect(redirectInfo) {
    if (this.redirectConfig.options.logRedirects) {
      console.log(`[重定向] ${redirectInfo.originalPath} -> ${redirectInfo.newPath} (规则: ${redirectInfo.ruleName})`);
    }
  }

  /**
   * 验证目标路径是否存在
   */
  validateTargetPath(targetPath, rootPath) {
    try {
      const fullPath = path.join(rootPath, targetPath);
      return fs.existsSync(fullPath);
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取重定向统计信息
   */
  getRedirectStats() {
    return {
      totalRules: this.allRedirectRules.length,
      builtinRules: this.redirectConfig.rules.length,
      customRules: this.redirectConfig.customRules.length,
      enabled: this.redirectConfig.enabled,
      options: this.redirectConfig.options
    };
  }

  /**
   * 获取下载状态
   */
  getDownloadStatus(resourceKey = null) {
    if (resourceKey) {
      return this.downloadStatus.get(resourceKey) || null;
    }
    return Object.fromEntries(this.downloadStatus);
  }

  /**
   * 清理下载状态
   */
  clearDownloadStatus() {
    this.downloadStatus.clear();
  }
}

module.exports = AssetManagerService;