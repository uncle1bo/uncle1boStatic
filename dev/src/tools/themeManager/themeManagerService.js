/**
 * 主题管理器服务
 * 处理主题配置的读取、保存和管理
 */

const fs = require('fs-extra');
const path = require('path');
const paths = require('../../config/pathConfig');

class ThemeManagerService {
  constructor() {
    this.configPath = path.join(paths.data, 'theme-config.json');
    this.cssPath = path.join(paths.prod, 'css', 'styles.css');
    this.defaultConfig = this.getDefaultConfig();
  }

  /**
   * 获取默认主题配置
   */
  getDefaultConfig() {
    return {
      light: {
        primary: '#4a6bff',
        secondary: '#6c757d',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#212529',
        textSecondary: '#6c757d',
        link: '#4a6bff',
        linkHover: '#2541b8',
        border: '#dee2e6',
        shadow: 'rgba(0, 0, 0, 0.1)',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8'
      },
      dark: {
        primary: '#5a7cff',
        secondary: '#adb5bd',
        background: '#121212',
        surface: '#1e1e1e',
        text: '#ffffff',
        textSecondary: '#adb5bd',
        link: '#5a7cff',
        linkHover: '#7b9aff',
        border: '#343a40',
        shadow: 'rgba(0, 0, 0, 0.3)',
        success: '#20c997',
        warning: '#fd7e14',
        danger: '#e74c3c',
        info: '#3498db'
      }
    };
  }

  /**
   * 读取主题配置
   */
  async getThemeConfig() {
    try {
      if (await fs.pathExists(this.configPath)) {
        const config = await fs.readJson(this.configPath);
        return { ...this.defaultConfig, ...config };
      }
      return this.defaultConfig;
    } catch (error) {
      console.error('读取主题配置失败:', error);
      return this.defaultConfig;
    }
  }

  /**
   * 保存主题配置
   */
  async saveThemeConfig(config) {
    try {
      // 确保数据目录存在
      await fs.ensureDir(path.dirname(this.configPath));
      
      // 保存配置文件到dev环境
      await fs.writeJson(this.configPath, config, { spaces: 2 });
      
      // 生成CSS文件到prod环境
      await this.generateCSS(config);
      
      return { success: true, message: '主题配置保存成功' };
    } catch (error) {
      console.error('保存主题配置失败:', error);
      return { success: false, message: '保存失败: ' + error.message };
    }
  }

  /**
   * 生成CSS文件
   */
  async generateCSS(config) {
    const lightTheme = config.light;
    const darkTheme = config.dark;

    const css = `/**
 * Uncle1bo静态站点主题样式
 * 由主题管理器自动生成
 */

/* 明亮模式 */
:root {
  --primary-color: ${lightTheme.primary};
  --secondary-color: ${lightTheme.secondary};
  --background-color: ${lightTheme.background};
  --surface-color: ${lightTheme.surface};
  --text-color: ${lightTheme.text};
  --text-secondary-color: ${lightTheme.textSecondary};
  --link-color: ${lightTheme.link};
  --link-hover-color: ${lightTheme.linkHover};
  --border-color: ${lightTheme.border};
  --shadow-color: ${lightTheme.shadow};
  --success-color: ${lightTheme.success};
  --warning-color: ${lightTheme.warning};
  --danger-color: ${lightTheme.danger};
  --info-color: ${lightTheme.info};
}

/* 暗夜模式 */
[data-bs-theme="dark"] {
  --primary-color: ${darkTheme.primary};
  --secondary-color: ${darkTheme.secondary};
  --background-color: ${darkTheme.background};
  --surface-color: ${darkTheme.surface};
  --text-color: ${darkTheme.text};
  --text-secondary-color: ${darkTheme.textSecondary};
  --link-color: ${darkTheme.link};
  --link-hover-color: ${darkTheme.linkHover};
  --border-color: ${darkTheme.border};
  --shadow-color: ${darkTheme.shadow};
  --success-color: ${darkTheme.success};
  --warning-color: ${darkTheme.warning};
  --danger-color: ${darkTheme.danger};
  --info-color: ${darkTheme.info};
}

/* 基础样式 */
body {
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 2px 4px var(--shadow-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.card-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--link-hover-color) 100%);
  border-bottom: 1px solid var(--border-color);
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary:hover, .btn-primary:focus {
  background-color: var(--link-hover-color);
  border-color: var(--link-hover-color);
}

.btn-success {
  background-color: var(--success-color);
  border-color: var(--success-color);
}

.btn-warning {
  background-color: var(--warning-color);
  border-color: var(--warning-color);
}

.btn-danger {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
}

.btn-info {
  background-color: var(--info-color);
  border-color: var(--info-color);
}

.text-muted {
  color: var(--text-secondary-color) !important;
}

a {
  color: var(--link-color);
  text-decoration: none;
}

a:hover {
  color: var(--link-hover-color);
}

.form-control {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.25rem rgba(74, 107, 255, 0.25);
}

.nav-tabs .nav-link {
  color: var(--text-secondary-color);
}

.nav-tabs .nav-link.active {
  color: var(--primary-color);
  background-color: var(--surface-color);
  border-color: var(--border-color);
}

.alert-info {
  background-color: var(--info-color);
  border-color: var(--info-color);
  color: white;
}

.alert-success {
  background-color: var(--success-color);
  border-color: var(--success-color);
  color: white;
}

.alert-warning {
  background-color: var(--warning-color);
  border-color: var(--warning-color);
  color: white;
}

.alert-danger {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
  color: white;
}

/* 主题切换按钮 */
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 50px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background-color: var(--primary-color);
  color: white;
}

/* 页面布局样式 */
.main-content {
  min-height: calc(100vh - 200px);
  flex: 1;
}

.container-fluid {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 底部备案样式 */
.footer {
  margin-top: auto;
  padding: 20px 0;
  background-color: var(--surface-color);
  border-top: 1px solid var(--border-color);
}

.footer img {
  height: 1em;
  width: auto;
  vertical-align: baseline;
}

.footer .text-muted {
  font-size: 0.875rem;
  line-height: 1.5;
}

.footer .text-muted img {
  margin: 0 2px;
}
`;

    // 确保CSS目录存在
    await fs.ensureDir(path.dirname(this.cssPath));
    
    // 写入CSS文件
    await fs.writeFile(this.cssPath, css, 'utf8');
  }

  /**
   * 重置为默认主题
   */
  async resetToDefault() {
    try {
      await this.saveThemeConfig(this.defaultConfig);
      return { success: true, message: '主题已重置为默认配置' };
    } catch (error) {
      console.error('重置主题失败:', error);
      return { success: false, message: '重置失败: ' + error.message };
    }
  }
}

module.exports = new ThemeManagerService();