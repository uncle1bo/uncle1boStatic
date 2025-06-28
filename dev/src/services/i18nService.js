/**
 * 多语言服务
 * 负责多语言文件的生成和处理
 */

const fs = require('fs-extra');
const path = require('path');
const paths = require('../config/pathConfig');

/**
 * 多语言服务
 */
const i18nService = {
  /**
   * 生成多语言文件
   * @param {Object} options - 选项
   * @param {string} options.pageName - 页面名称
   * @param {string} options.pageTitle - 页面标题
   * @param {string} options.pageDescription - 页面描述
   * @returns {Promise<void>}
   */
  generateI18nFiles: async function(options) {
    const { pageName, pageTitle, pageDescription } = options;
    
    // 确保临时目录存在
    await this.ensureLocaleDirectories();
    
    // 生成中文语言文件
    await this.generateLanguageFile('zh-CN', { pageName, pageTitle, pageDescription });
    
    // 生成英文语言文件
    await this.generateLanguageFile('en', { pageName, pageTitle, pageDescription });
  },
  
  /**
   * 确保多语言目录存在
   * @returns {Promise<void>}
   */
  ensureLocaleDirectories: async function() {
    await fs.ensureDir(path.join(paths.temp, 'locales', 'zh-CN'));
    await fs.ensureDir(path.join(paths.temp, 'locales', 'en'));
  },
  
  /**
   * 生成特定语言的语言文件
   * @param {string} lang - 语言代码 (zh-CN 或 en)
   * @param {Object} options - 选项
   * @param {string} options.pageName - 页面名称
   * @param {string} options.pageTitle - 页面标题
   * @param {string} options.pageDescription - 页面描述
   * @returns {Promise<void>}
   */
  generateLanguageFile: async function(lang, options) {
    const { pageName, pageTitle, pageDescription } = options;
    
    // 创建语言文件内容
    const content = {
      meta: {
        title: pageTitle || pageName,
        description: pageDescription || '',
        keywords: ''
      },
      [`${pageName}`]: {
        title: pageTitle || pageName,
        content: ''
      }
    };
    
    // 保存语言文件
    const filePath = path.join(paths.temp, 'locales', lang, `${pageName}.json`);
    await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
  }
};

module.exports = i18nService;