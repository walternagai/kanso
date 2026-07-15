# Product Requirements Prompts — Kanso CLI

Este documento contém 10 PRPs (Product Requirements Prompts) derivados do PRD do Kanso CLI. Cada PRP é um prompt auto-contido otimizado para consumo por LLMs, cobrindo um módulo específico do sistema.

---

## PRP-01: CLI Controller & Project Init (`kanso init`)

```xml
<role>
You are an expert Node.js/TypeScript CLI developer specializing in building developer tools with Commander.js or yargs. You have deep experience with project scaffolding, file system operations, and npm package structure.
</role>

<product_overview>
<product_name>Kanso CLI</product_name>
<problem>
Developers wanting to build simple static sites face two extremes: overly minimal tools (no hot reload, no Markdown support, no SEO) and overly complex frameworks (React/Vue dependency, heavy build pipeline). Kanso fills the middle — modern static sites without unnecessary complexity.
</problem>
<target_users>
- Frontend developers wanting fast HTML/CSS/JS sites without framework overhead
- Technical bloggers writing in Markdown
- Professors/researchers publishing documentation or course pages
- Small teams needing lightweight institutional sites
</target_users>
<value_proposition>
Deliver a CLI tool that scaffolds, builds, and deploys static sites with a simple 4-command interface (`init`, `dev`, `build`, `deploy`), Markdown support, templates, SEO, and zero mandatory client-side JavaScript.
</value_proposition>
</product_overview>

<requirements>
<functional>

<requirement priority="P0">
<id>CLI-001</id>
<description>Provide CLI entry point via `kanso` command with subcommands: `init`, `dev`, `build`, `deploy`</description>
<acceptance_criteria>
- Running `kanso` without arguments shows help text listing all commands
- Running `kanso --version` prints the current version from package.json
- Running `kanso --help` shows detailed usage instructions
- Unknown commands show a clear error message with available commands
</acceptance_criteria>
</requirement>

<requirement priority="P0">
<id>CLI-002</id>
<description>Implement `kanso init <project-name>` to scaffold a new project</description>
<acceptance_criteria>
- Creates a directory with the given project name
- Generates the standard project structure:
  - `content/index.md` — home page example
  - `content/posts/` — directory for blog posts
  - `layouts/base.html` — base layout with HTML5 boilerplate
  - `layouts/post.html` — post layout extending base
  - `components/` — directory for reusable partials
  - `assets/css/`, `assets/js/`, `assets/images/` — static asset dirs
  - `public/` — root-level overrides (favicon, robots.txt, etc.)
  - `kanso.config.js` — project configuration
  - `package.json` — with `kanso dev`, `kanso build`, `kanso deploy` scripts
- Includes a working example: `index.md` with front matter and sample content
- Does NOT overwrite existing directories unless `--force` is passed
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>CLI-003</id>
<description>Display clear error messages with file path, line number, and probable cause when something fails</description>
<acceptance_criteria>
- Template syntax errors show the template file and line number
- Missing layout errors show which layout was not found
- Front matter parse errors show the file and line
- Config validation errors show the specific misconfigured property
</acceptance_criteria>
</requirement>

</functional>

<non_functional>
- <performance>Project init must complete in under 5 seconds</performance>
- <usability>CLI must have colored output, progress indicators, and concise messages</usability>
- <portability>MUST work on Linux, macOS, and Windows (cross-platform path handling)</portability>
- <security>Never execute remote code during scaffolding; all templates are bundled with the package</security>
</non_functional>
</requirements>

<technical_specifications>
<stack>
- Node.js >= 18 + TypeScript
- CLI parsing: Commander.js or yargs
- File system: fs-extra for recursive copy/mkdir
- Package distribution: npm package `kanso` plus `create-kanso` for `npm create kanso`
</stack>

<cli_interface>
kanso init [project-name] [options]
  Options:
    --force      Overwrite existing directory
    --template   Use a starter template (default: "blog")
    --yes        Skip prompts and use defaults
</cli_interface>

<scaffold_structure>
my-site/
  content/
    index.md
    posts/
      hello-world.md
  layouts/
    base.html
    post.html
  components/
    header.html
    footer.html
  assets/
    css/
      style.css
    js/
      main.js
    images/
      .gitkeep
  public/
    favicon.ico
  kanso.config.js
  package.json
</scaffold_structure>
</technical_specifications>

<examples>

<example type="scaffolding">
<input>
kanso init my-blog
</input>
<expected_output>
✔ Created project directory: my-blog
✔ Generated content/index.md
✔ Generated content/posts/hello-world.md
✔ Generated layouts/base.html
✔ Generated layouts/post.html
✔ Generated components/header.html
✔ Generated components/footer.html
✔ Generated assets/css/style.css
✔ Generated assets/js/main.js
✔ Generated public/favicon.ico
✔ Generated kanso.config.js
✔ Generated package.json

Kanso project created! 🎉

Next steps:
  cd my-blog
  kanso dev
</expected_output>
</example>

<example type="error">
<input>
kanso init existing-project
(where existing-project already exists)
</input>
<expected_output>
✖ Error: Directory "existing-project" already exists.
  Use --force to overwrite the existing directory.
</expected_output>
</example>

</examples>

<constraints>
- Must NOT require root/sudo permissions for any operation
- Generated `package.json` must NOT include runtime dependencies beyond `kanso`
- All scaffolded template files must be valid and functional out of the box
- Must preserve existing files when scaffolding into an existing project (without --force)
</constraints>

<quality_standards>
- Unit test coverage > 85% for CLI controller and scaffolder modules
- Integration test for full scaffold → build → serve flow
- All CLI output MUST be tested with snapshot testing
- Cross-platform CI tests (Linux, macOS, Windows) required
</quality_standards>

<out_of_scope>
- Visual CMS or WYSIWYG editor
- Admin panel
- Database integration
- Authentication
- E-commerce features
</out_of_scope>
```

---

## PRP-02: Dev Server & Hot Reload (`kanso dev`)

