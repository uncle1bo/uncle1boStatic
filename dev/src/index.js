/**
 * Uncle1bo静态站点工具集
 * 包含站点地图更新器、目录编辑器和页面管理器
 */

const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const ejs = require('ejs');

// 为了兼容性，同时引入原生fs模块
const fsNative = require('fs');

// 导入配置
const paths = require('./config/pathConfig');
const redirectService = require('./services/redirectService');

// 导入工具路由
const sitemapUpdaterRoutes = require('./tools/sitemapUpdater/routes');
const menuEditorRoutes = require('./tools/menuEditor/routes');
const pageManagerRoutes = require('./tools/pageManager/routes');
const pageGeneratorRoutes = require('./tools/pageGenerator/routes');
const themeManagerRoutes = require('./tools/themeManager/routes');
const cdnTesterRoutes = require('./tools/cdnTester/routes');
const cdnCacheManagerRoutes = require('./tools/cdnCacheManager/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', paths.views);

// 设置静态文件目录
app.use(express.static(paths.public));
app.use('/tools', express.static(path.join(__dirname, 'tools')));

// 设置prod目录为静态文件目录，方便预览生成的页面
app.use('/prod', express.static(paths.prod));

// 添加assets路径映射，解决静态资源访问问题
// 优先映射根目录的assets（包含Prism组件）
app.use('/assets', express.static(path.join(paths.root, '..', 'assets')));
// 然后映射prod目录的assets
app.use('/assets', express.static(path.join(paths.prod, 'assets')));

// 添加字体文件路径映射，解决Bootstrap图标404问题
app.use('/fonts', express.static(path.join(paths.prod, 'assets', 'fonts')));

// 设置CORS跨域头
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 设置body解析器
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.get('/', (req, res) => {
  res.render('tool-selector');
});

// 工具路由
app.use('/page-generator', require('./tools/pageGenerator/routes'));
app.use('/sitemap-updater', require('./tools/sitemapUpdater/routes'));
app.use('/menu-editor', require('./tools/menuEditor/routes'));
app.use('/page-manager', require('./tools/pageManager/routes'));
app.use('/theme-manager', require('./tools/themeManager/routes'));
app.use('/cdn-tester', require('./tools/cdnTester/routes'));
app.use('/cdn-cache-manager', require('./tools/cdnCacheManager/routes'));

// 重定向管理路由
app.use('/api/redirect', require('./routes/redirectRoutes'));

// 重定向管理器页面路由
app.get('/redirect-manager', (req, res) => {
    res.render('redirect-manager');
});

// Bootstrap测试页面路由
app.get('/bootstrap-test', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-files/bootstrap-elements-test.html'));
});

// 自动重定向中间件 - 处理外部资源路径的重定向
app.use((req, res, next) => {
  const redirectInfo = redirectService.processRedirect(req.path);
  
  if (redirectInfo) {
    // 记录重定向日志
    redirectService.logRedirect(redirectInfo);
    
    // 执行重定向
    return res.redirect(redirectInfo.statusCode, redirectInfo.newPath);
  }
  
  next();
});

// 自动处理prod目录下的所有静态文件访问
// 支持嵌套路径和直接访问，无需手动配置每个路由
app.get('/prod/*', (req, res, next) => {
  const filePath = req.path.replace('/prod', '');
  const fullPath = path.join(paths.prod, filePath);
  
  // 检查文件是否存在
  if (fsNative.existsSync(fullPath)) {
    res.sendFile(fullPath);
  } else {
    next(); // 继续到下一个中间件
  }
});

// 处理prod根目录访问，自动重定向到index.html
app.get('/prod', (req, res) => {
  const indexPath = path.join(paths.prod, 'index.html');
  if (fsNative.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Index file not found');
  }
});

// 这里可以添加其他工具的路由
// app.use('/other-tool', otherToolRoutes);


// 启动服务器
app.listen(PORT, () => {
  console.log(`服务已启动，访问 http://localhost:${PORT}`);
  console.log(`生成的页面可以在 http://localhost:${PORT}/prod 访问`);
});