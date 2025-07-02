# Uncle1bo 静态站点开发工具集

## 1. 项目结构

```
dev/
├── src/
│   ├── config/           # 配置文件
│   ├── services/         # 通用服务模块
│   │   ├── fileService.js       # 文件操作服务
│   │   ├── i18nService.js       # 多语言服务
│   │   ├── markdownService.js   # Markdown处理服务
│   │   └── templateService.js   # 模板处理服务
│   ├── tools/            # 工具集合
│   │   ├── sitemapUpdater/      # 站点地图更新工具
│   │   ├── menuEditor/          # 目录编辑器工具
│   │   ├── pageGenerator/       # 页面生成器工具
│   │   ├── pageManager/         # 页面管理器工具
│   │   └── themeManager/        # 主题管理器工具
│   ├── public/           # 静态资源
│   ├── uploads/          # 上传文件临时目录
│   ├── views/            # 视图模板
│   └── index.js          # 应用入口
├── temp/                 # 临时文件目录
└── package.json          # 项目配置
```

## 2. 功能介绍

这是一个用于管理和生成静态站点的工具集，采用模块化设计，遵循权责分离和最小功能原则。

### 已实现功能列表

- **站点地图更新器**：自动扫描网站页面并生成符合标准的sitemap.xml文件
- **目录编辑器**：采用模块化架构的菜单编辑器，支持智能状态检测和拖拽排序
- **页面生成器**：支持Markdown编写，自动转换为HTML页面，生成的页面存储在`prod/pages/generated/`目录
- **页面管理器**：管理网站页面，支持生成页面（可编辑）和静态页面（不可编辑）的统一管理
- **主题管理器**：可视化主题配色编辑，支持明亮/暗夜模式切换

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
// 站点地图更新器
POST /api/sitemap/update

// 目录编辑器
GET /api/menu
POST /api/menu/update

// 页面生成器
POST /api/pages/create
POST /api/upload

// 页面管理器
GET /api/pages
DELETE /api/pages/:filename

// 主题管理器
GET /api/theme
POST /api/theme/save
```

## 5. 注意事项

### CDN资源管理

⚠️ **重要警告**：必须等待CDN资源完全加载后再执行依赖这些资源的业务逻辑

#### 强制要求
- 必须使用CDN管理器，禁止硬编码CDN链接
- 使用 `window.cdnManager.loadResource(resourceKey)` 加载资源
- 配置主CDN + 至少2个备选CDN

#### CDN资源加载时序规范
**所有页面必须遵循以下加载模式：**

```javascript
// 1. 创建全局Promise用于CDN资源加载
window.cdnResourcesReady =Promise.all([
    window.cdnManager.loadResource('bootstrap-js'),
    window.cdnManager.loadResource('jquery')
])// 其他必需的CDN资源
]);

// 2. 等待DOM和CDN资源都加载完成
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
    
    // 等待CDN资源加载完成
    await window.cdnResourcesReady;
    
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
**禁止在CDN资源加载前直接实例化Bootstrap组件，必须使用延迟初始化：**

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

#### CDN违规检查和修复指导
**常见违规情况：**
1. 直接使用硬编码CDN链接（如 `<link href="https://cdn.jsdelivr.net/...">`）
2. 未使用CDN管理器加载资源
3. 未遵循CDN资源加载时序规范
4. 直接实例化Bootstrap组件而不等待CDN加载

**修复步骤：**
1. 移除所有硬编码的CDN链接
2. 使用CDN管理器：`window.cdnManager.loadResource(resourceKey)`
3. 实现全局Promise等待机制：`window.cdnResourcesReady`
4. 延迟初始化所有Bootstrap组件

#### 实时性能监控规范
**CDN健康监测系统：**
- 自动启用：页面加载后自动开始CDN健康监测
- 监测频率：每5分钟执行一次健康检查
- 性能数据：收集响应时间和可靠性数据
- 自适应优化：根据性能数据动态调整CDN选择顺序
- 数据持久化：性能数据保存在localStorage中

**开发工具vs生产环境：**
- dev/tools/cdnTester：开发阶段的手动测试工具
- prod/js/cdn-fallback.js：生产环境的自动监控系统
- 避免重复：开发工具用于测试，生产系统用于实时监控

### 页面分离架构

- **生成页面**：由页面生成器创建，存储在 `prod/pages/generated/` 目录，支持编辑和删除
- **静态页面**：手写HTML页面，存储在 `prod/pages/static/` 目录，只支持查看，不可通过工具编辑
- **多语言文件**：按页面类型分别存储在 `prod/locales/{lang}/generated/` 和 `prod/locales/{lang}/static/` 目录
- **可编辑性判断**：基于页面文件位置自动判断，无需额外配置