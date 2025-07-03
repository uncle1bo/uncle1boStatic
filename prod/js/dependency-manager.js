/**
 * 依赖管理器 - 本地资源加载管理
 * 依赖管理器，专注于本地资源的加载和管理
 */

class DependencyManager {
  constructor() {
    this.resources = {
      // Bootstrap CSS
      'bootstrap-css': {
        type: 'css',
        path: 'assets/libs/bootstrap/bootstrap.min.css',
        integrity: null
      },
      
      // Bootstrap JS
      'bootstrap-js': {
        type: 'js',
        path: 'assets/libs/bootstrap/bootstrap.bundle.min.js',
        integrity: null,
        dependencies: []
      },
      
      // Bootstrap Icons
      'bootstrap-icons': {
        type: 'css',
        path: 'assets/libs/bootstrap/bootstrap-icons.css',
        integrity: null
      },
      
      // jQuery
      'jquery': {
        type: 'js',
        path: 'assets/libs/jquery/jquery.min.js',
        integrity: null,
        dependencies: []
      },
      
      // jQuery UI
      'jquery-ui': {
        type: 'js',
        path: 'assets/libs/jquery-ui/jquery-ui.min.js',
        integrity: null,
        dependencies: ['jquery']
      },
      
      // Prism 主题CSS
      'prism-theme-css': {
        type: 'css',
        path: 'assets/libs/prism/themes/prism.min.css',
        integrity: null
      },
      
      // Prism 语言组件
      'prism-clike': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-clike.min.js',
        integrity: null,
        dependencies: ['prism-core']
      },
      
      'prism-javascript': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-javascript.min.js',
        integrity: null,
        dependencies: ['prism-core', 'prism-clike']
      },
      
