/**
 * 页面管理器服务
 * 负责管理网站页面的查看、删除和创建
 */

const fs = require('fs-extra');
const path = require('path');
const paths = require('../../config/pathConfig');

/**
 * 页面管理器服务
 */
const pageManagerService = {
  /**
   * 获取所有页面列表
   * @param {boolean} updateArticlesList - 是否更新文章列表文件，默认为false
   * @returns {Promise<Array>} 页面列表
   */
  getAllPages: async function(updateArticlesList = false) {
    try {
      const pages = [];
      
      // 获取生成的页面
      const generatedPages = await this.getPagesFromDirectory(paths.getGeneratedPagesPath(), 'generated');
      pages.push(...generatedPages);
      
      // 获取静态页面
      const staticPages = await this.getPagesFromDirectory(paths.getStaticPagesPath(), 'static');
      pages.push(...staticPages);
      
      // 按修改时间排序，最新的在前面
      pages.sort((a, b) => b.modified - a.modified);
      
      // 只有明确要求时才更新文章列表文件
      if (updateArticlesList) {
        await this.generateArticlesList(pages);
      }
      
      return pages;
    } catch (error) {
      console.error('获取页面列表失败:', error);
      throw error;
    }
  },
  
  /**
   * 从指定目录获取页面列表
   * @param {string} pagesDir - 页面目录路径
   * @param {string} pageType - 页面类型 ('generated' 或 'static')
   * @returns {Promise<Array>} 页面列表
   */
  getPagesFromDirectory: async function(pagesDir, pageType) {
    const pages = [];
    
    // 确保目录存在
    await fs.ensureDir(pagesDir);
    
    // 读取目录内容
    const files = await fs.readdir(pagesDir);
    
    for (const file of files) {
      if (path.extname(file).toLowerCase() === '.html') {
        const filePath = path.join(pagesDir, file);
        const stats = await fs.stat(filePath);
        
        // 获取中文和英文的页面标题
        const pageName = file.replace('.html', '');
        const titles = await this.getPageTitles(pageName, pageType);
        
        // 判断页面是否可编辑（生成页面可编辑，静态页面不可编辑）
        const editable = pageType === 'generated';
        
        pages.push({
          name: pageName,
          file: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime,
          zhTitle: titles['zh-CN'],
          enTitle: titles['en'],
          editable,
          type: pageType
        });
      }
    }
    
    return pages;
  },
  
  /**
   * 获取页面的多语言标题
   * @param {string} pageName - 页面名称
   * @param {string} pageType - 页面类型 ('generated' 或 'static')
   * @returns {Promise<Object>} 多语言标题对象
   */
  getPageTitles: async function(pageName, pageType) {
    const titles = {};
    const languages = ['zh-CN', 'en'];
    
    // 并行读取所有语言文件以提高性能
    const titlePromises = languages.map(async (lang) => {
      let localeFile;
      if (pageType === 'generated') {
        localeFile = path.join(paths.getGeneratedLocalesPath(lang), `${pageName}.json`);
      } else {
        localeFile = path.join(paths.getStaticLocalesPath(lang), `${pageName}.json`);
      }
      
      try {
        if (await fs.pathExists(localeFile)) {
          const localeData = await fs.readJson(localeFile);
          return { lang, title: localeData.meta?.title || localeData.title || pageName };
        } else {
          return { lang, title: pageName };
        }
      } catch (error) {
        console.error(`读取语言文件失败: ${localeFile}`, error);
        return { lang, title: pageName };
      }
    });
    
    // 等待所有语言文件读取完成
    const results = await Promise.all(titlePromises);
    
    // 构建结果对象
    results.forEach(result => {
      titles[result.lang] = result.title;
    });
    
    return titles;
  },
  
  /**
   * 删除页面
   * @param {string} pageName - 页面名称
   * @returns {Promise<boolean>} 删除是否成功
   */
  deletePage: async function(pageName) {
    try {
      let htmlFile;
      let pageType;
      
      // 先检查是否为生成页面
      const generatedHtmlFile = path.join(paths.getGeneratedPagesPath(), `${pageName}.html`);
      if (await fs.pathExists(generatedHtmlFile)) {
        htmlFile = generatedHtmlFile;
        pageType = 'generated';
      } else {
        // 检查是否为静态页面
        const staticHtmlFile = path.join(paths.getStaticPagesPath(), `${pageName}.html`);
        if (await fs.pathExists(staticHtmlFile)) {
          htmlFile = staticHtmlFile;
          pageType = 'static';
        }
      }
      
      if (!htmlFile) {
        console.error(`页面不存在: ${pageName}`);
        return false;
      }
      
      // 删除HTML文件
      await fs.remove(htmlFile);
      
      // 删除多语言文件
      const languages = ['zh-CN', 'en'];
      for (const lang of languages) {
        let localeFile;
        if (pageType === 'generated') {
          localeFile = path.join(paths.getGeneratedLocalesPath(lang), `${pageName}.json`);
        } else {
          localeFile = path.join(paths.getStaticLocalesPath(lang), `${pageName}.json`);
        }
        
        if (await fs.pathExists(localeFile)) {
          await fs.remove(localeFile);
        }
      }
      
      // 只有生成页面才删除页面数据文件
      if (pageType === 'generated') {
        const dataFile = paths.getPageDataFile(pageName);
        if (await fs.pathExists(dataFile)) {
          await fs.remove(dataFile);
        }
      }
      
      return true;
    } catch (error) {
      console.error(`删除页面失败: ${pageName}`, error);
      return false;
    }
  },
  
  /**
   * 清理预览文件
   * @returns {Promise<number>} 清理的文件数量
   */
  cleanupPreviewFiles: async function() {
    let cleanedCount = 0;
    try {
      const generatedPagesPath = paths.getGeneratedPagesPath();
      
      // 确保目录存在
      if (!(await fs.pathExists(generatedPagesPath))) {
        return cleanedCount;
      }
      
      const files = await fs.readdir(generatedPagesPath);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      for (const file of files) {
        if (file.startsWith('preview-') && file.endsWith('.html')) {
          const filePath = path.join(generatedPagesPath, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < oneHourAgo) {
            // 删除HTML文件
            await fs.remove(filePath);
            cleanedCount++;
            
            // 删除对应的语言文件
            const pageName = file.replace('.html', '');
            const languages = ['zh-CN', 'en'];
            
            for (const lang of languages) {
              const localeFile = path.join(paths.getGeneratedLocalesPath(lang), `${pageName}.json`);
              if (await fs.pathExists(localeFile)) {
                await fs.remove(localeFile);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('清理预览文件失败:', error);
    }
    return cleanedCount;
  },

  /**
   * 生成文章列表JSON文件到prod目录
   * @param {Array} pages - 页面列表
   * @returns {Promise<void>}
   */
  generateArticlesList: async function(pages) {
    try {
      // 过滤出生成的页面（文章），排除预览页面
      const articles = pages.filter(page => 
        page.type === 'generated' && 
        !page.name.startsWith('preview-')
      );
      
      // 构建文章列表数据（简化结构，只保留基本信息）
        const articlesList = articles.map(article => ({
          name: article.name,
          modified: article.modified.toISOString()
        }));
      
      // 确保prod目录存在
      await fs.ensureDir(paths.prod);
      
      // 写入文章列表JSON文件
      const articlesListPath = path.join(paths.prod, 'articles-list.json');
      await fs.writeJson(articlesListPath, {
        lastUpdated: new Date().toISOString(),
        count: articlesList.length,
        articles: articlesList
      }, { spaces: 2 });
    } catch (error) {
      console.error('生成文章列表失败:', error);
    }
  }
};

module.exports = pageManagerService;