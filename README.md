# Uncle1bo 静态网站项目

[English](docs/README.en.md) | [简体中文](docs/README.zh-CN.md)

这是一个纯静态网站项目，使用Bootstrap框架构建，计划部署在Cloudflare Pages上。

## 🔒 安全特性

本项目已实现**开发工具与用户内容分离**，确保生产环境的安全性：
- 所有开发工具已移至 `dev-tools/` 目录
- 生产部署时自动阻止访问开发工具
- 防止潜在的安全渗透和攻击

## 项目结构

```
uncle1boStatic/
├── index.html          # 主页面
├── pages/              # 用户页面
│   ├── about.html      # 关于页面
│   ├── services.html   # 服务页面
│   └── contact.html    # 联系我们页面
├── dev-tools/          # 🚨 开发工具目录（不部署到生产环境）
│   ├── page-generator.html     # 页面生成器界面
│   ├── server-page-generator.js # 服务器端脚本
│   ├── create-page.bat         # 命令行工具
│   └── examples/               # 示例文件
├── assets/             # 静态资源
│   ├── images/         # 图片资源
│   ├── fonts/          # 字体文件
│   └── icons/          # 图标文件
├── css/                # CSS样式
│   └── styles.css      # 自定义样式
├── js/                 # 用户端JavaScript文件
│   ├── main.js         # 主JavaScript
│   ├── i18n.js         # 国际化支持
│   └── template-processor.js # 模板处理器
├── locales/            # 语言资源
│   ├── en/             # 英文
│   ├── zh-CN/          # 简体中文

├── templates/          # 页面模板
│   ├── header.html     # 头部模板
│   └── footer.html     # 底部模板
├── docs/               # 文档
│   ├── README.en.md    # 英文README
├── DEPLOYMENT.md       # 🔒 安全部署指南
└── _headers            # 🔒 安全头配置（阻止访问dev-tools）
    
```

## 技术栈

- HTML5
- CSS3
- JavaScript
- Bootstrap 5

## 特性

- 响应式设计，适用于所有设备
- 多语言支持（英文、简体中文）
- 快速加载和优化性能
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

2. 安装依赖（推荐）：
   ```
   npm install
   ```

3. 启动本地开发服务器：
   - 使用npm脚本（推荐）：
     ```
     npm start
     ```
   - 或者直接运行包含的批处理文件（Windows）：
     ```
     start-server.bat
     ```
   - 启动页面生成器和开发工具：
     ```
     npm run dev
     ```
     或
     ```
     cd dev-tools
     start-page-generator.bat
     ```

4. 打开您的浏览器并导航至：
   - 主站：`http://localhost:8000`
   - 页面生成器：`http://localhost:8080/html/page-generator.html`（使用dev命令或start-page-generator.bat时）

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

此项目根据MIT许可证授权 - 有关详细信息，请参阅LICENSE文件。

## 致谢

- Bootstrap提供响应式框架
- Cloudflare Pages提供托管服务