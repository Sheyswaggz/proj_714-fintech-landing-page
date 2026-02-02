# Fintech Landing Page

A professional landing page for a fintech company designed to showcase services, build trust with potential customers, and capture leads. The page will present the company's value proposition, key features, and contact information in a clean, modern design that reflects the financial technology industry standards.

## Features

- **Hero Section**: Compelling value proposition with clear call-to-action
- **Services Showcase**: Highlight key fintech services and features
- **Trust Elements**: Build credibility with testimonials, stats, and partner logos
- **Contact Form**: Capture leads with an intuitive contact form
- **Responsive Design**: Mobile-first approach ensuring seamless experience across all devices
- **Modern CSS Framework**: Utilizes CSS Grid, Flexbox, and custom properties for theming

## Local Development

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local web server (optional but recommended)

### Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd proj_714-fintech-landing-page
   ```

2. Open the project in your preferred code editor

3. To view the landing page, you can either:
   - Open `index.html` directly in your browser
   - Use a local development server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000

     # Using Node.js (http-server)
     npx http-server

     # Using PHP
     php -S localhost:8000
     ```

4. Navigate to `http://localhost:8000` in your browser

### Development Workflow

- Edit HTML in `index.html`
- Modify styles in `styles.css`
- Refresh your browser to see changes

## Project Structure

```
proj_714-fintech-landing-page/
├── index.html          # Main HTML structure with semantic markup
├── styles.css          # Core CSS framework with responsive design
├── .gitignore          # Git ignore configuration
└── README.md           # Project documentation
```

### File Overview

- **index.html**: Contains the complete semantic HTML structure including hero section, services showcase, trust elements, contact form, and footer
- **styles.css**: Implements the CSS framework with custom properties, mobile-first responsive design, CSS Grid layouts, and Flexbox components

## Browser Compatibility

This landing page is compatible with:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

The design uses modern CSS features including:
- CSS Custom Properties (CSS Variables)
- CSS Grid
- Flexbox
- Media Queries

## Accessibility

This project follows web accessibility best practices:

- **Semantic HTML**: Proper use of HTML5 semantic elements
- **ARIA Labels**: Appropriate ARIA attributes for enhanced accessibility
- **Keyboard Navigation**: Full keyboard accessibility support
- **Color Contrast**: WCAG 2.1 AA compliant color contrast ratios
- **Responsive Text**: Scalable text that respects user preferences
- **Form Accessibility**: Properly labeled form inputs with validation feedback

### Accessibility Standards

- WCAG 2.1 Level AA compliance
- Semantic HTML5 structure
- Screen reader friendly
- Keyboard navigable

## Design Principles

- **Mobile-First**: Designed for mobile devices first, then enhanced for larger screens
- **Performance**: Optimized for fast loading and smooth interactions
- **Maintainability**: Clean, organized code with clear naming conventions
- **Scalability**: Modular CSS structure for easy expansion

## Customization

### Theming

The project uses CSS custom properties for easy theming. Key variables can be found at the top of `styles.css`:

- Color scheme
- Typography scale
- Spacing system
- Breakpoints

### Modifying Content

- Update text content in `index.html`
- Adjust styling in `styles.css`
- Custom properties allow for quick theme changes

## License

All rights reserved.