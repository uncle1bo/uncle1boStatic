/**
 * Uncle1bo Static Website
 * Markdown解析器
 * 
 * 这个文件提供将Markdown内容转换为HTML的功能，用于快速创建新页面。
 */

/**
 * 将Markdown文本转换为HTML
 * @param {string} markdown - Markdown格式的文本
 * @returns {string} 转换后的HTML
 */
function parseMarkdown(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // 处理标题 (h1 - h6)
    html = html.replace(/^\s*#\s+(.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/^\s*##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^\s*###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^\s*####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^\s*#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^\s*######\s+(.+)$/gm, '<h6>$1</h6>');
    
    // 处理粗体
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // 处理斜体
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // 处理链接 [文本](链接)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // 处理图片 ![替代文本](图片链接)
    html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="img-fluid">');
    
    // 处理无序列表
    html = html.replace(/^\s*[*-]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.+<\/li>\n)+/g, '<ul>$&</ul>');
    
    // 处理有序列表
    html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.+<\/li>\n)+/g, '<ol>$&</ol>');
    
    // 处理引用
    html = html.replace(/^\s*>\s+(.+)$/gm, '<blockquote class="blockquote">$1</blockquote>');
    
    // 处理代码块
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // 处理行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 处理水平线
    html = html.replace(/^\s*---\s*$/gm, '<hr>');
    
    // 处理段落
    html = html.replace(/^(?!<[a-z]).+$/gm, '<p>$&</p>');
    
    // 修复可能的嵌套问题
    html = html.replace(/<p><(h\d|ul|ol|blockquote|pre)>/g, '<$1>');
    html = html.replace(/<\/(h\d|ul|ol|blockquote|pre)><\/p>/g, '</$1>');
    
    return html;
}

/**
 * 提取Markdown文本中的标题作为页面标题
 * @param {string} markdown - Markdown格式的文本
 * @returns {string} 提取的标题
 */
function extractTitle(markdown) {
    if (!markdown) return 'New Page';
    
    // 尝试提取第一个h1标题
    const titleMatch = markdown.match(/^\s*#\s+(.+)$/m);
    if (titleMatch && titleMatch[1]) {
        return titleMatch[1].trim();
    }
    
    // 如果没有h1标题，尝试提取第一行作为标题
    const firstLineMatch = markdown.match(/^(.+)$/m);
    if (firstLineMatch && firstLineMatch[1]) {
        return firstLineMatch[1].trim();
    }
    
    return 'New Page';
}

/**
 * 提取Markdown文本中的元数据
 * @param {string} markdown - Markdown格式的文本
 * @returns {Object} 元数据对象
 */
function extractMetadata(markdown) {
    const metadata = {
        title: 'New Page',
        description: '',
        keywords: '',
        navTitle: ''
    };
    
    if (!markdown) return metadata;
    
    // 检查是否有YAML前置元数据块
    const metaMatch = markdown.match(/^---[\s\S]*?---/);
    if (metaMatch) {
        const metaBlock = metaMatch[0];
        
        // 提取标题
        const titleMatch = metaBlock.match(/title:\s*(.+)$/m);
        if (titleMatch && titleMatch[1]) {
            metadata.title = titleMatch[1].trim();
        }
        
        // 提取描述
        const descMatch = metaBlock.match(/description:\s*(.+)$/m);
        if (descMatch && descMatch[1]) {
            metadata.description = descMatch[1].trim();
        }
        
        // 提取关键词
        const keywordsMatch = metaBlock.match(/keywords:\s*(.+)$/m);
        if (keywordsMatch && keywordsMatch[1]) {
            metadata.keywords = keywordsMatch[1].trim();
        }
        
        // 提取导航标题
        const navTitleMatch = metaBlock.match(/navTitle:\s*(.+)$/m);
        if (navTitleMatch && navTitleMatch[1]) {
            metadata.navTitle = navTitleMatch[1].trim();
        }
        
        // 从Markdown中移除元数据块
        markdown = markdown.replace(metaBlock, '');
    } else {
        // 如果没有元数据块，尝试从内容中提取标题
        metadata.title = extractTitle(markdown);
        metadata.navTitle = metadata.title;
    }
    
    return {
        metadata,
        content: markdown.trim()
    };
}

// 导出函数供其他模块使用
window.markdownParser = {
    parseMarkdown,
    extractTitle,
    extractMetadata
};