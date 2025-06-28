/**
 * 页面生成器工具
 * 将Markdown内容转换为HTML页面并与模板结合
 */

const pageGeneratorService = require('./pageGeneratorService');

/**
 * 页面生成器模块
 */
const pageGenerator = {
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
    return await pageGeneratorService.generatePageFromMarkdown(options);
  }
};

module.exports = pageGenerator;