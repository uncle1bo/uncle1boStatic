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

// 这里可以添加其他工具的路由
// app.use('/other-tool', otherToolRoutes);


// 启动服务器
app.listen(PORT, () => {
  console.log(`服务已启动，访问 http://localhost:${PORT}`);
  console.log(`生成的页面可以在 http://localhost:${PORT}/prod 预览`);
});