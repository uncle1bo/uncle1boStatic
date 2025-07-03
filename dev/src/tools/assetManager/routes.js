/**
 * 资源管理器路由配置
 */

const express = require('express');
const router = express.Router();
const AssetManagerController = require('./assetManagerController');

// 创建控制器实例
const controller = new AssetManagerController();

// ==================== 页面路由 ====================

// 资源管理器主页面
router.get('/', (req, res) => {
  controller.renderAssetManagerPage(req, res);
});

// 重定向管理器页面
router.get('/redirects', (req, res) => {
  controller.renderRedirectManagerPage(req, res);
});

// ==================== 资源管理API ====================

// 扫描缺失资源
router.get('/scan', (req, res) => {
  controller.scanResources(req, res);
});

// 下载单个资源
router.post('/download', (req, res) => {
  controller.downloadResource(req, res);
});

// 批量下载资源
router.post('/download-batch', (req, res) => {
  controller.downloadBatchResources(req, res);
});

// 获取下载历史
router.get('/history', (req, res) => {
  controller.getDownloadHistory(req, res);
});

// 获取下载状态
router.get('/download-status', (req, res) => {
  controller.getDownloadStatus(req, res);
});

// 获取404资源记录
router.get('/404-resources', (req, res) => {
  controller.get404Resources(req, res);
});

// 清理404资源记录
router.delete('/404-resources', (req, res) => {
  controller.clear404Resources(req, res);
});

// ==================== 重定向管理API ====================

// 获取所有重定向规则
router.get('/redirect-rules', (req, res) => {
  controller.getAllRedirectRules(req, res);
});

// 添加自定义重定向规则
router.post('/redirect-rules', (req, res) => {
  controller.addCustomRedirectRule(req, res);
});

// 删除重定向规则
router.delete('/redirect-rules/:ruleName', (req, res) => {
  controller.removeCustomRedirectRule(req, res);
});

// 测试重定向
router.post('/test-redirect', (req, res) => {
  controller.testRedirect(req, res);
});

// 获取重定向统计
router.get('/redirect-stats', (req, res) => {
  controller.getRedirectStats(req, res);
});

// 更新重定向配置
router.put('/redirect-config', (req, res) => {
  controller.updateRedirectOptions(req, res);
});

module.exports = router;