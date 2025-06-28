/**
 * 目录编辑器服务
 * 负责解析和更新导航菜单结构
 */

const fs = require('fs-extra');
const path = require('path');
const paths = require('../../config/pathConfig');
const cheerio = require('cheerio');

/**
 * 目录编辑器服务
 */
const menuEditorService = {
  /**
   * 获取导航菜单结构
   * @returns {Promise<Object>} 菜单结构对象
   */
  getMenuStructure: async function() {
    try {
      // 读取header.html文件
      const headerPath = path.join(paths.prod, 'templates', 'header.html');
      const headerContent = await fs.readFile(headerPath, 'utf8');
      
      // 使用cheerio解析HTML
      const $ = cheerio.load(headerContent);
      
      // 提取导航菜单结构
      const menuItems = [];
      
      // 获取所有一级菜单项
      $('.navbar-nav > li.nav-item').each((index, element) => {
        // 检查是否是语言选择器
        if ($(element).find('.dropdown-toggle[data-bs-toggle="dropdown"]').length > 0 && 
            $(element).find('[data-i18n="nav.language"]').length > 0) {
          // 跳过语言选择器
          return;
        }
        
        // 检查是否是下拉菜单
        if ($(element).hasClass('dropdown')) {
          // 处理下拉菜单（父菜单）
          const dropdownToggle = $(element).find('.dropdown-toggle');
          const menuName = dropdownToggle.text().trim();
          const i18nKey = dropdownToggle.attr('data-i18n') || '';
          
          const parentItem = {
            id: `menu-${index}`,
            name: menuName,
            link: dropdownToggle.attr('href') || '#',
            i18nKey: i18nKey,
            children: []
          };
          
          // 获取子菜单项
          $(element).find('.dropdown-menu .dropdown-item').each((childIndex, childElement) => {
            // 跳过语言选择器选项
            if ($(childElement).hasClass('language-option')) {
              return;
            }
            
            const childName = $(childElement).text().trim();
            const childI18nKey = $(childElement).attr('data-i18n') || '';
            
            parentItem.children.push({
              id: `menu-${index}-${childIndex}`,
              name: childName,
              link: $(childElement).attr('href') || '#',
              i18nKey: childI18nKey,
              parent: parentItem.id
            });
          });
          
          menuItems.push(parentItem);
        } else {
          // 处理普通菜单项
          const link = $(element).find('.nav-link');
          const menuName = link.text().trim();
          const i18nKey = link.attr('data-i18n') || '';
          const activeClass = link.attr('class') || '';
          
          // 提取活动状态占位符
          let activePlaceholder = '';
          if (activeClass.includes('{{')) {
            const match = activeClass.match(/{{([^}]+)}}/);
            if (match && match[1]) {
              activePlaceholder = match[1];
            }
          }
          
          menuItems.push({
            id: `menu-${index}`,
            name: menuName,
            link: link.attr('href') || '#',
            i18nKey: i18nKey,
            activePlaceholder: activePlaceholder,
            children: []
          });
        }
      });
      
      return {
        success: true,
        menuItems: menuItems
      };
    } catch (error) {
      console.error('获取导航菜单结构失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * 保存导航菜单结构
   * @param {Object} menuData - 菜单结构对象
   * @returns {Promise<Object>} 保存结果
   */
  saveMenuStructure: async function(menuData) {
    try {
      // 验证菜单数据
      if (!menuData || !Array.isArray(menuData.menuItems)) {
        throw new Error('无效的菜单数据格式');
      }
      
      // 确保至少有一个首页链接
      const hasHomeLink = menuData.menuItems.some(item => 
        item.link && item.link.includes('index.html') ||
        (item.children && item.children.some(child => child.link && child.link.includes('index.html')))
      );
      
      if (!hasHomeLink) {
        throw new Error('菜单必须包含至少一个指向首页的链接');
      }
      
      // 读取header.html文件
      const headerPath = path.join(paths.prod, 'templates', 'header.html');
      const headerContent = await fs.readFile(headerPath, 'utf8');
      
      // 使用cheerio解析HTML
      const $ = cheerio.load(headerContent, { decodeEntities: false });
      
      // 清除现有的导航菜单项（保留语言选择器）
      $('.navbar-nav > li.nav-item').each((index, element) => {
        // 检查是否是语言选择器
        if ($(element).find('.dropdown-toggle[data-bs-toggle="dropdown"]').length > 0 && 
            $(element).find('[data-i18n="nav.language"]').length > 0) {
          // 保留语言选择器
          return;
        }
        
        // 移除其他菜单项
        $(element).remove();
      });
      
      // 获取语言选择器元素
      const languageSelector = $('.navbar-nav > li.nav-item').filter((index, element) => {
        return $(element).find('[data-i18n="nav.language"]').length > 0;
      });
      
      // 临时移除语言选择器
      languageSelector.remove();
      
      // 添加新的菜单项
      menuData.menuItems.forEach(item => {
        if (item.children && item.children.length > 0) {
          // 创建下拉菜单
          const dropdownHtml = `
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="${item.link || '#'}" id="${item.id}" role="button" data-bs-toggle="dropdown" aria-expanded="false" ${item.i18nKey ? `data-i18n="${item.i18nKey}"` : ''}>
                ${item.name}
              </a>
              <ul class="dropdown-menu" aria-labelledby="${item.id}">
                ${item.children.map(child => `
                  <li><a class="dropdown-item" href="${child.link || '#'}" ${child.i18nKey ? `data-i18n="${child.i18nKey}"` : ''}>${child.name}</a></li>
                `).join('')}
              </ul>
            </li>
          `;
          $('.navbar-nav').append(dropdownHtml);
        } else {
          // 创建普通菜单项
          const activePlaceholder = item.activePlaceholder ? `{{${item.activePlaceholder}}}` : '';
          const ariaCurrent = item.activePlaceholder ? `{{#if ${item.activePlaceholder}}}aria-current="page"{{/if}}` : '';
          
          const menuItemHtml = `
            <li class="nav-item">
              <a class="nav-link ${activePlaceholder}" ${ariaCurrent} href="${item.link || '#'}" ${item.i18nKey ? `data-i18n="${item.i18nKey}"` : ''}>${item.name}</a>
            </li>
          `;
          $('.navbar-nav').append(menuItemHtml);
        }
      });
      
      // 重新添加语言选择器
      $('.navbar-nav').append(languageSelector);
      
      // 保存更新后的header.html文件
      await fs.writeFile(headerPath, $.html(), 'utf8');
      
      // 更新多语言文件
      await this.updateI18nFiles(menuData.menuItems);
      
      return {
        success: true,
        message: '导航菜单结构已成功保存'
      };
    } catch (error) {
      console.error('保存导航菜单结构失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * 更新多语言文件
   * @param {Array} menuItems - 菜单项数组
   * @returns {Promise<void>}
   */
  updateI18nFiles: async function(menuItems) {
    // 收集所有菜单项的i18n键和值
    const i18nData = {};
    
    const processItem = (item) => {
      if (item.i18nKey && item.name) {
        i18nData[item.i18nKey] = item.name;
      }
      
      if (item.children && item.children.length > 0) {
        item.children.forEach(processItem);
      }
    };
    
    menuItems.forEach(processItem);
    
    // 更新中文和英文的common.json文件
    const languages = ['zh-CN', 'en'];
    
    for (const lang of languages) {
      const commonPath = path.join(paths.prod, 'locales', lang, 'common.json');
      
      try {
        // 读取现有的common.json文件
        const commonContent = await fs.readFile(commonPath, 'utf8');
        const commonData = JSON.parse(commonContent);
        
        // 更新导航菜单项
        if (!commonData.nav) {
          commonData.nav = {};
        }
        
        // 更新i18n键值对
        for (const [key, value] of Object.entries(i18nData)) {
          // 处理形如 nav.home 的键
          if (key.startsWith('nav.')) {
            const navKey = key.replace('nav.', '');
            commonData.nav[navKey] = value;
          }
        }
        
        // 保存更新后的common.json文件
        await fs.writeFile(commonPath, JSON.stringify(commonData, null, 2), 'utf8');
      } catch (error) {
        console.error(`更新${lang}多语言文件失败:`, error);
        // 继续处理其他语言文件
      }
    }
  },
  
  /**
   * 从链接获取页面名称
   * @param {string} link - 链接URL
   * @returns {string} 页面名称
   */
  getPageNameFromLink: function(link) {
    if (!link || link === '#') {
      return '';
    }
    
    // 移除占位符和路径前缀
    const cleanLink = link.replace(/{{rootPath}}/g, '');
    
    // 提取文件名
    const fileName = path.basename(cleanLink);
    
    // 移除扩展名
    return fileName.replace('.html', '');
  }
};

module.exports = menuEditorService;