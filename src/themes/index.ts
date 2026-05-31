import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, rmdirSync } from "fs";
import { join } from "path";
import { success, error, info, warn } from "../utils/logger.js";

export interface ThemeManifest {
  name: string;
  description: string;
  layouts: { name: string; content: string }[];
  assets: { path: string; content: string }[];
}

export function getBundledThemes(): Record<string, ThemeManifest> {
  return {
    blog: blogTheme(),
    docs: docsTheme(),
    academic: academicTheme(),
    "research-group": researchGroupTheme(),
  };
}

export function themeList(): void {
  const themes = getBundledThemes();
  console.log("\nAvailable themes:\n");
  for (const [name, theme] of Object.entries(themes)) {
    console.log(`  ${name}`);
    console.log(`    ${theme.description}\n`);
  }
}

export function themeAdd(
  projectRoot: string,
  themeName: string,
  options: { force?: boolean } = {}
): void {
  const themes = getBundledThemes();
  const theme = themes[themeName];

  if (!theme) {
    error(`Theme "${themeName}" not found.`);
    info(`Available themes: ${Object.keys(themes).join(", ")}`);
    process.exit(1);
  }

  const layoutsDir = join(projectRoot, "layouts");
  mkdirSync(layoutsDir, { recursive: true });

  for (const layout of theme.layouts) {
    const filePath = join(layoutsDir, layout.name);
    if (existsSync(filePath) && !options.force) {
      info(`Layout ${layout.name} already exists (skipped)`);
      continue;
    }
    writeFileSync(filePath, layout.content, "utf-8");
    success(`Created layouts/${layout.name}`);
  }

  for (const asset of theme.assets) {
    const filePath = join(projectRoot, asset.path);
    const dir = filePath.substring(0, filePath.lastIndexOf("/"));
    mkdirSync(dir, { recursive: true });

    if (existsSync(filePath) && !options.force) {
      info(`Asset ${asset.path} already exists (skipped)`);
      continue;
    }
    writeFileSync(filePath, asset.content, "utf-8");
    success(`Created ${asset.path}`);
  }

  console.log("");
  success(`Theme "${themeName}" installed!`);
}

export function themeRemove(
  projectRoot: string,
  themeName: string,
  options: { force?: boolean } = {}
): void {
  const themes = getBundledThemes();
  const theme = themes[themeName];

  if (!theme) {
    error(`Theme "${themeName}" not found.`);
    info(`Available themes: ${Object.keys(themes).join(", ")}`);
    process.exit(1);
  }

  let removed = 0;
  let skipped = 0;

  for (const layout of theme.layouts) {
    const filePath = join(projectRoot, "layouts", layout.name);
    if (!existsSync(filePath)) continue;

    const currentContent = readFileSync(filePath, "utf-8");
    const isModified = currentContent.trim() !== layout.content.trim();

    if (isModified && !options.force) {
      warn(`layouts/${layout.name} has been modified (use --force to remove)`);
      skipped++;
      continue;
    }

    unlinkSync(filePath);
    success(`Removed layouts/${layout.name}`);
    removed++;
  }

  for (const asset of theme.assets) {
    const filePath = join(projectRoot, asset.path);
    if (!existsSync(filePath)) continue;

    const currentContent = readFileSync(filePath, "utf-8");
    const isModified = currentContent.trim() !== asset.content.trim();

    if (isModified && !options.force) {
      warn(`${asset.path} has been modified (use --force to remove)`);
      skipped++;
      continue;
    }

    unlinkSync(filePath);
    success(`Removed ${asset.path}`);
    removed++;
  }

  console.log("");
  if (removed > 0 && skipped === 0) {
    success(`Theme "${themeName}" removed (${removed} files).`);
  } else if (removed > 0) {
    warn(`Removed ${removed} file(s), skipped ${skipped} modified file(s).`);
  } else if (skipped > 0) {
    info(`No files removed. ${skipped} file(s) were modified — use --force to override.`);
  } else {
    info(`No files found for theme "${themeName}".`);
  }
}

export function themeInfo(themeName: string): void {
  const themes = getBundledThemes();
  const theme = themes[themeName];

  if (!theme) {
    error(`Theme "${themeName}" not found.`);
    info(`Available themes: ${Object.keys(themes).join(", ")}`);
    process.exit(1);
  }

  console.log(`\n${theme.name} — ${theme.description}\n`);
  console.log("Layouts:");
  for (const layout of theme.layouts) {
    console.log(`  layouts/${layout.name} (${layout.content.length} bytes)`);
  }
  console.log("\nAssets:");
  for (const asset of theme.assets) {
    console.log(`  ${asset.path} (${asset.content.length} bytes)`);
  }
  console.log("");
}