```xml
<role>
You are an expert Node.js developer specialized in build tools and dev servers. You have deep experience with file watching (chokidar), WebSocket-based hot reload, and HTTP server optimization for developer tooling.
</role>

<product_overview>
<product_name>Kanso CLI — Dev Server</product_name>
<problem>
Developers need to see changes in real-time while building static sites. Manual rebuild and browser refresh slows down the development feedback loop significantly.
</problem>
<target_users>
Frontend developers and content creators who need instant visual feedback when editing Markdown, templates, or assets.
</target_users>
<value_proposition>
A zero-config dev server with sub-second startup, file watching, incremental rebuild, and automatic browser reload — all without any client-side JavaScript framework.
</value_proposition>
</product_overview>

<requirements>
<functional>

<requirement priority="P0">
<id>DEV-001</id>
<description>Start a local HTTP server that serves the built site from memory or a temporary directory</description>
<acceptance_criteria>
- Server starts on port 3000 by default (configurable via `--port` flag)
- Serves generated HTML, CSS, JS, and assets with correct MIME types
- Clean shutdown on SIGINT/SIGTERM (Ctrl+C)
- Shows the local URL in the terminal on startup
</acceptance_criteria>
</requirement>

<requirement priority="P0">
<id>DEV-002</id>
<description>Watch files in content/, layouts/, components/, assets/, and public/ for changes</description>
<acceptance_criteria>
- Watches all Markdown files in content/ recursively
- Watches all template files in layouts/ and components/
- Watches all asset files in assets/ and public/
- Watches kanso.config.js for configuration changes
- Uses efficient file watcher (chokidar) with debouncing (300ms)
- Does NOT watch node_modules/ or dist/
</acceptance_criteria>
</requirement>

<requirement priority="P0">
<id>DEV-003</id>
<description>Rebuild only affected pages when content or templates change</description>
<acceptance_criteria>
- Changing a Markdown file rebuilds only that page
- Changing a layout rebuilds all pages using that layout
- Changing a component rebuilds all pages using that component
- Adding a new file triggers a build for that file
- Deleting a file removes it from the output
- Rebuild must complete in under 200ms for a single page
</acceptance_criteria>
</requirement>

<requirement priority="P0">
<id>DEV-004</id>
<description>Auto-reload the browser when rebuild completes</description>
<acceptance_criteria>
- Injects a small WebSocket client script into served HTML pages (only in dev mode)
- Sends reload signal to all connected browsers after each successful rebuild
- Reconnects automatically if the WebSocket connection drops
- Does NOT inject the script into non-HTML files (CSS, JS, images)
- Does NOT add the script to the production build
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>DEV-005</id>
<description>Display build errors clearly in the terminal without crashing the dev server</description>
<acceptance_criteria>
- Template errors show the file, line number, and error details in red
- Front matter errors show the file and parse error
- Missing layout/component errors show what is missing
- After an error, the server continues running and retries on the next change
- A failed build shows a fallback error page in the browser (dev only)
</acceptance_criteria>
</requirement>

</functional>

<non_functional>
- <performance>Dev server startup time: under 1 second for small projects</performance>
- <performance>File change detection: under 50ms; rebuild trigger: under 300ms debounced</performance>
- <performance>Memory usage: under 100MB for projects with up to 500 pages</performance>
- <reliability>Dev server MUST recover gracefully after build errors</reliability>
- <compatibility>Works on Linux, macOS, and Windows</compatibility>
</non_functional>
</requirements>

<technical_specifications>
<stack>
- File watching: chokidar (cross-platform, efficient)
- HTTP server: Node.js built-in http module or sirv (lightweight static server)
- WebSocket: ws library (lightweight, no framework dependency)
- Injection: regex or cheerio to inject WS client script before </body>
</stack>

<dev_server_interface>
kanso dev [options]
  Options:
    --port       Port to serve on (default: 3000)
    --host       Host to bind to (default: localhost)
    --open       Open browser automatically
</dev_server_interface>

<hot_reload_mechanism>
1. File change detected by chokidar
2. Debounce 300ms to batch multiple changes
3. Trigger rebuild for affected pages only
4. On success: send "reload" message via WebSocket to all clients
5. On error: log error to terminal, send error details to browser overlay
6. Server stays running regardless of build success/failure
</hot_reload_mechanism>
</technical_specifications>

<examples>

<example type="start">
<input>
kanso dev
</input>
<expected_output>
Kanso Dev Server running at:
  Local:   http://localhost:3000
  Network: http://192.168.1.100:3000

Watching for changes...
</expected_output>
</example>

<example type="file_change">
<input>
User edits content/posts/hello.md and saves
</input>
<expected_output>
✔ Rebuilt: /posts/hello/index.html (23ms)
</expected_output>
</example>

<example type="error">
<input>
User introduces a template syntax error in layouts/base.html
</input>
<expected_output>
✖ Build error in layouts/base.html:11
  Unexpected token "}}" — did you mean "{{ variable }}"?
  The server will continue running. Fix the error to reload.
</expected_output>
</example>

</examples>

<constraints>
- WebSocket injection MUST NOT appear in production build output
- MUST NOT require any browser extensions or plugins
- MUST work with CSS changes without full page reload (inject CSS via WebSocket when possible)
- Must handle 100+ concurrent WebSocket connections
</constraints>

<quality_standards>
- Integration test: start dev server, change file, verify rebuild + WebSocket message
- Performance benchmark: startup time, rebuild time, memory usage
- Error recovery test: inject syntax error, fix it, verify server recovers
</quality_standards>

<out_of_scope>
- HTTPS support in dev mode (post-MVP)
- Dev proxy for API calls (post-MVP)
- Remote dev sharing (post-MVP)
</out_of_scope>
```

---

## PRP-03: Build Engine (`kanso build`)

```xml
<role>
You are an expert build tool engineer specialized in static site generation pipelines. You have deep knowledge of Node.js streams, file system operations, build orchestration, and performance optimization for batch file processing.
</role>

<product_overview>
<product_name>Kanso CLI — Build Engine</product_name>
<problem>
Developers need to convert Markdown content, templates, and assets into deployable static HTML/CSS/JS files. The build must be fast, reliable, and produce pure static output without any runtime framework.
</problem>
<target_users>
Developers running production builds locally or in CI/CD pipelines for deployment to static hosts.
</target_users>
<value_proposition>
A fast, incremental build engine that converts Markdown + templates to flat HTML/CSS/JS, outputs to `dist/`, and gives a clear summary — all in under 2 seconds for 100 pages.
</value_proposition>
</product_overview>

<requirements>
<functional>

<requirement priority="P0">
<id>BLD-001</id>
<description>Read all Markdown files from content directory and convert to HTML, applying front matter and layouts</description>
<acceptance_criteria>
- Scans content/ recursively for .md files
- Parses YAML front matter from each file
- Converts Markdown body to HTML using CommonMark-compliant renderer
- Resolves the layout from front matter (default: base.html)
- Renders the page content inside the chosen layout
- Outputs clean .html files preserving the directory structure from content/
</acceptance_criteria>
</requirement>

<requirement priority="P0">
<id>BLD-002</id>
<description>Copy assets from assets/ and public/ to dist/ preserving directory structure</description>
<acceptance_criteria>
- Copies all files from assets/ to dist/assets/
- Copies all files from public/ to dist/ (root-level)
- Preserves full directory tree
- Does NOT copy hidden files (dotfiles) by default
- Does NOT copy .env files or sensitive configs
</acceptance_criteria>
</requirement>

<requirement priority="P0">
<id>BLD-003</id>
<description>Generate a clean build summary at the end</description>
<acceptance_criteria>
- Shows total number of pages generated
- Shows total build time in milliseconds
- Shows total output size (human-readable: KB, MB)
- Shows any warnings (missing layouts, unresolved includes)
- Exit code 0 on success, non-zero on failure
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>BLD-004</id>
<description>Clean dist/ before each full build (unless --incremental flag is passed)</description>
<acceptance_criteria>
- Removes all contents of dist/ before building (default behavior)
- With --incremental, only overwrites changed files
- Never removes dist/ itself, only its contents
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>BLD-005</id>
<description>Fail fast and clearly on build errors</description>
<acceptance_criteria>
- If any page fails to build, the error is displayed immediately
- Build continues for remaining pages (report all errors at once)
- Final exit code is non-zero if ANY page failed
- Error output includes file path, line number, and error message
</acceptance_criteria>
</requirement>

</functional>

<non_functional>
- <performance>Build 100 pages in under 2 seconds on a modern machine (SSD, 8GB RAM)</performance>
- <performance>Per-page build time: under 200ms average</performance>
- <performance>Incremental rebuild for single file: under 100ms</performance>
- <reliability>Build must produce identical output given identical input (deterministic)</reliability>
- <compatibility>Zero JavaScript framework in output — pure HTML/CSS/JS</compatibility>
- <security>Never copy .env, credentials, or hidden config files to dist/</security>
</non_functional>
</requirements>

<technical_specifications>
<stack>
- Markdown: markdown-it (fast, CommonMark, extensible) or remark
- Front matter: gray-matter
- Build orchestration: custom pipeline with async/await and Promise.all for parallel processing
- File operations: fs-extra with recursive copy
- Output: flat HTML files with .html extension, assets with original extensions
</stack>

<build_interface>
kanso build [options]
  Options:
    --incremental  Only rebuild changed files
    --verbose      Show detailed build log
    --minify       Minify HTML output (post-MVP placeholder)
</build_interface>

<build_pipeline>
1. Clean dist/ (unless --incremental)
2. Load kanso.config.js
3. Scan content/ for .md files → parse front matter + render Markdown
4. Load templates from layouts/ and components/
5. Apply layout to each page → render full HTML
6. Copy assets/ → dist/assets/
7. Copy public/ → dist/ (root files)
8. Generate sitemap.xml (if enabled in config)
9. Generate robots.txt (if enabled)
10. Generate RSS/Atom feed (if enabled)
11. Print build summary
</build_pipeline>

<output_structure>
dist/
  index.html
  posts/
    hello-world/
      index.html
  assets/
    css/
      style.css
    js/
    images/
  favicon.ico
  sitemap.xml
  robots.txt
  rss.xml
</output_structure>
</technical_specifications>

<examples>

<example type="successful_build">
<input>
kanso build
</input>
<expected_output>
Kanso Build

Pages:      12 pages generated
Assets:     23 files copied
Time:       487ms
Size:       1.2 MB

Build successful! Output in dist/
</expected_output>
</example>

<example type="failed_build">
<input>
kanso build
(with a broken template in layouts/base.html)
</input>
<expected_output>
✖ Build failed

Errors:
  layouts/base.html:18 — Unexpected token "{{ /if }}"
  Did you mean "{{ end }}"?

  1 page failed, 11 pages built successfully.
  Fix the errors above and rebuild.

Build failed with 1 error(s).
</expected_output>
</example>

</examples>

<constraints>
- MUST NOT include any client-side JavaScript framework in the output
- Output MUST work when served from any static host (no server-side requirements)
- Build MUST be reproducible (same input = same output, byte-for-byte)
- Parallel page processing MUST respect max open file descriptors
- Memory: must handle 1000+ pages without exceeding 500MB RAM
</constraints>

<quality_standards>
- Unit tests for each pipeline stage (front matter parsing, markdown render, layout apply)
- Integration test: build a 50-page project and verify output structure
- Snapshot test: compare dist/ output against expected output
- Performance benchmark: measure build time for 1, 10, 100, 500 pages
- Determinism test: two builds with same input must produce identical output
</quality_standards>

<out_of_scope>
- JavaScript bundling (webpack/rollup) — post-MVP via plugin
- CSS preprocessing (SASS) — post-MVP via plugin
- Image optimization — post-MVP
- HTML minification — post-MVP
</out_of_scope>
```

