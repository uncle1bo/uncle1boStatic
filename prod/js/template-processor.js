/**
 * Uncle1bo Static Website
 * 模板处理器
 * 
 * 这个文件提供网站的模板处理功能，用于在页面加载时动态插入模板内容。
 */

// 当DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('Template processor loaded successfully!');
    
    // 加载模板
    loadTemplates();
});

/**
 * 加载所有模板
 */
async function loadTemplates() {
    try {
        // 获取当前页面路径信息
        const pageInfo = getPageInfo();
        
        // 加载头部模板
        await loadHeaderTemplate(pageInfo);
        
        // 加载底部模板
        await loadFooterTemplate(pageInfo);
        
        // 触发模板加载完成事件
        const event = new CustomEvent('templatesLoaded', {
            detail: { pageInfo }
        });
        document.dispatchEvent(event);
        console.log('Templates loaded successfully, event dispatched');
        
    } catch (error) {
        console.error('Error loading templates:', error);
    }
}

/**
 * 获取当前页面信息
 * @returns {Object} 页面信息对象
 */
function getPageInfo() {
    const path = window.location.pathname;
    const isRoot = !path.includes('/pages/');
    
    // 确定页面名称
    let pageName = 'index';
    if (!isRoot) {
        const pathParts = path.split('/');
        const fileName = pathParts[pathParts.length - 1];
        pageName = fileName.replace('.html', '');
    }
    
    // 确定路径前缀
    const rootPath = isRoot ? '' : '../';
    const cssPath = isRoot ? 'css/' : '../css/';
    const jsPath = isRoot ? 'js/' : '../js/';
    
    // 确定活动页面
    const activePages = {
        homeActive: pageName === 'index' ? 'active' : '',
        aboutActive: pageName === 'about' ? 'active' : '',
        servicesActive: pageName === 'services' ? 'active' : '',
        contactActive: pageName === 'contact' ? 'active' : '',
        'page-generatorActive': pageName === 'page-generator' ? 'active' : ''
    };
    
    return {
        pageName,
        isRoot,
        rootPath,
        cssPath,
        jsPath,
        ...activePages
    };
}

/**
 * 加载头部模板
 * @param {Object} pageInfo - 页面信息
 */
async function loadHeaderTemplate(pageInfo) {
    try {
        const headerContainer = document.getElementById('header-template');
        if (!headerContainer) return;
        
        const templatePath = `${pageInfo.rootPath}templates/header.html`;
        const response = await fetch(templatePath);
        
        if (!response.ok) {
            throw new Error(`Failed to load header template: ${response.status}`);
        }
        
        let template = await response.text();
        
        // 替换模板变量
        template = template.replace(/{{rootPath}}/g, pageInfo.rootPath)
                          .replace(/{{cssPath}}/g, pageInfo.cssPath)
                          .replace(/{{homeActive}}/g, pageInfo.homeActive)
                          .replace(/{{aboutActive}}/g, pageInfo.aboutActive)
                          .replace(/{{servicesActive}}/g, pageInfo.servicesActive)
                          .replace(/{{contactActive}}/g, pageInfo.contactActive)
                          .replace(/{{page-generatorActive}}/g, pageInfo['page-generatorActive']);
        
        // 插入模板内容
        headerContainer.innerHTML = template;
        
    } catch (error) {
        console.error('Error loading header template:', error);
    }
}

/**
 * 加载底部模板
 * @param {Object} pageInfo - 页面信息
 */
async function loadFooterTemplate(pageInfo) {
    try {
        const footerContainer = document.getElementById('footer-template');
        if (!footerContainer) return;
        
        const templatePath = `${pageInfo.rootPath}templates/footer.html`;
        const response = await fetch(templatePath);
        
        if (!response.ok) {
            throw new Error(`Failed to load footer template: ${response.status}`);
        }
        
        let template = await response.text();
        
        // 替换模板变量
        template = template.replace(/{{jsPath}}/g, pageInfo.jsPath)
                          .replace(/{{pageName}}/g, pageInfo.pageName);
        
        // 插入模板内容
        footerContainer.innerHTML = template;
        
    } catch (error) {
        console.error('Error loading footer template:', error);
    }
}

// 导出函数供其他模块使用
window.templateProcessor = {
    loadTemplates,
    getPageInfo
};