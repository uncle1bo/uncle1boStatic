/**
 * 页面管理器工具
 * 用于管理网站的页面，包括查看、删除和创建页面
 */

const pageManagerService = require('./pageManagerService');

/**
 * 页面管理器模块
 */
const pageManager = {
  /**
   * 获取所有页面列表
   * @returns {Promise<Array>} 页面列表
   */
  getAllPages: async function() {
    return await pageManagerService.getAllPages();
  },
  
  /**
   * 删除页面
   * @param {string} pageName - 页面名称
   * @returns {Promise<boolean>} 是否删除成功
   */
  deletePage: async function(pageName) {
    return await pageManagerService.deletePage(pageName);
  }
};

module.exports = pageManager;