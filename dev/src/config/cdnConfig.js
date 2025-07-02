/**
 * CDN资源配置文件
 * 定义项目中使用的CDN资源和备用源
 */

module.exports = {
  resources: {
    'bootstrap-css': {
      name: 'Bootstrap CSS',
      description: 'Bootstrap 5.3 CSS框架',
      cdns: [
        {
          name: 'jsDelivr',
          url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
        },
        {
          name: 'cdnjs',
          url: 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css'
        },
        {
          name: 'unpkg',
          url: 'https://unpkg.com/bootstrap@5.3.0/dist/css/bootstrap.min.css'
        }
      ]
    },
    'bootstrap-js': {
      name: 'Bootstrap JavaScript',
      description: 'Bootstrap 5.3 JavaScript组件',
      cdns: [
        {
          name: 'jsDelivr',
          url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
        },
        {
          name: 'cdnjs',
          url: 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js'
        },
        {
          name: 'unpkg',
          url: 'https://unpkg.com/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
        }
      ]
    },
    'bootstrap-icons': {
      name: 'Bootstrap Icons',
      description: 'Bootstrap图标字体库',
      cdns: [
        {
          name: 'jsDelivr',
          url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css'
        },
        {
          name: 'cdnjs',
          url: 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css'
        }
      ]
    },
    'jquery': {
      name: 'jQuery',
      description: 'jQuery JavaScript库',
      cdns: [
        {
          name: 'jsDelivr',
          url: 'https://cdn.jsdelivr.net/npm/jquery@3.7.0/dist/jquery.min.js'
        },
        {
          name: 'cdnjs',
          url: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js'
        },
        {
          name: 'Google CDN',
          url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js'
        }
      ]
    },
    'font-awesome': {
      name: 'Font Awesome',
      description: 'Font Awesome图标字体库',
      cdns: [
        {
          name: 'jsDelivr',
          url: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css'
        },
        {
          name: 'cdnjs',
          url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        }
      ]
    },
    'highlight-js': {
      name: 'Highlight.js',
      description: '代码高亮库',
      cdns: [
        {
          name: 'jsDelivr',
          url: 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/highlight.min.js'
        },
        {
          name: 'cdnjs',
          url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js'
        }
      ]
    },
    'marked': {
      name: 'Marked',
      description: 'Markdown解析器',
      cdns: [
        {
          name: 'jsDelivr',
          url: 'https://cdn.jsdelivr.net/npm/marked@5.1.1/marked.min.js'
        },
        {
          name: 'cdnjs',
          url: 'https://cdnjs.cloudflare.com/ajax/libs/marked/5.1.1/marked.min.js'
        }
      ]
    }
  },
  
  // CDN配置选项
  options: {
    timeout: 10000, // 请求超时时间（毫秒）
    retryCount: 3,  // 重试次数
    retryDelay: 1000, // 重试延迟（毫秒）
    userAgent: 'CDN-Cache-Manager/1.0', // 用户代理
    enableIntegrityCheck: true, // 启用完整性校验
    hashMinLength: 64, // hash最小长度，低于此长度判定为不完整
    cacheExpiry: 24 * 60 * 60 * 1000 // 缓存过期时间（毫秒）
  }
};