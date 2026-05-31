# Kanso CLI

> Build static sites with quiet speed.

Kanso CLI is a modern, simple, and fast static site generator for HTML, CSS, JavaScript, and Markdown. No heavy client-side frameworks — just clean, portable output.

**Pronunciation:** KAN-so — from the Japanese aesthetic principle of simplicity, clarity, and elimination of the excess.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Markdown & Front Matter](#markdown--front matter)
- [Templates](#templates)
- [Themes](#themes)
- [Collections](#collections)
- [Pagination](#pagination)
- [Feeds](#feeds)
- [SEO](#seo)
- [Drafts](#drafts)
- [404 Page](#404-page)
- [Excerpts & Date Filters](#excerpts--date-filters)
- [Plugins](#plugins)
- [i18n](#i18n)
- [Search](#search)
- [Deploy](#deploy)
- [Redirects & Headers](#redirects--headers)
- [CLI Reference](#cli-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

```bash
npm install -g kanso
```

**Requirements:** Node.js >= 18

---

## Quick Start

```bash
# Create a new project
kanso init my-site
cd my-site

# Install a theme (optional)
kanso theme add blog

# Start development server
kanso dev

# Build for production
kanso build

# Deploy
kanso deploy
```

---

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

---

## Project Structure

```
my-site/
  content/
    index.md              # Home page
    posts/
      hello-world.md      # Blog posts
    404.md                # Custom 404 page (optional)
  layouts/
    base.html             # Base layout
    post.html             # Post layout
    page.html             # Page layout
  components/
    header.html           # Reusable header
    footer.html           # Reusable footer
  assets/
    css/style.css         # Stylesheets
    js/main.js            # JavaScript
    images/               # Images
  public/
    favicon.ico           # Root-level files
    robots.txt
  kanso.config.js         # Configuration
  package.json
```

---

## Configuration

```js
// kanso.config.js
export default {
  // Site metadata
  site: {
    title: "My Kanso Site",
    url: "https://example.com",
    language: "en"
  },

  // Content directory
  content: {
    dir: "content"
  },

  // Output directory
  output: {
    dir: "dist"
  },

  // Markdown options
  markdown: {
    syntaxHighlight: true,  // Code syntax highlighting
    callouts: true          // Note/Warning/Tip/ danger blocks
  },

  // SEO
  seo: {
    sitemap: true,          // Generate sitemap.xml
    robots: true            // Generate robots.txt
  },

  // Feeds
  feed: {
    enabled: true,
    type: "rss",            // "rss" | "atom" | "json"
    limit: 20               // Max items in feed
  },

  // Pagination
  pagination: {
    perPage: 10             // Items per page
  },

  // Build options
  build: {
    minify: false           // HTML minification
  },

  // Deploy
  deploy: {
    provider: "github-pages",  // "github-pages" | "netlify"
    repo: "username/repo"      // For GitHub Pages
  },

  // Plugins
  plugins: []
}
```

---

## Markdown & Front Matter

Write content in Markdown with YAML front matter:

```markdown
---
title: My First Post
date: 2026-05-30
layout: post
tags: [web, javascript]
description: A short description for SEO
author: John Doe
draft: false
---

# My First Post

This is the content of my post written in **Markdown**.

## Code Example

```javascript
const greeting = "Hello, Kanso!";
console.log(greeting);
```

## Callouts

> [!NOTE]
> This is a note.

> [!WARNING]
> This is a warning.

> [!TIP]
> This is a tip.
```

### Front Matter Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Page title |
| `date` | string | no | Publication date (YYYY-MM-DD) |
| `layout` | string | no | Template to use (default: "base") |
| `tags` | array | no | Tags for categorization |
| `description` | string | no | Meta description for SEO |
| `author` | string | no | Author name |
| `draft` | boolean | no | If true, excluded from build |
| `pagination` | object | no | Pagination configuration |

---

## Templates

Kanso uses [Nunjucks](https://mozilla.github.io/nunjucks/) for templating.

### Variable Interpolation

```html
<h1>{{ title }}</h1>
<p>{{ site.title }}</p>
<p>{{ site.url }}</p>
```

### Conditionals

```html
{% if posts %}
  <ul>
    {% for post in posts %}
      <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul>
{% else %}
  <p>No posts yet.</p>
{% endif %}
```

### Layout Inheritance

**Base layout** (`layouts/base.html`):
```html
<!DOCTYPE html>
<html lang="{{ site.language }}">
<head>
  <title>{{ title }} | {{ site.title }}</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  {% include "header.html" %}
  <main>
    {% block content %}{% endblock %}
  </main>
  {% include "footer.html" %}
</body>
</html>
```

**Child layout** (`layouts/post.html`):
```html
{% extends "base.html" %}

{% block content %}
<article>
  <h1>{{ title }}</h1>
  <time>{{ date }}</time>
  {{ content | safe }}
</article>
{% endblock %}
```

### Partials (Includes)

```html
{% include "header.html" %}
{% include "components/nav.html" %}
```

### Filters

```html
{{ date | formatDate("DD/MM/YYYY") }}     <!-- 30/05/2026 -->
{{ date | dateToISO }}                     <!-- 2026-05-30T00:00:00.000Z -->
{{ date | dateToUTC }}                     <!-- Fri, 30 May 2026 00:00:00 GMT -->
{{ "Long text content" | excerpt(140) }}   <!-- Truncated text... -->
{{ content | safe }}                       <!-- Render HTML without escaping -->
```

---

## Themes

### Available Themes

| Theme | Description | Navigation |
|-------|-------------|------------|
| `blog` | Clean blog with dark mode | Home, Posts |
| `docs` | Documentation with sidebar | Home, Posts |
| `academic` | Teaching, research, extension | Início, Ensino, Pesquisa, Extensão, Notícias |
| `research-group` | Research group pages | Início, Projetos, Publicações, Equipe, Notícias |

All themes support **light/dark mode** toggle.

### Install a Theme

```bash
kanso theme list                    # List available themes
kanso theme add academic            # Install theme
kanso theme add academic --force    # Overwrite existing files
```

### Theme Structure

Each theme provides:
- `layouts/base.html` — Base layout
- `layouts/post.html` — Post layout
- `layouts/page.html` — Page layout
- `assets/css/style.css` — Theme CSS with dark mode
- `assets/js/theme.js` — Dark mode toggle script

---

## Collections

Group posts by directory or tag:

```html
<!-- List all posts -->
{% for post in collections.posts %}
  <article>
    <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
    <time>{{ post.date }}</time>
    <p>{{ post.excerpt }}</p>
  </article>
{% endfor %}

<!-- List posts by tag -->
{% for post in collections["tags/web"] %}
  <a href="{{ post.url }}">{{ post.title }}</a>
{% endfor %}
```

### Auto-generated Collections

| Collection | Description |
|------------|-------------|
| `collections.posts` | All posts from `content/posts/` |
| `collections.pages` | All pages from `content/` |
| `collections["tags/web"]` | Posts tagged "web" |
| `collections["tags/dev"]` | Posts tagged "dev" |

---

## Pagination

Create paginated listings:

```markdown
---
title: Blog
layout: base
pagination:
  collection: posts
  perPage: 5
---

{% for post in pagination.items %}
  <article>
    <a href="{{ post.url }}">{{ post.title }}</a>
  </article>
{% endfor %}

{% if pagination.prev %}
  <a href="{{ pagination.prev }}">← Previous</a>
{% endif %}

{% if pagination.next %}
  <a href="{{ pagination.next }}">Next →</a>
{% endif %}
```

### Pagination Data

```javascript
pagination: {
  currentPage: 1,      // Current page number
  totalPages: 5,       // Total pages
  totalItems: 42,      // Total items
  perPage: 10,         // Items per page
  prev: null,          // Previous page URL (null on first)
  next: "/blog/page/2/", // Next page URL (null on last)
  pages: [...],        // Array of { url, number }
  items: [...]         // Items on current page
}
```

---

## Feeds

Generate RSS, Atom, or JSON feeds:

```js
// kanso.config.js
export default {
  feed: {
    enabled: true,
    type: "rss",       // "rss" | "atom" | "json"
    limit: 20
  }
}
```

| Type | File | Content-Type |
|------|------|-------------|
| RSS | `/rss.xml` | `application/rss+xml` |
| Atom | `/atom.xml` | `application/atom+xml` |
| JSON | `/feed.json` | `application/feed+json` |

---

## SEO

### Automatic Generation

- `sitemap.xml` — All pages listed
- `robots.txt` — Allows all crawlers
- `<link rel="canonical">` — Canonical URLs
- Open Graph meta tags (in themes)

### Custom Meta Tags

In your layout:
```html
<head>
  <title>{{ title }} | {{ site.title }}</title>
  <meta name="description" content="{{ description }}">
  <link rel="canonical" href="{{ page.canonical }}">
  <meta property="og:title" content="{{ title }}">
  <meta property="og:description" content="{{ description }}">
  <meta property="og:url" content="{{ page.canonical }}">
</head>
```

---

## Drafts

Mark pages as drafts to exclude from production:

```markdown
---
title: Work in Progress
draft: true
---

This page will not appear in `kanso build`.
```

- Drafts are **excluded** from `kanso build`
- Drafts are **visible** in `kanso dev`

---

## 404 Page

Create a custom 404 page:

```markdown
---
title: Page Not Found
layout: base
---

# 404

The page you're looking for doesn't exist.

[Go back home](/)
```

Save as `content/404.md`. The build will generate `dist/404.html`.

---

## Excerpts & Date Filters

### Excerpts

Auto-generate excerpts from content:

```html
<p>{{ description | excerpt(140) }}</p>
```

### Date Filters

```html
{{ date | formatDate("DD/MM/YYYY") }}    <!-- 30/05/2026 -->
{{ date | formatDate("YYYY-MM-DD") }}    <!-- 2026-05-30 -->
{{ date | dateToISO }}                    <!-- ISO 8601 -->
{{ date | dateToUTC }}                    <!-- UTC string -->
```

---

## Plugins

Extend Kanso with plugins:

```js
// kanso.config.js
export default {
  plugins: ["my-plugin"]
}
```

### Plugin File

```js
// node_modules/my-plugin/index.js
export default function(api) {
  // Before build starts
  api.on("build:start", (ctx) => {
    console.log("Building", ctx.pages.length, "pages");
  });

  // Transform each page
  api.on("page:render", (page) => {
    page.outputHtml = page.outputHtml + "<!-- built by my-plugin -->";
    return page;
  });

  // After build completes
  api.on("build:end", (ctx) => {
    console.log("Built", ctx.pagesBuilt, "pages in", ctx.duration, "ms");
  });
}
```

### Available Hooks

| Hook | When | Data |
|------|------|------|
| `build:start` | Build begins | `{ projectRoot, config, pages, startTime }` |
| `build:end` | Build ends | `{ ..., pagesBuilt, duration }` |
| `page:render` | Page rendered | `{ filePath, slug, frontMatter, htmlContent, outputHtml }` |
| `page:done` | Page written | `{ filePath, slug, outputHtml }` |
| `config:loaded` | Config loaded | `{ site, content, output, ... }` |

---

## i18n

Support multiple languages:

```
content/
  pt/
    index.md
    sobre.md
  en/
    index.md
    about.md
```

```js
// kanso.config.js
export default {
  i18n: {
    enabled: true,
    defaultLang: "pt",
    languages: ["pt", "en"]
  }
}
```

---

## Search

Generate a client-side search index:

```js
import { generateSearchIndex } from "kanso/search";

const index = generateSearchIndex(files, contentDir);
// Returns: [{ title, url, content, tags }]
```

---

## Deploy

### GitHub Pages

```bash
# Set GITHUB_TOKEN or configure SSH
export GITHUB_TOKEN=your-token

# Deploy
kanso deploy --provider github-pages
```

```js
// kanso.config.js
export default {
  deploy: {
    provider: "github-pages",
    repo: "username/repo"
  }
}
```

### Netlify

```bash
# Set NETLIFY_AUTH_TOKEN
export NETLIFY_AUTH_TOKEN=your-token

# Deploy
kanso deploy --provider netlify
```

### Dry Run

Preview what would be deployed:

```bash
kanso deploy --dry-run
```

---

## Redirects & Headers

### Redirects

Create a `redirects` file in project root:

```
/old-page /new-page 301
/another /target 302
```

The file is copied to `dist/_redirects` (Netlify/Cloudflare format).

### Headers

Create a `headers` file in project root:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

The file is copied to `dist/_headers` (Netlify/Cloudflare format).

---

## CLI Reference

### `kanso init <name>`

Create a new project.

```bash
kanso init my-site              # Create project
kanso init my-site --force      # Overwrite existing
```

### `kanso post <title>`

Create a new blog post.

```bash
kanso post "My First Post"
kanso post "My Post" --tags "web, dev"
kanso post "My Post" --date 2026-06-01
kanso post "My Post" --description "A short description"
```

### `kanso dev`

Start development server with hot reload.

```bash
kanso dev                       # Default: localhost:3000
kanso dev --port 8080           # Custom port
kanso dev --host 0.0.0.0        # Bind to all interfaces
```

### `kanso build`

Build for production.

```bash
kanso build                     # Build to dist/
```

Output:
```
Kanso Build
  Pages:     15 pages generated
  Assets:    8 files copied
  Time:      42ms
  Size:      12.3 KB
```

### `kanso deploy`

Deploy to hosting provider.

```bash
kanso deploy --provider github-pages
kanso deploy --provider netlify
kanso deploy --dry-run
kanso deploy --message "Custom commit message"
```

### `kanso clean`

Remove the dist/ directory.

```bash
kanso clean
```

### `kanso serve`

Serve the dist/ directory locally.

```bash
kanso serve                     # Default: localhost:3000
kanso serve --port 8080         # Custom port
```

### `kanso theme list`

List available themes.

```bash
kanso theme list
```

### `kanso theme add <name>`

Install a theme.

```bash
kanso theme add blog
kanso theme add academic --force
```

---

## Examples

### Blog

```
content/
  index.md
  posts/
    hello-world.md
    my-second-post.md
layouts/
  base.html
  post.html
```

### Documentation Site

```bash
kanso theme add docs
```

### Academic Page

```bash
kanso theme add academic
```

### Research Group

```bash
kanso theme add research-group
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT
