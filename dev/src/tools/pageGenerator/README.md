# 页面生成器工具

页面生成器是一个用于创建新网站页面的工具，它提供了完整的页面创建流程，包括多语言支持、模板集成和草稿功能。

## 功能特性

### 1. 页面创建
- 输入页面名称（只允许字母、数字和连字符）
- 设置页面标题（支持中英文）
- 编写页面内容（支持HTML标签）
- 自动生成符合网站模板的HTML文件

### 2. 多语言支持
- 中文和英文双语言选项卡
- 自动翻译填充（留空时使用对应语言内容）
- 生成对应的语言文件到prod目录

### 3. 内容编辑
- 支持Markdown格式编写，自动转换为HTML
- Markdown文件导入功能
- 实时内容预览
- 响应式编辑界面

### 4. 草稿功能
- 自动保存草稿到临时文件
- 手动保存草稿
- 页面加载时自动恢复草稿
- 草稿时间戳记录

### 5. 页面预览
- 实时预览生成的页面效果
- 模态框预览界面
- 完整模板渲染

## 目录结构

```
pageGenerator/
├── index.js                # 工具入口点
├── pageGeneratorService.js # 页面生成服务
├── routes.js              # 路由处理
└── README.md              # 说明文档
```

## 使用方法

1. **访问页面生成器**
   - 在工具选择页面点击"页面生成器"
   - 或直接访问 `/page-generator`

2. **创建新页面**
   - 输入页面名称（如：my-new-page）
   - 在中文选项卡输入页面标题
   - 可选择切换到英文选项卡输入英文标题
   - 在中文内容选项卡输入Markdown格式的页面内容
   - 可选择切换到英文选项卡输入英文Markdown内容

3. **导入Markdown文件**
   - 点击"导入Markdown文件"按钮
   - 选择.md文件
   - Markdown内容将自动填充到中文内容区域

4. **预览页面**
   - 点击"预览页面"按钮
   - 在弹出的模态框中查看页面效果

5. **保存草稿**
   - 点击"保存草稿"按钮手动保存
   - 页面会自动加载上次的草稿内容

6. **生成页面**
   - 点击"生成页面"按钮
   - 系统将生成HTML文件和语言文件到prod目录

## 生成的文件

工具会生成以下文件：

- **HTML文件**: `/prod/pages/{pageName}.html`
- **中文语言文件**: `/prod/locales/zh-CN/{pageName}.json`
- **英文语言文件**: `/prod/locales/en/{pageName}.json`

## 技术实现

### 后端服务
- `pageGeneratorService.js`: 核心业务逻辑
- `routes.js`: HTTP路由处理
- 集成现有的`templateService`和`i18nService`

### 前端界面
- Bootstrap 5响应式设计
- jQuery Ajax交互
- 选项卡式多语言编辑
- 文件上传和预览功能

### 模板集成
- 使用prod目录的header.html和footer.html模板
- 自动处理模板变量替换
- 支持多语言国际化标签
- Markdown内容自动转换为HTML并集成到模板中

## 注意事项

- 页面名称只能包含字母、数字和连字符，不要使用空格和特殊字符
- 页面内容使用Markdown格式编写，支持标准Markdown语法和GitHub风格扩展
- Markdown内容会自动转换为HTML，支持标题、列表、链接、粗体、斜体等格式
- 生成的页面会自动使用网站的样式和脚本
- 多语言支持文件需要手动编辑以提供更准确的翻译
- 草稿文件保存在临时目录中，重启服务器后可能丢失
- 上传的Markdown文件大小限制为5MB

## API接口

### POST /page-generator/generate
生成新页面

### POST /page-generator/preview
预览页面

### POST /page-generator/draft/save
保存草稿

### GET /page-generator/draft/load
加载草稿

### POST /page-generator/upload-markdown
上传Markdown文件

### POST /page-generator/validate-name
验证页面名称