/**
 * 页面生成器前端脚本
 * 处理Markdown文件导入和多语言配置
 */

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  initFileImport();
  initI18nFields();
  initFormSubmission();
});

/**
 * 初始化文件导入功能
 */
function initFileImport() {
  const markdownFileInput = document.getElementById('markdownFile');
  const markdownContent = document.getElementById('markdownContent');
  const importToEditorBtn = document.getElementById('importToEditor');
  
  if (markdownFileInput && importToEditorBtn) {
    importToEditorBtn.addEventListener('click', function() {
      if (!markdownFileInput.files || markdownFileInput.files.length === 0) {
        alert('请先选择Markdown文件');
        return;
      }
      
      const file = markdownFileInput.files[0];
      const reader = new FileReader();
      
      reader.onload = function(e) {
        // 切换到直接输入标签页
        const inputTab = document.getElementById('input-tab');
        if (inputTab) {
          const tabInstance = new bootstrap.Tab(inputTab);
          tabInstance.show();
        }
        
        // 将文件内容填充到编辑器中
        if (markdownContent) {
          markdownContent.value = e.target.result;
          
          // 触发内容变化事件，以便更新预览
          markdownContent.dispatchEvent(new Event('input'));
        }
      };
      
      reader.readAsText(file);
    });
  }
}

/**
 * 初始化多语言字段
 */
function initI18nFields() {
  // 上传文件标签页
  initI18nFieldsForTab('i18nConfig', 'addI18nField', 'i18nFields');
  
  // 直接输入标签页
  initI18nFieldsForTab('i18nConfigInput', 'addI18nFieldInput', 'i18nFieldsInput');
}

/**
 * 为指定标签页初始化多语言字段
 * @param {string} configId - 配置容器ID
 * @param {string} addBtnId - 添加按钮ID
 * @param {string} fieldsContainerId - 字段容器ID
 */
function initI18nFieldsForTab(configId, addBtnId, fieldsContainerId) {
  const configContainer = document.getElementById(configId);
  const addBtn = document.getElementById(addBtnId);
  const fieldsContainer = document.getElementById(fieldsContainerId);
  
  if (addBtn && fieldsContainer) {
    // 添加新的多语言字段
    addBtn.addEventListener('click', function() {
      addI18nField(fieldsContainer);
    });
    
    // 初始添加一个多语言字段
    addI18nField(fieldsContainer);
  }
}

/**
 * 添加多语言字段
 * @param {HTMLElement} container - 字段容器
 */
