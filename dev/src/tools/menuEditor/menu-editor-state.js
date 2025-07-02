/**
 * 菜单编辑器状态管理模块
 * 统一处理未保存更改状态的显示和管理
 */

class MenuEditorState {
  constructor(core) {
    this.core = core;
    this.uiConfig = {
      SAVED: {
        buttonClass: 'btn-success',
        buttonIcon: 'bi-check',
        buttonText: '保存所有更改',
        showAlert: false
      },
      UNSAVED: {
        buttonClass: 'btn-warning',
        buttonIcon: 'bi-exclamation-triangle', 
        buttonText: '有未保存的更改',
        showAlert: true
      }
    };
  }

  // 统一更新未保存状态
  updateUnsavedState() {
    const hasChanges = this.core.isMenuDataChanged();
    const config = hasChanges ? this.uiConfig.UNSAVED : this.uiConfig.SAVED;
    
    this.updateSaveButton(config);
    this.updateUnsavedAlert(config.showAlert);
  }

  // 更新保存按钮状态
  updateSaveButton(config) {
    const saveBtn = this.core.elements.saveAllBtn;
    if (!saveBtn) return;

    // 移除所有状态类
    saveBtn.classList.remove('btn-success', 'btn-warning');
    
    // 添加新状态类
    saveBtn.classList.add(config.buttonClass);
    
    // 更新按钮内容
    saveBtn.innerHTML = `<i class="bi ${config.buttonIcon}"></i> ${config.buttonText}`;
  }

  // 更新未保存更改提示横幅
  updateUnsavedAlert(show) {
    const unsavedAlert = document.getElementById('unsavedChangesAlert');
    if (unsavedAlert) {
      unsavedAlert.classList.toggle('d-none', !show);
    }
  }

  // 显示未保存更改提示（兼容现有调用）
  showUnsavedChanges() {
    this.updateUnsavedState();
  }

  // 清除未保存更改状态（兼容现有调用）
  clearUnsavedChanges() {
    const config = this.uiConfig.SAVED;
    this.updateSaveButton(config);
    this.updateUnsavedAlert(false);
  }

  // 防抖工具函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 创建防抖版本的状态更新
  createDebouncedUpdate(wait = 300) {
    return this.debounce(() => this.updateUnsavedState(), wait);
  }
}

// 导出类
window.MenuEditorState = MenuEditorState;