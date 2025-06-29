/**
 * 菜单编辑器核心功能模块
 * 处理菜单数据的加载、渲染和基本操作
 */

class MenuEditorCore {
  constructor() {
    this.menuData = { menuItems: [] };
    this.selectedMenuItem = null;
    this.isEditing = false;
    this.draggedItem = null;
    this.maxDepth = 3;
    this.expandedItems = new Set();
    
    // DOM 元素引用
    this.elements = {};
    this.initializeElements();
  }

  // 初始化DOM元素引用
  initializeElements() {
    const elementIds = [
      'loadingIndicator', 'menuItems', 'emptyIndicator', 'menuList',
      'menuItemNameZh', 'menuItemNameEn', 'menuItemLink', 
      'menuLevelBadge', 'parentMenuItem', 'addMenuItemBtn', 'deleteMenuItemBtn', 
      'cancelBtn', 'saveMenuItemBtn', 'saveAllBtn', 'successAlert', 'errorAlert', 
      'successMessage', 'errorMessage'
    ];
    
    elementIds.forEach(id => {
      this.elements[id] = document.getElementById(id);
    });
    
    // Bootstrap模态框
    this.deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    this.elements.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  }

  // 加载菜单结构
  async loadMenuStructure() {
    try {
      this.elements.loadingIndicator.classList.remove('d-none');
      this.elements.menuItems.classList.add('d-none');
      this.elements.emptyIndicator.classList.add('d-none');
      
      const response = await fetch('/menu-editor/structure');
      const result = await response.json();
      
      if (result.success && result.menuItems) {
        this.menuData.menuItems = result.menuItems;
        this.renderMenuItems();
        
        if (this.menuData.menuItems.length > 0) {
          this.elements.menuItems.classList.remove('d-none');
        } else {
          this.elements.emptyIndicator.classList.remove('d-none');
        }
      } else {
        this.elements.emptyIndicator.classList.remove('d-none');
        console.error('加载菜单结构失败:', result.error);
      }
    } catch (error) {
      console.error('加载菜单结构失败:', error);
      this.elements.emptyIndicator.classList.remove('d-none');
    } finally {
      this.elements.loadingIndicator.classList.add('d-none');
    }
  }

  // 渲染菜单项
  renderMenuItems() {
    this.elements.menuList.innerHTML = '';
    
    // 递归渲染菜单树
    this.renderMenuTree(this.menuData.menuItems, this.elements.menuList, 0);
    
    // 更新父菜单选择框
    this.updateParentMenuSelect();
    
    // 更新展开/折叠按钮状态
    this.updateExpandButtons();
  }

  // 递归渲染菜单树
  renderMenuTree(items, container, depth) {
    items.forEach((item, index) => {
      const menuItem = this.createMenuItemElement(item, depth > 0);
      container.appendChild(menuItem);
      
      // 如果有子菜单且已展开，递归渲染
      if (item.children && item.children.length > 0 && this.expandedItems.has(item.id)) {
        const submenuContainer = document.createElement('div');
        submenuContainer.className = 'submenu-container';
        submenuContainer.style.marginLeft = `${(depth + 1) * 20}px`;
        
        this.renderMenuTree(item.children, submenuContainer, depth + 1);
        container.appendChild(submenuContainer);
      }
    });
  }

  // 更新展开/折叠按钮状态
  updateExpandButtons() {
    document.querySelectorAll('.expand-btn').forEach(btn => {
      const menuItem = btn.closest('.menu-item');
      const itemId = menuItem.dataset.id;
      const icon = btn.querySelector('i');
      
      if (this.expandedItems.has(itemId)) {
        icon.className = 'bi bi-chevron-up';
      } else {
        icon.className = 'bi bi-chevron-down';
      }
    });
  }