---

## PRP-04: Template Engine

```xml
<role>
You are an expert template engine designer and Node.js developer. You specialize in building or integrating template rendering systems (Nunjucks, Liquid, Eta) for static site generators, with deep knowledge of inheritance, partials, filters, and sandboxing.
</role>

<product_overview>
<product_name>Kanso CLI — Template Engine</product_name>
<problem>
Static sites need dynamic page generation during build — inserting content into layouts, reusing components, iterating over post lists, and conditionally showing elements. A template engine enables this without client-side JavaScript.
</problem>
<target_users>
Developers authoring HTML layouts and reusable components for static sites.
</target_users>
<value_proposition>
A simple yet powerful template engine supporting variable interpolation, conditionals, loops, layout inheritance (extends), and partials (include) — keeping templates readable and maintainable.
</value_proposition>
</product_overview>

<requirements>
<functional>

<requirement priority="P0">
<id>TMP-001</id>
<description>Support variable interpolation with {{ variable }} syntax</description>
<acceptance_criteria>
- Single variables: `{{ title }}`, `{{ description }}`
- Nested object access: `{{ page.title }}`, `{{ site.url }}`
- Array access: `{{ posts[0].title }}`
- Default values: `{{ title | default("Untitled") }}`
- Escaped HTML by default, raw output with triple braces: `{{{ html_content }}}`
</acceptance_criteria>
</requirement>

<requirement priority="P0">
<id>TMP-002</id>
<description>Support conditionals with {{ if }} / {{ else }} / {{ end }}</description>
<acceptance_criteria>
- `{{ if variable }}` — truthy check
- `{{ if not variable }}` — falsy check
- `{{ if variable == value }}` — equality comparison
- `{{ if variable != value }}` — inequality
- `{{ if variable > n }}` and `{{ if variable < n }}` — numeric comparison
- `{{ else }}` and `{{ else if condition }}` support
- Nested conditionals
</acceptance_criteria>
</requirement>

<requirement priority="P0">
<id>TMP-003</id>
<description>Support loops with {{ for item in collection }} / {{ end }}</description>
<acceptance_criteria>
- `{{ for post in posts }}` — iterate arrays
- Access loop metadata: `{{ loop.index }}`, `{{ loop.first }}`, `{{ loop.last }}`
- Empty collection renders nothing (no error)
- Nested loops supported
</acceptance_criteria>
</requirement>

<requirement priority="P0">
<id>TMP-004</id>
<description>Support layout inheritance with {{ extends "layout" }} and {{ block name }} / {{ endblock }}</description>
<acceptance_criteria>
- Child templates define `{{ extends "base" }}` to inherit from layouts/base.html
- `{{ block "content" }}...{{ endblock }}` defines overridable sections in the child
- Layout files render child content with `{{ block "content" }}`
- Blocks can have default content in the layout that shows if child doesn't define it
- Multiple named blocks supported (content, head, scripts, etc.)
</acceptance_criteria>
</requirement>

<requirement priority="P0">
<id>TMP-005</id>
<description>Support partial includes with {{ include "component" }}</description>
<acceptance_criteria>
- `{{ include "header" }}` includes components/header.html
- `{{ include "components/nav.html" }}` supports subdirectory paths
- Partial has access to the same variables as the parent template
- Missing includes produce a clear error message
- Circular includes are detected and produce an error
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>TMP-006</id>
<description>Support basic filters for variable transformation</description>
<acceptance_criteria>
- `{{ date | date("YYYY-MM-DD") }}` — date formatting
- `{{ content | truncate(150) }}` — truncate text
- `{{ title | slug }}` — URL slug generation
- `{{ html | safe }}` — mark as safe HTML (no escaping)
- `{{ text | uppercase }}` and `{{ text | lowercase }}`
- Filters can be chained: `{{ title | uppercase | slug }}`
</acceptance_criteria>
</requirement>

</functional>

<non_functional>
- <performance>Template render time: under 10ms per page for typical layouts</performance>
- <performance>Template cache: compiled templates are cached in memory</performance>
- <security>Sandboxed execution: no access to process, fs, or network from templates</security>
- <usability>Clear error messages with file and line number for syntax errors</usability>
</non_functional>
</requirements>

<technical_specifications>
<choices>
Recommended: Use Eta (fast, lightweight, TypeScript-compatible) or Nunjucks (battle-tested, Jinja-like syntax).
<recommendation>Eta — < 10KB, faster than Nunjucks, supports async, includes, extends, and custom filters.</recommendation>
</choices>

<template_syntax>
{{ variable }}         — escaped output
{{{ variable }}}       — raw (unescaped) output
{{ if condition }}     — if statement
{{ else }}             — else
{{ else if condition }}— else if
{{ end }}              — end if/for/block
{{ for item in list }} — for loop
{{ loop.index }}       — loop index (1-based)
{{ loop.first }}       — boolean, first iteration
{{ loop.last }}        — boolean, last iteration
{{ extends "base" }}   — layout inheritance
{{ block "name" }}     — block definition
{{ endblock }}         — end block
{{ include "comp" }}   — partial include
{{ var | filter }}     — pipe filter syntax
</template_syntax>

<file_resolution>
- Layouts: layouts/<name>.html (no extension needed)
- Components: components/<name>.html (no extension needed)
- Can use relative paths: layouts/blog/post.html
- Default layout: "base" (resolves to layouts/base.html)
</file_resolution>
</technical_specifications>

<examples>

<example type="layout">
<input>
File: layouts/base.html

<!DOCTYPE html>
<html>
<head>
  <title>{{ title }} | {{ site.title }}</title>
</head>
<body>
  {{ include "header" }}
  <main>
    {{ block "content" }}
      Default content
    {{ endblock }}
  </main>
  {{ include "footer" }}
</body>
</html>
</input>
<expected_output>
Each page gets wrapped in the base layout, with its specific content in the "content" block, header and footer included automatically.
</expected_output>
</example>

<example type="page">
<input>
File: layouts/post.html (extending base)

{{ extends "base" }}

{{ block "content" }}
<article>
  <h1>{{ title }}</h1>
  <time>{{ date | date("YYYY-MM-DD") }}</time>
  {{{ content }}}
</article>
{{ endblock }}
</input>
<expected_output>
Full HTML page with header, article content, and footer.
</expected_output>
</example>

<example type="listing">
<input>
Template snippet:
<ul>
{{ for post in collections.posts }}
  <li>
    <a href="{{ post.url }}">{{ post.title }}</a>
    <small>{{ post.date | date("YYYY-MM-DD") }}</small>
  </li>
{{ end }}
</ul>
</input>
<expected_output>
Renders an HTML list of all posts with links and dates.
</expected_output>
</example>

</examples>

<constraints>
- Template engine MUST be sandboxed — no access to Node.js globals (process, require, fs)
- Custom filters MUST be registered through the API, not defined in templates
- Template inheritance MUST NOT exceed 3 levels of nesting
- Circular extends/include MUST be detected and rejected with an error
- All templates MUST be loaded relative to the project root (layouts/, components/)
- Engine choice: prefer Eta for speed, or evaluate Nunjucks if Jinja-like syntax is valued
</constraints>

<quality_standards>
- Unit tests for every tag type (interpolation, if, for, extends, include, block, filters)
- Error case tests: missing template, circular include, syntax error, undefined variable
- Performance benchmark: render 1000 templates and measure throughput
- Sandbox security test: verify process/fs/require are inaccessible
</quality_standards>

<out_of_scope>
- Template inheritance across themes (post-MVP)
- Dynamic template loading at runtime
- In-template macros or functions
- Import/export of template fragments between projects
</out_of_scope>
```

