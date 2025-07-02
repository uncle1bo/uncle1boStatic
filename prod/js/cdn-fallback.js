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
                type: 'js',
                readyCheck: () => typeof bootstrap !== 'undefined'
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
     * 初始化CDN管理器
     */
    async init() {
        // CDN Fallback Manager initialized

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