export function themeStatus(projectRoot: string): void {
  const themes = getBundledThemes();
  console.log("\nInstalled themes:\n");

  let anyInstalled = false;

  for (const [name, theme] of Object.entries(themes)) {
    const allFiles = [
      ...theme.layouts.map((l) => ({
        path: join(projectRoot, "layouts", l.name),
        expected: l.content.trim(),
        label: `layouts/${l.name}`,
      })),
      ...theme.assets.map((a) => ({
        path: join(projectRoot, a.path),
        expected: a.content.trim(),
        label: a.path,
      })),
    ];

    const present = allFiles.filter((f) => existsSync(f.path));

    if (present.length === 0) continue;

    anyInstalled = true;
    const total = allFiles.length;
    const modified = present.filter(
      (f) => readFileSync(f.path, "utf-8").trim() !== f.expected
    );
    const pristine = present.length - modified.length;

    console.log(`  ${name}  — ${pristine} original, ${modified.length} modified (${present.length}/${total} files present)`);
  }

  if (!anyInstalled) {
    console.log("  No themes installed. Use `kanso theme add <name>` to install one.\n");
  }

  console.log("");
}

interface LayoutFile {
  name: string;
  content: string;
}

function blogTheme(): ThemeManifest {
  return {
    name: "blog",
    description: "Clean blog theme with dark mode",
    layouts: [
      { name: "base.html", content: BLOG_BASE },
      { name: "post.html", content: BLOG_POST },
      { name: "page.html", content: BLOG_PAGE },
    ],
    assets: [
      { path: "assets/css/style.css", content: BLOG_CSS },
      { path: "assets/js/theme.js", content: DARK_MODE_JS },
    ],
  };
}

function docsTheme(): ThemeManifest {
  return {
    name: "docs",
    description: "Technical documentation theme with sidebar",
    layouts: [
      { name: "base.html", content: DOCS_BASE },
      { name: "post.html", content: DOCS_POST },
      { name: "page.html", content: DOCS_PAGE },
    ],
    assets: [
      { path: "assets/css/style.css", content: DOCS_CSS },
      { path: "assets/js/theme.js", content: DARK_MODE_JS },
    ],
  };
}

function academicTheme(): ThemeManifest {
  return {
    name: "academic",
    description: "Academic theme for teaching, research and extension activities",
    layouts: [
      { name: "base.html", content: ACADEMIC_BASE },
      { name: "post.html", content: ACADEMIC_POST },
      { name: "page.html", content: ACADEMIC_PAGE },
    ],
    assets: [
      { path: "assets/css/style.css", content: ACADEMIC_CSS },
      { path: "assets/js/theme.js", content: DARK_MODE_JS },
    ],
  };
}

function researchGroupTheme(): ThemeManifest {
  return {
    name: "research-group",
    description: "Theme for research group dissemination and projects",
    layouts: [
      { name: "base.html", content: RESEARCH_BASE },
      { name: "post.html", content: RESEARCH_POST },
      { name: "page.html", content: RESEARCH_PAGE },
    ],
    assets: [
      { path: "assets/css/style.css", content: RESEARCH_CSS },
      { path: "assets/js/theme.js", content: DARK_MODE_JS },
    ],
  };
}

// --- Dark mode JS (shared) ---

const DARK_MODE_JS = `
(function() {
  var saved = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  window.toggleTheme = function() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };
})();
`;

// --- Blog Theme ---

const BLOG_BASE = `<!DOCTYPE html>
<html lang="{{ site.language }}" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ title }} | {{ site.title }}{% endblock %}</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a href="/" class="site-title">{{ site.title }}</a>
      <nav>
        <a href="/">Home</a>
        <a href="/posts/">Posts</a>
        <button onclick="toggleTheme()" class="theme-toggle" aria-label="Toggle theme">◐</button>
      </nav>
    </div>
  </header>
  <main class="container">
    {% block content %}{{ content | safe }}{% endblock %}
  </main>
  <footer class="site-footer">
    <div class="container">
      <p>Built with <a href="https://github.com/walternagai/kanso">Kanso CLI</a></p>
    </div>
  </footer>
  <script src="/assets/js/theme.js"></script>
</body>
</html>`;

