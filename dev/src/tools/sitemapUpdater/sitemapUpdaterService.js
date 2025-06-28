/**
 * 站点地图更新服务
 * 负责扫描页面并生成站点地图
 */

const fs = require('fs-extra');
const path = require('path');
const paths = require('../../config/pathConfig');
const fileService = require('../../services/fileService');

/**
 * 获取当前日期，格式为YYYY-MM-DD
 * @returns {string} 格式化的日期字符串
 */
function getCurrentDate() {
  const date = new Date();
  return date.toISOString().split('T')[0];
}

/**
 * 站点地图更新服务
 */
const sitemapUpdaterService = {
  /**
   * 更新站点地图
   * @param {Object} options - 选项
   * @param {string} options.domain - 网站域名 (例如 https://www.example.com)
   * @param {string} options.changefreq - 更新频率 (可选，默认为'weekly')
   * @param {string} options.priority - 优先级 (可选，默认为'0.8')
   * @returns {Promise<string>} 更新后的sitemap.xml文件路径
   */
  updateSitemap: async function(options) {
    const { domain } = options;
    const changefreq = options.changefreq || 'weekly';
    const priority = options.priority || '0.8';
    const currentDate = getCurrentDate();
    
    if (!domain) {
      throw new Error('必须提供网站域名');
    }
    
    // 确保域名格式正确
    const formattedDomain = domain.endsWith('/') ? domain.slice(0, -1) : domain;
    
    try {
      // 获取所有页面文件
      const pagesDir = paths.getPagesPath();
      const indexHtml = path.join(paths.prod, 'index.html');
      
      // 确保页面目录存在
      await fs.ensureDir(pagesDir);
      
      // 获取所有HTML文件
      const pageFiles = await fs.readdir(pagesDir);
      const htmlFiles = pageFiles.filter(file => file.endsWith('.html'));
      
      // 开始生成sitemap.xml内容
      let sitemapContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
      sitemapContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      // 添加首页
      if (await fs.pathExists(indexHtml)) {
        sitemapContent += '  <url>\n';
        sitemapContent += `    <loc>${formattedDomain}/</loc>\n`;
        sitemapContent += `    <lastmod>${currentDate}</lastmod>\n`;
        sitemapContent += '    <changefreq>weekly</changefreq>\n';
        sitemapContent += '    <priority>1.0</priority>\n';
        sitemapContent += '  </url>\n';
      }
      
      // 添加其他页面
      for (const htmlFile of htmlFiles) {
        const pageName = htmlFile;
        sitemapContent += '  <url>\n';
        sitemapContent += `    <loc>${formattedDomain}/pages/${pageName}</loc>\n`;
        sitemapContent += `    <lastmod>${currentDate}</lastmod>\n`;
        sitemapContent += `    <changefreq>${changefreq}</changefreq>\n`;
        sitemapContent += `    <priority>${priority}</priority>\n`;
        sitemapContent += '  </url>\n';
      }
      
      sitemapContent += '</urlset>';
      
      // 保存sitemap.xml文件
      const sitemapPath = path.join(paths.prod, 'sitemap.xml');
      await fs.writeFile(sitemapPath, sitemapContent, 'utf8');
      
      console.log(`站点地图已更新: ${sitemapPath}`);
      return sitemapPath;
    } catch (error) {
      console.error('更新站点地图失败:', error);
      throw error;
    }
  }
};

module.exports = sitemapUpdaterService;