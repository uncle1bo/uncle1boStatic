/**
 * 文章黑白名单管理器路由
 * 提供黑白名单管理的API接口
 */

const express = require('express');
const router = express.Router();
const articleFilterService = require('./articleFilterService');

/**
 * 渲染黑白名单管理器页面
 */
router.get('/', (req, res) => {
  res.render('articleFilterManager', {
    title: '文章黑白名单管理器',
    toolName: 'articleFilterManager'
  });
});

/**
 * 获取当前黑白名单配置
 */
router.get('/api/config', async (req, res) => {
  try {
    const config = await articleFilterService.getFilterConfig();
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('获取黑白名单配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取配置失败',
      error: error.message
    });
  }
});

/**
 * 获取所有页面列表（包含过滤状态）
 */
router.get('/api/pages', async (req, res) => {
  try {
    const pagesData = await articleFilterService.getAllPagesWithFilterStatus();
    res.json({
      success: true,
      data: pagesData
    });
  } catch (error) {
    console.error('获取页面列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取页面列表失败',
      error: error.message
    });
  }
});

/**
 * 更新黑白名单配置
 */
router.post('/api/config/update', async (req, res) => {
  try {
    const { blacklist, whitelist } = req.body;
    
    if (!Array.isArray(blacklist) || !Array.isArray(whitelist)) {
      return res.status(400).json({
        success: false,
        message: '黑白名单必须是数组格式'
      });
    }
    
    const config = {
      blacklist: {
        description: "黑名单：即使文章出现在generated目录也不显示在列表里",
        articles: blacklist
      },
      whitelist: {
        description: "白名单：对于在static目录的文章，特别允许它显示在文章列表里",
        articles: whitelist
      }
    };
    
    const success = await articleFilterService.updateFilterConfig(config);
    
    if (success) {
      res.json({
        success: true,
        message: '配置更新成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '配置更新失败'
      });
    }
  } catch (error) {
    console.error('更新黑白名单配置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新配置失败',
      error: error.message
    });
  }
});

/**
 * 添加文章到黑名单
 */
router.post('/api/blacklist/add', async (req, res) => {
  try {
    const { articles } = req.body;
    
    if (!articles || (!Array.isArray(articles) && typeof articles !== 'string')) {
      return res.status(400).json({
        success: false,
        message: '文章参数无效'
      });
    }
    
    const success = await articleFilterService.addToBlacklist(articles);
    
    if (success) {
      res.json({
        success: true,
        message: '已添加到黑名单'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '添加到黑名单失败'
      });
    }
  } catch (error) {
    console.error('添加到黑名单失败:', error);
    res.status(500).json({
      success: false,
      message: '添加到黑名单失败',
      error: error.message
    });
  }
});

/**
 * 添加文章到白名单
 */
router.post('/api/whitelist/add', async (req, res) => {
  try {
    const { articles } = req.body;
    
    if (!articles || (!Array.isArray(articles) && typeof articles !== 'string')) {
      return res.status(400).json({
        success: false,
        message: '文章参数无效'
      });
    }
    
    const success = await articleFilterService.addToWhitelist(articles);
    
    if (success) {
      res.json({
        success: true,
        message: '已添加到白名单'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '添加到白名单失败'
      });
    }
  } catch (error) {
    console.error('添加到白名单失败:', error);
    res.status(500).json({
      success: false,
      message: '添加到白名单失败',
      error: error.message
    });
  }
});

/**
 * 从黑白名单中移除文章
 */
router.delete('/api/remove', async (req, res) => {
  try {
    const { articles } = req.body;
    
    if (!articles || (!Array.isArray(articles) && typeof articles !== 'string')) {
      return res.status(400).json({
        success: false,
        message: '文章参数无效'
      });
    }
    
    const success = await articleFilterService.removeFromFilters(articles);
    
    if (success) {
      res.json({
        success: true,
        message: '已从过滤器中移除'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '移除失败'
      });
    }
  } catch (error) {
    console.error('从过滤器中移除失败:', error);
    res.status(500).json({
      success: false,
      message: '移除失败',
      error: error.message
    });
  }
});

/**
 * 清理已删除页面的过滤规则
 */
router.post('/api/cleanup', async (req, res) => {
  try {
    const success = await articleFilterService.cleanupDeletedPages();
    
    if (success) {
      res.json({
        success: true,
        message: '清理完成'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '清理失败'
      });
    }
  } catch (error) {
    console.error('清理失败:', error);
    res.status(500).json({
      success: false,
      message: '清理失败',
      error: error.message
    });
  }
});

module.exports = router;