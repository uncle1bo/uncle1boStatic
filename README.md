# Uncle1bo 静态网站项目

[English](docs/README.en.md) | [简体中文](#)

这是一个功能完整的静态网站项目，使用Bootstrap框架构建，配备了完整的开发工具集，支持部署在Cloudflare Pages等静态托管平台上。

## 项目特色

- 🛠️ **完整的开发工具集**：包含站点地图更新器、目录编辑器、页面生成器、页面管理器和主题管理器
- 🌐 **多语言支持**：内置国际化支持，支持中英文切换
- 🎨 **主题定制**：可视化主题管理器，支持明亮/暗夜模式
- 📝 **Markdown支持**：页面生成器支持Markdown编写，自动转换为HTML
- 🔧 **模块化设计**：采用权责分离和最小功能原则的模块化架构
- 📱 **响应式设计**：适配所有设备的响应式布局

## 项目结构

```
uncle1boStatic/
├── README.md           # 项目说明文档（中文）
├── docs/               # 文档目录
│   └── README.en.md    # 项目说明文档（英文）
├── dev/                # 开发环境目录
│   ├── src/            # 源代码目录
│   │   ├── config/     # 配置文件
│   │   ├── services/   # 通用服务模块
│   │   ├── tools/      # 开发工具集
│   │   │   ├── sitemapUpdater/   # 站点地图更新器
│   │   │   ├── menuEditor/       # 目录编辑器
│   │   │   ├── pageGenerator/    # 页面生成器
│   │   │   ├── pageManager/      # 页面管理器
│   │   │   └── themeManager/     # 主题管理器
│   │   ├── public/     # 静态资源
│   │   ├── views/      # 视图模板
│   │   └── index.js    # 应用入口
│   └── package.json    # 开发工具依赖配置
├── prod/               # 生产环境目录
│   ├── index.html      # 主页面
│   ├── pages/          # 用户页面
│   ├── assets/         # 静态资源
│   │   ├── images/     # 图片资源
│   │   ├── fonts/      # 字体文件
│   │   └── icons/      # 图标文件
│   ├── css/            # CSS样式
│   │   └── styles.css  # 自定义样式
│   ├── js/             # 用户端JavaScript文件
│   │   ├── main.js     # 主JavaScript
│   │   ├── i18n.js     # 国际化支持
│   │   └── template-processor.js # 模板处理器
│   ├── locales/        # 语言资源
│   │   ├── en/         # 英文
│   │   └── zh-CN/      # 简体中文
│   ├── templates/      # 页面模板
│   │   ├── header.html # 头部模板
│   │   └── footer.html # 底部模板
│   ├── robots.txt      # 搜索引擎爬虫配置
│   ├── sitemap.xml     # 网站地图
│   ├── 404.html        # 404错误页面
│   ├── _headers        # 安全头配置
│   ├── .nojekyll       # 禁用GitHub Pages的Jekyll处理
│   └── _redirects      # 重定向配置
├── locall.bat          # 本地开发服务器启动脚本
├── server.js           # 生产环境服务器
├── package.json        # 项目依赖配置
└── package-lock.json   # 依赖版本锁定文件
```

## 技术栈

### 前端技术
- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- 响应式设计

### 后端技术
- Node.js
- Express.js
- EJS模板引擎
- Marked (Markdown解析)
- Multer (文件上传)

### 开发工具
- 模块化架构设计
- 文件系统操作 (fs-extra)
- 实时预览功能
- 多语言国际化支持

## 核心功能

### 🌐 网站功能
- 响应式设计，适用于所有设备
- 多语言支持（英文、简体中文）
- 快速加载和优化性能
- 自定义404错误页面
- 对搜索引擎友好
- 模板化页面结构

### 🚀 CDN竞争性备选功能

本项目已集成了先进的CDN竞争性备选功能，为所有外部资源提供多CDN源的自动切换和负载均衡，显著提升网站的加载速度、可靠性和全球访问性能。

#### 核心特性
- **多CDN源支持**: 每个资源配置多个备选CDN链接
- **自动故障切换**: 主CDN失败时自动切换到备选CDN
- **智能负载均衡**: 根据响应速度自动选择最佳CDN
- **偏好记忆**: 自动记住表现最佳的CDN并优先使用
- **超时保护**: 防止CDN响应过慢影响页面加载

#### 支持的CDN资源
- **Bootstrap框架**: jsDelivr, cdnjs, Staticfile等可靠CDN服务商
- **jQuery相关**: jsDelivr, Google CDN, Microsoft CDN, cdnjs
- **代码高亮 (Prism.js)**: jsDelivr, cdnjs
- **数学公式 (KaTeX)**: jsDelivr, cdnjs
- **图表库 (Mermaid)**: jsDelivr, cdnjs

#### 核心特性
- **并发竞速加载**: 多个CDN同时竞争，最快响应胜出
- **线程安全保护**: 防止重复加载和竞态条件
- **文件完整性校验**: 基础的文件大小和类型验证
- **智能故障转移**: 8秒超时，快速切换到备用CDN

#### 环境分离
- **生产环境** (`prod/`): 高性能并发CDN竞速机制
- **开发环境** (`dev/`): 完整的CDN网络性能检测工具

### 🛠️ 开发工具集
- **站点地图更新器**：自动扫描页面并生成sitemap.xml
- **CDN网络性能检测工具**：多线程并发测试和分析CDN资源的响应速度和可用性，支持SSL证书验证配置
- **目录编辑器**：可视化编辑导航菜单结构，支持拖拽排序
- **页面生成器**：支持Markdown编写，自动转换为HTML页面
- **页面管理器**：管理现有页面，支持查看和删除操作
- **主题管理器**：可视化主题配色编辑，支持明亮/暗夜模式切换

### 🎨 主题系统
- 可视化主题配色编辑
- 明亮/暗夜模式切换
- 实时预览效果
- 主题配置保存和重置
- 响应式主题适配

## 开始使用

### 前提条件

- Node.js (推荐版本 16.x 或更高)
- npm 或 yarn 包管理器
- 现代网络浏览器

### 快速开始

1. **克隆项目**：
   ```bash
   git clone https://github.com/yourusername/uncle1boStatic.git
   cd uncle1boStatic
   ```

2. **安装依赖**：
   ```bash
   # 安装主项目依赖
   npm install
   
   # 安装开发工具依赖
   cd dev
   npm install
   cd ..
   ```

3. **启动开发环境**：

   **方式一：使用开发工具集**
   ```bash
   cd dev
   npm run dev
   ```
   访问：`http://localhost:3000` (开发工具集)

   **方式二：预览生产站点**
   ```bash
   # 使用批处理文件
   locall.bat
   
   # 或使用npm命令
   npm start
   ```
   访问：`http://localhost:8000` (生产站点预览)

### 开发工具使用

1. 启动开发工具集后，访问 `http://localhost:3000`
2. 在工具选择页面中选择需要使用的工具：
   - **站点地图更新器**：更新sitemap.xml文件
   - **目录编辑器**：管理导航菜单结构
   - **页面生成器**：创建新页面（支持Markdown）
   - **页面管理器**：管理现有页面
   - **主题管理器**：自定义网站主题
3. 点击「使用此工具」进入相应工具页面

## 404页面配置

本项目包含自定义404错误页面，当用户访问不存在的页面时会自动重定向到此页面。

- 本地开发环境：使用http-server提供404页面支持
- Cloudflare Pages部署：通过`_redirects`文件配置404重定向规则

如果您使用其他托管服务，可能需要根据该服务的要求调整404页面配置。

## 部署

此项目设计为部署在Cloudflare Pages上，但可以托管在任何静态站点托管服务上。

### 部署到Cloudflare Pages

1. 将您的代码推送到GitHub存储库
2. 登录到您的Cloudflare仪表板
3. 转到Pages > 创建项目
4. 连接您的GitHub存储库
5. 配置您的构建设置：
   - 构建命令：（静态站点留空）
   - 构建输出目录：/（根目录）
6. 部署

## 高级功能

### 多语言支持

网站通过`i18n.js`模块支持多种语言。语言资源存储在`locales`目录中的JSON文件中。

**添加新语言**：
1. 在`prod/locales/`中创建新的语言代码目录
2. 从现有语言目录复制JSON文件
3. 翻译JSON文件中的值
4. 开发工具会自动为新页面生成多语言文件

### 页面模板系统

- 使用`prod/templates/`目录下的header.html和footer.html模板
- 支持模板变量替换和国际化标签
- 页面生成器自动集成模板到新页面
- 支持自定义模板变量和样式

### 主题定制

- 可视化编辑主题配色方案
- 支持明亮和暗夜两种模式
- 实时预览主题效果
- 主题配置自动保存
- 支持一键重置为默认主题

## 版本信息

- **当前版本**：v1.0.0
- **最后更新**：2024年12月
- **开发状态**：活跃开发中

### 更新日志

**v1.0.0 (2024-12)**
- ✅ 完整的开发工具集
- ✅ 站点地图更新器
- ✅ 目录编辑器（支持拖拽排序）
- ✅ 页面生成器（Markdown支持）
- ✅ 页面管理器
- ✅ 主题管理器（明亮/暗夜模式）
- ✅ 多语言国际化支持
- ✅ 响应式设计
- ✅ 模板系统

## 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

此项目根据GNU通用公共许可证v3（GPL v3）授权。详见 [LICENSE](LICENSE) 文件。

GPL v3是一个具有开源传染性（copyleft）的许可证，要求：
- 保留原作者署名
- 任何基于此项目的衍生作品必须同样使用GPL v3许可证
- 必须提供源代码
- 修改后的版本必须标明更改

## 致谢

- [Bootstrap](https://getbootstrap.com/) - 响应式前端框架
- [Express.js](https://expressjs.com/) - Web应用框架
- [Marked](https://marked.js.org/) - Markdown解析器
- [EJS](https://ejs.co/) - 模板引擎
- [Cloudflare Pages](https://pages.cloudflare.com/) - 静态站点托管