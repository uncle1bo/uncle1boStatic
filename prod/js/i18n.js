/**
 * Uncle1bo Static Website
 * 多语言支持模块
 * 
 * 这个文件提供网站的多语言支持功能，允许用户在不同语言版本之间切换。
 * 支持的语言：简体中文(zh-CN)、英文(en)
 */

// 当DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    // i18n module loaded successfully
});

// 监听模板加载完成事件
document.addEventListener('templatesLoaded', function(event) {
    // Templates loaded, initializing i18n
    // 初始化多语言支持
    initI18n();
});

/**
 * 初始化多语言支持
 * @param {string} pageName - 页面名称，用于加载对应的语言文件
 */
async function initI18n(pageName = null) {
    // 获取当前语言或使用默认语言
    const currentLang = localStorage.getItem('preferredLanguage') || 'zh-CN';
    
    // 设置初始语言并加载语言资源
    await setLanguage(currentLang);
    
    // 如果有指定页面名称，确保加载了正确的页面资源
    if (pageName) {
        await loadLanguageResources(currentLang, pageName);
        applyTranslations();
    }
    
    // 为语言选择器添加事件监听
    const langSelectors = document.querySelectorAll('[data-lang]');
    langSelectors.forEach(selector => {
        selector.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
}

/**
 * 设置网站语言
 * @param {string} lang - 语言代码 (zh-CN, en)
 */
async function setLanguage(lang) {
    // 保存语言偏好到本地存储
    localStorage.setItem('preferredLanguage', lang);
    
    // 更新语言选择器的活动状态
    updateLanguageSelector(lang);
    
    // 更新HTML lang属性
    document.documentElement.lang = lang;
    
    // 重新加载语言资源并应用翻译
    try {
        await loadLanguageResources(lang);
        applyTranslations();
    } catch (error) {
        console.error('切换语言时加载资源失败:', error);
    }
}

// 全局变量存储公共翻译
let commonTranslations = {};

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
        
        // 检查是否有自定义的basePath配置
        if (window.I18N_CONFIG && window.I18N_CONFIG.basePath) {
            basePath = window.I18N_CONFIG.basePath;
        } else {
            // 检查当前页面是否在子目录中
            if (window.location.pathname.includes('/pages/static/') || window.location.pathname.includes('/pages/generated/')) {
                basePath = '../../';
            } else if (window.location.pathname.includes('/pages/')) {
                basePath = '../';
            }
            basePath += 'locales';
        }
        
        // 初始化翻译缓存
        if (!window._i18nCache) {
            window._i18nCache = {};
        }
        if (!window._i18nCache[lang]) {
            window._i18nCache[lang] = {};
        }
        
        // 首先加载公共语言资源（用于页头页脚模板）
        const commonResourceUrl = `${basePath}/${lang}/common.json`;
        // Loading common language resource
        
        let commonTranslations = {};
        try {
            const commonResponse = await fetch(commonResourceUrl);
            if (commonResponse.ok) {
                commonTranslations = await commonResponse.json();
                // Common translations loaded successfully
                
                // 缓存公共翻译
                window._i18nCache[lang]['common'] = commonTranslations;
            } else {
                console.warn(`Failed to load common language resource: ${commonResponse.status}`);
                
                // 如果加载失败且当前语言不是中文，尝试使用中文翻译
                if (lang !== 'zh-CN' && window._i18nCache['zh-CN'] && window._i18nCache['zh-CN']['common']) {
                    commonTranslations = window._i18nCache['zh-CN']['common'];
                    // Using Chinese common translations as fallback
                }
            }
        } catch (error) {
            console.warn('Failed to load common language resource:', error);
            
            // 如果加载失败且当前语言不是中文，尝试使用中文翻译
            if (lang !== 'zh-CN' && window._i18nCache['zh-CN'] && window._i18nCache['zh-CN']['common']) {
                commonTranslations = window._i18nCache['zh-CN']['common'];
                // Using Chinese common translations as fallback
            }
        }
        
        // 根据页面位置确定语言资源路径
        let resourcePath = pageName;
        if (window.location.pathname.includes('/pages/static/')) {
            resourcePath = `static/${pageName}`;
        } else if (window.location.pathname.includes('/pages/generated/')) {
            resourcePath = `generated/${pageName}`;
        }
        
        const resourceUrl = `${basePath}/${lang}/${resourcePath}.json`;
        // Loading language resource
        
        // 获取语言资源
        const response = await fetch(resourceUrl);
        
        let pageTranslations = {};
        if (response.ok) {
            pageTranslations = await response.json();
            
            // 缓存页面翻译
            window._i18nCache[lang][pageName] = pageTranslations;
        } else {
            console.warn(`Failed to load language resource: ${response.status}`);
            
            // 如果加载失败且当前语言不是中文，尝试使用中文翻译
            if (lang !== 'zh-CN') {
                // 尝试加载中文翻译
                try {
                    const zhResourceUrl = `${basePath}/zh-CN/${resourcePath}.json`;
                    const zhResponse = await fetch(zhResourceUrl);
                    if (zhResponse.ok) {
                        pageTranslations = await zhResponse.json();
                        // Using Chinese translations as fallback
                        
                        // 缓存中文翻译
                        if (!window._i18nCache['zh-CN']) {
                            window._i18nCache['zh-CN'] = {};
                        }
                        window._i18nCache['zh-CN'][pageName] = pageTranslations;
                        window._i18nCache[lang][pageName] = pageTranslations; // 同时缓存到当前语言
                    } else {
                        throw new Error(`Failed to load Chinese language resource: ${zhResponse.status}`);
                    }
                } catch (error) {
                    console.error('Failed to load Chinese language resource as fallback:', error);
                    throw new Error(`Failed to load language resource: ${response.status}`);
                }
            } else {
                throw new Error(`Failed to load language resource: ${response.status}`);
            }
        }
        
        // 合并公共翻译和页面特定翻译
        const mergedTranslations = mergeTranslations(commonTranslations, pageTranslations);
        
        // 缓存合并后的翻译
        window._i18nCache[lang][`${pageName}_merged`] = mergedTranslations;
        
        // 应用翻译
        applyTranslations(mergedTranslations);
        
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

/**
 * 合并两个翻译对象
 * @param {Object} common - 公共翻译对象
 * @param {Object} page - 页面特定翻译对象
 * @returns {Object} - 合并后的翻译对象
 */
function mergeTranslations(common, page) {
    // 创建一个新对象，避免修改原始对象
    const merged = {};
    
    // 深度复制公共翻译
    for (const key in common) {
        if (typeof common[key] === 'object' && common[key] !== null) {
            merged[key] = JSON.parse(JSON.stringify(common[key]));
        } else {
            merged[key] = common[key];
        }
    }
    
    // 深度合并页面特定翻译，页面特定翻译优先级更高
    for (const key in page) {
        if (typeof page[key] === 'object' && page[key] !== null && typeof merged[key] === 'object' && merged[key] !== null) {
            // 如果两者都是对象，递归合并
            merged[key] = mergeObjects(merged[key], page[key]);
        } else {
            // 否则直接覆盖
            merged[key] = page[key];
        }
    }
    
    return merged;
}

/**
 * 递归合并两个对象
 * @param {Object} target - 目标对象
 * @param {Object} source - 源对象
 * @returns {Object} - 合并后的对象
 */
function mergeObjects(target, source) {
    const merged = JSON.parse(JSON.stringify(target));
    
    for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null && typeof merged[key] === 'object' && merged[key] !== null) {
            // 递归合并子对象
            merged[key] = mergeObjects(merged[key], source[key]);
        } else {
            // 直接覆盖
            merged[key] = source[key];
        }
    }
    
    return merged;
}

