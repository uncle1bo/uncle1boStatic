/**
 * 页面生成器路由
 * 处理与页面生成相关的HTTP请求
 */

const express = require('express');
const multer = require('multer');
const path = require('path');

// 导入配置
const paths = require('../../config/pathConfig');

// 导入服务
const fileService = require('../../services/fileService');
const pageGenerator = require('./index');

const router = express.Router();

// 设置文件上传
const upload = multer({ dest: paths.uploads });

// 处理直接输入的Markdown内容
router.post('/convert', async (req, res) => {
  try {
    const { markdownContent, pageName, pageTitle, pageDescription } = req.body;
    
    if (!markdownContent || !pageName) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 使用页面生成器服务生成页面
    const htmlFilePath = await pageGenerator.generatePageFromMarkdown({
      markdownContent,
      pageName,
      pageTitle: pageTitle || '',
      pageDescription: pageDescription || ''
    });
    
    res.json({ success: true, filePath: htmlFilePath });
  } catch (error) {
    console.error('转换失败:', error);
    res.status(500).json({ error: '转换失败: ' + error.message });
  }
});

// 处理上传的Markdown文件
router.post('/upload', upload.single('markdownFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未上传文件' });
    }
    
    const { pageName, pageTitle, pageDescription } = req.body;
    
    if (!pageName) {
      return res.status(400).json({ error: '缺少页面名称' });
    }
    
    // 读取上传的文件内容
    const markdownContent = await fileService.readMarkdownFile(req.file.path);
    
    // 使用页面生成器服务生成页面
    const htmlFilePath = await pageGenerator.generatePageFromMarkdown({
      markdownContent,
      pageName,
      pageTitle: pageTitle || '',
      pageDescription: pageDescription || ''
    });
    
    // 删除临时上传的文件
    await fileService.deleteFile(req.file.path);
    
    res.json({ success: true, filePath: htmlFilePath });
  } catch (error) {
    console.error('处理上传文件失败:', error);
    res.status(500).json({ error: '处理上传文件失败: ' + error.message });
  }
});

module.exports = router;