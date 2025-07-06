# Uncle1bo 静态网站项目

[English](docs/README.en.md) | [简体中文](#)

## 1. 项目结构

```
uncle1boStatic/
├── README.md           # 项目说明文档
├── docs/               # 多语言文档目录
├── dev/                # 开发环境目录
├── prod/               # 生产环境目录
├── prod_docs/          # 生产环境文档目录
├── server.js           # 生产环境服务器
├── LICENSE             # 许可协议
├── .gitignore          # Git忽略文件
├── locall.bat          # 生产服务器启动脚本
└── package.json        # 项目依赖配置

```

## 2. 功能介绍

这是一个功能完整的静态网站项目，使用Bootstrap框架构建，配备了完整的开发工具集，支持部署在Cloudflare Pages等静态托管平台上。

### 已实现功能列表

- **站点地图更新器**：自动扫描页面并生成sitemap.xml
- **目录编辑器**：模块化架构的菜单编辑器，支持智能状态检测和拖拽排序
- **页面生成器**：支持Markdown编写，自动转换为HTML页面
- **页面管理器**：管理现有页面，支持查看和删除操作
- **主题管理器**：可视化主题配色编辑，支持明亮/暗夜模式切换
- **多语言支持**：内置国际化支持，支持中英文切换
- **响应式设计**：适配所有设备的响应式布局
- **依赖资源管理**：智能依赖资源管理系统，多源自动切换
- **模板系统**：支持页面模板和变量替换

## 3. 用户使用方法

### 快速开始

1. [开启生产环境服务器，请访问生产环境README文档](prod_docs/README.md)
2. [开启开发环境服务器，请访问开发环境README文档](dev/README.md)

### 开发工具使用

详细使用方法请参考各环境的README文档：

1. [开发目录文档](dev/README.md)
2. [生产环境文档](prod_docs/README.md)

### Cloudflare Pages 部署

1. [具体操作请参考生产环境文档](prod_docs/README.md)

## 4. API使用方法

### 开发工具API

所有开发工具通过Express.js提供RESTful API接口
详细API文档请参考：
1. [开发工具集API文档](dev/README.md#4-api使用方法)
2. 各工具的README文档中的API部分