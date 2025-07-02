# 站点地图更新器

## 1. 项目结构

```
sitemapUpdater/
├── index.js          # 路由和API处理
├── views/
│   └── sitemapUpdater.ejs # 前端界面
└── README.md         # 说明文档
```

## 2. 功能介绍

站点地图更新器是一个自动生成和更新网站sitemap.xml文件的工具。

### 已实现功能列表

- 自动扫描网站页面
- 生成标准的sitemap.xml文件
- 支持多语言页面映射
- 自动更新页面修改时间
- 智能设置页面优先级
- 实时状态监控
- 错误处理和日志记录

## 3. 用户使用方法

### 访问站点地图更新器
1. 启动开发服务器
2. 访问 `http://localhost:3000/sitemap-updater`

### 更新站点地图
1. 在界面中查看当前站点地图状态
2. 点击"更新站点地图"按钮
3. 等待扫描和生成完成
4. 查看更新结果和统计信息

### 功能说明
- **自动扫描** - 系统会自动扫描prod目录下的所有HTML页面
- **多语言支持** - 自动识别和处理中英文页面
- **优先级设置** - 根据页面类型自动设置合适的优先级
- **状态监控** - 实时显示站点地图的生成状态和页面统计

## 4. API使用方法

### 站点地图操作
```javascript
// 更新站点地图
POST /api/sitemap/update
// 返回: 更新结果和统计信息

// 获取站点地图状态
GET /api/sitemap/status
// 返回: 当前站点地图信息
```

### 页面扫描
```javascript
// 扫描网站页面
GET /api/sitemap/scan
// 返回: 扫描到的页面列表

// 获取页面详情
GET /api/sitemap/pages/:pageName
// 返回: 特定页面的详细信息
```

### 响应格式示例
```javascript
// 更新结果
{
  "success": true,
  "message": "站点地图更新成功",
  "stats": {
    "totalPages": 15,
    "zhPages": 8,
    "enPages": 7,
    "lastUpdate": "2024-01-01T12:00:00Z"
  }
}
```

### 注意事项

- 确保有足够的文件写入权限
- 站点地图会覆盖现有文件
- 建议定期更新以保持内容同步