/**
 * Uncle1bo静态网站服务器
 * 简单的Express静态文件服务器
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

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

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'prod')));

// 添加assets路径映射，确保静态资源正确访问
app.use('/assets', express.static(path.join(__dirname, 'prod', 'assets')));

// 添加字体文件路径映射
app.use('/fonts', express.static(path.join(__dirname, 'prod', 'assets', 'fonts')));

// 404处理 - 对于所有未匹配的路由
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'prod', '404.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Uncle1bo静态网站服务器已启动`);
    console.log(`访问地址: http://localhost:${PORT}`);

});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    process.exit(0);
});