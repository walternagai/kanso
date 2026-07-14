import { ThemeManifest } from "./types.js";
import { DARK_MODE_JS } from "./dark-mode.js";

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

export function researchGroupTheme(): ThemeManifest {
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
