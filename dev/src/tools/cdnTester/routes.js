/**
 * CDN网络性能检测工具路由
 */

const express = require('express');
const router = express.Router();
const cdnTesterController = require('./cdnTesterController');

// 显示CDN测试工具页面
router.get('/', cdnTesterController.showTestPage);

// 获取CDN资源配置
router.get('/resources', cdnTesterController.getCDNResources);

// 测试单个资源的CDN
router.post('/test-resource/:resourceKey', cdnTesterController.testResourceCDNs);

// 测试所有CDN
router.post('/test-all', cdnTesterController.testAllCDNs);

// 实时测试所有CDN (Server-Sent Events)
router.get('/test-all-stream', cdnTesterController.testAllCDNsStream);

// 测试单个CDN URL
router.post('/test-single', cdnTesterController.testSingleCDN);

// 获取测试历史
router.get('/history', cdnTesterController.getTestHistory);

// 获取特定测试结果
router.get('/result/:filename', cdnTesterController.getTestResult);

// 删除测试结果
router.delete('/result/:filename', cdnTesterController.deleteTestResult);

// 生成性能报告
router.get('/report', cdnTesterController.generateReport);
router.get('/report/:filename', cdnTesterController.generateReport);

// 下载测试结果
router.get('/download/:filename', cdnTesterController.downloadTestResult);

module.exports = router;