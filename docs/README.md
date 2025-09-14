# FHIR MCP Server Documentation Site

This documentation site is built with Jekyll and hosted on GitHub Pages.

## Setting Up GitHub Pages

### 1. Enable GitHub Pages

1. Go to your repository: `https://github.com/martijn-on-fhir/fhir-mcp`
2. Click **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **Deploy from a branch**
5. Choose **Branch**: `development` (or `main`)
6. Choose **Folder**: `/docs`
7. Click **Save**

### 2. Wait for Deployment

GitHub will automatically build and deploy your site. This usually takes 5-10 minutes.

### 3. Access Your Documentation Site

Your documentation will be available at:
`https://martijn-on-fhir.github.io/fhir-mcp`

## Site Structure

```
docs/
├── _config.yml          # Jekyll configuration
├── index.md             # Homepage
├── quick-start-guide.md # Getting started
├── fhir-operations.md   # Operations reference
├── interactive-elicitation.md # Elicitation system
├── healthcare-workflows.md    # Clinical scenarios
├── configuration.md     # Configuration guide
├── api-reference.md     # Technical reference
└── troubleshooting.md   # Common issues
```

## Features

- **Jekyll static site generator** with GitHub Pages
- **Responsive design** with minima theme
- **Navigation** with proper ordering
- **Search functionality** (GitHub Pages built-in)
- **SEO optimization** with jekyll-seo-tag
- **Sitemap generation** with jekyll-sitemap

## Local Development

To run the site locally:

```bash
# Install Jekyll (one-time setup)
gem install bundler jekyll

# Create Gemfile
cd docs
echo 'source "https://rubygems.org"
gem "github-pages", group: :jekyll_plugins' > Gemfile

# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Open in browser
open http://localhost:4000/fhir-mcp
```

## Customization

### Theme Configuration

Edit `_config.yml` to customize:
- Site title and description
- Navigation
- Plugins
- Theme settings

### Adding Pages

1. Create new `.md` file in `/docs`
2. Add front matter:
```yaml
---
layout: default
title: Page Title
nav_order: 5
---
```
3. Commit and push - GitHub Pages will auto-deploy

### Updating Content

1. Edit the `.md` files in `/docs`
2. Commit and push changes
3. GitHub Pages will automatically rebuild and deploy

The documentation site provides a professional, searchable, and maintainable way to present the comprehensive FHIR MCP Server documentation.