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
   * @param {boolean} options.isEdit - 是否为编辑模式
   * @returns {Promise<Object>} 生成结果
   */
  generatePage: async function(options) {
    return await pageGeneratorService.generatePage(options);
  },
  
  /**
   * 保存页面数据（草稿或编辑数据）
   * @param {Object} pageData 页面数据
   * @param {string} type 数据类型：'draft' 或 'edit'
   * @param {string} pageName 页面名称（编辑模式时使用）
   * @returns {Promise<void>}
   */
  savePageData: async function(pageData, type = 'draft', pageName = null) {
    return await pageGeneratorService.savePageData(pageData, type, pageName);
  },
  
  /**
   * 加载页面数据（草稿或编辑数据）
   * @param {string} type 数据类型：'draft' 或 'edit'
   * @param {string} pageName 页面名称（编辑模式时使用）
   * @returns {Promise<Object|null>} 页面数据
   */
  loadPageData: async function(type = 'draft', pageName = null) {
    return await pageGeneratorService.loadPageData(type, pageName);
  },
  
  /**
   * 保存草稿（兼容性方法）
   * @param {Object} draft 草稿内容
   * @returns {Promise<void>}
   */
  saveDraft: async function(draft) {
    return await pageGeneratorService.saveDraft(draft);
  },
  
  /**
   * 加载草稿（兼容性方法）
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
  },

  /**
   * 检查页面是否可编辑
   * @param {string} pageName 页面名称
   * @returns {Promise<boolean>} 是否可编辑
   */
  isPageEditable: async function(pageName) {
    return await pageGeneratorService.isPageEditable(pageName);
  },

  /**
   * 清理临时文件
   * @param {string} pageName - 页面名称
   * @returns {Promise<void>}
   */
  cleanupTempFiles: async function(pageName) {
    return await pageGeneratorService.cleanupTempFiles(pageName);
  },

  /**
   * 清理草稿文件
   * @returns {Promise<void>}
   */
  cleanupDraftFile: async function() {
    return await pageGeneratorService.cleanupDraftFile();
  },

  /**
   * 清理所有临时文件
   * @param {string} pageName - 页面名称（可选）
   * @param {boolean} includeDraft - 是否包括草稿文件，默认false
   * @returns {Promise<void>}
   */
  cleanupAllTempFiles: async function(pageName = null, includeDraft = false) {
    return await pageGeneratorService.cleanupAllTempFiles(pageName, includeDraft);
  }
};

module.exports = pageGenerator;