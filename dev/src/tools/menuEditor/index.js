/**
 * 目录编辑器工具
 * 用于管理网站的导航菜单结构
 */

const menuEditorService = require('./menuEditorService');

/**
 * 目录编辑器模块
 */
const menuEditor = {
  /**
   * 获取导航菜单结构
   * @returns {Promise<Object>} 菜单结构对象
   */
  getMenuStructure: async function() {
    return await menuEditorService.getMenuStructure();
  },
  
  /**
   * 保存导航菜单结构
   * @param {Object} menuData - 菜单结构对象
   * @returns {Promise<Object>} 保存结果
   */
  saveMenuStructure: async function(menuData) {
    return await menuEditorService.saveMenuStructure(menuData);
  }
};

module.exports = menuEditor;