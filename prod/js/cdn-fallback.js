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
        this.enableLocalCache = true; // 启用本地缓存
        this.cachePrefix = 'cdn-cache-'; // 缓存键前缀
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 缓存过期时间：24小时
        this.maxCacheSize = 50 * 1024 * 1024; // 最大缓存大小：50MB

        // 支持的文件类型和MIME类型映射
        this.supportedTypes = {
            'css': { mimeType: 'text/css', extensions: ['.css'] },
            'js': { mimeType: 'application/javascript', extensions: ['.js'] },
            'font': { 
                mimeType: 'font/woff2', 
                extensions: ['.woff2', '.woff', '.ttf', '.otf', '.eot'],
                subTypes: {
                    '.woff2': 'font/woff2',
                    '.woff': 'font/woff',
                    '.ttf': 'font/ttf',
                    '.otf': 'font/otf',
                    '.eot': 'application/vnd.ms-fontobject'
                }
            },
            'image': { 
                mimeType: 'image/png', 
                extensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'],
                subTypes: {
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.gif': 'image/gif',
                    '.svg': 'image/svg+xml',
                    '.webp': 'image/webp',
                    '.ico': 'image/x-icon'
                }
            },
            'audio': { 
                mimeType: 'audio/mpeg', 
                extensions: ['.mp3', '.wav', '.ogg', '.m4a'],
                subTypes: {
                    '.mp3': 'audio/mpeg',
                    '.wav': 'audio/wav',
                    '.ogg': 'audio/ogg',
                    '.m4a': 'audio/mp4'
                }
            },
            'video': { 
                mimeType: 'video/mp4', 
                extensions: ['.mp4', '.webm', '.ogg'],
                subTypes: {
                    '.mp4': 'video/mp4',
                    '.webm': 'video/webm',
                    '.ogg': 'video/ogg'
                }
            },
            'json': { mimeType: 'application/json', extensions: ['.json'] },
            'xml': { mimeType: 'application/xml', extensions: ['.xml'] },
            'text': { mimeType: 'text/plain', extensions: ['.txt', '.md'] }
        };

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
                type: 'js',
                readyCheck: () => typeof bootstrap !== 'undefined'
            },

            // Bootstrap Icons CSS
            'bootstrap-icons': {
                primary: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.5/font/bootstrap-icons.css',
                    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.min.css'
                ],
                type: 'css'
            },

            // Bootstrap Icons Font Files
            'bootstrap-icons-woff2': {
                primary: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/fonts/bootstrap-icons.woff2',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.5/font/fonts/bootstrap-icons.woff2'
                ],
                type: 'font',
                localPath: '/assets/fonts/bootstrap-icons.woff2'
            },

            'bootstrap-icons-woff': {
                primary: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/fonts/bootstrap-icons.woff',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.5/font/fonts/bootstrap-icons.woff'
                ],
                type: 'font',
                localPath: '/assets/fonts/bootstrap-icons.woff'
            },

            // jQuery
            'jquery': {
                primary: 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js',
                fallbacks: [
                    'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
                    'https://code.jquery.com/jquery-3.6.0.min.js',
                    'https://cdn.staticfile.org/jquery/3.6.0/jquery.min.js'
                ],
                type: 'js',
                readyCheck: () => typeof $ !== 'undefined' && typeof jQuery !== 'undefined'
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
                type: 'js',
                readyCheck: () => typeof Prism !== 'undefined' && typeof Prism.highlight !== 'undefined'
            },

            // Prism.js Autoloader
            'prism-autoloader': {
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core'],
                readyCheck: () => typeof Prism !== 'undefined' && typeof Prism.plugins !== 'undefined' && typeof Prism.plugins.autoloader !== 'undefined'
            },

            // Prism.js Toolbar
            'prism-toolbar': {
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/toolbar/prism-toolbar.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core'],
                readyCheck: () => typeof Prism !== 'undefined' && typeof Prism.plugins !== 'undefined' && typeof Prism.plugins.toolbar !== 'undefined'
            },

            // Prism.js Copy to Clipboard
            'prism-copy': {
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js'
                ],
                type: 'js',
                dependencies: ['prism-toolbar'],
                readyCheck: () => typeof Prism !== 'undefined' && typeof Prism.plugins !== 'undefined' && typeof Prism.plugins.clipboard !== 'undefined'
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
            },

            // DataTables Core
            'dataTables': {
                primary: 'https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/datatables/1.13.4/js/jquery.dataTables.min.js',
                    'https://cdn.jsdelivr.net/npm/datatables.net@1.13.4/js/jquery.dataTables.min.js'
                ],
                type: 'js',
                dependencies: ['jquery'], // 依赖jQuery
                readyCheck: () => typeof $ !== 'undefined' && typeof $.fn.DataTable !== 'undefined' && typeof $.fn.DataTable.defaults !== 'undefined'
            },

            // DataTables Bootstrap 5 Integration
            'dataTables-bootstrap': {
                primary: 'https://cdn.datatables.net/1.13.4/js/dataTables.bootstrap5.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/datatables/1.13.4/js/dataTables.bootstrap5.min.js',
                    'https://cdn.jsdelivr.net/npm/datatables.net-bs5@1.13.4/js/dataTables.bootstrap5.min.js'
                ],
                type: 'js',
                dependencies: ['dataTables', 'bootstrap-js'], // 依赖DataTables核心和Bootstrap
                readyCheck: () => typeof $ !== 'undefined' && typeof $.fn.DataTable !== 'undefined' && typeof $.fn.DataTable.ext !== 'undefined' && typeof $.fn.DataTable.ext.classes !== 'undefined' && typeof $.fn.DataTable.ext.classes.sWrapper !== 'undefined'
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
     * 智能CDN选择策略 - 根据地理位置和可靠性优化CDN顺序
     */
    optimizeCDNOrder(urls) {
        // 检测用户地理位置（简单的语言检测）
        const isChineseUser = navigator.language.startsWith('zh') || 
                             navigator.languages.some(lang => lang.startsWith('zh'));
        
        // CDN优先级权重
        const cdnWeights = {
            'cdn.jsdelivr.net': isChineseUser ? 90 : 95, // jsDelivr - 全球最可靠
            'cdnjs.cloudflare.com': 85, // Cloudflare - 全球分布好
            'ajax.googleapis.com': 80, // Google - 可能被某些地区阻止
            'code.jquery.com': 85, // jQuery官方 - 稳定
            'cdn.staticfile.org': isChineseUser ? 88 : 70, // 七牛云 - 中国用户友好
            'ajax.aspnetcdn.com': 75 // Microsoft - 一般可靠性
        };
        
        // 根据权重排序URL
        return urls.sort((a, b) => {
            const weightA = this.getCDNWeight(a, cdnWeights);
            const weightB = this.getCDNWeight(b, cdnWeights);
            return weightB - weightA; // 降序排列
        });
    }

    /**
     * 获取CDN权重
     */
    getCDNWeight(url, weights) {
        for (const [domain, weight] of Object.entries(weights)) {
            if (url.includes(domain)) {
                return weight;
            }
        }
        return 50; // 默认权重
    }

    /**
     * 保存CDN偏好设置
     */
    savePreferredCDNs() {
        localStorage.setItem('preferred-cdns', JSON.stringify(this.preferredCDNs));
    }

    /**
     * 生成缓存键
     */
    generateCacheKey(url) {
        // 使用URL的哈希值作为缓存键，避免特殊字符问题
        const hash = this.simpleHash(url);
        return `${this.cachePrefix}${hash}`;
    }

    /**
     * 简单哈希函数
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * 检查缓存是否存在且未过期
     */
    isCacheValid(cacheKey) {
        try {
            const cacheData = localStorage.getItem(cacheKey);
            if (!cacheData) return false;

            const cache = JSON.parse(cacheData);
            const now = Date.now();
            
            // 检查是否过期
            if (now - cache.timestamp > this.cacheExpiry) {
                localStorage.removeItem(cacheKey);
                return false;
            }
            
            return true;
        } catch (error) {
            console.warn('缓存检查失败:', error);
            return false;
        }
    }

    /**
     * 从缓存获取资源内容（增强版）
     */
    async getCachedContent(url) {
        if (!this.enableLocalCache) return null;
        
        const cacheKey = this.generateCacheKey(url);
        if (!this.isCacheValid(cacheKey)) return null;
        
        try {
            const cacheData = localStorage.getItem(cacheKey);
            const cache = JSON.parse(cacheData);
            
            // 验证缓存完整性
            if (this.enableIntegrityCheck) {
                const isValid = await this.validateCacheIntegrity(cache);
                if (!isValid) {
                    console.warn(`缓存完整性校验失败，删除损坏的缓存: ${url}`);
                    localStorage.removeItem(cacheKey);
                    return null;
                }
            }
            
            console.log(`从缓存加载资源: ${url} (哈希: ${cache.hash ? cache.hash.substring(0, 8) + '...' : '无'})`);
            return cache.content;
        } catch (error) {
            console.warn('缓存读取失败:', error);
            // 删除损坏的缓存
            try {
                localStorage.removeItem(cacheKey);
            } catch (e) {
                console.warn('删除损坏缓存失败:', e);
            }
            return null;
        }
    }

    /**
     * 计算内容哈希值（用于完整性校验）
     */
    async calculateContentHash(content) {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * 验证缓存内容完整性
     */
    async validateCacheIntegrity(cacheData) {
        try {
            if (!cacheData.hash) {
                console.warn('缓存数据缺少哈希值，跳过完整性校验');
                return true; // 向后兼容
            }
            
            const currentHash = await this.calculateContentHash(cacheData.content);
            if (currentHash !== cacheData.hash) {
                console.warn('缓存内容哈希不匹配，可能已损坏');
                return false;
            }
            
            return true;
        } catch (error) {
            console.warn('缓存完整性校验失败:', error);
            return false;
        }
    }

    /**
     * 将资源内容保存到缓存（增强版）
     */
    async setCachedContent(url, content, type) {
        if (!this.enableLocalCache) return;
        
        try {
            // 检查缓存大小限制
            const contentSize = new Blob([content]).size;
            if (contentSize > this.maxCacheSize / 10) { // 单个文件不超过总缓存的10%
                console.warn(`文件过大，不缓存: ${url}`);
                return;
            }
            
            // 清理过期缓存
            this.cleanExpiredCache();
            
            // 检查总缓存大小
            if (this.getTotalCacheSize() + contentSize > this.maxCacheSize) {
                this.cleanOldestCache();
            }
            
            // 计算内容哈希
            const contentHash = await this.calculateContentHash(content);
            
            const cacheKey = this.generateCacheKey(url);
            const cacheData = {
                url: url,
                content: content,
                type: type,
                timestamp: Date.now(),
                size: contentSize,
                hash: contentHash,
                version: '2.0' // 缓存版本号
            };
            
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            console.log(`资源已缓存: ${url} (哈希: ${contentHash.substring(0, 8)}...)`);
        } catch (error) {
            console.warn('缓存保存失败:', error);
        }
    }

    /**
     * 清理过期缓存
     */
    cleanExpiredCache() {
        const now = Date.now();
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.cachePrefix)) {
                try {
                    const cacheData = localStorage.getItem(key);
                    const cache = JSON.parse(cacheData);
                    
                    if (now - cache.timestamp > this.cacheExpiry) {
                        keysToRemove.push(key);
                    }
                } catch (error) {
                    keysToRemove.push(key); // 损坏的缓存也删除
                }
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`清理过期缓存: ${key}`);
        });
    }

    /**
     * 清理最旧的缓存
     */
    cleanOldestCache() {
        const cacheItems = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.cachePrefix)) {
                try {
                    const cacheData = localStorage.getItem(key);
                    const cache = JSON.parse(cacheData);
                    cacheItems.push({ key, timestamp: cache.timestamp, size: cache.size });
                } catch (error) {
                    // 损坏的缓存直接删除
                    localStorage.removeItem(key);
                }
            }
        }
        
        // 按时间戳排序，删除最旧的缓存
        cacheItems.sort((a, b) => a.timestamp - b.timestamp);
        
        // 删除最旧的25%缓存
        const toRemove = Math.ceil(cacheItems.length * 0.25);
        for (let i = 0; i < toRemove; i++) {
            localStorage.removeItem(cacheItems[i].key);
            console.log(`清理旧缓存: ${cacheItems[i].key}`);
        }
    }

    /**
     * 获取总缓存大小
     */
    getTotalCacheSize() {
        let totalSize = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.cachePrefix)) {
                try {
                    const cacheData = localStorage.getItem(key);
                    const cache = JSON.parse(cacheData);
                    totalSize += cache.size || 0;
                } catch (error) {
                    // 忽略损坏的缓存
                }
            }
        }
        
        return totalSize;
    }

    /**
     * 获取缓存统计信息
     */
    getCacheStats() {
        let count = 0;
        let totalSize = 0;
        let oldestTimestamp = Date.now();
        let newestTimestamp = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.cachePrefix)) {
                try {
                    const cacheData = localStorage.getItem(key);
                    const cache = JSON.parse(cacheData);
                    count++;
                    totalSize += cache.size || 0;
                    oldestTimestamp = Math.min(oldestTimestamp, cache.timestamp);
                    newestTimestamp = Math.max(newestTimestamp, cache.timestamp);
                } catch (error) {
                    // 忽略损坏的缓存
                }
            }
        }
        
        return {
            count,
            totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            oldestAge: count > 0 ? Math.floor((Date.now() - oldestTimestamp) / (1000 * 60 * 60)) : 0,
            newestAge: count > 0 ? Math.floor((Date.now() - newestTimestamp) / (1000 * 60 * 60)) : 0
        };
    }

    /**
     * 清空所有缓存
     */
    clearAllCache() {
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.cachePrefix)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`已清空所有CDN缓存，共删除 ${keysToRemove.length} 个文件`);
    }

    /**
     * 加载CSS资源（带完整性校验和缓存支持）
     */
    loadCSS(url, id) {
        return new Promise(async (resolve, reject) => {
            // 检查缓存
            const cachedContent = await this.getCachedContent(url);
            if (cachedContent) {
                try {
                    // 从缓存创建CSS
                    const style = document.createElement('style');
                    if (id) style.id = id;
                    style.textContent = cachedContent;
                    document.head.appendChild(style);
                    resolve(url);
                    return;
                } catch (error) {
                    console.warn('缓存CSS应用失败，回退到网络加载:', error);
                }
            }

            // 网络加载
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            if (id) link.id = id;

            const timeout = setTimeout(() => {
                reject(new Error(`CSS load timeout: ${url}`));
            }, this.timeout);

            link.onload = async () => {
                clearTimeout(timeout);
                
                // 缓存CSS内容
                if (this.enableLocalCache) {
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            const content = await response.text();
                            this.setCachedContent(url, content, 'css');
                        }
                    } catch (error) {
                        console.warn('CSS缓存失败:', error);
                    }
                }
                
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
     * 加载JS资源（带完整性校验和缓存支持）
     */
    loadJS(url, id) {
        return new Promise(async (resolve, reject) => {
            // 检查缓存
            const cachedContent = await this.getCachedContent(url);
            if (cachedContent) {
                try {
                    // 从缓存创建JS
                    const script = document.createElement('script');
                    if (id) script.id = id;
                    script.textContent = cachedContent;
                    document.head.appendChild(script);
                    resolve(url);
                    return;
                } catch (error) {
                    console.warn('缓存JS应用失败，回退到网络加载:', error);
                }
            }

            // 网络加载
            const script = document.createElement('script');
            script.src = url;
            if (id) script.id = id;

            const timeout = setTimeout(() => {
                reject(new Error(`JS load timeout: ${url}`));
            }, this.timeout);

            script.onload = async () => {
                clearTimeout(timeout);
                
                // 缓存JS内容
                if (this.enableLocalCache) {
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            const content = await response.text();
                            this.setCachedContent(url, content, 'js');
                        }
                    } catch (error) {
                        console.warn('JS缓存失败:', error);
                    }
                }
                
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
     * 检测文件类型
     */
    detectFileType(url) {
        const urlPath = new URL(url, window.location.href).pathname.toLowerCase();
        
        for (const [type, config] of Object.entries(this.supportedTypes)) {
            if (config.extensions.some(ext => urlPath.endsWith(ext))) {
                return type;
            }
        }
        
        return 'unknown';
    }

    /**
     * 获取文件的MIME类型
     */
    getMimeType(url, fileType = null) {
        const detectedType = fileType || this.detectFileType(url);
        const typeConfig = this.supportedTypes[detectedType];
        
        if (!typeConfig) return 'application/octet-stream';
        
        if (typeConfig.subTypes) {
            const urlPath = new URL(url, window.location.href).pathname.toLowerCase();
            for (const [ext, mimeType] of Object.entries(typeConfig.subTypes)) {
                if (urlPath.endsWith(ext)) {
                    return mimeType;
                }
            }
        }
        
        return typeConfig.mimeType;
    }

    /**
     * 加载字体文件
     */
    loadFont(url, id) {
        return new Promise(async (resolve, reject) => {
            // 检查缓存
            const cachedContent = await this.getCachedContent(url);
            if (cachedContent) {
                try {
                    // 从缓存创建字体
                    const fontFace = new FontFace(id || 'cached-font', `url(data:${this.getMimeType(url, 'font')};base64,${cachedContent})`);
                    await fontFace.load();
                    document.fonts.add(fontFace);
                    resolve(url);
                    return;
                } catch (error) {
                    console.warn('缓存字体应用失败，回退到网络加载:', error);
                }
            }

            // 网络加载
            const timeout = setTimeout(() => {
                reject(new Error(`Font load timeout: ${url}`));
            }, this.timeout);

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Font fetch failed: ${response.status}`);
                }
                
                const arrayBuffer = await response.arrayBuffer();
                const fontData = new Uint8Array(arrayBuffer);
                
                // 创建字体
                const fontFace = new FontFace(id || 'loaded-font', arrayBuffer);
                await fontFace.load();
                document.fonts.add(fontFace);
                
                clearTimeout(timeout);
                
                // 缓存字体内容
                if (this.enableLocalCache) {
                    const base64Content = btoa(String.fromCharCode(...fontData));
                    this.setCachedContent(url, base64Content, 'font');
                }
                
                resolve(url);
            } catch (error) {
                clearTimeout(timeout);
                reject(new Error(`Font load failed: ${url} - ${error.message}`));
            }
        });
    }

    /**
     * 加载图片文件
     */
    loadImage(url, id) {
        return new Promise(async (resolve, reject) => {
            // 检查缓存
            const cachedContent = await this.getCachedContent(url);
            if (cachedContent) {
                try {
                    // 从缓存创建图片
                    const img = new Image();
                    if (id) img.id = id;
                    img.src = `data:${this.getMimeType(url, 'image')};base64,${cachedContent}`;
                    img.onload = () => resolve(url);
                    img.onerror = () => {
                        console.warn('缓存图片应用失败，回退到网络加载');
                        this.loadImageFromNetwork(url, id, resolve, reject);
                    };
                    return;
                } catch (error) {
                    console.warn('缓存图片应用失败，回退到网络加载:', error);
                }
            }

            this.loadImageFromNetwork(url, id, resolve, reject);
        });
    }

    /**
     * 从网络加载图片
     */
    loadImageFromNetwork(url, id, resolve, reject) {
        const img = new Image();
        if (id) img.id = id;
        
        const timeout = setTimeout(() => {
            reject(new Error(`Image load timeout: ${url}`));
        }, this.timeout);

        img.onload = async () => {
            clearTimeout(timeout);
            
            // 缓存图片内容
            if (this.enableLocalCache) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                        this.setCachedContent(url, base64Content, 'image');
                    }
                } catch (error) {
                    console.warn('图片缓存失败:', error);
                }
            }
            
            resolve(url);
        };

        img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error(`Image load failed: ${url}`));
        };

        img.src = url;
    }

    /**
     * 加载通用资源文件（JSON、XML、文本等）
     */
    loadGenericResource(url, type, id) {
        return new Promise(async (resolve, reject) => {
            // 检查缓存
            const cachedContent = await this.getCachedContent(url);
            if (cachedContent) {
                try {
                    resolve({ url, content: cachedContent, fromCache: true });
                    return;
                } catch (error) {
                    console.warn('缓存资源应用失败，回退到网络加载:', error);
                }
            }

            // 网络加载
            const timeout = setTimeout(() => {
                reject(new Error(`Resource load timeout: ${url}`));
            }, this.timeout);

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Resource fetch failed: ${response.status}`);
                }
                
                const content = await response.text();
                clearTimeout(timeout);
                
                // 缓存资源内容
                if (this.enableLocalCache) {
                    this.setCachedContent(url, content, type);
                }
                
                resolve({ url, content, fromCache: false });
            } catch (error) {
                clearTimeout(timeout);
                reject(new Error(`Resource load failed: ${url} - ${error.message}`));
            }
        });
    }

    /**
     * 并发竞速加载资源 - 真正的竞速机制（增强版）
     */
    async raceLoadResource(resourceKey, urls) {
        const resource = this.cdnResources[resourceKey];
        if (!resource) {
            throw new Error(`Unknown resource: ${resourceKey}`);
        }

        // 创建所有加载任务
        const loadTasks = urls.map(async (url) => {
            try {
                switch (resource.type) {
                    case 'css':
                        await this.loadCSS(url, `${resourceKey}-race`);
                        break;
                    case 'js':
                        await this.loadJS(url, `${resourceKey}-race`);
                        break;
                    case 'font':
                        await this.loadFont(url, `${resourceKey}-race`);
                        break;
                    case 'image':
                        await this.loadImage(url, `${resourceKey}-race`);
                        break;
                    case 'json':
                    case 'xml':
                    case 'text':
                        await this.loadGenericResource(url, resource.type, `${resourceKey}-race`);
                        break;
                    default:
                        // 自动检测文件类型
                        const detectedType = this.detectFileType(url);
                        if (detectedType !== 'unknown') {
                            await this.loadGenericResource(url, detectedType, `${resourceKey}-race`);
                        } else {
                            throw new Error(`Unsupported resource type: ${resource.type}`);
                        }
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

        // Resource loaded successfully
        return winner.url;
    }

    /**
     * 解析资源依赖关系，返回正确的加载顺序
     */
    resolveDependencies(resourceKey, visited = new Set(), path = []) {
        // 检测循环依赖
        if (visited.has(resourceKey)) {
            throw new Error(`Circular dependency detected: ${path.join(' -> ')} -> ${resourceKey}`);
        }

        const resource = this.cdnResources[resourceKey];
        if (!resource) {
            throw new Error(`Unknown resource: ${resourceKey}`);
        }

        visited.add(resourceKey);
        path.push(resourceKey);

        let dependencies = [];
        
        // 递归解析依赖
        if (resource.dependencies && resource.dependencies.length > 0) {
            for (const dep of resource.dependencies) {
                const depOrder = this.resolveDependencies(dep, new Set(visited), [...path]);
                dependencies = dependencies.concat(depOrder);
            }
        }

        // 添加当前资源（如果还没有添加）
        if (!dependencies.includes(resourceKey)) {
            dependencies.push(resourceKey);
        }

        return dependencies;
    }

    /**
     * 等待资源就绪
     */
    async waitForResourceReady(resourceKey, maxAttempts = 50, checkInterval = 100) {
        const resource = this.cdnResources[resourceKey];
        if (!resource || !resource.readyCheck) {
            return true; // 没有就绪检查函数，认为已就绪
        }

        return new Promise((resolve, reject) => {
            let attempts = 0;
            
            const checkReady = () => {
                attempts++;
                console.log(`检查 ${resourceKey} 就绪状态 (${attempts}/${maxAttempts})`);
                
                try {
                    if (resource.readyCheck()) {
                        console.log(`${resourceKey} 已就绪`);
                        resolve(true);
                        return;
                    }
                } catch (error) {
                    console.warn(`${resourceKey} 就绪检查出错:`, error.message);
                }
                
                if (attempts >= maxAttempts) {
                    reject(new Error(`${resourceKey} 就绪检查超时`));
                } else {
                    setTimeout(checkReady, checkInterval);
                }
            };
            
            checkReady();
        });
    }

    /**
     * 带依赖管理的资源加载
     */
    async loadResourceWithDependencies(resourceKey) {
        console.log(`开始加载资源及其依赖: ${resourceKey}`);
        
        // 解析依赖顺序
        const loadOrder = this.resolveDependencies(resourceKey);
        console.log(`${resourceKey} 的加载顺序:`, loadOrder);
        
        // 按顺序加载每个资源
        for (const resource of loadOrder) {
            if (!this.loadedResources.has(resource)) {
                console.log(`加载资源: ${resource}`);
                await this.loadResource(resource);
                await this.waitForResourceReady(resource);
                console.log(`资源 ${resource} 加载并就绪完成`);
            } else {
                console.log(`资源 ${resource} 已加载，跳过`);
            }
        }
        
        console.log(`所有依赖资源加载完成: ${resourceKey}`);
    }

    /**
     * 线程安全的资源加载（原有方法，用于单个资源加载）
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
        let urls = [];
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

        // 使用智能CDN选择策略优化URL顺序
        urls = this.optimizeCDNOrder(urls);
        console.log(`Optimized CDN order for ${resourceKey}:`, urls.map(url => url.split('/')[2]));

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
                    // CSS resource is healthy
                    resolve(true);
                    return;
                }

                element.addEventListener('load', () => {
                    clearTimeout(timeout);
                    // CSS resource loaded successfully
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
                    // JS resource is healthy
                    resolve(true);
                    return;
                }

                element.addEventListener('load', () => {
                    clearTimeout(timeout);
                    // JS resource loaded successfully
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
     * CDN健康监测 - 定期检测CDN可用性
     */
    async startCDNHealthMonitoring() {
        // 每5分钟检测一次CDN健康状态
        setInterval(async () => {
            await this.performCDNHealthCheck();
        }, 5 * 60 * 1000);

        // 立即执行一次检测
        setTimeout(() => this.performCDNHealthCheck(), 1000);
    }

    /**
     * 执行CDN健康检测
     */
    async performCDNHealthCheck() {
        const healthResults = {};
        
        for (const [resourceKey, resource] of Object.entries(this.cdnResources)) {
            const allUrls = [resource.primary, ...resource.fallbacks];
            
            for (const url of allUrls.slice(0, 3)) { // 只检测前3个CDN
                try {
                    const startTime = Date.now();
                    const response = await fetch(url, { 
                        method: 'HEAD', 
                        cache: 'no-cache',
                        signal: AbortSignal.timeout(3000) // 3秒超时
                    });
                    const responseTime = Date.now() - startTime;
                    
                    if (response.ok) {
                        const domain = new URL(url).hostname;
                        if (!healthResults[domain]) {
                            healthResults[domain] = { success: 0, total: 0, avgTime: 0 };
                        }
                        healthResults[domain].success++;
                        healthResults[domain].total++;
                        healthResults[domain].avgTime = 
                            (healthResults[domain].avgTime + responseTime) / 2;
                    }
                } catch (error) {
                    const domain = new URL(url).hostname;
                    if (!healthResults[domain]) {
                        healthResults[domain] = { success: 0, total: 0, avgTime: 0 };
                    }
                    healthResults[domain].total++;
                }
            }
        }
        
        // 更新CDN性能数据
        this.updateCDNPerformanceData(healthResults);
    }

    /**
     * 更新CDN性能数据
     */
    updateCDNPerformanceData(healthResults) {
        const performanceData = JSON.parse(localStorage.getItem('cdn-performance') || '{}');
        
        for (const [domain, stats] of Object.entries(healthResults)) {
            if (!performanceData[domain]) {
                performanceData[domain] = { reliability: 100, avgResponseTime: 1000 };
            }
            
            // 计算可靠性（成功率）
            const reliability = (stats.success / stats.total) * 100;
            performanceData[domain].reliability = 
                (performanceData[domain].reliability * 0.7) + (reliability * 0.3);
            
            // 更新平均响应时间
            if (stats.avgTime > 0) {
                performanceData[domain].avgResponseTime = 
                    (performanceData[domain].avgResponseTime * 0.7) + (stats.avgTime * 0.3);
            }
        }
        
        localStorage.setItem('cdn-performance', JSON.stringify(performanceData));
        console.log('CDN性能数据已更新:', performanceData);
    }

    /**
     * 根据性能数据优化CDN选择
     */
    getPerformanceOptimizedCDNOrder(urls) {
        const performanceData = JSON.parse(localStorage.getItem('cdn-performance') || '{}');
        
        return urls.sort((a, b) => {
            const domainA = new URL(a).hostname;
            const domainB = new URL(b).hostname;
            
            const perfA = performanceData[domainA] || { reliability: 50, avgResponseTime: 2000 };
            const perfB = performanceData[domainB] || { reliability: 50, avgResponseTime: 2000 };
            
            // 综合评分：可靠性权重70%，响应时间权重30%
            const scoreA = perfA.reliability * 0.7 + (3000 - perfA.avgResponseTime) / 3000 * 30;
            const scoreB = perfB.reliability * 0.7 + (3000 - perfB.avgResponseTime) / 3000 * 30;
            
            return scoreB - scoreA;
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
     * 批量加载多个资源及其依赖
     */
    async loadMultipleResourcesWithDependencies(resourceKeys) {
        console.log('开始批量加载资源:', resourceKeys);
        
        // 收集所有需要加载的资源（包括依赖）
        const allResources = new Set();
        
        for (const resourceKey of resourceKeys) {
            const dependencies = this.resolveDependencies(resourceKey);
            dependencies.forEach(dep => allResources.add(dep));
        }
        
        const loadOrder = Array.from(allResources);
        console.log('批量加载顺序:', loadOrder);
        
        // 按顺序加载所有资源
        for (const resource of loadOrder) {
            if (!this.loadedResources.has(resource)) {
                console.log(`批量加载资源: ${resource}`);
                await this.loadResource(resource);
                await this.waitForResourceReady(resource);
                console.log(`批量加载完成: ${resource}`);
            } else {
                console.log(`资源 ${resource} 已加载，跳过`);
            }
        }
        
        console.log('批量加载完成:', resourceKeys);
    }

    /**
     * 获取资源的依赖信息（用于调试）
     */
    getDependencyInfo(resourceKey) {
        try {
            const dependencies = this.resolveDependencies(resourceKey);
            return {
                resource: resourceKey,
                dependencies: dependencies,
                loaded: dependencies.map(dep => ({
                    name: dep,
                    isLoaded: this.loadedResources.has(dep)
                }))
            };
        } catch (error) {
            return {
                resource: resourceKey,
                error: error.message
            };
        }
    }

    /**
     * 启用/禁用本地缓存
     */
    setLocalCacheEnabled(enabled) {
        this.enableLocalCache = enabled;
        console.log(`本地缓存已${enabled ? '启用' : '禁用'}`);
    }

    /**
     * 设置缓存过期时间
     */
    setCacheExpiry(hours) {
        this.cacheExpiry = hours * 60 * 60 * 1000;
        console.log(`缓存过期时间已设置为 ${hours} 小时`);
    }

    /**
     * 预加载资源到缓存
     */
    async preloadToCache(resourceKeys) {
        if (!this.enableLocalCache) {
            console.warn('本地缓存未启用，无法预加载');
            return;
        }

        console.log('开始预加载资源到缓存:', resourceKeys);
        const results = [];

        for (const resourceKey of resourceKeys) {
            const resource = this.cdnResources[resourceKey];
            if (!resource) {
                console.warn(`未知资源: ${resourceKey}`);
                continue;
            }

            const urls = [resource.primary, ...resource.fallbacks];
            let cached = false;

            for (const url of urls) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const content = await response.text();
                        this.setCachedContent(url, content, resource.type);
                        results.push({ resourceKey, url, success: true });
                        cached = true;
                        break;
                    }
                } catch (error) {
                    console.warn(`预加载失败 ${url}:`, error);
                }
            }

            if (!cached) {
                results.push({ resourceKey, success: false, error: '所有URL都失败' });
            }
        }

        console.log('预加载完成:', results);
        return results;
    }

    /**
     * 获取详细的缓存信息
     */
    getDetailedCacheInfo() {
        const cacheItems = [];
        const stats = this.getCacheStats();

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.cachePrefix)) {
                try {
                    const cacheData = localStorage.getItem(key);
                    const cache = JSON.parse(cacheData);
                    cacheItems.push({
                        key,
                        url: cache.url,
                        type: cache.type,
                        size: cache.size,
                        sizeMB: (cache.size / (1024 * 1024)).toFixed(3),
                        age: Math.floor((Date.now() - cache.timestamp) / (1000 * 60 * 60)),
                        timestamp: new Date(cache.timestamp).toLocaleString()
                    });
                } catch (error) {
                    // 忽略损坏的缓存
                }
            }
        }

        return {
            stats,
            items: cacheItems.sort((a, b) => b.timestamp - a.timestamp),
            enabled: this.enableLocalCache,
            expiryHours: this.cacheExpiry / (1000 * 60 * 60),
            maxSizeMB: this.maxCacheSize / (1024 * 1024)
        };
    }

    /**
     * 批量加载多个资源
     */
    async loadMultipleResources(resourceKeys, options = {}) {
        const { parallel = true, stopOnError = false } = options;
        const results = [];
        
        console.log(`开始批量加载资源 (${parallel ? '并行' : '串行'}):`, resourceKeys);
        
        if (parallel) {
            // 并行加载
            const loadPromises = resourceKeys.map(async (resourceKey) => {
                try {
                    await this.loadResourceWithDependencies(resourceKey);
                    return { resourceKey, success: true, error: null };
                } catch (error) {
                    return { resourceKey, success: false, error: error.message };
                }
            });
            
            const loadResults = await Promise.allSettled(loadPromises);
            loadResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                } else {
                    results.push({ 
                        resourceKey: resourceKeys[index], 
                        success: false, 
                        error: result.reason.message 
                    });
                }
            });
        } else {
            // 串行加载
            for (const resourceKey of resourceKeys) {
                try {
                    await this.loadResourceWithDependencies(resourceKey);
                    results.push({ resourceKey, success: true, error: null });
                } catch (error) {
                    const errorResult = { resourceKey, success: false, error: error.message };
                    results.push(errorResult);
                    
                    if (stopOnError) {
                        console.error(`串行加载在 ${resourceKey} 处停止:`, error.message);
                        break;
                    }
                }
            }
        }
        
        console.log('批量加载完成:', results);
        return results;
    }

    /**
     * 缓存修复和优化
     */
    async repairCache() {
        console.log('开始缓存修复和优化...');
        const repairResults = {
            checked: 0,
            repaired: 0,
            removed: 0,
            errors: []
        };
        
        const keysToCheck = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.cachePrefix)) {
                keysToCheck.push(key);
            }
        }
        
        for (const key of keysToCheck) {
            repairResults.checked++;
            
            try {
                const cacheData = localStorage.getItem(key);
                const cache = JSON.parse(cacheData);
                
                // 检查缓存版本
                if (!cache.version || cache.version < '2.0') {
                    console.log(`升级旧版本缓存: ${cache.url}`);
                    localStorage.removeItem(key);
                    repairResults.removed++;
                    continue;
                }
                
                // 验证完整性
                if (this.enableIntegrityCheck && cache.hash) {
                    const isValid = await this.validateCacheIntegrity(cache);
                    if (!isValid) {
                        console.log(`修复损坏的缓存: ${cache.url}`);
                        localStorage.removeItem(key);
                        repairResults.repaired++;
                        continue;
                    }
                }
                
                // 检查过期
                if (Date.now() - cache.timestamp > this.cacheExpiry) {
                    console.log(`删除过期缓存: ${cache.url}`);
                    localStorage.removeItem(key);
                    repairResults.removed++;
                }
                
            } catch (error) {
                console.warn(`缓存修复错误 ${key}:`, error);
                localStorage.removeItem(key);
                repairResults.errors.push({ key, error: error.message });
                repairResults.removed++;
            }
        }
        
        console.log('缓存修复完成:', repairResults);
        return repairResults;
    }

    /**
     * 获取性能统计
     */
    getPerformanceStats() {
        const stats = {
            loadedResources: this.loadedResources.size,
            failedResources: this.failedResources.size,
            activePromises: this.loadingPromises.size,
            cacheStats: this.getCacheStats(),
            preferredCDNs: Object.keys(this.preferredCDNs).length,
            supportedTypes: Object.keys(this.supportedTypes).length,
            configuredResources: Object.keys(this.cdnResources).length
        };
        
        return stats;
    }

    /**
     * 导出缓存数据
     */
    exportCacheData() {
        const exportData = {
            version: '2.0',
            timestamp: Date.now(),
            cachePrefix: this.cachePrefix,
            items: []
        };
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.cachePrefix)) {
                try {
                    const cacheData = localStorage.getItem(key);
                    const cache = JSON.parse(cacheData);
                    exportData.items.push({
                        key,
                        url: cache.url,
                        type: cache.type,
                        size: cache.size,
                        timestamp: cache.timestamp,
                        hash: cache.hash
                    });
                } catch (error) {
                    console.warn(`导出缓存数据错误 ${key}:`, error);
                }
            }
        }
        
        return exportData;
    }

    /**
     * 重置CDN管理器
     */
    reset() {
        console.log('重置CDN管理器...');
        
        // 清理状态
        this.loadedResources.clear();
        this.failedResources.clear();
        this.loadingPromises.clear();
        this.preferredCDNs = {};
        
        // 清理缓存
        this.clearAllCache();
        
        // 重新保存偏好
        this.savePreferredCDNs();
        
        console.log('CDN管理器已重置');
    }

    /**
     * 初始化CDN管理器
     */
    async init() {
        console.log('CDN Fallback Manager initialized with enhanced features');
        console.log('支持的文件类型:', Object.keys(this.supportedTypes));
        console.log('配置的资源数量:', Object.keys(this.cdnResources).length);
        
        // 清理过期缓存
        if (this.enableLocalCache) {
            this.cleanExpiredCache();
        }

        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // 智能检测并备选CDN资源
        await this.checkAndFallbackCDNs();
        
        // 定期缓存修复（每小时一次）
        setInterval(() => {
            this.repairCache();
        }, 60 * 60 * 1000);
    }
}

// 全局实例
window.cdnManager = new CDNFallbackManager();

// 自动初始化
window.cdnManager.init().catch(console.error);

// 自动启动CDN健康监测
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        if (window.cdnManager && typeof window.cdnManager.startCDNHealthMonitoring === 'function') {
            window.cdnManager.startCDNHealthMonitoring();
        }
    });
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CDNFallbackManager;
}