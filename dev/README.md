# Uncle1bo静态站点工具集

这是一个用于管理和生成静态站点的工具集，采用模块化设计，遵循权责分离和最小功能原则，将不同功能拆分到独立的服务模块和工具模块中。

## 工具列表

### 当前工具

- 站点地图更新器
- 目录编辑器
- 页面管理器

### 计划中的工具

- 图片优化工具
- 站点地图生成器
- 性能分析工具

## 安装和使用

### 安装依赖

```bash
npm install
```

### 启动工具

```bash
npm run dev
```

启动后，在浏览器中访问 http://localhost:3000 即可使用工具集。

## 使用方法

### 工具选择器

1. 访问主页 http://localhost:3000
2. 在工具卡片列表中选择需要使用的工具
3. 点击「使用此工具」按钮进入相应工具页面



## 生成的文件

工具会生成以下文件并复制到prod目录：

- HTML文件：`/prod/pages/{pageName}.html`
- 中文语言文件：`/prod/locales/zh-CN/{pageName}.json`
- 英文语言文件：`/prod/locales/en/{pageName}.json`

## 注意事项

- 页面名称只能包含字母、数字和连字符，不要使用空格和特殊字符
- 生成的页面会自动使用网站的样式和脚本
- 多语言支持文件需要手动编辑以提供更准确的翻译

## 项目结构

```
dev/
├── src/
│   ├── config/           # 配置文件
│   │   └── pathConfig.js # 路径配置
│   ├── services/         # 通用服务模块
│   │   ├── fileService.js       # 文件操作服务
│   │   ├── i18nService.js       # 多语言服务
│   │   ├── markdownService.js   # Markdown处理服务
│   │   └── templateService.js   # 模板处理服务
│   ├── tools/            # 工具集合
│   │   ├── sitemapUpdater/      # 站点地图更新工具
│   │   ├── menuEditor/          # 目录编辑器工具
│   │   └── pageManager/         # 页面管理器工具
│   ├── public/           # 静态资源
│   │   ├── css/          # 样式文件
│   │   └── js/           # 全站共用前端脚本
│   ├── uploads/          # 上传文件临时目录
│   ├── views/            # 视图模板
│   └── index.js          # 应用入口
├── temp/                 # 临时文件目录
└── package.json          # 项目配置
```

## 模块说明

### 服务模块

- **fileService**: 负责文件的读写和复制操作
- **i18nService**: 负责多语言文件的生成和处理
- **markdownService**: 负责Markdown内容的处理和转换
- **templateService**: 负责HTML模板的加载和处理

### 工具模块

- **sitemapUpdater**: 站点地图更新工具，自动扫描网站页面并生成符合标准的sitemap.xml文件
- **menuEditor**: 目录编辑器工具，管理网站的导航菜单结构
- **pageManager**: 页面管理器工具，用于管理网站页面，包括查看和删除页面