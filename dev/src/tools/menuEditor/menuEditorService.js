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
        
        // 检查是否是黑暗模式切换器
        if ($(element).find('#themeToggle').length > 0) {
          // 跳过黑暗模式切换器
          return;
        }
        
        // 检查是否是下拉菜单
        if ($(element).hasClass('dropdown')) {
          // 处理下拉菜单（父菜单）
          const dropdownToggle = $(element).find('.dropdown-toggle');
          const menuName = dropdownToggle.text().trim();
          
          const parentItem = {
            id: `menu-${index}`,
            name: menuName, // 保持字符串格式，前端会转换为多语言对象
            link: dropdownToggle.attr('href') || '#',
            locked: false,
            children: []
          };
          
          // 获取子菜单项
          $(element).find('.dropdown-menu .dropdown-item').each((childIndex, childElement) => {
            // 跳过语言选择器选项
            if ($(childElement).hasClass('language-option')) {
              return;
            }
            
            const childName = $(childElement).text().trim();
            const childLink = $(childElement).attr('href') || '#';
            parentItem.children.push({
              id: `menu-${index}-${childIndex}`,
              name: childName, // 保持字符串格式，前端会转换为多语言对象
              link: childLink,
              locked: childLink.includes('index.html'),
              parent: parentItem.id
            });
          });
          
          menuItems.push(parentItem);
        } else {
          // 处理普通菜单项
          const link = $(element).find('.nav-link');
          const menuName = link.text().trim();
          const activeClass = link.attr('class') || '';
          
          // 提取活动状态占位符
          let activePlaceholder = '';
          if (activeClass.includes('{{')) {
            const match = activeClass.match(/{{([^}]+)}}/); 
            if (match && match[1]) {
              activePlaceholder = match[1];
            }
          }
          
          const menuLink = link.attr('href') || '#';
          menuItems.push({
            id: `menu-${index}`,
            name: menuName, // 保持字符串格式，前端会转换为多语言对象
            link: menuLink,
            activePlaceholder: activePlaceholder,
            locked: menuLink.includes('index.html'),
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
      
      // 清除现有的导航菜单项（保留语言选择器和黑暗模式切换器）
      $('.navbar-nav > li.nav-item').each((index, element) => {
        // 检查是否是语言选择器
        if ($(element).find('.dropdown-toggle[data-bs-toggle="dropdown"]').length > 0 && 
            $(element).find('[data-i18n="nav.language"]').length > 0) {
          // 保留语言选择器
          return;
        }
        
        // 检查是否是黑暗模式切换器
        if ($(element).find('#themeToggle').length > 0) {
          // 保留黑暗模式切换器
          return;
        }
        
        // 移除其他菜单项
        $(element).remove();
      });
      
      // 获取语言选择器和黑暗模式切换器元素
      const languageSelector = $('.navbar-nav > li.nav-item').filter((index, element) => {
        return $(element).find('[data-i18n="nav.language"]').length > 0;
      });
      
      const themeToggle = $('.navbar-nav > li.nav-item').filter((index, element) => {
        return $(element).find('#themeToggle').length > 0;
      });
      
      // 临时移除语言选择器和黑暗模式切换器
      languageSelector.remove();
      themeToggle.remove();
      
      // 添加新的菜单项
      menuData.menuItems.forEach(item => {
        // 获取显示名称（优先使用中文）
        const getDisplayName = (nameObj) => {
          if (typeof nameObj === 'object' && nameObj !== null) {
            return nameObj.zh || nameObj.nameZh || nameObj.en || nameObj.nameEn || '';
          }
          return nameObj || '';
        };
        
        if (item.children && item.children.length > 0) {
          // 创建下拉菜单
          const dropdownHtml = `
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="${item.link || '#'}" id="${item.id}" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-i18n="${item.i18nKey}">
                ${getDisplayName(item.name)}
              </a>
              <ul class="dropdown-menu" aria-labelledby="${item.id}">
                ${item.children.map(child => `
                  <li><a class="dropdown-item" href="${child.link || '#'}" data-i18n="${child.i18nKey}">${getDisplayName(child.name)}</a></li>
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
              <a class="nav-link ${activePlaceholder}" ${ariaCurrent} href="${item.link || '#'}" data-i18n="${item.i18nKey}">${getDisplayName(item.name)}</a>
            </li>
          `;
          $('.navbar-nav').append(menuItemHtml);
        }
      });
      
      // 重新添加黑暗模式切换器和语言选择器
      $('.navbar-nav').append(themeToggle);
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
    // 收集所有菜单项的多语言数据
    const i18nData = {
      'zh-CN': {},
      'en': {}
    };
    
    const processItem = (item, index, parentIndex = null) => {
      // 自动生成i18n键
      let i18nKey;
      if (parentIndex !== null) {
        i18nKey = `menu_${parentIndex}_${index}`;
      } else {
        i18nKey = `menu_${index}`;
      }
      
      // 处理多语言名称
      if (typeof item.name === 'object' && item.name !== null) {
        // 新的多语言对象格式
        i18nData['zh-CN'][i18nKey] = item.name.zh || item.name.nameZh || '';
        i18nData['en'][i18nKey] = item.name.en || item.name.nameEn || item.name.zh || item.name.nameZh || '';
      } else if (typeof item.name === 'string') {
        // 字符串格式，默认作为中文，英文使用相同值
        i18nData['zh-CN'][i18nKey] = item.name;
        i18nData['en'][i18nKey] = item.name;
      }
      
      // 更新item的i18nKey为自动生成的键（用于HTML生成）
      item.i18nKey = `nav.${i18nKey}`;
      
      // 处理子菜单
      if (item.children && item.children.length > 0) {
        item.children.forEach((child, childIndex) => {
          processItem(child, childIndex, index);
        });
      }
    };
    
    menuItems.forEach((item, index) => {
      processItem(item, index);
    });
    
    // 更新中文和英文的common.json文件
    const languages = ['zh-CN', 'en'];
    
    for (const lang of languages) {
      const commonPath = path.join(paths.prod, 'locales', lang, 'common.json');
      
      try {
        // 读取现有的common.json文件
        let commonData = {};
        try {
          const commonContent = await fs.readFile(commonPath, 'utf8');
          commonData = JSON.parse(commonContent);
        } catch (readError) {
          console.log(`创建新的${lang}多语言文件`);
        }
        
        // 清理旧的导航菜单项，重新生成
        commonData.nav = commonData.nav || {};
        
        // 移除所有以menu_开头的旧键和传统键（home, about等）
        const keysToRemove = Object.keys(commonData.nav).filter(key => 
          key.startsWith('menu_') || ['home', 'about', 'services', 'contact'].includes(key)
        );
        keysToRemove.forEach(key => delete commonData.nav[key]);
        
        // 添加新的菜单项
        for (const [key, value] of Object.entries(i18nData[lang])) {
          if (value && value.trim()) {
            commonData.nav[key] = value;
          }
        }
        
        // 保存更新后的common.json文件
        await fs.writeFile(commonPath, JSON.stringify(commonData, null, 2), 'utf8');
        console.log(`已更新${lang}多语言文件，清理了旧键并添加了新的菜单项`);
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