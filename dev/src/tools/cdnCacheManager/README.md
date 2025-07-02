# CDN缓存管理工具

## 1. 项目结构

```
cdnCacheManager/
├── cdnCacheController.js # 控制器处理HTTP请求
├── cdnCacheService.js    # 核心服务实现
├── routes.js             # 路由定义
└── README.md             # 说明文档
```

## 2. 功能介绍

CDN缓存管理工具用于管理CDN资源的缓存，提供一键清除缓存和一键缓存功能，帮助开发者快速更新CDN资源。

### 已实现功能列表

- 一键清除CDN缓存
- 一键预热CDN缓存
- 批量缓存管理
- 缓存状态检查
- **内容完整性校验** - hash不完整判定为损坏，自动重新获取
- 操作历史记录
- 缓存统计信息

## 3. 用户使用方法

### 访问CDN缓存管理工具
1. 启动开发服务器
2. 访问 `http://localhost:3000/cdn-cache-manager`

### 操作流程
1. **查看缓存状态** - 查看当前CDN资源的缓存状态
2. **清除缓存** - 一键清除所有或指定CDN资源的缓存
3. **预热缓存** - 一键预热CDN缓存，提高访问速度
4. **查看历史** - 查看缓存操作历史记录
5. **统计信息** - 查看缓存使用统计

### 功能说明
- **缓存清除** - 清除CDN上的缓存文件，强制重新获取最新资源
- **缓存预热** - 主动请求CDN资源，将其缓存到CDN节点
- **状态检查** - 检查CDN资源的缓存状态和可用性
- **完整性校验** - 使用SHA-256算法计算内容hash，hash不完整（长度<64字符）判定为损坏，自动重新获取
- **批量操作** - 支持批量清除或预热多个资源

## 4. API使用方法

### 清除缓存
```javascript
// 清除所有缓存
POST /cdn-cache-manager/clear-all

// 清除指定资源缓存
POST /cdn-cache-manager/clear/:resourceKey
```

### 预热缓存
```javascript
// 预热所有缓存
POST /cdn-cache-manager/warm-all

// 预热指定资源缓存
POST /cdn-cache-manager/warm/:resourceKey
```

### 查看缓存状态
```javascript
// 获取所有资源缓存状态
GET /cdn-cache-manager/status

// 获取指定资源缓存状态
GET /cdn-cache-manager/status/:resourceKey
```

## 5. 注意事项

- 缓存清除操作可能需要一定时间生效
- 预热操作会产生网络流量，请合理使用
- **hash完整性检查规则**：
  - 使用SHA-256算法计算内容hash值
  - hash长度必须≥64字符，否则判定为不完整
  - hash不完整或缺失的缓存会被自动删除并重新获取
  - 完整性检查可通过配置文件启用/禁用（默认启用）
- 建议在更新资源后及时清除相关缓存
- 操作历史会自动保存，便于追踪问题