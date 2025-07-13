# Uncle1bo 静态站点开发工具集

## 1. 项目结构

```
dev/
├── src/
│   ├── config/           # 配置文件
│   │   ├── pathConfig.js        # 路径配置
│   │   └── redirectConfig.js    # 重定向配置
│   ├── data/             # 数据文件
│   │   ├── pages/               # 页面数据
│   │   └── theme-config.json    # 主题配置
│   ├── services/         # 通用服务模块
│   │   ├── fileService.js       # 文件操作服务
│   │   ├── i18nService.js       # 多语言服务
│   │   ├── markdownService.js   # Markdown处理服务
│   │   └── templateService.js   # 模板处理服务
│   ├── tools/            # 工具集合
│   │   ├── assetManager/        # 资源管理器工具
│   │   ├── sitemapUpdater/      # 站点地图更新工具
│   │   ├── menuEditor/          # 目录编辑器工具
│   │   ├── pageGenerator/       # 页面生成器工具
│   │   ├── pageManager/         # 页面管理器工具
│   │   └── themeManager/        # 主题管理器工具
│   ├── public/           # 静态资源
│   ├── routes/           # 路由配置
│   ├── uploads/          # 上传文件临时目录
│   ├── views/            # 视图模板
│   └── index.js          # 应用入口
├── temp/                 # 临时文件目录
└── package.json          # 项目配置
```

## 2. 功能介绍

这是一个用于管理和生成静态站点的工具集，采用模块化设计，遵循权责分离和最小功能原则。

### 已实现功能列表

- **资源管理器**：集成外部资源管理和重定向功能，支持缺失资源检测、一键批量下载、完整性校验、版本管理和自动重定向规则管理 - [详细文档](src/tools/assetManager/README.md)
- **站点地图更新器**：自动扫描网站页面并生成符合标准的sitemap.xml文件 - [详细文档](src/tools/sitemapUpdater/README.md)
- **目录编辑器**：采用模块化架构的菜单编辑器，支持智能状态检测和拖拽排序 - [详细文档](src/tools/menuEditor/README.md)
- **页面生成器**：支持Markdown编写，自动转换为HTML页面，生成的页面存储在`prod/pages/generated/`目录 - [详细文档](src/tools/pageGenerator/README.md)
- **页面管理器**：管理网站页面，支持生成页面（可编辑）和静态页面（不可编辑）的统一管理 - [详细文档](src/tools/pageManager/README.md)
- **主题管理器**：可视化主题配色编辑，支持明亮/暗夜模式切换 - [详细文档](src/tools/themeManager/README.md)
- **文章黑白名单管理器**：管理文章显示过滤规则，支持黑名单和白名单功能，控制文章在预览页面的显示 - [详细文档](src/tools/articleFilterManager/README.md)

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
// 资源管理器
GET /api/asset-manager/scan
POST /api/asset-manager/download
POST /api/asset-manager/download-batch
GET /api/asset-manager/history
GET /api/asset-manager/404-resources
DELETE /api/asset-manager/404-resources
GET /api/asset-manager/redirect-rules
POST /api/asset-manager/redirect-rules
DELETE /api/asset-manager/redirect-rules/:ruleName
POST /api/asset-manager/test-redirect
GET /api/asset-manager/redirect-stats
PUT /api/asset-manager/redirect-config

// 站点地图更新器
POST /sitemap-updater/update

// 目录编辑器
GET /menu-editor/config
POST /menu-editor/update

// 页面生成器
POST /page-generator/create
POST /page-generator/upload

// 页面管理器
GET /page-manager/list
DELETE /page-manager/delete/:pageName
POST /page-manager/cleanup-preview

// 主题管理器
GET /api/theme/config
POST /api/theme/save
POST /api/theme/reset
POST /api/theme/preview

// 文章黑白名单管理器
GET /article-filter-manager/api/config
GET /article-filter-manager/api/pages
POST /article-filter-manager/api/config/update
POST /article-filter-manager/api/blacklist/add
POST /article-filter-manager/api/whitelist/add
DELETE /article-filter-manager/api/remove
POST /article-filter-manager/api/cleanup
```

## 5. 注意事项

### 依赖资源管理

⚠️ **重要警告**：必须等待依赖资源完全加载后再执行依赖这些资源的业务逻辑

#### 强制要求
- 必须使用依赖管理器，禁止硬编码资源链接
- 使用 `window.dependencyManager.loadResource(resourceKey)` 加载资源
- 配置主要源 + 至少2个备选源

#### 依赖资源加载时序规范
**所有页面必须遵循以下加载模式：**

```javascript
// 1. 创建全局Promise用于依赖资源加载
window.dependencyResourcesReady = Promise.all([
    window.dependencyManager.loadResource('bootstrap-js'),
    window.dependencyManager.loadResource('jquery')
    // 其他必需的依赖资源
]);

