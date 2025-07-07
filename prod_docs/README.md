# 生产环境文档

[返回主文档](../README.md)

## 1. 项目结构

```
prod/
├── index.html          # 主页面
├── pages/              # 用户页面
│   ├── generated/      # 页面生成器生成的页面
│   └── static/         # 手写的静态页面
├── assets/             # 静态资源
│   ├── fonts/          # 字体文件
│   ├── icons/          # 图标文件
│   └── images/         # 图片资源
├── css/                # CSS样式
│   ├── styles.css      # 主样式文件（全站通用）
│   ├── index.css       # 首页私人样式
│   └── pages/          # 页面专用CSS目录
│       ├── generated/  # 生成页面的私人CSS
│       └── static/     # 静态页面的私人CSS
├── js/                 # JavaScript文件
│   ├── dependency-manager.js # 依赖资源管理器
│   ├── i18n.js         # 国际化支持
│   ├── main.js         # 主脚本
│   └── template-processor.js # 模板处理器
├── locales/            # 语言资源
│   ├── en/             # 英文语言包
│   │   ├── generated/  # 生成页面的语言文件
│   │   └── static/     # 静态页面的语言文件
│   └── zh-CN/          # 中文语言包
│       ├── generated/  # 生成页面的语言文件
│       └── static/     # 静态页面的语言文件
├── templates/          # 页面模板
│   ├── footer.html     # 页脚模板
│   └── header.html     # 页头模板
├── robots.txt          # 搜索引擎配置
├── sitemap.xml         # 网站地图
├── 404.html            # 404错误页面
├── _headers            # Cloudflare Headers配置
├── _redirects          # Cloudflare重定向配置
├── .nojekyll           # 禁用Jekyll处理
└── theme-config.json   # 主题配置文件
```

## 2. 功能介绍

这是项目的生产环境目录，包含所有部署到静态托管平台的文件。所有文件都经过优化，适合直接部署。

### 已实现功能列表

- **主页面**：响应式主页，支持多语言切换
- **代码雨效果**：首页动态代码雨背景特效，增强视觉体验
- **页面系统**：支持生成页面和静态页面
- **资源管理**：优化的CSS、JS和静态资源
- **国际化**：完整的多语言支持系统
- **主题系统**：可配置的主题颜色和样式
- **SEO支持**：搜索引擎优化配置
- **错误处理**：自定义404页面

## 3. 用户使用方法

### 直接访问

生产环境文件可以直接在Web服务器上运行：

1. **本地预览**：
   ```bash
   # 在项目根目录运行
   npm start
   # 访问 http://localhost:8000
   ```
  
### 部署到托管平台

#### Cloudflare Pages

1. **自动部署**：
   - 连接GitHub/GitLab仓库
   - 构建输出目录设置为 `prod`
   - 每次推送自动部署

2. **手动部署**：
   - 上传 `prod/` 目录下的所有文件
   - 确保包含 `_headers` 和 `_redirects` 文件

#### 其他平台

- **Netlify**：拖拽 `prod/` 目录到Netlify
- **Vercel**：连接仓库，设置输出目录为 `prod`
- **GitHub Pages**：推送 `prod/` 内容到 `gh-pages` 分支

### 自定义配置

#### CSS文件使用指导

**CSS文件结构说明：**

1. **styles.css**：全站通用样式，包含主题变量、Bootstrap覆盖、Markdown样式等
2. **common.css**：非自动化主题配置样式，用于头尾模板的固定样式配置
3. **index.css**：首页专用样式，用于index.html的特定样式需求，包含代码雨效果样式
4. **pages/generated/**：存放页面生成器生成页面的私人CSS文件
5. **pages/static/**：存放手写静态页面的私人CSS文件

**使用方法：**

```html
<!-- 在HTML页面中引用CSS文件 -->
<!-- 全站通用样式（必须） -->
<link rel="stylesheet" href="css/styles.css">
<!-- 非自动化主题配置样式（头尾模板自动引用） -->
<link rel="stylesheet" href="css/common.css">

<!-- 首页专用样式（仅index.html使用） -->
<link rel="stylesheet" href="css/index.css">

<!-- 页面专用样式（根据需要） -->
<link rel="stylesheet" href="css/pages/static/about.css">
<link rel="stylesheet" href="css/pages/generated/article.css">
```

**注意事项：**
- styles.css由主题管理器自动生成，请勿直接修改
- common.css用于非自动化主题配置，可手动编辑，已在header.html模板中自动引用
- 页面专用CSS文件按需创建，命名与页面文件对应
- 保持CSS文件结构清晰，避免样式冲突

#### 代码雨效果配置

**功能说明：**
首页包含动态代码雨背景特效，使用纯CSS和JavaScript实现，无需外部依赖。

**技术实现：**
- CSS动画：使用`@keyframes char-fall`定义字符下落动画
- JavaScript控制：动态创建和管理代码字符元素
- 性能优化：自动清理完成动画的DOM元素
- 响应式设计：根据屏幕宽度自适应字符列数

**自定义配置：**
```javascript
// 在index.html中可调整以下参数
const chars = 'uncle1bo0./*-#@!$%^&'.split(''); // 字符集
const columns = Math.floor(window.innerWidth / 20); // 列数计算
setInterval(createChar, 200); // 字符生成频率（毫秒）
```

**样式自定义：**
```css
.code-char {
  color: rgba(25, 135, 84, 0.8); /* 字符颜色 */
  font-size: 14px; /* 基础字体大小 */
  text-shadow: 0 0 5px rgba(25, 135, 84, 0.5); /* 发光效果 */
}
```

**表面色应用规范：**
- 表面色主要用于页脚背景（区别于主背景）
- 页眉背景（已在common.css中实现）
- 下拉菜单背景（已在common.css中实现）
- 使用现有CSS变量，保持主题一致性

#### 主题配置

禁止直接编辑 `theme-config.json`，它由dev的主题管理器自动生成，详情参考主题管理器文档,具体路径请在[dev环境文档中寻找](dev/README.md)
```

