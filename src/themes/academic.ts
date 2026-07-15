import { ThemeManifest } from "./types.js";
import { DARK_MODE_JS } from "./dark-mode.js";

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

export function academicTheme(): ThemeManifest {
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
