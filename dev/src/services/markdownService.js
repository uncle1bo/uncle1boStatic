/**
 * Markdown服务
 * 负责Markdown内容的处理和转换
 */

const { marked } = require('marked');
const path = require('path');
const fs = require('fs-extra');

// 尝试导入自定义的Markdown解析器
let customParser;
try {
  customParser = require('../tools/pageGenerator/markdown-parser');
  console.log('使用自定义Markdown解析器');
} catch (error) {
  console.log('未找到自定义Markdown解析器，使用marked库');
  customParser = null;
}

/**
 * Markdown服务
 */
const markdownService = {
  /**
   * 将Markdown内容转换为HTML
   * @param {string} markdownContent - Markdown格式的内容
   * @param {boolean} useCustomParser - 是否使用自定义解析器
   * @returns {string} 转换后的HTML内容
   */
  convertToHtml: function(markdownContent, useCustomParser = false) {
    if (!markdownContent) {
      return '';
    }
    
    // 如果指定使用自定义解析器且自定义解析器可用，则使用自定义解析器
    if (useCustomParser && customParser) {
      return customParser.parseMarkdown(markdownContent);
    }
    
    // 否则使用marked库
    return marked(markdownContent);
  },
  
  /**
   * 从Markdown内容中提取标题
   * @param {string} markdownContent - Markdown格式的内容
   * @param {boolean} useCustomParser - 是否使用自定义解析器
   * @returns {string} 提取的标题
   */
  extractTitle: function(markdownContent, useCustomParser = false) {
    if (!markdownContent) {
      return 'New Page';
    }
    
    // 如果指定使用自定义解析器且自定义解析器可用，则使用自定义解析器
    if (useCustomParser && customParser) {
      return customParser.extractTitle(markdownContent);
    }
    
    // 否则使用内置方法
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
  
  /**
   * 从Markdown内容中提取描述
   * @param {string} markdownContent - Markdown格式的内容
   * @param {boolean} useCustomParser - 是否使用自定义解析器
   * @returns {string} 提取的描述
   */
  extractDescription: function(markdownContent, useCustomParser = false) {
    if (!markdownContent) {
      return '';
    }
    
    // 如果指定使用自定义解析器且自定义解析器可用，则使用自定义解析器
    if (useCustomParser && customParser) {
      const metadata = customParser.extractMetadata(markdownContent);
      return metadata.description || '';
    }
    
    // 否则使用内置方法
    // 尝试提取第一个非标题段落作为描述
    const lines = markdownContent.split('\n');
    let description = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // 跳过标题行和空行
      if (line === '' || line.startsWith('#')) {
        continue;
      }
      
      // 找到第一个非标题非空行
      description = line;
      break;
    }
    
    // 移除Markdown语法，保留纯文本
    description = description
      .replace(/\*\*([^*]+)\*\*/g, '$1') // 移除粗体
      .replace(/\*([^*]+)\*/g, '$1')       // 移除斜体
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // 移除链接，保留链接文本
    
    return description;
  }
};

module.exports = markdownService;