const BLOG_POST = `{% extends "base.html" %}
{% block title %}{{ title }} | {{ site.title }}{% endblock %}
{% block content %}
<article class="post">
  <h1>{{ title }}</h1>
  <time>{{ date }}</time>
  {% if tags %}<div class="tags">{% for tag in tags %}<span class="tag">{{ tag }}</span>{% endfor %}</div>{% endif %}
  <div class="post-content">{{ content | safe }}</div>
</article>
{% endblock %}`;

const BLOG_PAGE = `{% extends "base.html" %}
{% block content %}
<div class="page">
  <h1>{{ title }}</h1>
  {{ content | safe }}
</div>
{% endblock %}`;

const BLOG_CSS = `:root {
  --bg: #fff; --bg-secondary: #f8f9fa; --text: #1a1a2e; --text-secondary: #666;
  --border: #e0e0e0; --accent: #2563eb; --accent-hover: #1d4ed8;
  --code-bg: #f1f3f5; --tag-bg: #e8f0fe; --tag-text: #1a73e8;
}
[data-theme="dark"] {
  --bg: #1a1a2e; --bg-secondary: #16213e; --text: #e0e0e0; --text-secondary: #a0a0a0;
  --border: #333; --accent: #60a5fa; --accent-hover: #93c5fd;
  --code-bg: #16213e; --tag-bg: #1e3a5f; --tag-text: #93c5fd;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.7; }
.container { max-width: 42rem; margin: 0 auto; padding: 0 1.5rem; }
.site-header { border-bottom: 1px solid var(--border); padding: 1rem 0; }
.site-header .container { display: flex; justify-content: space-between; align-items: center; }
.site-title { font-weight: 700; font-size: 1.2rem; text-decoration: none; color: var(--text); }
nav { display: flex; gap: 1rem; align-items: center; }
nav a { text-decoration: none; color: var(--text-secondary); }
nav a:hover { color: var(--accent); }
.theme-toggle { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text); }
main { padding: 2rem 0; }
.post h1 { font-size: 2rem; margin-bottom: 0.5rem; }
.post time { color: var(--text-secondary); }
.tags { margin-top: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tag { background: var(--tag-bg); color: var(--tag-text); padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.85rem; }
.post-content { margin-top: 1.5rem; }
.post-content h2 { margin-top: 2rem; margin-bottom: 0.5rem; }
.post-content p { margin-bottom: 1rem; }
.post-content code { background: var(--code-bg); padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
.post-content pre { background: var(--code-bg); padding: 1rem; border-radius: 6px; overflow-x: auto; margin-bottom: 1rem; }
.post-content pre code { background: none; padding: 0; }
.post-content blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; color: var(--text-secondary); margin-bottom: 1rem; }
.post-content a { color: var(--accent); }
.post-content ul, .post-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
.site-footer { border-top: 1px solid var(--border); padding: 1.5rem 0; color: var(--text-secondary); font-size: 0.9rem; }
.site-footer a { color: var(--accent); }
.page h1 { font-size: 2rem; margin-bottom: 1rem; }
`;

// --- Docs Theme ---

const DOCS_BASE = `<!DOCTYPE html>
<html lang="{{ site.language }}" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ title }} | {{ site.title }}{% endblock %}</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <div class="docs-layout">
    <aside class="sidebar">
      <a href="/" class="sidebar-title">{{ site.title }}</a>
      <nav class="sidebar-nav">
        <a href="/">Home</a>
        <a href="/posts/">Posts</a>
        <button onclick="toggleTheme()" class="theme-toggle">◐</button>
      </nav>
    </aside>
    <main class="docs-content">
      {% block content %}{{ content | safe }}{% endblock %}
    </main>
  </div>
  <script src="/assets/js/theme.js"></script>
</body>
</html>`;

const DOCS_POST = `{% extends "base.html" %}
{% block title %}{{ title }} | {{ site.title }}{% endblock %}
{% block content %}
<article class="doc">
  <h1>{{ title }}</h1>
  <time>{{ date }}</time>
  <div class="doc-content">{{ content | safe }}</div>
</article>
{% endblock %}`;

const DOCS_PAGE = `{% extends "base.html" %}
{% block content %}
<div class="doc">
  <h1>{{ title }}</h1>
  {{ content | safe }}
</div>
{% endblock %}`;

