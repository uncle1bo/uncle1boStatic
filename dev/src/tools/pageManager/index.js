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
  },
  
  /**
   * 清理预览文件
   * @returns {Promise<number>} 清理的文件数量
   */
  cleanupPreviewFiles: async function() {
    return await pageManagerService.cleanupPreviewFiles();
  }
};

module.exports = pageManager;

// 如果直接运行此文件，则执行getAllPages来生成文章列表
if (require.main === module) {
  (async () => {
    try {
      console.log('正在获取页面列表并生成文章列表...');
      const pages = await pageManager.getAllPages();
      console.log(`成功获取 ${pages.length} 个页面`);
    } catch (error) {
      console.error('获取页面列表失败:', error);
      process.exit(1);
    }
  })();
}