  // 创建菜单项元素
  createMenuItemElement(item, isChild = false) {
    const div = document.createElement('div');
    div.className = `menu-item ${item.locked ? 'locked-item' : ''}`;
    div.dataset.id = item.id;
    div.draggable = !item.locked;
    
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = this.expandedItems.has(item.id);
    
    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          ${hasChildren ? `
            <button class="btn btn-sm btn-outline-secondary me-2 expand-btn" type="button">
              <i class="bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}"></i>
            </button>
          ` : '<span class="me-4"></span>'}
          <div>
            <strong>${typeof item.name === 'object' ? (item.name.zh || item.name.en || '未命名') : (item.name || '未命名')}</strong>
            ${typeof item.name === 'object' && item.name.en && item.name.en !== item.name.zh ? `<br><small class="text-secondary">${item.name.en}</small>` : ''}
            ${item.link ? `<br><small class="text-muted">${item.link}</small>` : ''}
            ${item.i18n ? `<br><small class="text-info">${item.i18n}</small>` : ''}
            ${item.locked ? '<br><small class="text-warning"><i class="bi bi-lock-fill"></i> 已锁定</small>' : ''}
          </div>
        </div>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-primary edit-btn" ${item.locked ? 'disabled' : ''}>
            <i class="bi bi-pencil"></i>
          </button>
          ${this.getDepth(item.id) < this.maxDepth ? `
            <button class="btn btn-sm btn-success add-child-btn" ${item.locked ? 'disabled' : ''} 
                    title="添加子菜单">
              <i class="bi bi-plus"></i>
            </button>
          ` : `
            <button class="btn btn-sm btn-warning add-child-btn" ${item.locked ? 'disabled' : ''} 
                    title="超过${this.maxDepth}级菜单，建议谨慎使用">
              <i class="bi bi-plus"></i>
            </button>
          `}
          <button class="btn btn-sm btn-outline-secondary toggle-lock-btn">
            <i class="bi ${item.locked ? 'bi-unlock' : 'bi-lock'}"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" ${item.locked ? 'disabled' : ''}>
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;
    
    // 添加事件监听器
    this.attachMenuItemEvents(div, item);
    
    return div;
  }

  // 获取菜单项深度
  getDepth(itemId) {
    const findDepth = (items, targetId, currentDepth = 0) => {
      for (const item of items) {
        if (item.id === targetId) {
          return currentDepth;
        }
        if (item.children) {
          const childDepth = findDepth(item.children, targetId, currentDepth + 1);
          if (childDepth !== -1) {
            return childDepth;
          }
        }
      }
      return -1;
    };
    
    return findDepth(this.menuData.menuItems, itemId);
  }

