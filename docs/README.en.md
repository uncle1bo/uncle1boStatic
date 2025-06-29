# Uncle1bo Static Website Project

[English](#) | [简体中文](../README.md)

This is a feature-complete static website project built with the Bootstrap framework, equipped with a comprehensive development toolkit, supporting deployment on static hosting platforms like Cloudflare Pages.

## Project Highlights

- 🛠️ **Complete Development Toolkit**: Includes sitemap updater, menu editor, page generator, page manager, and theme manager
- 🌐 **Multi-language Support**: Built-in internationalization support with Chinese and English switching
- 🎨 **Theme Customization**: Visual theme manager supporting light/dark mode
- 📝 **Markdown Support**: Page generator supports Markdown writing with automatic HTML conversion
- 🔧 **Modular Design**: Modular architecture following separation of concerns and minimal functionality principles
- 📱 **Responsive Design**: Responsive layout adapted for all devices

## Project Structure

```
uncle1boStatic/
├── README.md           # Project documentation (Chinese)
├── docs/               # Documentation directory
│   └── README.en.md    # Project documentation (English)
├── dev/                # Development environment directory
│   ├── src/            # Source code directory
│   │   ├── config/     # Configuration files
│   │   ├── services/   # Common service modules
│   │   ├── tools/      # Development toolkit
│   │   │   ├── sitemapUpdater/   # Sitemap updater
│   │   │   ├── menuEditor/       # Menu editor
│   │   │   ├── pageGenerator/    # Page generator
│   │   │   ├── pageManager/      # Page manager
│   │   │   └── themeManager/     # Theme manager
│   │   ├── public/     # Static resources
│   │   ├── views/      # View templates
│   │   └── index.js    # Application entry
│   └── package.json    # Development tools dependency configuration
├── prod/               # Production environment directory
│   ├── index.html      # Main page
│   ├── pages/          # User pages
│   ├── assets/         # Static resources
│   │   ├── images/     # Image resources
│   │   ├── fonts/      # Font files
│   │   └── icons/      # Icon files
│   ├── css/            # CSS styles
│   │   └── styles.css  # Custom styles
│   ├── js/             # Client-side JavaScript files
│   │   ├── main.js     # Main JavaScript
│   │   ├── i18n.js     # Internationalization support
│   │   └── template-processor.js # Template processor
│   ├── locales/        # Language resources
│   │   ├── en/         # English
│   │   └── zh-CN/      # Simplified Chinese
│   ├── templates/      # Page templates
│   │   ├── header.html # Header template
│   │   └── footer.html # Footer template
│   ├── robots.txt      # Search engine crawler configuration
│   ├── sitemap.xml     # Site map
│   ├── 404.html        # 404 error page
│   ├── _headers        # Security header configuration
│   ├── .nojekyll       # Disable GitHub Pages Jekyll processing
│   └── _redirects      # Redirect configuration
├── locall.bat          # Local development server startup script
├── server.js           # Production environment server
├── package.json        # Project dependency configuration
└── package-lock.json   # Dependency version lock file
```

## Technology Stack

### Frontend Technologies
- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- Responsive Design

### Backend Technologies
- Node.js
- Express.js
- EJS Template Engine
- Marked (Markdown Parser)
- Multer (File Upload)

### Development Tools
- Modular Architecture Design
- File System Operations (fs-extra)
- Real-time Preview Functionality
- Multi-language Internationalization Support

## Core Features

### 🌐 Website Features
- Responsive design, suitable for all devices
- Multi-language support (English, Simplified Chinese)
- Fast loading and optimized performance
- Custom 404 error page
- Search engine friendly
- Templated page structure

### 🛠️ Development Toolkit
- **Sitemap Updater**: Automatically scans pages and generates sitemap.xml
- **Menu Editor**: Visual navigation menu structure editing with drag-and-drop sorting
- **Page Generator**: Supports Markdown writing with automatic HTML page conversion
- **Page Manager**: Manages existing pages with view and delete operations
- **Theme Manager**: Visual theme color editing with light/dark mode switching

### 🎨 Theme System
- Visual theme color editing
- Light/dark mode switching
- Real-time preview effects
- Theme configuration saving and reset
- Responsive theme adaptation

## Getting Started

### Prerequisites

- Node.js (recommended version 16.x or higher)
- npm or yarn package manager
- Modern web browser

### Quick Start

1. **Clone the project**:
   ```bash
   git clone https://github.com/yourusername/uncle1boStatic.git
   cd uncle1boStatic
   ```

2. **Install dependencies**:
   ```bash
   # Install main project dependencies
   npm install
   
   # Install development tools dependencies
   cd dev
   npm install
   cd ..
   ```

3. **Start development environment**:

   **Option 1: Use development toolkit**
   ```bash
   cd dev
   npm run dev
   ```
   Visit: `http://localhost:3000` (Development toolkit)

   **Option 2: Preview production site**
   ```bash
   # Use batch file
   locall.bat
   
   # Or use npm command
   npm start
   ```
   Visit: `http://localhost:8000` (Production site preview)

### Using Development Tools

1. After starting the development toolkit, visit `http://localhost:3000`
2. Select the tool you need on the tool selection page:
   - **Sitemap Updater**: Update sitemap.xml file
   - **Menu Editor**: Manage navigation menu structure
   - **Page Generator**: Create new pages (Markdown support)
   - **Page Manager**: Manage existing pages
   - **Theme Manager**: Customize website theme
3. Click "Use This Tool" to enter the corresponding tool page

## 404 Page Configuration

This project includes a custom 404 error page that automatically redirects users when they visit a non-existent page.

- Local development environment: Uses http-server to provide 404 page support
- Cloudflare Pages deployment: Configures 404 redirect rules through the `_redirects` file

If you use another hosting service, you may need to adjust the 404 page configuration according to the requirements of that service.

## Deployment

This project is designed to be deployed on Cloudflare Pages, but can be hosted on any static site hosting service.

### Deploy to Cloudflare Pages

1. Push your code to a GitHub repository
2. Log in to your Cloudflare dashboard
3. Go to Pages > Create a project
4. Connect your GitHub repository
5. Configure your build settings:
   - Build command: (leave empty for static site)
   - Build output directory: / (root directory)
6. Deploy

## Advanced Features

### Multi-language Support

The website supports multiple languages through the `i18n.js` module. Language resources are stored in JSON files in the `locales` directory.

**Adding new languages**:
1. Create a new language code directory in `prod/locales/`
2. Copy JSON files from existing language directories
3. Translate the values in the JSON files
4. Development tools will automatically generate multi-language files for new pages

### Page Template System

- Uses header.html and footer.html templates from the `prod/templates/` directory
- Supports template variable replacement and internationalization tags
- Page generator automatically integrates templates into new pages
- Supports custom template variables and styles

### Theme Customization

- Visual editing of theme color schemes
- Support for both light and dark modes
- Real-time theme effect preview
- Automatic theme configuration saving
- Support for one-click reset to default theme

## Version Information

- **Current Version**: v1.0.0
- **Last Updated**: December 2024
- **Development Status**: Active development

### Changelog

**v1.0.0 (Dec 2024)**
- ✅ Complete development toolkit
- ✅ Sitemap updater
- ✅ Menu editor (with drag-and-drop sorting)
- ✅ Page generator (Markdown support)
- ✅ Page manager
- ✅ Theme manager (light/dark mode)
- ✅ Multi-language internationalization support
- ✅ Responsive design
- ✅ Template system

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the GNU General Public License v3 (GPL v3). See the [LICENSE](../LICENSE) file for details.

GPL v3 is a copyleft license that requires:
- Attribution to the original author
- Any derivative works must also be licensed under GPL v3
- Source code must be provided
- Modified versions must be marked as changed

## Acknowledgments

- [Bootstrap](https://getbootstrap.com/) - Responsive frontend framework
- [Express.js](https://expressjs.com/) - Web application framework
- [Marked](https://marked.js.org/) - Markdown parser
- [EJS](https://ejs.co/) - Template engine
- [Cloudflare Pages](https://pages.cloudflare.com/) - Static site hosting