# 页面生成器

## 1. 项目结构

```
pageGenerator/
├── index.js                # 工具入口点
├── pageGeneratorService.js # 页面生成服务
├── routes.js              # 路由处理
└── README.md              # 说明文档
```

## 2. 功能介绍

页面生成器用于创建新网站页面，提供完整的页面创建流程，包括多语言支持、模板集成和草稿功能。

### 已实现功能列表

#### 页面创建
- 输入页面名称（只允许字母、数字和连字符）
- 设置页面标题（支持中英文）
- 编写页面内容（支持HTML标签）
- 支持子文件夹路径（可选，用于组织页面结构）
- 自动生成符合网站模板的HTML文件
- 智能路径处理，自动适配不同目录层级的资源引用

#### 多语言支持
- 中文和英文双语言选项卡
- 自动翻译填充（留空时使用对应语言内容）
- 生成对应的语言文件到prod目录

#### 内容编辑
- 支持Markdown格式编写，自动转换为HTML
- Markdown文件导入功能
- 实时内容预览
- 响应式编辑界面

#### 草稿功能
- 自动保存草稿到临时文件
- 手动保存草稿
- 页面加载时自动恢复草稿
- 草稿时间戳记录

#### 页面预览
- 实时预览生成的页面效果
- 模态框预览界面
- 完整模板渲染

#### 增强功能支持
- 自动集成代码高亮（Prism）、数学公式（KaTeX）和图表（Mermaid）
- 语言切换时自动重新初始化增强功能
- 确保多语言环境下增强功能正常工作

## 3. 用户使用方法

### 访问页面生成器
- 在工具选择页面点击"页面生成器"
- 或直接访问 `/page-generator`

### 创建新页面流程
1. 输入页面名称（如：my-new-page）
2. 可选择输入子路径（如：category/subcategory，用于在子文件夹中创建页面）
3. 在中文选项卡输入页面标题
4. 可选择切换到英文选项卡输入英文标题
5. 在中文内容选项卡输入Markdown格式的页面内容
6. 可选择切换到英文选项卡输入英文Markdown内容
7. 点击"生成页面"按钮

### 其他功能操作
- **导入Markdown文件**: 点击"导入Markdown文件"按钮，选择.md文件
- **预览页面**: 点击"预览页面"按钮，在弹出的模态框中查看页面效果
- **保存草稿**: 点击"保存草稿"按钮手动保存，页面会自动加载上次的草稿内容

### 注意事项

#### 子路径功能
- 子路径支持多级目录结构（如：`category/subcategory/section`）
- 系统会自动创建必要的目录结构
- 资源路径（CSS、JS、图片等）会根据文件位置自动调整
- 生成的页面文件位于：`prod/pages/generated/[subPath]/[pageName].html`

#### 路径处理改进
- 修复了头脚模板在子文件夹中的路径错误问题
- 智能计算相对路径，确保所有资源正确加载
- 支持任意深度的目录嵌套

## 4. API使用方法

### 页面生成相关
```javascript
// 生成新页面
POST /page-generator/generate
{
  "pageName": "页面名称",
  "title": "页面标题",
  "content": "Markdown内容",
  "language": "zh-CN",
  "subPath": "可选的子路径（如：category/subcategory）"
}

// 预览页面
POST /page-generator/preview
{
  "title": "页面标题",
  "content": "Markdown内容"
}
```

### 草稿管理
```javascript
// 保存草稿
POST /page-generator/draft/save
{
  "draftData": "草稿内容"
}

// 加载草稿
GET /page-generator/draft/load
```

### 文件操作
```javascript
// 上传Markdown文件
POST /page-generator/upload-markdown
// multipart/form-data 文件

// 验证页面名称
POST /page-generator/validate-name
{
  "pageName": "页面名称"
}
```

## 5. 生成的文件

工具会生成以下文件：
- **HTML文件**: `/prod/pages/{pageName}.html`
- **中文语言文件**: `/prod/locales/zh-CN/{pageName}.json`
- **英文语言文件**: `/prod/locales/en/{pageName}.json`

## 6. 技术实现

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

## 7. 注意事项

- 页面名称只能包含字母、数字和连字符
- 页面内容使用Markdown格式编写
- 生成的页面会自动使用网站的样式和脚本
- 多语言支持文件需要手动编辑以提供准确翻译
- 草稿文件保存在临时目录中
- 上传的Markdown文件大小限制为5MB
- 页面生成完成后会自动清理临时文件

## 8. 临时文件清理

页面生成器提供智能的临时文件清理机制：
- 页面生成完成后自动删除临时文件
- 自动清理空的临时目录
- 提供API接口支持手动清理
- 确保系统存储空间的有效利用