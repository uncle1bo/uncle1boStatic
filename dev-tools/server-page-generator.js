/**
 * Uncle1bo Static Website
 * 服务器端页面生成器
 * 
 * 这个文件提供服务器端的页面生成功能，用于保存文件和更新导航栏。
 * 注意：这个文件需要在Node.js环境中运行，不能在浏览器中直接使用。
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// 将回调函数转换为Promise
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

/**
 * 从Markdown内容创建新页面
 * @param {string} markdown - Markdown格式的内容
 * @param {string} pageName - 页面名称（不含扩展名）
 * @param {boolean} addToNav - 是否添加到导航栏
 * @returns {Promise<Object>} 创建结果
 */
async function createPageFromMarkdown(markdown, pageName, addToNav = true) {
    try {
        if (!markdown || !pageName) {
            throw new Error('Markdown内容和页面名称不能为空');
        }
        
        // 处理页面名称，确保符合URL规范
        pageName = pageName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        // 提取元数据和内容
        const { metadata, content } = extractMetadata(markdown);
        
        // 解析Markdown为HTML
        const htmlContent = parseMarkdown(content);
        
        // 创建页面HTML
        const pageHtml = generatePageHtml(pageName, metadata, htmlContent);
        
        // 保存页面文件
        await savePageFile(pageName, pageHtml);
        
        // 如果需要，添加到导航栏
        if (addToNav) {
            await addToNavigation(pageName, metadata.navTitle || metadata.title);
        }
        
        // 创建对应的语言文件
        await createLanguageFiles(pageName, metadata);
        
        return {
            success: true,
            pageName,
            pageUrl: `pages/${pageName}.html`,
            message: `页面 ${pageName}.html 创建成功！`
        };
        
    } catch (error) {
        console.error('创建页面失败:', error);
        return {
            success: false,
            message: `创建页面失败: ${error.message}`
        };
    }
}

/**
 * 提取Markdown文本中的元数据
 * @param {string} markdown - Markdown格式的文本
 * @returns {Object} 元数据对象和内容
 */
function extractMetadata(markdown) {
    const metadata = {
        title: 'New Page',
        description: '',
        keywords: '',
        navTitle: ''
    };
    
    if (!markdown) return { metadata, content: '' };
    
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
        const titleMatch = markdown.match(/^\s*#\s+(.+)$/m);
        if (titleMatch && titleMatch[1]) {
            metadata.title = titleMatch[1].trim();
            metadata.navTitle = metadata.title;
        }
    }
    
    return {
        metadata,
        content: markdown.trim()
    };
}

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
 * 生成页面HTML
 * @param {string} pageName - 页面名称
 * @param {Object} metadata - 页面元数据
 * @param {string} htmlContent - HTML内容
 * @returns {string} 完整的页面HTML
 */
function generatePageHtml(pageName, metadata, htmlContent) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" data-i18n="meta.description" content="${metadata.description}">
    <meta name="keywords" content="${metadata.keywords}">
    <title data-i18n="meta.title">${metadata.title} - Uncle1bo Static Website</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../css/styles.css">
    <!-- Template Processor -->
    <script src="../js/template-processor.js"></script>
</head>
<body>
    <!-- 头部模板 -->
    <div id="header-template"></div>

    <!-- Content Section -->
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-12">
                <h1 class="display-4 text-center" data-i18n="${pageName}.title">${metadata.title}</h1>
                <hr class="my-4">
                <div class="content">
                    ${htmlContent}
                </div>
            </div>
        </div>
    </div>

    <!-- 底部模板 -->
    <div id="footer-template"></div>
