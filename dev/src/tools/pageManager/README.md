# 页面管理器

## 1. 项目结构

```
pageManager/
├── index.js          # 路由和API处理
├── views/
│   └── pageManager.ejs # 前端界面
└── README.md         # 说明文档
```

## 2. 功能介绍

页面管理器是一个用于管理网站页面的工具，提供页面查看、编辑、删除等功能。

### 已实现功能列表

- 页面列表查看和搜索
- 页面内容编辑（支持Markdown）
- 页面删除功能（带确认提示）
- 多语言支持管理
- 实时预览功能
- 批量操作支持
- 页面状态管理
- 自动临时文件清理

## 3. 用户使用方法

### 访问页面管理器
1. 启动开发服务器
2. 访问 `http://localhost:3000/page-manager`

### 页面管理操作
1. **查看页面列表** - 在主界面查看所有已创建的页面
2. **搜索页面** - 使用搜索功能快速定位特定页面
3. **编辑页面** - 点击编辑按钮修改页面内容
4. **预览页面** - 实时预览页面效果
5. **删除页面** - 删除不需要的页面（需确认）
6. **管理多语言** - 分别管理中英文版本的页面内容

## 4. API使用方法

### 页面列表管理
```javascript
// 获取页面列表
GET /page-manager/list
// 返回: 页面列表数据
```

### 页面内容操作
```javascript
// 删除页面
DELETE /page-manager/delete/:pageName
// 返回: 删除结果

// 清理预览文件
POST /page-manager/cleanup-preview
// 返回: 清理结果
```

### 注意事项

- 删除页面前会有确认提示
- 编辑页面支持完整的Markdown语法
- 多语言页面需要分别管理
- 系统会自动清理临时文件