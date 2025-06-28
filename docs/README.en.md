# Uncle1bo Static Website Project

This is a pure static website project built with the Bootstrap framework, planned to be deployed on Cloudflare Pages.

## Project Structure

```
uncle1boStatic/
├── index.html          # Main page
├── pages/              # Other pages
│   ├── about.html      # About page
│   ├── services.html   # Services page
│   └── contact.html    # Contact page
├── assets/             # Static assets
│   ├── images/         # Image resources
│   ├── fonts/          # Font files
│   └── icons/          # Icon files
├── css/                # CSS styles
│   └── styles.css      # Custom styles
├── js/                 # JavaScript files
│   ├── main.js         # Main JavaScript
│   └── i18n.js         # Internationalization support
├── locales/            # Language resources
│   ├── en/             # English
│   ├── zh-CN/          # Simplified Chinese

└── docs/               # Documentation
    ├── README.en.md    # English README

```

## Technology Stack

- HTML5
- CSS3
- JavaScript
- Bootstrap 5

## Features

- Responsive design that works on all devices
- Multi-language support (English, Simplified Chinese)
- Fast loading and optimized performance
- SEO friendly

## Getting Started

### Prerequisites

No special prerequisites are needed to run this project. You only need a modern web browser.

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/uncle1boStatic.git
   cd uncle1boStatic
   ```

2. Start a local development server:
   - If you have Python installed:
     ```
     python -m http.server
     ```
   - If you have Node.js installed:
     ```
     npx http-server
     ```
   - Or simply run the included batch file (Windows):
     ```
     start-server.bat
     ```

3. Open your browser and navigate to:
   - Python: `http://localhost:8000`
   - Node.js: `http://localhost:8080`

## Deployment

This project is designed to be deployed on Cloudflare Pages, but can be hosted on any static site hosting service.

### Deploying to Cloudflare Pages

1. Push your code to a GitHub repository
2. Log in to your Cloudflare dashboard
3. Go to Pages > Create a project
4. Connect your GitHub repository
5. Configure your build settings:
   - Build command: (leave empty for static site)
   - Build output directory: / (root directory)
6. Deploy

## Multi-language Support

The website supports multiple languages through the `i18n.js` module. Language resources are stored in JSON files in the `locales` directory.

To add a new language:

1. Create a new directory in `locales/` with the language code
2. Copy the JSON files from an existing language directory
3. Translate the values in the JSON files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Bootstrap for the responsive framework
- Cloudflare Pages for hosting