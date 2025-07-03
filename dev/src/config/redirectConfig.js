/**
 * 外部资源重定向配置
 * 支持将任意路径的请求重定向到项目指定的存储位置
 */

module.exports = {
  // 启用重定向功能
  enabled: true,
  
  // 重定向规则配置
  rules: [
    // Prism.js 相关资源重定向
    {
      name: 'prism-components-generated',
      pattern: /^\/prod\/pages\/generated\/components\/(prism-[\w-]+\.min\.js)$/,
      redirect: (match) => `/assets/libs/prism/components/${match[1]}`,
      description: '生成页面中的Prism组件重定向到assets目录'
    },
    {
      name: 'prism-assets-generated',
      pattern: /^\/prod\/pages\/generated\/assets\/libs\/prism\/(prism-[\w-]+\.min\.js)$/,
      redirect: (match) => `/assets/libs/prism/${match[1]}`,
      description: '生成页面中的Prism资源重定向到assets目录'
    },
    {
      name: 'prism-components-assets',
      pattern: /^\/prod\/pages\/generated\/assets\/libs\/prism\/components\/(prism-[\w-]+\.min\.js)$/,
      redirect: (match) => `/assets/libs/prism/components/${match[1]}`,
      description: 'Prism组件完整路径重定向'
    },
    
    // Bootstrap Icons 重定向
    {
      name: 'bootstrap-icons',
      pattern: /^\/prod\/pages\/generated\/(.+\/)?bootstrap-icons\.(css|woff2?)$/,
      redirect: (match) => `/assets/fonts/bootstrap-icons.${match[2]}`,
      description: 'Bootstrap图标文件重定向到fonts目录'
    },
    
    // 通用 assets 重定向
    {
      name: 'general-assets',
      pattern: /^\/prod\/pages\/generated\/assets\/(.+)$/,
      redirect: (match) => `/assets/${match[1]}`,
      description: '通用assets资源重定向'
    },
    
    // CSS 和 JS 文件重定向
    {
      name: 'css-js-files',
      pattern: /^\/prod\/pages\/generated\/(css|js)\/(.+)$/,
      redirect: (match) => `/${match[1]}/${match[2]}`,
      description: 'CSS和JS文件重定向到根目录对应文件夹'
    },
    
    // 依赖资源重定向 - 支持常见的资源源域名
    {
      name: 'source-jsdelivr',
      pattern: /^\/cdn\/jsdelivr\/(.+)$/,
      redirect: (match) => `/assets/libs/${match[1]}`,
      description: 'jsDelivr 依赖资源重定向到本地assets'
    },
    {
      name: 'source-cdnjs',
      pattern: /^\/cdn\/cdnjs\/(.+)$/,
      redirect: (match) => `/assets/libs/${match[1]}`,
      description: 'CDNJS资源重定向到本地assets'
    },
    {
      name: 'source-unpkg',
      pattern: /^\/cdn\/unpkg\/(.+)$/,
      redirect: (match) => `/assets/libs/${match[1]}`,
      description: 'unpkg 依赖资源重定向到本地assets'
    },
    
    // 外部库资源重定向
    {
      name: 'external-libs',
      pattern: /^\/libs\/(.+)$/,
      redirect: (match) => `/assets/libs/${match[1]}`,
      description: '外部库资源重定向到assets/libs目录'
    },
    
    // 字体文件重定向
    {
      name: 'fonts',
      pattern: /^\/fonts\/(.+)$/,
      redirect: (match) => `/assets/fonts/${match[1]}`,
      description: '字体文件重定向到assets/fonts目录'
    },
    
    // 图片资源重定向
    {
      name: 'images',
      pattern: /^\/images\/(.+)$/,
      redirect: (match) => `/assets/images/${match[1]}`,
      description: '图片资源重定向到assets/images目录'
    },
    
    // 图标资源重定向
    {
      name: 'icons',
      pattern: /^\/icons\/(.+)$/,
      redirect: (match) => `/assets/icons/${match[1]}`,
      description: '图标资源重定向到assets/icons目录'
    }
  ],
  
  // 自定义重定向规则（用户可以添加）
  customRules: [
    // 示例：
    // {
    //   name: 'custom-rule',
    //   pattern: /^\/custom\/(.+)$/,
    //   redirect: (match) => `/assets/custom/${match[1]}`,
    //   description: '自定义重定向规则示例'
    // }
  ],
  
  // 重定向选项
  options: {
    // 重定向状态码 (301: 永久重定向, 302: 临时重定向)
    statusCode: 302,
    
    // 是否记录重定向日志
    logRedirects: true,
    
    // 是否启用缓存控制
    enableCache: false,
    
    // 缓存时间（秒）
    cacheMaxAge: 3600
  }
};