</body>
</html>`;
}

/**
 * 保存页面文件
 * @param {string} pageName - 页面名称
 * @param {string} pageHtml - 页面HTML内容
 * @returns {Promise<void>}
 */
async function savePageFile(pageName, pageHtml) {
    const pagesDir = path.join(__dirname, '..', 'pages');
    const filePath = path.join(pagesDir, `${pageName}.html`);
    
    // 确保pages目录存在
    try {
        await mkdir(pagesDir, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
    
    // 写入文件
    await writeFile(filePath, pageHtml, 'utf8');
    console.log(`页面文件已保存: ${filePath}`);
}

/**
 * 添加页面到导航栏
 * @param {string} pageName - 页面名称
 * @param {string} navTitle - 导航标题
 * @returns {Promise<void>}
 */
async function addToNavigation(pageName, navTitle) {
    const headerTemplatePath = path.join(__dirname, '..', 'templates', 'header.html');
    
    try {
        // 读取header模板
        let headerContent = await readFile(headerTemplatePath, 'utf8');
        
        // 查找导航菜单的位置
        const navEndMatch = headerContent.match(/<\/li>\s*<!-- 语言选择器 -->/);
        if (!navEndMatch) {
            throw new Error('无法在header模板中找到导航菜单位置');
        }
        
        // 构建新的导航项
        const newNavItem = `
                    <li class="nav-item">
                        <a class="nav-link {{${pageName}Active}}" {{#if ${pageName}Active}}aria-current="page"{{/if}} href="{{rootPath}}pages/${pageName}.html" data-i18n="nav.${pageName}">${navTitle}</a>
                    </li>
                    `;
        
        // 插入新的导航项
        const insertPosition = navEndMatch.index;
        headerContent = headerContent.slice(0, insertPosition) + newNavItem + headerContent.slice(insertPosition);
        
        // 更新header模板文件
        await writeFile(headerTemplatePath, headerContent, 'utf8');
        console.log(`导航项已添加: ${pageName} - ${navTitle}`);
        
        // 更新template-processor.js文件，添加新的活动页面变量
        await updateTemplateProcessor(pageName);
        
    } catch (error) {
        console.error('添加导航项失败:', error);
        throw error;
    }
}

/**
 * 更新template-processor.js文件，添加新的活动页面变量
 * @param {string} pageName - 页面名称
 * @returns {Promise<void>}
 */
async function updateTemplateProcessor(pageName) {
    const templateProcessorPath = path.join(__dirname, 'template-processor.js');
    
    try {
        // 读取template-processor.js文件
        let processorContent = await readFile(templateProcessorPath, 'utf8');
        
        // 查找activePages对象的位置
        const activePagesMatch = processorContent.match(/const activePages = {[\s\S]*?};/);
        if (!activePagesMatch) {
            throw new Error('无法在template-processor.js中找到activePages对象');
        }
        
        // 检查是否已经包含了该页面
        if (activePagesMatch[0].includes(`${pageName}Active`)) {
            console.log(`活动页面变量已存在: ${pageName}Active`);
            return;
        }
        
        // 构建新的activePages对象
        const currentActivePages = activePagesMatch[0];
        const newActivePages = currentActivePages.replace(
            /}\s*$/,
            `,
        ${pageName}Active: pageName === '${pageName}' ? 'active' : ''
    }`
        );
        
        // 更新template-processor.js文件
        processorContent = processorContent.replace(currentActivePages, newActivePages);
        
        // 更新headerTemplate函数中的替换变量
        const headerTemplateMatch = processorContent.match(/template = template\.replace\([\s\S]*?\);/);
        if (headerTemplateMatch) {
            const currentReplace = headerTemplateMatch[0];
            const newReplace = currentReplace.replace(
                /\);\s*$/,
                `)
                          .replace(/{{${pageName}Active}}/g, pageInfo.${pageName}Active);`
            );
            
            processorContent = processorContent.replace(currentReplace, newReplace);
        }
        
        // 写入更新后的文件
        await writeFile(templateProcessorPath, processorContent, 'utf8');
        console.log(`template-processor.js已更新，添加了${pageName}Active变量`);
        
    } catch (error) {
        console.error('更新template-processor.js失败:', error);
        throw error;
    }
}

/**
 * 创建页面对应的语言文件
 * @param {string} pageName - 页面名称
 * @param {Object} metadata - 页面元数据
 * @returns {Promise<void>}
 */
async function createLanguageFiles(pageName, metadata) {
    const localesDir = path.join(__dirname, '..', 'locales');
    const languages = ['zh-CN', 'en'];
    
    // 基本翻译内容
    const baseTranslation = {
        meta: {
            title: metadata.title,
            description: metadata.description || '',
            keywords: metadata.keywords || ''
        },
        nav: {
            [pageName]: metadata.navTitle || metadata.title
        },
        [pageName]: {
            title: metadata.title
            // 可以添加更多翻译项
        }
    };
    
    // 为每种语言创建翻译文件
    for (const lang of languages) {
        const langDir = path.join(localesDir, lang);
        const filePath = path.join(langDir, `${pageName}.json`);
        
        // 确保语言目录存在
        try {
            await mkdir(langDir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
        
        // 写入翻译文件
        await writeFile(filePath, JSON.stringify(baseTranslation, null, 2), 'utf8');
        console.log(`语言文件已创建: ${filePath}`);
        
        // 更新导航翻译
        await updateNavTranslation(lang, pageName, metadata.navTitle || metadata.title);
    }
}

/**
 * 更新导航翻译
 * @param {string} lang - 语言代码
 * @param {string} pageName - 页面名称
 * @param {string} navTitle - 导航标题
 * @returns {Promise<void>}
 */
async function updateNavTranslation(lang, pageName, navTitle) {
    const indexLangPath = path.join(__dirname, '..', 'locales', lang, 'index.json');
    
    try {
        // 读取index语言文件
        const indexLangContent = await readFile(indexLangPath, 'utf8');
        const indexTranslations = JSON.parse(indexLangContent);
        
        // 添加导航翻译
        if (!indexTranslations.nav) {
            indexTranslations.nav = {};
        }
        
        indexTranslations.nav[pageName] = navTitle;
        
        // 写入更新后的文件
        await writeFile(indexLangPath, JSON.stringify(indexTranslations, null, 2), 'utf8');
        console.log(`导航翻译已更新: ${lang} - ${pageName} - ${navTitle}`);
        
    } catch (error) {
        console.error(`更新${lang}导航翻译失败:`, error);
        throw error;
    }
}

// 导出函数
module.exports = {
    createPageFromMarkdown
};

// 如果直接运行此脚本，提供命令行接口
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (command === 'create') {
        const markdownFile = args[1];
        const pageName = args[2];
        const addToNav = args[3] !== 'false';
        
        if (!markdownFile || !pageName) {
            console.error('用法: node server-page-generator.js create <markdown文件路径> <页面名称> [添加到导航栏(true/false)]');
            process.exit(1);
        }
        
        // 读取Markdown文件
        fs.readFile(markdownFile, 'utf8', (err, markdown) => {
            if (err) {
                console.error(`读取Markdown文件失败: ${err.message}`);
                process.exit(1);
            }
            
            // 创建页面
            createPageFromMarkdown(markdown, pageName, addToNav)
                .then(result => {
                    console.log(result.message);
                    process.exit(result.success ? 0 : 1);
                })
                .catch(error => {
                    console.error(`创建页面失败: ${error.message}`);
                    process.exit(1);
                });
        });
    } else {
        console.error('未知命令。可用命令: create');
        process.exit(1);
    }
}