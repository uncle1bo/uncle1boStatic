/**
 * 页面生成器工具
 * 用于创建新的网站页面，包括HTML文件和多语言支持
 */

const pageGeneratorService = require('./pageGeneratorService');

/**
 * 页面生成器模块
 */
const pageGenerator = {
  /**
   * 生成新页面
   * @param {Object} options - 选项
   * @param {string} options.pageName - 页面名称
   * @param {string} options.pageTitle - 页面标题
   * @param {string} options.content - 页面内容
   * @param {Object} options.translations - 翻译内容
   * @returns {Promise<Object>} 生成结果
   */
  generatePage: async function(options) {
    return await pageGeneratorService.generatePage(options);
  },
  
  /**
   * 保存草稿
   * @param {Object} draft - 草稿内容
   * @returns {Promise<void>}
   */
  saveDraft: async function(draft) {
    return await pageGeneratorService.saveDraft(draft);
  },
  
  /**
   * 加载草稿
   * @returns {Promise<Object|null>} 草稿内容
   */
  loadDraft: async function() {
    return await pageGeneratorService.loadDraft();
  },
  
  /**
   * 预览页面
   * @param {Object} options - 选项
   * @returns {string} HTML内容
   */
  previewPage: function(options) {
    return pageGeneratorService.previewPage(options);
  },
  
  /**
   * 验证页面名称
   * @param {string} pageName - 页面名称
   * @returns {boolean} 是否有效
   */
  validatePageName: function(pageName) {
    return pageGeneratorService.validatePageName(pageName);
  }
};

module.exports = pageGenerator;