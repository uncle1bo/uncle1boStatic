/**
 * CDN Resource Loader Module
 * CDN资源加载器模块 - 处理各种类型资源的加载
 */

class CDNResourceLoader {
    constructor(config, cacheManager) {
        this.config = config;
        this.cacheManager = cacheManager;
        this.timeout = 8000;
    }

    /**
     * 加载CSS文件
     */
    loadCSS(url, id) {
        return new Promise(async (resolve, reject) => {
            // 检查缓存
            const cachedContent = await this.cacheManager.getCachedContent(url);
            if (cachedContent) {
                try {
                    this.injectCSSContent(cachedContent, id);
                    resolve(url);
                    return;
                } catch (error) {
                    console.warn('缓存CSS应用失败，回退到网络加载:', error);
                }
            }

            // 网络加载
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            if (id) link.id = id;

            const timeout = setTimeout(() => {
                reject(new Error(`CSS load timeout: ${url}`));
            }, this.timeout);

            link.onload = async () => {
                clearTimeout(timeout);
                
                // 缓存CSS内容
                if (this.cacheManager.enableLocalCache) {
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            const content = await response.text();
                            this.cacheManager.setCachedContent(url, content, 'css');
                        }
                    } catch (error) {
                        console.warn('CSS缓存失败:', error);
                    }
                }
                
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
     * 注入CSS内容到页面
     */
    injectCSSContent(content, id) {
        const style = document.createElement('style');
        style.type = 'text/css';
        if (id) style.id = id;
        style.textContent = content;
        document.head.appendChild(style);
    }

    /**
     * 加载JavaScript文件
     */
    loadJS(url, id) {
        return new Promise(async (resolve, reject) => {
            // 检查缓存
            const cachedContent = await this.cacheManager.getCachedContent(url);
            if (cachedContent) {
                try {
                    this.executeJSContent(cachedContent, id);
                    resolve(url);
                    return;
                } catch (error) {
                    console.warn('缓存JS应用失败，回退到网络加载:', error);
                }
            }

            // 网络加载
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            if (id) script.id = id;

            const timeout = setTimeout(() => {
                reject(new Error(`JS load timeout: ${url}`));
            }, this.timeout);

            script.onload = async () => {
                clearTimeout(timeout);
                
                // 缓存JS内容
                if (this.cacheManager.enableLocalCache) {
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            const content = await response.text();
                            this.cacheManager.setCachedContent(url, content, 'js');
                        }
                    } catch (error) {
                        console.warn('JS缓存失败:', error);
                    }
                }
                
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
     * 执行JavaScript内容
     */
    executeJSContent(content, id) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        if (id) script.id = id;
        script.textContent = content;
        document.head.appendChild(script);
    }

    /**
     * 加载字体文件
     */
    loadFont(url, id) {
        return new Promise(async (resolve, reject) => {
            // 检查缓存
            const cachedContent = await this.cacheManager.getCachedContent(url);
            if (cachedContent) {
                try {
                    const fontFace = new FontFace(id || 'cached-font', `url(data:${this.config.getMimeType(url, 'font')};base64,${cachedContent})`);
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
                
                const fontFace = new FontFace(id || 'loaded-font', arrayBuffer);
                await fontFace.load();
                document.fonts.add(fontFace);
                
                clearTimeout(timeout);
                
                // 缓存字体内容
                if (this.cacheManager.enableLocalCache) {
                    const base64Content = btoa(String.fromCharCode(...fontData));
                    this.cacheManager.setCachedContent(url, base64Content, 'font');
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
            const cachedContent = await this.cacheManager.getCachedContent(url);
            if (cachedContent) {
                try {
                    const img = new Image();
                    if (id) img.id = id;
                    img.src = `data:${this.config.getMimeType(url, 'image')};base64,${cachedContent}`;
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
            if (this.cacheManager.enableLocalCache) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                        this.cacheManager.setCachedContent(url, base64Content, 'image');
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
            const cachedContent = await this.cacheManager.getCachedContent(url);
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
                if (this.cacheManager.enableLocalCache) {
                    this.cacheManager.setCachedContent(url, content, type);
                }
                
                resolve({ url, content, fromCache: false });
            } catch (error) {
                clearTimeout(timeout);
                reject(new Error(`Resource load failed: ${url} - ${error.message}`));
            }
        });
    }

    /**
     * 根据资源类型加载资源
     */
    async loadResource(url, type, id) {
        switch (type) {
            case 'css':
                return await this.loadCSS(url, id);
            case 'js':
                return await this.loadJS(url, id);
            case 'font':
                return await this.loadFont(url, id);
            case 'image':
                return await this.loadImage(url, id);
            case 'json':
            case 'xml':
            case 'text':
                return await this.loadGenericResource(url, type, id);
            default:
                // 自动检测文件类型
                const detectedType = this.config.detectFileType(url);
                if (detectedType !== 'unknown') {
                    return await this.loadGenericResource(url, detectedType, id);
                } else {
                    throw new Error(`Unsupported resource type: ${type}`);
                }
        }
    }
}

// 导出资源加载器
if (typeof window !== 'undefined') {
    window.CDNResourceLoader = CDNResourceLoader;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CDNResourceLoader;
}