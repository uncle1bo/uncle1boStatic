/**
 * CDN Optimizer Module
 * CDN优化器模块 - 处理CDN选择和优化策略
 */

class CDNOptimizer {
    constructor() {
        this.preferredCDNs = this.getPreferredCDNs();
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
     * 构建优化的URL列表
     */
    buildOptimizedUrls(resourceKey, resource) {
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
        return this.optimizeCDNOrder(urls);
    }

    /**
     * 记录成功的CDN
     */
    recordSuccessfulCDN(resourceKey, url) {
        this.preferredCDNs[resourceKey] = url;
        this.savePreferredCDNs();
    }

    /**
     * CDN健康检查
     */
    async checkCDNHealth(url, timeout = 5000) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const img = new Image();
            
            const timer = setTimeout(() => {
                resolve({ url, healthy: false, responseTime: timeout });
            }, timeout);
            
            img.onload = img.onerror = () => {
                clearTimeout(timer);
                const responseTime = Date.now() - startTime;
                resolve({ url, healthy: true, responseTime });
            };
            
            // 使用一个小的测试图片或资源
            img.src = url + '?_health_check=' + Date.now();
        });
    }

    /**
     * 批量CDN健康检查
     */
    async batchHealthCheck(urls) {
        const results = await Promise.all(
            urls.map(url => this.checkCDNHealth(url))
        );
        
        // 按响应时间排序
        return results
            .filter(result => result.healthy)
            .sort((a, b) => a.responseTime - b.responseTime);
    }

    /**
     * 获取CDN性能统计
     */
    getCDNStats() {
        const stats = {};
        
        for (const [resourceKey, url] of Object.entries(this.preferredCDNs)) {
            const domain = new URL(url).hostname;
            if (!stats[domain]) {
                stats[domain] = { count: 0, resources: [] };
            }
            stats[domain].count++;
            stats[domain].resources.push(resourceKey);
        }
        
        return stats;
    }

    /**
     * 重置CDN偏好
     */
    resetPreferences() {
        this.preferredCDNs = {};
        this.savePreferredCDNs();
    }

    /**
     * 导出CDN配置
     */
    exportConfig() {
        return {
            preferredCDNs: this.preferredCDNs,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            language: navigator.language
        };
    }

    /**
     * 导入CDN配置
     */
    importConfig(config) {
        if (config && config.preferredCDNs) {
            this.preferredCDNs = { ...config.preferredCDNs };
            this.savePreferredCDNs();
            return true;
        }
        return false;
    }
}

// 导出CDN优化器
if (typeof window !== 'undefined') {
    window.CDNOptimizer = CDNOptimizer;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CDNOptimizer;
}