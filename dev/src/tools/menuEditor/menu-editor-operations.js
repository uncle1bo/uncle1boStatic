/**
 * 菜单编辑器操作模块
 * 处理菜单项的增删改操作
 */

class MenuEditorOperations {
  constructor(core) {
    this.core = core;
  }

  // 添加新菜单项
  addMenuItem() {
    this.core.selectedMenuItem = null;
    this.core.isEditing = false;
    this.clearForm();
    
    // 重置层级显示为一级菜单
    this.core.elements.menuLevelBadge.textContent = '一级菜单';
    this.core.elements.menuLevelBadge.className = 'badge bg-primary';
    this.core.elements.parentMenuItem.value = '';
    
    // 重置顶级菜单选项状态
    const topOption = this.core.elements.parentMenuItem.querySelector('option[value=""]');
    if (topOption) {
      topOption.disabled = false;
      topOption.textContent = '顶级菜单';
    }
    
    // 聚焦到名称输入框
    this.core.elements.menuItemNameZh.focus();
  }

  // 添加子菜单项
  addChildMenuItem(parentId) {
    const parentItem = this.core.findMenuItem(parentId);
    if (!parentItem) {
      console.error('未找到父菜单项');
      return;
    }
    
    const currentDepth = this.core.getDepth(parentId);
    const newDepth = currentDepth + 1;
    
    // 检查是否超过最大深度
    if (currentDepth >= this.core.maxDepth) {
      const confirmed = confirm(
        `当前菜单已达到${this.core.maxDepth}级深度。\n` +
        `继续添加可能会影响用户体验和SEO效果。\n` +
        `是否确定要继续添加子菜单？`
      );
      
      if (!confirmed) {
        return;
      }
    }
    
    this.core.selectedMenuItem = null;
    this.core.isEditing = false;
    this.clearForm();
    
    // 更新层级显示
    const levelText = `${newDepth + 1}级菜单`;
    const badgeClass = newDepth === 1 ? 'bg-success' : 'bg-warning';
    this.core.elements.menuLevelBadge.textContent = levelText;
    this.core.elements.menuLevelBadge.className = `badge ${badgeClass}`;
    
    // 设置父菜单
    this.core.elements.parentMenuItem.value = parentId;
    
    // 重置顶级菜单选项状态
    const topOption = this.core.elements.parentMenuItem.querySelector('option[value=""]');
    if (topOption) {
      topOption.disabled = false;
      topOption.textContent = '顶级菜单';
    }
    
    // 聚焦到名称输入框
    this.core.elements.menuItemNameZh.focus();
  }

  // 编辑菜单项
  editMenuItem(itemId) {
    const item = this.core.findMenuItem(itemId);
    if (!item) {
      console.error('未找到要编辑的菜单项');
      return;
    }
    
    this.core.selectMenuItem(itemId);
  }

  // 删除菜单项
  deleteMenuItem(itemId) {
    const item = this.core.findMenuItem(itemId);
    if (!item) {
      console.error('未找到要删除的菜单项');
      return;
    }
    
    // 显示确认对话框
    const modal = this.core.getDeleteConfirmModal();
      if (modal) {
        modal.show();
      } else {
        console.error('Bootstrap Modal未初始化，无法显示删除确认对话框');
      }
    
    // 设置确认删除按钮的事件
    this.core.elements.confirmDeleteBtn.onclick = () => {
      this.confirmDeleteMenuItem(itemId);
      const modal = this.core.getDeleteConfirmModal();
      if (modal) {
        modal.hide();
      }
    };
  }