---

## PRP-05: Markdown & Front Matter Processing

```xml
<role>
You are an expert content processing engineer specializing in Markdown parsing, YAML front matter extraction, and static content pipelines. You have deep experience with markdown-it, gray-matter, and syntax highlighting integrations.
</role>

<product_overview>
<product_name>Kanso CLI — Content Pipeline</product_name>
<problem>
Content authors want to write in Markdown with metadata (title, date, tags, layout) and have it rendered into styled HTML automatically. The system must parse front matter, render Markdown, support code highlighting, and expose metadata to templates.
</problem>
<target_users>
Bloggers, technical writers, professors, and documentation authors writing content in Markdown.
</target_users>
<value_proposition>
Seamless Markdown-to-HTML conversion with YAML front matter for metadata, CommonMark compliance, syntax highlighting, and callouts — all feeding into the template system for complete page rendering.
</value_proposition>
</product_overview>

<requirements>
<functional>

<requirement priority="P0">
<id>MD-001</id>
<description>Parse YAML front matter from Markdown files (delimited by ---)</description>
<acceptance_criteria>
- Detects front matter between `---` delimiters at the start of the file
- Parses YAML keys: title, date, layout, tags, description, author, draft
- Supports multi-line values in YAML
- Supports arrays (tags: [web, dev]) and objects
- Exposes all front matter keys as template variables
- Missing front matter: still renders the Markdown; uses defaults from config
- Error on malformed YAML: clear message with file and line
</acceptance_criteria>
</requirement>

<requirement priority="P0">
<id>MD-002</id>
<description>Convert Markdown body to HTML using CommonMark specification</description>
<acceptance_criteria>
- Supports CommonMark syntax: headings, lists, bold, italic, links, images, blockquotes, code blocks, tables, horizontal rules
- Supports fenced code blocks with language tags
- Supports inline code with backticks
- Supports task lists (- [ ] and - [x])
- Supports footnotes
- Output is clean, semantic HTML
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>MD-003</id>
<description>Syntax highlighting for fenced code blocks</description>
<acceptance_criteria>
- Detects language from fenced code block tag (```javascript)
- Applies syntax highlighting via highlight.js or Prism (server-side)
- Outputs highlighted HTML with language-appropriate CSS classes
- Can be disabled via config: `markdown.syntaxHighlight: false`
- Themes: default Dark/Light theme included; custom CSS theme support
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>MD-004</id>
<description>Support callouts/admonitions (notes, warnings, tips, danger)</description>
<acceptance_criteria>
- Blockquote-style syntax: `> [!NOTE]`, `> [!WARNING]`, `> [!TIP]`, `> [!CAUTION]`
- Renders as styled `<div>` with appropriate CSS class
- Styled differently per type (info blue, warning yellow, danger red, tip green)
- Can be disabled via config: `markdown.callouts: false`
- Custom CSS class names for styling flexibility
</acceptance_criteria>
</requirement>

