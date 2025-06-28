/**
 * 站点地图更新工具
 * 根据prod目录中的页面自动更新sitemap.xml文件
 */

const sitemapUpdaterService = require('./sitemapUpdaterService');

/**
 * 站点地图更新模块
 */
const sitemapUpdater = {
  /**
   * 更新站点地图
   * @param {Object} options - 选项
   * @param {string} options.domain - 网站域名 (例如 https://www.example.com)
   * @param {string} options.changefreq - 更新频率 (可选，默认为'weekly')
   * @param {string} options.priority - 优先级 (可选，默认为'0.8')
   * @returns {Promise<string>} 更新后的sitemap.xml文件路径
   */
  updateSitemap: async function(options) {
    return await sitemapUpdaterService.updateSitemap(options);
  }
};

module.exports = sitemapUpdater;