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
    <!-- CSS资源通过CDN管理器动态加载 -->
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../css/styles.css">
    <!-- Template Processor -->
    <script src="../js/template-processor.js"></script>
</head>
<body data-prismjs-copy="\uD83D\uDCCB" data-prismjs-copy-error="\u274C" data-prismjs-copy-success="\u2705" data-prismjs-copy-timeout="2000">
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
    
    <!-- JS资源通过CDN管理器动态加载 -->
    <!-- Custom JavaScript -->
    <script src="../js/main.js"></script>
    <!-- 多语言支持 -->
    <script src="../js/i18n.js"></script>
    <script>
        // 使用CDN管理器加载所有外部资源
        window.cdnManager = new CDNFallbackManager();
        
        // 创建全局Promise用于CDN资源加载
        window.cdnResourcesReady = Promise.all([
            cdnManager.loadResource('bootstrap-css'),
            cdnManager.loadResource('bootstrap-icons'),
            cdnManager.loadResource('prism-toolbar-css'),
            cdnManager.loadResource('katex-css')
        ]).then(() => {
            // CSS资源加载完成后加载JS资源
            return Promise.all([
                cdnManager.loadResource('bootstrap-js'),
                cdnManager.loadResource('prism-core'),
                cdnManager.loadResource('prism-autoloader'),
                cdnManager.loadResource('prism-toolbar'),
                cdnManager.loadResource('prism-copy'),
                cdnManager.loadResource('katex-js'),
                cdnManager.loadResource('mermaid')
            ]);
        }).catch(error => {
            console.warn('CDN资源加载失败，使用备选方案:', error);
        });
        
        // 初始化多语言支持和增强渲染
        document.addEventListener('DOMContentLoaded', async function() {
            try {
                // 等待CDN资源加载完成
                await window.cdnResourcesReady;
                console.log('所有CDN资源加载完成');
                
                // 初始化多语言支持，指定当前页面名称
                initI18n('${pageName}');
                
                // 初始化增强Markdown渲染
                initEnhancedMarkdown();
                
                // 监听主题变化事件
                document.addEventListener('themeChanged', function(event) {
                    // 重新高亮所有代码块
                    if (window.Prism) {
                        Prism.highlightAll();
                    }
                });
            } catch (error) {
                console.error('页面初始化失败:', error);
                // 即使CDN资源加载失败，也要尝试初始化基本功能
                initI18n('${pageName}');
            }
        });
        
        // 加载完整主题配置
        function loadThemeConfig() {
            try {
                // 获取当前主题模式
                const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
                
                // 从theme-config.json文件获取主题配置
                fetch('../theme-config.json')
                    .then(response => response.json())
                    .then(themeConfig => {
                        if (themeConfig && themeConfig[currentTheme]) {
                            const config = themeConfig[currentTheme];
                            
                            // 应用CSS变量
                            const root = document.documentElement;
                            Object.keys(config).forEach(key => {
                                if (key !== 'codeTheme') {
                                    // 将驼峰命名转换为CSS变量格式
                                    const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
                                    root.style.setProperty(cssVar, config[key]);
                                }
                            });
                            
                            // 通过CDN管理器加载代码高亮主题
                            if (config.codeTheme && window.cdnManager) {
                                loadCodeTheme(config.codeTheme);
                            }
                        }
                    })
                    .catch(error => {
                        console.warn('加载主题配置失败:', error);
                    });
            } catch (error) {
                console.warn('应用主题配置失败:', error);
            }
        }
        
        // 通过CDN管理器加载代码高亮主题
        function loadCodeTheme(codeTheme) {
            if (!window.cdnManager) {
                console.warn('CDN管理器未初始化，无法加载代码主题');
                return;
            }
            
            // 移除现有的代码主题
            const existingThemeLink = document.getElementById('prism-theme');
            if (existingThemeLink) {
                existingThemeLink.remove();
            }
            
            // 通过CDN管理器动态加载新主题
            const themeResourceKey = \`prism-theme-\${codeTheme}\`;
            
            // 如果CDN管理器中没有这个主题资源，动态添加
            if (!window.cdnManager.cdnResources[themeResourceKey]) {
                window.cdnManager.cdnResources[themeResourceKey] = {
                    type: 'css',
                    primary: \`https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-\${codeTheme}.min.css\`,
                    fallbacks: [
                        \`https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-\${codeTheme}.min.css\`
                    ]
                };
            }
            
            // 加载主题
            window.cdnManager.loadResource(themeResourceKey)
                .then(() => {
                    console.log(\`代码高亮主题 \${codeTheme} 加载成功\`);
                    // 重新高亮所有代码块
                    if (window.Prism) {
                        Prism.highlightAll();
                    }
                })
                .catch(error => {
                    console.warn(\`代码高亮主题 \${codeTheme} 加载失败:\`, error);
                });
        }
        
        // 增强Markdown渲染初始化函数
        function initEnhancedMarkdown() {
            // 加载完整主题配置
            loadThemeConfig();
            
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