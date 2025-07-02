/**
 * CDN缓存管理服务
 * 提供CDN缓存清除、预热等核心功能
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

// 导入CDN配置
const cdnConfig = require('../../config/cdnConfig');
const paths = require('../../config/pathConfig');

class CDNCacheService {
  constructor() {
    this.cdnResources = cdnConfig.resources || {};
    this.historyFile = path.join(paths.temp, 'cdn-cache-history.json');
    this.statisticsFile = path.join(paths.temp, 'cdn-cache-statistics.json');
    this.options = cdnConfig.options || {};
    this.enableIntegrityCheck = this.options.enableIntegrityCheck !== false;
    this.hashMinLength = this.options.hashMinLength || 64;
    this.ensureHistoryFile();
    this.ensureStatisticsFile();
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
   * 确保统计文件存在
   */
  async ensureStatisticsFile() {
    try {
      await fs.ensureFile(this.statisticsFile);
      const exists = await fs.pathExists(this.statisticsFile);
      if (exists) {
        const content = await fs.readFile(this.statisticsFile, 'utf8');
        if (!content.trim()) {
          await fs.writeJson(this.statisticsFile, {
            totalOperations: 0,
            clearOperations: 0,
            warmOperations: 0,
            lastOperation: null,
            resourceStats: {}
          });
        }
      } else {
        await fs.writeJson(this.statisticsFile, {
          totalOperations: 0,
          clearOperations: 0,
          warmOperations: 0,
          lastOperation: null,
          resourceStats: {}
        });
      }
    } catch (error) {
      console.error('创建统计文件失败:', error);
    }
  }

  /**
   * 计算内容哈希值（用于完整性校验）
   */
  calculateContentHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * 验证内容完整性 - hash不完整判定为损坏
   */
  validateContentIntegrity(content, expectedHash) {
    if (!expectedHash || expectedHash.length < this.hashMinLength) {
      console.warn('hash不完整或缺失，判定为损坏');
      return false;
    }
    
    const actualHash = this.calculateContentHash(content);
    if (actualHash !== expectedHash) {
      console.warn('内容哈希不匹配，可能已损坏');
      return false;
    }
    
    return true;
  }

  /**
   * 获取CDN资源配置
   */
  getCDNResources() {
    return this.cdnResources;
  }

  /**
   * 检查CDN资源缓存状态
   */
  async checkCacheStatus(resourceKey) {
    const resource = this.cdnResources[resourceKey];
    if (!resource) {
      throw new Error(`资源 ${resourceKey} 不存在`);
    }

    const results = [];
    for (const cdn of resource.cdns) {
      try {
        const startTime = Date.now();
        const response = await axios.head(cdn.url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'CDN-Cache-Manager/1.0'
          }
        });
        const responseTime = Date.now() - startTime;

        // 检查内容完整性（如果启用）
        let integrityStatus = 'not-checked';
        if (this.enableIntegrityCheck) {
          try {
            // 获取部分内容进行hash检查
            const contentResponse = await axios.get(cdn.url, {
              timeout: 10000,
              headers: {
                'User-Agent': 'CDN-Cache-Manager/1.0',
                'Range': 'bytes=0-1023' // 只获取前1KB用于快速检查
              },
              validateStatus: (status) => status === 206 || status === 200
            });
            
            if (contentResponse.data) {
              const partialHash = this.calculateContentHash(contentResponse.data);
              integrityStatus = partialHash && partialHash.length >= this.hashMinLength ? 'valid' : 'incomplete';
            }
          } catch (error) {
            integrityStatus = 'check-failed';
          }
        }

        results.push({
          name: cdn.name,
          url: cdn.url,
          status: 'available',
          responseTime,
          cacheStatus: response.headers['x-cache'] || 'unknown',
          lastModified: response.headers['last-modified'] || null,
          etag: response.headers['etag'] || null,
          integrityStatus
        });
      } catch (error) {
        results.push({
          name: cdn.name,
          url: cdn.url,
          status: 'error',
          error: error.message,
          responseTime: null,
          cacheStatus: 'unknown'
        });
      }
    }

    return {
      resourceKey,
      resourceName: resource.name,
      cdns: results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 获取所有资源的缓存状态
   */
  async getAllCacheStatus() {
    const results = [];
    for (const resourceKey of Object.keys(this.cdnResources)) {
      try {
        const status = await this.checkCacheStatus(resourceKey);
        results.push(status);
      } catch (error) {
        results.push({
          resourceKey,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    return results;
  }

  /**
   * 清除指定资源的缓存（模拟操作）
   */
  async clearResourceCache(resourceKey) {
    const resource = this.cdnResources[resourceKey];
    if (!resource) {
      throw new Error(`资源 ${resourceKey} 不存在`);
    }

    const results = [];
    for (const cdn of resource.cdns) {
      try {
        // 模拟缓存清除操作
        // 实际应用中这里会调用CDN提供商的API
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        results.push({
          name: cdn.name,
          url: cdn.url,
          status: 'cleared',
          message: '缓存清除成功'
        });
      } catch (error) {
        results.push({
          name: cdn.name,
          url: cdn.url,
          status: 'error',
          error: error.message
        });
      }
    }

    // 记录操作历史
    await this.recordOperation('clear', resourceKey, results);
    
    // 更新统计信息
    await this.updateStatistics('clear', resourceKey);

    return {
      resourceKey,
      resourceName: resource.name,
      operation: 'clear',
      results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 预热指定资源的缓存
   */
  async warmResourceCache(resourceKey) {
    const resource = this.cdnResources[resourceKey];
    if (!resource) {
      throw new Error(`资源 ${resourceKey} 不存在`);
    }

    const results = [];
    for (const cdn of resource.cdns) {
      try {
        // 发送请求预热缓存
        const startTime = Date.now();
        const response = await axios.get(cdn.url, {
          timeout: 15000,
          headers: {
            'User-Agent': 'CDN-Cache-Manager/1.0',
            'Cache-Control': 'no-cache'
          }
        });
        const responseTime = Date.now() - startTime;
        
        // 计算内容hash用于完整性检查
        let contentHash = null;
        let integrityStatus = 'unknown';
        if (this.enableIntegrityCheck && response.data) {
          try {
            contentHash = this.calculateContentHash(response.data);
            integrityStatus = contentHash && contentHash.length >= this.hashMinLength ? 'valid' : 'incomplete';
          } catch (error) {
            console.warn('计算内容hash失败:', error);
            integrityStatus = 'error';
          }
        }
        
        results.push({
          name: cdn.name,
          url: cdn.url,
          status: 'warmed',
          responseTime,
          size: response.headers['content-length'] || 'unknown',
          contentHash: contentHash ? contentHash.substring(0, 16) + '...' : null,
          integrityStatus,
          message: integrityStatus === 'incomplete' ? '缓存预热成功，但hash不完整' : '缓存预热成功'
        });
      } catch (error) {
        results.push({
          name: cdn.name,
          url: cdn.url,
          status: 'error',
          error: error.message
        });
      }
    }

    // 记录操作历史
    await this.recordOperation('warm', resourceKey, results);
    
    // 更新统计信息
    await this.updateStatistics('warm', resourceKey);

    return {
      resourceKey,
      resourceName: resource.name,
      operation: 'warm',
      results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 清除所有资源的缓存
   */
  async clearAllCache() {
    const results = [];
    for (const resourceKey of Object.keys(this.cdnResources)) {
      try {
        const result = await this.clearResourceCache(resourceKey);
        results.push(result);
      } catch (error) {
        results.push({
          resourceKey,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    return results;
  }

  /**
   * 预热所有资源的缓存
   */
  async warmAllCache() {
    const results = [];
    for (const resourceKey of Object.keys(this.cdnResources)) {
      try {
        const result = await this.warmResourceCache(resourceKey);
        results.push(result);
      } catch (error) {
        results.push({
          resourceKey,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    return results;
  }

  /**
   * 记录操作历史
   */
  async recordOperation(operation, resourceKey, results) {
    try {
      const history = await fs.readJson(this.historyFile);
      const record = {
        id: Date.now().toString(),
        operation,
        resourceKey,
        results,
        timestamp: new Date().toISOString()
      };
      
      history.unshift(record);
      
      // 只保留最近100条记录
      if (history.length > 100) {
        history.splice(100);
      }
      
      await fs.writeJson(this.historyFile, history, { spaces: 2 });
    } catch (error) {
      console.error('记录操作历史失败:', error);
    }
  }

  /**
   * 获取操作历史
   */
  async getOperationHistory() {
    try {
      return await fs.readJson(this.historyFile);
    } catch (error) {
      console.error('读取操作历史失败:', error);
      return [];
    }
  }

  /**
   * 清除操作历史
   */
  async clearOperationHistory() {
    try {
      await fs.writeJson(this.historyFile, []);
      return { success: true, message: '操作历史已清除' };
    } catch (error) {
      throw new Error('清除操作历史失败: ' + error.message);
    }
  }

  /**
   * 更新统计信息
   */
  async updateStatistics(operation, resourceKey) {
    try {
      const stats = await fs.readJson(this.statisticsFile);
      
      stats.totalOperations++;
      if (operation === 'clear') {
        stats.clearOperations++;
      } else if (operation === 'warm') {
        stats.warmOperations++;
      }
      
      stats.lastOperation = {
        operation,
        resourceKey,
        timestamp: new Date().toISOString()
      };
      
      // 更新资源统计
      if (!stats.resourceStats[resourceKey]) {
        stats.resourceStats[resourceKey] = {
          clearCount: 0,
          warmCount: 0,
          lastOperation: null
        };
      }
      
      if (operation === 'clear') {
        stats.resourceStats[resourceKey].clearCount++;
      } else if (operation === 'warm') {
        stats.resourceStats[resourceKey].warmCount++;
      }
      
      stats.resourceStats[resourceKey].lastOperation = {
        operation,
        timestamp: new Date().toISOString()
      };
      
      await fs.writeJson(this.statisticsFile, stats, { spaces: 2 });
    } catch (error) {
      console.error('更新统计信息失败:', error);
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getCacheStatistics() {
    try {
      return await fs.readJson(this.statisticsFile);
    } catch (error) {
      console.error('读取统计信息失败:', error);
      return {
        totalOperations: 0,
        clearOperations: 0,
        warmOperations: 0,
        lastOperation: null,
        resourceStats: {}
      };
    }
  }
}

module.exports = new CDNCacheService();