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
   * @param {string} options.tabTitle - 选项卡标题（用于浏览器标签页）
   * @param {string} options.pageTitle - 页面标题（用于页面内容区域）
   * @param {string} options.seoDescription - SEO描述
   * @param {string} options.seoKeywords - SEO关键词
   * @param {string} options.content - 页面内容
   * @param {Object} options.translations - 翻译内容
   * @param {Object} options.translations.zh - 中文翻译
   * @param {Object} options.translations.en - 英文翻译
   * @param {boolean} options.isEdit - 是否为编辑模式
   * @param {string} options.subPath - 子路径（可选，用于子文件夹）
   * @returns {Promise<void>}
   */
  generatePage: async function(options) {
    const { pageName, tabTitle, pageTitle, seoDescription, seoKeywords, content, translations, isEdit = false, isPreview = false, subPath } = options;
    
    try {
      // 验证页面名称
      if (!this.validatePageName(pageName)) {
        throw new Error('页面名称只能包含字母、数字和连字符');
      }
      
      // 检查页面是否已存在（仅在非编辑模式下）
      if (!isEdit) {
        const htmlFile = path.join(paths.getPagesPath(), `${pageName}.html`);
        if (await fs.pathExists(htmlFile)) {
          throw new Error('页面已存在');
        }
      }
      
      // 生成HTML文件
      await this.generateHtmlFile({ pageName, tabTitle, pageTitle, content, subPath });
      
      // 生成多语言文件
      await this.generateI18nFiles({ pageName, tabTitle, pageTitle, seoDescription, seoKeywords, translations });
      
      // 只有非预览模式才保存页面数据和清理临时文件
      if (!isPreview) {
        // 保存页面源数据到统一的数据管理系统
        const pageData = {
          pageName,
          tabTitle,
          pageTitle,
          seoDescription,
          seoKeywords,
          content,
          translations,
          editable: true
        };
        await this.savePageData(pageData, 'edit', pageName);
        
        // 清理临时文件
        await this.cleanupTempFiles(pageName);
      }
      
      return { success: true };
    } catch (error) {
      console.error('生成页面失败:', error);
      // 即使生成失败也尝试清理临时文件（仅非预览模式）
      if (!isPreview) {
        try {
          await this.cleanupTempFiles(pageName);
        } catch (cleanupError) {
          console.warn('清理临时文件失败:', cleanupError);
        }
      }
      throw error;
    }
  },
  
  /**
   * 生成HTML文件
   * @param {Object} options - 选项
   * @param {string} options.pageName - 页面名称
   * @param {string} options.tabTitle - 选项卡标题（用于浏览器标签页）
   * @param {string} options.pageTitle - 页面标题（用于页面内容区域）
   * @param {string} options.content - 页面内容（Markdown格式）
   * @param {string} options.subPath - 子路径（可选，用于子文件夹）
   * @returns {Promise<void>}
   */
  generateHtmlFile: async function(options) {
    const { pageName, tabTitle, pageTitle, content, subPath } = options;
    
    // 将Markdown转换为HTML
    const htmlContent = this.convertMarkdownToHtml(content);
    
    // 计算文件的相对路径
    let htmlFile;
    let relativePath;
    
    if (subPath) {
      // 如果指定了子路径，在子文件夹中创建文件
      const subDir = path.join(paths.getGeneratedPagesPath(), subPath);
      await fs.ensureDir(subDir);
      htmlFile = path.join(subDir, `${pageName}.html`);
      relativePath = `pages/generated/${subPath}/${pageName}.html`;
    } else {
      // 默认在generated目录下创建文件
      await fs.ensureDir(paths.getGeneratedPagesPath());
      htmlFile = path.join(paths.getGeneratedPagesPath(), `${pageName}.html`);
      relativePath = `pages/generated/${pageName}.html`;
    }
    
    // 使用模板服务生成完整的HTML
    const fullHtmlContent = templateService.generateFullHtml({
      htmlContent,
      pageName,
      tabTitle,
      pageTitle,
      relativePath
    });
    
    // 保存HTML文件
    await fs.writeFile(htmlFile, fullHtmlContent, 'utf8');
  },
  
  /**
   * 生成多语言文件
   * @param {Object} options - 选项
   * @param {string} options.pageName - 页面名称
   * @param {string} options.tabTitle - 选项卡标题（用于浏览器标签页）
   * @param {string} options.pageTitle - 页面标题（用于页面内容区域）
   * @param {string} options.seoDescription - SEO描述
   * @param {string} options.seoKeywords - SEO关键词
   * @param {Object} options.translations - 翻译内容
   * @returns {Promise<void>}
   */
  generateI18nFiles: async function(options) {
    const { pageName, tabTitle, pageTitle, seoDescription, seoKeywords, translations } = options;
    
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
      tabTitle,
      pageTitle,
      seoDescription,
      seoKeywords,
      customTranslations: processedTranslations
    });
    
    // 复制到generated目录
    await this.copyI18nFilesToGenerated(pageName);
  },
  
  /**
   * 复制多语言文件到generated目录
   * @param {string} pageName - 页面名称
   * @returns {Promise<void>}
   */
  copyI18nFilesToGenerated: async function(pageName) {
    const languages = ['zh-CN', 'en'];
    
    for (const lang of languages) {
      const tempFile = path.join(paths.getTempLocalesPath(lang), `${pageName}.json`);
      const generatedFile = path.join(paths.getGeneratedLocalesPath(lang), `${pageName}.json`);
      
      if (await fs.pathExists(tempFile)) {
        await fs.ensureDir(path.dirname(generatedFile));
        await fs.copy(tempFile, generatedFile);
      }
    }
  },
  
  /**
   * 保存页面数据（草稿或编辑数据）
   * @param {Object} pageData 页面数据
   * @param {string} pageData.pageName - 页面名称
   * @param {string} pageData.tabTitle - 选项卡标题（用于浏览器标签页）
   * @param {string} pageData.pageTitle - 页面标题（用于页面内容区域）
   * @param {string} pageData.seoDescription - SEO描述
   * @param {string} pageData.seoKeywords - SEO关键词
   * @param {string} pageData.content - 页面内容
   * @param {Object} pageData.translations - 翻译内容
   * @param {boolean} pageData.editable - 是否可编辑
   * @param {string} type 数据类型：'draft' 或 'edit'
   * @param {string} pageName 页面名称（编辑模式时使用）
   */
  savePageData: async function(pageData, type = 'draft', pageName = null) {
    let dataFile;
    
    if (type === 'draft') {
      // 草稿模式：保存到临时目录
      dataFile = path.join(paths.temp, 'page-generator-draft.json');
    } else if (type === 'edit' && pageName) {
      // 编辑模式：保存到页面数据目录
      dataFile = paths.getPageDataFile(pageName);
    } else {
      throw new Error('无效的保存类型或缺少页面名称');
    }
    
    await fs.ensureDir(path.dirname(dataFile));
    
    // 添加元数据和默认值
    const dataWithMeta = {
      ...pageData,
      tabTitle: pageData.tabTitle || pageData.pageTitle || pageData.pageName,
      pageTitle: pageData.pageTitle || pageData.pageName,
      seoDescription: pageData.seoDescription || '',
      seoKeywords: pageData.seoKeywords || '',
      metadata: {
        type: type,
        savedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
    
    await fs.writeFile(dataFile, JSON.stringify(dataWithMeta, null, 2), 'utf8');
  },
  
  /**
   * 加载页面数据（草稿或编辑数据）
   * @param {string} type 数据类型：'draft' 或 'edit'
   * @param {string} pageName 页面名称（编辑模式时使用）
   * @returns {Promise<Object|null>} 页面数据
   */
  loadPageData: async function(type = 'draft', pageName = null) {
    let dataFile;
    
    if (type === 'draft') {
      // 草稿模式：从临时目录加载
      dataFile = path.join(paths.temp, 'page-generator-draft.json');
    } else if (type === 'edit' && pageName) {
      // 编辑模式：从页面数据目录加载
      dataFile = paths.getPageDataFile(pageName);
    } else {
      throw new Error('无效的加载类型或缺少页面名称');
    }
    
    if (await fs.pathExists(dataFile)) {
      try {
        const content = await fs.readFile(dataFile, 'utf8');
        return JSON.parse(content);
      } catch (error) {
        console.error(`加载${type === 'draft' ? '草稿' : '页面数据'}失败:`, error);
        return null;
      }
    }
    
    return null;
  },
  
  /**
   * 保存草稿（兼容性方法）
   * @param {Object} draft 草稿内容
   */
  saveDraft: async function(draft) {
    return await this.savePageData(draft, 'draft');
  },
  
  /**
   * 加载草稿（兼容性方法）
   * @returns {Promise<Object|null>} 草稿内容
   */
  loadDraft: async function() {
    return await this.loadPageData('draft');
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
   * 预览页面 - 完整模拟生成流程但不保存文件
   * @param {Object} options - 选项
   * @param {string} options.pageName - 页面名称
   * @param {string} options.tabTitle - 选项卡标题（用于浏览器标签页）
   * @param {string} options.pageTitle - 页面标题（用于页面内容区域）
   * @param {string} options.seoDescription - SEO描述
   * @param {string} options.seoKeywords - SEO关键词
   * @param {string} options.content - 页面内容（Markdown格式）
   * @param {Object} options.translations - 翻译数据
   * @returns {string} HTML内容
   */
  previewPage: function(options) {
    const { pageName, tabTitle, pageTitle, seoDescription, seoKeywords, content, translations } = options;
    
    try {
      // 1. 验证页面名称（与生成流程一致）
      if (!pageName || !/^[a-zA-Z0-9-_]+$/.test(pageName)) {
        throw new Error('页面名称只能包含字母、数字、连字符和下划线');
      }
      
      // 2. 将Markdown转换为HTML（与生成流程一致）
      const htmlContent = this.convertMarkdownToHtml(content);
      
      // 3. 临时生成多语言文件（模拟生成流程）
      if (translations) {
        this.generateI18nFiles(translations);
      }
      
      // 4. 生成完整HTML（与生成流程一致）
      // 预览时使用默认路径（pages/generated/）
      const relativePath = `pages/generated/${pageName}.html`;
      const fullHtml = templateService.generateFullHtml({
        htmlContent,
        pageName,
        tabTitle: tabTitle || pageTitle || pageName,
        pageTitle: pageTitle || pageName,
        relativePath
      });
      
      console.log(`预览页面生成成功: ${pageName}`);
      return fullHtml;
      
    } catch (error) {
      console.error('预览页面生成失败:', error);
      throw error;
    }
  },
  
  /**
   * 清理临时文件
   * @param {string} pageName - 页面名称
   * @returns {Promise<void>}
   */
  cleanupTempFiles: async function(pageName) {
    try {
      const languages = ['zh-CN', 'en'];
      
      // 如果是预览页面，删除HTML文件
      if (pageName && pageName.startsWith('preview-')) {
        const previewHtmlFile = path.join(paths.getGeneratedPagesPath(), `${pageName}.html`);
        if (await fs.pathExists(previewHtmlFile)) {
          await fs.remove(previewHtmlFile);
          console.log(`已删除预览页面文件: ${previewHtmlFile}`);
        }
        
        // 删除预览页面的多语言文件
        for (const lang of languages) {
          const previewLocaleFile = path.join(paths.getGeneratedLocalesPath(lang), `${pageName}.json`);
          if (await fs.pathExists(previewLocaleFile)) {
            await fs.remove(previewLocaleFile);
            console.log(`已删除预览页面多语言文件: ${previewLocaleFile}`);
          }
        }
      }
      
      // 删除临时多语言文件
      for (const lang of languages) {
        const tempFile = path.join(paths.getTempLocalesPath(lang), `${pageName}.json`);
        if (await fs.pathExists(tempFile)) {
          await fs.remove(tempFile);
          console.log(`已删除临时文件: ${tempFile}`);
        }
      }
      
      // 检查并清理空的临时目录
      await this.cleanupEmptyTempDirectories();
      
    } catch (error) {
      console.error('清理临时文件失败:', error);
      // 不抛出错误，避免影响主流程
    }
  },

  /**
   * 清理空的临时目录
   * @returns {Promise<void>}
   */
  cleanupEmptyTempDirectories: async function() {
    try {
      const languages = ['zh-CN', 'en'];
      
      for (const lang of languages) {
        const tempLangDir = paths.getTempLocalesPath(lang);
        if (await fs.pathExists(tempLangDir)) {
          const files = await fs.readdir(tempLangDir);
          if (files.length === 0) {
            await fs.remove(tempLangDir);
            console.log(`已删除空的临时目录: ${tempLangDir}`);
          }
        }
      }
      
      // 检查locales父目录是否为空
      const tempLocalesDir = path.join(paths.temp, 'locales');
      if (await fs.pathExists(tempLocalesDir)) {
        const dirs = await fs.readdir(tempLocalesDir);
        if (dirs.length === 0) {
          await fs.remove(tempLocalesDir);
          console.log(`已删除空的临时目录: ${tempLocalesDir}`);
        }
      }
      
    } catch (error) {
      console.warn('清理空目录时出错:', error);
    }
  },

  /**
   * 清理草稿文件
   * @returns {Promise<void>}
   */
  cleanupDraftFile: async function() {
    try {
      const draftFile = path.join(paths.temp, 'page-generator-draft.json');
      if (await fs.pathExists(draftFile)) {
        await fs.remove(draftFile);
        console.log(`已删除草稿文件: ${draftFile}`);
      }
    } catch (error) {
      console.warn('清理草稿文件失败:', error);
    }
  },

  /**
   * 清理所有临时文件（包括草稿）
   * @param {string} pageName - 页面名称（可选）
   * @param {boolean} includeDraft - 是否包括草稿文件，默认false
   * @returns {Promise<void>}
   */
  cleanupAllTempFiles: async function(pageName = null, includeDraft = false) {
    try {
      // 如果指定了页面名称，清理该页面的临时文件
      if (pageName) {
        await this.cleanupTempFiles(pageName);
      }
      
      // 如果需要清理草稿文件
      if (includeDraft) {
        await this.cleanupDraftFile();
      }
      
      // 清理空目录
      await this.cleanupEmptyTempDirectories();
      
    } catch (error) {
      console.error('清理所有临时文件失败:', error);
    }
  },

  /**
   * 检查页面是否可编辑
   * @param {string} pageName - 页面名称
   * @returns {Promise<boolean>} 是否可编辑
   */
  isPageEditable: async function(pageName) {
    // 检查页面是否在generated目录中（生成页面可编辑）
    const generatedPagePath = path.join(paths.getGeneratedPagesPath(), `${pageName}.html`);
    if (await fs.pathExists(generatedPagePath)) {
      return true;
    }
    
    // 检查页面是否在static目录中（静态页面不可编辑）
    const staticPagePath = path.join(paths.getStaticPagesPath(), `${pageName}.html`);
    if (await fs.pathExists(staticPagePath)) {
      return false;
    }
    
    // 页面不存在，返回false
    return false;
  },

  /**
   * 将Markdown转换为HTML（增强版）
   * @param {string} markdown - Markdown内容
   * @returns {string} HTML内容
   */
  convertMarkdownToHtml: function(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }
    
    try {
      // 自定义渲染器
      const renderer = new marked.Renderer();
      
      // 自定义代码块渲染，支持Mermaid图表
      renderer.code = (code, language) => {
        const validLanguage = language || 'text';
        const escapedCode = this.escapeHtml(code);
        
        // 检查是否为Mermaid图表
        if (validLanguage === 'mermaid') {
          const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
          return `<div class="mermaid-diagram" data-mermaid-code="${this.escapeHtml(code)}" data-diagram-id="${id}">
            <pre><code class="language-mermaid">${escapedCode}</code></pre>
          </div>`;
        }
        
        return `<pre><code class="language-${validLanguage}">${escapedCode}</code></pre>`;
      };
      
      // 自定义列表项渲染，支持任务列表（checkbox）- 使用Bootstrap样式
      renderer.listitem = (text) => {
        // 检查是否为任务列表项
        const taskListMatch = text.match(/^\s*<input[^>]*type="checkbox"[^>]*>\s*(.*)$/);
        if (taskListMatch) {
          // 提取checkbox的属性和文本内容
          const checkboxMatch = text.match(/<input[^>]*type="checkbox"[^>]*>/)[0];
          const textContent = taskListMatch[1];
          
          // 检查是否为选中状态
          const isChecked = checkboxMatch.includes('checked');
          const checkboxId = 'checkbox-' + Math.random().toString(36).substr(2, 9);
          
          // 使用Bootstrap的form-check样式（只读显示，通过CSS和事件阻止交互）
            return `<li class="list-unstyled">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="${checkboxId}"${isChecked ? ' checked' : ''} readonly onclick="return false;" style="pointer-events: none;">
                <label class="form-check-label" for="${checkboxId}" style="pointer-events: none; cursor: default;">
                  ${textContent}
                </label>
              </div>
            </li>\n`;
        }
        
        return `<li>${text}</li>\n`;
      };
      
      // 先处理LaTeX数学公式，避免被Markdown解析器干扰
      let processedMarkdown = markdown;
      
      // 临时替换LaTeX公式为占位符
      const latexPlaceholders = [];
      let placeholderIndex = 0;
      
      // 处理块级公式 $$...$$
      processedMarkdown = processedMarkdown.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
        const placeholder = `LATEX_BLOCK_${placeholderIndex}`;
        latexPlaceholders[placeholderIndex] = {
          type: 'block',
          formula: formula.trim(),
          original: match
        };
        placeholderIndex++;
        return placeholder;
      });
      
      // 处理行内公式 $...$
      processedMarkdown = processedMarkdown.replace(/\$([^$\n]+)\$/g, (match, formula) => {
        const placeholder = `LATEX_INLINE_${placeholderIndex}`;
        latexPlaceholders[placeholderIndex] = {
          type: 'inline',
          formula: formula.trim(),
          original: match
        };
        placeholderIndex++;
        return placeholder;
      });
      
      // 配置marked选项
      marked.setOptions({
        renderer: renderer,
        breaks: true, // 支持换行
        gfm: true,    // 支持GitHub风格的Markdown
        sanitize: false // 允许HTML标签
      });
      
      let html = marked(processedMarkdown);
      
      // 处理高亮文本 ==text==
      html = html.replace(/==(.*?)==/g, '<mark class="highlight-text">$1</mark>');
      
      // 处理脚注
      const footnotes = {};
      // 先提取脚注定义
      html = html.replace(/^\[\^([^\]]+)\]:\s*(.+)$/gm, (match, id, content) => {
        footnotes[id] = content.trim();
        return ''; // 移除脚注定义
      });
      
      // 替换脚注引用为Bootstrap悬浮提示
      html = html.replace(/\[\^([^\]]+)\]/g, (match, id) => {
        const content = footnotes[id] || '脚注内容未找到';
        return `<sup><span class="footnote-ref" data-bs-toggle="tooltip" data-bs-placement="top" title="${this.escapeHtml(content)}">[${id}]</span></sup>`;
      });
      
      // 恢复LaTeX公式
      latexPlaceholders.forEach((item, index) => {
        const placeholder = item.type === 'block' ? `LATEX_BLOCK_${index}` : `LATEX_INLINE_${index}`;
        if (item.type === 'block') {
          html = html.replace(placeholder, `<div class="katex-display" data-katex="${this.escapeHtml(item.formula)}" data-display="true">${this.escapeHtml(item.original)}</div>`);
        } else {
          html = html.replace(placeholder, `<span class="katex-inline" data-katex="${this.escapeHtml(item.formula)}">${this.escapeHtml(item.original)}</span>`);
        }
      });
      
      // 包装在markdown-content容器中
      return `<div class="markdown-content">${html}</div>`;
    } catch (error) {
      console.error('Markdown转换失败:', error);
      // 如果转换失败，返回原始内容并用<p>标签包装
      return `<div class="markdown-content"><p>${markdown.replace(/\n/g, '<br>')}</p></div>`;
    }
  },
  
  /**
   * HTML转义
   * @param {string} text - 需要转义的文本
   * @returns {string} 转义后的文本
   */
  escapeHtml: function(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
};

module.exports = pageGeneratorService;