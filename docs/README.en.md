# Uncle1bo Static Website Project

[English](#) | [简体中文](../README.md)

## 1. Project Structure

```
uncle1boStatic/
├── README.md           # Project documentation
├── docs/               # Documentation directory
├── dev/                # Development environment directory
│   ├── src/            # Source code directory
│   │   ├── tools/      # Development toolkit
│   │   │   ├── sitemapUpdater/   # Sitemap updater
│   │   │   ├── menuEditor/       # Menu editor
│   │   │   ├── pageGenerator/    # Page generator
│   │   │   ├── pageManager/      # Page manager
│   │   │   └── themeManager/     # Theme manager
│   │   ├── config/     # Configuration files
│   │   ├── services/   # Common service modules
│   │   ├── public/     # Static resources
│   │   ├── views/      # View templates
│   │   └── index.js    # Application entry
│   └── package.json    # Development tools dependency configuration
├── prod/               # Production environment directory
│   ├── index.html      # Main page
│   ├── pages/          # User pages
│   ├── assets/         # Static resources
│   ├── css/            # CSS styles
│   ├── js/             # JavaScript files
│   ├── locales/        # Language resources
│   ├── templates/      # Page templates
│   ├── robots.txt      # Search engine configuration
│   ├── sitemap.xml     # Site map
│   └── 404.html        # 404 error page
├── server.js           # Production environment server
└── package.json        # Project dependency configuration
```

## 2. Feature Introduction

This is a feature-complete static website project built with the Bootstrap framework, equipped with a comprehensive development toolkit, supporting deployment on static hosting platforms like Cloudflare Pages.

### Implemented Features List

- **Sitemap Updater**: Automatically scans pages and generates sitemap.xml
- **Menu Editor**: Visual navigation menu structure editing with drag-and-drop sorting
- **Page Generator**: Supports Markdown writing with automatic HTML page conversion
- **Page Manager**: Manages existing pages with view and delete operations
- **Theme Manager**: Visual theme color editing with light/dark mode switching
- **Multi-language Support**: Built-in internationalization support with Chinese and English switching
- **Responsive Design**: Responsive layout adapted for all devices
- **CDN Resource Management**: Intelligent CDN resource management system with automatic multi-CDN source switching
- **Template System**: Supports page templates and variable replacement

## 3. User Guide

### Quick Start

1. **Environment Requirements**: Node.js 16.x+, npm
2. **Install Dependencies**:
   ```bash
   npm install && cd dev && npm install
   ```
3. **Start Services**:
   - Development Tools: `cd dev && npm run dev` → http://localhost:3000
   - Production Preview: `npm start` → http://localhost:8000

### Using Development Tools

For detailed usage instructions, please refer to the README documentation for each tool:

- [Development Toolkit Overview](dev/README.md)
- [Sitemap Updater](dev/src/tools/sitemapUpdater/README.md)
- [Menu Editor](dev/src/tools/menuEditor/README.md)
- [Page Generator](dev/src/tools/pageGenerator/README.md)
- [Page Manager](dev/src/tools/pageManager/README.md)
- [Theme Manager](dev/src/tools/themeManager/README.md)

### Cloudflare Pages Deployment

1. **Prepare for Deployment**
   - Ensure the `prod/` directory contains all necessary files
   - Check `_headers` and `_redirects` configuration

2. **Connect Repository**
   - Log in to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Connect your GitHub/GitLab repository

3. **Configure Build**
   - Build command: Leave empty (static files)
   - Build output directory: `prod`
   - Root directory: `/`

4. **Environment Variables** (Optional)
   ```
   NODE_VERSION=16
   ```

5. **Custom Domain**
   - Add custom domain in Cloudflare Pages console
   - Configure DNS records to point to Cloudflare

6. **Deployment Complete**
   - Automatic deployment on every push to main branch
   - Support for preview branch deployment

## 4. API Usage

### Development Tools API

All development tools provide RESTful API interfaces through Express.js, base URL: `http://localhost:3000`

For detailed API documentation, please refer to:
- [Development Toolkit API Documentation](dev/README.md#4-api-usage)
- API sections in each tool's README documentation

### Core API Overview

```javascript
// CDN Resource Management
cdnManager.loadResource('bootstrap-css');

// Internationalization
i18n.t('key');
i18n.setLanguage('en');

// Development Tools API Examples
POST /api/sitemap/update    // Update sitemap
GET /api/menu               // Get menu structure
POST /api/pages/create      // Create page
GET /api/pages              // Get page list
POST /api/theme/save        // Save theme
```