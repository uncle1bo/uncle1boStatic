/**
 * CDN Dependency Manager Module
 * CDN依赖管理器模块 - 处理资源依赖关系和加载顺序
 */

class CDNDependencyManager {
    constructor(config) {
        this.config = config;
        this.loadedResources = new Set();
        this.loadingPromises = new Map();
        this.failedResources = new Set();
    }

    /**
     * 解析资源依赖关系，返回正确的加载顺序
     */
    resolveDependencies(resourceKey, visited = new Set(), path = []) {
        // 检测循环依赖
        if (visited.has(resourceKey)) {
            throw new Error(`Circular dependency detected: ${path.join(' -> ')} -> ${resourceKey}`);
        }

        const resource = this.config.getResource(resourceKey);
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
        const resource = this.config.getResource(resourceKey);
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
     * 检查资源是否已加载
     */
    isResourceLoaded(resourceKey) {
        return this.loadedResources.has(resourceKey);
    }

    /**
     * 检查资源是否正在加载
     */
    isResourceLoading(resourceKey) {
        return this.loadingPromises.has(resourceKey);
    }

    /**
     * 检查资源是否加载失败
     */
    isResourceFailed(resourceKey) {
        return this.failedResources.has(resourceKey);
    }

    /**
     * 标记资源为已加载
     */
    markResourceLoaded(resourceKey) {
        this.loadedResources.add(resourceKey);
        this.loadingPromises.delete(resourceKey);
        this.failedResources.delete(resourceKey);
    }

    /**
     * 标记资源为加载失败
     */
    markResourceFailed(resourceKey) {
        this.failedResources.add(resourceKey);
        this.loadingPromises.delete(resourceKey);
    }

    /**
     * 设置资源加载Promise
     */
    setLoadingPromise(resourceKey, promise) {
        this.loadingPromises.set(resourceKey, promise);
    }

    /**
     * 获取资源加载Promise
     */
    getLoadingPromise(resourceKey) {
        return this.loadingPromises.get(resourceKey);
    }

    /**
     * 获取依赖图
     */
    getDependencyGraph() {
        const graph = {};
        const resources = this.config.getAllResources();
        
        for (const [key, resource] of Object.entries(resources)) {
            graph[key] = {
                dependencies: resource.dependencies || [],
                type: resource.type,
                loaded: this.isResourceLoaded(key),
                loading: this.isResourceLoading(key),
                failed: this.isResourceFailed(key)
            };
        }
        
        return graph;
    }

    /**
     * 验证依赖图的完整性
     */
    validateDependencyGraph() {
        const resources = this.config.getAllResources();
        const errors = [];
        
        for (const [key, resource] of Object.entries(resources)) {
            if (resource.dependencies) {
                for (const dep of resource.dependencies) {
                    if (!resources[dep]) {
                        errors.push(`Resource '${key}' depends on unknown resource '${dep}'`);
                    }
                }
            }
            
            // 检查循环依赖
            try {
                this.resolveDependencies(key);
            } catch (error) {
                if (error.message.includes('Circular dependency')) {
                    errors.push(error.message);
                }
            }
        }
        
        return errors;
    }

    /**
     * 获取资源的所有依赖（递归）
     */
    getAllDependencies(resourceKey) {
        const resource = this.config.getResource(resourceKey);
        if (!resource) return [];
        
        const allDeps = new Set();
        const queue = [...(resource.dependencies || [])];
        
        while (queue.length > 0) {
            const dep = queue.shift();
            if (!allDeps.has(dep)) {
                allDeps.add(dep);
                const depResource = this.config.getResource(dep);
                if (depResource && depResource.dependencies) {
                    queue.push(...depResource.dependencies);
                }
            }
        }
        
        return Array.from(allDeps);
    }

    /**
     * 获取依赖于指定资源的所有资源
     */
    getDependents(resourceKey) {
        const resources = this.config.getAllResources();
        const dependents = [];
        
        for (const [key, resource] of Object.entries(resources)) {
            if (resource.dependencies && resource.dependencies.includes(resourceKey)) {
                dependents.push(key);
            }
        }
        
        return dependents;
    }

    /**
     * 获取加载统计信息
     */
    getLoadingStats() {
        const resources = this.config.getAllResources();
        const total = Object.keys(resources).length;
        const loaded = this.loadedResources.size;
        const loading = this.loadingPromises.size;
        const failed = this.failedResources.size;
        
        return {
            total,
            loaded,
            loading,
            failed,
            pending: total - loaded - loading - failed,
            loadedPercent: (loaded / total * 100).toFixed(2),
            failedPercent: (failed / total * 100).toFixed(2)
        };
    }

    /**
     * 重置依赖管理器状态
     */
    reset() {
        this.loadedResources.clear();
        this.loadingPromises.clear();
        this.failedResources.clear();
    }

    /**
     * 导出依赖状态
     */
    exportState() {
        return {
            loadedResources: Array.from(this.loadedResources),
            failedResources: Array.from(this.failedResources),
            loadingResources: Array.from(this.loadingPromises.keys()),
            timestamp: Date.now()
        };
    }

    /**
     * 导入依赖状态
     */
    importState(state) {
        if (state) {
            this.loadedResources = new Set(state.loadedResources || []);
            this.failedResources = new Set(state.failedResources || []);
            // 不导入loadingPromises，因为Promise无法序列化
            return true;
        }
        return false;
    }
}

// 导出依赖管理器
if (typeof window !== 'undefined') {
    window.CDNDependencyManager = CDNDependencyManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CDNDependencyManager;
}