const DOCS_CSS = `:root {
  --bg: #fff; --bg-sidebar: #f8f9fa; --text: #1a1a2e; --text-secondary: #666;
  --border: #e0e0e0; --accent: #2563eb; --accent-hover: #1d4ed8; --code-bg: #f1f3f5;
}
[data-theme="dark"] {
  --bg: #1a1a2e; --bg-sidebar: #16213e; --text: #e0e0e0; --text-secondary: #a0a0a0;
  --border: #333; --accent: #60a5fa; --accent-hover: #93c5fd; --code-bg: #16213e;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.7; }
.docs-layout { display: flex; min-height: 100vh; }
.sidebar { width: 250px; background: var(--bg-sidebar); border-right: 1px solid var(--border); padding: 1.5rem; position: fixed; height: 100vh; overflow-y: auto; }
.sidebar-title { font-weight: 700; font-size: 1.1rem; text-decoration: none; color: var(--text); display: block; margin-bottom: 1.5rem; }
.sidebar-nav { display: flex; flex-direction: column; gap: 0.75rem; }
.sidebar-nav a { text-decoration: none; color: var(--text-secondary); }
.sidebar-nav a:hover { color: var(--accent); }
.theme-toggle { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text); text-align: left; }
.docs-content { margin-left: 250px; flex: 1; max-width: 48rem; padding: 2rem 3rem; }
.doc h1 { font-size: 2rem; margin-bottom: 0.5rem; }
.doc time { color: var(--text-secondary); }
.doc-content { margin-top: 1.5rem; }
.doc-content h2 { margin-top: 2rem; margin-bottom: 0.5rem; }
.doc-content p { margin-bottom: 1rem; }
.doc-content code { background: var(--code-bg); padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
.doc-content pre { background: var(--code-bg); padding: 1rem; border-radius: 6px; overflow-x: auto; margin-bottom: 1rem; }
.doc-content pre code { background: none; padding: 0; }
.doc-content blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; color: var(--text-secondary); margin-bottom: 1rem; }
.doc-content a { color: var(--accent); }
.doc-content ul, .doc-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
`;

// --- Academic Theme ---

const ACADEMIC_BASE = `<!DOCTYPE html>
<html lang="{{ site.language }}" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ title }} | {{ site.title }}{% endblock %}</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <header class="academic-header">
    <div class="container">
      <div class="header-top">
        <div>
          <a href="/" class="site-title">{{ site.title }}</a>
          {% if site.subtitle %}<p class="site-subtitle">{{ site.subtitle }}</p>{% endif %}
        </div>
        <button onclick="toggleTheme()" class="theme-toggle" aria-label="Toggle theme">◐</button>
      </div>
      <nav class="main-nav">
        <a href="/">Início</a>
        <a href="/ensino/">Ensino</a>
        <a href="/pesquisa/">Pesquisa</a>
        <a href="/extensao/">Extensão</a>
        <a href="/posts/">Notícias</a>
      </nav>
    </div>
  </header>
  <main class="container academic-main">
    {% block content %}{{ content | safe }}{% endblock %}
  </main>
  <footer class="academic-footer">
    <div class="container">
      <p>{{ site.title }}</p>
      <p class="footer-links">
        {% if site.lattes %}<a href="{{ site.lattes }}">Lattes</a>{% endif %}
        {% if site.orcid %}<a href="{{ site.orcid }}">ORCID</a>{% endif %}
        {% if site.email %}<a href="mailto:{{ site.email }}">Email</a>{% endif %}
      </p>
    </div>
  </footer>
  <script src="/assets/js/theme.js"></script>
</body>
</html>`;

const ACADEMIC_POST = `{% extends "base.html" %}
{% block title %}{{ title }} | {{ site.title }}{% endblock %}
{% block content %}
<article class="academic-post">
  <h1>{{ title }}</h1>
  <div class="post-meta">
    <time>{{ date }}</time>
    {% if category %}<span class="category">{{ category }}</span>{% endif %}
  </div>
  {% if tags %}<div class="tags">{% for tag in tags %}<span class="tag">{{ tag }}</span>{% endfor %}</div>{% endif %}
  <div class="post-content">{{ content | safe }}</div>
</article>
{% endblock %}`;

const ACADEMIC_PAGE = `{% extends "base.html" %}
{% block content %}
<div class="academic-page">
  <h1>{{ title }}</h1>
  {{ content | safe }}
</div>
{% endblock %}`;

