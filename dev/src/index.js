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

// 导入工具路由
const sitemapUpdaterRoutes = require('./tools/sitemapUpdater/routes');
const menuEditorRoutes = require('./tools/menuEditor/routes');
const pageManagerRoutes = require('./tools/pageManager/routes');
const pageGeneratorRoutes = require('./tools/pageGenerator/routes');
const themeManagerRoutes = require('./tools/themeManager/routes');
const assetManagerRoutes = require('./tools/assetManager/routes');
const articleFilterManagerRoutes = require('./tools/articleFilterManager');

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
// 主题管理器API路由
app.use('/api/theme', require('./tools/themeManager/routes'));
// 资源管理器路由
app.use('/asset-manager', require('./tools/assetManager/routes'));
app.use('/api/asset-manager', require('./tools/assetManager/routes'));
// 文章黑白名单管理器路由
app.use('/article-filter-manager', require('./tools/articleFilterManager'));

// Bootstrap测试页面路由
app.get('/bootstrap-test', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-files/bootstrap-elements-test.html'));
});

// 自动重定向中间件 - 处理外部资源路径的重定向
app.use(async (req, res, next) => {
  try {
    const AssetManagerService = require('./tools/assetManager/assetManagerService');
    const assetManager = new AssetManagerService();
    const redirectInfo = await assetManager.processRedirect(req.path);
    
    if (redirectInfo) {
      // 执行重定向
      return res.redirect(redirectInfo.statusCode, redirectInfo.newPath);
    }
  } catch (error) {
    console.error('重定向处理失败:', error);
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

// 404资源检测中间件
app.use((req, res, next) => {
  // 如果是静态资源请求且返回404，记录到assetManager
  const originalSend = res.send;
  res.send = function(body) {
    if (res.statusCode === 404 && req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i)) {
      // 异步记录404资源，不阻塞响应
      setImmediate(async () => {
        try {
          const AssetManagerService = require('./tools/assetManager/assetManagerService');
          const assetManager = new AssetManagerService();
          const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
          const referrer = req.get('Referer') || null;
          await assetManager.record404Resource(fullUrl, referrer);
        } catch (error) {
          console.error('记录404资源失败:', error);
        }
      });
    }
    return originalSend.call(this, body);
  };
  next();
});

// 这里可以添加其他工具的路由
// app.use('/other-tool', otherToolRoutes);


// 启动服务器
app.listen(PORT, () => {
  console.log(`服务已启动，访问 http://localhost:${PORT}`);
  console.log(`生成的页面可以在 http://localhost:${PORT}/prod 访问`);
});