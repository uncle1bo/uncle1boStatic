/**
 * 主题管理器前端脚本
 * 处理主题配置的用户交互和API调用
 */

class ThemeManager {
  constructor() {
    this.currentMode = 'light';
    this.themeConfig = null;
    this.init();
  }

  /**
   * 初始化主题管理器
   */
  async init() {
    try {
      // 加载主题配置
      await this.loadThemeConfig();
      
      // 初始化颜色选择器
      this.initColorPickers();
      
      // 初始化事件监听器
      this.initEventListeners();
      
      // 更新界面
      this.updateUI();
      
      console.log('主题管理器初始化成功');
    } catch (error) {
      console.error('主题管理器初始化失败:', error);
      this.showAlert('初始化失败: ' + error.message, 'danger');
    }
  }

  /**
   * 加载主题配置
   */
  async loadThemeConfig() {
    try {
      const response = await fetch('/theme-manager/config');
      const result = await response.json();
      
      if (result.success) {
        this.themeConfig = result.data;
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
      'primary', 'secondary', 'background', 'surface',
      'text', 'textSecondary', 'link', 'linkHover',
      'border', 'shadow', 'success', 'warning', 'danger', 'info'
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

        // 文本输入框变化事件
        textInput.addEventListener('input', (e) => {
          const color = e.target.value;
          if (this.isValidColor(color)) {
            colorInput.value = color;
            preview.style.backgroundColor = color;
            this.updateThemeValue(key, color);
            this.updatePreview();
          }
        });

        // 预览点击事件
        preview.addEventListener('click', () => {
          colorInput.click();
        });
      }
    });
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
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // 更新标题
    const title = mode === 'light' ? '明亮模式' : '暗夜模式';
    document.getElementById('current-mode-title').textContent = title;
    
    // 更新界面
    this.updateUI();
  }

  /**
   * 更新界面
   */
  updateUI() {
    if (!this.themeConfig) return;
    
    const currentTheme = this.themeConfig[this.currentMode];
    
    // 更新所有颜色输入框
    Object.keys(currentTheme).forEach(key => {
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
    
    // 更新预览
    this.updatePreview();
  }

  /**
   * 更新主题值
   */
  updateThemeValue(key, value) {
    if (this.themeConfig && this.themeConfig[this.currentMode]) {
      this.themeConfig[this.currentMode][key] = value;
    }
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
      preview.style.backgroundColor = currentTheme.surface;
      preview.style.color = currentTheme.text;
      preview.style.borderColor = currentTheme.border;
      
      // 更新预览区域内的按钮样式
      const buttons = preview.querySelectorAll('.btn');
      buttons.forEach(btn => {
        if (btn.classList.contains('btn-primary')) {
          btn.style.backgroundColor = currentTheme.primary;
          btn.style.borderColor = currentTheme.primary;
        } else if (btn.classList.contains('btn-success')) {
          btn.style.backgroundColor = currentTheme.success;
          btn.style.borderColor = currentTheme.success;
        } else if (btn.classList.contains('btn-warning')) {
          btn.style.backgroundColor = currentTheme.warning;
          btn.style.borderColor = currentTheme.warning;
        } else if (btn.classList.contains('btn-danger')) {
          btn.style.backgroundColor = currentTheme.danger;
          btn.style.borderColor = currentTheme.danger;
        }
      });
      
      // 更新链接颜色
      const links = preview.querySelectorAll('a');
      links.forEach(link => {
        link.style.color = currentTheme.link;
      });
      
      // 更新提示框颜色
      const alerts = preview.querySelectorAll('.alert');
      alerts.forEach(alert => {
        if (alert.classList.contains('alert-info')) {
          alert.style.backgroundColor = currentTheme.info;
          alert.style.borderColor = currentTheme.info;
        }
      });
      
      // 更新次要文字颜色
      const mutedTexts = preview.querySelectorAll('.text-muted');
      mutedTexts.forEach(text => {
        text.style.color = currentTheme.textSecondary;
      });
    }
  }

  /**
   * 保存主题配置
   */
  async saveTheme() {
    try {
      this.showAlert('正在保存主题配置...', 'info');
      
      const response = await fetch('/theme-manager/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config: this.themeConfig })
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
      
      const response = await fetch('/theme-manager/reset', {
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 初始化主题管理器
  window.themeManager = new ThemeManager();
  
  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.className = savedTheme === 'dark' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
  }
});