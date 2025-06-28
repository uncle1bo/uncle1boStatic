/**
 * 页面管理器路由
 * 处理与页面管理相关的HTTP请求
 */

const express = require('express');

// 导入服务
const pageManager = require('./index');

const router = express.Router();

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

module.exports = router;