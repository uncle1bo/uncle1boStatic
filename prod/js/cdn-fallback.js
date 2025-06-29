/**
 * CDN Fallback Manager - Production Version
 * CDN竞争性备选功能管理器 - 生产版本
 * 提供轻量级的CDN自动切换功能，专注于可靠性
 */

class CDNFallbackManager {
    constructor() {
        this.loadedResources = new Set();
        this.failedResources = new Set();
        this.preferredCDNs = this.getPreferredCDNs();
        this.maxRetries = 3;
        this.timeout = 10000; // 10秒超时
        
        // CDN备选资源配置
        this.cdnResources = {
            // Bootstrap CSS
            'bootstrap-css': {
                primary: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css',
                    'https://cdn.staticfile.org/twitter-bootstrap/5.3.0/css/bootstrap.min.css',
                    'https://cdn.bootcss.com/twitter-bootstrap/5.3.0/css/bootstrap.min.css'
                ],
                type: 'css'
            },
            
            // Bootstrap JS
            'bootstrap-js': {
                primary: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js',
                    'https://cdn.staticfile.org/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js',
                    'https://ajax.aspnetcdn.com/ajax/bootstrap/5.3.0/bootstrap.bundle.min.js'
                ],
                type: 'js'
            },
            
            // Bootstrap Icons
            'bootstrap-icons': {
                primary: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.5/font/bootstrap-icons.css',
                    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.min.css'
                ],
                type: 'css'
            },
            
            // jQuery
            'jquery': {
                primary: 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js',
                fallbacks: [
                    'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
                    'https://libs.baidu.com/jquery/3.6.0/jquery.min.js'
                ],
                type: 'js'
            },
            
            // Prism.js CSS
            'prism-css': {
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'
                ],
                type: 'css'
            },
            
            // Prism.js Toolbar CSS
            'prism-toolbar-css': {
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/toolbar/prism-toolbar.min.css',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.css'
                ],
                type: 'css'
            },
            
            // Prism.js Core
            'prism-core': {
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js'
                ],
                type: 'js'
            },
            
            // Prism.js Autoloader
            'prism-autoloader': {
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js'
                ],
                type: 'js'
            },
            
            // Prism.js Toolbar
            'prism-toolbar': {
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/toolbar/prism-toolbar.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.js'
                ],
                type: 'js'
            },
            
            // Prism.js Copy to Clipboard
            'prism-copy': {
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js'
                ],
                type: 'js'
            },
            
            // KaTeX CSS
            'katex-css': {
                primary: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css',
                fallbacks: [
                    'https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.8/katex.min.css'
                ],
                type: 'css'
            },
            
            // KaTeX JS
            'katex-js': {
                primary: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js',
                fallbacks: [],
                type: 'js'
            },
            
            // Mermaid
            'mermaid': {
                primary: 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js'
                ],
                type: 'js'
            }
        };
    }
    
    /**
     * 获取用户偏好的CDN提供商
     */
    getPreferredCDNs() {
        const stored = localStorage.getItem('preferred-cdns');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn('Failed to parse stored CDN preferences');
            }
        }
        return {};
    }
    
    /**
     * 保存CDN偏好设置
     */
    savePreferredCDNs() {
        localStorage.setItem('preferred-cdns', JSON.stringify(this.preferredCDNs));
    }
    
    /**
     * 加载CSS资源
     */
    loadCSS(url, id) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            if (id) link.id = id;
            
            const timeout = setTimeout(() => {
                reject(new Error(`CSS load timeout: ${url}`));
            }, this.timeout);
            
            link.onload = () => {
                clearTimeout(timeout);
                resolve(url);
            };
            
            link.onerror = () => {
                clearTimeout(timeout);
                reject(new Error(`CSS load failed: ${url}`));
            };
            
            document.head.appendChild(link);
        });
    }
    
    /**
     * 加载JS资源
     */
    loadJS(url, id) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            if (id) script.id = id;
            
            const timeout = setTimeout(() => {
                reject(new Error(`JS load timeout: ${url}`));
            }, this.timeout);
            
            script.onload = () => {
                clearTimeout(timeout);
                resolve(url);
            };
            
            script.onerror = () => {
                clearTimeout(timeout);
                reject(new Error(`JS load failed: ${url}`));
            };
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * 尝试加载资源
     */
    async tryLoadResource(resourceKey, urls, retryCount = 0) {
        if (retryCount >= this.maxRetries) {
            throw new Error(`Max retries exceeded for ${resourceKey}`);
        }
        
        const resource = this.cdnResources[resourceKey];
        if (!resource) {
            throw new Error(`Unknown resource: ${resourceKey}`);
        }
        
        for (const url of urls) {
            try {
                if (resource.type === 'css') {
                    await this.loadCSS(url, resourceKey);
                } else {
                    await this.loadJS(url, resourceKey);
                }
                
                // 记录成功的CDN
                this.preferredCDNs[resourceKey] = url;
                this.savePreferredCDNs();
                this.loadedResources.add(resourceKey);
                
                console.log(`Successfully loaded ${resourceKey} from ${url}`);
                return url;
            } catch (error) {
                console.warn(`Failed to load ${resourceKey} from ${url}:`, error.message);
                continue;
            }
        }
        
        // 所有URL都失败，重试
        return this.tryLoadResource(resourceKey, urls, retryCount + 1);
    }
    
    /**
     * 加载单个资源
     */
    async loadResource(resourceKey) {
        if (this.loadedResources.has(resourceKey)) {
            return;
        }
        
        if (this.failedResources.has(resourceKey)) {
            throw new Error(`Resource ${resourceKey} previously failed`);
        }
        
        const resource = this.cdnResources[resourceKey];
        if (!resource) {
            throw new Error(`Unknown resource: ${resourceKey}`);
        }
        
        // 构建URL列表，优先使用偏好的CDN
        const urls = [];
        const preferred = this.preferredCDNs[resourceKey];
        
        if (preferred) {
            urls.push(preferred);
        }
        
        // 添加主要CDN（如果不是偏好的）
        if (resource.primary !== preferred) {
            urls.push(resource.primary);
        }
        
        // 添加备选CDN（排除已添加的）
        resource.fallbacks.forEach(url => {
            if (!urls.includes(url)) {
                urls.push(url);
            }
        });
        
        try {
            await this.tryLoadResource(resourceKey, urls);
        } catch (error) {
            this.failedResources.add(resourceKey);
            console.error(`Failed to load resource ${resourceKey}:`, error.message);
            throw error;
        }
    }
    
    /**
     * 替换现有CDN链接
     */
    replaceExistingCDNs() {
        // 替换CSS链接
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        cssLinks.forEach(link => {
            const href = link.href;
            
            // 检查是否匹配已知的CDN资源
            for (const [resourceKey, resource] of Object.entries(this.cdnResources)) {
                if (resource.type === 'css') {
                    const allUrls = [resource.primary, ...resource.fallbacks];
                    if (allUrls.some(url => href.includes(this.extractResourceIdentifier(url)))) {
                        link.remove();
                        this.loadResource(resourceKey).catch(console.error);
                        break;
                    }
                }
            }
        });
        
        // 替换JS脚本
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const src = script.src;
            
            // 检查是否匹配已知的CDN资源
            for (const [resourceKey, resource] of Object.entries(this.cdnResources)) {
                if (resource.type === 'js') {
                    const allUrls = [resource.primary, ...resource.fallbacks];
                    if (allUrls.some(url => src.includes(this.extractResourceIdentifier(url)))) {
                        script.remove();
                        this.loadResource(resourceKey).catch(console.error);
                        break;
                    }
                }
            }
        });
    }
    
    /**
     * 提取资源标识符
     */
    extractResourceIdentifier(url) {
        // 提取URL中的关键部分用于匹配
        if (url.includes('bootstrap')) return 'bootstrap';
        if (url.includes('jquery')) return 'jquery';
        if (url.includes('prism')) return 'prism';
        if (url.includes('katex')) return 'katex';
        if (url.includes('mermaid')) return 'mermaid';
        return url.split('/').pop().split('.')[0];
    }
    
    /**
     * 初始化CDN管理器
     */
    async init() {
        console.log('CDN Fallback Manager initialized');
        
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // 替换现有的CDN链接
        this.replaceExistingCDNs();
    }
}

// 全局实例
window.cdnManager = new CDNFallbackManager();

// 自动初始化
window.cdnManager.init().catch(console.error);

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CDNFallbackManager;
}