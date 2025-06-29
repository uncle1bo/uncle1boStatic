/**
 * 模板服务
 * 负责处理HTML模板的加载和处理
 */

const fs = require('fs-extra');
const path = require('path');
const paths = require('../config/pathConfig');

/**
 * 模板服务
 */
const templateService = {
  /**
   * 加载模板文件
   * @param {string} templateName - 模板名称 (header 或 footer)
   * @returns {Promise<string>} 模板内容
   */
  loadTemplate: async function(templateName) {
    const templatePath = paths.templates[templateName];
    return await fs.readFile(templatePath, 'utf8');
  },
  
  /**
   * 处理头部模板
   * @param {string} template - 模板内容
   * @param {Object} options - 选项
   * @param {string} options.pageName - 页面名称
   * @param {string} options.pageTitle - 页面标题
   * @returns {string} 处理后的模板
   */
  processHeaderTemplate: function(template, options) {
    const { pageName, pageTitle } = options;
    
    let processedTemplate = template
      .replace(/{{rootPath}}/g, '../')
      .replace(/{{cssPath}}/g, '../css/')
      .replace(/{{jsPath}}/g, '../js/');
    
    // 设置活动页面
    const activePages = ['homeActive', 'aboutActive', 'servicesActive', 'contactActive'];
    activePages.forEach(active => {
      const isActive = active.replace('Active', '') === pageName;
      processedTemplate = processedTemplate.replace(new RegExp(`{{${active}}}`, 'g'), isActive ? 'active' : '');
      processedTemplate = processedTemplate.replace(new RegExp(`{{#if ${active}}}([\\s\\S]*?){{/if}}`, 'g'), 
        isActive ? '$1' : '');
    });
    
    // 替换页面标题和描述
    processedTemplate = processedTemplate.replace(/<title[^>]*>[^<]*<\/title>/, 
      `<title>${pageTitle || pageName}</title>`);
    processedTemplate = processedTemplate.replace(/<meta name="description"[^>]*>/, 
      `<meta name="description" content="" data-i18n="meta.description">`);
    
    return processedTemplate;
  },
  
  /**
   * 处理底部模板
   * @param {string} template - 模板内容
   * @param {Object} options - 选项
   * @param {string} options.pageName - 页面名称
   * @returns {string} 处理后的模板
   */
  processFooterTemplate: function(template, options) {
    const { pageName } = options;
    
    return template
      .replace(/{{rootPath}}/g, '../')
      .replace(/{{jsPath}}/g, '../js/')
      .replace(/{{pageName}}/g, pageName);
  },
  
  /**
   * 生成完整的HTML页面
   * @param {Object} options - 选项
   * @param {string} options.htmlContent - HTML内容
   * @param {string} options.pageName - 页面名称
   * @param {string} options.tabTitle - 选项卡标题（用于浏览器标签页）
   * @param {string} options.pageTitle - 页面标题（用于页面内容区域）
   * @returns {string} 完整的HTML页面
   */
  generateFullHtml: function(options) {
    const { htmlContent, pageName, tabTitle, pageTitle } = options;
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" data-i18n="meta.description" content="">
    <meta name="keywords" content="" data-i18n="meta.keywords">
    <title data-i18n="meta.title">${tabTitle || pageTitle || pageName}</title>
    <!-- CDN自动切换逻辑 -->
    <script src="../js/cdn-fallback.js"></script>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../css/styles.css">

    <!-- Prism.js CSS for code highlighting -->
    <!-- 主题CSS由主题管理器动态加载 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/toolbar/prism-toolbar.min.css">
    <!-- KaTeX CSS for math rendering -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
    <!-- Template Processor -->
    <script src="../js/template-processor.js"></script>
</head>
<body data-prismjs-copy="📋" data-prismjs-copy-error="❌" data-prismjs-copy-success="✅" data-prismjs-copy-timeout="2000">
    <div class="container-fluid">
        <!-- 头部模板 -->
        <div id="header-template"></div>

        <!-- Content Section -->
        <div class="main-content">
            <div class="container mt-5">
                <div class="row">
                    <div class="col-md-12">
                        <h1 class="display-4" data-i18n="${pageName}.title">${pageTitle || pageName}</h1>
                        <hr class="my-4">
                        <div class="content" data-i18n="${pageName}.content">
                            ${htmlContent || '<!-- 内容将通过多语言系统动态加载 -->'}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部模板 -->
        <div id="footer-template"></div>
    </div>
    
    <!-- Bootstrap JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Custom JavaScript -->
    <script src="../js/main.js"></script>
    <!-- 多语言支持 -->
    <script src="../js/i18n.js"></script>
    <!-- Enhanced Markdown rendering libraries -->
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/toolbar/prism-toolbar.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
    <script>
        // 初始化多语言支持和增强渲染
        document.addEventListener('DOMContentLoaded', function() {
            // 初始化多语言支持，指定当前页面名称
            initI18n('${pageName}');
            
            // 初始化增强Markdown渲染
            initEnhancedMarkdown();
            
            // 监听主题变化事件
            document.addEventListener('themeChanged', function(event) {
                // 重新加载代码高亮主题
                loadCodeTheme();
                
                // 重新高亮所有代码块
                if (window.Prism) {
                    Prism.highlightAll();
                }
            });
        });
        
        // 加载代码高亮主题
        function loadCodeTheme() {
            try {
                // 获取当前主题模式
                const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
                
                // 从theme-config.json文件获取主题配置
                fetch('../theme-config.json')
                    .then(response => response.json())
                    .then(themeConfig => {
                        if (themeConfig && themeConfig.codeTheme) {
                            const codeTheme = themeConfig.codeTheme;
                            
                            // 移除现有的Prism主题
                            const existingTheme = document.querySelector('link[data-prism-theme]');
                            if (existingTheme) {
                                existingTheme.remove();
                            }
                            
                            // 添加新的Prism主题
                            if (codeTheme && codeTheme !== 'default') {
                                const link = document.createElement('link');
                                link.rel = 'stylesheet';
                                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-' + codeTheme + '.min.css';
                                link.setAttribute('data-prism-theme', codeTheme);
                                document.head.appendChild(link);
                            }
                        }
                    })
                    .catch(error => {
                        console.warn('加载主题配置失败:', error);
                    });
            } catch (error) {
                console.warn('加载代码主题失败:', error);
            }
        }
        
        // 增强Markdown渲染初始化函数
        function initEnhancedMarkdown() {
            // 加载代码高亮主题
            loadCodeTheme();
            

            // 初始化代码高亮
            if (window.Prism) {
                Prism.highlightAll();
            }
            
            // 初始化数学公式渲染
            if (window.katex) {
                // 渲染行内公式
                document.querySelectorAll('.katex-inline').forEach(function(element) {
                    const formula = element.getAttribute('data-katex');
                    if (formula) {
                        try {
                            element.innerHTML = katex.renderToString(formula, { displayMode: false });
                        } catch (e) {
                            console.warn('KaTeX渲染失败:', e);
                        }
                    }
                });
                
                // 渲染块级公式
                document.querySelectorAll('.katex-display').forEach(function(element) {
                    const formula = element.getAttribute('data-katex');
                    if (formula) {
                        try {
                            element.innerHTML = katex.renderToString(formula, { displayMode: true });
                        } catch (e) {
                            console.warn('KaTeX渲染失败:', e);
                        }
                    }
                });
            }
            
            // 初始化Mermaid图表
            if (window.mermaid) {
                mermaid.initialize({ 
                    startOnLoad: false,
                    theme: 'default',
                    securityLevel: 'loose'
                });
                
                document.querySelectorAll('.mermaid-diagram').forEach(function(element) {
                    const code = element.getAttribute('data-mermaid-code');
                    const id = element.getAttribute('data-diagram-id');
                    if (code && id) {
                        try {
                            mermaid.render(id, code).then(function(result) {
                                element.innerHTML = result.svg;
                            }).catch(function(error) {
                                console.warn('Mermaid渲染失败:', error);
                            });
                        } catch (e) {
                            console.warn('Mermaid渲染失败:', e);
                        }
                    }
                });
            }
        }
    </script>
</body>
</html>`;
  }
};

module.exports = templateService;