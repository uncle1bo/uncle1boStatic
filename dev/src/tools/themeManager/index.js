/**
 * 主题管理器主入口文件
 * 导出主题管理器的核心功能
 */

const themeManagerService = require('./themeManagerService');
const routes = require('./routes');

module.exports = {
  service: themeManagerService,
  routes: routes,
  
  /**
   * 初始化主题管理器
   */
  async init() {
    try {
      // 确保默认配置存在
      const config = await themeManagerService.getThemeConfig();
      console.log('主题管理器初始化成功');
      return config;
    } catch (error) {
      console.error('主题管理器初始化失败:', error);
      throw error;
    }
  }
};