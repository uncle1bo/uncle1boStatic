# Uncle1bo 静态站点开发工具集

## 1. 项目结构

```
dev/
├── src/
│   ├── config/           # 配置文件
│   ├── services/         # 通用服务模块
│   │   ├── fileService.js       # 文件操作服务
│   │   ├── i18nService.js       # 多语言服务
│   │   ├── markdownService.js   # Markdown处理服务
│   │   └── templateService.js   # 模板处理服务
│   ├── tools/            # 工具集合
│   │   ├── sitemapUpdater/      # 站点地图更新工具
│   │   ├── menuEditor/          # 目录编辑器工具
│   │   ├── pageGenerator/       # 页面生成器工具
│   │   ├── pageManager/         # 页面管理器工具
│   │   └── themeManager/        # 主题管理器工具
│   ├── public/           # 静态资源
│   ├── uploads/          # 上传文件临时目录
│   ├── views/            # 视图模板
│   └── index.js          # 应用入口
├── temp/                 # 临时文件目录
└── package.json          # 项目配置
```

## 2. 功能介绍

这是一个用于管理和生成静态站点的工具集，采用模块化设计，遵循权责分离和最小功能原则。

### 已实现功能列表

- **站点地图更新器**：自动扫描网站页面并生成符合标准的sitemap.xml文件
- **目录编辑器**：管理网站的导航菜单结构，支持拖拽排序
- **页面生成器**：支持Markdown编写，自动转换为HTML页面
- **页面管理器**：管理网站页面，包括查看和删除页面
- **主题管理器**：可视化主题配色编辑，支持明亮/暗夜模式切换

## 3. 用户使用方法

### 安装依赖

```bash
npm install
```

### 启动服务

```bash
npm run dev
```

### 访问工具集

1. 启动后访问 `http://localhost:3000`
2. 在工具卡片列表中选择需要使用的工具
3. 点击进入相应工具页面进行操作

### 注意事项

- 页面名称只能包含字母、数字和连字符
- 生成的页面会自动使用网站的样式和脚本
- 多语言支持文件需要手动编辑以提供准确翻译

## 4. API使用方法

### 服务模块API

#### fileService
```javascript
const fileService = require('./services/fileService');

// 读取文件
fileService.readFile(filePath);

// 写入文件
fileService.writeFile(filePath, content);

// 复制文件
fileService.copyFile(source, destination);
```

#### i18nService
```javascript
const i18nService = require('./services/i18nService');

// 生成多语言文件
i18nService.generateI18nFiles(pageData);

// 处理翻译
i18nService.processTranslation(content, language);
```

#### markdownService
```javascript
const markdownService = require('./services/markdownService');

// 转换Markdown为HTML
markdownService.convertToHtml(markdownContent);

// 处理Markdown文件
markdownService.processMarkdownFile(filePath);
```

#### templateService
```javascript
const templateService = require('./services/templateService');

// 加载模板
templateService.loadTemplate(templateName);

// 处理模板变量
templateService.processTemplate(template, variables);
```

### 工具模块路由

```javascript
// 站点地图更新器
POST /api/sitemap/update

// 目录编辑器
GET /api/menu
POST /api/menu/update

// 页面生成器
POST /api/pages/create
POST /api/upload

// 页面管理器
GET /api/pages
DELETE /api/pages/:filename

// 主题管理器
GET /api/theme
POST /api/theme/save
```