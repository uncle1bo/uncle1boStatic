/**
 * CDN Fallback Manager - Refactored Version
 * CDN竞争性备选功能管理器 - 重构版本
 * 模块化架构，提供轻量级的CDN自动切换功能
 */

class CDNFallbackManager {
    constructor() {
        // 初始化配置
        this.config = new CDNConfig();
        
        // 初始化缓存管理器
        this.cacheManager = new CDNCacheManager({
            enableLocalCache: true,
            enableIntegrityCheck: true,
            cachePrefix: 'cdn-cache-',
            cacheExpiry: 24 * 60 * 60 * 1000, // 24小时
            maxCacheSize: 50 * 1024 * 1024 // 50MB
        });
        
        // 初始化资源加载器
        this.loader = new CDNResourceLoader(this.config, this.cacheManager);
        
        // 初始化CDN优化器
        this.optimizer = new CDNOptimizer();
        
        // 初始化依赖管理器
        this.dependencyManager = new CDNDependencyManager(this.config);
        
        // 基本配置
        this.maxRetries = 3;
        this.timeout = 8000;
    }

    /**
     * 并发竞速加载资源
     */
    async raceLoadResource(resourceKey, urls) {
        const resource = this.config.getResource(resourceKey);
        if (!resource) {
            throw new Error(`Unknown resource: ${resourceKey}`);
        }

        // 创建所有加载任务
        const loadTasks = urls.map(async (url) => {
            try {
                await this.loader.loadResource(url, resource.type, `${resourceKey}-race`);
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
        this.optimizer.recordSuccessfulCDN(resourceKey, winner.url);
        this.dependencyManager.markResourceLoaded(resourceKey);

        return winner.url;
    }

    /**
     * 线程安全的资源加载
     */
    async loadResource(resourceKey) {
        // 线程安全：如果已经加载，直接返回
        if (this.dependencyManager.isResourceLoaded(resourceKey)) {
            return;
        }

        // 线程安全：如果正在加载，等待现有的加载完成
        if (this.dependencyManager.isResourceLoading(resourceKey)) {
            return this.dependencyManager.getLoadingPromise(resourceKey);
        }

        // 线程安全：如果之前失败过，不再尝试
        if (this.dependencyManager.isResourceFailed(resourceKey)) {
            throw new Error(`Resource ${resourceKey} previously failed`);
        }

        const resource = this.config.getResource(resourceKey);
        if (!resource) {
            throw new Error(`Unknown resource: ${resourceKey}`);
        }

        // 构建优化的URL列表
        const urls = this.optimizer.buildOptimizedUrls(resourceKey, resource);
        console.log(`Optimized CDN order for ${resourceKey}:`, urls.map(url => url.split('/')[2]));

        // 创建加载Promise
        const loadingPromise = this.raceLoadResource(resourceKey, urls)
            .then(url => {
                this.dependencyManager.markResourceLoaded(resourceKey);
                
                // 特殊处理：prism autoloader加载完成后设置正确的组件路径
                if (resourceKey === 'prism-autoloader' && typeof Prism !== 'undefined' && Prism.plugins && Prism.plugins.autoloader) {
                    // 使用CDN配置中的primary路径设置组件路径
                    const prismCoreConfig = this.config.getResource('prism-core');
                    if (prismCoreConfig && prismCoreConfig.primary) {
                        // 从prism-core的CDN路径推导components路径
                        const basePath = prismCoreConfig.primary.replace('/prism.min.js', '/components/');
                        Prism.plugins.autoloader.languages_path = basePath;
                        console.log('已设置Prism autoloader组件路径:', Prism.plugins.autoloader.languages_path);
                    }
                }
                
                // 特殊处理：KaTeX CSS加载完成后修复字体路径
                if (resourceKey === 'katex-css') {
                    this.fixKaTeXFontPaths();
                }
                
                return url;
            })
            .catch(error => {
                this.dependencyManager.markResourceFailed(resourceKey);
                throw error;
            });

        this.dependencyManager.setLoadingPromise(resourceKey, loadingPromise);
        return loadingPromise;
    }

    /**
     * 带依赖管理的资源加载
     */
    async loadResourceWithDependencies(resourceKey) {
        console.log(`开始加载资源及其依赖: ${resourceKey}`);
        
        // 解析依赖顺序
        const loadOrder = this.dependencyManager.resolveDependencies(resourceKey);
        console.log(`${resourceKey} 的加载顺序:`, loadOrder);
        
        // 按顺序加载每个资源
        for (const resource of loadOrder) {
            if (!this.dependencyManager.isResourceLoaded(resource)) {
                console.log(`加载资源: ${resource}`);
                await this.loadResource(resource);
                await this.dependencyManager.waitForResourceReady(resource);
                console.log(`资源 ${resource} 加载并就绪完成`);
            } else {
                console.log(`资源 ${resource} 已加载，跳过`);
            }
        }
        
        console.log(`所有依赖资源加载完成: ${resourceKey}`);
    }

    /**
     * 批量加载多个资源
     */
    async loadMultipleResources(resourceKeys) {
        const loadPromises = resourceKeys.map(key => this.loadResourceWithDependencies(key));
        return Promise.allSettled(loadPromises);
    }

    /**
     * 智能检测并备选CDN资源
     */
    async checkAndFallbackCDNs() {
        console.log('开始智能CDN检测和备选...');
        
        const resources = this.config.getAllResources();
        const criticalResources = ['bootstrap-css', 'bootstrap-js', 'jquery'];
        
        // 优先加载关键资源
        for (const resourceKey of criticalResources) {
            if (resources[resourceKey]) {
                try {
                    await this.loadResourceWithDependencies(resourceKey);
                    console.log(`关键资源 ${resourceKey} 加载成功`);
                } catch (error) {
                    console.error(`关键资源 ${resourceKey} 加载失败:`, error);
                }
            }
        }
        
        console.log('CDN检测和备选完成');
    }

    /**
     * CDN健康监测
     */
    async startCDNHealthMonitoring() {
        console.log('启动CDN健康监测...');
        
        const resources = this.config.getAllResources();
        const allUrls = new Set();
        
        // 收集所有CDN URL
        for (const resource of Object.values(resources)) {
            allUrls.add(resource.primary);
            resource.fallbacks.forEach(url => allUrls.add(url));
        }
        
        // 批量健康检查
        const healthResults = await this.optimizer.batchHealthCheck(Array.from(allUrls));
        console.log('CDN健康检查结果:', healthResults);
        
        return healthResults;
    }

    /**
     * 获取管理器状态
     */
    getStatus() {
        return {
            loadingStats: this.dependencyManager.getLoadingStats(),
            cacheStats: this.cacheManager.getCacheStats(),
            cdnStats: this.optimizer.getCDNStats(),
            dependencyGraph: this.dependencyManager.getDependencyGraph()
        };
    }

    /**
     * 清理图标和字体缓存
     */
    clearIconAndFontCache() {
        return this.cacheManager.clearIconAndFontCache();
    }

    /**
     * 清理所有缓存
     */
    clearAllCache() {
        return this.cacheManager.clearAllCache();
    }

    /**
     * 重置CDN管理器
     */
    reset() {
        console.log('重置CDN管理器...');
        
        this.dependencyManager.reset();
        this.optimizer.resetPreferences();
        this.clearAllCache();
        
        console.log('CDN管理器已重置');
    }

    /**
     * 导出配置和状态
     */
    exportData() {
        return {
            config: this.optimizer.exportConfig(),
            dependencies: this.dependencyManager.exportState(),
            cache: this.cacheManager.getCacheStats(),
            timestamp: Date.now(),
            version: '2.0'
        };
    }

    /**
     * 导入配置和状态
     */
    importData(data) {
        if (data && data.version === '2.0') {
            this.optimizer.importConfig(data.config);
            this.dependencyManager.importState(data.dependencies);
            return true;
        }
        return false;
    }

    /**
     * 修复KaTeX字体路径
     */
    fixKaTeXFontPaths() {
        console.log('开始修复KaTeX字体路径...');
        
        // 获取KaTeX CSS配置以确定字体基础路径
        const katexConfig = this.config.getResource('katex-css');
        let fontBasePath = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/fonts/'; // 默认路径
        
        if (katexConfig && katexConfig.primary) {
            // 从KaTeX CSS的CDN路径推导字体路径
            fontBasePath = katexConfig.primary.replace('/katex.min.css', '/fonts/');
        }
        
        // 查找所有KaTeX相关的样式表
        const styleSheets = Array.from(document.styleSheets);
        
        for (const styleSheet of styleSheets) {
            try {
                if (styleSheet.href && styleSheet.href.includes('katex')) {
                    const rules = Array.from(styleSheet.cssRules || styleSheet.rules || []);
                    
                    for (const rule of rules) {
                        if (rule.style && rule.style.src) {
                            // 修复字体路径，将相对路径替换为CDN路径
                            const originalSrc = rule.style.src;
                            if (originalSrc.includes('fonts/KaTeX_')) {
                                const newSrc = originalSrc.replace(
                                    /url\(["']?[^"']*fonts\/(KaTeX_[^"']*\.[^"']*)["']?\)/g,
                                    `url("${fontBasePath}$1")`
                                );
                                if (newSrc !== originalSrc) {
                                    rule.style.src = newSrc;
                                    console.log('已修复KaTeX字体路径:', newSrc);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                // 跨域样式表可能无法访问，忽略错误
                console.warn('无法访问样式表:', styleSheet.href, error);
            }
        }
        
        // 生成多个备选字体路径
        const generateFontSources = (fontName) => {
            const sources = [];
            
            // 检查本地字体文件是否存在（基于katex-css的localPath推导）
            if (katexConfig && katexConfig.localPath) {
                const localFontPath = katexConfig.localPath.replace('/katex.min.css', `/fonts/${fontName}.woff2`);
                sources.push(`url('${localFontPath}') format('woff2')`);
                
                const localFontPathWoff = katexConfig.localPath.replace('/katex.min.css', `/fonts/${fontName}.woff`);
                sources.push(`url('${localFontPathWoff}') format('woff')`);
            }
            
            // 添加primary CDN路径
            sources.push(`url('${fontBasePath}${fontName}.woff2') format('woff2')`);
            sources.push(`url('${fontBasePath}${fontName}.woff') format('woff')`);
            
            // 添加fallback CDN路径
            if (katexConfig && katexConfig.fallbacks) {
                katexConfig.fallbacks.forEach(fallbackUrl => {
                    const fallbackFontPath = fallbackUrl.replace('/katex.min.css', '/fonts/');
                    sources.push(`url('${fallbackFontPath}${fontName}.woff2') format('woff2')`);
                    sources.push(`url('${fallbackFontPath}${fontName}.woff') format('woff')`);
                });
            }
            
            sources.push(`url('${fontBasePath}${fontName}.ttf') format('truetype')`);
            return sources.join(',\n                     ');
        };
        
        // 添加自定义CSS来覆盖字体路径
        const customStyle = document.createElement('style');
        customStyle.textContent = `
            @font-face {
                font-family: 'KaTeX_Math';
                src: ${generateFontSources('KaTeX_Math-Italic')};
                font-style: italic;
            }
            @font-face {
                font-family: 'KaTeX_Main';
                src: ${generateFontSources('KaTeX_Main-Regular')};
            }
            @font-face {
                font-family: 'KaTeX_Size1';
                src: ${generateFontSources('KaTeX_Size1-Regular')};
            }
            @font-face {
                font-family: 'KaTeX_Size2';
                src: ${generateFontSources('KaTeX_Size2-Regular')};
            }
            @font-face {
                font-family: 'KaTeX_Size3';
                src: ${generateFontSources('KaTeX_Size3-Regular')};
            }
        `;
        document.head.appendChild(customStyle);
        
        console.log('KaTeX字体路径修复完成');
    }

    /**
     * 初始化CDN管理器
     */
    async init() {
        console.log('CDN Fallback Manager (Refactored) initialized');
        console.log('支持的文件类型:', Object.keys(this.config.getSupportedTypes()));
        console.log('配置的资源数量:', Object.keys(this.config.getAllResources()).length);
        
        // 验证依赖图
        const validationErrors = this.dependencyManager.validateDependencyGraph();
        if (validationErrors.length > 0) {
            console.warn('依赖图验证发现问题:', validationErrors);
        }
        
        // 清理过期缓存
        this.cacheManager.cleanExpiredCache();

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
            this.cacheManager.cleanExpiredCache();
        }, 60 * 60 * 1000);
    }
}

// 全局实例
window.cdnManager = new CDNFallbackManager();

// 添加全局便捷方法用于修复图标显示问题
window.fixIcons = function() {
    console.log('开始修复图标显示问题...');
    const deletedCount = window.cdnManager.clearIconAndFontCache();
    if (deletedCount > 0) {
        console.log(`已清理 ${deletedCount} 个图标/字体缓存文件`);
        console.log('请刷新页面以重新加载图标资源');
        if (confirm('是否立即刷新页面以重新加载图标？')) {
            window.location.reload();
        }
    } else {
        console.log('未发现需要清理的图标/字体缓存');
    }
};

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