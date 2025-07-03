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
      
      // Prism CSS - 默认主题
      'prism-theme-css': {
        type: 'css',
        path: 'assets/libs/prism/themes/prism.min.css',
        integrity: null
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
        dependencies: ['jquery', 'dataTables', 'bootstrap-js']
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
   * 动态切换Prism主题
   */
  async switchPrismTheme(theme) {
    // 移除现有的Prism主题
    const existingTheme = document.querySelector('link[data-resource="prism-theme-css"]');
    if (existingTheme) {
      existingTheme.remove();
      this.loadedResources.delete('prism-theme-css');
    }

    // 更新资源配置
    if (theme === 'default' || theme === 'prism') {
      this.resources['prism-theme-css'].path = 'assets/libs/prism/themes/prism.min.css';
    } else {
      this.resources['prism-theme-css'].path = `assets/libs/prism/themes/prism-${theme}.min.css`;
    }

    // 加载新主题
    try {
      await this.loadResource('prism-theme-css');
      console.log(`Prism主题已切换为: ${theme}`);
      
      // 重新高亮所有代码块
      if (window.Prism && window.Prism.highlightAll) {
        window.Prism.highlightAll();
      }
      
      return true;
    } catch (error) {
      console.error(`切换Prism主题失败: ${theme}`, error);
      return false;
    }
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