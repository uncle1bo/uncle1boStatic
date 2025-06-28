# 开发工具目录

这个目录包含了所有的开发工具和脚本，不应该部署到生产环境。

## 包含的工具

### 页面生成器
- `page-generator.html` - 浏览器端页面生成器界面
- `server-page-generator.js` - 服务器端页面生成脚本
- `page-generator.js` - 浏览器端页面生成逻辑
- `markdown-parser.js` - Markdown解析器

### 批处理脚本
- `create-page.bat` - 命令行页面创建工具
- `start-server.bat` - 本地开发服务器启动脚本

### 示例文件
- `examples/` - 示例Markdown文件

## 安全注意事项

⚠️ **重要**: 这些文件包含开发功能，可能存在安全风险，绝对不应该部署到生产环境！

在部署时，请确保：
1. 不要将此目录上传到生产服务器
2. 在 `.gitignore` 中添加相应规则（如果需要）
3. 在 `_headers` 文件中阻止对此目录的访问

## 使用方法

### 本地开发
1. 运行 `start-server.bat` 启动本地服务器
2. 访问 `http://localhost:8000/dev-tools/page-generator.html` 使用页面生成器

### 命令行工具
```bash
# 创建新页面
create-page.bat examples/example-page.md my-new-page true
```