function addI18nField(container) {
  const fieldId = Date.now(); // 使用时间戳作为唯一ID
  const fieldHtml = `
    <div class="i18n-field-group mb-3" data-field-id="${fieldId}">
      <div class="row">
        <div class="col-md-3">
          <input type="text" class="form-control i18n-key" placeholder="翻译键名" required>
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control i18n-zh" placeholder="中文内容" required>
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control i18n-en" placeholder="英文内容">
        </div>
        <div class="col-md-1">
          <button type="button" class="btn btn-outline-danger remove-i18n-field" data-field-id="${fieldId}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', fieldHtml);
  
  // 添加删除按钮事件监听
  const removeBtn = container.querySelector(`.remove-i18n-field[data-field-id="${fieldId}"]`);
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      const fieldGroup = container.querySelector(`.i18n-field-group[data-field-id="${fieldId}"]`);
      if (fieldGroup) {
        fieldGroup.remove();
      }
    });
  }
}

/**
 * 初始化表单提交
 */
function initFormSubmission() {
  const convertForm = document.getElementById('convertForm');
  const uploadForm = document.getElementById('uploadForm');
  
  if (convertForm) {
    convertForm.onsubmit = function(e) {
      e.preventDefault();
      
      // 收集多语言配置
      const i18nConfig = collectI18nConfig();
      
      // 获取表单数据
      const formData = {
        markdownContent: document.getElementById('markdownContent').value,
        pageName: document.getElementById('pageName').value,
        pageTitle: document.getElementById('pageTitle').value,
        pageDescription: document.getElementById('pageDescription').value,
        i18nConfig: i18nConfig
      };
      
      // 发送请求
      submitFormWithI18n('/page-generator/convert', formData, 'json');
    };
  }
  
  if (uploadForm) {
    uploadForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // 收集多语言配置
      const i18nConfig = collectI18nConfig();
      
      // 获取表单数据
      const formData = new FormData(this);
      
      // 添加多语言配置
      formData.append('i18nConfig', JSON.stringify(i18nConfig));
      
      // 发送请求
      submitFormWithI18n('/page-generator/upload', formData, 'formdata');
    });
  }
}

/**
 * 收集多语言配置
 * @returns {Object} 多语言配置对象
 */
function collectI18nConfig() {
  const i18nConfig = {
    zh: {},
    en: {}
  };
  
  // 收集所有标签页中的多语言字段
  const i18nFields = document.querySelectorAll('.i18n-field-group');
  i18nFields.forEach(field => {
    const keyInput = field.querySelector('.i18n-key');
    const zhInput = field.querySelector('.i18n-zh');
    const enInput = field.querySelector('.i18n-en');
    
    if (keyInput && keyInput.value && zhInput && zhInput.value) {
      // 支持嵌套键名，例如 'common.button.submit'
      const keyParts = keyInput.value.split('.');
      let zhObj = i18nConfig.zh;
      let enObj = i18nConfig.en;
      
      // 处理嵌套键，创建必要的对象结构
      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (!zhObj[part]) zhObj[part] = {};
        if (!enObj[part]) enObj[part] = {};
        zhObj = zhObj[part];
        enObj = enObj[part];
      }
      
      // 设置最终值
      const lastKey = keyParts[keyParts.length - 1];
      zhObj[lastKey] = zhInput.value;
      
      if (enInput && enInput.value) {
        enObj[lastKey] = enInput.value;
      } else {
        // 如果没有英文翻译，使用中文作为默认值
        enObj[lastKey] = zhInput.value;
      }
    }
  });
  
  return i18nConfig;
}

/**
 * 提交表单并处理响应
 * @param {string} url - 提交URL
 * @param {Object|FormData} data - 提交数据
 * @param {string} type - 数据类型 ('json'|'formdata')
 */
async function submitFormWithI18n(url, data, type) {
  // 获取表单和提交按钮
  const form = type === 'json' ? document.getElementById('convertForm') : document.getElementById('uploadForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  
  // 显示加载状态
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 处理中...';
  
  try {
    let response;
    
    if (type === 'json') {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    } else {
      response = await fetch(url, {
        method: 'POST',
        body: data
      });
    }
    
    const responseData = await response.json();
    
    if (response.ok) {
      // 显示成功消息
      showResult(true, `页面 "${type === 'json' ? data.pageName : data.get('pageName')}.html" 已成功生成并复制到prod目录。`, type === 'json' ? data.pageName : data.get('pageName'));
    } else {
      // 显示错误消息
      showResult(false, `错误: ${responseData.error}`);
    }
  } catch (error) {
    console.error('提交失败:', error);
    showResult(false, `提交失败: ${error.message}`);
  } finally {
    // 恢复按钮状态
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

/**
 * 显示结果
 * @param {boolean} success - 是否成功
 * @param {string} message - 消息内容
 * @param {string} pageName - 页面名称
 */
function showResult(success, message, pageName) {
  const resultArea = document.getElementById('resultArea');
  const resultMessage = document.getElementById('resultMessage');
  const viewPageBtn = document.getElementById('viewPageBtn');
  
  if (resultArea && resultMessage) {
    resultArea.classList.remove('d-none');
    resultMessage.textContent = message;
    
    if (success && viewPageBtn && pageName) {
      viewPageBtn.onclick = function() {
        window.open(`/pages/${pageName}.html`, '_blank');
      };
      viewPageBtn.classList.remove('d-none');
    } else if (viewPageBtn) {
      viewPageBtn.classList.add('d-none');
    }
    
    // 滚动到结果区域
    resultArea.scrollIntoView({ behavior: 'smooth' });
  }
}