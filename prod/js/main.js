/**
 * Uncle1bo Static Website
 * 主JavaScript文件
 */

// 当DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    // Uncle1bo Static Website loaded successfully
    
    // 初始化工具提示
    initTooltips();
    
    // 添加平滑滚动
    initSmoothScroll();
    
    // 添加动画效果
    initAnimations();
    
    // 检查是否有模板处理器，如果有则等待模板加载完成
    if (window.templateProcessor) {
        // 监听模板加载完成事件
        document.addEventListener('templatesLoaded', function() {
            // Templates loaded, initializing theme manager
            window.ThemeManager.init();
        });
    } else {
        // 直接初始化主题管理器（用于静态页面）
        window.ThemeManager.init();
    }
});

// 为菜单编辑器提供重新初始化主题切换的全局函数
window.reinitThemeToggle = function() {
    if (window.ThemeManager) {
        window.ThemeManager.initThemeToggle();
    }
};

/**
 * 初始化Bootstrap工具提示
 */
function initTooltips() {
    // 初始化所有工具提示
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * 初始化平滑滚动效果
 */
function initSmoothScroll() {
    // 获取所有内部链接
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    // 为每个链接添加点击事件
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 阻止默认行为
            e.preventDefault();
            
            // 获取目标元素
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // 平滑滚动到目标元素
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * 初始化页面动画效果
 */
function initAnimations() {
    // 当元素进入视口时添加动画类
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 50) {
                element.classList.add('animated');
            }
        });
    };
    
    // 初始检查
    animateOnScroll();
    
    // 滚动时检查
    window.addEventListener('scroll', animateOnScroll);
}

/**
 * 示例：添加动态内容加载函数
 * 在实际项目中可以用来从API加载内容
 */
function loadDynamicContent(containerId, contentUrl) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 在实际项目中，这里可以使用fetch API从服务器加载内容
    // 这里仅作为示例
    // Loading content from URL to container
    
    // 模拟加载中状态
    container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    // 这里可以替换为实际的fetch调用
    // fetch(contentUrl)
    //     .then(response => response.json())
    //     .then(data => {
    //         // 处理数据并更新DOM
    //     })
    //     .catch(error => console.error('Error loading content:', error));
}

