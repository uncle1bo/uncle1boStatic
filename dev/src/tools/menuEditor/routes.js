/**
 * 目录编辑器工具路由
 */

const express = require('express');
const router = express.Router();
const menuEditor = require('./index');

/**
 * 获取导航菜单结构
 * GET /menu-editor/structure
 */
router.get('/structure', async (req, res) => {
  try {
    const result = await menuEditor.getMenuStructure();
    res.json(result);
  } catch (error) {
    console.error('获取导航菜单结构失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取导航菜单结构失败'
    });
  }
});

/**
 * 保存导航菜单结构
 * POST /menu-editor/save
 */
router.post('/save', async (req, res) => {
  try {
    const menuData = req.body;
    
    // 验证请求数据
    if (!menuData || !Array.isArray(menuData.menuItems)) {
      return res.status(400).json({
        success: false,
        error: '无效的菜单数据格式'
      });
    }
    
    // 保存菜单结构
    const result = await menuEditor.saveMenuStructure(menuData);
    res.json(result);
  } catch (error) {
    console.error('保存导航菜单结构失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '保存导航菜单结构失败'
    });
  }
});

module.exports = router;