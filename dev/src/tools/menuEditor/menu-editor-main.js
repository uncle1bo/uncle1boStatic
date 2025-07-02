/**
 * 菜单编辑器主控制器
 * 整合所有模块并初始化应用
 */

class MenuEditor {
  constructor() {
    this.core = null;
    this.drag = null;
    this.operations = null;
    
    this.init();
  }

  // 初始化应用
  async init() {
    try {
      // 等待DOM加载完成
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }
      
      // 初始化核心模块
      this.core = new MenuEditorCore();
      
      // 初始化状态管理模块
      this.core.stateManager = new MenuEditorState(this.core);
      
      // 初始化拖拽模块
      this.drag = new MenuEditorDrag(this.core);
      
      // 初始化操作模块
      this.operations = new MenuEditorOperations(this.core);
      
      // 绑定拖拽方法到核心模块
      this.core.handleDragStart = this.drag.handleDragStart.bind(this.drag);
      this.core.handleDragOver = this.drag.handleDragOver.bind(this.drag);
      this.core.handleDrop = this.drag.handleDrop.bind(this.drag);
      this.core.handleDragEnd = this.drag.handleDragEnd.bind(this.drag);
      
      // 绑定操作方法到核心模块
      this.core.addMenuItem = this.operations.addMenuItem.bind(this.operations);
      this.core.addChildMenuItem = this.operations.addChildMenuItem.bind(this.operations);
      this.core.editMenuItem = this.operations.editMenuItem.bind(this.operations);
      this.core.deleteMenuItem = this.operations.deleteMenuItem.bind(this.operations);
      this.core.toggleLock = this.operations.toggleLock.bind(this.operations);
      
      // 设置事件监听器
      this.setupEventListeners();
      
      // 加载菜单数据
      await this.core.loadMenuStructure();
      
      console.log('菜单编辑器初始化完成');
    } catch (error) {
      console.error('菜单编辑器初始化失败:', error);
    }
  }

  // 设置事件监听器
  setupEventListeners() {
    // 表单提交事件
    const menuForm = document.getElementById('menuForm');
    if (menuForm) {
      menuForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.operations.saveMenuItem();
      });
    }
    
    // 添加菜单项按钮
    if (this.core.elements.addMenuItemBtn) {
      this.core.elements.addMenuItemBtn.addEventListener('click', () => {
        this.operations.addMenuItem();
      });
    }
    
    // 取消按钮
    if (this.core.elements.cancelBtn) {
      this.core.elements.cancelBtn.addEventListener('click', () => {
        this.operations.cancelEdit();
      });
    }
    
    // 保存菜单项按钮
    if (this.core.elements.saveMenuItemBtn) {
      this.core.elements.saveMenuItemBtn.addEventListener('click', () => {
        this.operations.saveMenuItem();
      });
    }
    
    // 保存所有更改按钮
    if (this.core.elements.saveAllBtn) {
      this.core.elements.saveAllBtn.addEventListener('click', () => {
        this.operations.saveAllChanges();
      });
    }
    
    // 父菜单选择变化事件
    if (this.core.elements.parentMenuItem) {
      this.core.elements.parentMenuItem.addEventListener('change', () => {
        this.updateMenuLevelDisplay();
        // 如果正在编辑状态，触发未保存更改提示
        if (this.core.isEditing) {
          this.core.stateManager.updateUnsavedState();
        }
      });
    }
    
    // 表单输入字段变化检测
    this.setupFormChangeDetection();
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      // Ctrl+S 保存
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (this.core.isEditing) {
          this.operations.saveMenuItem();
        } else {
          this.operations.saveAllChanges();
        }
      }
      
      // Escape 取消
      if (e.key === 'Escape') {
        this.operations.cancelEdit();
      }
    });
    
    // 窗口关闭前检查未保存的更改
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '您有未保存的更改，确定要离开吗？';
        return e.returnValue;
      }
    });
  }

  // 设置表单变化检测
  setupFormChangeDetection() {
    const formFields = [
      this.core.elements.menuItemNameZh,
      this.core.elements.menuItemNameEn,
      this.core.elements.menuItemLink
    ];
    
    const checkChanges = () => {
      if (this.core.isEditing) {
        this.core.stateManager.updateUnsavedState();
      }
    };
    
    // 使用状态管理器的防抖功能
    const debouncedCheck = this.core.stateManager.createDebouncedUpdate();
    
    formFields.forEach(field => {
      if (field) {
        // 监听输入事件（使用防抖）
        field.addEventListener('input', () => {
          if (this.core.isEditing) {
            debouncedCheck();
          }
        });
        
        // 监听变化事件（失去焦点时立即检测）
        field.addEventListener('change', checkChanges);
      }
    });
  }
  
  // 更新菜单层级显示
  updateMenuLevelDisplay() {
    const parentId = this.core.elements.parentMenuItem.value;
    let depth = 0;
    
    if (parentId) {
      // 计算父菜单的深度
      depth = this.core.getDepth(parentId) + 1;
    }
    
    const levelText = depth === 0 ? '一级菜单' : `${depth + 1}级菜单`;
    const badgeClass = depth === 0 ? 'bg-primary' : depth === 1 ? 'bg-success' : 'bg-warning';
    
    this.core.elements.menuLevelBadge.textContent = levelText;
    this.core.elements.menuLevelBadge.className = `badge ${badgeClass}`;
    
    // 更新顶级菜单选项状态
    const topOption = this.core.elements.parentMenuItem.querySelector('option[value=""]');
    if (topOption) {
      topOption.disabled = false;
      topOption.textContent = '顶级菜单';
    }
  }

  // 检查是否有未保存的更改
  hasUnsavedChanges() {
    return this.core.elements.saveAllBtn && 
           this.core.elements.saveAllBtn.classList.contains('btn-warning');
  }

  // 获取菜单数据（供外部调用）
  getMenuData() {
    return this.core.menuData;
  }

  // 设置菜单数据（供外部调用）
  setMenuData(data) {
    this.core.menuData = data;
    this.core.renderMenuItems();
  }

  // 刷新菜单显示
  refresh() {
    this.core.loadMenuStructure();
  }

  // 导出菜单数据
  exportMenuData() {
    const dataStr = JSON.stringify(this.core.menuData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'menu-structure.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // 导入菜单数据
  importMenuData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // 验证数据格式
          if (data && Array.isArray(data.menuItems)) {
            this.setMenuData(data);
            this.operations.showMessage('菜单数据导入成功', 'success');
            resolve(data);
          } else {
            throw new Error('无效的菜单数据格式');
          }
        } catch (error) {
          this.operations.showMessage('导入失败: ' + error.message, 'error');
          reject(error);
        }
      };
      
      reader.onerror = () => {
        const error = new Error('文件读取失败');
        this.operations.showMessage(error.message, 'error');
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }

  // 销毁实例
  destroy() {
    // 移除事件监听器
    document.removeEventListener('keydown', this.keydownHandler);
    window.removeEventListener('beforeunload', this.beforeunloadHandler);
    
    // 清理引用
    this.core = null;
    this.drag = null;
    this.operations = null;
  }
}

// 自动初始化
let menuEditor = null;

// 等待CDN资源和所有脚本加载完成后初始化
async function initializeMenuEditor() {
  try {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    
    // 等待CDN资源加载完成
    if (window.cdnResourcesReady) {
      await window.cdnResourcesReady;
      console.log('CDN资源加载完成，开始初始化菜单编辑器');
    } else {
      console.warn('CDN资源加载Promise不存在，直接初始化菜单编辑器');
    }
    
    // 确保所有依赖的类都已加载
    if (window.MenuEditorCore && window.MenuEditorDrag && window.MenuEditorOperations) {
      menuEditor = new MenuEditor();
      console.log('菜单编辑器初始化成功');
    } else {
      console.error('菜单编辑器依赖模块未完全加载');
    }
  } catch (error) {
    console.error('菜单编辑器初始化过程中发生错误:', error);
  }
}

// 启动初始化
initializeMenuEditor();

// 导出到全局
window.MenuEditor = MenuEditor;
window.menuEditor = menuEditor;