const ACADEMIC_CSS = `:root {
  --bg: #fff; --bg-secondary: #f5f5f5; --text: #1a1a2e; --text-secondary: #555;
  --border: #ddd; --accent: #1a5276; --accent-hover: #1a3c5e;
  --code-bg: #f0f0f0; --tag-bg: #e8f4f8; --tag-text: #1a5276;
  --header-bg: #1a5276; --header-text: #fff;
}
[data-theme="dark"] {
  --bg: #0d1117; --bg-secondary: #161b22; --text: #c9d1d9; --text-secondary: #8b949e;
  --border: #30363d; --accent: #58a6ff; --accent-hover: #79c0ff;
  --code-bg: #161b22; --tag-bg: #1f3a5f; --tag-text: #58a6ff;
  --header-bg: #161b22; --header-text: #c9d1d9;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Georgia', serif; background: var(--bg); color: var(--text); line-height: 1.8; }
.container { max-width: 50rem; margin: 0 auto; padding: 0 1.5rem; }
.academic-header { background: var(--header-bg); color: var(--header-text); padding: 1.5rem 0; }
.academic-header a { color: var(--header-text); text-decoration: none; }
.header-top { display: flex; justify-content: space-between; align-items: flex-start; }
.site-title { font-size: 1.5rem; font-weight: 700; }
.site-subtitle { font-size: 0.9rem; opacity: 0.8; margin-top: 0.25rem; }
.theme-toggle { background: none; border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; font-size: 1rem; cursor: pointer; color: var(--header-text); padding: 0.25rem 0.5rem; }
.main-nav { display: flex; gap: 1.5rem; margin-top: 1rem; flex-wrap: wrap; }
.main-nav a { font-family: system-ui, sans-serif; font-size: 0.9rem; opacity: 0.9; }
.main-nav a:hover { opacity: 1; }
.academic-main { padding: 2.5rem 0; }
.academic-post h1 { font-size: 2rem; margin-bottom: 0.5rem; }
.post-meta { color: var(--text-secondary); display: flex; gap: 1rem; align-items: center; }
.category { background: var(--tag-bg); color: var(--tag-text); padding: 0.1rem 0.5rem; border-radius: 3px; font-size: 0.85rem; font-family: system-ui, sans-serif; }
.tags { margin-top: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tag { background: var(--tag-bg); color: var(--tag-text); padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.85rem; font-family: system-ui, sans-serif; }
.post-content, .academic-page { margin-top: 1.5rem; }
.post-content h2, .academic-page h2 { margin-top: 2rem; margin-bottom: 0.5rem; font-family: system-ui, sans-serif; }
.post-content p, .academic-page p { margin-bottom: 1rem; }
.post-content code, .academic-page code { background: var(--code-bg); padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
.post-content pre, .academic-page pre { background: var(--code-bg); padding: 1rem; border-radius: 6px; overflow-x: auto; margin-bottom: 1rem; font-family: monospace; }
.post-content blockquote, .academic-page blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; color: var(--text-secondary); margin-bottom: 1rem; font-style: italic; }
.post-content a, .academic-page a { color: var(--accent); }
.post-content ul, .post-content ol, .academic-page ul, .academic-page ol { margin-bottom: 1rem; padding-left: 1.5rem; }
.academic-footer { background: var(--bg-secondary); border-top: 1px solid var(--border); padding: 1.5rem 0; font-size: 0.9rem; }
.footer-links { margin-top: 0.5rem; display: flex; gap: 1rem; font-family: system-ui, sans-serif; }
.academic-footer a { color: var(--accent); text-decoration: none; }
`;

// --- Research Group Theme ---

const RESEARCH_BASE = `<!DOCTYPE html>
<html lang="{{ site.language }}" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ title }} | {{ site.title }}{% endblock %}</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <header class="research-header">
    <div class="container">
      <div class="header-top">
        <div>
          <a href="/" class="site-title">{{ site.title }}</a>
          {% if site.description %}<p class="site-description">{{ site.description }}</p>{% endif %}
        </div>
        <button onclick="toggleTheme()" class="theme-toggle" aria-label="Toggle theme">◐</button>
      </div>
      <nav class="main-nav">
        <a href="/">Início</a>
        <a href="/projetos/">Projetos</a>
        <a href="/publicacoes/">Publicações</a>
        <a href="/equipe/">Equipe</a>
        <a href="/posts/">Notícias</a>
      </nav>
    </div>
  </header>
  <main class="container research-main">
    {% block content %}{{ content | safe }}{% endblock %}
  </main>
  <footer class="research-footer">
    <div class="container">
      <p>{{ site.title }}</p>
      {% if site.funding %}<p class="funding">{{ site.funding }}</p>{% endif %}
    </div>
  </footer>
  <script src="/assets/js/theme.js"></script>
</body>
</html>`;

