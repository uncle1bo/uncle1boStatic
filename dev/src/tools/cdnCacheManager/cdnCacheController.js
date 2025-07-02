/**
 * CDN缓存管理工具控制器
 * 处理CDN缓存管理相关的HTTP请求
 */

const cdnCacheService = require('./cdnCacheService');

/**
 * CDN缓存管理控制器
 */
const cdnCacheController = {
  /**
   * 显示CDN缓存管理工具页面
   */
  showCacheManagerPage: (req, res) => {
    res.render('tools/cdnCacheManager', {
      title: 'CDN缓存管理工具',
      layout: 'layout'
    });
  },

  /**
   * 获取CDN资源配置
   */
  getCDNResources: (req, res) => {
    try {
      const resources = cdnCacheService.getCDNResources();
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
   * 获取所有资源的缓存状态
   */
  getCacheStatus: async (req, res) => {
    try {
      const status = await cdnCacheService.getAllCacheStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 获取指定资源的缓存状态
   */
  getResourceCacheStatus: async (req, res) => {
    try {
      const { resourceKey } = req.params;
      
      if (!resourceKey) {
        return res.status(400).json({
          success: false,
          error: '缺少资源键参数'
        });
      }

      const status = await cdnCacheService.checkCacheStatus(resourceKey);
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 清除所有资源的缓存
   */
  clearAllCache: async (req, res) => {
    try {
      const results = await cdnCacheService.clearAllCache();
      res.json({
        success: true,
        data: results,
        message: '所有缓存清除操作已完成'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 清除指定资源的缓存
   */
  clearResourceCache: async (req, res) => {
    try {
      const { resourceKey } = req.params;
      
      if (!resourceKey) {
        return res.status(400).json({
          success: false,
          error: '缺少资源键参数'
        });
      }

      const result = await cdnCacheService.clearResourceCache(resourceKey);
      res.json({
        success: true,
        data: result,
        message: `资源 ${resourceKey} 的缓存清除操作已完成`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 预热所有资源的缓存
   */
  warmAllCache: async (req, res) => {
    try {
      const results = await cdnCacheService.warmAllCache();
      res.json({
        success: true,
        data: results,
        message: '所有缓存预热操作已完成'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 预热指定资源的缓存
   */
  warmResourceCache: async (req, res) => {
    try {
      const { resourceKey } = req.params;
      
      if (!resourceKey) {
        return res.status(400).json({
          success: false,
          error: '缺少资源键参数'
        });
      }

      const result = await cdnCacheService.warmResourceCache(resourceKey);
      res.json({
        success: true,
        data: result,
        message: `资源 ${resourceKey} 的缓存预热操作已完成`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 获取操作历史
   */
  getOperationHistory: async (req, res) => {
    try {
      const history = await cdnCacheService.getOperationHistory();
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
   * 清除操作历史
   */
  clearOperationHistory: async (req, res) => {
    try {
      const result = await cdnCacheService.clearOperationHistory();
      res.json({
        success: true,
        data: result,
        message: '操作历史已清除'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 获取缓存统计信息
   */
  getCacheStatistics: async (req, res) => {
    try {
      const statistics = await cdnCacheService.getCacheStatistics();
      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = cdnCacheController;