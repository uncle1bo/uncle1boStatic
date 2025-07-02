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

// 显示页面生成器主页面
router.get('/', (req, res) => {
  res.render('page-generator');
});

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

// 清理预览页面
router.delete('/preview/:previewPageName', async (req, res) => {
  try {
    const { previewPageName } = req.params;
    
    // 删除预览页面文件
    const previewPagePath = path.join(paths.getPagesPath(), `${previewPageName}.html`);
    if (await fs.pathExists(previewPagePath)) {
      await fs.remove(previewPagePath);
    }
    
    // 清理相关的多语言文件
    await pageGenerator.cleanupAllTempFiles(previewPageName);
    
    res.json({ success: true, message: '预览页面已清理' });
  } catch (error) {
    console.error('清理预览页面失败:', error);
    res.status(500).json({ error: '清理预览页面失败: ' + error.message });
  }
});

// 页面卸载时清理预览页面
router.post('/cleanup-on-unload', async (req, res) => {
  try {
    const { previewPageName } = req.body;
    
    if (previewPageName) {
      // 删除预览页面文件
      const previewPagePath = path.join(paths.getPagesPath(), `${previewPageName}.html`);
      if (await fs.pathExists(previewPagePath)) {
        await fs.remove(previewPagePath);
      }
      
      // 清理相关的多语言文件
      await pageGenerator.cleanupAllTempFiles(previewPageName);
      
      console.log('页面卸载时清理预览文件:', previewPageName);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('页面卸载时清理预览文件失败:', error);
    res.status(500).json({ error: '清理失败: ' + error.message });
  }
});

// 生成页面
router.post('/generate', async (req, res) => {
  try {
    const { pageName, tabTitle, pageTitle, seoDescription, seoKeywords, content, translations, isEdit = false } = req.body;
    
    if (!pageName || !pageTitle || !content) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 验证页面名称
    if (!pageGenerator.validatePageName(pageName)) {
      return res.status(400).json({ error: '页面名称只能包含字母、数字和连字符' });
    }
    
    const result = await pageGenerator.generatePage({
      pageName,
      tabTitle,
      pageTitle,
      seoDescription,
      seoKeywords,
      content,
      translations,
      isEdit
    });
    
    res.json({ success: true, message: '页面生成成功' });
  } catch (error) {
    console.error('生成页面失败:', error);
    res.status(500).json({ error: '生成页面失败: ' + error.message });
  }
});

// 预览页面
router.post('/preview', async (req, res) => {
  try {
    const { pageName, tabTitle, pageTitle, seoDescription, seoKeywords, content, translations } = req.body;
    
    // 生成临时预览页面名称
    const previewPageName = `preview-${Date.now()}`;
    
    // 直接生成页面到prod环境
    await pageGenerator.generatePage({
      pageName: previewPageName,
      tabTitle,
      pageTitle,
      seoDescription,
      seoKeywords,
      content,
      translations,
      isPreview: true // 标记为预览页面
    });
    
    // 返回预览页面的URL
    const previewUrl = `http://localhost:3000/prod/pages/${previewPageName}.html`;
    
    res.json({ 
      success: true, 
      previewUrl,
      previewPageName,
      message: '预览页面生成成功' 
    });
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

// 检查页面是否可编辑
router.get('/check-editable/:pageName', async (req, res) => {
  try {
    const { pageName } = req.params;
    const editable = await pageGenerator.isPageEditable(pageName);
    res.json({ success: true, editable });
  } catch (error) {
    console.error('检查页面是否可编辑失败:', error);
    res.status(500).json({ error: '检查页面是否可编辑失败: ' + error.message });
  }
});

// 加载页面数据进行编辑
router.get('/load-page/:pageName', async (req, res) => {
  try {
    const { pageName } = req.params;
    
    // 先检查页面是否可编辑
    const isEditable = await pageGenerator.isPageEditable(pageName);
    if (!isEditable) {
      return res.status(404).json({ success: false, error: '页面不存在或不可编辑' });
    }
    
    const pageData = await pageGenerator.loadPageData('edit', pageName);
    
    if (!pageData) {
      return res.status(404).json({ success: false, error: '页面数据不存在' });
    }
    
    res.json({ success: true, pageData });
  } catch (error) {
    console.error('加载页面数据失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

module.exports = router;