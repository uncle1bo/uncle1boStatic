/**
 * 主题管理器前端脚本
 * 处理主题配置的用户交互和API调用
 */

class ThemeManager {
  constructor() {
    this.currentMode = 'light';
    this.themeConfig = null;
    this.initialized = false;
  }

  /**
   * 初始化主题管理器
   */
  async init() {
    if (this.initialized) {
      console.log('主题管理器已初始化');
      return;
    }

    console.log('初始化主题管理器...');
    try {
      await this.loadThemeConfig();
      this.initEventListeners();
      this.initColorPickers();
      this.updateUI();
      // 初始化完成后更新预览
      await this.waitForInitialization();
      this.updatePreview();
      this.initialized = true;
      console.log('主题管理器初始化完成');
    } catch (error) {
      console.error('主题管理器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 加载主题配置
   */
  async loadThemeConfig() {
    try {
      const response = await fetch('/api/theme/config');
      const result = await response.json();
      
      if (result.success) {
        this.themeConfig = result.data;
        // 初始化代码主题
        await this.initCodeTheme();
      } else {
        throw new Error(result.message || '加载主题配置失败');
      }
    } catch (error) {
      console.error('加载主题配置失败:', error);
      throw error;
    }
  }

  /**
   * 初始化颜色选择器
   */
  initColorPickers() {
    const colorKeys = [
      '--primary-color', '--secondary-color', '--background-color', '--surface-color', '--card-background-color',
      '--text-color', '--text-secondary-color', '--link-color', '--link-hover-color',
      '--border-color', '--shadow-color', '--success-color', '--warning-color', '--danger-color', '--info-color',
      '--md-h1-color', '--md-h2-color', '--md-h3-color', '--md-h4-color', '--md-h5-color', '--md-h6-color',
      // 注意：mdText, mdCodeBg, mdCodeText, mdCodeBlockBg, mdCodeBlockText, mdCodeBlockBorder 已移除
      // 这些配置项现由代码高亮主题统一管理
      '--md-blockquote-bg', '--md-blockquote-text', '--md-blockquote-border',
      '--md-table-border', '--md-table-header-bg', '--md-table-header-text',
      '--katex-text', '--katex-bg', '--mermaid-bg', '--mermaid-text', '--mermaid-border',
      '--code-rain-color'
    ];

    colorKeys.forEach(key => {
      const colorInput = document.getElementById(`${key}-color`);
      const textInput = document.getElementById(`${key}-text`);
      const preview = document.getElementById(`${key}-preview`);

      if (colorInput && textInput && preview) {
        // 颜色选择器变化事件
        colorInput.addEventListener('change', (e) => {
          const color = e.target.value;
          textInput.value = color;
          preview.style.backgroundColor = color;
          this.updateThemeValue(key, color);
          this.updatePreview();
        });

        // 文本输入框变化事件 - 实时更新
        textInput.addEventListener('input', (e) => {
          const color = e.target.value;
          if (this.isValidColor(color)) {
            colorInput.value = color;
            preview.style.backgroundColor = color;
            this.updateThemeValue(key, color);
            this.updatePreview();
          }
        });
        
        // 文本输入框失焦事件 - 确保最终更新
        textInput.addEventListener('blur', (e) => {
          const color = e.target.value;
          if (this.isValidColor(color)) {
            colorInput.value = color;
            preview.style.backgroundColor = color;
            this.updateThemeValue(key, color);
            this.updatePreview();
          }
        });
        
        // 颜色选择器实时变化事件
        colorInput.addEventListener('input', (e) => {
          const color = e.target.value;
          textInput.value = color;
          preview.style.backgroundColor = color;
          this.updateThemeValue(key, color);
          this.updatePreview();
        });

        // 预览点击事件
        preview.addEventListener('click', () => {
          colorInput.click();
        });
      }
    });

    // 处理主题选择器
    const codeThemeSelect = document.getElementById('codeTheme-select');
    if (codeThemeSelect) {
      codeThemeSelect.addEventListener('change', async (e) => {
        const theme = e.target.value;
        this.updateThemeValue('codeTheme', theme);
        await this.updateCodeTheme(theme);
        // 更新预览，确保代码主题加载完成
        await this.waitForCodeTheme();
        this.updatePreview();
        this.updateCodePreview();
      });
    }
  }

  /**
   * 初始化代码主题
   */
  async initCodeTheme() {
    if (this.themeConfig && this.themeConfig[this.currentMode]) {
      const theme = this.themeConfig[this.currentMode].codeTheme || 'default';
      await this.updateCodeTheme(theme);
    }
    
    // 确保代码预览区域被正确初始化
    await this.waitForCodeTheme();
    this.initCodePreview();
  }
  
  /**
   * 初始化代码预览区域
   */
  initCodePreview() {
    const codePreview = document.getElementById('code-preview');
    if (codePreview && window.Prism) {
      // 确保代码内容正确设置
      if (!codePreview.textContent.trim()) {
        codePreview.textContent = `// JavaScript 示例代码
function greetUser(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  
  // 条件判断
  if (name === 'Admin') {
    return {
      role: 'administrator',
      permissions: ['read', 'write', 'delete']
    };
  }
  
  // 数组操作
  const numbers = [1, 2, 3, 4, 5];
  const doubled = numbers.map(n => n * 2);
  
  return {
    greeting: message,
    doubled: doubled
  };
}

// 调用函数
const result = greetUser('Developer');
console.log(result);`;
      }
      
      // 应用语法高亮
      this.updateCodePreview();
    }
  }

  /**
   * 更新代码高亮主题
   */
  /**
   * 更新代码高亮主题
   * @param {string} theme - 主题名称
   */
  async updateCodeTheme(theme) {
    try {
      // 构建主题路径
      const themePath = (theme === 'default' || theme === 'prism') 
        ? 'assets/libs/prism/themes/prism.min.css'
        : `assets/libs/prism/themes/prism-${theme}.min.css`;
      
      // 检查依赖管理器是否可用
      if (!window.dependencyManager) {
        console.error('依赖管理器未初始化，无法切换代码主题');
        return;
      }
      
      // 使用依赖管理器切换主题资源
      const success = await window.dependencyManager.switchThemeResource('prism-theme-css', themePath);
      
      if (success) {
        console.log(`代码主题已更新为: ${theme}`);
      } else {
        console.warn(`代码主题切换失败: ${theme}`);
      }
      
      // 无论成功与否，都尝试重新高亮代码
      await this.reapplyCodeHighlight();
      
    } catch (error) {
      console.error('切换代码主题失败:', error);
      // 确保即使失败也尝试重新高亮
      await this.reapplyCodeHighlight();
    }
  }

  /**
   * 重新应用代码高亮
   */
  async reapplyCodeHighlight() {
    // 等待Prism库准备就绪
    await this.waitForCodeTheme();
    
    if (!window.Prism) {
      console.warn('Prism库未加载，无法重新高亮代码');
      return;
    }
    
    try {
      // 移除现有的高亮类
      const codeBlocks = document.querySelectorAll('pre[class*="language-"], code[class*="language-"]');
      codeBlocks.forEach(block => {
        // 清除Prism添加的类和属性
        block.classList.remove('prism-highlighted');
        if (block.hasAttribute('data-prism-highlighted')) {
          block.removeAttribute('data-prism-highlighted');
        }
      });
      
      // 使用requestAnimationFrame确保DOM更新完成
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          // 重新高亮所有代码
          if (window.Prism.highlightAll) {
            window.Prism.highlightAll();
          }
          
          // 特别处理代码预览区域
          const codePreview = document.getElementById('code-preview');
          if (codePreview && window.Prism.highlightElement) {
            // 保存原始文本内容
            const originalText = codePreview.textContent || codePreview.innerText;
            
            // 重置元素状态
            codePreview.className = 'language-javascript';
            codePreview.innerHTML = '';
            codePreview.textContent = originalText;
            
            // 重新应用语法高亮
            window.Prism.highlightElement(codePreview);
          }
          
          resolve();
        });
      });
    } catch (error) {
      console.warn('重新高亮代码失败:', error);
    }
  }

  /**
   * 更新代码预览（保持向后兼容）
   */
  updateCodePreview() {
    this.reapplyCodeHighlight();
  }

  /**
   * 验证颜色值
   */
  isValidColor(color) {
    // 支持十六进制和rgba格式的颜色验证
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const rgbaPattern = /^rgba?\([^)]+\)$/;
    
    if (hexPattern.test(color) || rgbaPattern.test(color)) {
      return true;
    }
    
    // 使用DOM方式验证其他格式
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  }

  /**
   * 初始化事件监听器
   */
  initEventListeners() {
    // 模式切换按钮
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.target.closest('.mode-btn').dataset.mode;
        this.switchMode(mode);
      });
    });
    
    // 代码主题选择器
    const codeThemeSelect = document.getElementById('codeTheme-select');
    if (codeThemeSelect) {
      codeThemeSelect.addEventListener('change', async (e) => {
        const theme = e.target.value;
        // 直接更新配置，避免触发不必要的预览更新
        if (this.themeConfig && this.themeConfig[this.currentMode]) {
          this.themeConfig[this.currentMode]['codeTheme'] = theme;
        }
        await this.updateCodeTheme(theme);
      });
    }
  }

  /**
   * 切换编辑模式
   */
  switchMode(mode) {
    this.currentMode = mode;
    
    // 更新按钮状态
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const targetBtn = document.querySelector(`[data-mode="${mode}"]`);
    if (targetBtn) {
      targetBtn.classList.add('active');
    }
    
    // 更新标题
    const title = mode === 'light' ? '明亮模式' : '暗夜模式';
    const titleElement = document.getElementById('current-mode-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
    
    // 更新界面
    this.updateUI();
    
    // 更新代码主题
    if (this.themeConfig && this.themeConfig[mode]) {
      const codeTheme = this.themeConfig[mode].codeTheme || 'default';
      // 异步更新代码主题，避免阻塞UI
      this.updateCodeTheme(codeTheme).catch(error => {
        console.error('更新代码主题失败:', error);
      });
    }
    
    // 触发主题变化事件
    this.dispatchThemeChangedEvent();
  }

  /**
   * 更新界面
   */
  updateUI() {
    if (!this.themeConfig) return;
    
    const currentTheme = this.themeConfig[this.currentMode];
    
    // 更新所有颜色输入框
    Object.keys(currentTheme).forEach(key => {
      if (key === 'codeTheme') return;
      
      const colorInput = document.getElementById(`${key}-color`);
      const textInput = document.getElementById(`${key}-text`);
      const preview = document.getElementById(`${key}-preview`);
      
      if (colorInput && textInput && preview) {
        const color = currentTheme[key];
        colorInput.value = color;
        textInput.value = color;
        preview.style.backgroundColor = color;
      }
    });
    
    // 更新代码主题选择器
    const codeThemeSelect = document.getElementById('codeTheme-select');
    if (codeThemeSelect && currentTheme.codeTheme) {
      codeThemeSelect.value = currentTheme.codeTheme;
    }
    
    // 更新预览效果
    this.updatePreview();
  }

  /**
   * 更新主题值
   */
  updateThemeValue(key, value) {
    if (this.themeConfig && this.themeConfig[this.currentMode]) {
      this.themeConfig[this.currentMode][key] = value;
    }
    this.updatePreview();
  }

  /**
   * 更新预览效果
   */
  updatePreview() {
    if (!this.themeConfig) return;
    
    const currentTheme = this.themeConfig[this.currentMode];
    const preview = document.getElementById('theme-preview');
    
    if (preview) {
      // 应用主题样式到预览区域
      preview.style.backgroundColor = currentTheme['--surface-color'];
      preview.style.color = currentTheme['--text-color'];
      preview.style.borderColor = currentTheme['--border-color'];
      
      // 更新预览区域内的按钮样式
      const buttons = preview.querySelectorAll('.btn');
      buttons.forEach(btn => {
        if (btn.classList.contains('btn-primary')) {
          btn.style.backgroundColor = currentTheme['--primary-color'];
          btn.style.borderColor = currentTheme['--primary-color'];
        } else if (btn.classList.contains('btn-success')) {
          btn.style.backgroundColor = currentTheme['--success-color'];
          btn.style.borderColor = currentTheme['--success-color'];
        } else if (btn.classList.contains('btn-warning')) {
          btn.style.backgroundColor = currentTheme['--warning-color'];
          btn.style.borderColor = currentTheme['--warning-color'];
        } else if (btn.classList.contains('btn-danger')) {
          btn.style.backgroundColor = currentTheme['--danger-color'];
          btn.style.borderColor = currentTheme['--danger-color'];
        }
      });
      
      // 更新链接颜色
      const links = preview.querySelectorAll('a');
      links.forEach(link => {
        link.style.color = currentTheme['--link-color'];
      });
      
      // 更新提示框颜色
      const alerts = preview.querySelectorAll('.alert');
      alerts.forEach(alert => {
        if (alert.classList.contains('alert-info')) {
          alert.style.backgroundColor = currentTheme['--info-color'];
          alert.style.borderColor = currentTheme['--info-color'];
        }
      });
      
      // 更新次要文字颜色
      const mutedTexts = preview.querySelectorAll('.text-muted');
      mutedTexts.forEach(text => {
        text.style.color = currentTheme['--text-secondary-color'];
      });
    }
    
    // 触发主题变化事件，通知其他组件更新
    this.dispatchThemeChangedEvent();
  }

  /**
   * 保存主题配置
   */
  async saveTheme() {
    try {
      this.showAlert('正在保存主题配置...', 'info');
      
      // 确保JSON序列化正确处理特殊字符
      const configData = JSON.stringify({ config: this.themeConfig });
      
      const response = await fetch('/api/theme/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: configData
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showAlert('主题配置保存成功！', 'success');
      } else {
        throw new Error(result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存主题配置失败:', error);
      this.showAlert('保存失败: ' + error.message, 'danger');
    }
  }

  /**
   * 重置主题配置
   */
  async resetTheme() {
    if (!confirm('确定要重置为默认主题配置吗？这将丢失所有自定义设置。')) {
      return;
    }
    
    try {
      this.showAlert('正在重置主题配置...', 'info');
      
      const response = await fetch('/api/theme/reset', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 重新加载配置
        await this.loadThemeConfig();
        this.updateUI();
        this.showAlert('主题配置已重置为默认设置！', 'success');
      } else {
        throw new Error(result.message || '重置失败');
      }
    } catch (error) {
      console.error('重置主题配置失败:', error);
      this.showAlert('重置失败: ' + error.message, 'danger');
    }
  }

  /**
   * 验证颜色值
   */
  isValidColor(color) {
    // 简单的颜色验证
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const rgbaPattern = /^rgba?\([^)]+\)$/;
    return hexPattern.test(color) || rgbaPattern.test(color);
  }

  /**
   * 等待初始化完成
   */
  async waitForInitialization() {
    return new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve, { once: true });
      }
    });
  }

  /**
   * 等待代码主题加载完成
   */
  async waitForCodeTheme() {
    return new Promise(resolve => {
      // 检查Prism是否已加载
      if (window.Prism && window.Prism.highlightElement) {
        resolve();
      } else {
        // 等待Prism加载
        const checkPrism = () => {
          if (window.Prism && window.Prism.highlightElement) {
            resolve();
          } else {
            requestAnimationFrame(checkPrism);
          }
        };
        checkPrism();
      }
    });
  }

  /**
   * 触发主题变化事件
   */
  dispatchThemeChangedEvent() {
    try {
      const themeChangeEvent = new CustomEvent('themeChanged', {
        detail: {
          mode: this.currentMode,
          config: this.themeConfig ? this.themeConfig[this.currentMode] : null
        },
        bubbles: true
      });
      document.dispatchEvent(themeChangeEvent);
      console.log('主题变化事件已触发:', this.currentMode);
    } catch (error) {
      console.error('触发主题变化事件失败:', error);
    }
  }

  /**
   * 显示提示消息
   */
  showAlert(message, type = 'info') {
    // 移除现有的提示
    const existingAlert = document.querySelector('.theme-alert');
    if (existingAlert) {
      existingAlert.remove();
    }
    
    // 创建新的提示
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show theme-alert`;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.left = '50%';
    alert.style.transform = 'translateX(-50%)';
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // 3秒后自动消失
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 3000);
  }
}

// 全局函数
function switchMode(mode) {
  if (window.themeManager) {
    window.themeManager.switchMode(mode);
  }
}

function saveTheme() {
  if (window.themeManager) {
    window.themeManager.saveTheme();
  }
}

function resetTheme() {
  if (window.themeManager) {
    window.themeManager.resetTheme();
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  
  // 更新图标
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.className = newTheme === 'dark' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
  }
  
  // 保存到本地存储
  localStorage.setItem('theme', newTheme);
}

// 页面加载完成后初始化主题设置
document.addEventListener('DOMContentLoaded', () => {
  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.className = savedTheme === 'dark' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
  }
});