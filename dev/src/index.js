/**
 * MD to HTML Tool
 * 将Markdown内容转换为HTML页面并与模板结合
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const ejs = require('ejs');

// 导入配置
const paths = require('./config/pathConfig');

// 导入服务
const fileService = require('./services/fileService');
const pageGeneratorService = require('./services/pageGeneratorService');

const app = express();
const PORT = process.env.PORT || 3000;

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', paths.views);

// 设置静态文件目录
app.use(express.static(paths.public));

// 设置prod目录为静态文件目录，方便预览生成的页面
app.use('/prod', express.static(paths.prod));

// 设置body解析器
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 设置文件上传
const upload = multer({ dest: paths.uploads });

// 路由
app.get('/', (req, res) => {
  res.render('index');
});

// 处理直接输入的Markdown内容
app.post('/convert', async (req, res) => {
  try {
    const { markdownContent, pageName, pageTitle, pageDescription } = req.body;
    
    if (!markdownContent || !pageName) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 使用页面生成器服务生成页面
    const htmlFilePath = await pageGeneratorService.generatePageFromMarkdown({
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
app.post('/upload', upload.single('markdownFile'), async (req, res) => {
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
    const htmlFilePath = await pageGeneratorService.generatePageFromMarkdown({
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

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务已启动，访问 http://localhost:${PORT}`);
  console.log(`生成的页面可以在 http://localhost:${PORT}/prod 预览`);
});