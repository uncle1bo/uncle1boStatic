/**
 * 外部资源管理器控制器
 * 处理HTTP请求和响应
 */

const ResourceManagerService = require('./resourceManagerService');

class ResourceManagerController {
  constructor() {
    this.service = new ResourceManagerService();
    
    // 监听下载事件
    this.service.on('downloadProgress', (data) => {
      // 可以在这里实现WebSocket推送进度更新
      console.log(`下载进度 ${data.resourceKey}: ${data.progress}%`);
    });
    
    this.service.on('downloadComplete', (data) => {
      console.log(`下载完成 ${data.resourceKey}: ${data.success ? '成功' : '失败'}`);
    });
  }

  /**
   * 获取主页面
   */
  async getIndexPage(req, res) {
    try {
      // 直接渲染EJS模板
      res.render('resource-manager');
    } catch (error) {
      console.error('渲染页面失败:', error);
      res.status(500).json({ success: false, message: '页面加载失败' });
    }
  }

  /**
   * 扫描缺失资源
   */
  async scanMissingResources(req, res) {
    try {
      const result = await this.service.scanMissingResources();
      res.json(result);
    } catch (error) {
      console.error('扫描资源失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 下载单个资源
   */
  async downloadSingleResource(req, res) {
    try {
      const { resourceKey } = req.params;
      const result = await this.service.downloadResource(resourceKey);
      res.json(result);
    } catch (error) {
      console.error('下载资源失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 批量下载资源
   */
  async downloadBatchResources(req, res) {
    try {
      const { resources } = req.body;
      if (!Array.isArray(resources) || resources.length === 0) {
        return res.status(400).json({ success: false, message: '请提供有效的资源列表' });
      }
      
      const result = await this.service.downloadBatchResources(resources);
      res.json(result);
    } catch (error) {
      console.error('批量下载失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 下载所有缺失资源
   */
  async downloadAllMissing(req, res) {
    try {
      const result = await this.service.downloadAllMissingResources();
      res.json(result);
    } catch (error) {
      console.error('下载所有缺失资源失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 获取下载状态
   */
  async getDownloadStatus(req, res) {
    try {
      const status = await this.service.getDownloadStatus();
      res.json({ success: true, status });
    } catch (error) {
      console.error('获取下载状态失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 获取资源映射配置
   */
  async getResourceMapping(req, res) {
    try {
      const mapping = await this.service.getResourceMapping();
      res.json({ success: true, mapping });
    } catch (error) {
      console.error('获取资源映射失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 清除下载缓存
   */
  async clearDownloadCache(req, res) {
    try {
      await this.service.clearDownloadStatus();
      res.json({ success: true, message: '下载缓存已清除' });
    } catch (error) {
      console.error('清除下载缓存失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 获取下载历史
   */
  async getDownloadHistory(req, res) {
    try {
      const history = await this.service.getDownloadHistory();
      res.json({ success: true, history });
    } catch (error) {
      console.error('获取下载历史失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 获取统计信息
   */
  async getStatistics(req, res) {
    try {
      const statistics = await this.service.getStatistics();
      res.json({ success: true, statistics });
    } catch (error) {
      console.error('获取统计信息失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 清除下载缓存
   */
  async clearCache(req, res) {
    try {
      this.service.clearDownloadStatus();
      res.json({ success: true, message: '缓存已清除' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 记录404资源
   */
  async record404Resource(req, res) {
    try {
      const { url, referrer } = req.body;
      if (!url) {
        return res.status(400).json({ success: false, message: '缺少资源URL' });
      }
      
      const result = await this.service.record404Resource(url, referrer);
      res.json({ success: result, message: result ? '404资源已记录' : '记录失败' });
    } catch (error) {
      console.error('记录404资源失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 获取404资源列表
   */
  async get404Resources(req, res) {
    try {
      const resources = await this.service.get404Resources();
      res.json({ success: true, resources });
    } catch (error) {
      console.error('获取404资源列表失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 清除404资源记录
   */
  async clear404Resources(req, res) {
    try {
      const { resourceId } = req.params;
      const result = await this.service.clear404Resources(resourceId);
      res.json({ success: result, message: result ? '404资源记录已清除' : '清除失败' });
    } catch (error) {
      console.error('清除404资源记录失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 标记404资源为已下载
   */
  async mark404ResourceDownloaded(req, res) {
    try {
      const { resourceId } = req.params;
      const result = await this.service.mark404ResourceDownloaded(resourceId);
      res.json({ success: result, message: result ? '资源已标记为已下载' : '标记失败' });
    } catch (error) {
      console.error('标记404资源失败:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ResourceManagerController;