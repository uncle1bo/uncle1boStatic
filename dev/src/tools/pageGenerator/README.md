# 页面生成器工具

页面生成器是一个用于将Markdown内容转换为HTML页面的工具，它能够自动添加头部和尾部模板，并生成多语言支持文件。

## 目录结构

```
pageGenerator/
├── index.js            # 工具入口点
├── pageGeneratorService.js  # 页面生成服务
├── routes.js          # 路由处理
└── README.md          # 说明文档
```

## 功能

- 将Markdown内容转换为HTML
- 自动添加头部和尾部模板
- 生成多语言支持文件
- 支持直接输入Markdown内容或上传Markdown文件

## API

### 直接输入Markdown内容

```
POST /page-generator/convert
```

请求参数：

- `markdownContent`: Markdown内容
- `pageName`: 页面名称（不包含.html后缀）
- `pageTitle`: 页面标题（可选）
- `pageDescription`: 页面描述（可选）

### 上传Markdown文件

```
POST /page-generator/upload
```

请求参数（multipart/form-data）：

- `markdownFile`: Markdown文件
- `pageName`: 页面名称（不包含.html后缀）
- `pageTitle`: 页面标题（可选）
- `pageDescription`: 页面描述（可选）

## 使用方法

1. 启动服务器：`npm run dev`
2. 访问页面：`http://localhost:3000`
3. 选择直接输入Markdown内容或上传Markdown文件
4. 填写必要的信息并提交
5. 生成的HTML页面将保存在`prod/pages`目录下