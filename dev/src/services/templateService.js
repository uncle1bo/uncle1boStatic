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
   * @param {string} options.relativePath - 相对于prod目录的路径（可选）
   * @returns {string} 处理后的模板
   */
  processHeaderTemplate: function(template, options) {
    const { pageName, pageTitle, relativePath } = options;
    
    // 计算相对路径
    const rootPath = this.calculateRelativePath(relativePath);
    
    let processedTemplate = template
      .replace(/{{rootPath}}/g, rootPath)
      .replace(/{{cssPath}}/g, rootPath + 'css/')
      .replace(/{{jsPath}}/g, rootPath + 'js/');
    
    // 设置活动页面
    const activePages = ['homeActive', 'aboutActive', 'servicesActive', 'contactActive'];
    activePages.forEach(active => {
      const isActive = active.replace('Active', '') === pageName;
      processedTemplate = processedTemplate.replace(new RegExp(`{{${active}}}`, 'g'), isActive ? 'active' : '');
      processedTemplate = processedTemplate.replace(new RegExp(`{{#if ${active}}}([\s\S]*?){{/if}}`, 'g'), 
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
   * @param {string} options.relativePath - 相对于prod目录的路径（可选）
   * @returns {string} 处理后的模板
   */
  processFooterTemplate: function(template, options) {
    const { pageName, relativePath } = options;
    
    // 计算相对路径
    const rootPath = this.calculateRelativePath(relativePath);
    
    return template
      .replace(/{{rootPath}}/g, rootPath)
      .replace(/{{jsPath}}/g, rootPath + 'js/')
      .replace(/{{pageName}}/g, pageName);
  },
  
  /**
   * 生成完整的HTML页面
   * @param {Object} options - 选项
   * @param {string} options.htmlContent - HTML内容
   * @param {string} options.pageName - 页面名称
   * @param {string} options.tabTitle - 选项卡标题（用于浏览器标签页）
   * @param {string} options.pageTitle - 页面标题（用于页面内容区域）
   * @param {string} options.relativePath - 相对于prod目录的路径（可选）
   * @returns {string} 完整的HTML页面
   */
  generateFullHtml: function(options) {
    const { htmlContent, pageName, tabTitle, pageTitle, relativePath } = options;
    
    // 计算相对路径
    const rootPath = this.calculateRelativePath(relativePath);
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" data-i18n="meta.description" content="">
    <meta name="keywords" content="" data-i18n="meta.keywords">
    <title data-i18n="meta.title">${tabTitle || pageTitle || pageName}</title>
    <!-- CDN Fallback Manager - 必须在其他CDN资源之前加载 -->
    <!-- CDN模块化组件 -->
    <script src="${rootPath}js/cdn/config.js"></script>
    <script src="${rootPath}js/cdn/cache.js"></script>
    <script src="${rootPath}js/cdn/loader.js"></script>
    <script src="${rootPath}js/cdn/optimizer.js"></script>
    <script src="${rootPath}js/cdn/dependency.js"></script>
    <!-- CDN主管理器 -->
    <script src="${rootPath}js/cdn-fallback.js"></script>
    <!-- CSS资源通过CDN管理器动态加载 -->
    <!-- Custom CSS -->
    <link rel="stylesheet" href="${rootPath}css/styles.css">
    <!-- Template Processor -->
    <script src="${rootPath}js/template-processor.js"></script>
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
    <script src="${rootPath}js/main.js"></script>
    <!-- 多语言支持 -->
    <script src="${rootPath}js/i18n.js"></script>
    <script>
        // CDN管理器会自动初始化，无需手动创建实例
        
        // 创建全局Promise用于CDN资源加载
        window.cdnResourcesReady = Promise.all([
            window.cdnManager.loadResource('bootstrap-css'),
            window.cdnManager.loadResource('bootstrap-icons'),
            window.cdnManager.loadResource('prism-toolbar-css'),
            window.cdnManager.loadResource('katex-css')
        ]).then(() => {
            return Promise.all([
                window.cdnManager.loadResource('bootstrap-js'),
                window.cdnManager.loadResource('prism-core'),
                window.cdnManager.loadResource('prism-autoloader'),
                window.cdnManager.loadResource('prism-toolbar'),
                window.cdnManager.loadResource('prism-copy'),
                window.cdnManager.loadResource('katex-js'),
                window.cdnManager.loadResource('mermaid')
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
                await initI18n('${pageName}');
                
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
                fetch('${rootPath}theme-config.json')
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
  },

  /**
   * 计算相对路径
   * @param {string} relativePath - 相对于prod目录的路径（如 'pages/generated/subfolder/page.html'）
   * @returns {string} 相对于当前文件位置的根路径
   */
  calculateRelativePath: function(relativePath) {
    if (!relativePath) {
      // 默认情况：假设文件在 pages/generated/ 目录下
      return '../../';
    }
    
    // 计算文件相对于prod目录的深度
    const pathParts = relativePath.split('/').filter(part => part && part !== '.');
    
    // 移除文件名，只保留目录部分
    if (pathParts.length > 0 && pathParts[pathParts.length - 1].includes('.')) {
      pathParts.pop();
    }
    
    // 计算需要返回的层级数
    const depth = pathParts.length;
    
    // 生成相对路径
    if (depth === 0) {
      return '';
    }
    return '../'.repeat(depth);
  }
};

module.exports = templateService;