// 2. 等待DOM和依赖资源都加载完成
async function initializePage() {
  try {
    // 等待DOM加载完成
    await new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
    
    // 等待依赖资源加载完成
    await window.dependencyResourcesReady;
    
    // 检查关键库是否加载
    if (typeof $ === 'undefined') {
      console.warn('jQuery未加载，某些功能可能受限');
    }
    
    // 在这里执行业务逻辑和Bootstrap组件初始化
    
  } catch (error) {
    console.error('页面初始化失败:', error);
  }
}

// 3. 启动初始化
initializePage();
```

#### Bootstrap组件初始化规范
**禁止在依赖资源加载前直接实例化Bootstrap组件，必须使用延迟初始化：**

```javascript
// 错误方式 - 禁止使用
const modal = new bootstrap.Modal(document.getElementById('myModal'));

// 正确方式 - 延迟初始化
let modalInstance = null;

function getModal() {
  if (!modalInstance && typeof bootstrap !== 'undefined') {
    modalInstance = new bootstrap.Modal(document.getElementById('myModal'));
  }
  return modalInstance;
}

// 使用时
const modal = getModal();
if (modal) {
  modal.show();
}
```

#### 依赖资源违规检查和修复指导
**常见违规情况：**
1. 直接使用硬编码资源链接（如 `<link href="https://cdn.jsdelivr.net/...">`）
2. 未使用依赖管理器加载资源
3. 未遵循依赖资源加载时序规范
4. 直接实例化Bootstrap组件而不等待依赖加载

**修复步骤：**
1. 移除所有硬编码的资源链接
2. 使用依赖管理器：`window.dependencyManager.loadResource(resourceKey)`
3. 实现全局Promise等待机制：`window.dependencyResourcesReady`
4. 延迟初始化所有Bootstrap组件

#### 实时性能监控规范
**依赖资源健康监测系统：**
- 自动启用：页面加载后自动开始依赖资源健康监测
- 监测频率：每5分钟执行一次健康检查
- 性能数据：收集响应时间和可靠性数据
- 自适应优化：根据性能数据动态调整资源选择顺序
- 数据持久化：性能数据保存在localStorage中

**开发工具vs生产环境：**
- dev/tools/dependencyTester：开发阶段的手动测试工具
- prod/js/dependency-manager.js：生产环境的自动监控系统
- 避免重复：开发工具用于测试，生产系统用于实时监控

### 页面分离架构

- **生成页面**：由页面生成器创建，存储在 `prod/pages/generated/` 目录，支持编辑和删除
- **静态页面**：手写HTML页面，存储在 `prod/pages/static/` 目录，只支持查看，不可通过工具编辑
- **多语言文件**：按页面类型分别存储在 `prod/locales/{lang}/generated/` 和 `prod/locales/{lang}/static/` 目录
- **可编辑性判断**：基于页面文件位置自动判断，无需额外配置

### 资源管理规范

⚠️ **重要警告**：资源配置必须使用正确的格式

#### 资源配置格式要求
- **必须使用 `path` 属性**：资源配置对象必须包含 `path` 属性来指定本地文件路径
- **禁止使用 `localPath` 属性**：`localPath` 属性已完全废弃，不再支持
- **路径相对性**：所有路径都相对于项目根目录

#### 正确的配置示例
```javascript
'bootstrap-css': {
  type: 'css',
  path: 'assets/libs/bootstrap/bootstrap.min.css',  // 必须使用 path 属性
  integrity: null
}
```

#### 资源管理注意事项
- 下载前先备份重要文件
- 定期清理下载历史和404记录
- 谨慎使用强制下载选项
- 重定向规则测试后再启用
- 注意CDN资源的版本兼容性
- 下载大文件时请保持网络连接稳定
- 重定向规则的正则表达式需要谨慎编写，避免冲突
- 自定义重定向规则会覆盖内置规则，请注意优先级