/**
 * 文件预览器
 * 支持多种文件格式的在线预览功能
 * 基于客户端实现，无服务器依赖
 */

class FilePreviewer {
    constructor() {
        this.supportedTypes = {
            'xml': { icon: 'bi-file-code', name: 'XML文件' },
            'md': { icon: 'bi-file-text', name: 'Markdown文件' },
            'json': { icon: 'bi-file-code', name: 'JSON文件' },
            'txt': { icon: 'bi-file-text', name: '文本文件' },
            'css': { icon: 'bi-file-code', name: 'CSS文件' },
            'js': { icon: 'bi-file-code', name: 'JavaScript文件' },
            'html': { icon: 'bi-file-code', name: 'HTML文件' },
            'jpg': { icon: 'bi-file-image', name: '图片文件' },
            'jpeg': { icon: 'bi-file-image', name: '图片文件' },
            'png': { icon: 'bi-file-image', name: '图片文件' },
            'gif': { icon: 'bi-file-image', name: '图片文件' },
            'webp': { icon: 'bi-file-image', name: '图片文件' },
            'svg': { icon: 'bi-file-image', name: 'SVG图片' }
        };
        
        this.loadedLibraries = {
            prism: false,
            marked: false,
            katex: false,
            mermaid: false
        };
    }

    /**
     * 检测URL是否为文件预览请求
     */
    detectFilePreview() {
        const path = window.location.pathname;
        const extension = this.getFileExtension(path);
        
        if (this.supportedTypes[extension]) {
            return {
                extension,
                filename: path.split('/').pop(),
                fullPath: path
            };
        }
        
        return null;
    }

