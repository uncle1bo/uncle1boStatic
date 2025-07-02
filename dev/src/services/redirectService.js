/**
 * 重定向服务模块
 * 处理外部资源的自动重定向功能
 */

const redirectConfig = require('../config/redirectConfig');
const path = require('path');
const fs = require('fs');

class RedirectService {
  constructor() {
    this.config = redirectConfig;
    this.allRules = [...this.config.rules, ...this.config.customRules];
  }

  /**
   * 处理重定向请求
   * @param {string} requestPath - 请求路径
   * @returns {Object|null} - 重定向信息或null
   */
  processRedirect(requestPath) {
    if (!this.config.enabled) {
      return null;
    }

    // 遍历所有重定向规则
    for (const rule of this.allRules) {
      const match = requestPath.match(rule.pattern);
      if (match) {
        const newPath = rule.redirect(match);
        
        return {
          originalPath: requestPath,
          newPath: newPath,
          ruleName: rule.name,
          description: rule.description,
          statusCode: this.config.options.statusCode
        };
      }
    }

    return null;
  }

  /**
   * 添加自定义重定向规则
   * @param {Object} rule - 重定向规则
   */
  addCustomRule(rule) {
    // 验证规则格式
    if (!rule.name || !rule.pattern || !rule.redirect) {
      throw new Error('重定向规则必须包含 name, pattern 和 redirect 属性');
    }

    // 检查规则名称是否已存在
    const existingRule = this.allRules.find(r => r.name === rule.name);
    if (existingRule) {
      throw new Error(`重定向规则 '${rule.name}' 已存在`);
    }

    this.config.customRules.push(rule);
    this.allRules = [...this.config.rules, ...this.config.customRules];
  }

  /**
   * 移除自定义重定向规则
   * @param {string} ruleName - 规则名称
   */
  removeCustomRule(ruleName) {
    const index = this.config.customRules.findIndex(rule => rule.name === ruleName);
    if (index === -1) {
      throw new Error(`未找到重定向规则 '${ruleName}'`);
    }

    this.config.customRules.splice(index, 1);
    this.allRules = [...this.config.rules, ...this.config.customRules];
  }

  /**
   * 获取所有重定向规则
   * @returns {Array} - 重定向规则列表
   */
  getAllRules() {
    return this.allRules.map(rule => ({
      name: rule.name,
      pattern: rule.pattern.toString(),
      description: rule.description,
      isCustom: this.config.customRules.includes(rule)
    }));
  }

  /**
   * 更新配置选项
   * @param {Object} options - 新的配置选项
   */
  updateOptions(options) {
    this.config.options = { ...this.config.options, ...options };
  }

  /**
   * 记录重定向日志
   * @param {Object} redirectInfo - 重定向信息
   */
  logRedirect(redirectInfo) {
    if (this.config.options.logRedirects) {
      console.log(`[重定向] ${redirectInfo.originalPath} -> ${redirectInfo.newPath} (规则: ${redirectInfo.ruleName})`);
    }
  }

  /**
   * 验证目标路径是否存在
   * @param {string} targetPath - 目标路径
   * @param {string} rootPath - 根路径
   * @returns {boolean} - 是否存在
   */
  validateTargetPath(targetPath, rootPath) {
    try {
      const fullPath = path.join(rootPath, targetPath);
      return fs.existsSync(fullPath);
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取重定向统计信息
   * @returns {Object} - 统计信息
   */
  getStats() {
    return {
      totalRules: this.allRules.length,
      builtinRules: this.config.rules.length,
      customRules: this.config.customRules.length,
      enabled: this.config.enabled,
      options: this.config.options
    };
  }
}

// 创建单例实例
const redirectService = new RedirectService();

module.exports = redirectService;