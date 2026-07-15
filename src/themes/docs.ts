import { ThemeManifest } from "./types.js";
import { DARK_MODE_JS } from "./dark-mode.js";

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

export function docsTheme(): ThemeManifest {
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
