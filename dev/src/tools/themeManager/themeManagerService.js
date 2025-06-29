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
        success: '#22c55e',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8',
        mdH1: '#1a1a1a',
        mdH2: '#2d2d2d',
        mdH3: '#404040',
        mdH4: '#525252',
        mdH5: '#666666',
        mdH6: '#737373',
        mdText: '#212529',
        mdCodeBg: '#f8f9fa',
        mdCodeText: '#e83e8c',
        mdCodeBlockBg: '#f8f9fa',
        mdCodeBlockText: '#000000',
        mdCodeBlockBorder: '#dee2e6',
        mdBlockquoteBg: '#f8f9fa',
        mdBlockquoteText: '#6c757d',
        mdBlockquoteBorder: '#dee2e6',
        mdTableBorder: '#dee2e6',
        mdTableHeaderBg: '#e9ecef',
        mdTableHeaderText: '#495057',
        katexText: '#212529',
        katexBg: '#ffffff',
        mermaidBg: '#ffffff',
        mermaidText: '#212529',
        mermaidBorder: '#dee2e6',
        codeTheme: 'default'
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
        success: '#16a34a',
        warning: '#fd7e14',
        danger: '#e74c3c',
        info: '#3498db',
        mdH1: '#ffffff',
        mdH2: '#e9ecef',
        mdH3: '#dee2e6',
        mdH4: '#ced4da',
        mdH5: '#adb5bd',
        mdH6: '#9ca3af',
        mdText: '#ffffff',
        mdCodeBg: '#2d3748',
        mdCodeText: '#f687b3',
        mdCodeBlockBg: '#2d3748',
        mdCodeBlockText: '#ffffff',
        mdCodeBlockBorder: '#4a5568',
        mdBlockquoteBg: '#2d3748',
        mdBlockquoteText: '#a0aec0',
        mdBlockquoteBorder: '#4a5568',
        mdTableBorder: '#4a5568',
        mdTableHeaderBg: '#2d3748',
        mdTableHeaderText: '#e2e8f0',
        katexText: '#ffffff',
        katexBg: '#1e1e1e',
        mermaidBg: '#1e1e1e',
        mermaidText: '#ffffff',
        mermaidBorder: '#4a5568',
        codeTheme: 'dark'
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
  --md-h1-color: ${lightTheme.mdH1};
  --md-h2-color: ${lightTheme.mdH2};
  --md-h3-color: ${lightTheme.mdH3};
  --md-h4-color: ${lightTheme.mdH4};
  --md-h5-color: ${lightTheme.mdH5};
  --md-h6-color: ${lightTheme.mdH6};
  --md-text-color: ${lightTheme.mdText};
  --md-code-bg: ${lightTheme.mdCodeBg};
  --md-code-text: ${lightTheme.mdCodeText};
  --md-code-block-bg: ${lightTheme.mdCodeBlockBg};
  --md-code-block-text: ${lightTheme.mdCodeBlockText};
  --md-code-block-border: ${lightTheme.mdCodeBlockBorder};
  --md-blockquote-bg: ${lightTheme.mdBlockquoteBg};
  --md-blockquote-text: ${lightTheme.mdBlockquoteText};
  --md-blockquote-border: ${lightTheme.mdBlockquoteBorder};
  --md-table-border: ${lightTheme.mdTableBorder};
  --md-table-header-bg: ${lightTheme.mdTableHeaderBg};
  --md-table-header-text: ${lightTheme.mdTableHeaderText};
  --katex-text: ${lightTheme.katexText};
  --katex-bg: ${lightTheme.katexBg};
  --mermaid-bg: ${lightTheme.mermaidBg};
  --mermaid-text: ${lightTheme.mermaidText};
  --mermaid-border: ${lightTheme.mermaidBorder};

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
  --md-h1-color: ${darkTheme.mdH1};
  --md-h2-color: ${darkTheme.mdH2};
  --md-h3-color: ${darkTheme.mdH3};
  --md-h4-color: ${darkTheme.mdH4};
  --md-h5-color: ${darkTheme.mdH5};
  --md-h6-color: ${darkTheme.mdH6};
  --md-text-color: ${darkTheme.mdText};
  --md-code-bg: ${darkTheme.mdCodeBg};
  --md-code-text: ${darkTheme.mdCodeText};
  --md-code-block-bg: ${darkTheme.mdCodeBlockBg};
  --md-code-block-text: ${darkTheme.mdCodeBlockText};
  --md-code-block-border: ${darkTheme.mdCodeBlockBorder};
  --md-blockquote-bg: ${darkTheme.mdBlockquoteBg};
  --md-blockquote-text: ${darkTheme.mdBlockquoteText};
  --md-blockquote-border: ${darkTheme.mdBlockquoteBorder};
  --md-table-border: ${darkTheme.mdTableBorder};
  --md-table-header-bg: ${darkTheme.mdTableHeaderBg};
  --md-table-header-text: ${darkTheme.mdTableHeaderText};
  --katex-text: ${darkTheme.katexText};
  --katex-bg: ${darkTheme.katexBg};
  --mermaid-bg: ${darkTheme.mermaidBg};
  --mermaid-text: ${darkTheme.mermaidText};
  --mermaid-border: ${darkTheme.mermaidBorder};

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