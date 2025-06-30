/**
 * CDN网络性能检测工具服务
 * 提供CDN响应速度测试、可用性检测和性能分析功能
 */

const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * 并发控制工具
 */
class ConcurrencyLimiter {
  constructor(limit = 10) {
    this.limit = limit;
    this.running = 0;
    this.queue = [];
  }

  async execute(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.limit || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

/**
  * CDN测试服务
  */
const cdnTesterService = {
  // 并发限制器，限制同时进行的请求数量
  concurrencyLimiter: new ConcurrencyLimiter(15), // 最多同时15个请求
  /**
   * CDN资源配置
   */
  cdnResources: {
    // Bootstrap CSS
    'bootstrap-css': {
      name: 'Bootstrap CSS',
      primary: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
      fallbacks: [
        'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css',
        'https://cdn.staticfile.org/twitter-bootstrap/5.3.0/css/bootstrap.min.css',
        'https://maxcdn.bootstrapcdn.com/bootstrap/5.3.0/css/bootstrap.min.css'
      ],
      type: 'css'
    },
    
    // Bootstrap JS
    'bootstrap-js': {
      name: 'Bootstrap JS',
      primary: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
      fallbacks: [
        'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js',
        'https://cdn.staticfile.org/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js',
        'https://ajax.aspnetcdn.com/ajax/bootstrap/5.3.0/bootstrap.bundle.min.js'
      ],
      type: 'js'
    },
    
    // Bootstrap Icons
    'bootstrap-icons': {
      name: 'Bootstrap Icons',
      primary: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
      fallbacks: [
        'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.5/font/bootstrap-icons.css',
        'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.min.css'
      ],
      type: 'css'
    },
    
    // jQuery
    'jquery': {
      name: 'jQuery',
      primary: 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js',
      fallbacks: [
        'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js',
        'https://ajax.aspnetcdn.com/ajax/jquery/jquery-3.6.0.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
        'https://libs.baidu.com/jquery/3.6.0/jquery.min.js'
      ],
      type: 'js'
    },
    
    // Prism.js CSS
    'prism-css': {
      name: 'Prism.js CSS',
      primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css',
      fallbacks: [
        'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css'
      ],
      type: 'css'
    },
    
    // KaTeX CSS
    'katex-css': {
      name: 'KaTeX CSS',
      primary: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css',
      fallbacks: [
        'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css'
      ],
      type: 'css'
    },
    
    // Mermaid
    'mermaid': {
      name: 'Mermaid',
      primary: 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js',
      fallbacks: [
        'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js'
      ],
      type: 'js'
    }
  },

  /**
   * 测试单个CDN的响应时间
   * @param {string} url - CDN URL
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<Object>} 测试结果
   */
  testCDNSpeed: function(url, timeout = 10000) {
    // 使用并发限制器控制请求数量
    return this.concurrencyLimiter.execute(() => {
      return new Promise((resolve) => {
      const startTime = Date.now();
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        timeout: timeout,
        headers: {
          'User-Agent': 'CDN-Tester/1.0'
        },
        // 配置SSL证书验证
        rejectUnauthorized: false, // 允许自签名证书
        secureProtocol: 'TLSv1_2_method' // 使用TLS 1.2
      };
      
      const req = client.request(options, (res) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        resolve({
          url,
          success: true,
          responseTime,
          statusCode: res.statusCode,
          headers: res.headers,
          error: null
        });
      });
      
      req.on('error', (error) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        resolve({
          url,
          success: false,
          responseTime,
          statusCode: null,
          headers: null,
          error: error.message
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          success: false,
          responseTime: timeout,
          statusCode: null,
          headers: null,
          error: 'Request timeout'
        });
      });
      
      req.end();
    });
  });
  },

  /**
   * 测试资源的所有CDN（并发测试）
   * @param {string} resourceKey - 资源键
   * @returns {Promise<Object>} 测试结果
   */
  testResourceCDNs: async function(resourceKey) {
    const resource = this.cdnResources[resourceKey];
    if (!resource) {
      throw new Error(`Unknown resource: ${resourceKey}`);
    }
    
    const urls = [resource.primary, ...resource.fallbacks];
    
    // 并发测试所有CDN
    const testPromises = urls.map(async (url) => {
      const result = await this.testCDNSpeed(url);
      return {
        ...result,
        provider: this.extractCDNProvider(url)
      };
    });
    
    const results = await Promise.all(testPromises);
    
    // 按响应时间排序
    results.sort((a, b) => {
      if (!a.success && !b.success) return 0;
      if (!a.success) return 1;
      if (!b.success) return -1;
      return a.responseTime - b.responseTime;
    });
    
    return {
      resourceKey,
      resourceName: resource.name,
      type: resource.type,
      results,
      fastest: results.find(r => r.success) || null,
      totalTested: results.length,
      successCount: results.filter(r => r.success).length
    };
  },

  /**
   * 测试资源的所有CDN（支持实时回调，并发测试）
   * @param {string} resourceKey - 资源键
   * @param {Function} callback - 每个CDN测试完成后的回调函数
   * @returns {Promise<Object>} 测试结果
   */
  testResourceCDNsWithCallback: async function(resourceKey, callback) {
    const resource = this.cdnResources[resourceKey];
    if (!resource) {
      throw new Error(`Unknown resource: ${resourceKey}`);
    }
    
    const urls = [resource.primary, ...resource.fallbacks];
    const callbackState = { completed: new Set() }; // 防止重复回调
    
    // 并发测试所有CDN，但保持回调功能
    const testPromises = urls.map(async (url, index) => {
      const result = await this.testCDNSpeed(url);
      const cdnResult = {
        ...result,
        provider: this.extractCDNProvider(url)
      };
      
      // 调用回调函数，实时推送结果（防止重复回调）
      if (callback && typeof callback === 'function' && !callbackState.completed.has(index)) {
        callbackState.completed.add(index);
        try {
          callback(cdnResult, index, urls.length);
        } catch (callbackError) {
          console.error('回调函数执行错误:', callbackError);
        }
      }
      
      return cdnResult;
    });
    
    const results = await Promise.all(testPromises);
    
    // 按响应时间排序
    results.sort((a, b) => {
      if (!a.success && !b.success) return 0;
      if (!a.success) return 1;
      if (!b.success) return -1;
      return a.responseTime - b.responseTime;
    });
    
    return {
      resourceKey,
      resourceName: resource.name,
      type: resource.type,
      results,
      fastest: results.find(r => r.success) || null,
      totalTested: results.length,
      successCount: results.filter(r => r.success).length
    };
  },

  /**
   * 测试所有资源的CDN（并发测试）
   * @returns {Promise<Object>} 完整测试结果
   */
  testAllCDNs: async function() {
    const startTime = Date.now();
    const resourceKeys = Object.keys(this.cdnResources);
    
    console.log(`开始并发测试 ${resourceKeys.length} 个资源的CDN性能...`);
    
    // 并发测试所有资源
    const testPromises = resourceKeys.map(async (resourceKey) => {
      console.log(`测试 ${this.cdnResources[resourceKey].name}...`);
      try {
        const result = await this.testResourceCDNs(resourceKey);
        return { resourceKey, result };
      } catch (error) {
        console.error(`测试 ${resourceKey} 失败:`, error.message);
        return {
          resourceKey,
          result: {
            resourceKey,
            resourceName: this.cdnResources[resourceKey].name,
            type: this.cdnResources[resourceKey].type,
            results: [],
            fastest: null,
            totalTested: 0,
            successCount: 0,
            error: error.message
          }
        };
      }
    });
    
    const testResults = await Promise.all(testPromises);
    
    // 将结果转换为对象格式
    const results = {};
    testResults.forEach(({ resourceKey, result }) => {
      results[resourceKey] = result;
    });
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // 生成统计信息
    const stats = this.generateStats(results, totalTime);
    
    return {
      timestamp: new Date().toISOString(),
      totalTime,
      stats,
      results
    };
  },

  /**
   * 生成统计信息
   * @param {Object} results - 测试结果
   * @param {number} totalTime - 总测试时间
   * @returns {Object} 统计信息
   */
  generateStats: function(results, totalTime) {
    const resourceCount = Object.keys(results).length;
    let totalCDNs = 0;
    let successfulCDNs = 0;
    let totalResponseTime = 0;
    let fastestOverall = null;
    let slowestOverall = null;
    
    const providerStats = {};
    
    Object.values(results).forEach(resource => {
      if (resource.results) {
        resource.results.forEach(result => {
          totalCDNs++;
          
          if (result.success) {
            successfulCDNs++;
            totalResponseTime += result.responseTime;
            
            // 更新最快和最慢记录
            if (!fastestOverall || result.responseTime < fastestOverall.responseTime) {
              fastestOverall = { ...result, resourceName: resource.resourceName };
            }
            if (!slowestOverall || result.responseTime > slowestOverall.responseTime) {
              slowestOverall = { ...result, resourceName: resource.resourceName };
            }
            
            // 统计提供商性能
            if (!providerStats[result.provider]) {
              providerStats[result.provider] = {
                total: 0,
                successful: 0,
                totalTime: 0,
                avgTime: 0
              };
            }
            providerStats[result.provider].total++;
            providerStats[result.provider].successful++;
            providerStats[result.provider].totalTime += result.responseTime;
          } else {
            if (!providerStats[result.provider]) {
              providerStats[result.provider] = {
                total: 0,
                successful: 0,
                totalTime: 0,
                avgTime: 0
              };
            }
            providerStats[result.provider].total++;
          }
        });
      }
    });
    
    // 计算提供商平均响应时间
    Object.keys(providerStats).forEach(provider => {
      const stats = providerStats[provider];
      stats.avgTime = stats.successful > 0 ? stats.totalTime / stats.successful : 0;
      stats.successRate = stats.total > 0 ? (stats.successful / stats.total * 100).toFixed(1) : 0;
    });
    
    return {
      resourceCount,
      totalCDNs,
      successfulCDNs,
      successRate: totalCDNs > 0 ? (successfulCDNs / totalCDNs * 100).toFixed(1) : 0,
      avgResponseTime: successfulCDNs > 0 ? (totalResponseTime / successfulCDNs).toFixed(0) : 0,
      fastestOverall,
      slowestOverall,
      providerStats,
      testDuration: totalTime
    };
  },

  /**
   * 提取CDN提供商名称
   * @param {string} url - CDN URL
   * @returns {string} 提供商名称
   */
  extractCDNProvider: function(url) {
    if (url.includes('jsdelivr.net')) return 'jsDelivr';
    if (url.includes('cdnjs.cloudflare.com')) return 'cdnjs';
    if (url.includes('googleapis.com')) return 'Google CDN';
    if (url.includes('aspnetcdn.com')) return 'Microsoft CDN';
    if (url.includes('staticfile.org')) return 'Staticfile CDN';
    // BootCDN已移除 - 不可靠的CDN服务
    if (url.includes('baidu.com')) return 'Baidu CDN';
    if (url.includes('bootstrapcdn.com')) return 'Bootstrap CDN';
    if (url.includes('elemecdn.com')) return 'eleme CDN';
    
    // 提取域名作为提供商名称
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'Unknown';
    }
  },

  /**
   * 保存测试结果到文件
   * @param {Object} testResults - 测试结果
   * @param {string} filename - 文件名（可选）
   * @returns {Promise<string>} 保存的文件路径
   */
  saveTestResults: async function(testResults, filename = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `cdn-test-results-${timestamp}.json`;
    const finalFilename = filename || defaultFilename;
    
    const resultsDir = path.join(__dirname, '../../../temp/cdn-test-results');
    await fs.ensureDir(resultsDir);
    
    const filePath = path.join(resultsDir, finalFilename);
    await fs.writeJson(filePath, testResults, { spaces: 2 });
    
    console.log(`测试结果已保存到: ${filePath}`);
    return filePath;
  },

  /**
   * 获取历史测试结果
   * @returns {Promise<Array>} 历史测试结果列表
   */
  getTestHistory: async function() {
    const resultsDir = path.join(__dirname, '../../../temp/cdn-test-results');
    
    try {
      const files = await fs.readdir(resultsDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      const history = [];
      for (const file of jsonFiles) {
        try {
          const filePath = path.join(resultsDir, file);
          const stats = await fs.stat(filePath);
          const data = await fs.readJson(filePath);
          
          history.push({
            filename: file,
            timestamp: data.timestamp || stats.mtime.toISOString(),
            stats: data.stats,
            size: stats.size
          });
        } catch (error) {
          console.warn(`读取测试结果文件 ${file} 失败:`, error.message);
        }
      }
      
      // 按时间戳降序排序
      history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return history;
    } catch (error) {
      console.warn('读取测试历史失败:', error.message);
      return [];
    }
  },

  /**
   * 生成性能报告
   * @param {Object} testResults - 测试结果
   * @returns {string} HTML格式的性能报告
   */
  generatePerformanceReport: function(testResults) {
    const { stats, results, timestamp } = testResults;
    
    let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CDN性能测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .stat-label { color: #666; margin-top: 5px; }
        .resource-section { margin-bottom: 30px; }
        .resource-title { background: #e9ecef; padding: 10px; border-radius: 5px; margin-bottom: 10px; }
        .cdn-result { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee; }
        .success { color: #28a745; }
        .failed { color: #dc3545; }
        .provider-stats { margin-top: 20px; }
        .provider-row { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CDN性能测试报告</h1>
        <p>测试时间: ${new Date(timestamp).toLocaleString('zh-CN')}</p>
        <p>测试耗时: ${stats.testDuration}ms</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-value">${stats.resourceCount}</div>
            <div class="stat-label">测试资源数</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.totalCDNs}</div>
            <div class="stat-label">总CDN数量</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.successRate}%</div>
            <div class="stat-label">成功率</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.avgResponseTime}ms</div>
            <div class="stat-label">平均响应时间</div>
        </div>
    </div>
    
    <h2>资源详细测试结果</h2>
`;
    
    // 添加每个资源的详细结果
    Object.values(results).forEach(resource => {
      html += `
    <div class="resource-section">
        <div class="resource-title">
            <h3>${resource.resourceName} (${resource.type.toUpperCase()})</h3>
            <p>成功: ${resource.successCount}/${resource.totalTested}</p>
        </div>
`;
      
      if (resource.results && resource.results.length > 0) {
        resource.results.forEach((result, index) => {
          const statusClass = result.success ? 'success' : 'failed';
          const statusText = result.success ? `${result.responseTime}ms` : result.error;
          html += `
        <div class="cdn-result">
            <span>${index + 1}. ${result.provider}</span>
            <span class="${statusClass}">${statusText}</span>
        </div>`;
        });
      }
      
      html += `
    </div>`;
    });
    
    // 添加提供商统计
    html += `
    <h2>CDN提供商性能统计</h2>
    <div class="provider-stats">`;
    
    Object.entries(stats.providerStats).forEach(([provider, providerStats]) => {
      html += `
        <div class="provider-row">
            <span><strong>${provider}</strong></span>
            <span>成功率: ${providerStats.successRate}% | 平均响应: ${Math.round(providerStats.avgTime)}ms</span>
        </div>`;
    });
    
    html += `
    </div>
    
    <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
        <h3>最佳性能</h3>
        <p><strong>最快CDN:</strong> ${stats.fastestOverall ? `${stats.fastestOverall.provider} (${stats.fastestOverall.resourceName}) - ${stats.fastestOverall.responseTime}ms` : '无'}</p>
        <p><strong>最慢CDN:</strong> ${stats.slowestOverall ? `${stats.slowestOverall.provider} (${stats.slowestOverall.resourceName}) - ${stats.slowestOverall.responseTime}ms` : '无'}</p>
    </div>
    
</body>
</html>`;
    
    return html;
  }
};

module.exports = cdnTesterService;