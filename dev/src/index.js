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
const cdnTesterRoutes = require('./tools/cdnTester/routes');

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

// Bootstrap测试页面路由
app.get('/bootstrap-test', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-files/bootstrap-elements-test.html'));
});

// 这里可以添加其他工具的路由
// app.use('/other-tool', otherToolRoutes);


// 启动服务器
app.listen(PORT, () => {
  console.log(`服务已启动，访问 http://localhost:${PORT}`);
  console.log(`生成的页面可以在 http://localhost:${PORT}/prod 访问`);
});