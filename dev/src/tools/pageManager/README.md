# 页面管理器工具

页面管理器是一个用于管理网站页面的工具，它能够帮助您查看、删除和创建网站页面。

## 目录结构

```
pageManager/
├── index.js            # 工具入口点
├── pageManagerService.js  # 页面管理服务
├── routes.js          # 路由处理
└── README.md          # 说明文档
```

## 功能

- 查看所有现有页面列表
- 删除页面（包括HTML文件和多语言支持文件）
- 跳转到页面生成器创建新页面

## API

### 获取页面列表

```
GET /page-manager/list
```

响应：

```json
{
  "success": true,
  "pages": [
    {
      "name": "about",
      "file": "about.html",
      "path": "path/to/about.html",
      "size": 1024,
      "modified": "2023-06-28T10:00:00.000Z",
      "zhTitle": "关于我们",
      "enTitle": "About Us"
    }
  ]
}
```

### 删除页面

```
DELETE /page-manager/delete/:pageName
```

参数：

- `pageName`: 页面名称（不包含.html后缀）

响应：

```json
{
  "success": true
}
```

## 使用方法

1. 启动服务器：`npm run dev`
2. 访问页面：`http://localhost:3000/page-manager`
3. 在页面列表中查看所有现有页面
4. 点击删除按钮删除不需要的页面
5. 点击「创建新页面」按钮跳转到页面生成器创建新页面