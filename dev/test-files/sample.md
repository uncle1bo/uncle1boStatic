# 文件预览器测试文档

这是一个用于测试文件预览器功能的Markdown文档，包含了各种Markdown语法和增强功能。

## 基本语法测试

### 文本格式

这是**粗体文本**，这是*斜体文本*，这是***粗斜体文本***。

这是~~删除线文本~~，这是`行内代码`。

### 列表

#### 无序列表
- 项目1
- 项目2
  - 子项目2.1
  - 子项目2.2
- 项目3

#### 有序列表
1. 第一项
2. 第二项
   1. 子项目2.1
   2. 子项目2.2
3. 第三项

### 链接和图片

[Uncle1bo Static Website](https://github.com/uncle1bo)

### 引用

> 这是一个引用块。
> 
> 可以包含多行内容。
> 
> > 这是嵌套引用。

### 表格

| 功能 | 状态 | 描述 |
|------|------|------|
| XML预览 | ✅ | 支持XML文件语法高亮 |
| Markdown预览 | ✅ | 支持增强Markdown渲染 |
| 代码高亮 | ✅ | 基于Prism.js |
| 数学公式 | ✅ | 基于KaTeX |
| 思维导图 | ✅ | 基于Mermaid |

## 代码块测试

### JavaScript代码

```javascript
// 文件预览器示例代码
class FilePreviewer {
    constructor() {
        this.supportedTypes = {
            'xml': { icon: 'bi-file-code', name: 'XML文件' },
            'md': { icon: 'bi-file-text', name: 'Markdown文件' }
        };
    }
    
    async preview(fileInfo) {
        try {
            const content = await this.fetchFileContent(fileInfo.fullPath);
            return this.renderContent(content, fileInfo.extension);
        } catch (error) {
            console.error('预览失败:', error);
        }
    }
}
```

### Python代码

```python
# Python示例代码
def fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 生成前10个斐波那契数
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

### CSS代码

```css
/* 响应式设计样式 */
.file-previewer {
    max-width: 100%;
    margin: 0 auto;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    .file-previewer {
        padding: 0.5rem;
        margin: 0.5rem;
    }
}
```

## 数学公式测试

### 行内公式

这是一个行内公式：$E = mc^2$，这是另一个：$\sum_{i=1}^{n} x_i$。

### 块级公式

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix}
=
\begin{pmatrix}
ax + by \\
cx + dy
\end{pmatrix}
$$

## Mermaid图表测试

### 流程图

```mermaid
graph TD
    A[开始] --> B{检测文件类型}
    B -->|XML| C[XML预览]
    B -->|Markdown| D[Markdown渲染]
    B -->|图片| E[图片预览]
    B -->|其他| F[文本预览]
    C --> G[语法高亮]
    D --> H[增强渲染]
    E --> I[响应式显示]
    F --> J[纯文本显示]
    G --> K[完成]
    H --> K
    I --> K
    J --> K
```

### 时序图

```mermaid
sequenceDiagram
    participant U as 用户
    participant B as 浏览器
    participant P as 文件预览器
    participant S as 服务器
    
    U->>B: 访问文件URL
    B->>P: 检测文件类型
    P->>S: 请求文件内容
    S-->>P: 返回文件内容
    P->>P: 渲染文件内容
    P-->>B: 显示预览界面
    B-->>U: 展示文件预览
```

### 甘特图

```mermaid
gantt
    title 文件预览器开发计划
    dateFormat  YYYY-MM-DD
    section 基础功能
    文件类型检测    :done, detect, 2024-01-01, 2024-01-02
    界面设计        :done, ui, 2024-01-02, 2024-01-03
    基础预览        :done, basic, 2024-01-03, 2024-01-05
    section 增强功能
    代码高亮        :done, highlight, 2024-01-05, 2024-01-06
    Markdown渲染    :done, markdown, 2024-01-06, 2024-01-08
    数学公式        :done, math, 2024-01-08, 2024-01-09
    思维导图        :done, mermaid, 2024-01-09, 2024-01-10
    section 测试优化
    功能测试        :active, test, 2024-01-10, 2024-01-12
    性能优化        :optimize, 2024-01-12, 2024-01-14
    文档完善        :docs, 2024-01-14, 2024-01-15
```

## 特殊功能测试

### 任务列表

- [x] 实现XML文件预览
- [x] 实现Markdown文件预览
- [x] 添加代码语法高亮
- [x] 支持数学公式渲染
- [x] 支持Mermaid图表
- [x] 添加一键复制功能
- [ ] 添加文件下载功能
- [ ] 支持更多文件格式

### 脚注

这是一个带脚注的文本[^1]。

[^1]: 这是脚注内容。

### 高亮文本

==这是高亮文本==（如果支持的话）。

## 总结

这个文件预览器支持多种文件格式的在线预览，包括：

1. **代码文件**：XML、JSON、CSS、JavaScript、HTML等
2. **文档文件**：Markdown、纯文本等
3. **图片文件**：JPG、PNG、GIF、WebP、SVG等

主要特性：
- 🎨 语法高亮（基于Prism.js）
- 📝 增强Markdown渲染（基于Marked.js）
- 🧮 数学公式支持（基于KaTeX）
- 📊 思维导图支持（基于Mermaid）
- 📋 一键复制代码
- 📱 响应式设计
- 🚀 纯客户端实现，无服务器依赖

完全符合Cloudflare Pages的静态网站要求！