    /**
     * 获取文件扩展名
     */
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    /**
     * 动态加载外部库
     */
    async loadLibrary(name, url, type = 'script') {
        if (this.loadedLibraries[name]) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const element = type === 'script' ? document.createElement('script') : document.createElement('link');
            
            if (type === 'script') {
                element.src = url;
                element.onload = () => {
                    this.loadedLibraries[name] = true;
                    resolve();
                };
            } else {
                element.rel = 'stylesheet';
                element.href = url;
                element.onload = () => {
                    this.loadedLibraries[name] = true;
                    resolve();
                };
            }
            
            element.onerror = reject;
            document.head.appendChild(element);
        });
    }

    /**
     * 加载必要的库
     */
    async loadRequiredLibraries(extension) {
        const promises = [];

        // 代码高亮库
        if (['xml', 'json', 'css', 'js', 'html', 'md'].includes(extension)) {
            promises.push(
                this.loadLibrary('prism', 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js'),
                this.loadLibrary('prism-css', 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css', 'link'),
                this.loadLibrary('prism-autoloader', 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js'),
                this.loadLibrary('prism-toolbar', 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/toolbar/prism-toolbar.min.js'),
                this.loadLibrary('prism-toolbar-css', 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/toolbar/prism-toolbar.min.css', 'link'),
                this.loadLibrary('prism-copy', 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js')
            );
        }

        // Markdown渲染库
        if (extension === 'md') {
            promises.push(
                this.loadLibrary('marked', 'https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js'),
                this.loadLibrary('katex', 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js'),
                this.loadLibrary('katex-css', 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css', 'link'),
                this.loadLibrary('mermaid', 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js')
            );
        }

        await Promise.all(promises);
    }

    /**
     * 创建预览界面
     */
    createPreviewInterface(fileInfo) {
        const typeInfo = this.supportedTypes[fileInfo.extension];
        
        return `
            <div class="container mt-4">
                <div class="row">
                    <div class="col-12">
                        <div class="file-preview-container">
                            <div class="file-preview-header d-flex justify-content-between align-items-center">
                                <div class="d-flex align-items-center">
                                    <i class="bi ${typeInfo.icon} file-icon"></i>
                                    <div>
                                        <h5 class="mb-0">${fileInfo.filename}</h5>
                                        <small>${typeInfo.name}</small>
                                    </div>
                                </div>
                                <div class="btn-group" role="group">
                                    <button type="button" class="btn btn-outline-light btn-sm" onclick="window.history.back()">
                                        <i class="bi bi-arrow-left me-1"></i>返回
                                    </button>
                                    <button type="button" class="btn btn-outline-light btn-sm" onclick="location.reload()">
                                        <i class="bi bi-arrow-clockwise me-1"></i>刷新
                                    </button>
                                </div>
                            </div>
                            <div class="file-preview-content">
                                <div id="preview-content" class="position-relative">
                                    <div class="file-preview-loading">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">加载中...</span>
                                        </div>
                                        <small class="mt-2">正在加载文件内容...</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取文件内容
     */
    async fetchFileContent(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            throw new Error(`无法加载文件: ${error.message}`);
        }
    }

    /**
     * 渲染XML内容
     */
    renderXML(content) {
        const escapedContent = this.escapeHtml(content);
        return `
            <pre><code class="language-xml">${escapedContent}</code></pre>
        `;
    }

    /**
     * 渲染JSON内容
     */
    renderJSON(content) {
        try {
            const parsed = JSON.parse(content);
            const formatted = JSON.stringify(parsed, null, 2);
            const escapedContent = this.escapeHtml(formatted);
            return `
                <pre><code class="language-json">${escapedContent}</code></pre>
            `;
        } catch (error) {
            const escapedContent = this.escapeHtml(content);
            return `
                <div class="alert alert-warning" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>JSON格式错误: ${error.message}
                </div>
                <pre><code class="language-json">${escapedContent}</code></pre>
            `;
        }
    }

    /**
     * 渲染代码内容
     */
    renderCode(content, language) {
        const escapedContent = this.escapeHtml(content);
        return `
            <pre><code class="language-${language}">${escapedContent}</code></pre>
        `;
    }

    /**
     * 渲染Markdown内容（增强版）
     */
    async renderMarkdown(content) {
        try {
            // 配置marked
            if (window.marked) {
                const renderer = new marked.Renderer();
                
                // 自定义代码块渲染
                renderer.code = (code, language) => {
                    const validLanguage = language || 'text';
                    const escapedCode = this.escapeHtml(code);
                    
                    // 检查是否为Mermaid图表
                    if (validLanguage === 'mermaid') {
                        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
                        setTimeout(() => {
                            if (window.mermaid) {
                                window.mermaid.render(id, code).then(({svg}) => {
                                    document.getElementById(id).innerHTML = svg;
                                });
                            }
                        }, 100);
                        return `<div id="${id}" class="mermaid-diagram">${escapedCode}</div>`;
                    }
                    
                    return `<pre><code class="language-${validLanguage}">${escapedCode}</code></pre>`;
                };

                marked.setOptions({
                    renderer: renderer,
                    breaks: true,
                    gfm: true,
                    sanitize: false
                });

                let html = marked.parse(content);

                // 处理LaTeX数学公式
                if (window.katex) {
                    // 行内公式 $...$
                    html = html.replace(/\$([^$]+)\$/g, (match, formula) => {
                        try {
                            return katex.renderToString(formula, { displayMode: false });
                        } catch (e) {
                            return match;
                        }
                    });
                    
                    // 块级公式 $$...$$
                    html = html.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
                        try {
                            return katex.renderToString(formula, { displayMode: true });
                        } catch (e) {
                            return match;
                        }
                    });
                }

                return `<div class="markdown-content p-3">${html}</div>`;
            }
            
            // 如果marked未加载，返回原始内容
            const escapedContent = this.escapeHtml(content);
            return `<pre class="p-3">${escapedContent}</pre>`;
        } catch (error) {
            const escapedContent = this.escapeHtml(content);
            return `
                <div class="alert alert-warning" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>Markdown渲染错误: ${error.message}
                </div>
                <pre class="p-3">${escapedContent}</pre>
            `;
        }
    }

    /**
     * 渲染图片内容
     */
    renderImage(filePath) {
        return `
            <div class="image-preview">
                <img src="${filePath}" class="img-fluid" alt="图片预览">
            </div>
        `;
    }

    /**
     * 渲染文本内容
     */
    renderText(content) {
        const escapedContent = this.escapeHtml(content);
        return `<pre class="p-3" style="white-space: pre-wrap;">${escapedContent}</pre>`;
    }

    /**
     * HTML转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        return `
            <div class="file-preview-error">
                <i class="bi bi-exclamation-triangle"></i>
                <strong>加载失败:</strong> ${message}
            </div>
        `;
    }

    /**
     * 主预览方法
     */
    async preview(fileInfo) {
        try {
            // 加载必要的库
            await this.loadRequiredLibraries(fileInfo.extension);
            
            let content;
            let renderedContent;

            // 图片类型直接渲染，不需要获取内容
            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileInfo.extension)) {
                renderedContent = this.renderImage(fileInfo.fullPath);
            } else {
                // 获取文件内容
                content = await this.fetchFileContent(fileInfo.fullPath);
                
                // 根据文件类型渲染内容
                switch (fileInfo.extension) {
                    case 'xml':
                        renderedContent = this.renderXML(content);
                        break;
                    case 'json':
                        renderedContent = this.renderJSON(content);
                        break;
                    case 'css':
                        renderedContent = this.renderCode(content, 'css');
                        break;
                    case 'js':
                        renderedContent = this.renderCode(content, 'javascript');
                        break;
                    case 'html':
                        renderedContent = this.renderCode(content, 'html');
                        break;
                    case 'md':
                        renderedContent = await this.renderMarkdown(content);
                        break;
                    case 'txt':
                    default:
                        renderedContent = this.renderText(content);
                        break;
                }
            }

            // 更新预览内容
            const previewElement = document.getElementById('preview-content');
            if (previewElement) {
                previewElement.innerHTML = renderedContent;
                
                // 如果加载了Prism，触发代码高亮
                if (window.Prism) {
                    setTimeout(() => {
                        Prism.highlightAll();
                    }, 100);
                }
                
                // 如果是Markdown且加载了Mermaid，初始化图表
                if (fileInfo.extension === 'md' && window.mermaid) {
                    setTimeout(() => {
                        mermaid.init();
                    }, 200);
                }
            }
        } catch (error) {
            const previewElement = document.getElementById('preview-content');
            if (previewElement) {
                previewElement.innerHTML = this.showError(error.message);
            }
        }
    }
}

// 导出到全局
window.FilePreviewer = FilePreviewer;