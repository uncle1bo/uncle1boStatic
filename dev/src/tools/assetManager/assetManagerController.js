/**
 * 资源管理器控制器
 * 处理资源管理和重定向相关的HTTP请求
 */

const AssetManagerService = require('./assetManagerService');

class AssetManagerController {
  constructor() {
    this.service = new AssetManagerService();
  }

  // ==================== 资源管理接口 ====================

  /**
   * 扫描缺失资源
   */
  async scanResources(req, res) {
    try {
      const { resourceKey } = req.query;
      const result = await this.service.scanMissingResources(resourceKey || null);
      res.json(result);
    } catch (error) {
      console.error('扫描资源失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 下载单个资源
   */
  async downloadResource(req, res) {
    try {
      const { resourceKey, force } = req.body;
      if (!resourceKey) {
        return res.status(400).json({ error: '缺少资源标识' });
      }

      const result = await this.service.downloadResource(resourceKey, { force: !!force });
      res.json(result);
    } catch (error) {
      console.error('下载资源失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 批量下载资源
   */
  async downloadBatchResources(req, res) {
    try {
      const { resources, force } = req.body;
      if (!resources || !Array.isArray(resources) || resources.length === 0) {
        return res.status(400).json({ error: '缺少有效的资源列表' });
      }

      const result = await this.service.downloadBatchResources(resources, { force: !!force });
      res.json(result);
    } catch (error) {
      console.error('批量下载资源失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 获取下载历史
   */
  async getDownloadHistory(req, res) {
    try {
      const { limit } = req.query;
      const history = await this.service.getDownloadHistory(limit ? parseInt(limit) : 100);
      res.json(history);
    } catch (error) {
      console.error('获取下载历史失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 获取下载状态
   */
  async getDownloadStatus(req, res) {
    try {
      const { resourceKey } = req.query;
      const status = this.service.getDownloadStatus(resourceKey || null);
      res.json(status);
    } catch (error) {
      console.error('获取下载状态失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 获取404资源记录
   */
  async get404Resources(req, res) {
    try {
      const resources = await this.service.get404Resources();
      res.json(resources);
    } catch (error) {
      console.error('获取404资源记录失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 清理404资源记录
   */
  async clear404Resources(req, res) {
    try {
      const result = await this.service.clear404Resources();
      res.json(result);
    } catch (error) {
      console.error('清理404资源记录失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // ==================== 重定向管理接口 ====================

  /**
   * 获取所有重定向规则
   */
  async getAllRedirectRules(req, res) {
    try {
      const rules = this.service.getAllRedirectRules();
      res.json(rules);
    } catch (error) {
      console.error('获取重定向规则失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 添加自定义重定向规则
   */
  async addCustomRedirectRule(req, res) {
    try {
      const { name, pattern, redirect, description } = req.body;
      
      if (!name || !pattern || !redirect) {
        return res.status(400).json({ error: '缺少必要的规则属性' });
      }

      // 创建规则对象
      const rule = {
        name,
        pattern: new RegExp(pattern),
        redirect: (match) => {
          // 将字符串形式的重定向转换为函数
          let result = redirect;
          for (let i = 0; i < match.length; i++) {
            result = result.replace(`$${i}`, match[i]);
          }
          return result;
        },
        description: description || `自定义规则: ${name}`
      };

      const result = this.service.addCustomRedirectRule(rule);
      res.json(result);
    } catch (error) {
      console.error('添加重定向规则失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 删除自定义重定向规则
   */
  async removeCustomRedirectRule(req, res) {
    try {
      const { ruleName } = req.params;
      if (!ruleName) {
        return res.status(400).json({ error: '缺少规则名称' });
      }

      const result = this.service.removeCustomRedirectRule(ruleName);
      res.json(result);
    } catch (error) {
      console.error('删除重定向规则失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 测试重定向
   */
  async testRedirect(req, res) {
    try {
      const { path } = req.body;
      if (!path) {
        return res.status(400).json({ error: '缺少测试路径' });
      }

      const result = this.service.testRedirect(path);
      res.json(result);
    } catch (error) {
      console.error('测试重定向失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 获取重定向统计信息
   */
  async getRedirectStats(req, res) {
    try {
      const stats = this.service.getRedirectStats();
      res.json(stats);
    } catch (error) {
      console.error('获取重定向统计失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 更新重定向配置
   */
  async updateRedirectOptions(req, res) {
    try {
      const options = req.body;
      const result = this.service.updateRedirectOptions(options);
      res.json(result);
    } catch (error) {
      console.error('更新重定向配置失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // ==================== 页面渲染 ====================

  /**
   * 渲染资源管理器页面
   */
  renderAssetManagerPage(req, res) {
    res.render('asset-manager', {
      title: '资源管理器 - Uncle1bo静态站点工具集',
      activeTab: 'resources'
    });
  }

  /**
   * 渲染重定向管理器页面
   */
  renderRedirectManagerPage(req, res) {
    res.render('asset-manager', {
      title: '重定向管理器 - Uncle1bo静态站点工具集',
      activeTab: 'redirects'
    });
  }
}

module.exports = AssetManagerController;