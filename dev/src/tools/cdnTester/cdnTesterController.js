/**
 * CDN网络性能检测工具控制器
 * 处理CDN测试相关的HTTP请求
 */

const cdnTesterService = require('./cdnTesterService');
const path = require('path');
const fs = require('fs-extra');

/**
 * CDN测试控制器
 */
const cdnTesterController = {
  /**
   * 显示CDN测试工具页面
   */
  showTestPage: (req, res) => {
    res.render('tools/cdnTester', {
      title: 'CDN网络性能检测工具',
      layout: 'layout'
    });
  },

  /**
   * 获取CDN资源配置
   */
  getCDNResources: (req, res) => {
    try {
      const resources = cdnTesterService.cdnResources;
      res.json({
        success: true,
        data: resources
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 测试单个资源的CDN
   */
  testResourceCDNs: async (req, res) => {
    try {
      const { resourceKey } = req.params;
      
      if (!resourceKey) {
        return res.status(400).json({
          success: false,
          error: '缺少资源键参数'
        });
      }

      const result = await cdnTesterService.testResourceCDNs(resourceKey);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 测试所有CDN
   */
  testAllCDNs: async (req, res) => {
    try {
      const results = await cdnTesterService.testAllCDNs();
      
      // 保存测试结果
      const savedPath = await cdnTesterService.saveTestResults(results);
      
      res.json({
        success: true,
        data: results,
        savedPath
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 实时测试所有CDN (Server-Sent Events)
   */
  testAllCDNsStream: async (req, res) => {
    // 设置SSE响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'X-Accel-Buffering': 'no' // 禁用nginx缓冲
    });
    
    // 发送初始心跳
    res.write('data: {"type":"heartbeat"}\n\n');

    try {
      // 发送开始事件
      res.write(`data: ${JSON.stringify({
        type: 'start',
        message: '开始测试CDN性能...',
        timestamp: new Date().toISOString()
      })}\n\n`);

      // 获取资源列表
      const resources = cdnTesterService.cdnResources;
      const resourceKeys = Object.keys(resources);
      
      // 发送资源列表
      res.write(`data: ${JSON.stringify({
        type: 'resources',
        data: resources,
        totalResources: resourceKeys.length
      })}\n\n`);

      const startTime = Date.now();
      const results = {};
      let completedCount = 0;
      const progressLock = { completed: 0 }; // 用于线程安全的进度计算

      // 真正的多线程并发测试：所有资源同时开始测试
      const resourceTestPromises = resourceKeys.map(async (resourceKey) => {
        const resource = resources[resourceKey];
        
        // 发送资源开始测试事件
        if (res.writable) {
          res.write(`data: ${JSON.stringify({
            type: 'resource_start',
            resourceKey,
            resourceName: resource.name,
            progress: Math.round((progressLock.completed / resourceKeys.length) * 100)
          })}\n\n`);
        }

        try {
          // 测试当前资源，使用线程安全的回调
          const resourceResult = await cdnTesterService.testResourceCDNsWithCallback(
            resourceKey,
            (cdnResult, index, total) => {
              // 确保回调的线程安全性
              if (res.writable) {
                res.write(`data: ${JSON.stringify({
                  type: 'cdn_result',
                  resourceKey,
                  resourceName: resource.name,
                  cdnIndex: index,
                  totalCdns: total,
                  result: cdnResult
                })}\n\n`);
              }
            }
          );

          results[resourceKey] = resourceResult;
          progressLock.completed++;

          // 发送资源测试完成事件
          if (res.writable) {
            res.write(`data: ${JSON.stringify({
              type: 'resource_complete',
              resourceKey,
              resourceName: resource.name,
              result: resourceResult,
              progress: Math.round((progressLock.completed / resourceKeys.length) * 100)
            })}\n\n`);
          }

          return { resourceKey, result: resourceResult };

        } catch (error) {
          console.error(`测试 ${resourceKey} 失败:`, error.message);
          const errorResult = {
            resourceKey,
            resourceName: resource.name,
            type: resource.type,
            results: [],
            fastest: null,
            totalTested: 0,
            successCount: 0,
            error: error.message
          };
          
          results[resourceKey] = errorResult;
          progressLock.completed++;

          // 发送错误事件
          if (res.writable) {
            res.write(`data: ${JSON.stringify({
              type: 'resource_error',
              resourceKey,
              resourceName: resource.name,
              error: error.message,
              progress: Math.round((progressLock.completed / resourceKeys.length) * 100)
            })}\n\n`);
          }
          
          return { resourceKey, result: errorResult, error: error.message };
        }
      });
      
      // 等待所有资源测试完成
      await Promise.all(resourceTestPromises);

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // 生成统计信息
      const stats = cdnTesterService.generateStats(results, totalTime);
      
      const finalResults = {
        timestamp: new Date().toISOString(),
        totalTime,
        stats,
        results
      };

      // 保存测试结果
      const savedPath = await cdnTesterService.saveTestResults(finalResults);

      // 发送完成事件
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        data: finalResults,
        savedPath,
        message: '所有CDN测试完成'
      })}\n\n`);

    } catch (error) {
      // 发送错误事件
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error.message
      })}\n\n`);
    } finally {
      res.end();
    }
  },

  /**
   * 获取测试历史
   */
  getTestHistory: async (req, res) => {
    try {
      const history = await cdnTesterService.getTestHistory();
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 获取特定测试结果
   */
  getTestResult: async (req, res) => {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        return res.status(400).json({
          success: false,
          error: '缺少文件名参数'
        });
      }

      const resultsDir = path.join(__dirname, '../../../temp/cdn-test-results');
      const filePath = path.join(resultsDir, filename);
      
      // 检查文件是否存在
      if (!await fs.pathExists(filePath)) {
        return res.status(404).json({
          success: false,
          error: '测试结果文件不存在'
        });
      }

      const data = await fs.readJson(filePath);
      
      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 生成性能报告
   */
  generateReport: async (req, res) => {
    try {
      const { filename } = req.params;
      
      let testResults;
      
      if (filename) {
        // 使用指定的测试结果文件
        const resultsDir = path.join(__dirname, '../../../temp/cdn-test-results');
        const filePath = path.join(resultsDir, filename);
        
        if (!await fs.pathExists(filePath)) {
          return res.status(404).json({
            success: false,
            error: '测试结果文件不存在'
          });
        }
        
        testResults = await fs.readJson(filePath);
      } else {
        // 执行新的测试
        testResults = await cdnTesterService.testAllCDNs();
        await cdnTesterService.saveTestResults(testResults);
      }
      
      const reportHtml = cdnTesterService.generatePerformanceReport(testResults);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(reportHtml);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 下载测试结果
   */
  downloadTestResult: async (req, res) => {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        return res.status(400).json({
          success: false,
          error: '缺少文件名参数'
        });
      }

      const resultsDir = path.join(__dirname, '../../../temp/cdn-test-results');
      const filePath = path.join(resultsDir, filename);
      
      // 检查文件是否存在
      if (!await fs.pathExists(filePath)) {
        return res.status(404).json({
          success: false,
          error: '测试结果文件不存在'
        });
      }

      res.download(filePath, filename);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 删除测试结果
   */
  deleteTestResult: async (req, res) => {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        return res.status(400).json({
          success: false,
          error: '缺少文件名参数'
        });
      }

      const resultsDir = path.join(__dirname, '../../../temp/cdn-test-results');
      const filePath = path.join(resultsDir, filename);
      
      // 检查文件是否存在
      if (!await fs.pathExists(filePath)) {
        return res.status(404).json({
          success: false,
          error: '测试结果文件不存在'
        });
      }

      await fs.remove(filePath);
      
      res.json({
        success: true,
        message: '测试结果已删除'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 测试单个CDN URL的速度
   */
  testSingleCDN: async (req, res) => {
    try {
      const { url, timeout } = req.body;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          error: '缺少URL参数'
        });
      }

      const result = await cdnTesterService.testCDNSpeed(url, timeout || 10000);
      
      res.json({
        success: true,
        data: {
          ...result,
          provider: cdnTesterService.extractCDNProvider(url)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = cdnTesterController;