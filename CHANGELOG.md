# Changelog

All notable changes to Kanso CLI will be documented in this file.

## [0.3.0] - 2026-05-31

### Added
- Plugin API with hooks (build:start, build:end, page:render, page:done, config:loaded)
- Theme system: `kanso theme list`, `kanso theme add`
- 4 built-in themes: blog, docs, academic, research-group
- Light/dark mode toggle in all themes
- Academic theme for teaching, research and extension activities
- Research group theme for dissemination and projects

## [0.2.0] - 2026-05-31

### Added
- Atom feed generation (`feed.type: "atom"`)
- JSON Feed generation (`feed.type: "json"`)
- Pagination integration in build engine
- HTML minification (`build.minify: true`)
- Dev server CSS hot reload (no full page refresh)
- Dev server error overlay for build errors

## [0.1.0] - 2026-05-30

### Added
- Initial release
- `kanso init` - project scaffolding
- `kanso dev` - development server with hot reload
- `kanso build` - production build
- `kanso deploy` - GitHub Pages and Netlify
- Markdown with YAML front matter
- Template engine (Nunjucks) with extends, blocks, includes
- Syntax highlighting (highlight.js)
- Asset pipeline (assets/ and public/)
- SEO: sitemap.xml, robots.txt
- RSS feed generation
