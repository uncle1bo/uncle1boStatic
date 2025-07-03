# 外部资源管理器

## 1. 项目结构

```
resourceManager/
├── resourceManagerController.js # 控制器处理HTTP请求
├── resourceManagerService.js    # 核心服务实现
├── routes.js                    # 路由定义
└── README.md                    # 说明文档
```

## 2. 功能介绍

外部资源管理器用于检测本地缺失的依赖资源，并提供一键下载功能，确保项目在离线环境下的正常运行。

### 已实现功能列表

- **缺失资源检测** - 扫描本地文件系统，检测缺失的依赖资源
- **资源依赖分析** - 分析资源间的依赖关系，确保下载顺序
- **一键批量下载** - 支持批量下载所有缺失资源
- **下载进度监控** - 实时显示下载进度和状态
- **完整性校验** - 下载后自动验证文件完整性
- **版本管理** - 支持资源版本检查和更新
- **路径映射管理** - 管理依赖源到本地路径的映射关系
- **下载历史记录** - 记录所有下载操作的历史

## 3. 用户使用方法

### 访问资源管理器
1. 启动开发服务器
2. 访问 `http://localhost:3000/resource-manager`

### 操作流程
1. **扫描缺失资源** - 点击"扫描"按钮检测本地缺失的资源
2. **查看缺失列表** - 查看详细的缺失资源列表和依赖关系
3. **选择下载资源** - 可选择性下载特定资源或全部下载
4. **监控下载进度** - 实时查看下载进度和状态
5. **验证完整性** - 下载完成后自动进行完整性检查
6. **查看下载历史** - 查看历史下载记录和统计信息

### 功能说明
- **智能检测** - 根据依赖配置自动检测本地缺失的资源文件
- **依赖解析** - 自动分析资源依赖关系，确保正确的下载顺序
- **多源下载** - 支持从多个依赖源下载，自动选择最快的源
- **断点续传** - 支持大文件的断点续传功能
- **完整性保证** - 使用SHA-256校验确保下载文件的完整性
- **版本同步** - 检查并同步资源的最新版本

## 4. API使用方法

### 扫描缺失资源
```javascript
// 扫描所有缺失资源
GET /resource-manager/scan

// 扫描特定资源
GET /resource-manager/scan/:resourceKey
```

### 下载资源
```javascript
// 下载所有缺失资源
POST /resource-manager/download-all

// 下载特定资源
POST /resource-manager/download/:resourceKey

// 批量下载指定资源
POST /resource-manager/download-batch
// Body: { resourceKeys: ['resource1', 'resource2'] }
```

### 获取下载状态
```javascript
// 获取下载进度
GET /resource-manager/download-status

// 获取特定资源下载状态
GET /resource-manager/download-status/:resourceKey
```

### 管理功能
```javascript
// 获取资源映射配置
GET /resource-manager/mappings

// 更新资源映射
PUT /resource-manager/mappings

// 获取下载历史
GET /resource-manager/history

// 清理下载缓存
DELETE /resource-manager/cache
```

## 5. 注意事项

- **网络连接** - 下载功能需要稳定的网络连接
- **磁盘空间** - 确保有足够的磁盘空间存储下载的资源
- **文件权限** - 确保对目标目录有写入权限
- **版本兼容性** - 下载的资源版本需与项目配置保持一致
- **依赖顺序** - 系统会自动处理资源依赖关系，确保正确的加载顺序
- **完整性检查** - 所有下载的文件都会进行SHA-256完整性校验
- **备份建议** - 建议在批量下载前备份现有资源文件
- **CDN选择** - 系统会自动选择响应最快的CDN源进行下载