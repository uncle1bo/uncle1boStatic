/**
 * 外部资源管理器路由配置
 */

const express = require('express');
const ResourceManagerController = require('./resourceManagerController');

const router = express.Router();
const controller = new ResourceManagerController();

// 主页面
router.get('/', controller.getIndexPage.bind(controller));

// 扫描资源
router.get('/scan', controller.scanMissingResources.bind(controller));
router.get('/scan/:resourceKey', controller.scanMissingResources.bind(controller));

// 下载资源
router.post('/download/:resourceKey', controller.downloadSingleResource.bind(controller));
router.post('/download/batch', controller.downloadBatchResources.bind(controller));
router.post('/download/all', controller.downloadAllMissing.bind(controller));

// 获取下载状态
router.get('/download-status', controller.getDownloadStatus.bind(controller));
router.get('/download-status/:resourceKey', controller.getDownloadStatus.bind(controller));

// 资源管理
router.get('/mappings', controller.getResourceMapping.bind(controller));
router.get('/history', controller.getDownloadHistory.bind(controller));
router.get('/statistics', controller.getStatistics.bind(controller));

// 缓存管理
router.delete('/cache', controller.clearDownloadCache.bind(controller));

// 404资源检测
router.post('/404-resource', controller.record404Resource.bind(controller));
router.get('/404-resources', controller.get404Resources.bind(controller));
router.delete('/404-resources', controller.clear404Resources.bind(controller));
router.delete('/404-resources/:resourceId', controller.clear404Resources.bind(controller));
router.put('/404-resources/:resourceId/downloaded', controller.mark404ResourceDownloaded.bind(controller));

module.exports = router;