      'prism-css': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-css.min.js',
        integrity: null,
        dependencies: ['prism-core']
      },
      
      'prism-markup': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-markup.min.js',
        integrity: null,
        dependencies: ['prism-core']
      },
      
      'prism-json': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-json.min.js',
        integrity: null,
        dependencies: ['prism-core']
      },
      
      'prism-python': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-python.min.js',
        integrity: null,
        dependencies: ['prism-core']
      },
      
      'prism-bash': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-bash.min.js',
        integrity: null,
        dependencies: ['prism-core']
      },
      
      // Prism Toolbar CSS
      'prism-toolbar-css': {
        type: 'css',
        path: 'assets/libs/prism/plugins/toolbar/prism-toolbar.min.css',
        integrity: null
      },
      
      // Prism Core JS
      'prism-core': {
        type: 'js',
        path: 'assets/libs/prism/components/prism-core.min.js',
        integrity: null,
        dependencies: []
      },
      
      // Prism Autoloader
      'prism-autoloader': {
        type: 'js',
        path: 'assets/libs/prism/plugins/autoloader/prism-autoloader.min.js',
        integrity: null,
        dependencies: ['prism-core']
      },
      
      // Prism Toolbar
      'prism-toolbar': {
        type: 'js',
        path: 'assets/libs/prism/plugins/toolbar/prism-toolbar.min.js',
        integrity: null,
        dependencies: ['prism-core']
      },
      
      // Prism Copy to Clipboard
      'prism-copy': {
        type: 'js',
        path: 'assets/libs/prism/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js',
        integrity: null,
        dependencies: ['prism-core', 'prism-toolbar']
      },
      
      // KaTeX CSS
      'katex-css': {
        type: 'css',
        path: 'assets/libs/katex/katex.min.css',
        integrity: null
      },
      
      // KaTeX JS
      'katex-js': {
        type: 'js',
        path: 'assets/libs/katex/katex.min.js',
        integrity: null,
        dependencies: []
      },
      
      // Mermaid
      'mermaid': {
        type: 'js',
        path: 'assets/libs/mermaid/mermaid.min.js',
        integrity: null,
        dependencies: []
      },
      
      // DataTables CSS
      'dataTables-css': {
        type: 'css',
        path: 'assets/libs/datatables/dataTables.bootstrap5.min.css',
        integrity: null
      },
      
      // DataTables
      'dataTables': {
        type: 'js',
        path: 'assets/libs/datatables/jquery.dataTables.min.js',
        integrity: null,
        dependencies: ['jquery']
      },
      
      // DataTables Bootstrap
      'dataTables-bootstrap': {
        type: 'js',
        path: 'assets/libs/datatables/dataTables.bootstrap5.min.js',
        integrity: null,
        dependencies: ['jquery', 'dataTables', 'bootstrap-js', 'dataTables-css']
      }
    };
    
    this.loadedResources = new Set();
    this.loadingPromises = new Map();
    this.basePath = this.getBasePath();
  }
  
  /**
   * 获取基础路径
   */
  getBasePath() {
    // 检查是否在浏览器环境中
    if (typeof document !== 'undefined') {
      const scripts = document.getElementsByTagName('script');
      for (let script of scripts) {
        if (script.src && script.src.includes('dependency-manager.js')) {
          return script.src.replace(/js\/dependency-manager\.js.*$/, '');
        }
      }
    }
    // Node.js环境或无法获取路径时返回默认值
    return './';
  }
  
  /**
   * 加载资源
   */
  async loadResource(resourceKey) {
    if (this.loadedResources.has(resourceKey)) {
      return Promise.resolve();
    }
    
    if (this.loadingPromises.has(resourceKey)) {
      return this.loadingPromises.get(resourceKey);
    }
    
    const resource = this.resources[resourceKey];
    if (!resource) {
      console.warn(`未找到资源: ${resourceKey}`);
      return Promise.reject(new Error(`Resource not found: ${resourceKey}`));
    }
    
    const loadPromise = this.loadResourceWithDependencies(resourceKey);
    this.loadingPromises.set(resourceKey, loadPromise);
    
    try {
      await loadPromise;
      this.loadedResources.add(resourceKey);
      this.loadingPromises.delete(resourceKey);
    } catch (error) {
      this.loadingPromises.delete(resourceKey);
      throw error;
    }
    
    return loadPromise;
  }
  
  /**
   * 加载资源及其依赖
   */
  async loadResourceWithDependencies(resourceKey) {
    const resource = this.resources[resourceKey];
    if (!resource) {
      throw new Error(`Resource not found: ${resourceKey}`);
    }
    
    // 先加载依赖
    if (resource.dependencies && resource.dependencies.length > 0) {
      await Promise.all(
        resource.dependencies.map(dep => this.loadResource(dep))
      );
    }
    
    // 如果已经加载过，直接返回
    if (this.loadedResources.has(resourceKey)) {
      return;
    }
    
    // 加载资源
    const fullPath = this.basePath + resource.path;
    
    if (resource.type === 'css') {
      await this.loadCSS(fullPath, resourceKey);
    } else if (resource.type === 'js') {
      await this.loadJS(fullPath, resourceKey);
    }
  }
  
  /**
   * 加载CSS文件
   */
  loadCSS(url, resourceKey) {
    return new Promise((resolve, reject) => {
      // 检查是否已经存在
      const existing = document.querySelector(`link[data-resource="${resourceKey}"]`);
      if (existing) {
        resolve();
        return;
      }
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.setAttribute('data-resource', resourceKey);
      
      link.onload = () => {
        console.log(`CSS资源加载成功: ${resourceKey}`);
        resolve();
      };
      
      link.onerror = () => {
        console.error(`CSS资源加载失败: ${resourceKey} (${url})`);
        reject(new Error(`Failed to load CSS: ${resourceKey}`));
      };
      
      document.head.appendChild(link);
    });
  }
  
  /**
   * 加载JS文件
   */
  loadJS(url, resourceKey) {
    return new Promise((resolve, reject) => {
      // 检查是否已经存在
      const existing = document.querySelector(`script[data-resource="${resourceKey}"]`);
      if (existing) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = url;
      script.setAttribute('data-resource', resourceKey);
      
      script.onload = () => {
        console.log(`JS资源加载成功: ${resourceKey}`);
        resolve();
      };
      
      script.onerror = () => {
        console.error(`JS资源加载失败: ${resourceKey} (${url})`);
        reject(new Error(`Failed to load JS: ${resourceKey}`));
      };
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * 批量加载资源
   */
  async loadResources(resourceKeys) {
    return Promise.all(resourceKeys.map(key => this.loadResource(key)));
  }
  
  /**
   * 检查资源是否已加载
   */
  isResourceLoaded(resourceKey) {
    return this.loadedResources.has(resourceKey);
  }
  
  /**
   * 获取所有可用资源
   */
  getAvailableResources() {
    return Object.keys(this.resources);
  }
  
  /**
   * 添加新资源配置
   */
  addResource(resourceKey, config) {
    this.resources[resourceKey] = config;
  }
  
  /**
   * 移除资源配置
   */
  removeResource(resourceKey) {
    delete this.resources[resourceKey];
    this.loadedResources.delete(resourceKey);
    this.loadingPromises.delete(resourceKey);
  }
  
  /**
   * 清理已加载的资源
   */
  clearLoadedResources() {
    this.loadedResources.clear();
    this.loadingPromises.clear();
  }

  /**
   * 等待样式加载完成
   */
  async waitForStylesLoaded() {
    return new Promise((resolve) => {
      // 使用requestAnimationFrame确保样式已应用
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  }

  /**
   * 等待DOM元素准备就绪
   */
  async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // 超时处理
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * 动态切换CSS主题资源
   * @param {string} resourceKey - 资源键名
   * @param {string} newPath - 新的资源路径
   * @returns {Promise<boolean>} 切换是否成功
   */
  async switchThemeResource(resourceKey, newPath) {
    // 验证参数
    if (!resourceKey || !newPath) {
      console.error('switchThemeResource: 缺少必要参数');
      return false;
    }

    // 检查资源是否存在
    if (!this.resources[resourceKey]) {
      console.warn(`资源 ${resourceKey} 不存在`);
      return false;
    }

    // 如果路径相同，无需切换
    if (this.resources[resourceKey].path === newPath) {
      console.log(`资源 ${resourceKey} 路径未变化，跳过切换`);
      return true;
    }

    try {
      // 清理现有资源
      await this.cleanupResource(resourceKey);
      
      // 更新资源配置
      this.resources[resourceKey].path = newPath;
      
      // 加载新资源
      await this.loadResource(resourceKey);
      
      // 等待CSS样式生效
      await this.waitForStylesLoaded();
      
      console.log(`资源 ${resourceKey} 已成功切换为: ${newPath}`);
      return true;
      
    } catch (error) {
      console.error(`切换资源失败: ${resourceKey}`, error);
      return false;
    }
  }

  /**
   * 清理指定资源
   * @param {string} resourceKey - 资源键名
   */
  async cleanupResource(resourceKey) {
    // 移除DOM中的资源元素
    const existingResource = document.querySelector(`link[data-resource="${resourceKey}"]`);
    if (existingResource) {
      existingResource.remove();
    }
    
    // 清理内部状态
    this.loadedResources.delete(resourceKey);
    this.loadingPromises.delete(resourceKey);
    
    // 等待DOM更新
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
}

// 创建全局实例
if (typeof window !== 'undefined') {
  window.DependencyManager = DependencyManager;
  window.dependencyManager = new DependencyManager();
  console.log('依赖管理器已初始化');
}

// Node.js环境支持
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DependencyManager;
}