/**
 * Uncle1bo Static Website
 * 多语言支持模块
 * 
 * 这个文件提供网站的多语言支持功能，允许用户在不同语言版本之间切换。
 * 支持的语言：简体中文(zh-CN)、英文(en)
 */

// 当DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('i18n module loaded successfully!');
});

// 监听模板加载完成事件
document.addEventListener('templatesLoaded', function(event) {
    console.log('Templates loaded, initializing i18n...');
    // 初始化多语言支持
    initI18n();
});

/**
 * 初始化多语言支持
 * @param {string} pageName - 页面名称，用于加载对应的语言文件
 */
function initI18n(pageName = null) {
    // 获取当前语言或使用默认语言
    const currentLang = localStorage.getItem('preferredLanguage') || 'zh-CN';
    
    // 设置初始语言
    setLanguage(currentLang);
    
    // 加载当前页面的语言资源
    loadLanguageResources(currentLang, pageName);
    
    // 为语言选择器添加事件监听
    const langSelectors = document.querySelectorAll('[data-lang]');
    langSelectors.forEach(selector => {
        selector.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            loadLanguageResources(lang, pageName);
        });
    });
}

/**
 * 设置网站语言
 * @param {string} lang - 语言代码 (zh-CN, en)
 */
function setLanguage(lang) {
    // 保存语言偏好到本地存储
    localStorage.setItem('preferredLanguage', lang);
    
    // 更新语言选择器的活动状态
    updateLanguageSelector(lang);
    
    // 更新HTML lang属性
    document.documentElement.lang = lang;
}

/**
 * 加载语言资源
 * @param {string} lang - 语言代码
 * @param {string} pageName - 页面名称，默认为当前页面
 */
async function loadLanguageResources(lang, pageName = null) {
    try {
        // 如果没有提供页面名称，则从URL中获取
        if (!pageName) {
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            
            // 如果URL以/结尾或者是根目录，则使用index
            if (lastPart === '' || currentPath === '/') {
                pageName = 'index';
            } else {
                // 否则使用最后一部分，并移除.html扩展名
                pageName = lastPart.replace('.html', '');
            }
        } else {
            // 确保传入的pageName不包含.html扩展名
            pageName = pageName.replace('.html', '');
        }
        
        // 构建语言资源URL（使用相对路径）
        let basePath = '';
        
        // 检查当前页面是否在子目录中
        if (window.location.pathname.includes('/pages/')) {
            basePath = '../';
        }
        
        const resourceUrl = `${basePath}locales/${lang}/${pageName}.json`;
        console.log('Loading language resource from:', resourceUrl);
        
        // 获取语言资源
        const response = await fetch(resourceUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to load language resource: ${response.status}`);
        }
        
        const translations = await response.json();
        
        // 应用翻译
        applyTranslations(translations);
        
    } catch (error) {
        console.error('Error loading language resources:', error);
        // 如果加载失败，可以选择重定向到相应语言的页面
        // 或者显示错误消息
    }
}

/**
 * 应用翻译到页面元素
 * @param {Object} translations - 翻译键值对
 */
function applyTranslations(translations) {
    // 遍历所有带有data-i18n属性的元素
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        // 获取嵌套对象中的值
        const value = getNestedTranslation(translations, key);
        
        if (value) {
            // 根据元素类型设置内容
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.type === 'placeholder') {
                    element.placeholder = value;
                } else {
                    element.value = value;
                }
            } else {
                element.innerHTML = value;
            }
        }
    });
    
    // 更新页面标题
    const pageTitle = getNestedTranslation(translations, 'meta.title');
    if (pageTitle) {
        document.title = pageTitle;
    }
    
    // 更新meta标签
    const metaDesc = getNestedTranslation(translations, 'meta.description');
    if (metaDesc) {
        const metaDescElement = document.querySelector('meta[name="description"]');
        if (metaDescElement) {
            metaDescElement.setAttribute('content', metaDesc);
        }
    }
    
    const metaKeywords = getNestedTranslation(translations, 'meta.keywords');
    if (metaKeywords) {
        const metaKeywordsElement = document.querySelector('meta[name="keywords"]');
        if (metaKeywordsElement) {
            metaKeywordsElement.setAttribute('content', metaKeywords);
        }
    }
}

/**
 * 获取嵌套对象中的翻译值
 * @param {Object} obj - 翻译对象
 * @param {string} path - 点分隔的路径，例如 'meta.title'
 * @returns {string|null} - 翻译值或null
 */
function getNestedTranslation(obj, path) {
    // 处理旧格式的翻译键（带点的格式）
    if (obj[path]) {
        return obj[path];
    }
    
    // 处理新格式的嵌套对象
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
        if (current[key] === undefined) {
            return null;
        }
        current = current[key];
    }
    
    return typeof current === 'string' ? current : null;
}

/**
 * 更新语言选择器的活动状态
 * @param {string} lang - 当前选择的语言
 */
function updateLanguageSelector(lang) {
    const langSelectors = document.querySelectorAll('[data-lang]');
    
    langSelectors.forEach(selector => {
        if (selector.getAttribute('data-lang') === lang) {
            selector.classList.add('active');
        } else {
            selector.classList.remove('active');
        }
    });
}

/**
 * 获取浏览器首选语言
 * @returns {string} 语言代码
 */
function getBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    
    // 简化语言代码匹配
    if (browserLang.startsWith('zh')) {
        if (browserLang.includes('TW') || browserLang.includes('HK') || browserLang.includes('MO')) {
            return 'zh-CN';
        }
        return 'zh-CN';
    }
    
    // 默认返回英文
    return 'en';
}

// 导出函数供其他模块使用
window.i18n = {
    initI18n,
    setLanguage,
    loadLanguageResources,
    applyTranslations,
    getCurrentLanguage: function() {
        return localStorage.getItem('preferredLanguage') || 'zh-CN';
    },
    getTranslation: function(key, defaultValue = '') {
        const lang = this.getCurrentLanguage();
        // 这里可以实现一个缓存机制来存储已加载的翻译
        // 目前简单返回默认值，实际使用时应该从已加载的翻译中获取
        return defaultValue;
    }
};