/**
 * 页面管理器服务
 * 负责管理网站页面的查看、删除和创建
 */

const fs = require('fs-extra');
const path = require('path');
const paths = require('../../config/pathConfig');
const pageGenerator = require('../pageGenerator');

/**
 * 页面管理器服务
 */
const pageManagerService = {
  /**
   * 获取所有页面列表
   * @returns {Promise<Array>} 页面列表
   */
  getAllPages: async function() {
    try {
      // 获取pages目录路径
      const pagesPath = paths.getPagesPath();
      
      // 确保目录存在
      await fs.ensureDir(pagesPath);
      
      // 读取目录内容
      const files = await fs.readdir(pagesPath);
      
      // 过滤出HTML文件并获取详细信息
      const pages = [];
      
      for (const file of files) {
        if (path.extname(file).toLowerCase() === '.html') {
          const filePath = path.join(pagesPath, file);
          const stats = await fs.stat(filePath);
          
          // 获取中文和英文的页面标题
          const pageName = file.replace('.html', '');
          let zhTitle = pageName;
          let enTitle = pageName;
          
          try {
            // 尝试从中文语言文件获取标题
            const zhLocaleFile = path.join(paths.getLocalesPath('zh-CN'), `${pageName}.json`);
            if (await fs.pathExists(zhLocaleFile)) {
              const zhLocale = await fs.readJson(zhLocaleFile);
              zhTitle = zhLocale.meta?.title || pageName;
            }
            
            // 尝试从英文语言文件获取标题
            const enLocaleFile = path.join(paths.getLocalesPath('en'), `${pageName}.json`);
            if (await fs.pathExists(enLocaleFile)) {
              const enLocale = await fs.readJson(enLocaleFile);
              enTitle = enLocale.meta?.title || pageName;
            }
          } catch (error) {
            console.error(`读取语言文件失败: ${pageName}`, error);
          }
          
          // 检查页面是否可编辑
      const editable = await pageGenerator.isPageEditable(pageName);
          
          pages.push({
            name: pageName,
            file: file,
            path: filePath,
            size: stats.size,
            modified: stats.mtime,
            zhTitle,
            enTitle,
            editable
          });
        }
      }
      
      // 按修改时间排序，最新的在前面
      pages.sort((a, b) => b.modified - a.modified);
      
      return pages;
    } catch (error) {
      console.error('获取页面列表失败:', error);
      throw error;
    }
  },
  
  /**
   * 删除页面
   * @param {string} pageName - 页面名称
   * @returns {Promise<boolean>} 是否删除成功
   */
  deletePage: async function(pageName) {
    try {
      // 删除HTML文件
      const htmlFile = path.join(paths.getPagesPath(), `${pageName}.html`);
      if (await fs.pathExists(htmlFile)) {
        await fs.remove(htmlFile);
      }
      
      // 删除中文语言文件
      const zhLocaleFile = path.join(paths.getLocalesPath('zh-CN'), `${pageName}.json`);
      if (await fs.pathExists(zhLocaleFile)) {
        await fs.remove(zhLocaleFile);
      }
      
      // 删除英文语言文件
      const enLocaleFile = path.join(paths.getLocalesPath('en'), `${pageName}.json`);
      if (await fs.pathExists(enLocaleFile)) {
        await fs.remove(enLocaleFile);
      }
      
      // 删除页面源数据文件
      const dataFile = paths.getPageDataFile(pageName);
      if (await fs.pathExists(dataFile)) {
        await fs.remove(dataFile);
      }
      
      return true;
    } catch (error) {
      console.error(`删除页面失败: ${pageName}`, error);
      throw error;
    }
  },
  
  /**
   * 清理预览文件
   * @returns {Promise<number>} 清理的文件数量
   */
  cleanupPreviewFiles: async function() {
    try {
      const pagesPath = paths.getPagesPath();
      const files = await fs.readdir(pagesPath);
      
      let cleanedCount = 0;
      
      for (const file of files) {
        if (file.startsWith('preview-') && file.endsWith('.html')) {
          const filePath = path.join(pagesPath, file);
          const stats = await fs.stat(filePath);
          
          // 删除超过1小时的预览文件
          const oneHourAgo = Date.now() - (60 * 60 * 1000);
          if (stats.mtime.getTime() < oneHourAgo) {
            await fs.remove(filePath);
            
            // 删除对应的语言文件
            const pageName = file.replace('.html', '');
            const zhLocaleFile = path.join(paths.getLocalesPath('zh-CN'), `${pageName}.json`);
            const enLocaleFile = path.join(paths.getLocalesPath('en'), `${pageName}.json`);
            
            if (await fs.pathExists(zhLocaleFile)) {
              await fs.remove(zhLocaleFile);
            }
            if (await fs.pathExists(enLocaleFile)) {
              await fs.remove(enLocaleFile);
            }
            
            cleanedCount++;
          }
        }
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('清理预览文件失败:', error);
      throw error;
    }
  }
};

module.exports = pageManagerService;