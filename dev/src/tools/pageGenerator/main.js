/**
 * MD to HTML Tool
 * 主JavaScript文件
 */

document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const convertForm = document.getElementById('convertForm');
  const uploadForm = document.getElementById('uploadForm');
  const resultArea = document.getElementById('resultArea');
  const resultMessage = document.getElementById('resultMessage');
  const viewPageBtn = document.getElementById('viewPageBtn');
  
  // 处理直接输入表单提交
  convertForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 显示加载状态
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 处理中...';
    
    try {
      // 获取表单数据
      const formData = {
        markdownContent: document.getElementById('markdownContent').value,
        pageName: document.getElementById('pageName').value,
        pageTitle: document.getElementById('pageTitle').value,
        pageDescription: document.getElementById('pageDescription').value
      };
      
      // 发送请求
      const response = await fetch('/page-generator/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 显示成功消息
        showResult(true, `页面 "${formData.pageName}.html" 已成功生成并复制到prod目录。`, formData.pageName);
      } else {
        // 显示错误消息
        showResult(false, `错误: ${data.error}`);
      }
    } catch (error) {
      console.error('提交失败:', error);
      showResult(false, `提交失败: ${error.message}`);
    } finally {
      // 恢复按钮状态
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
  
  // 处理文件上传表单提交
  uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 显示加载状态
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 上传中...';
    
    try {
      // 获取表单数据
      const formData = new FormData(this);
      
      // 检查文件是否已选择
      const fileInput = document.getElementById('markdownFile');
      if (!fileInput.files || fileInput.files.length === 0) {
        throw new Error('请选择Markdown文件');
      }
      
      // 发送请求
      const response = await fetch('/page-generator/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 显示成功消息
        showResult(true, `页面 "${formData.get('pageName')}.html" 已成功生成并复制到prod目录。`, formData.get('pageName'));
      } else {
        // 显示错误消息
        showResult(false, `错误: ${data.error}`);
      }
    } catch (error) {
      console.error('上传失败:', error);
      showResult(false, `上传失败: ${error.message}`);
    } finally {
      // 恢复按钮状态
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
  
  /**
   * 显示结果消息
   * @param {boolean} success - 是否成功
   * @param {string} message - 消息内容
   * @param {string} pageName - 页面名称（可选）
   */
  function showResult(success, message, pageName = null) {
    resultArea.classList.remove('d-none');
    resultArea.scrollIntoView({ behavior: 'smooth' });
    
    const alertElement = resultArea.querySelector('.alert');
    alertElement.className = success ? 'alert alert-success' : 'alert alert-danger';
    
    const iconElement = alertElement.querySelector('i');
    iconElement.className = success ? 'bi bi-check-circle-fill me-2' : 'bi bi-exclamation-triangle-fill me-2';
    
    const titleElement = alertElement.querySelector('h5');
    titleElement.textContent = success ? '转换成功！' : '转换失败！';
    
    resultMessage.textContent = message;
    
    // 设置查看按钮
    if (success && pageName) {
      viewPageBtn.classList.remove('d-none');
      viewPageBtn.onclick = function() {
        window.open(`/prod/pages/${pageName}.html`, '_blank');
      };
    } else {
      viewPageBtn.classList.add('d-none');
    }
  }
});