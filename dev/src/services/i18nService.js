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
   * @param {string} options.tabTitle - 选项卡标题（用于浏览器标签页）
   * @param {string} options.pageTitle - 页面标题（用于页面内容区域）
   * @param {string} options.seoDescription - SEO描述
   * @param {string} options.seoKeywords - SEO关键词
   * @param {Object} options.customTranslations - 自定义翻译键值对 (可选)
   * @param {Object} options.customTranslations.zh - 中文翻译键值对
   * @param {Object} options.customTranslations.en - 英文翻译键值对
   * @returns {Promise<void>}
   */
  generateI18nFiles: async function(options) {
    const { pageName, tabTitle, pageTitle, seoDescription, seoKeywords, customTranslations } = options;
    
    // 确保临时目录存在
    await this.ensureLocaleDirectories();
    
    // 生成中文语言文件
    await this.generateLanguageFile('zh-CN', { 
      pageName, 
      tabTitle,
      pageTitle,
      seoDescription,
      seoKeywords,
      customTranslations: customTranslations ? customTranslations.zh : null 
    });
    
    // 生成英文语言文件
    await this.generateLanguageFile('en', { 
      pageName, 
      tabTitle,
      pageTitle,
      seoDescription,
      seoKeywords,
      customTranslations: customTranslations ? customTranslations.en : null 
    });
  },
  
  /**
   * 确保多语言目录存在
   * @returns {Promise<void>}
   */
  ensureLocaleDirectories: async function() {
    try {
      await fs.ensureDir(path.join(paths.temp, 'locales', 'zh-CN'));
      await fs.ensureDir(path.join(paths.temp, 'locales', 'en'));
    } catch (error) {
      console.error('创建多语言目录失败:', error);
      throw new Error(`创建多语言目录失败: ${error.message}`);
    }
  },
  
  /**
   * 生成特定语言的语言文件
   * @param {string} lang - 语言代码 (zh-CN 或 en)
   * @param {Object} options - 选项
   * @param {string} options.pageName - 页面名称
   * @param {string} options.tabTitle - 选项卡标题（用于浏览器标签页）
   * @param {string} options.pageTitle - 页面标题（用于页面内容区域）
   * @param {string} options.seoDescription - SEO描述
   * @param {string} options.seoKeywords - SEO关键词
   * @param {Object} options.customTranslations - 自定义翻译键值对 (可选)
   * @returns {Promise<void>}
   */
  generateLanguageFile: async function(lang, options) {
    const { pageName, tabTitle, pageTitle, seoDescription, seoKeywords, customTranslations } = options;
    
    // 创建语言文件内容
    const content = {
      meta: {
        title: tabTitle || pageTitle || pageName,  // 选项卡标题
        description: seoDescription || '',         // SEO描述
        keywords: seoKeywords || ''               // SEO关键词
      },
      [`${pageName}`]: {
        title: pageTitle || pageName,              // 页面内容标题
        content: ''
      }
    };
    
    // 如果是英文语言文件，但没有提供英文翻译，使用中文内容作为默认值
    if (lang === 'en' && (!customTranslations || Object.keys(customTranslations).length === 0)) {
      // 获取中文内容作为默认值
      try {
        const zhFilePath = path.join(paths.temp, 'locales', 'zh-CN', `${pageName}.json`);
        if (await fs.pathExists(zhFilePath)) {
          const zhContent = JSON.parse(await fs.readFile(zhFilePath, 'utf8'));
          // 合并中文内容到英文内容中
          Object.assign(content, zhContent);
        }
      } catch (error) {
        console.warn(`无法读取中文内容作为英文默认值: ${error.message}`);
      }
    }
    
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
    try {
      const filePath = path.join(paths.temp, 'locales', lang, `${pageName}.json`);
      await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
    } catch (error) {
      console.error(`保存${lang}语言文件失败:`, error);
      throw new Error(`保存${lang}语言文件失败: ${error.message}`);
    }
  }
};

module.exports = i18nService;