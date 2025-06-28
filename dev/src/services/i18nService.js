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
   * @param {Object} options.customTranslations - 自定义翻译键值对 (可选)
   * @param {Object} options.customTranslations.zh - 中文翻译键值对
   * @param {Object} options.customTranslations.en - 英文翻译键值对
   * @returns {Promise<void>}
   */
  generateI18nFiles: async function(options) {
    const { pageName, pageTitle, pageDescription, customTranslations } = options;
    
    // 确保临时目录存在
    await this.ensureLocaleDirectories();
    
    // 生成中文语言文件
    await this.generateLanguageFile('zh-CN', { 
      pageName, 
      pageTitle, 
      pageDescription, 
      customTranslations: customTranslations ? customTranslations.zh : null 
    });
    
    // 生成英文语言文件
    await this.generateLanguageFile('en', { 
      pageName, 
      pageTitle, 
      pageDescription, 
      customTranslations: customTranslations ? customTranslations.en : null 
    });
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
   * @param {Object} options.customTranslations - 自定义翻译键值对 (可选)
   * @returns {Promise<void>}
   */
  generateLanguageFile: async function(lang, options) {
    const { pageName, pageTitle, pageDescription, customTranslations } = options;
    
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
    
    // 如果有自定义翻译，合并到内容中
    if (customTranslations && typeof customTranslations === 'object') {
      // 遍历自定义翻译键值对
      Object.keys(customTranslations).forEach(key => {
        // 处理嵌套键（如 'section.title'）
        if (key.includes('.')) {
          const parts = key.split('.');
          let current = content;
          
          // 创建嵌套结构
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
              current[parts[i]] = {};
            }
            current = current[parts[i]];
          }
          
          // 设置最终值
          current[parts[parts.length - 1]] = customTranslations[key];
        } else {
          // 简单键
          content[key] = customTranslations[key];
        }
      });
    }
    
    // 保存语言文件
    const filePath = path.join(paths.temp, 'locales', lang, `${pageName}.json`);
    await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
  }
};

module.exports = i18nService;