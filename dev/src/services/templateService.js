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
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../css/styles.css">
    <!-- Template Processor -->
    <script src="../js/template-processor.js"></script>
</head>
<body>
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
    <script>
        // 初始化多语言支持
        document.addEventListener('DOMContentLoaded', function() {
            // 初始化多语言支持，指定当前页面名称
            initI18n('${pageName}');
        });
    </script>
</body>
</html>`;
  }
};

module.exports = templateService;