  // 确认删除菜单项
  confirmDeleteMenuItem(itemId) {
    const removeFromItems = (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === itemId) {
          items.splice(i, 1);
          return true;
        }
        if (items[i].children) {
          if (removeFromItems(items[i].children)) {
            // 如果子菜单为空，移除children属性
            if (items[i].children.length === 0) {
              delete items[i].children;
            }
            return true;
          }
        }
      }
      return false;
    };
    
    if (removeFromItems(this.core.menuData.menuItems)) {
      // 如果删除的是当前选中的项目，清空表单
      if (this.core.selectedMenuItem && this.core.selectedMenuItem.id === itemId) {
        this.clearForm();
        this.core.selectedMenuItem = null;
        this.core.isEditing = false;
      }
      
      // 重新渲染菜单
      this.core.renderMenuItems();
      
      // 显示成功消息
      this.showMessage('菜单项已删除', 'success');
    } else {
      this.showMessage('删除菜单项失败', 'error');
    }
  }

  // 切换锁定状态
  toggleLock(itemId) {
    const item = this.core.findMenuItem(itemId);
    if (!item) {
      console.error('未找到要锁定/解锁的菜单项');
      return;
    }
    
    item.locked = !item.locked;
    
    // 重新渲染菜单
    this.core.renderMenuItems();
    
    // 如果当前选中的是这个项目，更新表单
    if (this.core.selectedMenuItem && this.core.selectedMenuItem.id === itemId) {
      this.core.populateForm(item);
    }
    
    const status = item.locked ? '锁定' : '解锁';
    this.showMessage(`菜单项已${status}`, 'success');
  }

  // 保存菜单项
  saveMenuItem() {
    // 如果是编辑模式且菜单项被锁定，则不允许保存
    if (this.core.isEditing && this.core.selectedMenuItem && this.core.selectedMenuItem.locked) {
      this.showMessage('锁定的菜单项无法编辑', 'error');
      return;
    }
    
    const nameZh = this.core.elements.menuItemNameZh.value.trim();
    const nameEn = this.core.elements.menuItemNameEn.value.trim();
    const link = this.core.elements.menuItemLink.value.trim();
    const parentId = this.core.elements.parentMenuItem.value;
    const isTopLevel = !parentId; // 根据父菜单选择判断是否为顶级
    
    // 验证输入
    if (!nameZh) {
      this.showMessage('请输入中文菜单名称', 'error');
      this.core.elements.menuItemNameZh.focus();
      return;
    }
    
    // 构建名称对象，如果英文为空则使用中文
    const name = {
      zh: nameZh,
      en: nameEn || nameZh
    };
    
    if (this.core.isEditing && this.core.selectedMenuItem) {
      // 编辑现有菜单项
      this.updateMenuItem(this.core.selectedMenuItem.id, { name, link, isTopLevel, parentId });
    } else {
      // 添加新菜单项
      this.createMenuItem({ name, link, isTopLevel, parentId });
    }
  }

  // 更新菜单项
  updateMenuItem(itemId, data) {
    const item = this.core.findMenuItem(itemId);
    if (!item) {
      this.showMessage('未找到要更新的菜单项', 'error');
      return;
    }
    
    // 更新基本信息
    item.name = data.name;
    item.link = data.link;
    
    // 处理层级变更
    const wasTopLevel = this.core.isTopLevelItem(itemId);
    const willBeTopLevel = data.isTopLevel;
    
    if (wasTopLevel !== willBeTopLevel) {
      // 层级发生变化，需要移动菜单项
      this.moveMenuItem(itemId, data.isTopLevel, data.parentId);
    }
    
    // 重新渲染
    this.core.renderMenuItems();
    
    // 清空表单
    this.clearForm();
    this.core.selectedMenuItem = null;
    this.core.isEditing = false;
    
    this.showMessage('菜单项已更新', 'success');
  }

  // 创建新菜单项
  createMenuItem(data) {
    const newItem = {
      id: this.generateId(),
      name: data.name,
      link: data.link,
      locked: false
    };
    
    if (data.isTopLevel) {
      // 添加到顶级菜单
      this.core.menuData.menuItems.push(newItem);
    } else {
      // 添加到指定父菜单
      const parentItem = this.core.findMenuItem(data.parentId);
      if (!parentItem) {
        this.showMessage('未找到父菜单', 'error');
        return;
      }
      
      if (!parentItem.children) {
        parentItem.children = [];
      }
      parentItem.children.push(newItem);
    }
    
    // 重新渲染
    this.core.renderMenuItems();
    
    // 清空表单
    this.clearForm();
    
    this.showMessage('菜单项已添加', 'success');
  }

  // 移动菜单项
  moveMenuItem(itemId, toTopLevel, newParentId) {
    // 从原位置移除
    const item = this.removeItemFromStructure(itemId);
    if (!item) {
      this.showMessage('移动菜单项失败', 'error');
      return;
    }
    
    if (toTopLevel) {
      // 移动到顶级
      this.core.menuData.menuItems.push(item);
    } else {
      // 移动到指定父菜单
      const parentItem = this.core.findMenuItem(newParentId);
      if (!parentItem) {
        this.showMessage('未找到目标父菜单', 'error');
        // 恢复到原位置（这里简化处理，实际应该记录原位置）
        this.core.menuData.menuItems.push(item);
        return;
      }
      
      if (!parentItem.children) {
        parentItem.children = [];
      }
      parentItem.children.push(item);
    }
  }

  // 从结构中移除菜单项
  removeItemFromStructure(itemId) {
    const removeFromItems = (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === itemId) {
          return items.splice(i, 1)[0];
        }
        if (items[i].children) {
          const removed = removeFromItems(items[i].children);
          if (removed) {
            // 如果子菜单为空，移除children属性
            if (items[i].children.length === 0) {
              delete items[i].children;
            }
            return removed;
          }
        }
      }
      return null;
    };
    
    return removeFromItems(this.core.menuData.menuItems);
  }

  // 取消编辑
  cancelEdit() {
    this.clearForm();
    this.core.selectedMenuItem = null;
    this.core.isEditing = false;
    
    // 移除选中状态
    document.querySelectorAll('.menu-item.active').forEach(item => {
      item.classList.remove('active');
    });
  }

  // 清空表单
  clearForm() {
    this.core.elements.menuItemNameZh.value = '';
    this.core.elements.menuItemNameEn.value = '';
    this.core.elements.menuItemLink.value = '';
    this.core.elements.parentMenuItem.value = '';
    
    // 重置层级显示
    this.core.elements.menuLevelBadge.textContent = '一级菜单';
    this.core.elements.menuLevelBadge.className = 'badge bg-primary';
    
    // 重置顶级菜单选项状态
    const topOption = this.core.elements.parentMenuItem.querySelector('option[value=""]');
    if (topOption) {
      topOption.disabled = false;
      topOption.textContent = '顶级菜单';
    }
  }

  // 保存所有更改
  async saveAllChanges() {
    try {
      this.core.elements.saveAllBtn.disabled = true;
      this.core.elements.saveAllBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> 保存中...';
      
      const response = await fetch('/menu-editor/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          menuItems: this.core.menuData.menuItems
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showMessage('导航菜单结构已成功保存！', 'success');
        
        // 重置保存按钮状态
        this.core.elements.saveAllBtn.classList.remove('btn-warning');
        this.core.elements.saveAllBtn.classList.add('btn-success');
        this.core.elements.saveAllBtn.innerHTML = '<i class="bi bi-check"></i> 保存所有更改';
        
        // 重新初始化主题切换功能（因为DOM元素被重新创建）
        if (window.parent && window.parent.reinitThemeToggle) {
          window.parent.reinitThemeToggle();
        } else if (window.reinitThemeToggle) {
          window.reinitThemeToggle();
        }
      } else {
        this.showMessage(result.error || '保存失败', 'error');
      }
    } catch (error) {
      console.error('保存失败:', error);
      this.showMessage('保存导航菜单结构时发生错误', 'error');
    } finally {
      this.core.elements.saveAllBtn.disabled = false;
      if (this.core.elements.saveAllBtn.innerHTML.includes('保存中')) {
        this.core.elements.saveAllBtn.innerHTML = '<i class="bi bi-save"></i> 保存所有更改';
      }
    }
  }

  // 显示消息
  showMessage(message, type = 'info') {
    const isSuccess = type === 'success';
    const alertElement = isSuccess ? this.core.elements.successAlert : this.core.elements.errorAlert;
    const messageElement = isSuccess ? this.core.elements.successMessage : this.core.elements.errorMessage;
    
    // 隐藏其他警告
    this.core.elements.successAlert.classList.add('d-none');
    this.core.elements.errorAlert.classList.add('d-none');
    
    // 显示消息
    messageElement.textContent = message;
    alertElement.classList.remove('d-none');
    
    // 3秒后自动隐藏
    setTimeout(() => {
      alertElement.classList.add('d-none');
    }, 3000);
  }

  // 生成唯一ID
  generateId() {
    return 'menu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// 导出类
window.MenuEditorOperations = MenuEditorOperations;