// 导出函数供其他模块使用
window.i18n = {
    initI18n,
    setLanguage,
    loadLanguageResources,
    applyTranslations,
    mergeTranslations,
    getCurrentLanguage: function() {
        return localStorage.getItem('preferredLanguage') || 'zh-CN';
    },
    getTranslation: function(key, defaultValue = '') {
        const lang = this.getCurrentLanguage();
        // 获取当前页面名称
        const pageName = this._getCurrentPageName();
        
        // 尝试从缓存中获取翻译
        if (window._i18nCache && window._i18nCache[lang] && window._i18nCache[lang][pageName]) {
            const translations = window._i18nCache[lang][pageName];
            const value = getNestedTranslation(translations, key);
            if (value) {
                return value;
            }
        }
        
        // 如果没有找到翻译，返回默认值
        // 如果默认值为空且当前语言不是中文，尝试获取中文翻译
        if (!defaultValue && lang !== 'zh-CN' && window._i18nCache && window._i18nCache['zh-CN'] && window._i18nCache['zh-CN'][pageName]) {
            const zhTranslations = window._i18nCache['zh-CN'][pageName];
            const zhValue = getNestedTranslation(zhTranslations, key);
            if (zhValue) {
                return zhValue;
            }
        }
        
        return defaultValue;
    },
    
    _getCurrentPageName: function() {
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        
        // 如果URL以/结尾或者是根目录，则使用index
        if (lastPart === '' || currentPath === '/') {
            return 'index';
        }
        
        // 否则使用最后一部分，并移除.html扩展名
        return lastPart.replace('.html', '');
    }
};