const RESEARCH_POST = `{% extends "base.html" %}
{% block title %}{{ title }} | {{ site.title }}{% endblock %}
{% block content %}
<article class="research-post">
  <h1>{{ title }}</h1>
  <div class="post-meta">
    <time>{{ date }}</time>
    {% if category %}<span class="category">{{ category }}</span>{% endif %}
  </div>
  {% if tags %}<div class="tags">{% for tag in tags %}<span class="tag">{{ tag }}</span>{% endfor %}</div>{% endif %}
  <div class="post-content">{{ content | safe }}</div>
</article>
{% endblock %}`;

const RESEARCH_PAGE = `{% extends "base.html" %}
{% block content %}
<div class="research-page">
  <h1>{{ title }}</h1>
  {{ content | safe }}
</div>
{% endblock %}`;

const RESEARCH_CSS = `:root {
  --bg: #fff; --bg-secondary: #f8fafb; --text: #1a1a2e; --text-secondary: #555;
  --border: #e2e8f0; --accent: #0f766e; --accent-hover: #0d5f59;
  --code-bg: #f1f5f9; --tag-bg: #e6fffa; --tag-text: #0f766e;
  --header-bg: #0f766e; --header-text: #fff;
}
[data-theme="dark"] {
  --bg: #0f172a; --bg-secondary: #1e293b; --text: #e2e8f0; --text-secondary: #94a3b8;
  --border: #334155; --accent: #2dd4bf; --accent-hover: #5eead4;
  --code-bg: #1e293b; --tag-bg: #134e4a; --tag-text: #2dd4bf;
  --header-bg: #1e293b; --header-text: #e2e8f0;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.7; }
.container { max-width: 54rem; margin: 0 auto; padding: 0 1.5rem; }
.research-header { background: var(--header-bg); color: var(--header-text); padding: 1.5rem 0; }
.research-header a { color: var(--header-text); text-decoration: none; }
.header-top { display: flex; justify-content: space-between; align-items: flex-start; }
.site-title { font-size: 1.4rem; font-weight: 700; }
.site-description { font-size: 0.85rem; opacity: 0.85; margin-top: 0.25rem; }
.theme-toggle { background: none; border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; font-size: 1rem; cursor: pointer; color: var(--header-text); padding: 0.25rem 0.5rem; }
.main-nav { display: flex; gap: 1.5rem; margin-top: 1rem; flex-wrap: wrap; }
.main-nav a { font-size: 0.9rem; opacity: 0.9; }
.main-nav a:hover { opacity: 1; }
.research-main { padding: 2.5rem 0; }
.research-post h1, .research-page h1 { font-size: 2rem; margin-bottom: 0.5rem; }
.post-meta { color: var(--text-secondary); display: flex; gap: 1rem; align-items: center; }
.category { background: var(--tag-bg); color: var(--tag-text); padding: 0.1rem 0.5rem; border-radius: 3px; font-size: 0.85rem; }
.tags { margin-top: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tag { background: var(--tag-bg); color: var(--tag-text); padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.85rem; }
.post-content, .research-page { margin-top: 1.5rem; }
.post-content h2, .research-page h2 { margin-top: 2rem; margin-bottom: 0.5rem; }
.post-content p, .research-page p { margin-bottom: 1rem; }
.post-content code, .research-page code { background: var(--code-bg); padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
.post-content pre, .research-page pre { background: var(--code-bg); padding: 1rem; border-radius: 6px; overflow-x: auto; margin-bottom: 1rem; }
.post-content blockquote, .research-page blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; color: var(--text-secondary); margin-bottom: 1rem; }
.post-content a, .research-page a { color: var(--accent); }
.post-content ul, .post-content ol, .research-page ul, .research-page ol { margin-bottom: 1rem; padding-left: 1.5rem; }
.research-footer { background: var(--bg-secondary); border-top: 1px solid var(--border); padding: 1.5rem 0; font-size: 0.9rem; }
.funding { margin-top: 0.25rem; font-size: 0.8rem; color: var(--text-secondary); }
`;
