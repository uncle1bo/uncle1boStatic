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
        author: ''
    };
    
    // 提取标题
    metadata.title = extractTitle(markdown);
    
    // 提取描述（第一个非标题段落）
    const lines = markdown.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        
        // 找到第一个非标题非空行作为描述
        metadata.description = line
            .replace(/\*\*([^*]+)\*\*/g, '$1') // 移除粗体
            .replace(/\*([^*]+)\*/g, '$1')       // 移除斜体
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // 移除链接，保留链接文本
        
        break;
    }
    
    return metadata;
}

// 如果在浏览器环境中，将函数暴露给全局作用域
if (typeof window !== 'undefined') {
    window.parseMarkdown = parseMarkdown;
    window.extractTitle = extractTitle;
    window.extractMetadata = extractMetadata;
}

// 如果在Node.js环境中，导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseMarkdown,
        extractTitle,
        extractMetadata
    };
}