# Uncle1bo 静态网站项目

这是一个纯静态网站项目，使用Bootstrap框架构建，计划部署在Cloudflare Pages上。

## 项目结构

```
uncle1boStatic/
├── index.html          # 主页面
├── pages/              # 其他页面
│   ├── about.html      # 关于页面
│   ├── services.html   # 服务页面
│   └── contact.html    # 联系我们页面
├── assets/             # 静态资源
│   ├── images/         # 图片资源
│   ├── fonts/          # 字体文件
│   └── icons/          # 图标文件
├── css/                # CSS样式
│   └── styles.css      # 自定义样式
├── js/                 # JavaScript文件
│   ├── main.js         # 主JavaScript
│   └── i18n.js         # 国际化支持
├── locales/            # 语言资源
│   ├── en/             # 英文
│   ├── zh-CN/          # 简体中文

└── docs/               # 文档
    ├── README.en.md    # 英文README

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

2. 启动本地开发服务器：
   - 如果您安装了Python：
     ```
     python -m http.server
     ```
   - 如果您安装了Node.js：
     ```
     npx http-server
     ```
   - 或者直接运行包含的批处理文件（Windows）：
     ```
     start-server.bat
     ```

3. 打开您的浏览器并导航至：
   - Python：`http://localhost:8000`
   - Node.js：`http://localhost:8080`

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