// 全局主题状态管理
window.ThemeManager = {
    currentTheme: null,
    htmlElement: document.documentElement,
    
    /**
     * 初始化主题管理器
     */
    init: function() {
        // 从localStorage获取保存的主题偏好
        const savedTheme = localStorage.getItem('preferredTheme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // 确定初始主题
        this.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        
        // 应用初始主题
        this.setTheme(this.currentTheme);
        
        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('preferredTheme')) {
                    this.currentTheme = e.matches ? 'dark' : 'light';
                    this.setTheme(this.currentTheme);
                }
            });
            
        
        // 初始化主题切换按钮
        this.initThemeToggle();
    },
    

    
    /**
     * 设置主题
     * @param {string} theme - 主题名称 ('light' 或 'dark')
     */
    setTheme: function(theme) {
        this.currentTheme = theme;
        
        if (theme === 'dark') {
            this.htmlElement.setAttribute('data-bs-theme', 'dark');
        } else {
            this.htmlElement.setAttribute('data-bs-theme', 'light');
        }
        
        // 加载主题配置
        this.loadThemeConfig(theme);
        
        // 更新按钮状态
        this.updateToggleButton();
        
        // 触发主题变化事件
        const themeChangeEvent = new CustomEvent('themeChanged', {
            detail: { theme: theme }
        });
        document.dispatchEvent(themeChangeEvent);
    },
    
    /**
     * 加载主题配置
     * @param {string} theme - 主题名称
     */
    loadThemeConfig: function(theme) {
        try {
            // 更可靠的主题配置文件路径确定方法
            let configPath = './theme-config.json';
            
            // 获取当前页面的路径深度
            const pathname = window.location.pathname;
            const pathSegments = pathname.split('/').filter(segment => segment !== '');
            
            // 根据路径深度确定相对路径
            if (pathname.includes('/pages/static/') || pathname.includes('/pages/generated/')) {
                configPath = '../../theme-config.json';
            } else if (pathname.includes('/pages/')) {
                configPath = '../theme-config.json';
            } else if (pathSegments.length > 1 && !pathname.endsWith('index.html') && !pathname.endsWith('/')) {
                // 处理其他深层路径
                const depth = pathSegments.length - 1;
                configPath = '../'.repeat(depth) + 'theme-config.json';
            }
            
            // 尝试多个可能的路径
            const possiblePaths = [
                configPath,
                './theme-config.json',
                '../theme-config.json',
                '../../theme-config.json',
                '/theme-config.json'  // 绝对路径作为最后尝试
            ];
            
            this.tryLoadThemeConfig(possiblePaths, 0, theme);
        } catch (error) {
            console.warn('应用主题配置失败:', error);
        }
    },
    
    /**
     * 尝试从多个路径加载主题配置
     * @param {Array} paths - 可能的路径数组
     * @param {number} index - 当前尝试的路径索引
     * @param {string} theme - 主题名称
     */
    tryLoadThemeConfig: function(paths, index, theme) {
        if (index >= paths.length) {
            console.warn('所有主题配置路径都加载失败');
            return;
        }
        
        const currentPath = paths[index];
        
        fetch(currentPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(themeConfig => {
                if (themeConfig && themeConfig[theme]) {
                    const config = themeConfig[theme];
                    
                    // 应用CSS变量
                    const root = document.documentElement;
                    
                    // 遍历主题配置并应用CSS变量
                    Object.keys(config).forEach(key => {
                        if (key === 'codeTheme') {
                            // 处理代码主题
                            this.loadCodeTheme(config[key]);
                        } else if (key.startsWith('--')) {
                            // 直接应用CSS变量（属性名已经是CSS变量格式）
                            root.style.setProperty(key, config[key]);
                        }
                    });
                    
                    // 处理代码高亮主题
                    this.loadCodeTheme(config.codeTheme);
                } else {
                    console.warn(`主题配置中未找到主题: ${theme}`);
                }
            })
            .catch(error => {
                // 当前路径失败，尝试下一个
                console.warn(`路径 ${currentPath} 加载失败:`, error.message);
                this.tryLoadThemeConfig(paths, index + 1, theme);
            });
    },
    
    /**
     * 加载代码高亮主题
     * @param {string} codeTheme - 代码主题名称
     */
    loadCodeTheme: function(codeTheme) {
        if (!window.dependencyManager) {
            console.warn('依赖管理器未初始化');
            return;
        }
        
        try {
            // 确定主题文件路径
            let themePath;
            if (codeTheme && codeTheme !== 'default') {
                themePath = `assets/libs/prism/themes/prism-${codeTheme}.min.css`;
            } else {
                themePath = 'assets/libs/prism/themes/prism.min.css';
            }
            
            // 使用依赖管理器切换主题资源
            window.dependencyManager.switchThemeResource('prism-theme-css', themePath)
                .then((success) => {
                    if (success) {
                        // 等待样式加载完成后重新高亮代码
                        this.rehighlightCode();
                    } else {
                        console.warn('代码主题切换失败');
                    }
                })
                .catch(error => {
                    console.warn('代码主题加载失败:', error);
                });
        } catch (error) {
            console.warn('加载代码主题失败:', error);
        }
    },
    
    /**
     * 重新高亮所有代码块
     */
    rehighlightCode: function() {
        if (!window.Prism) {
            return;
        }
        
        try {
            // 移除现有的高亮类
            const codeBlocks = document.querySelectorAll('pre[class*="language-"], code[class*="language-"]');
            codeBlocks.forEach(block => {
                // 清除Prism添加的类和属性
                block.classList.remove('prism-highlighted');
                if (block.hasAttribute('data-prism-highlighted')) {
                    block.removeAttribute('data-prism-highlighted');
                }
            });
            
            // 使用requestAnimationFrame确保DOM更新完成
            requestAnimationFrame(() => {
                // 重新高亮所有代码
                Prism.highlightAll();
            });
        } catch (error) {
            console.warn('重新高亮代码失败:', error);
        }
    },
    
    /**
     * 切换主题
     */
    toggleTheme: function() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        localStorage.setItem('preferredTheme', newTheme);
    },
    
    /**
     * 更新切换按钮的状态
     */
    updateToggleButton: function() {
        const themeIcon = document.getElementById('themeIcon');
        const themeToggle = document.getElementById('themeToggle');
        
        if (themeIcon && themeToggle) {
            if (this.currentTheme === 'dark') {
                themeIcon.className = 'bi bi-moon-fill';
                themeToggle.title = '切换到浅色模式';
            } else {
                themeIcon.className = 'bi bi-sun-fill';
                themeToggle.title = '切换到深色模式';
            }
        }
    },
    
    /**
     * 初始化主题切换按钮（可重复调用）
     */
    initThemeToggle: function() {
        // 移除旧的事件监听器（如果存在）
        const oldToggle = document.getElementById('themeToggle');
        if (oldToggle) {
            // 克隆元素以移除所有事件监听器
            const newToggle = oldToggle.cloneNode(true);
            oldToggle.parentNode.replaceChild(newToggle, oldToggle);
        }
        
        // 重新获取元素并添加事件监听器
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        if (!themeToggle || !themeIcon) {
            console.warn('Theme toggle elements not found');
            return;
        }
        
        // 添加点击事件监听器
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // 更新按钮状态
        this.updateToggleButton();
        
        // Theme toggle initialized successfully
    }
};

/**
 * 初始化黑暗模式切换功能（向后兼容）
 */
function initThemeToggle() {
    window.ThemeManager.initThemeToggle();
}