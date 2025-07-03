/**
 * 外部资源管理器前端脚本
 * 处理资源扫描、下载和用户界面交互
 */

class ResourceManagerUI {
  constructor() {
    this.resources = [];
    this.selectedResources = new Set();
    this.downloadStatus = {};
    this.downloadInterval = null;
    this.isDownloading = false;
    
    // 404检测相关
    this.resource404List = [];
    this.selected404Resources = new Set();
    
    this.initEventListeners();
  }

  /**
   * 初始化事件监听器
   */
  initEventListeners() {
    // 刷新按钮
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.scanResources();
    });

    // 下载所有缺失资源
    document.getElementById('downloadAllBtn').addEventListener('click', () => {
      this.downloadAllMissing();
    });

    // 下载选中资源
    document.getElementById('downloadSelectedBtn').addEventListener('click', () => {
      this.downloadSelected();
    });

    // 清除缓存
    document.getElementById('clearCacheBtn').addEventListener('click', () => {
      this.clearCache();
    });

    // 显示历史
    document.getElementById('showHistoryBtn').addEventListener('click', () => {
      this.showHistory();
    });

    // 全选按钮
    document.getElementById('selectAllBtn').addEventListener('click', () => {
      this.toggleSelectAll();
    });

    // 仅显示缺失资源开关
    document.getElementById('showOnlyMissing').addEventListener('change', (e) => {
      this.filterResources(e.target.checked);
    });

    // 清除日志
    document.getElementById('clearLogBtn').addEventListener('click', () => {
      this.clearLog();
    });

    // 404检测相关事件监听器
    this.init404EventListeners();
  }

  /**
   * 扫描资源
   */
  async scanResources() {
    try {
      this.showLoading('正在扫描资源...');
      
      const response = await fetch('/resource-manager/scan');
      const data = await response.json();
      
      if (data.success) {
        this.resources = data.resources;
        this.updateStatistics();
        this.renderResourceList();
        this.log('资源扫描完成', 'success');
      } else {
        throw new Error(data.message || '扫描失败');
      }
    } catch (error) {
      console.error('扫描资源失败:', error);
      this.log(`扫描失败: ${error.message}`, 'error');
      this.showError('扫描资源失败: ' + error.message);
    }
  }

  /**
   * 下载所有缺失资源
   */
  async downloadAllMissing() {
    const missingResources = this.resources.filter(r => !r.exists);
    if (missingResources.length === 0) {
      this.showInfo('没有缺失的资源需要下载');
      return;
    }

    await this.downloadResources(missingResources.map(r => r.name));
  }

  /**
   * 下载选中资源
   */
  async downloadSelected() {
    if (this.selectedResources.size === 0) {
      this.showInfo('请先选择要下载的资源');
      return;
    }

    await this.downloadResources(Array.from(this.selectedResources));
  }

  /**
   * 下载资源
   */
  async downloadResources(resourceNames) {
    if (this.isDownloading) {
      this.showWarning('正在下载中，请等待完成');
      return;
    }

    try {
      this.isDownloading = true;
      this.showProgress();
      this.log(`开始下载 ${resourceNames.length} 个资源`, 'info');

      const response = await fetch('/resource-manager/download/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resources: resourceNames })
      });

      const data = await response.json();
      
      if (data.success) {
        this.log('下载任务已启动', 'success');
        this.startProgressMonitoring();
      } else {
        throw new Error(data.message || '启动下载失败');
      }
    } catch (error) {
      console.error('下载失败:', error);
      this.log(`下载失败: ${error.message}`, 'error');
      this.showError('下载失败: ' + error.message);
      this.isDownloading = false;
      this.hideProgress();
    }
  }

  /**
   * 开始进度监控
   */
  startProgressMonitoring() {
    this.downloadInterval = setInterval(async () => {
      try {
        const response = await fetch('/resource-manager/download/status');
        const data = await response.json();
        
        if (data.success) {
          this.updateDownloadProgress(data.status);
          
          if (data.status.completed) {
            this.stopProgressMonitoring();
            this.log('所有下载任务完成', 'success');
            this.scanResources(); // 重新扫描资源状态
          }
        }
      } catch (error) {
        console.error('获取下载状态失败:', error);
      }
    }, 1000);
  }

  /**
   * 停止进度监控
   */
  stopProgressMonitoring() {
    if (this.downloadInterval) {
      clearInterval(this.downloadInterval);
      this.downloadInterval = null;
    }
    this.isDownloading = false;
    this.hideProgress();
  }

  /**
   * 更新下载进度
   */
  updateDownloadProgress(status) {
    const { total, completed, current, progress } = status;
    
    // 更新进度条
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
    progressBar.textContent = `${Math.round(progress)}%`;
    
    progressText.textContent = `已完成 ${completed}/${total} 个资源`;
    
    // 更新统计卡片
    document.getElementById('downloadProgress').textContent = `${Math.round(progress)}%`;
    
    // 记录当前下载的资源
    if (current && current !== this.lastLoggedResource) {
      this.log(`正在下载: ${current}`, 'info');
      this.lastLoggedResource = current;
    }
  }

  /**
   * 清除缓存
   */
  async clearCache() {
    if (!confirm('确定要清除所有下载缓存吗？')) {
      return;
    }

    try {
      const response = await fetch('/resource-manager/cache/clear', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.log('缓存清除成功', 'success');
        this.showSuccess('缓存已清除');
      } else {
        throw new Error(data.message || '清除缓存失败');
      }
    } catch (error) {
      console.error('清除缓存失败:', error);
      this.log(`清除缓存失败: ${error.message}`, 'error');
      this.showError('清除缓存失败: ' + error.message);
    }
  }

  /**
   * 显示下载历史
   */
  async showHistory() {
    try {
      const response = await fetch('/resource-manager/history');
      const data = await response.json();
      
      if (data.success) {
        this.renderHistory(data.history);
        const modal = new bootstrap.Modal(document.getElementById('historyModal'));
        modal.show();
      } else {
        throw new Error(data.message || '获取历史记录失败');
      }
    } catch (error) {
      console.error('获取历史记录失败:', error);
      this.showError('获取历史记录失败: ' + error.message);
    }
  }

  /**
   * 渲染历史记录
   */
  renderHistory(history) {
    const container = document.getElementById('historyContent');
    
    if (history.length === 0) {
      container.innerHTML = '<p class="text-muted text-center">暂无下载历史记录</p>';
      return;
    }

    const html = history.map(record => `
      <div class="border-bottom pb-3 mb-3">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="mb-1">${record.resource}</h6>
            <small class="text-muted">${new Date(record.timestamp).toLocaleString()}</small>
          </div>
          <span class="badge bg-${record.success ? 'success' : 'danger'}">
            ${record.success ? '成功' : '失败'}
          </span>
        </div>
        ${record.error ? `<div class="text-danger small mt-1">${record.error}</div>` : ''}
        <div class="small text-muted mt-1">
          大小: ${this.formatFileSize(record.size || 0)} | 
          耗时: ${record.duration || 0}ms
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html;
  }

  /**
   * 更新统计信息
   */
  updateStatistics() {
    const missing = this.resources.filter(r => !r.exists).length;
    const available = this.resources.filter(r => r.exists).length;
    const total = this.resources.length;
    
    document.getElementById('missingCount').textContent = missing;
    document.getElementById('availableCount').textContent = available;
    document.getElementById('totalCount').textContent = total;
    
    // 更新下载按钮状态
    document.getElementById('downloadAllBtn').disabled = missing === 0;
  }

  /**
   * 渲染资源列表
   */
  renderResourceList() {
    const container = document.getElementById('resourceList');
    
    if (this.resources.length === 0) {
      container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">没有找到任何资源</p></div>';
      return;
    }

    const html = this.resources.map(resource => this.renderResourceCard(resource)).join('');
    container.innerHTML = html;
    
    // 绑定事件
    this.bindResourceEvents();
  }

  /**
   * 渲染单个资源卡片
   */
  renderResourceCard(resource) {
    const isSelected = this.selectedResources.has(resource.name);
    const statusClass = resource.exists ? 'available' : '';
    const statusBadge = resource.exists ? 
      '<span class="badge bg-success status-badge">可用</span>' : 
      '<span class="badge bg-danger status-badge">缺失</span>';
    
    return `
      <div class="col-md-6 col-lg-4 resource-item" data-resource="${resource.name}" ${resource.exists ? 'style="display: none;"' : ''}>
        <div class="card resource-card ${statusClass} h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title mb-0">${resource.name}</h6>
              ${statusBadge}
            </div>
            <p class="card-text small text-muted mb-2">${resource.description || '无描述'}</p>
            <div class="small text-muted mb-3">
              <div><strong>类型:</strong> ${resource.type}</div>
              <div><strong>本地路径:</strong> ${resource.localPath}</div>
              ${resource.size ? `<div><strong>大小:</strong> ${this.formatFileSize(resource.size)}</div>` : ''}
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <div class="form-check">
                <input class="form-check-input resource-checkbox" type="checkbox" 
                       id="check_${resource.name}" ${isSelected ? 'checked' : ''} 
                       ${resource.exists ? 'disabled' : ''}>
                <label class="form-check-label small" for="check_${resource.name}">
                  选择
                </label>
              </div>
              ${!resource.exists ? `
                <button class="btn btn-sm btn-success btn-download" data-resource="${resource.name}">
                  <i class="bi bi-download me-1"></i>下载
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 绑定资源事件
   */
  bindResourceEvents() {
    // 复选框事件
    document.querySelectorAll('.resource-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const resourceName = e.target.id.replace('check_', '');
        if (e.target.checked) {
          this.selectedResources.add(resourceName);
        } else {
          this.selectedResources.delete(resourceName);
        }
        this.updateSelectedButton();
      });
    });

    // 单个下载按钮事件
    document.querySelectorAll('.btn-download').forEach(button => {
      button.addEventListener('click', (e) => {
        const resourceName = e.target.dataset.resource;
        this.downloadResources([resourceName]);
      });
    });
  }

  /**
   * 更新选中按钮状态
   */
  updateSelectedButton() {
    const button = document.getElementById('downloadSelectedBtn');
    button.disabled = this.selectedResources.size === 0;
    button.innerHTML = `<i class="bi bi-check-square me-1"></i>下载选中资源 (${this.selectedResources.size})`;
  }

  /**
   * 全选/取消全选
   */
  toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.resource-checkbox:not(:disabled)');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(checkbox => {
      checkbox.checked = !allChecked;
      const resourceName = checkbox.id.replace('check_', '');
      if (!allChecked) {
        this.selectedResources.add(resourceName);
      } else {
        this.selectedResources.delete(resourceName);
      }
    });
    
    this.updateSelectedButton();
    
    const button = document.getElementById('selectAllBtn');
    button.innerHTML = allChecked ? 
      '<i class="bi bi-check-all me-1"></i>全选' : 
      '<i class="bi bi-square me-1"></i>取消全选';
  }

  /**
   * 过滤资源显示
   */
  filterResources(showOnlyMissing) {
    const items = document.querySelectorAll('.resource-item');
    items.forEach(item => {
      const resourceName = item.dataset.resource;
      const resource = this.resources.find(r => r.name === resourceName);
      
      if (showOnlyMissing) {
        item.style.display = resource.exists ? 'none' : 'block';
      } else {
        item.style.display = 'block';
      }
    });
  }

  /**
   * 显示/隐藏进度条
   */
  showProgress() {
    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('logSection').style.display = 'block';
  }

  hideProgress() {
    document.getElementById('progressContainer').style.display = 'none';
  }

  /**
   * 显示加载状态
   */
  showLoading(message) {
    const container = document.getElementById('resourceList');
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-3 text-muted">${message}</p>
      </div>
    `;
  }

  /**
   * 记录日志
   */
  log(message, type = 'info') {
    const logContainer = document.getElementById('downloadLog');
    const timestamp = new Date().toLocaleTimeString();
    const colorClass = {
      'info': 'text-info',
      'success': 'text-success',
      'warning': 'text-warning',
      'error': 'text-danger'
    }[type] || 'text-muted';
    
    const logEntry = document.createElement('div');
    logEntry.className = `${colorClass} mb-1`;
    logEntry.innerHTML = `[${timestamp}] ${message}`;
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  /**
   * 清除日志
   */
  clearLog() {
    document.getElementById('downloadLog').innerHTML = '';
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 显示提示信息
   */
  showInfo(message) {
    this.showToast(message, 'info');
  }

  showSuccess(message) {
    this.showToast(message, 'success');
  }

  showWarning(message) {
    this.showToast(message, 'warning');
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  showToast(message, type) {
    // 简单的提示实现，可以后续改为更美观的toast组件
    const alertClass = {
      'info': 'alert-info',
      'success': 'alert-success',
      'warning': 'alert-warning',
      'error': 'alert-danger'
    }[type] || 'alert-info';
    
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // 自动移除
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 5000);
  }

  /**
   * 初始化404检测事件监听器
   */
  init404EventListeners() {
    // 刷新404列表
    document.getElementById('refresh404Btn').addEventListener('click', () => {
      this.load404Resources();
    });

    // 清除所有404记录
    document.getElementById('clear404AllBtn').addEventListener('click', () => {
      this.clear404Resources();
    });

    // 下载选中的404资源
    document.getElementById('download404SelectedBtn').addEventListener('click', () => {
      this.download404Selected();
    });

    // 全选404资源
    document.getElementById('selectAll404Btn').addEventListener('click', () => {
      this.toggleSelectAll404();
    });

    // 仅显示未下载的404资源
    document.getElementById('showOnlyPending404').addEventListener('change', (e) => {
      this.filter404Resources(e.target.checked);
    });

    // 标签页切换事件
    const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabButtons.forEach(button => {
      button.addEventListener('shown.bs.tab', (e) => {
        if (e.target.getAttribute('data-bs-target') === '#404-pane') {
          this.load404Resources();
        }
      });
    });
  }

  /**
   * 加载404资源列表
   */
  async load404Resources() {
    try {
      this.show404Loading('正在加载404资源列表...');
      
      const response = await fetch('/resource-manager/404-resources');
      const data = await response.json();
      
      if (data.success) {
        this.resource404List = data.resources;
        this.update404Statistics();
        this.render404ResourceList();
        this.log('404资源列表加载完成', 'success');
      } else {
        throw new Error(data.message || '加载失败');
      }
    } catch (error) {
      console.error('加载404资源失败:', error);
      this.log(`加载404资源失败: ${error.message}`, 'error');
      this.show404Error('加载404资源失败: ' + error.message);
    }
  }

  /**
   * 清除所有404资源记录
   */
  async clear404Resources() {
    if (!confirm('确定要清除所有404资源记录吗？')) {
      return;
    }

    try {
      const response = await fetch('/resource-manager/404-resources', {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        this.resource404List = [];
        this.selected404Resources.clear();
        this.update404Statistics();
        this.render404ResourceList();
        this.log('404资源记录已清除', 'success');
        this.showSuccess('404资源记录已清除');
      } else {
        throw new Error(data.message || '清除失败');
      }
    } catch (error) {
      console.error('清除404资源失败:', error);
      this.log(`清除404资源失败: ${error.message}`, 'error');
      this.showError('清除404资源失败: ' + error.message);
    }
  }

  /**
   * 下载选中的404资源
   */
  async download404Selected() {
    if (this.selected404Resources.size === 0) {
      this.showInfo('请先选择要下载的404资源');
      return;
    }

    const selectedUrls = Array.from(this.selected404Resources);
    await this.download404Resources(selectedUrls);
  }

  /**
   * 下载404资源
   */
  async download404Resources(resourceUrls) {
    if (this.isDownloading) {
      this.showWarning('正在下载中，请等待完成');
      return;
    }

    try {
      this.isDownloading = true;
      this.showProgress();
      this.log(`开始下载 ${resourceUrls.length} 个404资源`, 'info');

      // 将URL转换为资源名称进行下载
      const resourceNames = resourceUrls.map(url => {
        // 从URL中提取资源名称
        const parts = url.split('/');
        return parts[parts.length - 1];
      });

      const response = await fetch('/resource-manager/download/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resources: resourceNames })
      });

      const data = await response.json();
      
      if (data.success) {
        this.log('404资源下载任务已启动', 'success');
        this.startProgressMonitoring();
        
        // 标记这些资源为已下载
        for (const url of resourceUrls) {
          await this.mark404ResourceDownloaded(url);
        }
      } else {
        throw new Error(data.message || '启动下载失败');
      }
    } catch (error) {
      console.error('下载404资源失败:', error);
      this.log(`下载404资源失败: ${error.message}`, 'error');
      this.showError('下载404资源失败: ' + error.message);
      this.isDownloading = false;
      this.hideProgress();
    }
  }

  /**
   * 标记404资源为已下载
   */
  async mark404ResourceDownloaded(url) {
    try {
      const response = await fetch('/resource-manager/404-resources/mark-downloaded', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      
      if (response.ok) {
        // 更新本地状态
        const resource = this.resource404List.find(r => r.url === url);
        if (resource) {
          resource.downloaded = true;
        }
      }
    } catch (error) {
      console.error('标记404资源为已下载失败:', error);
    }
  }

  /**
   * 切换全选404资源
   */
  toggleSelectAll404() {
    const visibleResources = this.getVisible404Resources();
    const allSelected = visibleResources.every(r => this.selected404Resources.has(r.url));
    
    if (allSelected) {
      // 取消全选
      visibleResources.forEach(r => this.selected404Resources.delete(r.url));
    } else {
      // 全选
      visibleResources.forEach(r => this.selected404Resources.add(r.url));
    }
    
    this.render404ResourceList();
    this.update404DownloadButton();
  }

  /**
   * 获取可见的404资源
   */
  getVisible404Resources() {
    const showOnlyPending = document.getElementById('showOnlyPending404').checked;
    return this.resource404List.filter(r => !showOnlyPending || !r.downloaded);
  }

  /**
   * 过滤404资源
   */
  filter404Resources(showOnlyPending) {
    this.render404ResourceList();
  }

  /**
   * 更新404统计信息
   */
  update404Statistics() {
    const total = this.resource404List.length;
    const downloaded = this.resource404List.filter(r => r.downloaded).length;
    const pending = total - downloaded;
    
    document.getElementById('total404Count').textContent = total;
    document.getElementById('downloaded404Count').textContent = downloaded;
    document.getElementById('pending404Count').textContent = pending;
  }

  /**
   * 渲染404资源列表
   */
  render404ResourceList() {
    const container = document.getElementById('resource404List');
    const visibleResources = this.getVisible404Resources();
    
    if (visibleResources.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-check-circle text-success" style="font-size: 3rem;"></i>
          <p class="mt-3 text-muted">没有404资源记录</p>
        </div>
      `;
      return;
    }
    
    const html = visibleResources.map(resource => {
      const isSelected = this.selected404Resources.has(resource.url);
      const statusClass = resource.downloaded ? 'success' : 'warning';
      const statusIcon = resource.downloaded ? 'check-circle' : 'clock';
      const statusText = resource.downloaded ? '已下载' : '未下载';
      
      return `
        <div class="card mb-2 resource-404-item ${isSelected ? 'border-primary' : ''}">
          <div class="card-body py-2">
            <div class="row align-items-center">
              <div class="col-auto">
                <div class="form-check">
                  <input class="form-check-input resource-404-checkbox" type="checkbox" 
                         value="${resource.url}" ${isSelected ? 'checked' : ''}>
                </div>
              </div>
              <div class="col">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1">${resource.url}</h6>
                    <small class="text-muted">
                      首次发现: ${new Date(resource.firstSeen).toLocaleString()}
                      | 最后发现: ${new Date(resource.lastSeen).toLocaleString()}
                      | 出现次数: ${resource.count}
                    </small>
                  </div>
                  <div class="text-end">
                    <span class="badge bg-${statusClass}">
                      <i class="bi bi-${statusIcon} me-1"></i>${statusText}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = html;
    
    // 绑定复选框事件
    container.querySelectorAll('.resource-404-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const url = e.target.value;
        if (e.target.checked) {
          this.selected404Resources.add(url);
        } else {
          this.selected404Resources.delete(url);
        }
        this.update404DownloadButton();
      });
    });
  }

  /**
   * 更新404下载按钮状态
   */
  update404DownloadButton() {
    const button = document.getElementById('download404SelectedBtn');
    const hasSelection = this.selected404Resources.size > 0;
    button.disabled = !hasSelection;
    button.textContent = hasSelection ? 
      `下载选中资源 (${this.selected404Resources.size})` : 
      '下载选中资源';
  }

  /**
   * 显示404加载状态
   */
  show404Loading(message) {
    const container = document.getElementById('resource404List');
    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-3 text-muted">${message}</p>
      </div>
    `;
  }

  /**
   * 显示404错误
   */
  show404Error(message) {
    const container = document.getElementById('resource404List');
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
        <p class="mt-3 text-danger">${message}</p>
        <button class="btn btn-outline-primary" onclick="resourceManagerUI.load404Resources()">
          <i class="bi bi-arrow-clockwise me-1"></i>重试
        </button>
      </div>
    `;
  }
}

// 全局变量
let resourceManagerUI;

/**
 * 初始化资源管理器
 */
function initResourceManager() {
  resourceManagerUI = new ResourceManagerUI();
  
  // 自动开始扫描
  resourceManagerUI.scanResources();
}

// 导出到全局
window.ResourceManagerUI = ResourceManagerUI;
window.initResourceManager = initResourceManager;