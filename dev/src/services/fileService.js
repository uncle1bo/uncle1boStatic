/**
 * 文件服务
 * 负责文件的读写和复制操作
 */

const fs = require('fs-extra');
const path = require('path');
const paths = require('../config/pathConfig');

/**
 * 文件服务
 */
const fileService = {
  /**
   * 保存HTML内容到文件
   * @param {string} htmlContent - HTML内容
   * @param {string} pageName - 页面名称
   * @returns {Promise<string>} 保存的文件路径
   */
  saveHtmlFile: async function(htmlContent, pageName) {
    // 确保临时目录存在
    await fs.ensureDir(paths.temp);
    
    // 保存HTML文件到临时目录
    const htmlFilePath = path.join(paths.temp, `${pageName}.html`);
    await fs.writeFile(htmlFilePath, htmlContent, 'utf8');
    
    return htmlFilePath;
  },
  
  /**
   * 读取上传的Markdown文件
   * @param {string} filePath - 文件路径
   * @returns {Promise<string>} 文件内容
   */
  readMarkdownFile: async function(filePath) {
    return await fs.readFile(filePath, 'utf8');
  },
  
  /**
   * 删除文件
   * @param {string} filePath - 文件路径
   * @returns {Promise<void>}
   */
  deleteFile: async function(filePath) {
    await fs.remove(filePath);
  },
  
  /**
   * 复制文件到prod目录
   * @param {string} pageName - 页面名称
   * @returns {Promise<void>}
   */
  copyFilesToProd: async function(pageName) {
    // 确保目标目录存在
    await fs.ensureDir(path.join(paths.prod, 'pages'));
    await fs.ensureDir(path.join(paths.prod, 'locales', 'zh-CN'));
    await fs.ensureDir(path.join(paths.prod, 'locales', 'en'));
    
    // 复制HTML文件
    await fs.copy(
      path.join(paths.temp, `${pageName}.html`),
      path.join(paths.prod, 'pages', `${pageName}.html`)
    );
    
    // 复制语言文件
    await fs.copy(
      path.join(paths.temp, 'locales', 'zh-CN', `${pageName}.json`),
      path.join(paths.prod, 'locales', 'zh-CN', `${pageName}.json`)
    );
    
    await fs.copy(
      path.join(paths.temp, 'locales', 'en', `${pageName}.json`),
      path.join(paths.prod, 'locales', 'en', `${pageName}.json`)
    );
    
    console.log(`文件已成功复制到prod目录: ${pageName}`);
  }
};

module.exports = fileService;