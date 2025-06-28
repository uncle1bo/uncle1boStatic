# Uncle1bo静态站点工具集

这是一个用于管理和生成静态站点的工具集，目前包含页面生成器工具，未来将添加更多实用工具。

本工具集采用模块化设计，遵循权责分离和最小功能原则，将不同功能拆分到独立的服务模块和工具模块中。

## 工具列表

### 页面生成器

将Markdown内容转换为HTML页面的工具，具有以下功能：

- 支持直接输入Markdown内容或上传Markdown文件
- 自动将Markdown转换为HTML
- 自动添加网站头部和尾部模板
- 自动生成中文和英文的多语言支持文件
- 自动将生成的文件复制到prod目录

### 更多工具（开发中）

- 图片优化工具
- 站点地图生成器
- 性能分析工具

## 安装和使用

### 安装依赖

```bash
npm install
```

### 启动工具

```bash
npm run dev
```

启动后，在浏览器中访问 http://localhost:3000 即可使用工具集。

## 使用方法

### 工具选择器

1. 访问主页 http://localhost:3000
2. 在工具卡片列表中选择需要使用的工具
3. 点击「使用此工具」按钮进入相应工具页面

### 页面生成器

#### 直接输入Markdown内容

1. 在「直接输入」标签页中填写表单
2. 输入页面名称（必填，不包含.html后缀）
3. 输入页面标题（可选）
4. 输入页面描述（可选）
5. 在文本框中输入Markdown内容
6. 点击「转换并生成页面」按钮

#### 上传Markdown文件

1. 在「上传文件」标签页中填写表单
2. 输入页面名称（必填，不包含.html后缀）
3. 输入页面标题（可选）
4. 输入页面描述（可选）
5. 选择要上传的Markdown文件
6. 点击「上传并生成页面」按钮

## 生成的文件

工具会生成以下文件并复制到prod目录：

- HTML文件：`/prod/pages/{pageName}.html`
- 中文语言文件：`/prod/locales/zh-CN/{pageName}.json`
- 英文语言文件：`/prod/locales/en/{pageName}.json`

## 注意事项

- 页面名称只能包含字母、数字和连字符，不要使用空格和特殊字符
- 生成的页面会自动使用网站的样式和脚本
- 多语言支持文件需要手动编辑以提供更准确的翻译

## 项目结构

```
dev/
├── src/
│   ├── config/           # 配置文件
│   │   └── pathConfig.js # 路径配置
│   ├── services/         # 通用服务模块
│   │   ├── fileService.js       # 文件操作服务
│   │   ├── i18nService.js       # 多语言服务
│   │   ├── markdownService.js   # Markdown处理服务
│   │   └── templateService.js   # 模板处理服务
│   ├── tools/            # 工具集合
│   │   └── pageGenerator/       # 页面生成器工具
│   │       ├── index.js         # 工具入口点
│   │       ├── pageGeneratorService.js # 页面生成服务
│   │       ├── routes.js        # 路由处理
│   │       └── README.md        # 说明文档
│   ├── public/           # 静态资源
│   ├── uploads/          # 上传文件临时目录
│   ├── views/            # 视图模板
│   └── index.js          # 应用入口
├── temp/                 # 临时文件目录
└── package.json          # 项目配置
```

## 模块说明

### 服务模块

- **fileService**: 负责文件的读写和复制操作
- **i18nService**: 负责多语言文件的生成和处理
- **markdownService**: 负责Markdown内容的处理和转换
- **templateService**: 负责HTML模板的加载和处理

### 工具模块

- **pageGenerator**: 页面生成器工具，整合各种服务，完成页面生成的完整流程