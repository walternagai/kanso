# Kanso CLI

> Build static sites with quiet speed.

Kanso CLI is a modern, simple, and fast static site generator for HTML, CSS, JavaScript, and Markdown. No heavy client-side frameworks — just clean, portable output.

## Status

✅ **v0.1.0 — MVP Complete**

## Quick Start

```bash
# Install
npm install -g kanso

# Create a new project
kanso init my-site

# Start dev server with hot reload
cd my-site
kanso dev

# Build for production
kanso build

# Deploy
kanso deploy
```

## Features

- **`kanso init`** — Scaffold a new project with layouts, components, assets, and config
- **`kanso dev`** — Local server with hot reload via WebSocket
- **`kanso build`** — Generate static HTML/CSS/JS to `dist/`
- **`kanso deploy`** — Deploy to GitHub Pages or Netlify
- **Markdown** — YAML front matter, CommonMark, syntax highlighting
- **Templates** — Nunjucks-based with `{% extends %}`, `{% block %}`, `{% include %}`
- **SEO** — Auto-generated sitemap.xml, robots.txt, meta tags
- **RSS** — Auto-generated RSS feed from posts
- **Pagination** — Configurable page splitting for post lists

## Tech Stack

- Node.js + TypeScript
- Nunjucks (templates)
- markdown-it (Markdown rendering)
- highlight.js (syntax highlighting)
- gray-matter (front matter parsing)
- chokidar (file watching)
- ws (WebSocket for hot reload)

## Documentation

- [PRD — Product Requirements Document](docs/prd-kanso-cli.md)
- [PRPs — Product Requirements Prompts](docs/prps-kanso-cli.md)

## License

MIT
