# 文章黑白名单管理器

## 1. 项目结构

```
articleFilterManager/
├── index.js                    # 路由和API处理
├── articleFilterService.js     # 服务层逻辑
├── views/
│   └── articleFilterManager.ejs # 前端界面
└── README.md                   # 说明文档
```

## 2. 功能介绍

文章黑白名单管理器是一个用于管理文章显示过滤规则的工具，支持黑名单和白名单功能。

### 已实现功能列表

- **页面列表显示**：显示所有generated和static目录下的页面
- **黑名单管理**：将generated目录的文章加入黑名单，使其不在文章预览页面显示
- **白名单管理**：将static目录的文章加入白名单，使其在文章预览页面显示
- **拖拽操作**：支持通过拖拽将文章在不同列表间移动
- **批量操作**：支持批量添加/移除文章到黑白名单
- **实时预览**：修改后可立即在文章预览页面查看效果
- **配置同步**：自动同步配置到生产环境

## 3. 用户使用方法

### 访问黑白名单管理器
1. 启动开发服务器
2. 访问 `http://localhost:3000/article-filter-manager`

### 黑白名单操作
1. **查看所有页面** - 在左侧面板查看所有可用页面
2. **添加到黑名单** - 将generated页面拖拽到黑名单区域或点击按钮
3. **添加到白名单** - 将static页面拖拽到白名单区域或点击按钮
4. **移除规则** - 从黑白名单中移除文章
5. **切换列表** - 在黑名单和白名单之间转换文章
6. **保存配置** - 点击保存按钮应用更改

## 4. API使用方法

### 黑白名单配置管理
```javascript
// 获取当前黑白名单配置
GET /article-filter-manager/api/config
// 返回: 黑白名单配置数据

// 更新黑白名单配置
POST /article-filter-manager/api/config/update
{
  "blacklist": ["article1", "article2"],
  "whitelist": ["static1", "static2"]
}
// 返回: 更新结果
```

### 页面列表获取
```javascript
// 获取所有页面列表
GET /article-filter-manager/api/pages
// 返回: 包含generated和static页面的完整列表
```

### 单个操作
```javascript
// 添加到黑名单
POST /article-filter-manager/api/blacklist/add
{
  "articles": ["article1", "article2"]
}

// 添加到白名单
POST /article-filter-manager/api/whitelist/add
{
  "articles": ["static1", "static2"]
}

// 从黑白名单中移除
DELETE /article-filter-manager/api/remove
{
  "articles": ["article1", "static1"]
}

// 清理已删除页面的过滤规则
POST /article-filter-manager/api/cleanup
```

## 5. 注意事项

### 黑白名单规则
- **黑名单**：仅适用于generated目录的文章，即使文章存在也不会在预览页面显示
- **白名单**：仅适用于static目录的文章，允许这些文章在预览页面显示
- **优先级**：黑名单优先级高于白名单，同一文章不能同时存在于两个列表中

### 操作限制
- generated页面只能加入黑名单，不能加入白名单
- static页面只能加入白名单，不能加入黑名单
- 配置更改后需要刷新文章预览页面才能看到效果
- 删除页面时会自动从黑白名单中移除

### 配置文件
- 配置文件位置：`prod/article-filters.json`
- 自动备份：每次更新前会自动备份原配置
- 格式验证：保存前会验证配置文件格式的正确性