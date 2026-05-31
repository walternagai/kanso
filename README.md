# Kanso CLI

> Build static sites with quiet speed.

Kanso CLI is a modern, simple, and fast static site generator for HTML, CSS, JavaScript, and Markdown. No heavy client-side frameworks — just clean, portable output.

## Quick Start

```bash
# Install
npm install -g kanso

# Create a new project
kanso init my-site

# Install a theme
cd my-site
kanso theme add academic

# Start dev server
kanso dev

# Build for production
kanso build

# Deploy
kanso deploy
```

## Commands

| Command | Description |
|---------|-------------|
| `kanso init <name>` | Create a new project |
| `kanso post <title>` | Create a new blog post |
| `kanso dev` | Start dev server with hot reload |
| `kanso build` | Build for production |
| `kanso deploy` | Deploy to GitHub Pages or Netlify |
| `kanso clean` | Remove dist/ directory |
| `kanso serve` | Serve dist/ locally |
| `kanso theme list` | List available themes |
| `kanso theme add <name>` | Install a theme |

## Themes

| Theme | Description |
|-------|-------------|
| `blog` | Clean blog with dark mode |
| `docs` | Documentation with sidebar |
| `academic` | Teaching, research, and extension |
| `research-group` | Research group pages |

All themes support **light/dark mode** toggle.

## Features

- **Markdown** with YAML front matter, syntax highlighting
- **Templates** with Nunjucks (extends, blocks, includes)
- **Pagination** with configurable items per page
- **Collections** for grouping posts by directory or tag
- **Feeds** RSS, Atom, and JSON Feed
- **SEO** sitemap.xml, robots.txt, canonical URLs
- **Drafts** exclude pages with `draft: true`
- **404 page** custom error page from `content/404.md`
- **Excerpts** auto-generated from content
- **Date filters** `{{ date | formatDate("DD/MM/YYYY") }}`
- **Plugin API** extend with custom hooks
- **i18n** multilingual content support
- **Search** client-side search index
- **Deploy** GitHub Pages and Netlify

## Configuration

```js
// kanso.config.js
export default {
  site: {
    title: "My Site",
    url: "https://example.com",
    language: "pt_BR"
  },
  feed: {
    enabled: true,
    type: "rss"  // "rss" | "atom" | "json"
  },
  build: {
    minify: true
  },
  pagination: {
    perPage: 10
  }
}
```

## Plugin API

```js
export default function(api) {
  api.on("build:start", (ctx) => { /* ... */ });
  api.on("page:render", (page) => page);
  api.on("build:end", (ctx) => { /* ... */ });
}
```

## Documentation

- [PRD — Product Requirements Document](docs/prd-kanso-cli.md)
- [PRPs — Product Requirements Prompts](docs/prps-kanso-cli.md)
- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT
