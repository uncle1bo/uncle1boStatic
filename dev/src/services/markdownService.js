/**
 * Markdown服务
 * 负责Markdown内容的处理和转换
 */

const { marked } = require('marked');
const path = require('path');
const fs = require('fs-extra');

// 使用marked库进行Markdown解析
// 自定义解析器已移除

/**
 * Markdown服务
 */
const markdownService = {
  /**
   * 将Markdown内容转换为HTML
   * @param {string} markdownContent - Markdown格式的内容
   * @returns {string} 转换后的HTML内容
   */
  convertToHtml: function(markdownContent) {
    if (!markdownContent) {
      return '';
    }
    
    // 使用marked库解析Markdown
    return marked(markdownContent);
  },
  
  /**
   * 从Markdown内容中提取标题
   * @param {string} markdownContent - Markdown格式的内容
   * @returns {string} 提取的标题
   */
  extractTitle: function(markdownContent) {
    if (!markdownContent) {
      return 'New Page';
    }
    
    // 尝试提取第一个h1标题
    const titleMatch = markdownContent.match(/^\s*#\s+(.+)$/m);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
    
    // 如果没有h1标题，尝试提取第一行作为标题
    const firstLineMatch = markdownContent.match(/^(.+)$/m);
    if (firstLineMatch && firstLineMatch[1]) {
      return firstLineMatch[1].trim();
    }
    
    return 'New Page';
  },
  
  // extractDescription方法已移除，不再需要
};

module.exports = markdownService;