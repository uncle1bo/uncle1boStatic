# .rules

## 项目结构
- `prod/` - 生产环境，必须能单独运行且不含多余代码
- `prod/assets/` - 存放静态资源
- `prod/js/` - 存放js文件
- `prod/css/` - 存放css文件，除非加入了新的样式变量，否则这个文件一般不改
- `prod/pages/` - 存放html文件，所有由页面生成器生成的文章不要再生成环境修改，参考后文。
- `prod/locales/` - 存放本地化翻译文件
- `prod/templates/` - 存放模板文件
- `prod/index.html` - 项目主页网页文件
- `prod/theme-config.js` - 主题配置文件，参考后文说明，不动它，而是修改dev中的配置，应为会被覆盖。
- `dev/` - 开发目录
- `dev/src/` - 存放dev的所有源代码
- `dev/src/config.js` - 存放dev的路径配置文件
- `dev/src/data/` - 存档文件
- `dev/src/public/` - 存放全体公共代码
- `dev/src/views/` - 存放dev的页面ejs文件
- `dev/src/service/` - 存放dev所有工具的接口文件
- `dev/src/tools/` - 存放dev的工具代码
- `dev/src/upload/` - 存放上传的文件
- `server.js` - 生产服务器
- `dev/server.js` - 开发服务器

## 服务器启动

### 生产服务器
- 根目录执行: `npm start`
- 访问: http://localhost:8000

### 开发服务器
- dev目录执行: `npm run dev`
- 访问: http://localhost:3000

## 修改规则

### 允许修改
- 一般不会修改 `prod/` 目录下除了`home.html`和`about.html`以外的http内容文件，和样式配置表。这些文件会被dev/页面生成器工具和dev/样式管理器更新覆盖
- 请修改 `dev/src/` 目录下的开发工具代码和模板文件
- 文档文件

### 需要授权
- 删除核心文件需单独同意
- 删除非临时文件需单独同意
- 创建非临时文件需单独同意
- 结构性变更需单独同意

### 原则
- 只修改必要部分
- 当我说修改的时候，一般不保留旧代码，保持简洁
- 时刻检测修补是否会导致项目违反最佳实践，并提出重构建议