  // 附加菜单项事件
  attachMenuItemEvents(element, item) {
    // 展开/折叠按钮
    const expandBtn = element.querySelector('.expand-btn');
    if (expandBtn) {
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleExpand(item.id);
      });
    }
    
    // 编辑按钮
    const editBtn = element.querySelector('.edit-btn');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!item.locked) {
        this.editMenuItem(item.id);
      }
    });
    
    // 添加子菜单按钮
    const addChildBtn = element.querySelector('.add-child-btn');
    addChildBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!item.locked) {
        this.addChildMenuItem(item.id);
      }
    });
    
    // 锁定/解锁按钮
    const toggleLockBtn = element.querySelector('.toggle-lock-btn');
    toggleLockBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleLock(item.id);
    });
    
    // 删除按钮
    const deleteBtn = element.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!item.locked) {
        this.deleteMenuItem(item.id);
      }
    });
    
    // 拖拽事件
    if (!item.locked) {
      element.addEventListener('dragstart', this.handleDragStart.bind(this));
      element.addEventListener('dragover', this.handleDragOver.bind(this));
      element.addEventListener('drop', this.handleDrop.bind(this));
      element.addEventListener('dragend', this.handleDragEnd.bind(this));
    }
    
    // 点击选择
    element.addEventListener('click', () => {
      this.selectMenuItem(item.id);
    });
  }

  // 切换展开状态
  toggleExpand(itemId) {
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }
    this.renderMenuItems();
  }

  // 选择菜单项
  selectMenuItem(itemId) {
    // 移除之前的选中状态
    document.querySelectorAll('.menu-item.active').forEach(item => {
      item.classList.remove('active');
    });
    
    // 添加新的选中状态
    const menuItem = document.querySelector(`[data-id="${itemId}"]`);
    if (menuItem) {
      menuItem.classList.add('active');
      this.selectedMenuItem = this.findMenuItem(itemId);
      this.populateForm(this.selectedMenuItem);
    }
  }

  // 查找菜单项
  findMenuItem(itemId) {
    const searchInItems = (items) => {
      for (const item of items) {
        if (item.id === itemId) {
          return item;
        }
        if (item.children) {
          const found = searchInItems(item.children);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };
    
    return searchInItems(this.menuData.menuItems);
  }

  // 填充表单
  populateForm(item) {
    if (!item) return;
    
    // 填充多语言名称
    if (typeof item.name === 'object') {
      this.elements.menuItemNameZh.value = item.name.zh || '';
      this.elements.menuItemNameEn.value = item.name.en || '';
    } else {
      // 兼容旧格式
      this.elements.menuItemNameZh.value = item.name || '';
      this.elements.menuItemNameEn.value = '';
    }
    
    this.elements.menuItemLink.value = item.link || '';
    
    // 更新层级显示和父菜单选择
    this.updateMenuLevelDisplay(item.id);
    
    this.isEditing = true;
  }

  // 判断是否为顶级菜单项
  isTopLevelItem(itemId) {
    return this.menuData.menuItems.some(item => item.id === itemId);
  }

  // 获取父菜单ID
  getParentId(itemId) {
    const findParent = (items, targetId) => {
      for (const item of items) {
        if (item.children) {
          if (item.children.some(child => child.id === targetId)) {
            return item.id;
          }
          const parentId = findParent(item.children, targetId);
          if (parentId) {
            return parentId;
          }
        }
      }
      return null;
    };
    
    return findParent(this.menuData.menuItems, itemId);
  }

  // 更新层级显示
  updateMenuLevelDisplay(itemId) {
    const depth = this.getDepth(itemId);
    const levelText = depth === 0 ? '一级菜单' : `${depth + 1}级菜单`;
    const badgeClass = depth === 0 ? 'bg-primary' : depth === 1 ? 'bg-success' : 'bg-warning';
    
    this.elements.menuLevelBadge.textContent = levelText;
    this.elements.menuLevelBadge.className = `badge ${badgeClass}`;
    
    // 设置父菜单选择
    const parentId = this.getParentId(itemId);
    this.elements.parentMenuItem.value = parentId || '';
    
    // 如果是顶级菜单，禁用顶级选项
    const topOption = this.elements.parentMenuItem.querySelector('option[value=""]');
    if (topOption) {
      topOption.disabled = depth === 0;
      topOption.textContent = depth === 0 ? '顶级菜单（当前）' : '顶级菜单';
    }
  }
  
  // 获取菜单项深度
  getDepth(itemId) {
    const findDepth = (items, targetId, currentDepth = 0) => {
      for (const item of items) {
        if (item.id === targetId) {
          return currentDepth;
        }
        if (item.children) {
          const depth = findDepth(item.children, targetId, currentDepth + 1);
          if (depth !== -1) {
            return depth;
          }
        }
      }
      return -1;
    };
    
    return findDepth(this.menuData.menuItems, itemId);
  }

  // 更新父菜单选择框
  updateParentMenuSelect() {
    this.elements.parentMenuItem.innerHTML = '<option value="">顶级菜单</option>';
    this.addMenuOptions(this.menuData.menuItems, 0);
  }

  // 递归添加菜单选项
  addMenuOptions(items, depth) {
    if (depth >= this.maxDepth) return;
    
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = '  '.repeat(depth) + item.name;
      this.elements.parentMenuItem.appendChild(option);
      
      if (item.children && item.children.length > 0) {
        this.addMenuOptions(item.children, depth + 1);
      }
    });
  }
}

// 导出类
window.MenuEditorCore = MenuEditorCore;