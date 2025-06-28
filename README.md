# Uncle1bo 静态网站项目

这是一个纯静态网站项目，使用Bootstrap框架构建，计划部署在Cloudflare Pages上。

## 项目结构

```
uncle1boStatic/
├── index.html          # 主页面
├── css/
│   └── styles.css      # 自定义样式
├── js/
│   └── main.js         # 自定义JavaScript
└── README.md           # 项目说明文档
```

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5.3.0

## 特性

- 响应式设计，适配各种设备尺寸
- 使用Bootstrap组件构建现代化UI
- 轻量级，加载速度快
- 易于扩展和维护

## 开发指南

### 本地开发

由于这是一个纯静态网站，你可以直接在浏览器中打开`index.html`文件进行预览。

对于更好的开发体验，你可以使用以下方法之一：

1. **使用Visual Studio Code的Live Server插件**
   - 安装Live Server插件
   - 右键点击`index.html`，选择「Open with Live Server」

2. **使用Python的HTTP服务器**
   ```
   # Python 3
   python -m http.server
   ```

3. **使用Node.js的http-server**
   ```
   # 安装http-server
   npm install -g http-server
   
   # 启动服务器
   http-server
   ```

### 添加新页面

1. 在根目录创建新的HTML文件，例如`about.html`
2. 复制`index.html`的基本结构
3. 修改内容以适应新页面的需求
4. 更新导航链接

### 样式定制

所有自定义样式都应该添加到`css/styles.css`文件中。Bootstrap的样式可以通过添加自定义类来覆盖。

### JavaScript功能扩展

所有自定义JavaScript功能都应该添加到`js/main.js`文件中。对于大型项目，可以考虑按功能模块拆分成多个JS文件。

## 部署指南

### Cloudflare Pages部署

1. 将代码推送到GitHub或GitLab仓库
2. 登录Cloudflare Dashboard
3. 进入Pages服务
4. 点击「Create a project」
5. 连接你的Git仓库
6. 设置以下部署配置：
   - 构建命令：留空（纯静态网站不需要构建）
   - 输出目录：留空或填写 `.`（表示根目录）
7. 点击「Save and Deploy」

## 最佳实践

- 使用语义化HTML标签
- 保持CSS类名一致性
- 优化图片和资源
- 定期更新依赖库
- 使用版本控制系统管理代码

## 许可证

[MIT](https://opensource.org/licenses/MIT)