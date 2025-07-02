# Uncle1bo 静态网站项目

[English](docs/README.en.md) | [简体中文](#)

## 1. 项目结构

```
uncle1boStatic/
├── README.md           # 项目说明文档
├── docs/               # 文档目录
├── dev/                # 开发环境目录
│   ├── src/            # 源代码目录
│   │   ├── tools/      # 开发工具集
│   │   │   ├── sitemapUpdater/   # 站点地图更新器
│   │   │   ├── menuEditor/       # 目录编辑器
│   │   │   ├── pageGenerator/    # 页面生成器
│   │   │   ├── pageManager/      # 页面管理器
│   │   │   └── themeManager/     # 主题管理器
│   │   ├── config/     # 配置文件
│   │   ├── services/   # 通用服务模块
│   │   ├── public/     # 静态资源
│   │   ├── views/      # 视图模板
│   │   └── index.js    # 应用入口
│   └── package.json    # 开发工具依赖配置
├── prod/               # 生产环境目录
│   ├── index.html      # 主页面
│   ├── pages/          # 用户页面
│   ├── assets/         # 静态资源
│   ├── css/            # CSS样式
│   ├── js/             # JavaScript文件
│   ├── locales/        # 语言资源
│   ├── templates/      # 页面模板
│   ├── robots.txt      # 搜索引擎配置
│   ├── sitemap.xml     # 网站地图
│   └── 404.html        # 404错误页面
├── server.js           # 生产环境服务器
└── package.json        # 项目依赖配置
```

## 2. 功能介绍

这是一个功能完整的静态网站项目，使用Bootstrap框架构建，配备了完整的开发工具集，支持部署在Cloudflare Pages等静态托管平台上。

### 已实现功能列表

- **站点地图更新器**：自动扫描页面并生成sitemap.xml
- **目录编辑器**：可视化编辑导航菜单结构，支持拖拽排序
- **页面生成器**：支持Markdown编写，自动转换为HTML页面
- **页面管理器**：管理现有页面，支持查看和删除操作
- **主题管理器**：可视化主题配色编辑，支持明亮/暗夜模式切换
- **多语言支持**：内置国际化支持，支持中英文切换
- **响应式设计**：适配所有设备的响应式布局
- **CDN资源管理**：智能CDN资源管理系统，多CDN源自动切换
- **模板系统**：支持页面模板和变量替换

## 3. 用户使用方法

### 快速开始

1. **环境要求**：Node.js 16.x+、npm
2. **安装依赖**：
   ```bash
   npm install && cd dev && npm install
   ```
3. **启动服务**：
   - 开发工具：`cd dev && npm run dev` → http://localhost:3000
   - 生产预览：`npm start` → http://localhost:8000

### 开发工具使用

详细使用方法请参考各工具的README文档：

- [开发工具集总览](dev/README.md)
- [站点地图更新器](dev/src/tools/sitemapUpdater/README.md)
- [目录编辑器](dev/src/tools/menuEditor/README.md)
- [页面生成器](dev/src/tools/pageGenerator/README.md)
- [页面管理器](dev/src/tools/pageManager/README.md)
- [主题管理器](dev/src/tools/themeManager/README.md)

### Cloudflare Pages 部署

1. **准备部署**
   - 确保 `prod/` 目录包含所有必要文件
   - 检查 `_headers` 和 `_redirects` 配置

2. **连接仓库**
   - 登录 [Cloudflare Pages](https://pages.cloudflare.com/)
   - 连接你的 GitHub/GitLab 仓库

3. **配置构建**
   - 构建命令：留空（静态文件）
   - 构建输出目录：`prod`
   - 根目录：`/`

4. **环境变量**（可选）
   ```
   NODE_VERSION=16
   ```

5. **自定义域名**
   - 在 Cloudflare Pages 控制台添加自定义域名
   - 配置 DNS 记录指向 Cloudflare

6. **部署完成**
   - 每次推送到主分支自动部署
   - 支持预览分支部署

## 4. API使用方法

### 开发工具API

所有开发工具通过Express.js提供RESTful API接口，基础URL：`http://localhost:3000`

详细API文档请参考：
- [开发工具集API文档](dev/README.md#4-api使用方法)
- 各工具的README文档中的API部分

### 核心API概览

```javascript
// CDN资源管理
cdnManager.loadResource('bootstrap-css');

// 国际化
i18n.t('key');
i18n.setLanguage('en');

// 开发工具API示例
POST /api/sitemap/update    // 更新站点地图
GET /api/menu               // 获取菜单结构
POST /api/pages/create      // 创建页面
GET /api/pages              // 获取页面列表
POST /api/theme/save        // 保存主题
```