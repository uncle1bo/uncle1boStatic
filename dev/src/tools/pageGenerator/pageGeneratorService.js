/**
 * 页面生成器服务
 * 负责生成新页面的HTML文件和多语言文件
 */

const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const paths = require('../../config/pathConfig');
const templateService = require('../../services/templateService');
const i18nService = require('../../services/i18nService');

/**
 * 页面生成器服务
 */
const pageGeneratorService = {
  /**
   * 生成新页面
   * @param {Object} options - 选项
   * @param {string} options.pageName - 页面名称
   * @param {string} options.pageTitle - 页面标题
   * @param {string} options.content - 页面内容
   * @param {Object} options.translations - 翻译内容
   * @param {Object} options.translations.zh - 中文翻译
   * @param {Object} options.translations.en - 英文翻译
   * @returns {Promise<void>}
   */
  generatePage: async function(options) {
    const { pageName, pageTitle, content, translations } = options;
    
    try {
      // 验证页面名称
      if (!this.validatePageName(pageName)) {
        throw new Error('页面名称只能包含字母、数字和连字符');
      }
      
      // 检查页面是否已存在
      const htmlFile = path.join(paths.getPagesPath(), `${pageName}.html`);
      if (await fs.pathExists(htmlFile)) {
        throw new Error('页面已存在');
      }
      
      // 生成HTML文件
      await this.generateHtmlFile({ pageName, pageTitle, content });
      
      // 生成多语言文件
      await this.generateI18nFiles({ pageName, pageTitle, translations });
      
      return { success: true };
    } catch (error) {
      console.error('生成页面失败:', error);
      throw error;
    }
  },
  
  /**
   * 生成HTML文件
   * @param {Object} options - 选项
   * @param {string} options.pageName - 页面名称
   * @param {string} options.pageTitle - 页面标题
   * @param {string} options.content - 页面内容（Markdown格式）
   * @returns {Promise<void>}
   */
  generateHtmlFile: async function(options) {
    const { pageName, pageTitle, content } = options;
    
    // 将Markdown转换为HTML
    const htmlContent = this.convertMarkdownToHtml(content);
    
    // 使用模板服务生成完整的HTML
    const fullHtmlContent = templateService.generateFullHtml({
      htmlContent,
      pageName,
      pageTitle
    });
    
    // 确保pages目录存在
    await fs.ensureDir(paths.getPagesPath());
    
    // 保存HTML文件
    const htmlFile = path.join(paths.getPagesPath(), `${pageName}.html`);
    await fs.writeFile(htmlFile, fullHtmlContent, 'utf8');
  },
  
  /**
   * 生成多语言文件
   * @param {Object} options - 选项
   * @param {string} options.pageName - 页面名称
   * @param {string} options.pageTitle - 页面标题
   * @param {Object} options.translations - 翻译内容
   * @returns {Promise<void>}
   */
  generateI18nFiles: async function(options) {
    const { pageName, pageTitle, translations } = options;
    
    // 转换translations中的Markdown内容为HTML
    const processedTranslations = {};
    if (translations) {
      Object.keys(translations).forEach(lang => {
        processedTranslations[lang] = {};
        Object.keys(translations[lang]).forEach(key => {
          if (key.endsWith('.content')) {
            // 对内容字段进行Markdown转换
            processedTranslations[lang][key] = this.convertMarkdownToHtml(translations[lang][key]);
          } else {
            // 其他字段直接复制
            processedTranslations[lang][key] = translations[lang][key];
          }
        });
      });
    }
    
    // 生成临时多语言文件
    await i18nService.generateI18nFiles({
      pageName,
      pageTitle,
      customTranslations: processedTranslations
    });
    
    // 复制到prod目录
    await this.copyI18nFilesToProd(pageName);
  },
  
  /**
   * 复制多语言文件到prod目录
   * @param {string} pageName - 页面名称
   * @returns {Promise<void>}
   */
  copyI18nFilesToProd: async function(pageName) {
    const languages = ['zh-CN', 'en'];
    
    for (const lang of languages) {
      const tempFile = path.join(paths.getTempLocalesPath(lang), `${pageName}.json`);
      const prodFile = path.join(paths.getLocalesPath(lang), `${pageName}.json`);
      
      if (await fs.pathExists(tempFile)) {
        await fs.ensureDir(path.dirname(prodFile));
        await fs.copy(tempFile, prodFile);
      }
    }
  },
  
  /**
   * 保存草稿
   * @param {Object} draft - 草稿内容
   * @returns {Promise<void>}
   */
  saveDraft: async function(draft) {
    const draftFile = path.join(paths.temp, 'page-generator-draft.json');
    await fs.ensureDir(path.dirname(draftFile));
    await fs.writeFile(draftFile, JSON.stringify(draft, null, 2), 'utf8');
  },
  
  /**
   * 加载草稿
   * @returns {Promise<Object|null>} 草稿内容
   */
  loadDraft: async function() {
    const draftFile = path.join(paths.temp, 'page-generator-draft.json');
    
    if (await fs.pathExists(draftFile)) {
      try {
        const content = await fs.readFile(draftFile, 'utf8');
        return JSON.parse(content);
      } catch (error) {
        console.error('加载草稿失败:', error);
        return null;
      }
    }
    
    return null;
  },
  
  /**
   * 验证页面名称
   * @param {string} pageName - 页面名称
   * @returns {boolean} 是否有效
   */
  validatePageName: function(pageName) {
    // 只允许字母、数字和连字符
    return /^[a-zA-Z0-9-]+$/.test(pageName);
  },
  
  /**
   * 预览页面
   * @param {Object} options - 选项
   * @param {string} options.pageName - 页面名称
   * @param {string} options.pageTitle - 页面标题
   * @param {string} options.content - 页面内容（Markdown格式）
   * @returns {string} HTML内容
   */
  previewPage: function(options) {
    const { pageName, pageTitle, content } = options;
    
    // 将Markdown转换为HTML
    const htmlContent = this.convertMarkdownToHtml(content);
    
    return templateService.generateFullHtml({
      htmlContent,
      pageName: pageName || 'preview',
      pageTitle: pageTitle || '预览页面'
    });
  },
  
  /**
   * 将Markdown转换为HTML
   * @param {string} markdown - Markdown内容
   * @returns {string} HTML内容
   */
  convertMarkdownToHtml: function(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }
    
    try {
      // 配置marked选项
      marked.setOptions({
        breaks: true, // 支持换行
        gfm: true,    // 支持GitHub风格的Markdown
        sanitize: false // 允许HTML标签
      });
      
      return marked(markdown);
    } catch (error) {
      console.error('Markdown转换失败:', error);
      // 如果转换失败，返回原始内容并用<p>标签包装
      return `<p>${markdown.replace(/\n/g, '<br>')}</p>`;
    }
  }
};

module.exports = pageGeneratorService;