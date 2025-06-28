# Uncle1bo 静态网站项目

[English](docs/README.en.md) | [简体中文](#)

这是一个纯静态网站项目，使用Bootstrap框架构建，计划部署在Cloudflare Pages上。

## 项目结构

```
uncle1boStatic/
├── README.md           # 项目说明文档（中文）
├── docs/               # 文档目录
│   └── README.en.md    # 项目说明文档（英文）
├── dev/                # 开发环境目录
├── prod/               # 生产环境目录
│   ├── index.html      # 主页面
│   ├── pages/          # 用户页面
│   │   ├── about.html  # 关于页面
│   │   ├── services.html # 服务页面
│   │   └── contact.html # 联系我们页面
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
│   ├── .gitignore      # Git忽略文件配置
│   └── _redirects      # 重定向配置
├── locall.bat          # 本地开发服务器启动脚本
├── package.json        # 项目依赖配置
└── package-lock.json   # 依赖版本锁定文件
```

## 技术栈

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Node.js (用于本地开发服务器)

## 特性

- 响应式设计，适用于所有设备
- 多语言支持（英文、简体中文）
- 快速加载和优化性能
- 自定义404错误页面
- 对搜索引擎友好

## 开始使用

### 前提条件

运行此项目不需要特殊的前提条件。您只需要一个现代的网络浏览器。

### 本地开发

1. 克隆存储库：
   ```
   git clone https://github.com/yourusername/uncle1boStatic.git
   cd uncle1boStatic
   ```

2. 安装依赖：
   ```
   npm install
   ```

3. 启动本地开发服务器：

   - 使用提供的批处理文件启动服务器：
     ```
     locall.bat
     ```
   - 或者直接使用npm命令：
     ```
     npm start
     ```

   - 浏览器将自动打开并导航至：`http://localhost:8000`

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

## 多语言支持

网站通过`i18n.js`模块支持多种语言。语言资源存储在`locales`目录中的JSON文件中。

要添加新语言：

1. 在`locales/`中创建一个带有语言代码的新目录
2. 从现有语言目录复制JSON文件
3. 翻译JSON文件中的值

## 贡献

欢迎贡献！请随时提交拉取请求。

## 许可证

此项目根据MIT许可证授权，如package.json中所声明。

## 致谢

- Bootstrap提供响应式框架
- Cloudflare Pages提供托管服务