# CDN网络性能检测工具

## 1. 项目结构

```
cdnTester/
├── cdnTesterController.js # 控制器处理HTTP请求
├── cdnTesterService.js    # 核心服务实现
├── routes.js             # 路由定义
└── README.md             # 说明文档
```

## 2. 功能介绍

CDN网络性能检测工具用于测试和监控CDN资源的可用性和响应速度，帮助优化网站的CDN配置。

### 已实现功能列表

- CDN响应速度测试
- CDN可用性检测
- 批量CDN性能测试
- 实时测试结果流
- 测试历史记录管理
- 性能报告生成
- 测试结果导出下载
- 并发控制优化

## 3. 用户使用方法

### 访问CDN测试工具
1. 启动开发服务器
2. 访问 `http://localhost:3000/cdn-tester`

### 测试操作流程
1. **查看CDN资源** - 查看当前配置的CDN资源列表
2. **单资源测试** - 选择特定资源测试其所有CDN
3. **全量测试** - 测试所有资源的所有CDN
4. **实时监控** - 使用流式测试查看实时结果
5. **查看历史** - 查看历史测试记录
6. **生成报告** - 生成详细的性能分析报告
7. **下载结果** - 导出测试数据

### 功能说明
- **响应时间测试** - 测量CDN的响应延迟
- **可用性检测** - 检查CDN资源是否可访问
- **并发控制** - 智能控制并发请求数量
- **结果分析** - 提供详细的性能统计和建议

## 4. API使用方法

### CDN资源管理
```javascript
// 获取CDN资源配置
GET /api/cdn-tester/resources
// 返回: CDN资源配置列表
```

### CDN测试操作
```javascript
// 测试单个资源的所有CDN
POST /api/cdn-tester/test-resource/:resourceKey
// 参数: resourceKey - 资源标识符
// 返回: 测试结果数据

// 测试所有CDN
POST /api/cdn-tester/test-all
// 返回: 完整测试结果

// 实时测试流
GET /api/cdn-tester/test-all-stream
// 返回: Server-Sent Events流

// 测试单个CDN URL
POST /api/cdn-tester/test-single
// 参数: { url: 'CDN URL' }
// 返回: 单个CDN测试结果
```

### 历史记录管理
```javascript
// 获取测试历史
GET /api/cdn-tester/history
// 返回: 历史测试记录列表

// 获取特定测试结果
GET /api/cdn-tester/result/:filename
// 参数: filename - 结果文件名
// 返回: 详细测试结果

// 删除测试结果
DELETE /api/cdn-tester/result/:filename
// 参数: filename - 结果文件名
```

### 报告和导出
```javascript
// 生成性能报告
GET /api/cdn-tester/report
GET /api/cdn-tester/report/:filename
// 返回: 性能分析报告

// 下载测试结果
GET /api/cdn-tester/download/:filename
// 返回: 测试结果文件下载
```

## 5. 注意事项

### 测试配置
- 测试会产生网络流量，建议在合适的网络环境下进行
- 并发测试数量有限制，避免对CDN服务造成压力
- 测试结果会保存在临时目录，定期清理历史数据

### 性能优化
- 使用并发控制避免过多同时请求
- 实时测试流适合长时间监控
- 批量测试适合一次性全面检测