<requirement priority="P2">
<id>MD-005</id>
<description>Support Markdown link rewriting for proper internal linking</description>
<acceptance_criteria>
- Internal links to .md files are rewritten to .html URLs
- Links to index.md become '/'
- Links to posts/hello.md become '/posts/hello/'
- External links (http/https) are left unchanged
- Anchor links (#section) are left unchanged
</acceptance_criteria>
</requirement>

</functional>

<non_functional>
- <performance>Parse + render: under 50ms per page for typical content (500 lines)</performance>
- <performance>Batch processing: 100 pages in under 2 seconds (sequential)</performance>
- <compliance>CommonMark 0.31 specification compliance (pass existing test suite)</compliance>
- <extensibility>Custom Markdown plugins/options via config</extensibility>
</non_functional>
</requirements>

<technical_specifications>
<stack>
- Markdown parser: markdown-it (fast, CommonMark, plugin ecosystem)
- Front matter: gray-matter (battle-tested, handles edge cases)
- Syntax highlighting: highlight.js (server-side, 190+ languages)
- Callouts: custom markdown-it plugin or blockquote extension
</stack>

<configuration_interface>
// From kanso.config.js
markdown: {
  syntaxHighlight: true,
  callouts: true,
  linkRewrite: true
}
</configuration_interface>

<front_matter_fields>
title: string        — Page title (required)
date: date           — Publication date (ISO format)
layout: string       — Template to use (default: "base")
tags: string[]       — Categorization tags
description: string  — Meta description for SEO
author: string       — Author name
draft: boolean       — If true, excluded from build
permalink: string    — Custom URL pattern (/custom/:slug/)
slug: string         — Custom URL slug (auto-generated from title if absent)
</front_matter_fields>
</technical_specifications>

<examples>

<example type="blog_post">
<input>
File: content/posts/my-first-post.md
---
title: My First Post
date: 2026-05-30
layout: post
tags: [web, static-sites, kanso]
description: My first post using Kanso CLI
author: Jane Doe
---

## Welcome to My Blog

This is my first post using **Kanso CLI**. It's a simple static site generator.

### Code Example

```javascript
const greeting = "Hello, Kanso!";
console.log(greeting);
```

> [!TIP]
> Kanso makes static site generation simple and fast.
</input>
<expected_output>
Front matter parsed:
- title: "My First Post"
- date: 2026-05-30
- layout: "post"
- tags: ["web", "static-sites", "kanso"]
- description: "My first post using Kanso CLI"
- author: "Jane Doe"

Markdown rendered to HTML with:
- Syntax-highlighted JavaScript code block
- Styled callout div for the TIP admonition
- Proper heading and paragraph tags
</expected_output>
</example>

<example type="front_matter_error">
<input>
File: content/broken.md
---
title: "Broken
date: broken-date
---
Content
</input>
<expected_output>
✖ Front matter error in content/broken.md:2
  Unterminated string in YAML at line 2, column 8
</expected_output>
</example>

</examples>

<constraints>
- MUST NOT execute arbitrary code during Markdown rendering (no `eval`, no `require`)
- Front matter MUST support all valid YAML types (strings, numbers, dates, arrays, objects)
- Draft pages (`draft: true`) MUST be excluded from production build
- Syntax highlighting MUST NOT add client-side JavaScript — highlighted HTML only
- Link rewriting MUST NOT affect URLs inside code blocks or inline code
</constraints>

<quality_standards>
- Unit tests: front matter parsing (valid, missing, malformed)
- Unit tests: Markdown rendering (every CommonMark element type)
- Unit tests: syntax highlighting (10+ languages)
- Unit tests: callout rendering (all 4 types)
- Integration test: end-to-end content → front matter → markdown → layout → HTML
- Compliance: run CommonMark specification test suite on the markdown renderer
</quality_standards>

<out_of_scope>
- Custom Markdown containers/plugins beyond callouts (post-MVP)
- Image optimization during content processing (post-MVP)
- Embedding YouTube/tweets in Markdown (post-MVP)
- LaTeX/MathJax rendering (post-MVP)
</out_of_scope>
```

---

## PRP-06: Asset Pipeline

```xml
<role>
You are an expert build tool engineer focused on asset management for static site generators. You specialize in file copying pipelines, path resolution, asset URL rewriting, and cross-platform file system operations.
</role>

<product_overview>
<product_name>Kanso CLI — Asset Pipeline</product_name>
<problem>
Static sites need CSS, JavaScript, images, fonts, and other files copied to the output directory. Without automation, developers manually copy files and manage paths — introducing errors and friction.
</problem>
<target_users>
Developers managing static assets (stylesheets, scripts, images, fonts) for their sites.
</target_users>
<value_proposition>
Automatic copy of assets from project source directories to the output, preserving structure and enabling simple path references in templates — zero configuration required.
</value_proposition>
</product_overview>

<requirements>
<functional>

<requirement priority="P0">
<id>AST-001</id>
<description>Copy all files from assets/ to dist/assets/ preserving directory structure</description>
<acceptance_criteria>
- `assets/css/style.css` → `dist/assets/css/style.css`
- `assets/js/main.js` → `dist/assets/js/main.js`
- `assets/images/photo.jpg` → `dist/assets/images/photo.jpg`
- `assets/fonts/roboto.woff2` → `dist/assets/fonts/roboto.woff2`
- Supports nested subdirectories of any depth
- Does NOT copy hidden files (starting with .) by default
</acceptance_criteria>
</requirement>

<requirement priority="P0">
<id>AST-002</id>
<description>Copy all files from public/ to dist/ root level</description>
<acceptance_criteria>
- `public/favicon.ico` → `dist/favicon.ico`
- `public/robots.txt` → `dist/robots.txt`
- `public/CNAME` → `dist/CNAME`
- `public/.well-known/` → `dist/.well-known/`
- Files in public/ override any generated files with the same name
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>AST-003</id>
<description>Provide a helper to reference assets in templates with correct paths</description>
<acceptance_criteria>
- `{{ asset "css/style.css" }}` resolves to `/assets/css/style.css`
- `{{ asset "images/photo.jpg" }}` resolves to `/assets/images/photo.jpg`
- Paths use forward slashes (even on Windows)
- Paths are relative to site root (start with /)
- Works with custom output directory config
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>AST-004</id>
<description>Skip copying .env files and sensitive configuration files</description>
<acceptance_criteria>
- Files named `.env`, `.env.*` are not copied
- `kanso.config.js` is not copied to output
- `node_modules/` is never copied
- `.git/` is never copied
- Hidden files (dotfiles) in assets/ are skipped by default
</acceptance_criteria>
</requirement>

</functional>

<non_functional>
- <performance>Copy 1000 assets under 1 second</performance>
- <reliability>File copies checked with checksums or size verification</reliability>
- <incremental>Only copy changed files (compare mtime and size)</incremental>
</non_functional>
</requirements>

<technical_specifications>
<stack>
- File operations: fs-extra (copy, ensureDir)
- Path resolution: path module with cross-platform normalization
- Incremental copy: compare mtime + file size, skip if unchanged
</stack>

<asset_priority>
public/ files have highest priority (override all)
assets/ files are copied second
Generated files (HTML, sitemap, RSS) are written last
Duplicate names: public/ wins over assets/ and generated files
</asset_priority>

<configuration>
// From kanso.config.js
assets: {
  dir: "assets",          // Source assets directory
  publicDir: "public",    // Root-level overrides
  skipDotfiles: true,     // Skip hidden files
  incremental: true       // Only copy changed files
}
</configuration>
</technical_specifications>

<examples>

<example type="copy">
<input>
Project structure:
  assets/
    css/style.css
    js/app.js
    images/logo.png
    fonts/inter.woff2
  public/
    favicon.ico
    robots.txt

kanso build
</input>
<expected_output>
Assets copied:
  assets/css/style.css → dist/assets/css/style.css
  assets/js/app.js → dist/assets/js/app.js
  assets/images/logo.png → dist/assets/images/logo.png
  assets/fonts/inter.woff2 → dist/assets/fonts/inter.woff2
  public/favicon.ico → dist/favicon.ico
  public/robots.txt → dist/robots.txt
</expected_output>
</example>

<example type="template_reference">
<input>
In layout:
<link rel="stylesheet" href="{{ asset "css/style.css" }}">
<img src="{{ asset "images/logo.png" }}" alt="Logo">
</input>
<expected_output>
Rendered HTML:
<link rel="stylesheet" href="/assets/css/style.css">
<img src="/assets/images/logo.png" alt="Logo">
</expected_output>
</example>

</examples>

<constraints>
- MUST preserve symbolic links (copy the file, not the link target — or copy as link, configurable)
- MUST NOT copy files to locations outside dist/
- MUST use cross-platform path handling (forward slashes in output, native on disk)
- Files in public/ MUST override any generated file with the same name in dist/
</constraints>

<quality_standards>
- Integration test: build project with assets, verify all files in correct dist/ locations
- Override test: file in public/ with same name as generated file — verify public/ wins
- Sensitive file test: .env present in project root — verify NOT copied to dist/
- Incremental test: run build twice, second run should skip unchanged assets
</quality_standards>

<out_of_scope>
- CSS preprocessing (SASS/SCSS/LESS) — post-MVP via plugin
- JavaScript bundling/minification — post-MVP via plugin
- Image optimization/compression — post-MVP via plugin
- Fingerprinting / cache busting hashes — post-MVP
- CDN upload — post-MVP
</out_of_scope>
```

---

## PRP-07: SEO & Sitemap Generation

```xml
<role>
You are an expert in static site SEO optimization and technical SEO engineering. You specialize in generating sitemap.xml, robots.txt, meta tags, Open Graph, and structured data for static websites.
</role>

<product_overview>
<product_name>Kanso CLI — SEO Module</product_name>
<problem>
Content authors need their static sites to be discoverable by search engines. Without automatic SEO metadata generation, developers manually add meta tags, create sitemaps, and manage robots.txt — a repetitive and error-prone process.
</problem>
<target_users>
Bloggers, content creators, documentation authors, and small teams who need search-engine-friendly static sites without manual SEO work.
</target_users>
<value_proposition>
Automatic generation of title tags, meta descriptions, Open Graph tags, sitemap.xml, and robots.txt — all configurable via front matter and project config, with zero manual effort.
</value_proposition>
</product_overview>

<requirements>
<functional>

<requirement priority="P0">
<id>SEO-001</id>
<description>Generate HTML title tag from page front matter, falling back to site config</description>
<acceptance_criteria>
- Uses `title` from front matter as the page title
- Falls back to config `site.title` if page has no title
- Supports format: `{{ title }} | {{ site.title }}` (configurable pattern)
- Special characters are properly escaped in title
</acceptance_criteria>
</requirement>

<requirement priority="P0">
<id>SEO-002</id>
<description>Generate meta description tag from front matter or config</description>
<acceptance_criteria>
- Uses `description` from front matter
- Falls back to config `site.description` if page has no description
- Truncates to 160 characters max
- Falls back to page excerpt (first paragraph) if no description set
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>SEO-003</id>
<description>Generate Open Graph (og:) and Twitter Card meta tags</description>
<acceptance_criteria>
- `og:title` — from page title
- `og:description` — from page description
- `og:url` — full page URL
- `og:type` — "website" by default, "article" for posts
- `og:image` — from front matter `image` field or config `site.image`
- `og:locale` — from config `site.language` (format: `pt_BR`, underscore per OG spec, not hyphen)
- `twitter:card` — "summary_large_image" by default
- All of the above can be enabled/disabled via config
</acceptance_criteria>
</requirement>

<requirement priority="P0">
<id>SEO-004</id>
<description>Generate sitemap.xml</description>
<acceptance_criteria>
- Lists all HTML pages in the site
- Includes `<lastmod>` from page date or file mtime
- Includes `<changefreq>` (configurable per section, default "weekly")
- Includes `<priority>` (home: 1.0, posts: 0.8, other: 0.5)
- Proper XML formatting with UTF-8 encoding
- Excludes draft pages
- Can be disabled via config: `seo.sitemap: false`
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>SEO-005</id>
<description>Generate robots.txt</description>
<acceptance_criteria>
- Default allows all crawlers (User-agent: *, Disallow:)
- Includes Sitemap directive pointing to /sitemap.xml
- Can be overridden via public/robots.txt
- Can be customized via config
- Can be disabled via config: `seo.robots: false`
</acceptance_criteria>
</requirement>

<requirement priority="P2">
<id>SEO-006</id>
<description>Generate canonical URL tag for each page</description>
<acceptance_criteria>
- Adds `<link rel="canonical" href="{{ page.url }}">` to each page
- Uses full URL (config `site.url` + page path)
- Prevents duplicate content issues
- Can be disabled via front matter: `canonical: false`
</acceptance_criteria>
</requirement>

</functional>

<non_functional>
- <performance>Sitemap generation: under 50ms for 500 pages</performance>
- <validity>Generated sitemap.xml MUST pass W3C XML validation</validity>
- <compatibility>robots.txt and sitemap.xml follow Google Search Central guidelines</compatibility>
</non_functional>
</requirements>

<technical_specifications>
<stack>
- XML generation: template-based string building (no heavy XML library needed)
- Date formatting: JavaScript Intl or date-fns for ISO 8601 dates
- URL construction: native URL class with config `site.url`
</stack>

<sitemap_schema>
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-05-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/posts/hello/</loc>
    <lastmod>2026-05-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
</sitemap_schema>

<configuration>
seo: {
  sitemap: true,
  robots: true,
  canonical: true,
  openGraph: true,
  twitterCard: true,
  titleFormat: "{{ title }} | {{ site.title }}"
}
</configuration>
</technical_specifications>

<examples>

<example type="html_output">
<input>
Front matter:
title: My Blog Post
description: An interesting post about static sites
image: /assets/images/og-default.jpg
</input>
<expected_output>
<title>My Blog Post | My Kanso Site</title>
<meta name="description" content="An interesting post about static sites">
<meta property="og:title" content="My Blog Post">
<meta property="og:description" content="An interesting post about static sites">
<meta property="og:url" content="https://example.com/posts/my-blog-post/">
<meta property="og:type" content="article">
<meta property="og:image" content="https://example.com/assets/images/og-default.jpg">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://example.com/posts/my-blog-post/">
</expected_output>
</example>

</examples>

<constraints>
- sitemap.xml MUST include ALL pages (not just blog posts)
- URLs in sitemap MUST be absolute (with base URL from config)
- sitemap.xml MUST be valid XML — test with XML parser
- robots.txt MUST NOT disclose admin paths or hidden content
- Open Graph tags MUST only appear in `<head>` — never in body
</constraints>

<quality_standards>
- Unit test: sitemap generation with 100+ pages — verify XML validity
- Unit test: robots.txt generation (default, customized, disabled)
- Unit test: meta tag generation (title, description, OG, Twitter)
- Integration test: build project, verify HTML output contains correct meta tags
- Validation: generated sitemap.xml passes Google Search Console validation
</quality_standards>

<out_of_scope>
- Structured data / JSON-LD generation (post-MVP)
- Google Analytics / tag manager integration (post-MVP)
- SEO scoring or recommendations (post-MVP)
- Auto-generated alt text for images (post-MVP)
- hreflang tags for i18n (post-MVP)
</out_of_scope>
```

---

## PRP-08: RSS/Atom Feed Generation

```xml
<role>
You are an expert in web feed standards and content syndication. You specialize in generating RSS 2.0, Atom, and JSON Feed formats for static site generators, with deep knowledge of feed validation and content distribution best practices.
</role>

<product_overview>
<product_name>Kanso CLI — Feed Generator</product_name>
<problem>
Content creators need RSS/Atom feeds so readers can subscribe to their content via feed readers. Without automatic feed generation, authors must manually maintain feed XML — a tedious and error-prone process.
</problem>
<target_users>
Bloggers and content authors who want their audience to subscribe to updates via RSS/Atom readers, newsletters, or syndication platforms.
</target_users>
<value_proposition>
Automatic feed generation (RSS, Atom, or JSON Feed) from a configurable collection of posts, including title, summary, date, URL, and author — enabled with a single line of configuration.
</value_proposition>
</product_overview>

<requirements>
<functional>

<requirement priority="P1">
<id>FED-001</id>
<description>Generate RSS 2.0 feed XML at /rss.xml</description>
<acceptance_criteria>
- Uses standard RSS 2.0 XML format
- `<channel>` includes title, link, description, language, lastBuildDate
- Each `<item>` includes title, link, description, pubDate, guid, author
- Description contains the page excerpt or first paragraph (not full content, configurable)
- Items ordered by date descending
- Can be configured to show full content instead of excerpt
- Valid XML with proper encoding
</acceptance_criteria>
</requirement>

<requirement priority="P2">
<id>FED-002</id>
<description>Generate Atom feed XML at /atom.xml</description>
<acceptance_criteria>
- Uses Atom syndication format (RFC 4287)
- `<feed>` includes title, subtitle, id, updated, author, link
- Each `<entry>` includes title, id, updated, published, content, author, link
- Proper Atom namespace and XML structure
- Can be enabled alongside RSS or as standalone
</acceptance_criteria>
</requirement>

<requirement priority="P2">
<id>FED-003</id>
<description>Generate JSON Feed at /feed.json</description>
<acceptance_criteria>
- Follows JSON Feed v1.1 specification
- Includes version, title, home_page_url, feed_url, description, author
- Each item includes id, url, title, content_text, date_published
- Valid JSON with proper UTF-8 encoding
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>FED-004</id>
<description>Support configurable post collection for the feed</description>
<acceptance_criteria>
- Default: all pages with `layout: post` and a date
- Configurable via `feed.collection` to use specific content subdirectory
- Excludes draft pages
- Limits the number of items in the feed (configurable, default: 20)
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>FED-005</id>
<description>Enable/disable feed generation via config</description>
<acceptance_criteria>
- `feed.enabled: true` / `false` — master switch
- `feed.type: "rss"` or `"atom"` or `"json"` or `["rss", "atom"]` for multiple
- `feed.limit: 20` — max items
- `feed.fullContent: false` — excerpt vs full post content
- When disabled, no feed file is generated and no build time is spent
</acceptance_criteria>
</requirement>

</functional>

<non_functional>
- <performance>Feed generation: under 100ms for 500 items</performance>
- <validity>Generated feed MUST pass W3C Feed Validation Service</validity>
- <determinism>Same content always produces identical feed XML (byte-for-byte)</determinism>
</non_functional>
</requirements>

<technical_specifications>
<stack>
- XML generation: manual string-based with XML escaping (no heavy libraries)
- Date formatting: ISO 8601 for Atom, RFC 2822 for RSS
- Content extraction: excerpt from first paragraph or configurable length
</stack>

<rss_schema>
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>My Kanso Site</title>
    <link>https://example.com</link>
    <description>A clean static site</description>
    <language>pt-BR</language>
    <lastBuildDate>Sat, 30 May 2026 12:00:00 GMT</lastBuildDate>
    <atom:link href="https://example.com/rss.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>My First Post</title>
      <link>https://example.com/posts/my-first-post/</link>
      <description>Excerpt or first paragraph...</description>
      <pubDate>Sat, 30 May 2026 10:00:00 GMT</pubDate>
      <guid isPermaLink="true">https://example.com/posts/my-first-post/</guid>
      <author>author@example.com (Jane Doe)</author>
    </item>
  </channel>
</rss>
</rss_schema>

<configuration>
feed: {
  enabled: true,
  type: "rss",          // "rss" | "atom" | "json" | ["rss", "atom"]
  collection: "posts",   // Content collection to use
  limit: 20,             // Max items
  fullContent: false     // Include full post or just excerpt
}
</configuration>
</technical_specifications>

<examples>

<example type="feed_enabled">
<input>
Config:
feed: {
  enabled: true,
  type: "rss",
  limit: 10
}

Build command: kanso build
</input>
<expected_output>
Build output includes:
  Generated: dist/rss.xml (10 items, 3.2 KB)

Plus <link> tag in HTML <head>:
<link rel="alternate" type="application/rss+xml" title="My Kanso Site" href="/rss.xml">
</expected_output>
</example>

</examples>

<constraints>
- Feed MUST NOT include draft pages
- Feed URLs MUST be absolute (using config `site.url`)
- Feed MUST include a self-reference link (atom:link for RSS, self link for Atom)
- Feed files MUST be served with correct Content-Type (application/rss+xml, application/atom+xml, application/feed+json)
- HTML <head> MUST include alternate link to the feed when enabled
</constraints>

<quality_standards>
- Unit test: RSS 2.0 generation — validate against RSS schema
- Unit test: Atom generation — validate against Atom schema
- Unit test: JSON Feed generation — validate against JSON Feed schema
- Integration test: build with feed enabled, verify /rss.xml exists and is valid
- Feed validation: pass W3C Feed Validation Service for all 3 formats
</quality_standards>

<out_of_scope>
- Feed caching / CDN integration (post-MVP)
- Podcast RSS (Apple Podcasts specific tags) (post-MVP)
- Newsletter integration / Mailchimp export (post-MVP)
- Feed analytics / subscriber tracking (post-MVP)
</out_of_scope>
```

---

## PRP-09: Pagination

```xml
<role>
You are an expert static site generator engineer specializing in content pagination. You have deep experience with generating paginated listings, managing page state across numbered pages, and exposing navigation data to templates.
</role>

<product_overview>
<product_name>Kanso CLI — Pagination Module</product_name>
<problem>
Blogs and listing pages with many posts need pagination to split content across multiple pages for usability and performance. Without built-in pagination, developers must manually create page-2, page-3, etc. — a fragile and tedious approach.
</problem>
<target_users>
Bloggers and content authors with more posts than can be displayed on a single listing page.
</target_users>
<value_proposition>
Automatic pagination of content collections into numbered sub-pages (/page/2/, /page/3/, etc.) with configurable items-per-page, full template data access, and previous/next navigation support.
</value_proposition>
</product_overview>

<requirements>
<functional>

<requirement priority="P1">
<id>PAG-001</id>
<description>Paginate a content collection into multiple pages</description>
<acceptance_criteria>
- Splits a collection (e.g., all posts) into pages with configurable items per page
- Page 1 stays at the original URL (e.g., /posts/)
- Subsequent pages at /posts/page/2/, /posts/page/3/, etc.
- Pagination only applies to pages that explicitly opt in via front matter
- Non-paginated pages are left as-is
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>PAG-002</id>
<description>Expose pagination data to the template</description>
<acceptance_criteria>
- `pagination.currentPage` — current page number (1-based)
- `pagination.totalPages` — total number of pages
- `pagination.totalItems` — total number of items
- `pagination.perPage` — items per page
- `pagination.prev` — previous page URL (null if on first page)
- `pagination.next` — next page URL (null if on last page)
- `pagination.pages` — array of { url, number } for all pages
- `pagination.items` — items on the current page
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>PAG-003</id>
<description>Configure pagination settings via front matter</description>
<acceptance_criteria>
- Front matter on the collection index page:
  ```yaml
  pagination:
    collection: posts
    perPage: 5
  ```
- `perPage` defaults to config `pagination.perPage` (10)
- Can be overridden per-collection
- Pages with < perPage items generate no extra pages
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>PAG-004</id>
<description>Include SEO meta for paginated pages</description>
<acceptance_criteria>
- Page 2+ include `<link rel="prev" href="...">` in head
- Page 1+ include `<link rel="next" href="...">` in head (if more pages exist)
- Page 2+ include `<link rel="canonical" href="...">` pointing to page 1
- rel="prev"/"next" follow Google's pagination SEO guidelines
</acceptance_criteria>
</requirement>

</functional>

<non_functional>
- <performance>Paginate 1000 items per page: under 50ms total</performance>
- <scalability>Support up to 1000 paginated pages without performance degradation</scalability>
- <determinism>Same input always generates identical paginated output</determinism>
</non_functional>
</requirements>

<technical_specifications>
<stack>
- Native JavaScript array slicing for pagination
- URL construction via path.join and config site.url
- Front matter parsing already handled by the content pipeline
</stack>

<url_scheme>
/posts/              → page 1 (original URL, no /page/1/)
/posts/page/2/       → page 2
/posts/page/3/       → page 3
/posts/page/N/       → page N (only generated if N <= totalPages)
</url_scheme>

<template_data>
Available in templates:

pagination: {
  currentPage: 1,
  totalPages: 5,
  totalItems: 42,
  perPage: 10,
  prev: null,
  next: "/posts/page/2/",
  pages: [
    { url: "/posts/", number: 1 },
    { url: "/posts/page/2/", number: 2 },
    ...
  ],
  items: [
    { title: "Post 1", url: "...", date: "..." },
    { title: "Post 2", url: "...", date: "..." },
    ...
  ]
}
</template_data>

<configuration>
pagination: {
  perPage: 10          // Default items per page
}
</configuration>
</technical_specifications>

<examples>

<example type="paginated_listing">
<input>
File: content/posts.md
---
title: Blog
layout: page
pagination:
  collection: posts
  perPage: 5
---

Template for listing:

<h1>Blog (Page {{ pagination.currentPage }} of {{ pagination.totalPages }})</h1>

{{ for post in pagination.items }}
  <article>
    <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
    <time>{{ post.date | date("YYYY-MM-DD") }}</time>
  </article>
{{ end }}

{{ if pagination.prev }}
  <a href="{{ pagination.prev }}">Previous</a>
{{ end }}
{{ if pagination.next }}
  <a href="{{ pagination.next }}">Next</a>
{{ end }}
</input>
<expected_output>
With 12 posts at 5 per page:

Generated pages:
  /posts/             → posts 1-5, "Next" link
  /posts/page/2/      → posts 6-10, "Previous" + "Next" links
  /posts/page/3/      → posts 11-12, "Previous" link only

Each page includes rel="prev" and rel="next" as appropriate.
</expected_output>
</example>

</examples>

<constraints>
- MUST NOT generate /page/1/ — page 1 uses the original URL
- MUST NOT modify non-paginated pages
- MUST respect draft pages (excluded from pagination collections)
- Pagination URLs MUST use trailing slashes consistently
- MUST handle edge case where perPage >= totalItems (single page, no pagination)
</constraints>

<quality_standards>
- Unit test: paginate 1 item, 5 items, 50 items with perPage=10
- Unit test: edge case — 0 items in collection (no pages generated)
- Unit test: edge case — totalItems exactly equals perPage
- Integration test: build with pagination, verify all page files exist
- SEO test: verify rel="prev"/"next" and canonical links on paginated pages
</quality_standards>

<out_of_scope>
- Alphabetical pagination (A/B/C pages) (post-MVP)
- Tag/category pagination (post-MVP)
- Custom page URL patterns (post-MVP)
- AJAX-based infinite scroll (post-MVP)
</out_of_scope>
```

---

## PRP-10: Deploy (GitHub Pages & Netlify)

```xml
<role>
You are an expert DevOps and CI/CD engineer specializing in static site deployment. You have deep experience with GitHub Pages, Netlify, and other static hosting platforms, including authentication, Git-based deployments, and CI/CD pipeline integration.
</role>

<product_overview>
<product_name>Kanso CLI — Deploy Module</product_name>
<problem>
Deploying a static site should be a single command, but developers often need to manually configure Git remotes, push branches, or drag-and-drop to Netlify. This friction slows down the publish workflow.
</problem>
<target_users>
Developers who want to publish their static sites to GitHub Pages or Netlify with a single CLI command.
</target_users>
<value_proposition>
One-command deployment to GitHub Pages and Netlify with dry-run mode, credential validation, and clear error messages — no manual Git operations or web UI interaction required.
</value_proposition>
</product_overview>

<requirements>
<functional>

<requirement priority="P1">
<id>DEP-001</id>
<description>Deploy to GitHub Pages via Git push</description>
<acceptance_criteria>
- Runs `kanso build` first if `dist/` doesn't exist or is outdated
- Initializes a Git repo in `dist/` (if not already)
- Creates a `gh-pages` branch and commits the build output
- Pushes to the remote repository configured in `kanso.config.js`
- Supports custom domain via `public/CNAME` file
- Shows deploy URL on completion
- Exit code 0 on success, non-zero on failure
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>DEP-002</id>
<description>Deploy to Netlify via Netlify CLI integration or API</description>
<acceptance_criteria>
- Requires Netlify CLI (`netlify`) or uses Netlify API directly
- Deploys `dist/` to the configured Netlify site
- Supports Netlify deploy context (production vs. draft)
- Shows deploy URL (e.g., https://random-name.netlify.app or custom domain) on completion
- Reports deploy status (success/failure, deploy logs)
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>DEP-003</id>
<description>Support dry-run mode to preview what would be deployed</description>
<acceptance_criteria>
- `kanso deploy --dry-run` shows what files would be deployed
- Shows total number of files and total size
- Shows target deploy URL
- Does NOT actually push/publish anything
- Useful for CI validation before actual deployment
</acceptance_criteria>
</requirement>

<requirement priority="P1">
<id>DEP-004</id>
<description>Display clear instructions when credentials or configuration are missing</description>
<acceptance_criteria>
- If no Git remote configured: shows how to add one
- If GitHub token is missing: shows how to set up authentication
- If Netlify not configured: shows how to link a Netlify site
- If config missing `deploy.provider`: suggests available providers
- Never displays tokens or secrets in the terminal output
</acceptance_criteria>
</requirement>

</functional>

<non_functional>
- <security>NEVER log tokens, API keys, or secrets to stdout/stderr</security>
- <security>Support .env file for Netlify access token (read from environment variables)</security>
- <reliability>Build must complete successfully before deploy begins</reliability>
- <performance>Deploy time: depends on file count and network (no framework overhead)</performance>
</non_functional>
</requirements>

<technical_specifications>
<stack>
- GitHub Pages: simple-git or native `git` CLI for push to gh-pages branch
- Netlify: netlify-cli (official npm package, provides `netlify deploy` command) or Netlify REST API + personal access token
- Deploy orchestration: async pipeline with pre-deploy build check
</stack>

<deploy_interface>
kanso deploy [options]
  Options:
    --dry-run    Preview deployment without publishing
    --provider   Override deploy provider (github-pages | netlify)
    --message    Custom commit message for Git-based deploys
    --prod       Deploy to production (Netlify, default: draft)

Environment variables:
  GITHUB_TOKEN          — GitHub personal access token
  NETLIFY_AUTH_TOKEN    — Netlify personal access token
</deploy_interface>

<configuration>
deploy: {
  provider: "github-pages",  // "github-pages" | "netlify"
  repo: "username/repo",     // For GitHub Pages
  branch: "gh-pages",        // For GitHub Pages (default)
  siteId: "xxx-xxx",         // For Netlify
  buildBeforeDeploy: true
}
</configuration>

<github_pages_flow>
1. Run `kanso build` (if --build or dist/ missing)
2. Init Git in dist/ (if not already)
3. Create gh-pages branch (or switch to it)
4. Add all files in dist/
5. Commit with message "[kanso] Deploy: YYYY-MM-DD HH:mm"
6. Push to origin gh-pages (using token from env or SSH)
7. Print: "Deployed to: https://username.github.io/repo/"
</github_pages_flow>

<netlify_flow>
1. Run `kanso build` (if --build or dist/ missing)
2. Check NETLIFY_AUTH_TOKEN is set
3. Call Netlify API to deploy dist/
4. Print: "Deployed to: https://site-name.netlify.app/"
</netlify_flow>
</technical_specifications>

<examples>

<example type="deploy_github">
<input>
Config:
deploy: {
  provider: "github-pages",
  repo: "johndoe/my-site"
}

Command: kanso deploy
</input>
<expected_output>
✔ Build complete (12 pages, 1.2 MB)
✔ Preparing dist/ for GitHub Pages...
✔ Committed to gh-pages branch
✔ Pushed to origin/gh-pages

Deployed to: https://johndoe.github.io/my-site/
</expected_output>
</example>

<example type="deploy_dry_run">
<input>
kanso deploy --dry-run
</input>
<expected_output>
Dry run — no files will be published

Target:    GitHub Pages (johndoe/my-site)
Build:     12 pages, 1.2 MB
Files:     35 files to deploy
URL:       https://johndoe.github.io/my-site/

Run without --dry-run to deploy.
</expected_output>
</example>

<example type="missing_config">
<input>
kanso deploy
(no deploy config in kanso.config.js)
</input>
<expected_output>
✖ Deploy configuration not found.

To deploy, add to kanso.config.js:
  deploy: {
    provider: "github-pages",  // or "netlify"
    repo: "your-username/your-repo"
  }

Or use environment variables:
  GITHUB_TOKEN=...  (for GitHub Pages)
  NETLIFY_AUTH_TOKEN=...  (for Netlify)
</expected_output>
</example>

</examples>

<constraints>
- MUST NOT expose tokens, API keys, or secrets in terminal output
- MUST NOT store or cache credentials in project files
- GitHub Pages deploy MUST NOT push the full project — only dist/ contents to gh-pages branch
- Netlify deploy MUST support Netlify's deploy contexts (production vs. branch deploy)
- Build MUST complete successfully before deploy starts
- Deploy MUST fail gracefully if authentication fails (with helpful message)
- The dist/ directory MUST be treated as if it could be regenerated — never commit to main branch
</constraints>

<quality_standards>
- Unit test: deploy config validation (missing, partial, complete)
- Integration test: dry-run produces correct output without side effects
- Security test: verify no secrets leaked in logs during simulated deploy failure
- Integration test (if credentials available): GitHub Pages deploy end-to-end
- Integration test (if credentials available): Netlify deploy end-to-end
</quality_standards>

<out_of_scope>
- Vercel deploy — post-MVP
- Cloudflare Pages — post-MVP
- S3/CloudFront — post-MVP
- FTP/SFTP deploy — post-MVP
- Multi-environment deploy (staging vs production) — post-MVP
- Rollback functionality — post-MVP
- CI/CD pipeline generation — post-MVP
</out_of_scope>
```
