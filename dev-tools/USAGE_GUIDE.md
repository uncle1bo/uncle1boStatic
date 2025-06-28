# 开发工具使用指南

本指南将详细介绍如何启动和使用项目中的各个开发工具。

## 📋 目录

1. [快速开始](#快速开始)
2. [本地开发服务器](#本地开发服务器)
3. [页面生成器](#页面生成器)
4. [命令行工具](#命令行工具)
5. [测试工具](#测试工具)
6. [常见问题](#常见问题)

## 🚀 快速开始

### 第一次使用

1. **启动本地服务器**
   ```bash
   # 方法1：使用批处理脚本（推荐）
   双击运行 start-server.bat
   
   # 方法2：使用Python命令
   python -m http.server 8000
   
   # 方法3：使用Node.js
   npx http-server -p 8000
   ```

2. **访问网站**
   - 打开浏览器访问：`http://localhost:8000`
   - 开发工具访问：`http://localhost:8000/dev-tools/`

## 🖥️ 本地开发服务器

### 启动方法

#### Windows用户（推荐）
```bash
# 双击运行批处理文件
start-server.bat
```

#### 手动启动
```bash
# 在项目根目录执行
cd d:\Work\HTML\uncle1boStatic
python -m http.server 8000
```

### 服务器状态检查
- 启动成功后，命令行会显示：`Serving HTTP on :: port 8000`
- 浏览器访问 `http://localhost:8000` 应该能看到网站首页
- 如果端口8000被占用，可以使用其他端口：`python -m http.server 8001`

## 📝 页面生成器

### 浏览器版页面生成器

1. **启动服务器**（参考上面的步骤）

2. **访问页面生成器**
   ```
   http://localhost:8000/dev-tools/page-generator.html
   ```

3. **使用步骤**
   - 在左侧编辑器中输入Markdown内容
   - 填写页面标题和文件名
   - 选择是否覆盖现有文件
   - 点击"生成页面"按钮
   - 生成的HTML文件会保存到`pages/`目录

### 服务器版页面生成器

```bash
# 在dev-tools目录下执行
node server-page-generator.js
```

## 🔧 命令行工具

### 页面创建工具

```bash
# 基本用法
create-page.bat [markdown文件] [页面名称] [是否覆盖]

# 示例
create-page.bat examples/example-page.md my-new-page true
```

#### 参数说明
- `markdown文件`：源Markdown文件路径
- `页面名称`：生成的HTML文件名（不含.html扩展名）
- `是否覆盖`：true/false，是否覆盖现有文件

#### 使用示例

1. **创建新页面**
   ```bash
   create-page.bat examples/example-page.md product-info false
   ```
   这会根据`examples/example-page.md`创建`pages/product-info.html`

2. **覆盖现有页面**
   ```bash
   create-page.bat examples/example-page.md about true
   ```
   这会覆盖现有的`pages/about.html`

## 🧪 测试工具

### 多语言功能测试

1. **访问测试页面**
   ```
   http://localhost:8000/dev-tools/test-i18n.html
   ```

2. **测试功能**
   - 点击"简体中文"和"English"按钮
   - 观察页面内容是否正确切换
   - 检查当前语言显示是否正确

### 手动测试清单

- [ ] 语言切换功能正常
- [ ] 移动端导航菜单可展开/收起
- [ ] 所有页面链接正常工作
- [ ] 表单提交功能正常
- [ ] 响应式布局在不同屏幕尺寸下正常

## ❓ 常见问题

### Q: 服务器启动失败
**A:** 
1. 检查Python是否已安装：`python --version`
2. 检查端口是否被占用，尝试其他端口
3. 确保在正确的目录下执行命令

### Q: 页面生成器无法访问
**A:**
1. 确保本地服务器已启动
2. 检查URL是否正确：`http://localhost:8000/dev-tools/page-generator.html`
3. 检查浏览器控制台是否有错误信息

### Q: 语言切换不工作
**A:**
1. 打开浏览器开发者工具查看控制台错误
2. 确保语言文件存在于`locales/`目录
3. 检查网络请求是否成功加载语言文件

### Q: 命令行工具执行失败
**A:**
1. 确保在Windows环境下运行.bat文件
2. 检查Node.js是否已安装（某些工具需要）
3. 确保文件路径正确

### Q: 生成的页面样式异常
**A:**
1. 检查CSS文件路径是否正确
2. 确保Bootstrap CDN链接可访问
3. 清除浏览器缓存后重试

## 📞 获取帮助

如果遇到其他问题：

1. 查看浏览器开发者工具的控制台错误信息
2. 检查服务器命令行输出的错误信息
3. 确认所有依赖文件是否存在
4. 尝试重启本地服务器

## 🔒 安全提醒

⚠️ **重要**：`dev-tools`目录包含开发工具，不应部署到生产环境！

- 部署前确保排除`dev-tools`目录
- 生产环境中通过`_headers`文件阻止访问
- 定期检查部署配置确保安全性