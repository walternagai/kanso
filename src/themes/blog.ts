import { ThemeManifest } from "./types.js";
import { DARK_MODE_JS } from "./dark-mode.js";

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

export function blogTheme(): ThemeManifest {
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
