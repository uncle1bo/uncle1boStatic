# 页面生成器工具

页面生成器是一个用于将Markdown内容转换为HTML页面的工具，它能够自动添加头部和尾部模板，并生成多语言支持文件。

## 目录结构

```
pageGenerator/
├── index.js                # 工具入口点
├── pageGeneratorService.js # 页面生成服务
├── routes.js               # 路由处理
├── page-generator.js       # 后端使用的页面生成器脚本
└── README.md               # 说明文档
```

## 前端脚本结构

```
tools/pageGenerator/
├── page-generator.js                    # 页面生成器前端脚本，包含页面生成器的前端交互逻辑
├── main.js                              # 页面生成器主脚本，负责处理表单提交和文件上传
└── markdown-parser.js                   # Markdown解析脚本，提供将Markdown转换为HTML的功能
```

## 功能

### 后端功能

- 将Markdown内容转换为HTML
- 自动添加头部和尾部模板
- 生成多语言支持文件
- 支持直接输入Markdown内容或上传Markdown文件

### 前端功能

- 提供用户友好的界面，支持直接输入和文件上传两种方式
- 支持Markdown文件导入到编辑器功能
- 支持多语言配置的动态添加和管理
- 支持嵌套键名的多语言配置（如 'common.button.submit'）
- 提供表单提交和结果显示功能

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
- `i18nConfig`: 多语言配置（可选），格式如下：
  ```json
  {
    "zh": {
      "common": {
        "button": {
          "submit": "提交"
        }
      }
    },
    "en": {
      "common": {
        "button": {
          "submit": "Submit"
        }
      }
    }
  }
  ```

### 上传Markdown文件

```
POST /page-generator/upload
```

请求参数（multipart/form-data）：

- `markdownFile`: Markdown文件
- `pageName`: 页面名称（不包含.html后缀）
- `pageTitle`: 页面标题（可选）
- `pageDescription`: 页面描述（可选）
- `i18nConfig`: 多语言配置（可选，JSON字符串）

## 使用方法

### 基本使用流程

1. 启动服务器：`npm run dev`
2. 访问页面：`http://localhost:3000`
3. 选择直接输入Markdown内容或上传Markdown文件
4. 填写必要的信息并提交
5. 生成的HTML页面将保存在`prod/pages`目录下

### 多语言配置使用

1. 在表单中找到「多语言配置」部分
2. 点击「添加多语言字段」按钮添加新的翻译项
3. 填写翻译键名（支持嵌套键名，如`common.button.submit`）
4. 填写中文内容（必填）和英文内容（可选）
5. 可以添加多个多语言字段
6. 提交表单时，多语言配置将一并发送到服务器

### Markdown文件导入

1. 在「上传文件」标签页选择Markdown文件
2. 点击「导入到编辑器」按钮
3. 系统会自动切换到「直接输入」标签页并填充文件内容
4. 可以在编辑器中修改内容后再提交