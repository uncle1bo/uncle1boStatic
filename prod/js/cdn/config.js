/**
 * CDN Configuration Module
 * CDN配置模块 - 管理所有CDN资源配置
 */

class CDNConfig {
    constructor() {
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
                localPath: '/assets/libs/bootstrap/bootstrap.min.css',
                primary: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css',
                    'https://cdn.staticfile.org/twitter-bootstrap/5.3.0/css/bootstrap.min.css'
                ],
                type: 'css'
            },

            // Bootstrap JS
            'bootstrap-js': {
                localPath: '/assets/libs/bootstrap/bootstrap.bundle.min.js',
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
                localPath: '/assets/libs/bootstrap/bootstrap-icons.css',
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
                localPath: '/assets/libs/jquery/jquery.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
                    'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js',
                    'https://code.jquery.com/jquery-3.6.0.min.js',
                    'https://cdn.staticfile.org/jquery/3.6.0/jquery.min.js'
                ],
                type: 'js',
                readyCheck: () => typeof $ !== 'undefined' && typeof jQuery !== 'undefined'
            },

            // Prism.js CSS Theme
            'prism-theme-css': {
                localPath: '/assets/libs/prism/prism-tomorrow.min.css',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'
                ],
                type: 'css'
            },

            // Prism.js Toolbar CSS
            'prism-toolbar-css': {
                localPath: '/assets/libs/prism/prism-toolbar.min.css',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/toolbar/prism-toolbar.min.css',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.css'
                ],
                type: 'css'
            },

            // Prism.js Core
            'prism-core': {
                localPath: '/assets/libs/prism/prism-core.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js'
                ],
                type: 'js',
                readyCheck: () => typeof Prism !== 'undefined' && typeof Prism.highlight !== 'undefined'
            },

            // Prism.js Autoloader
            'prism-autoloader': {
                localPath: '/assets/libs/prism/prism-autoloader.min.js',
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
                localPath: '/assets/libs/prism/prism-toolbar.min.js',
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
                localPath: '/assets/libs/prism/prism-copy-to-clipboard.min.js',
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
                localPath: '/assets/libs/katex/katex.min.css',
                primary: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css'
                ],
                type: 'css'
            },

            // KaTeX JS
            'katex-js': {
                localPath: '/assets/libs/katex/katex.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.js'
                ],
                type: 'js'
            },

            // KaTeX Fonts
            'katex-math-italic-woff2': {
                primary: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/fonts/KaTeX_Math-Italic.woff2',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/fonts/KaTeX_Math-Italic.woff2'
                ],
                type: 'font',
                localPath: '/assets/fonts/KaTeX_Math-Italic.woff2'
            },

            'katex-main-regular-woff2': {
                primary: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/fonts/KaTeX_Main-Regular.woff2',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/fonts/KaTeX_Main-Regular.woff2'
                ],
                type: 'font',
                localPath: '/assets/fonts/KaTeX_Main-Regular.woff2'
            },

            'katex-size1-regular-woff2': {
                primary: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/fonts/KaTeX_Size1-Regular.woff2',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/fonts/KaTeX_Size1-Regular.woff2'
                ],
                type: 'font',
                localPath: '/assets/fonts/KaTeX_Size1-Regular.woff2'
            },

            'katex-size2-regular-woff2': {
                primary: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/fonts/KaTeX_Size2-Regular.woff2',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/fonts/KaTeX_Size2-Regular.woff2'
                ],
                type: 'font',
                localPath: '/assets/fonts/KaTeX_Size2-Regular.woff2'
            },

            'katex-size3-regular-woff2': {
                primary: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/fonts/KaTeX_Size3-Regular.woff2',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/fonts/KaTeX_Size3-Regular.woff2'
                ],
                type: 'font',
                localPath: '/assets/fonts/KaTeX_Size3-Regular.woff2'
            },

            // Mermaid
            'mermaid': {
                localPath: '/assets/libs/mermaid/mermaid.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js'
                ],
                type: 'js'
            },

            // Prism.js 常用组件
            'prism-clike': {
                localPath: '/assets/libs/prism/components/prism-clike.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-clike.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-clike.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-clike.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core']
            },

            'prism-javascript': {
                localPath: '/assets/libs/prism/components/prism-javascript.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-javascript.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-javascript.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core', 'prism-clike']
            },

            'prism-css-component': {
                localPath: '/assets/libs/prism/components/prism-css.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-css.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-css.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-css.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core']
            },

            'prism-python': {
                localPath: '/assets/libs/prism/components/prism-python.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-python.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-python.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core']
            },

            'prism-markup': {
                localPath: '/assets/libs/prism/components/prism-markup.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-markup.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markup.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-markup.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core']
            },

            'prism-json': {
                localPath: '/assets/libs/prism/components/prism-json.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-json.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-json.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core']
            },

            'prism-bash': {
                localPath: '/assets/libs/prism/components/prism-bash.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-bash.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-bash.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core']
            },

            'prism-yaml': {
                localPath: '/assets/libs/prism/components/prism-yaml.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-yaml.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-yaml.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-yaml.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core']
            },

            'prism-java': {
                localPath: '/assets/libs/prism/components/prism-java.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-java.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-java.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-java.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core', 'prism-clike']
            },

            'prism-cpp': {
                localPath: '/assets/libs/prism/components/prism-cpp.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-cpp.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-cpp.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-cpp.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core', 'prism-clike']
            },

            'prism-c': {
                localPath: '/assets/libs/prism/components/prism-c.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-c.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-c.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-c.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core', 'prism-clike']
            },

            'prism-sql': {
                localPath: '/assets/libs/prism/components/prism-sql.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-sql.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-sql.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-sql.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core']
            },

            'prism-typescript': {
                localPath: '/assets/libs/prism/components/prism-typescript.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-typescript.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-typescript.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core', 'prism-javascript']
            },

            'prism-php': {
                localPath: '/assets/libs/prism/components/prism-php.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-php.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-php.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-php.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core', 'prism-markup']
            },

            'prism-go': {
                localPath: '/assets/libs/prism/components/prism-go.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-go.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-go.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-go.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core', 'prism-clike']
            },

            'prism-rust': {
                localPath: '/assets/libs/prism/components/prism-rust.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-rust.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-rust.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-rust.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core']
            },

            'prism-markdown': {
                localPath: '/assets/libs/prism/components/prism-markdown.min.js',
                primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-markdown.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markdown.min.js',
                    'https://unpkg.com/prismjs@1.29.0/components/prism-markdown.min.js'
                ],
                type: 'js',
                dependencies: ['prism-core', 'prism-markup']
            },



            // DataTables Core
            'dataTables': {
                localPath: '/assets/libs/datatables/jquery.dataTables.min.js',
                primary: 'https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/datatables/1.13.4/js/jquery.dataTables.min.js',
                    'https://cdn.jsdelivr.net/npm/datatables.net@1.13.4/js/jquery.dataTables.min.js'
                ],
                type: 'js',
                dependencies: ['jquery'],
                readyCheck: () => typeof $ !== 'undefined' && typeof $.fn.DataTable !== 'undefined' && typeof $.fn.DataTable.defaults !== 'undefined'
            },

            // DataTables Bootstrap 5 Integration
            'dataTables-bootstrap': {
                localPath: '/assets/libs/datatables/dataTables.bootstrap5.min.js',
                primary: 'https://cdn.datatables.net/1.13.4/js/dataTables.bootstrap5.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/datatables/1.13.4/js/dataTables.bootstrap5.min.js',
                    'https://cdn.jsdelivr.net/npm/datatables.net-bs5@1.13.4/js/dataTables.bootstrap5.min.js'
                ],
                type: 'js',
                dependencies: ['dataTables', 'bootstrap-js'],
                readyCheck: () => typeof $ !== 'undefined' && typeof $.fn.DataTable !== 'undefined' && typeof $.fn.DataTable.ext !== 'undefined' && typeof $.fn.DataTable.ext.classes !== 'undefined' && typeof $.fn.DataTable.ext.classes.sWrapper !== 'undefined'
            },

            // jQuery UI
            'jquery-ui': {
                localPath: '/assets/libs/jquery-ui/jquery-ui.min.js',
                primary: 'https://code.jquery.com/ui/1.13.2/jquery-ui.min.js',
                fallbacks: [
                    'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js',
                    'https://cdn.jsdelivr.net/npm/jquery-ui@1.13.2/dist/jquery-ui.min.js'
                ],
                type: 'js',
                dependencies: ['jquery'],
                readyCheck: () => typeof $ !== 'undefined' && typeof $.ui !== 'undefined' && typeof $.ui.sortable !== 'undefined'
            }
        };
    }

    /**
     * 获取资源配置
     */
    getResource(resourceKey) {
        return this.cdnResources[resourceKey];
    }

    /**
     * 获取所有资源配置
     */
    getAllResources() {
        return this.cdnResources;
    }

    /**
     * 获取支持的文件类型配置
     */
    getSupportedTypes() {
        return this.supportedTypes;
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
}

// 导出配置实例
if (typeof window !== 'undefined') {
    window.CDNConfig = CDNConfig;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CDNConfig;
}