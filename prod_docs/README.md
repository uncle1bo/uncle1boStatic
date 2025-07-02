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
│   └── styles.css      # 主样式文件
├── js/                 # JavaScript文件
│   ├── cdn-fallback.js # CDN资源管理器
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

### 核心功能

- **静态网站**：完整的静态网站文件，支持直接部署
- **多语言支持**：内置中英文国际化支持
- **响应式设计**：Bootstrap 5框架，适配所有设备
- **CDN资源管理**：智能CDN资源加载和故障转移
- **模板系统**：支持页面模板和动态内容替换
- **SEO优化**：包含sitemap.xml、robots.txt等SEO文件
- **Cloudflare优化**：针对Cloudflare Pages优化的配置

### 已实现功能列表

- **主页面**：响应式主页，支持多语言切换
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

2. **静态服务器**：
   ```bash
   # 使用任何静态服务器
   cd prod
   python -m http.server 8000
   # 或使用 serve
   npx serve .
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

#### 主题配置

编辑 `theme-config.json`：

```json
{
  "primaryColor": "#007bff",
  "secondaryColor": "#6c757d",
  "darkMode": true,
  "fontFamily": "system-ui"
}
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

### 前端JavaScript API

#### CDN资源管理器

```javascript
// 加载CDN资源
const cdnManager = new CDNFallbackManager();

// 单个资源加载
await cdnManager.loadResource('bootstrap-css');

// 带依赖的资源加载
await cdnManager.loadResourceWithDependencies('dataTables-bootstrap');

// 批量加载
await cdnManager.loadMultipleResourcesWithDependencies([
  'bootstrap-css',
  'bootstrap-js',
  'dataTables-bootstrap'
]);

// 获取依赖信息
const info = cdnManager.getDependencyInfo('dataTables-bootstrap');
console.log(info);
```

#### 国际化API

```javascript
// 获取翻译
const text = i18n.t('welcome.title');

// 切换语言
i18n.setLanguage('en');

// 获取当前语言
const currentLang = i18n.getCurrentLanguage();

// 检测浏览器语言
const detectedLang = i18n.detectLanguage();
```

#### 模板处理器

```javascript
// 处理模板变量
const processor = new TemplateProcessor();
const result = processor.process(template, variables);

// 加载模板文件
const template = await processor.loadTemplate('header.html');
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

#### 站点地图

```xml
<!-- sitemap.xml 自动生成 -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-01</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

## 5. 注意事项

### 部署注意事项

1. **文件完整性**：确保所有必要文件都包含在部署中
2. **路径配置**：检查所有资源路径是否正确
3. **CDN配置**：确认CDN资源可以正常访问
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

1. **资源加载失败**：检查CDN配置和网络连接
2. **语言切换异常**：验证语言文件路径和格式
3. **样式显示问题**：检查CSS文件加载和主题配置
4. **404错误**：确认页面路径和重定向配置