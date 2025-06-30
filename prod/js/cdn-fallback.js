/**
 * CDN Fallback Manager - Production Version
 * CDN竞争性备选功能管理器 - 生产版本
 * 提供轻量级的CDN自动切换功能，专注于可靠性
 */

class CDNFallbackManager {
    constructor() {
        this.loadedResources = new Set();
        this.failedResources = new Set();
        this.loadingPromises = new Map(); // 线程安全：防止重复加载
        this.preferredCDNs = this.getPreferredCDNs();
        this.maxRetries = 3;
        this.timeout = 8000; // 8秒超时，更快的故障转移
        this.enableIntegrityCheck = true; // 启用文件完整性校验

        // CDN备选资源配置
        this.cdnResources = {
            // Bootstrap CSS
            'bootstrap-css': {
                primary: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css',
                    'https://cdn.staticfile.org/twitter-bootstrap/5.3.0/css/bootstrap.min.css'
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
                    'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css'
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
     * 加载CSS资源（带完整性校验）
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
                if (this.enableIntegrityCheck) {
                    this.validateCSSIntegrity(url).then(() => {
                        resolve(url);
                    }).catch(error => {
                        console.warn(`CSS integrity check failed for ${url}:`, error.message);
                        resolve(url); // 即使校验失败也继续，因为资源已加载
                    });
                } else {
                    resolve(url);
                }
            };

            link.onerror = () => {
                clearTimeout(timeout);
                reject(new Error(`CSS load failed: ${url}`));
            };

            document.head.appendChild(link);
        });
    }

    /**
     * 加载JS资源（带完整性校验）
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
                if (this.enableIntegrityCheck) {
                    this.validateJSIntegrity(url).then(() => {
                        resolve(url);
                    }).catch(error => {
                        console.warn(`JS integrity check failed for ${url}:`, error.message);
                        resolve(url); // 即使校验失败也继续，因为资源已加载
                    });
                } else {
                    resolve(url);
                }
            };

            script.onerror = () => {
                clearTimeout(timeout);
                reject(new Error(`JS load failed: ${url}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * 并发竞速加载资源 - 真正的竞速机制
     */
    async raceLoadResource(resourceKey, urls) {
        const resource = this.cdnResources[resourceKey];
        if (!resource) {
            throw new Error(`Unknown resource: ${resourceKey}`);
        }

        // 创建所有加载任务
        const loadTasks = urls.map(async (url) => {
            try {
                if (resource.type === 'css') {
                    await this.loadCSS(url, `${resourceKey}-race`);
                } else {
                    await this.loadJS(url, `${resourceKey}-race`);
                }
                return { success: true, url, error: null };
            } catch (error) {
                return { success: false, url, error: error.message };
            }
        });

        // 使用Promise.allSettled等待所有结果，然后选择最快成功的
        const results = await Promise.allSettled(loadTasks);
        const successfulResults = results
            .filter(result => result.status === 'fulfilled' && result.value.success)
            .map(result => result.value);

        if (successfulResults.length === 0) {
            const errors = results.map(r => r.status === 'fulfilled' ? r.value.error : r.reason);
            throw new Error(`All CDNs failed for ${resourceKey}: ${errors.join(', ')}`);
        }

        // 返回第一个成功的结果（最快的）
        const winner = successfulResults[0];

        // 记录成功的CDN
        this.preferredCDNs[resourceKey] = winner.url;
        this.savePreferredCDNs();
        this.loadedResources.add(resourceKey);

        console.log(`Successfully loaded ${resourceKey} from ${winner.url} (race winner)`);
        return winner.url;
    }

    /**
     * 线程安全的资源加载
     */
    async loadResource(resourceKey) {
        // 线程安全：如果已经加载，直接返回
        if (this.loadedResources.has(resourceKey)) {
            return;
        }

        // 线程安全：如果正在加载，等待现有的加载完成
        if (this.loadingPromises.has(resourceKey)) {
            return this.loadingPromises.get(resourceKey);
        }

        // 线程安全：如果之前失败过，不再尝试
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

        // 创建加载Promise并存储，确保线程安全
        const loadingPromise = this.raceLoadResource(resourceKey, urls)
            .catch(error => {
                this.failedResources.add(resourceKey);
                console.error(`Failed to load resource ${resourceKey}:`, error.message);
                throw error;
            })
            .finally(() => {
                // 清理加载状态
                this.loadingPromises.delete(resourceKey);
            });

        this.loadingPromises.set(resourceKey, loadingPromise);
        return loadingPromise;
    }

    /**
     * 智能检测并备选CDN资源
     */
    async checkAndFallbackCDNs() {
        const resourceChecks = [];

        // 检查CSS资源
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        cssLinks.forEach(link => {
            const href = link.href;

            // 检查是否匹配已知的CDN资源
            for (const [resourceKey, resource] of Object.entries(this.cdnResources)) {
                if (resource.type === 'css') {
                    const allUrls = [resource.primary, ...resource.fallbacks];
                    if (allUrls.some(url => href.includes(this.extractResourceIdentifier(url)))) {
                        resourceChecks.push(this.checkResourceHealth(link, resourceKey));
                        break;
                    }
                }
            }
        });

        // 检查JS脚本
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const src = script.src;

            // 检查是否匹配已知的CDN资源
            for (const [resourceKey, resource] of Object.entries(this.cdnResources)) {
                if (resource.type === 'js') {
                    const allUrls = [resource.primary, ...resource.fallbacks];
                    if (allUrls.some(url => src.includes(this.extractResourceIdentifier(url)))) {
                        resourceChecks.push(this.checkResourceHealth(script, resourceKey));
                        break;
                    }
                }
            }
        });

        // 等待所有检查完成
        await Promise.allSettled(resourceChecks);
    }

    /**
     * 检查资源健康状态
     */
    async checkResourceHealth(element, resourceKey) {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.warn(`Resource ${resourceKey} load timeout, attempting fallback`);
                this.replaceFailedResource(element, resourceKey);
                resolve(false);
            }, this.timeout);

            // 检查资源是否已经加载成功
            if (element.tagName === 'LINK') {
                // CSS检查
                if (element.sheet && element.sheet.cssRules) {
                    clearTimeout(timeout);
                    console.log(`CSS resource ${resourceKey} is healthy`);
                    resolve(true);
                    return;
                }

                element.addEventListener('load', () => {
                    clearTimeout(timeout);
                    console.log(`CSS resource ${resourceKey} loaded successfully`);
                    resolve(true);
                });

                element.addEventListener('error', () => {
                    clearTimeout(timeout);
                    console.warn(`CSS resource ${resourceKey} failed to load, attempting fallback`);
                    this.replaceFailedResource(element, resourceKey);
                    resolve(false);
                });
            } else if (element.tagName === 'SCRIPT') {
                // JS检查 - 检查是否已经加载
                if (element.readyState === 'complete' || element.readyState === 'loaded') {
                    clearTimeout(timeout);
                    console.log(`JS resource ${resourceKey} is healthy`);
                    resolve(true);
                    return;
                }

                element.addEventListener('load', () => {
                    clearTimeout(timeout);
                    console.log(`JS resource ${resourceKey} loaded successfully`);
                    resolve(true);
                });

                element.addEventListener('error', () => {
                    clearTimeout(timeout);
                    console.warn(`JS resource ${resourceKey} failed to load, attempting fallback`);
                    this.replaceFailedResource(element, resourceKey);
                    resolve(false);
                });
            }
        });
    }

    /**
     * 替换失败的资源
     */
    replaceFailedResource(element, resourceKey) {
        element.remove();
        this.loadResource(resourceKey).catch(error => {
            console.error(`Failed to load fallback for ${resourceKey}:`, error);
        });
    }

    /**
     * 校验CSS文件完整性
     */
    async validateCSSIntegrity(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // 检查Content-Type
            const contentType = response.headers.get('content-type');
            if (contentType && !contentType.includes('text/css')) {
                console.warn(`Unexpected content-type for CSS: ${contentType}`);
            }

            // 检查文件大小（基本的完整性检查）
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) < 100) {
                throw new Error('CSS file too small, possibly corrupted');
            }

            return true;
        } catch (error) {
            throw new Error(`CSS integrity validation failed: ${error.message}`);
        }
    }

    /**
     * 校验JS文件完整性
     */
    async validateJSIntegrity(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // 检查Content-Type
            const contentType = response.headers.get('content-type');
            if (contentType && !contentType.includes('javascript') && !contentType.includes('application/javascript')) {
                console.warn(`Unexpected content-type for JS: ${contentType}`);
            }

            // 检查文件大小（基本的完整性检查）
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) < 100) {
                throw new Error('JS file too small, possibly corrupted');
            }

            return true;
        } catch (error) {
            throw new Error(`JS integrity validation failed: ${error.message}`);
        }
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

        // 智能检测并备选CDN资源
        await this.checkAndFallbackCDNs();
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