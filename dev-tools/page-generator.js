/**
 * Uncle1bo Static Website
 * 页面生成器
 * 
 * 这个文件提供通过模板和Markdown快速创建新页面的功能。
 */

/**
 * 通过Markdown内容创建新页面
 * @param {string} markdown - Markdown格式的内容
 * @param {string} pageName - 页面名称（不含扩展名）
 * @param {boolean} addToNav - 是否添加到导航栏
 * @param {boolean} enableTranslation - 是否启用自动翻译
 * @returns {Object} 创建结果
 */
async function createPageFromMarkdown(markdown, pageName, addToNav = true, enableTranslation = true) {
    try {
        if (!markdown || !pageName) {
            throw new Error('Markdown内容和页面名称不能为空');
        }
        
        // 处理页面名称，确保符合URL规范
        pageName = pageName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        // 提取元数据和内容
        const { metadata, content } = window.markdownParser.extractMetadata(markdown);
        
        // 解析Markdown为HTML
        const htmlContent = window.markdownParser.parseMarkdown(content);
        
        // 创建页面HTML
        const pageHtml = generatePageHtml(pageName, metadata, htmlContent);
        
        // 保存页面文件
        await savePageFile(pageName, pageHtml);
        
        // 如果需要，添加到导航栏
        if (addToNav) {
            await addToNavigation(pageName, metadata.navTitle || metadata.title);
        }
        
        // 创建对应的语言文件
        await createLanguageFiles(pageName, metadata, enableTranslation);
        
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
 */
async function savePageFile(pageName, pageHtml) {
    // 这里应该实现文件保存逻辑
    // 在实际应用中，这可能需要服务器端支持或使用文件系统API
    // 在浏览器环境中，可以使用Blob和下载链接实现
    
    // 示例：创建下载链接
    const blob = new Blob([pageHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageName}.html`;
    a.click();
    
    URL.revokeObjectURL(url);
}

/**
 * 添加页面到导航栏
 * @param {string} pageName - 页面名称
 * @param {string} navTitle - 导航标题
 */
async function addToNavigation(pageName, navTitle) {
    // 这里应该实现添加导航的逻辑
    // 在实际应用中，这可能需要修改header.html模板
    // 或者通过动态配置实现
    
    console.log(`添加页面 ${pageName} 到导航栏，标题为: ${navTitle}`);
    // 实际实现需要根据项目结构调整
}

/**
 * 创建页面对应的语言文件
 * @param {string} pageName - 页面名称
 * @param {Object} metadata - 页面元数据
 * @param {boolean} enableTranslation - 是否启用自动翻译
 */
async function createLanguageFiles(pageName, metadata, enableTranslation = true) {
    // 创建默认语言文件（简体中文）
    const zhCNContent = {
        meta: {
            title: metadata.title,
            description: metadata.description,
            keywords: metadata.keywords
        },
        [pageName]: {
            title: metadata.title
            // 可以添加更多翻译项
        }
    };
    
    // 创建英文语言文件
    let enContent;
    if (enableTranslation) {
        // 使用翻译API翻译内容
        try {
            const translatedTitle = await translateText(metadata.title, 'zh-CN', 'en');
            const translatedDescription = metadata.description ? await translateText(metadata.description, 'zh-CN', 'en') : '';
            
            enContent = {
                meta: {
                    title: translatedTitle,
                    description: translatedDescription,
                    keywords: metadata.keywords || ''
                },
                [pageName]: {
                    title: translatedTitle
                }
            };
        } catch (error) {
            console.warn('翻译失败，使用原文:', error);
            enContent = {
                meta: {
                    title: metadata.title,
                    description: metadata.description || '',
                    keywords: metadata.keywords || ''
                },
                [pageName]: {
                    title: metadata.title
                }
            };
        }
    } else {
        enContent = {
            meta: {
                title: metadata.title,
                description: metadata.description || '',
                keywords: metadata.keywords || ''
            },
            [pageName]: {
                title: metadata.title
            }
        };
    }
    
    // 这里应该实现语言文件保存逻辑
    console.log('创建语言文件:', zhCNContent, enContent);
    // 实际实现需要根据项目结构调整
}

/**
 * 使用翻译API翻译文本
 * @param {string} text - 要翻译的文本
 * @param {string} from - 源语言代码
 * @param {string} to - 目标语言代码
 * @returns {Promise<string>} 翻译后的文本
 */
async function translateText(text, from, to) {
    // 这里使用免费的翻译API，例如Google Translate API的免费版本
    // 注意：在生产环境中应该使用更可靠的翻译服务
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
        const data = await response.json();
        
        if (data.responseStatus === 200 && data.responseData) {
            return data.responseData.translatedText;
        } else {
            throw new Error('翻译API返回错误');
        }
    } catch (error) {
        console.error('翻译失败:', error);
        // 如果翻译失败，返回原文
        return text;
    }
}

// 导出函数供其他模块使用
window.pageGenerator = {
    createPageFromMarkdown,
    translateText
};