/**
 * 页面生成器路由
 * 处理与页面生成相关的HTTP请求
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// 导入服务
const pageGenerator = require('./index');
const paths = require('../../config/pathConfig');

const router = express.Router();

// 配置multer用于文件上传
const upload = multer({
  dest: paths.uploads,
  fileFilter: (req, file, cb) => {
    // 只允许markdown文件
    if (file.mimetype === 'text/markdown' || path.extname(file.originalname).toLowerCase() === '.md') {
      cb(null, true);
    } else {
      cb(new Error('只支持Markdown文件'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB限制
  }
});

// 生成页面
router.post('/generate', async (req, res) => {
  try {
    const { pageName, pageTitle, content, translations } = req.body;
    
    if (!pageName || !pageTitle || !content) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 验证页面名称
    if (!pageGenerator.validatePageName(pageName)) {
      return res.status(400).json({ error: '页面名称只能包含字母、数字和连字符' });
    }
    
    const result = await pageGenerator.generatePage({
      pageName,
      pageTitle,
      content,
      translations
    });
    
    res.json({ success: true, message: '页面生成成功' });
  } catch (error) {
    console.error('生成页面失败:', error);
    res.status(500).json({ error: '生成页面失败: ' + error.message });
  }
});

// 预览页面
router.post('/preview', (req, res) => {
  try {
    const { pageName, pageTitle, content } = req.body;
    
    const html = pageGenerator.previewPage({
      pageName,
      pageTitle,
      content
    });
    
    res.send(html);
  } catch (error) {
    console.error('预览页面失败:', error);
    res.status(500).json({ error: '预览页面失败: ' + error.message });
  }
});

// 保存草稿
router.post('/draft/save', async (req, res) => {
  try {
    const draft = req.body;
    await pageGenerator.saveDraft(draft);
    res.json({ success: true, message: '草稿保存成功' });
  } catch (error) {
    console.error('保存草稿失败:', error);
    res.status(500).json({ error: '保存草稿失败: ' + error.message });
  }
});

// 加载草稿
router.get('/draft/load', async (req, res) => {
  try {
    const draft = await pageGenerator.loadDraft();
    res.json({ success: true, draft });
  } catch (error) {
    console.error('加载草稿失败:', error);
    res.status(500).json({ error: '加载草稿失败: ' + error.message });
  }
});

// 上传Markdown文件
router.post('/upload-markdown', upload.single('markdown'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }
    
    // 读取文件内容
    const content = await fs.readFile(req.file.path, 'utf8');
    
    // 删除临时文件
    await fs.remove(req.file.path);
    
    res.json({ success: true, content });
  } catch (error) {
    console.error('上传文件失败:', error);
    res.status(500).json({ error: '上传文件失败: ' + error.message });
  }
});

// 验证页面名称
router.post('/validate-name', (req, res) => {
  try {
    const { pageName } = req.body;
    const isValid = pageGenerator.validatePageName(pageName);
    res.json({ success: true, valid: isValid });
  } catch (error) {
    console.error('验证页面名称失败:', error);
    res.status(500).json({ error: '验证页面名称失败: ' + error.message });
  }
});

module.exports = router;