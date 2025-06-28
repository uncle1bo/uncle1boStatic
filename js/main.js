/**
 * Uncle1bo Static Website
 * 主JavaScript文件
 */

// 当DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('Uncle1bo Static Website loaded successfully!');
    
    // 初始化工具提示
    initTooltips();
    
    // 添加平滑滚动
    initSmoothScroll();
    
    // 添加动画效果
    initAnimations();
});

/**
 * 初始化Bootstrap工具提示
 */
function initTooltips() {
    // 初始化所有工具提示
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * 初始化平滑滚动效果
 */
function initSmoothScroll() {
    // 获取所有内部链接
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    // 为每个链接添加点击事件
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 阻止默认行为
            e.preventDefault();
            
            // 获取目标元素
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // 平滑滚动到目标元素
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * 初始化页面动画效果
 */
function initAnimations() {
    // 当元素进入视口时添加动画类
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 50) {
                element.classList.add('animated');
            }
        });
    };
    
    // 初始检查
    animateOnScroll();
    
    // 滚动时检查
    window.addEventListener('scroll', animateOnScroll);
}

/**
 * 示例：添加动态内容加载函数
 * 在实际项目中可以用来从API加载内容
 */
function loadDynamicContent(containerId, contentUrl) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 在实际项目中，这里可以使用fetch API从服务器加载内容
    // 这里仅作为示例
    console.log(`将从 ${contentUrl} 加载内容到 ${containerId}`);
    
    // 模拟加载中状态
    container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    // 这里可以替换为实际的fetch调用
    // fetch(contentUrl)
    //     .then(response => response.json())
    //     .then(data => {
    //         // 处理数据并更新DOM
    //     })
    //     .catch(error => console.error('Error loading content:', error));
}