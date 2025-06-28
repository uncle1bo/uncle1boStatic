# Uncle1bo Static Website Project

[English](#) | [简体中文](../README.md)

This is a pure static website project built with the Bootstrap framework, planned to be deployed on Cloudflare Pages.

## Project Structure

```
uncle1boStatic/
├── index.html          # Main page
├── pages/              # User pages
│   ├── about.html      # About page
│   ├── services.html   # Services page
│   └── contact.html    # Contact us page
├── assets/             # Static resources
│   ├── images/         # Image resources
│   ├── fonts/          # Font files
│   └── icons/          # Icon files
├── css/                # CSS styles
│   └── styles.css      # Custom styles
├── js/                 # Client-side JavaScript files
│   ├── main.js         # Main JavaScript
│   ├── i18n.js         # Internationalization support
│   └── template-processor.js # Template processor
├── locales/            # Language resources
│   ├── en/             # English
│   ├── zh-CN/          # Simplified Chinese

├── templates/          # Page templates
│   ├── header.html     # Header template
│   └── footer.html     # Footer template
├── docs/               # Documentation
│   ├── README.en.md    # English README
└── _headers            # Security headers configuration
    
```

## Technology Stack

- HTML5
- CSS3
- JavaScript
- Bootstrap 5

## Features

- Responsive design, suitable for all devices
- Multi-language support (English, Simplified Chinese)
- Fast loading and optimized performance
- Search engine friendly

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

   - Use a simple python command to start the main site server:
     ```
     python -m http.server 8000
     ```

   - Open your browser and navigate to: `http://localhost:8000`

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

## Multi-language Support

The website supports multiple languages through the `i18n.js` module. Language resources are stored in JSON files in the `locales` directory.

To add a new language:

1. Create a new directory with the language code in `locales/`
2. Copy the JSON files from an existing language directory
3. Translate the values in the JSON files

## Contributing

Contributions are welcome! Feel free to submit pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Bootstrap for the responsive framework
- Cloudflare Pages for hosting services