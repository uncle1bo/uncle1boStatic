/**
 * CDN Cache Manager Module
 * CDN缓存管理模块 - 处理本地缓存逻辑
 */

class CDNCacheManager {
    constructor(config = {}) {
        this.enableLocalCache = config.enableLocalCache !== false;
        this.enableIntegrityCheck = config.enableIntegrityCheck !== false;
        this.cachePrefix = config.cachePrefix || 'cdn-cache-';
        this.cacheExpiry = config.cacheExpiry || 24 * 60 * 60 * 1000; // 24小时
        this.maxCacheSize = config.maxCacheSize || 50 * 1024 * 1024; // 50MB
    }

    /**
     * 生成缓存键
     */
    generateCacheKey(url) {
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
            hash = hash & hash;
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
     * 从缓存获取资源内容
     */
    async getCachedContent(url) {
        if (!this.enableLocalCache) return null;
        
        const cacheKey = this.generateCacheKey(url);
        if (!this.isCacheValid(cacheKey)) return null;
        
        try {
            const cacheData = localStorage.getItem(cacheKey);
            const cache = JSON.parse(cacheData);
            
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
            try {
                localStorage.removeItem(cacheKey);
            } catch (e) {
                console.warn('删除损坏缓存失败:', e);
            }
            return null;
        }
    }

    /**
     * 计算内容哈希值
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
            if (!cacheData.hash || cacheData.hash.length < 8) {
                console.warn('缓存数据hash缺失或过短，判定为损坏，需要重新获取');
                return false;
            }
            
            // 对于字体文件和图标文件，放宽hash校验要求
            if (cacheData.type === 'font' || cacheData.url.includes('bootstrap-icons') || cacheData.url.includes('font-awesome')) {
                if (cacheData.hash.length >= 16) {
                    console.log('字体/图标文件缓存校验通过（简化模式）');
                    return true;
                }
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
     * 将资源内容保存到缓存
     */
    async setCachedContent(url, content, type) {
        if (!this.enableLocalCache) return;
        
        try {
            const contentSize = new Blob([content]).size;
            if (contentSize > this.maxCacheSize / 10) {
                console.warn(`文件过大，不缓存: ${url}`);
                return;
            }
            
            this.cleanExpiredCache();
            
            if (this.getTotalCacheSize() + contentSize > this.maxCacheSize) {
                this.cleanOldestCache();
            }
            
            const contentHash = await this.calculateContentHash(content);
            
            const cacheKey = this.generateCacheKey(url);
            const cacheData = {
                url: url,
                content: content,
                type: type,
                timestamp: Date.now(),
                size: contentSize,
                hash: contentHash,
                version: '2.0'
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
                    keysToRemove.push(key);
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
                    cacheItems.push({ key, timestamp: cache.timestamp, size: cache.size || 0 });
                } catch (error) {
                    localStorage.removeItem(key);
                }
            }
        }
        
        cacheItems.sort((a, b) => a.timestamp - b.timestamp);
        
        let removedSize = 0;
        const targetSize = this.maxCacheSize * 0.2;
        
        for (const item of cacheItems) {
            if (removedSize >= targetSize) break;
            
            localStorage.removeItem(item.key);
            removedSize += item.size;
            console.log(`清理旧缓存: ${item.key}`);
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
     * 清理所有缓存
     */
    clearAllCache() {
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.cachePrefix)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log(`已清理 ${keysToRemove.length} 个缓存项`);
        return keysToRemove.length;
    }

    /**
     * 清理图标和字体缓存
     */
    clearIconAndFontCache() {
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.cachePrefix)) {
                try {
                    const cacheData = localStorage.getItem(key);
                    const cache = JSON.parse(cacheData);
                    
                    if (cache.type === 'font' || 
                        cache.url.includes('bootstrap-icons') || 
                        cache.url.includes('font-awesome') ||
                        cache.url.includes('icon')) {
                        keysToRemove.push(key);
                    }
                } catch (error) {
                    // 损坏的缓存也删除
                    keysToRemove.push(key);
                }
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log(`已清理 ${keysToRemove.length} 个图标/字体缓存项`);
        return keysToRemove.length;
    }

    /**
     * 获取缓存统计信息
     */
    getCacheStats() {
        let totalItems = 0;
        let totalSize = 0;
        const typeStats = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.cachePrefix)) {
                try {
                    const cacheData = localStorage.getItem(key);
                    const cache = JSON.parse(cacheData);
                    
                    totalItems++;
                    totalSize += cache.size || 0;
                    
                    const type = cache.type || 'unknown';
                    if (!typeStats[type]) {
                        typeStats[type] = { count: 0, size: 0 };
                    }
                    typeStats[type].count++;
                    typeStats[type].size += cache.size || 0;
                } catch (error) {
                    // 忽略损坏的缓存
                }
            }
        }
        
        return {
            totalItems,
            totalSize,
            typeStats,
            maxSize: this.maxCacheSize,
            usagePercent: (totalSize / this.maxCacheSize * 100).toFixed(2)
        };
    }
}

// 导出缓存管理器
if (typeof window !== 'undefined') {
    window.CDNCacheManager = CDNCacheManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CDNCacheManager;
}