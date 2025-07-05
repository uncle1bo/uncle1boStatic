/**
 * 资源管理器CDN配置文件
 * 定义项目中使用的依赖资源下载链接和本地路径
 */

class CDNConfig {
  constructor() {
    this.cdnResources = {
      'bootstrap-css': {
        type: 'css',
        path: 'assets/libs/bootstrap/bootstrap.min.css',
        name: 'Bootstrap CSS',
        description: 'Bootstrap 5.3 CSS框架',
        primary: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css',
          'https://unpkg.com/bootstrap@5.3.0/dist/css/bootstrap.min.css'
        ],
        dependencies: []
      },
      'bootstrap-js': {
        type: 'js',
        path: 'assets/libs/bootstrap/bootstrap.bundle.min.js',
        name: 'Bootstrap JavaScript',
        description: 'Bootstrap 5.3 JavaScript组件',
        primary: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js',
          'https://unpkg.com/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
        ],
        dependencies: []
      },
    'bootstrap-icons': {
        type: 'css',
        path: 'assets/libs/bootstrap/bootstrap-icons.css',
        name: 'Bootstrap Icons',
        description: 'Bootstrap图标字体库',
        primary: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css'
        ],
        dependencies: []
      },
    'jquery': {
        type: 'js',
        path: 'assets/libs/jquery/jquery.min.js',
        name: 'jQuery',
        description: 'jQuery JavaScript库',
        primary: 'https://cdn.jsdelivr.net/npm/jquery@3.7.0/dist/jquery.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js',
          'https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js'
        ],
        dependencies: []
      },
    'font-awesome': {
        type: 'css',
        path: 'assets/libs/fontawesome/all.min.css',
        name: 'Font Awesome',
        description: 'Font Awesome图标字体库',
        primary: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        ],
        dependencies: []
      },
      'highlight-js': {
        type: 'js',
        path: 'assets/libs/highlight/highlight.min.js',
        name: 'Highlight.js',
        description: '代码高亮库',
        primary: 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/highlight.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js'
        ],
        dependencies: []
      },
      'marked': {
        type: 'js',
        path: 'assets/libs/marked/marked.min.js',
        name: 'Marked',
        description: 'Markdown解析器',
        primary: 'https://cdn.jsdelivr.net/npm/marked@5.1.1/marked.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/marked/5.1.1/marked.min.js'
        ],
        dependencies: []
      },
      
      // Prism.js 代码高亮库
      'prism-core': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-core.min.js',
        name: 'Prism Core',
        description: 'Prism.js 核心库',
        primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js'
        ],
        dependencies: []
      },
      'prism-theme-css': {
        type: 'css',
        path: 'assets/libs/prism/themes/prism.min.css',
        name: 'Prism Theme CSS',
        description: 'Prism.js 主题样式',
        primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css'
        ],
        dependencies: []
      },
      'prism-clike': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-clike.min.js',
        name: 'Prism C-like',
        description: 'Prism.js C-like语言支持',
        primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-clike.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-clike.min.js'
        ],
        dependencies: ['prism-core']
      },
      'prism-javascript': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-javascript.min.js',
        name: 'Prism JavaScript',
        description: 'Prism.js JavaScript语言支持',
        primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-javascript.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js'
        ],
        dependencies: ['prism-core', 'prism-clike']
      },
      'prism-css': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-css.min.js',
        name: 'Prism CSS',
        description: 'Prism.js CSS语言支持',
        primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-css.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-css.min.js'
        ],
        dependencies: ['prism-core']
      },
      'prism-markup': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-markup.min.js',
        name: 'Prism Markup',
        description: 'Prism.js HTML/XML语言支持',
        primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-markup.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markup.min.js'
        ],
        dependencies: ['prism-core']
      },
      'prism-json': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-json.min.js',
        name: 'Prism JSON',
        description: 'Prism.js JSON语言支持',
        primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-json.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js'
        ],
        dependencies: ['prism-core']
      },
      'prism-python': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-python.min.js',
        name: 'Prism Python',
        description: 'Prism.js Python语言支持',
        primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-python.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js'
        ],
        dependencies: ['prism-core']
      },
      'prism-bash': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-bash.min.js',
        name: 'Prism Bash',
        description: 'Prism.js Bash语言支持',
        primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-bash.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js'
        ],
        dependencies: ['prism-core']
      },
      
      // Prism.js 插件
      'prism-toolbar-css': {
        type: 'css',
        path: 'assets/libs/prism/plugins/toolbar/prism-toolbar.min.css',
        name: 'Prism Toolbar CSS',
        description: 'Prism.js 工具栏样式',
        primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/toolbar/prism-toolbar.min.css',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.css'
        ],
        dependencies: []
      },
      'prism-toolbar': {
        type: 'js',
        path: 'assets/libs/prism/plugins/toolbar/prism-toolbar.min.js',
        name: 'Prism Toolbar',
        description: 'Prism.js 工具栏插件',
        primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/toolbar/prism-toolbar.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.js'
        ],
        dependencies: ['prism-core']
      },
      'prism-copy': {
        type: 'js',
        path: 'assets/libs/prism/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js',
        name: 'Prism Copy to Clipboard',
        description: 'Prism.js 复制到剪贴板插件',
        primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js'
        ],
        dependencies: ['prism-core', 'prism-toolbar']
      },
      'prism-autoloader': {
        type: 'js',
        path: 'assets/libs/prism/plugins/autoloader/prism-autoloader.min.js',
        name: 'Prism Autoloader',
        description: 'Prism.js 自动加载器插件',
        primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js'
        ],
        dependencies: ['prism-core']
      },
      
      // KaTeX 数学公式渲染
      'katex-css': {
        type: 'css',
        path: 'assets/libs/katex/katex.min.css',
        name: 'KaTeX CSS',
        description: 'KaTeX 数学公式样式',
        primary: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css'
        ],
        dependencies: []
      },
      'katex-js': {
        type: 'js',
        path: 'assets/libs/katex/katex.min.js',
        name: 'KaTeX JavaScript',
        description: 'KaTeX 数学公式渲染库',
        primary: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.js'
        ],
        dependencies: []
      },
      
      // Mermaid 图表库
      'mermaid': {
        type: 'js',
        path: 'assets/libs/mermaid/mermaid.min.js',
        name: 'Mermaid',
        description: 'Mermaid 图表和流程图库',
        primary: 'https://cdn.jsdelivr.net/npm/mermaid@10.4.0/dist/mermaid.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.4.0/mermaid.min.js'
        ],
        dependencies: []
      },
      
      // DataTables 表格插件
      'dataTables-css': {
        type: 'css',
        path: 'assets/libs/datatables/dataTables.bootstrap5.min.css',
        name: 'DataTables CSS',
        description: 'DataTables Bootstrap5 样式',
        primary: 'https://cdn.jsdelivr.net/npm/datatables.net-bs5@1.13.6/css/dataTables.bootstrap5.min.css',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/datatables.net-bs5/1.13.6/dataTables.bootstrap5.min.css'
        ],
        dependencies: []
      },
      'dataTables': {
        type: 'js',
        path: 'assets/libs/datatables/jquery.dataTables.min.js',
        name: 'DataTables',
        description: 'DataTables 表格插件',
        primary: 'https://cdn.jsdelivr.net/npm/datatables.net@1.13.6/js/jquery.dataTables.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/datatables.net/1.13.6/jquery.dataTables.min.js'
        ],
        dependencies: ['jquery']
      },
      'dataTables-bootstrap': {
        type: 'js',
        path: 'assets/libs/datatables/dataTables.bootstrap5.min.js',
        name: 'DataTables Bootstrap',
        description: 'DataTables Bootstrap5 集成',
        primary: 'https://cdn.jsdelivr.net/npm/datatables.net-bs5@1.13.6/js/dataTables.bootstrap5.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/datatables.net-bs5/1.13.6/dataTables.bootstrap5.min.js'
        ],
        dependencies: ['jquery', 'dataTables', 'bootstrap-js', 'dataTables-css']
      },
      
      // jQuery UI
      'jquery-ui': {
        type: 'js',
        path: 'assets/libs/jquery-ui/jquery-ui.min.js',
        name: 'jQuery UI',
        description: 'jQuery UI 用户界面库',
        primary: 'https://cdn.jsdelivr.net/npm/jquery-ui@1.13.2/dist/jquery-ui.min.js',
        fallbacks: [
          'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js'
        ],
        dependencies: ['jquery']
      }
    };
    
    // 依赖资源配置选项
    this.options = {
      timeout: 10000, // 请求超时时间（毫秒）
      retryCount: 3,  // 重试次数
      retryDelay: 1000, // 重试延迟（毫秒）
      userAgent: 'Asset-Manager/1.0', // 用户代理
      enableIntegrityCheck: true, // 启用完整性校验
      hashMinLength: 64, // hash最小长度，低于此长度判定为不完整
      cacheExpiry: 24 * 60 * 60 * 1000 // 缓存过期时间（毫秒）
    };
  }
}

module.exports = CDNConfig;