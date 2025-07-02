# 主题管理器

## 1. 项目结构

```
themeManager/
├── index.js          # 路由和API处理
├── views/
│   └── themeManager.ejs # 前端界面
└── README.md         # 说明文档
```

## 2. 功能介绍

主题管理器是一个用于实时预览和调整网站视觉主题的工具。

### 已实现功能列表

- 实时预览主题效果
- 颜色配置调整（主色调、背景色、文字颜色等）
- 明暗模式切换
- 主题配置保存和加载
- 响应式设计支持
- 主题重置功能
- 配置导入导出
- 预设主题模板

## 3. 用户使用方法

### 访问主题管理器
1. 启动开发服务器
2. 访问 `http://localhost:3000/theme-manager`

### 主题调整流程
1. **选择颜色配置** - 使用颜色选择器调整各种颜色
2. **实时预览** - 在预览区域查看效果
3. **模式切换** - 在明暗模式间切换
4. **保存配置** - 确认效果后保存主题
5. **应用主题** - 将主题应用到整个网站

### 可配置的颜色选项
- **主色调** - 网站的主要品牌色
- **背景色** - 页面背景颜色
- **文字颜色** - 主要文本颜色
- **链接颜色** - 超链接颜色
- **边框颜色** - 元素边框颜色
- **按钮颜色** - 按钮背景和文字颜色
- **导航栏颜色** - 导航栏背景和文字颜色

## 4. API使用方法

### 主题配置管理
```javascript
// 获取当前主题配置
GET /api/theme/config
// 返回: 当前主题配置数据

// 更新主题配置
POST /api/theme/config
{
  "primaryColor": "#007bff",
  "backgroundColor": "#ffffff",
  "textColor": "#333333",
  "mode": "light"
}
// 返回: 更新结果
```

### 主题操作
```javascript
// 重置主题到默认设置
POST /api/theme/reset
// 返回: 重置结果

// 应用主题到网站
POST /api/theme/apply
{
  "themeConfig": {...}
}
// 返回: 应用结果
```

### 预设主题
```javascript
// 获取预设主题列表
GET /api/theme/presets
// 返回: 预设主题列表

// 加载预设主题
POST /api/theme/load-preset
{
  "presetName": "dark-theme"
}
// 返回: 加载结果
```

### 配置导入导出
```javascript
// 导出主题配置
GET /api/theme/export
// 返回: 主题配置文件

// 导入主题配置
POST /api/theme/import
// multipart/form-data 配置文件
// 返回: 导入结果
```

### 注意事项

- 主题更改会影响整个网站外观
- 建议在测试环境中调试主题
- 保存前请确认预览效果
- 支持撤销和重做操作