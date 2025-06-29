/**
 * Uncle1bo静态站点工具集
 * 包含站点地图更新器、目录编辑器和页面管理器
 */

const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const ejs = require('ejs');

// 导入配置
const paths = require('./config/pathConfig');

// 导入工具路由
const sitemapUpdaterRoutes = require('./tools/sitemapUpdater/routes');
const menuEditorRoutes = require('./tools/menuEditor/routes');
const pageManagerRoutes = require('./tools/pageManager/routes');
const pageGeneratorRoutes = require('./tools/pageGenerator/routes');
const themeManagerRoutes = require('./tools/themeManager/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', paths.views);

// 设置静态文件目录
app.use(express.static(paths.public));
app.use('/tools', express.static(path.join(__dirname, 'tools')));

// 支持的文件预览格式
const PREVIEW_EXTENSIONS = ['xml', 'md', 'json', 'txt', 'css', 'js', 'html', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

// MIME类型映射
const MIME_TYPES = {
    'xml': 'application/xml',
    'md': 'text/markdown',
    'json': 'application/json',
    'txt': 'text/plain',
    'css': 'text/css',
    'js': 'application/javascript',
    'html': 'text/html',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
};

// 检查文件扩展名是否支持预览
function isPreviewableFile(filePath) {
    const ext = path.extname(filePath).toLowerCase().slice(1);
    return PREVIEW_EXTENSIONS.includes(ext);
}

// 自定义中间件：处理/prod路径下的文件预览请求
app.use('/prod', (req, res, next) => {
    const requestPath = req.path;
    const fullPath = path.join(paths.prod, requestPath);
    
    // 如果是可预览的文件格式
    if (isPreviewableFile(requestPath)) {
        // 检查文件是否存在
        if (fs.existsSync(fullPath)) {
            // 文件存在，继续正常的静态文件服务
            next();
        } else {
            // 文件不存在，返回404.html进行处理
            res.status(404).sendFile(path.join(paths.prod, '404.html'));
        }
    } else {
        // 不是预览格式，继续正常处理
        next();
    }
});

// 设置prod目录为静态文件目录，方便预览生成的页面
app.use('/prod', express.static(paths.prod, {
    // 设置缓存控制和正确的Content-Type
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase().slice(1);
        if (PREVIEW_EXTENSIONS.includes(ext)) {
            // 设置正确的MIME类型
            if (MIME_TYPES[ext]) {
                res.setHeader('Content-Type', MIME_TYPES[ext] + '; charset=utf-8');
            }
            // 确保浏览器不会直接下载这些文件
            res.setHeader('Content-Disposition', 'inline');
            // 允许跨域访问（用于文件预览）
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
    }
}));

// 设置body解析器
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.get('/', (req, res) => {
  res.render('tool-selector');
});

// 页面生成器工具路由
app.get('/page-generator', (req, res) => {
  res.render('page-generator');
});
app.use('/page-generator', pageGeneratorRoutes);

// 站点地图更新工具路由
app.get('/sitemap-updater', (req, res) => {
  res.render('sitemap-updater');
});
app.use('/sitemap-updater', sitemapUpdaterRoutes);

// 目录编辑器工具路由
app.get('/menu-editor', (req, res) => {
  res.render('menu-editor');
});
app.use('/menu-editor', menuEditorRoutes);

// 页面管理器工具路由
app.get('/page-manager', (req, res) => {
  res.render('page-manager');
});
app.use('/page-manager', pageManagerRoutes);

// 主题管理器工具路由
app.get('/theme-manager', (req, res) => {
  res.render('theme-manager');
});
app.use('/theme-manager', themeManagerRoutes);

// 这里可以添加其他工具的路由
// app.use('/other-tool', otherToolRoutes);


// 启动服务器
app.listen(PORT, () => {
  console.log(`服务已启动，访问 http://localhost:${PORT}`);
  console.log(`生成的页面可以在 http://localhost:${PORT}/prod 预览`);
});