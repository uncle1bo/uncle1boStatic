/**
 * 页面生成器服务
 * 整合其他服务，完成页面生成的完整流程
 */

const markdownService = require('../../services/markdownService');
const templateService = require('../../services/templateService');
const i18nService = require('../../services/i18nService');
const fileService = require('../../services/fileService');

/**
 * 页面生成器服务
 */
const pageGeneratorService = {
  /**
   * 从Markdown内容生成页面
   * @param {Object} options - 选项
   * @param {string} options.markdownContent - Markdown内容
   * @param {string} options.pageName - 页面名称
   * @param {string} options.pageTitle - 页面标题 (可选)
   * @param {string} options.pageDescription - 页面描述 (可选)
   * @returns {Promise<string>} 生成的HTML文件路径
   */
  generatePageFromMarkdown: async function(options) {
    const { markdownContent, pageName } = options;
    let { pageTitle, pageDescription } = options;
    
    // 如果没有提供标题或描述，尝试从Markdown内容中提取
    if (!pageTitle) {
      pageTitle = markdownService.extractTitle(markdownContent);
    }
    
    if (!pageDescription) {
      pageDescription = markdownService.extractDescription(markdownContent);
    }
    
    // 将Markdown转换为HTML
    const htmlContent = markdownService.convertToHtml(markdownContent);
    
    // 生成完整的HTML页面
    const fullHtml = templateService.generateFullHtml({
      htmlContent,
      pageName,
      pageTitle,
      pageDescription
    });
    
    // 保存HTML文件
    const htmlFilePath = await fileService.saveHtmlFile(fullHtml, pageName);
    
    // 生成多语言文件
    await i18nService.generateI18nFiles({
      pageName,
      pageTitle,
      pageDescription
    });
    
    // 复制文件到prod目录
    await fileService.copyFilesToProd(pageName);
    
    return htmlFilePath;
  }
};

module.exports = pageGeneratorService;