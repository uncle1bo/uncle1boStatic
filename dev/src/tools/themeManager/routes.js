/**
 * 主题管理器路由
 * 处理与主题管理相关的HTTP请求
 */

const express = require('express');
const themeManagerService = require('./themeManagerService');

const router = express.Router();

/**
 * 获取当前主题配置
 */
router.get('/config', async (req, res) => {
  try {
    const config = await themeManagerService.getThemeConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('获取主题配置失败:', error);
    res.status(500).json({ success: false, message: '获取主题配置失败' });
  }
});

/**
 * 保存主题配置
 */
router.post('/save', async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({ success: false, message: '缺少主题配置数据' });
    }
    
    const result = await themeManagerService.saveThemeConfig(config);
    res.json(result);
  } catch (error) {
    console.error('保存主题配置失败:', error);
    res.status(500).json({ success: false, message: '保存主题配置失败' });
  }
});

/**
 * 重置为默认主题
 */
router.post('/reset', async (req, res) => {
  try {
    const result = await themeManagerService.resetToDefault();
    res.json(result);
  } catch (error) {
    console.error('重置主题失败:', error);
    res.status(500).json({ success: false, message: '重置主题失败' });
  }
});

/**
 * 预览主题效果
 */
router.post('/preview', async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({ success: false, message: '缺少主题配置数据' });
    }
    
    // 生成预览CSS
    const previewCSS = generatePreviewCSS(config);
    res.json({ success: true, css: previewCSS });
  } catch (error) {
    console.error('生成预览失败:', error);
    res.status(500).json({ success: false, message: '生成预览失败' });
  }
});

/**
 * 生成预览CSS
 */
function generatePreviewCSS(config) {
  const theme = config.light; // 默认使用明亮模式预览
  
  return `
    :root {
      --primary-color: ${theme.primary};
      --secondary-color: ${theme.secondary};
      --background-color: ${theme.background};
      --surface-color: ${theme.surface};
      --text-color: ${theme.text};
      --text-secondary-color: ${theme.textSecondary};
      --link-color: ${theme.link};
      --link-hover-color: ${theme.linkHover};
      --border-color: ${theme.border};
      --shadow-color: ${theme.shadow};
      --success-color: ${theme.success};
      --warning-color: ${theme.warning};
      --danger-color: ${theme.danger};
      --info-color: ${theme.info};
    }
  `;
}

module.exports = router;