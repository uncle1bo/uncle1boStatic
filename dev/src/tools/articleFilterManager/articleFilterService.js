/**
 * 文章黑白名单管理器服务
 * 负责管理文章的黑白名单配置
 */

const fs = require('fs-extra');
const path = require('path');
const paths = require('../../config/pathConfig');
const pageManagerService = require('../pageManager/pageManagerService');

/**
 * 文章黑白名单管理器服务
 */
const articleFilterService = {
  /**
   * 获取黑白名单配置文件路径
   * @returns {string} 配置文件路径
   */
  getFilterConfigPath: function() {
    return path.resolve(__dirname, '../../../../prod/article-filters.json');
  },

  /**
   * 获取当前黑白名单配置
   * @returns {Promise<Object>} 黑白名单配置
   */
  getFilterConfig: async function() {
    try {
      const configPath = this.getFilterConfigPath();
      
      // 如果配置文件不存在，创建默认配置
      if (!(await fs.pathExists(configPath))) {
        const defaultConfig = {
          lastUpdated: new Date().toISOString(),
          blacklist: {
            description: "黑名单：即使文章出现在generated目录也不显示在列表里",
            articles: []
          },
          whitelist: {
            description: "白名单：对于在static目录的文章，特别允许它显示在文章列表里",
            articles: []
          }
        };
        
        await fs.writeJson(configPath, defaultConfig, { spaces: 2 });
        return defaultConfig;
      }
      
      return await fs.readJson(configPath);
    } catch (error) {
      console.error('读取黑白名单配置失败:', error);
      throw error;
    }
  },

  /**
   * 更新黑白名单配置
   * @param {Object} config - 新的配置对象
   * @returns {Promise<boolean>} 是否更新成功
   */
  updateFilterConfig: async function(config) {
    try {
      const configPath = this.getFilterConfigPath();
      
      // 备份原配置
      if (await fs.pathExists(configPath)) {
        const backupPath = configPath.replace('.json', `.backup.${Date.now()}.json`);
        await fs.copy(configPath, backupPath);
      }
      
      // 验证配置格式
      if (!this.validateConfig(config)) {
        throw new Error('配置格式无效');
      }
      
      // 更新时间戳
      config.lastUpdated = new Date().toISOString();
      
      // 写入新配置
      await fs.writeJson(configPath, config, { spaces: 2 });
      
      return true;
    } catch (error) {
      console.error('更新黑白名单配置失败:', error);
      throw error;
    }
  },

  /**
   * 验证配置格式
   * @param {Object} config - 配置对象
   * @returns {boolean} 是否有效
   */
  validateConfig: function(config) {
    if (!config || typeof config !== 'object') {
      return false;
    }
    
    if (!config.blacklist || !Array.isArray(config.blacklist.articles)) {
      return false;
    }
    
    if (!config.whitelist || !Array.isArray(config.whitelist.articles)) {
      return false;
    }
    
    return true;
  },

  /**
   * 获取所有页面列表（包含黑白名单状态）
   * @returns {Promise<Object>} 页面列表和黑白名单状态
   */
  getAllPagesWithFilterStatus: async function() {
    try {
      // 获取所有页面
      const allPages = await pageManagerService.getAllPages();
      
      // 获取黑白名单配置
      const filterConfig = await this.getFilterConfig();
      const blacklist = filterConfig.blacklist.articles || [];
      const whitelist = filterConfig.whitelist.articles || [];
      
      // 分类页面
      const generatedPages = allPages.filter(page => page.type === 'generated' && !page.name.startsWith('preview-'));
      const staticPages = allPages.filter(page => page.type === 'static');
      
      // 添加过滤状态
      const generatedWithStatus = generatedPages.map(page => ({
        ...page,
        inBlacklist: blacklist.includes(page.name),
        canAddToBlacklist: true,
        canAddToWhitelist: false
      }));
      
      const staticWithStatus = staticPages.map(page => ({
        ...page,
        inWhitelist: whitelist.includes(page.name),
        canAddToBlacklist: false,
        canAddToWhitelist: true
      }));
      
      return {
        generated: generatedWithStatus,
        static: staticWithStatus,
        blacklist: blacklist,
        whitelist: whitelist,
        filterConfig: filterConfig
      };
    } catch (error) {
      console.error('获取页面列表失败:', error);
      throw error;
    }
  },

  /**
   * 添加文章到黑名单
   * @param {string|Array} articles - 文章名称或文章名称数组
   * @returns {Promise<boolean>} 是否成功
   */
  addToBlacklist: async function(articles) {
    try {
      const config = await this.getFilterConfig();
      const articlesToAdd = Array.isArray(articles) ? articles : [articles];
      
      // 添加到黑名单，去重
      const currentBlacklist = config.blacklist.articles || [];
      const newBlacklist = [...new Set([...currentBlacklist, ...articlesToAdd])];
      
      // 从白名单中移除（如果存在）
      const currentWhitelist = config.whitelist.articles || [];
      const newWhitelist = currentWhitelist.filter(article => !articlesToAdd.includes(article));
      
      config.blacklist.articles = newBlacklist;
      config.whitelist.articles = newWhitelist;
      
      return await this.updateFilterConfig(config);
    } catch (error) {
      console.error('添加到黑名单失败:', error);
      throw error;
    }
  },

  /**
   * 添加文章到白名单
   * @param {string|Array} articles - 文章名称或文章名称数组
   * @returns {Promise<boolean>} 是否成功
   */
  addToWhitelist: async function(articles) {
    try {
      const config = await this.getFilterConfig();
      const articlesToAdd = Array.isArray(articles) ? articles : [articles];
      
      // 添加到白名单，去重
      const currentWhitelist = config.whitelist.articles || [];
      const newWhitelist = [...new Set([...currentWhitelist, ...articlesToAdd])];
      
      // 从黑名单中移除（如果存在）
      const currentBlacklist = config.blacklist.articles || [];
      const newBlacklist = currentBlacklist.filter(article => !articlesToAdd.includes(article));
      
      config.blacklist.articles = newBlacklist;
      config.whitelist.articles = newWhitelist;
      
      return await this.updateFilterConfig(config);
    } catch (error) {
      console.error('添加到白名单失败:', error);
      throw error;
    }
  },

  /**
   * 从黑白名单中移除文章
   * @param {string|Array} articles - 文章名称或文章名称数组
   * @returns {Promise<boolean>} 是否成功
   */
  removeFromFilters: async function(articles) {
    try {
      const config = await this.getFilterConfig();
      const articlesToRemove = Array.isArray(articles) ? articles : [articles];
      
      // 从黑名单中移除
      const currentBlacklist = config.blacklist.articles || [];
      const newBlacklist = currentBlacklist.filter(article => !articlesToRemove.includes(article));
      
      // 从白名单中移除
      const currentWhitelist = config.whitelist.articles || [];
      const newWhitelist = currentWhitelist.filter(article => !articlesToRemove.includes(article));
      
      config.blacklist.articles = newBlacklist;
      config.whitelist.articles = newWhitelist;
      
      return await this.updateFilterConfig(config);
    } catch (error) {
      console.error('从过滤器中移除失败:', error);
      throw error;
    }
  },

  /**
   * 清理已删除页面的过滤规则
   * @returns {Promise<boolean>} 是否成功
   */
  cleanupDeletedPages: async function() {
    try {
      const config = await this.getFilterConfig();
      const allPages = await pageManagerService.getAllPages();
      const existingPageNames = allPages.map(page => page.name);
      
      // 清理黑名单中不存在的页面
      const cleanedBlacklist = (config.blacklist.articles || []).filter(article => 
        existingPageNames.includes(article)
      );
      
      // 清理白名单中不存在的页面
      const cleanedWhitelist = (config.whitelist.articles || []).filter(article => 
        existingPageNames.includes(article)
      );
      
      config.blacklist.articles = cleanedBlacklist;
      config.whitelist.articles = cleanedWhitelist;
      
      return await this.updateFilterConfig(config);
    } catch (error) {
      console.error('清理已删除页面失败:', error);
      throw error;
    }
  }
};

module.exports = articleFilterService;