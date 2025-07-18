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
        '--primary-color': '#4a6bff',
        '--secondary-color': '#6c757d',
        '--background-color': '#ffffff',
        '--surface-color': '#f8f9fa',
        '--card-background-color': '#e3f2fd',
        '--text-color': '#212529',
        '--text-secondary-color': '#6c757d',
        '--link-color': '#4a6bff',
        '--link-hover-color': '#2541b8',
        '--border-color': '#dee2e6',
        '--shadow-color': 'rgba(0, 0, 0, 0.1)',
        '--success-color': '#22c55e',
        '--warning-color': '#ffc107',
        '--danger-color': '#dc3545',
        '--info-color': '#17a2b8',
        '--md-h1-color': '#1a1a1a',
        '--md-h2-color': '#2d2d2d',
        '--md-h3-color': '#404040',
        '--md-h4-color': '#525252',
        '--md-h5-color': '#666666',
        '--md-h6-color': '#737373',
        // 注意：--md-text-color, --md-code-bg, --md-code-text, --md-code-block-bg, --md-code-block-text, --md-code-block-border 已移除
        // 这些配置项现由代码高亮主题统一管理
        '--md-blockquote-bg': '#f8f9fa',
        '--md-blockquote-text': '#6c757d',
        '--md-blockquote-border': '#dee2e6',
        '--md-table-border': '#dee2e6',
        '--md-table-header-bg': '#e9ecef',
        '--md-table-header-text': '#495057',
        '--katex-text': '#212529',
        '--katex-bg': '#ffffff',
        '--mermaid-bg': '#ffffff',
        '--mermaid-text': '#212529',
        '--mermaid-border': '#dee2e6',
        '--code-rain-color': '#5a7cff',
        'codeTheme': 'default'
      },
      dark: {
        '--primary-color': '#5a7cff',
        '--secondary-color': '#adb5bd',
        '--background-color': '#121212',
        '--surface-color': '#1e1e1e',
        '--card-background-color': '#1a2332',
        '--text-color': '#ffffff',
        '--text-secondary-color': '#adb5bd',
        '--link-color': '#5a7cff',
        '--link-hover-color': '#7b9aff',
        '--border-color': '#343a40',
        '--shadow-color': 'rgba(0, 0, 0, 0.3)',
        '--success-color': '#16a34a',
        '--warning-color': '#fd7e14',
        '--danger-color': '#e74c3c',
        '--info-color': '#3498db',
        '--md-h1-color': '#ffffff',
        '--md-h2-color': '#e9ecef',
        '--md-h3-color': '#dee2e6',
        '--md-h4-color': '#ced4da',
        '--md-h5-color': '#adb5bd',
        '--md-h6-color': '#9ca3af',
        // 注意：--md-text-color, --md-code-bg, --md-code-text, --md-code-block-bg, --md-code-block-text, --md-code-block-border 已移除
        // 这些配置项现由代码高亮主题统一管理
        '--md-blockquote-bg': '#2d3748',
        '--md-blockquote-text': '#a0aec0',
        '--md-blockquote-border': '#4a5568',
        '--md-table-border': '#4a5568',
        '--md-table-header-bg': '#2d3748',
        '--md-table-header-text': '#e2e8f0',
        '--katex-text': '#ffffff',
        '--katex-bg': '#1e1e1e',
        '--mermaid-bg': '#1e1e1e',
        '--mermaid-text': '#ffffff',
        '--mermaid-border': '#4a5568',
        '--code-rain-color': '#22c55e',
        'codeTheme': 'dark'
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
      
      // 同步完整主题配置到prod环境
      await this.syncConfigToProd(config);
      
      // 重新生成CSS文件
      await this.generateCSS(config);
      
      return { success: true, message: '主题配置保存成功' };
    } catch (error) {
      console.error('保存主题配置失败:', error);
      return { success: false, message: '保存失败: ' + error.message };
    }
  }

  /**
   * 同步完整主题配置到prod环境
   */
  async syncConfigToProd(config) {
    try {
      const prodConfigPath = path.join(paths.prod, 'theme-config.json');
      
      // 保存完整主题配置到prod目录
      await fs.writeJson(prodConfigPath, config, { spaces: 2 });
      
      console.log('完整主题配置已同步到prod环境');
    } catch (error) {
      console.error('同步主题配置到prod失败:', error);
      throw error;
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
 * 
 * ⚠️ 重要提醒：别直接改style.css，去改样式管理器，要不然会被覆盖！
 * 请使用开发环境中的主题管理器工具来修改主题配置
 */

/* 明亮模式 */
:root {
  --primary-color: ${lightTheme['--primary-color']};
  --secondary-color: ${lightTheme['--secondary-color']};
  --background-color: ${lightTheme['--background-color']};
  --surface-color: ${lightTheme['--surface-color']};
  --card-background-color: ${lightTheme['--card-background-color']};
  --text-color: ${lightTheme['--text-color']};
  --text-secondary-color: ${lightTheme['--text-secondary-color']};
  --link-color: ${lightTheme['--link-color']};
  --link-hover-color: ${lightTheme['--link-hover-color']};
  --border-color: ${lightTheme['--border-color']};
  --shadow-color: ${lightTheme['--shadow-color']};
  --success-color: ${lightTheme['--success-color']};
  --warning-color: ${lightTheme['--warning-color']};
  --danger-color: ${lightTheme['--danger-color']};
  --info-color: ${lightTheme['--info-color']};
  --md-h1-color: ${lightTheme['--md-h1-color']};
  --md-h2-color: ${lightTheme['--md-h2-color']};
  --md-h3-color: ${lightTheme['--md-h3-color']};
  --md-h4-color: ${lightTheme['--md-h4-color']};
  --md-h5-color: ${lightTheme['--md-h5-color']};
  --md-h6-color: ${lightTheme['--md-h6-color']};
  /* 注意：--md-text-color, --md-code-bg, --md-code-text, --md-code-block-bg, --md-code-block-text, --md-code-block-border 已移除 */
  /* 这些配置项现由代码高亮主题统一管理 */
  --md-blockquote-bg: ${lightTheme['--md-blockquote-bg']};
  --md-blockquote-text: ${lightTheme['--md-blockquote-text']};
  --md-blockquote-border: ${lightTheme['--md-blockquote-border']};
  --md-table-border: ${lightTheme['--md-table-border']};
  --md-table-header-bg: ${lightTheme['--md-table-header-bg']};
  --md-table-header-text: ${lightTheme['--md-table-header-text']};
  --katex-text: ${lightTheme['--katex-text']};
  --katex-bg: ${lightTheme['--katex-bg']};
  --mermaid-bg: ${lightTheme['--mermaid-bg']};
  --mermaid-text: ${lightTheme['--mermaid-text']};
  --mermaid-border: ${lightTheme['--mermaid-border']};
  --code-rain-color: ${lightTheme['--code-rain-color']};

}

/* 暗夜模式 */
[data-bs-theme="dark"] {
  --primary-color: ${darkTheme['--primary-color']};
  --secondary-color: ${darkTheme['--secondary-color']};
  --background-color: ${darkTheme['--background-color']};
  --surface-color: ${darkTheme['--surface-color']};
  --card-background-color: ${darkTheme['--card-background-color']};
  --text-color: ${darkTheme['--text-color']};
  --text-secondary-color: ${darkTheme['--text-secondary-color']};
  --link-color: ${darkTheme['--link-color']};
  --link-hover-color: ${darkTheme['--link-hover-color']};
  --border-color: ${darkTheme['--border-color']};
  --shadow-color: ${darkTheme['--shadow-color']};
  --success-color: ${darkTheme['--success-color']};
  --warning-color: ${darkTheme['--warning-color']};
  --danger-color: ${darkTheme['--danger-color']};
  --info-color: ${darkTheme['--info-color']};
  --md-h1-color: ${darkTheme['--md-h1-color']};
  --md-h2-color: ${darkTheme['--md-h2-color']};
  --md-h3-color: ${darkTheme['--md-h3-color']};
  --md-h4-color: ${darkTheme['--md-h4-color']};
  --md-h5-color: ${darkTheme['--md-h5-color']};
  --md-h6-color: ${darkTheme['--md-h6-color']};
  --md-blockquote-bg: ${darkTheme['--md-blockquote-bg']};
  --md-blockquote-text: ${darkTheme['--md-blockquote-text']};
  --md-blockquote-border: ${darkTheme['--md-blockquote-border']};
  --md-table-border: ${darkTheme['--md-table-border']};
  --md-table-header-bg: ${darkTheme['--md-table-header-bg']};
  --md-table-header-text: ${darkTheme['--md-table-header-text']};
  --katex-text: ${darkTheme['--katex-text']};
  --katex-bg: ${darkTheme['--katex-bg']};
  --mermaid-bg: ${darkTheme['--mermaid-bg']};
  --mermaid-text: ${darkTheme['--mermaid-text']};
  --mermaid-border: ${darkTheme['--mermaid-border']};
  --code-rain-color: ${darkTheme['--code-rain-color']};

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

/* Markdown 内容样式 */
.markdown-content {
  color: var(--md-text-color);
  line-height: 1.6;
}

.markdown-content h1 {
  color: var(--md-h1-color);
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.markdown-content h2 {
  color: var(--md-h2-color);
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.3rem;
}

.markdown-content h3 {
  color: var(--md-h3-color);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.6rem;
}

.markdown-content h4 {
  color: var(--md-h4-color);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.markdown-content h5 {
  color: var(--md-h5-color);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.markdown-content h6 {
  color: var(--md-h6-color);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.markdown-content p {
  color: var(--md-text-color);
  margin-bottom: 1rem;
}

/* 行内代码样式 - 仅在没有Prism主题时使用 */
.markdown-content code:not([class*="language-"]) {
  background-color: var(--md-code-bg);
  color: var(--md-code-text);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Courier New', Courier, monospace;
}

/* 代码块容器样式 - 不影响Prism主题 */
.markdown-content pre {
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

/* 仅在没有Prism主题时应用默认样式 */
.markdown-content pre:not([class*="language-"]) {
  background-color: var(--md-code-block-bg);
  border: 1px solid var(--md-code-block-border);
}

.markdown-content pre:not([class*="language-"]) code {
  background-color: transparent;
  color: var(--md-code-block-text);
  padding: 0;
  border-radius: 0;
  font-size: 0.9rem;
}

/* 确保Prism主题优先级更高 */
.markdown-content pre[class*="language-"] {
  padding: 1rem !important;
  border-radius: 8px !important;
  margin-bottom: 1rem !important;
  overflow-x: auto !important;
}

/* Prism工具栏样式修复 */
.markdown-content div.code-toolbar {
  position: relative;
  margin-bottom: 1rem;
}

.markdown-content div.code-toolbar > .toolbar {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.markdown-content div.code-toolbar:hover > .toolbar {
  opacity: 1;
}

.markdown-content div.code-toolbar > .toolbar .toolbar-item {
  display: inline-block;
}

.markdown-content div.code-toolbar > .toolbar .toolbar-item button {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.markdown-content div.code-toolbar > .toolbar .toolbar-item button:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.markdown-content blockquote {
  background-color: var(--md-blockquote-bg);
  color: var(--md-blockquote-text);
  border-left: 4px solid var(--md-blockquote-border);
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 0 8px 8px 0;
}

.markdown-content blockquote p {
  margin-bottom: 0;
  color: var(--md-blockquote-text);
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  border: 1px solid var(--md-table-border);
  border-radius: 8px;
  overflow: hidden;
}

.markdown-content table th {
  background-color: var(--md-table-header-bg);
  color: var(--md-table-header-text);
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid var(--md-table-border);
}

.markdown-content table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--md-table-border);
  color: var(--md-text-color);
}

.markdown-content table tr:last-child td {
  border-bottom: none;
}

.markdown-content ul, .markdown-content ol {
  color: var(--md-text-color);
  padding-left: 2rem;
  margin-bottom: 1rem;
}

.markdown-content li {
  margin-bottom: 0.5rem;
}

/* KaTeX 数学公式样式 */
.katex-inline, .katex-display {
  color: var(--katex-text) !important;
}

.katex-display {
  background-color: var(--katex-bg);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
  border: 1px solid var(--border-color);
}

.katex {
  color: var(--katex-text) !important;
}

.katex .base {
  color: var(--katex-text) !important;
}

/* Mermaid 图表样式 */
.mermaid-diagram {
  background-color: var(--mermaid-bg);
  border: 1px solid var(--mermaid-border);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
}

.mermaid {
  background-color: var(--mermaid-bg) !important;
}

.mermaid .node rect,
.mermaid .node circle,
.mermaid .node ellipse,
.mermaid .node polygon {
  fill: var(--surface-color) !important;
  stroke: var(--mermaid-border) !important;
}

.mermaid .node .label {
  color: var(--mermaid-text) !important;
}

.mermaid .edgePath .path {
  stroke: var(--mermaid-border) !important;
}

.mermaid .edgeLabel {
  background-color: var(--mermaid-bg) !important;
  color: var(--mermaid-text) !important;
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