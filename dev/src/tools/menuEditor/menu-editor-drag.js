/**
 * 菜单编辑器拖拽功能模块
 * 处理菜单项的拖拽排序功能
 */

class MenuEditorDrag {
  constructor(core) {
    this.core = core;
    this.draggedItem = null;
  }

  // 拖拽开始
  handleDragStart(e) {
    this.draggedItem = e.target;
    e.target.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  }

  // 拖拽悬停
  handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  // 拖拽放下
  handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    
    if (this.draggedItem !== e.target) {
      const draggedId = this.draggedItem.dataset.id;
      const targetElement = e.target.closest('.menu-item');
      
      if (targetElement) {
        const targetId = targetElement.dataset.id;
        
        if (draggedId !== targetId) {
          this.reorderMenuItems(draggedId, targetId);
        }
      }
    }
    
    return false;
  }

  // 拖拽结束
  handleDragEnd(e) {
    e.target.style.opacity = '';
    this.draggedItem = null;
  }

  // 重新排序菜单项
  reorderMenuItems(draggedId, targetId) {
    const draggedItem = this.core.findMenuItem(draggedId);
    const targetItem = this.core.findMenuItem(targetId);
    
    if (!draggedItem || !targetItem) {
      console.error('无法找到拖拽的菜单项');
      return;
    }
    
    // 检查是否试图将父菜单拖到其子菜单中
    if (this.isDescendant(draggedItem, targetItem)) {
      alert('不能将父菜单拖拽到其子菜单中');
      return;
    }
    
    // 从原位置移除
    this.removeItemFromParent(draggedId);
    
    // 插入到新位置
    this.insertItemAfterTarget(draggedItem, targetId);
    
    // 重新渲染
    this.core.renderMenuItems();
    
    // 显示保存提示
    this.showUnsavedChanges();
  }

  // 检查是否为后代菜单
  isDescendant(parentItem, childItem) {
    const checkChildren = (item) => {
      if (!item.children) return false;
      
      for (const child of item.children) {
        if (child.id === childItem.id) {
          return true;
        }
        if (this.isDescendant(child, childItem)) {
          return true;
        }
      }
      return false;
    };
    
    return checkChildren(parentItem);
  }

  // 从父菜单中移除项目
  removeItemFromParent(itemId) {
    const removeFromItems = (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === itemId) {
          return items.splice(i, 1)[0];
        }
        if (items[i].children) {
          const removed = removeFromItems(items[i].children);
          if (removed) {
            return removed;
          }
        }
      }
      return null;
    };
    
    return removeFromItems(this.core.menuData.menuItems);
  }

  // 在目标项目后插入
  insertItemAfterTarget(item, targetId) {
    const insertInItems = (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === targetId) {
          items.splice(i + 1, 0, item);
          return true;
        }
        if (items[i].children) {
          if (insertInItems(items[i].children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    if (!insertInItems(this.core.menuData.menuItems)) {
      // 如果没有找到目标位置，添加到末尾
      this.core.menuData.menuItems.push(item);
    }
  }

  // 显示未保存更改提示
  showUnsavedChanges() {
    const saveAllBtn = this.core.elements.saveAllBtn;
    if (saveAllBtn) {
      saveAllBtn.classList.add('btn-warning');
      saveAllBtn.classList.remove('btn-success');
      saveAllBtn.innerHTML = '<i class="bi bi-exclamation-triangle"></i> 有未保存的更改';
    }
  }
}

// 导出类
window.MenuEditorDrag = MenuEditorDrag;