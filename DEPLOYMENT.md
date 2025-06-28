# 部署指南

## 安全部署说明

本项目已经将开发工具和用户展示内容进行了分离，以提高安全性。

### 目录结构说明

```
uncle1boStatic/
├── dev-tools/          # 🚨 开发工具目录 - 不要部署到生产环境
│   ├── page-generator.html
│   ├── server-page-generator.js
│   ├── page-generator.js
│   ├── markdown-parser.js
│   ├── create-page.bat
│   ├── start-server.bat
│   └── examples/
├── pages/              # ✅ 用户页面 - 可以部署
├── css/                # ✅ 样式文件 - 可以部署
├── js/                 # ✅ 用户端脚本 - 可以部署
├── locales/            # ✅ 语言文件 - 可以部署
├── templates/          # ✅ 模板文件 - 可以部署
├── assets/             # ✅ 静态资源 - 可以部署
└── index.html          # ✅ 主页 - 可以部署
```

### 部署到 Cloudflare Pages

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "分离开发工具和用户内容"
   git push origin main
   ```

2. **配置 Cloudflare Pages**
   - 构建命令：留空（静态站点）
   - 构建输出目录：`/`（根目录）
   - 环境变量：无需设置

3. **安全配置**
   - `_headers` 文件已配置阻止访问 `/dev-tools/` 目录
   - 搜索引擎将被阻止索引开发工具页面

### 本地开发

1. **启动开发服务器**
   ```bash
   cd dev-tools
   start-server.bat
   ```

2. **访问开发工具**
   - 页面生成器：`http://localhost:8000/dev-tools/page-generator.html`
   - 主站：`http://localhost:8000/`

3. **创建新页面**
   ```bash
   cd dev-tools
   create-page.bat examples/example-page.md my-new-page true
   ```

### 安全检查清单

部署前请确认：

- [ ] `dev-tools/` 目录不会被部署到生产环境
- [ ] `_headers` 文件包含对 `/dev-tools/` 的访问限制
- [ ] 导航栏中没有指向开发工具的链接
- [ ] 所有开发相关的语言文件已被移除
- [ ] `.gitignore` 已更新（如果需要）

### 故障排除

**如果开发工具在生产环境中仍然可访问：**

1. 检查 `_headers` 文件是否正确配置
2. 确认 Cloudflare Pages 已重新部署
3. 清除浏览器缓存
4. 检查是否有其他 CDN 或代理服务器缓存了旧内容

**如果本地开发工具无法正常工作：**

1. 确认所有文件路径引用已正确更新
2. 检查 Node.js 是否已安装（用于服务器端脚本）
3. 确认本地服务器正在运行

### 注意事项

⚠️ **重要安全提醒**：
- 开发工具包含文件操作功能，可能被恶意利用
- 绝对不要在生产环境中暴露这些工具
- 定期检查生产环境，确保开发工具不可访问
- 如果发现安全问题，立即联系系统管理员