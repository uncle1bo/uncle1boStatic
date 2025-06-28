# Uncle1bo Static Website Project

[English](#) | [简体中文](../README.md)

This is a pure static website project built with the Bootstrap framework, planned to be deployed on Cloudflare Pages.

## Project Structure

```
uncle1boStatic/
├── README.md           # Project documentation (Chinese)
├── docs/               # Documentation directory
│   └── README.en.md    # Project documentation (English)
├── dev/                # Development environment directory
├── prod/               # Production environment directory
│   ├── index.html      # Main page
│   ├── pages/          # User pages
│   │   ├── about.html  # About page
│   │   ├── services.html # Services page
│   │   └── contact.html # Contact us page
│   ├── assets/         # Static resources
│   │   ├── images/     # Image resources
│   │   ├── fonts/      # Font files
│   │   └── icons/      # Icon files
│   ├── css/            # CSS styles
│   │   └── styles.css  # Custom styles
│   ├── js/             # Client-side JavaScript files
│   │   ├── main.js     # Main JavaScript
│   │   ├── i18n.js     # Internationalization support
│   │   ├── markdown-parser.js # Markdown parser
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
│   ├── .gitignore      # Git ignore file configuration
│   └── _redirects      # Redirect configuration
├── locall.bat          # Local development server startup script
├── package.json        # Project dependency configuration
└── package-lock.json   # Dependency version lock file
```

## Technology Stack

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Node.js (for local development server)

## Features

- Responsive design, suitable for all devices
- Multi-language support (English, Simplified Chinese)
- Fast loading and optimized performance
- Custom 404 error page
- Search engine friendly

## Getting Started

### Prerequisites

No special prerequisites are required to run this project. You only need a modern web browser.

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/uncle1boStatic.git
   cd uncle1boStatic
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the local development server:

   - Use the provided batch file to start the server:
     ```
     locall.bat
     ```
   - Or directly use the npm command:
     ```
     npm start
     ```

   - The browser will automatically open and navigate to: `http://localhost:8000`

## 404 Page Configuration

This project includes a custom 404 error page that automatically redirects users when they visit a non-existent page.

- Local development environment: Uses http-server to provide 404 page support
- Cloudflare Pages deployment: Configures 404 redirect rules through the `_redirects` file

If you use another hosting service, you may need to adjust the 404 page configuration according to the requirements of that service.

## Deployment

This project is designed to be deployed on Cloudflare Pages, but can be hosted on any static site hosting service.