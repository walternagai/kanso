# Changelog

All notable changes to Kanso CLI will be documented in this file.

## [1.1.0] - 2026-09-17

### Added
- `kanso page <title>` — create static pages in content/
- `kanso list` — list pages and posts with dates and draft status
- `kanso post --draft` — create draft posts from the CLI
- `kanso build --verbose` — progress output every 50 pages
- `kanso serve --host` — bind address like `kanso dev`
- Scaffold home page (`layouts/home.html`) lists posts via `collections.posts`
- Scaffold generates commented `kanso.config.js`, `README.md` and `.gitignore`
- Scaffold `package.json` includes `serve` and `clean` scripts
- Build summary reports skipped drafts ("N draft(s) skipped")
- Build output includes page and template in render errors
- `--verbose` flag on build; `--host` on serve; contextual next-step hints

### Fixed
- Security: block path traversal in serve and dev server handlers (403 on
  requests resolving outside outputDir)
- Security: GitHub Pages deploy uses `execFileSync` argument arrays instead
  of shell string interpolation (prevents commit message injection)
- Security: build refuses to delete output dir resolving to project root
  or containing kanso.config.js
- `loadConfig`/`loadDeployConfig` merge config by section so user keys no
  longer silently drop nested defaults
- `formatDate` replaces all token occurrences (was first-occurrence only)
- Build with page errors now exits with code 1
- Deploy validates provider before building (fail fast)
- Init skips existing user files (kanso.config.js, package.json, content/)
  even with --force; rejects project names with path traversal
- MIME lookup lowercases extension (`.JPG` serves as image/jpeg)
- Dev server queues rebuilds occurring during a build instead of dropping them
- Paginated collections are no longer parsed twice per build

### Changed
- Engine and theme functions throw typed errors (`DeployError`, `ThemeError`)
  instead of calling `process.exit`; commands decide exit codes
- Shared HTTP handler (`engine/static-handler.ts`) and fs utilities
  (`utils/fs.ts`) extracted from duplicated code

## [1.0.1] - 2026-05-31

### Fixed
- `serve`: use `error()` instead of `info()` for missing dist/
- `build`: show "Build completed with errors" when pages fail
- `logger`: support `NO_COLOR` environment variable for CI pipelines
- `init`: default language to `"en"` instead of `"pt_BR"`
- `deploy`: translate common errors (network, auth, repository not found)
- `cli`: list valid providers `(github-pages, netlify)` in deploy help
- `cli`: add examples section in root help

## [1.0.0] - 2026-05-31

### Added
- `kanso clean` — remove dist/ directory
- `kanso serve` — serve dist/ directory locally
- Draft pages excluded from production build (`draft: true`)
- 404 page from `content/404.md`
- Template filters: `formatDate`, `excerpt`, `dateToISO`, `dateToUTC`
- Collections: group posts by directory and tag
- Tag collections: `/tags/web/`, `/tags/dev/`
- Canonical URLs in templates (`page.canonical`)
- Redirects file (`_redirects`) copied to dist/
- Headers file (`_headers`) copied to dist/
- i18n: language detection and path extraction
- Search index generation for client-side search
- Cache busting with MD5 hashes
- GitHub Actions CI (Linux/macOS/Windows, Node 18/20/22)
- CHANGELOG.md and CONTRIBUTING.md
- Comprehensive README documentation

## [0.3.0] - 2026-05-31

### Added
- Plugin API with hooks: `build:start`, `build:end`, `page:render`, `page:done`, `config:loaded`
- Theme system: `kanso theme list`, `kanso theme add <name>`
- 4 built-in themes: blog, docs, academic, research-group
- Light/dark mode toggle in all themes
- Academic theme for teaching, research and extension activities
- Research group theme for dissemination and projects

### Fixed
- Plugin runner hook execution order
- Theme file conflict handling

## [0.2.0] - 2026-05-31

### Added
- Atom feed generation (`feed.type: "atom"`)
- JSON Feed generation (`feed.type: "json"`)
- Pagination integration in build engine
- HTML minification (`build.minify: true`)
- Dev server CSS hot reload (no full page refresh)
- Dev server error overlay for build errors
- Dev server concurrent rebuild prevention

### Fixed
- Feed sorting by date descending
- Draft posts excluded from feeds

## [0.1.0] - 2026-05-30

### Added
- Initial release
- `kanso init <project>` — project scaffolding with templates
- `kanso dev` — development server with hot reload via WebSocket
- `kanso build` — production build with Markdown → HTML conversion
- `kanso deploy` — GitHub Pages and Netlify deployment
- `kanso post <title>` — blog post scaffolding
- Markdown with YAML front matter (gray-matter)
- Template engine (Nunjucks) with extends, blocks, includes
- Syntax highlighting (highlight.js)
- Asset pipeline (assets/ and public/ directories)
- SEO: sitemap.xml, robots.txt
- RSS feed generation
- Configuration via kanso.config.js
- CLI with colored output and help text