#### 语言配置

在 `locales/` 目录下添加新的语言包：

```
locales/
├── en/
├── zh-CN/
└── fr/          # 新增法语支持
    ├── generated/
    └── static/
```

## 4. API使用方法

#### 国际化API

```javascript
// 初始化多语言支持
await window.i18n.initI18n();
// 或指定页面名称
await window.i18n.initI18n('about');

// 切换语言
await window.i18n.setLanguage('en');

// 获取当前语言
const currentLang = window.i18n.getCurrentLanguage();

// 获取翻译文本
const text = window.i18n.getTranslation('meta.title', '默认值');

// 加载语言资源
await window.i18n.loadLanguageResources('en', 'about');

// 应用翻译到页面
window.i18n.applyTranslations(translations);

// 合并翻译对象
const merged = window.i18n.mergeTranslations(common, page);
```

#### 模板处理器API

```javascript
// 加载所有模板（头部和底部）
await window.templateProcessor.loadTemplates();

// 获取当前页面信息
const pageInfo = window.templateProcessor.getPageInfo();
// 返回对象包含：pageName, isRoot, rootPath, cssPath, jsPath, homeActive等
```

#### 依赖管理器API

```javascript
// 加载单个资源
await window.dependencyManager.loadResource('bootstrap-css');

// 批量加载资源
await window.dependencyManager.loadResources(['bootstrap-css', 'bootstrap-js']);

// 检查资源是否已加载
const isLoaded = window.dependencyManager.isResourceLoaded('jquery');

// 获取所有可用资源
const resources = window.dependencyManager.getAvailableResources();

// 添加新资源配置
window.dependencyManager.addResource('custom-lib', {
  type: 'js',
  path: 'assets/libs/custom/custom.min.js',
  dependencies: ['jquery']
});

// 切换主题资源
await window.dependencyManager.switchThemeResource('prism-theme-css', 'assets/libs/prism/themes/prism-dark.min.css');

// 等待DOM元素准备就绪
const element = await window.dependencyManager.waitForElement('.my-element');
```

### 配置文件API

#### 主题配置

```javascript
// 读取主题配置
fetch('/theme-config.json')
  .then(response => response.json())
  .then(config => {
    // 应用主题配置
    applyTheme(config);
  });
```
## 5. 注意事项

### 部署注意事项

1. **文件完整性**：确保所有必要文件都包含在部署中
2. **路径配置**：检查所有资源路径是否正确
3. **依赖配置**：确认依赖资源可以正常访问
4. **语言文件**：验证所有语言包文件完整

### 性能优化

1. **资源压缩**：CSS和JS文件已经过压缩
2. **图片优化**：使用适当的图片格式和大小
3. **缓存策略**：配置适当的缓存头
4. **CDN使用**：利用CDN加速资源加载

### 安全考虑

1. **内容安全策略**：配置适当的CSP头
2. **HTTPS强制**：确保使用HTTPS协议
3. **敏感信息**：不要在前端代码中包含敏感信息
4. **依赖安全**：定期检查第三方依赖的安全性

### 维护建议

1. **定期更新**：保持依赖库的最新版本
2. **监控性能**：使用工具监控网站性能
3. **备份数据**：定期备份重要配置和内容
4. **测试验证**：部署前进行充分测试

### 常见问题

1. **资源加载失败**：检查本地文件是否存在，
2. **语言切换异常**：验证语言文件路径和格式
3. **样式显示问题**：检查CSS文件加载和主题配置
4. **404错误**：确认页面路径和重定向配置