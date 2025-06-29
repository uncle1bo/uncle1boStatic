/**
 * 页面管理器路由
 * 处理与页面管理相关的HTTP请求
 */

const express = require('express');

// 导入服务
const pageManager = require('./index');

const router = express.Router();

// 显示页面管理器主页面
router.get('/', (req, res) => {
  res.render('page-manager');
});

// 获取所有页面列表
router.get('/list', async (req, res) => {
  try {
    const pages = await pageManager.getAllPages();
    res.json({ success: true, pages });
  } catch (error) {
    console.error('获取页面列表失败:', error);
    res.status(500).json({ error: '获取页面列表失败: ' + error.message });
  }
});

// 删除页面
router.delete('/delete/:pageName', async (req, res) => {
  try {
    const { pageName } = req.params;
    
    if (!pageName) {
      return res.status(400).json({ error: '缺少页面名称' });
    }
    
    await pageManager.deletePage(pageName);
    res.json({ success: true });
  } catch (error) {
    console.error('删除页面失败:', error);
    res.status(500).json({ error: '删除页面失败: ' + error.message });
  }
});

// 清理预览文件
router.post('/cleanup-preview', async (req, res) => {
  try {
    const cleanedCount = await pageManager.cleanupPreviewFiles();
    res.json({ success: true, cleanedCount });
  } catch (error) {
    console.error('清理预览文件失败:', error);
    res.status(500).json({ error: '清理预览文件失败: ' + error.message });
  }
});

module.exports = router;