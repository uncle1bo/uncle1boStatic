/**
 * CDN缓存管理工具路由
 */

const express = require('express');
const router = express.Router();
const cdnCacheController = require('./cdnCacheController');

// 显示CDN缓存管理工具页面
router.get('/', cdnCacheController.showCacheManagerPage);

// 获取CDN资源配置
router.get('/resources', cdnCacheController.getCDNResources);

// 获取缓存状态
router.get('/status', cdnCacheController.getCacheStatus);
router.get('/status/:resourceKey', cdnCacheController.getResourceCacheStatus);

// 清除缓存
router.post('/clear-all', cdnCacheController.clearAllCache);
router.post('/clear/:resourceKey', cdnCacheController.clearResourceCache);

// 预热缓存
router.post('/warm-all', cdnCacheController.warmAllCache);
router.post('/warm/:resourceKey', cdnCacheController.warmResourceCache);

// 获取操作历史
router.get('/history', cdnCacheController.getOperationHistory);

// 获取缓存统计
router.get('/statistics', cdnCacheController.getCacheStatistics);

// 清除操作历史
router.delete('/history', cdnCacheController.clearOperationHistory);

module.exports = router;