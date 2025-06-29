/**
 * Uncle1bo静态网站服务器
 * 支持文件预览功能的Express服务器
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

// 支持的文件预览格式
const PREVIEW_EXTENSIONS = ['xml', 'md', 'json', 'txt', 'css', 'js', 'html', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

// 检查文件扩展名是否支持预览
function isPreviewableFile(filePath) {
    const ext = path.extname(filePath).toLowerCase().slice(1);
    return PREVIEW_EXTENSIONS.includes(ext);
}

// 检查文件是否存在
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        return false;
    }
}

// 自定义中间件：处理文件预览请求
app.use((req, res, next) => {
    const requestPath = req.path;
    const fullPath = path.join(__dirname, 'prod', requestPath);
    
    // 如果是可预览的文件格式
    if (isPreviewableFile(requestPath)) {
        // 检查文件是否存在
        if (fileExists(fullPath)) {
            // 文件存在，继续正常的静态文件服务
            next();
        } else {
            // 文件不存在，返回404.html进行处理
            res.status(404).sendFile(path.join(__dirname, 'prod', '404.html'));
        }
    } else {
        // 不是预览格式，继续正常处理
        next();
    }
});

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

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'prod'), {
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

// 404处理 - 对于所有未匹配的路由
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'prod', '404.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Uncle1bo静态网站服务器已启动`);
    console.log(`访问地址: http://localhost:${PORT}`);
    console.log(`支持文件预览格式: ${PREVIEW_EXTENSIONS.join(', ')}`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    process.exit(0);
});