/**
 * 站点地图更新工具路由
 * 处理与站点地图更新相关的HTTP请求
 */

const express = require('express');

// 导入服务
const sitemapUpdater = require('./index');

const router = express.Router();

// 显示站点地图更新器主页面
router.get('/', (req, res) => {
  res.render('sitemap-updater');
});

// 更新站点地图
router.post('/update', async (req, res) => {
  try {
    const { domain, changefreq, priority } = req.body;
    
    if (!domain) {
      return res.status(400).json({ error: '缺少必要参数: domain' });
    }
    
    // 使用站点地图更新服务更新站点地图
    const sitemapPath = await sitemapUpdater.updateSitemap({
      domain,
      changefreq: changefreq || 'weekly',
      priority: priority || '0.8'
    });
    
    res.json({ success: true, filePath: sitemapPath });
  } catch (error) {
    console.error('更新站点地图失败:', error);
    res.status(500).json({ error: '更新站点地图失败: ' + error.message });
  }
});

module.exports = router;