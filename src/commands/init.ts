import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { success, error, heading, info } from "../utils/logger.js";

interface InitOptions {
  force?: boolean;
}

const TEMPLATES = {
  "kanso.config.js": `// Kanso configuration — edit values, keep the structure.
// Docs: https://github.com/walternagai/kanso
export default {
  // Site metadata, used in templates and SEO files
  site: {
    title: "My Kanso Site",
    url: "https://example.com", // canonical URL, used in sitemap/feed
    language: "en"
  },
  // Where your Markdown content lives
  content: {
    dir: "content"
  },
  // Build output directory (deleted on each build)
  output: {
    dir: "dist"
  },
  markdown: {
    syntaxHighlight: true, // code blocks highlighted with highlight.js
    callouts: true // > [!NOTE] style callouts
  },
  seo: {
    sitemap: true, // generate dist/sitemap.xml
    robots: true // generate dist/robots.txt
  },
  // RSS/Atom/JSON feed of your posts (content/posts/)
  feed: {
    enabled: false, // set true to generate the feed
    type: "rss" // "rss" | "atom" | "json"
  },
  pagination: {
    perPage: 10 // used with front matter "pagination: { collection: posts }"
  },
  deploy: {
    provider: "github-pages" // "github-pages" | "netlify"
  }
}
`,
  "package.json": (name: string) => `{
  "name": "${name}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "kanso dev",
    "build": "kanso build",
    "serve": "kanso serve",
    "clean": "kanso clean",
    "deploy": "kanso deploy"
  }
}
`,
  ".gitignore": `node_modules/
dist/
.DS_Store
.env
`,
  "content/index.md": `---
title: Welcome
layout: home
---

# Welcome to My Site

This is a page built with **Kanso CLI**.
`,
  "content/posts/hello-world.md": `---
title: Hello World
date: 2026-05-30
layout: post
tags: [web, static-site]
description: My first post using Kanso CLI
---

## Hello World!

This is my first post built with **Kanso CLI**.

It's simple, fast, and portable.
`,
  "layouts/base.html": `<!DOCTYPE html>
<html lang="{{ site.language }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }} | {{ site.title }}</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  {% include "header.html" %}
  <main>
    {% block content %}{{ content | safe }}{% endblock %}
  </main>
  {% include "footer.html" %}
</body>
</html>
`,
  "layouts/post.html": `{% extends "base.html" %}

{% block content %}
<article>
  <h1>{{ title }}</h1>
  <time>{{ date }}</time>
  {{ content | safe }}
</article>
{% endblock %}
`,
  "layouts/home.html": `{% extends "base.html" %}

{% block content %}
{{ content | safe }}

{% if collections.posts and collections.posts.length > 0 %}
<section class="posts">
  <h2>Posts</h2>
  <ul>
    {% for post in collections.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.frontMatter.title }}</a>
      {% if post.frontMatter.date %}<time>{{ post.frontMatter.date | formatDate('YYYY-MM-DD') }}</time>{% endif %}
    </li>
    {% endfor %}
  </ul>
</section>
{% endif %}
{% endblock %}
`,
  "components/header.html": `<header>
  <nav>
    <a href="/">{{ site.title }}</a>
  </nav>
</header>
`,
  "components/footer.html": `<footer>
  <p>Built with Kanso CLI</p>
</footer>
`,
  "assets/css/style.css": `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem;
}

header {
  margin-bottom: 2rem;
}

footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  color: #666;
}

article time {
  color: #666;
}

.posts ul {
  list-style: none;
  padding: 0;
}

.posts li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
}

.posts time {
  color: #666;
}
`,
  "assets/js/main.js": `// Kanso - your JavaScript here
`,
  "README.md": (name: string) => `# ${name}

A static site built with [Kanso](https://github.com/walternagai/kanso).

## Write

- **Posts** live in \`content/posts/\` — create one with \`kanso post "My Post"\`
  (or \`kanso post "My Post" --draft\` to keep it hidden until finished).
- **Pages** live in \`content/\` — create one with \`kanso page "About"\`.
- The home page lists your posts via \`layouts/home.html\`.

## Preview

\`\`\`
kanso dev
\`\`\`

Hot-reloads at http://localhost:3000 while you edit content, layouts and assets.

## Build

\`\`\`
kanso build
\`\`\`

Generates the final site in \`dist/\`. Run \`kanso serve\` to preview the built
output, and \`kanso list\` to see all your pages and posts.

## Deploy

\`\`\`
kanso deploy --dry-run   # preview what would be published
kanso deploy             # publish (provider configured in kanso.config.js)
\`\`\`

## Configure

Everything lives in \`kanso.config.js\` — site title/URL, feeds, SEO,
pagination and the deploy provider. Each key is commented.
`,
  "public/.gitkeep": "",
} as const;

function scaffoldProject(targetDir: string, projectName: string, force: boolean): void {
  mkdirSync(targetDir, { recursive: true });

  // User data files are never overwritten, even with --force
  const USER_FILES = ["kanso.config.js", "package.json", "content/"];

  for (const [filePath, content] of Object.entries(TEMPLATES)) {
    const fullPath = join(targetDir, filePath);
    const isUserData = USER_FILES.some((uf) => filePath.startsWith(uf));

    if (existsSync(fullPath)) {
      if (isUserData || !force) {
        info(`${filePath} already exists (skipped)`);
        continue;
      }
    }

    const dir = fullPath.substring(0, fullPath.lastIndexOf("/"));

    mkdirSync(dir, { recursive: true });

    const fileContent =
      typeof content === "function" ? content(projectName) : content;
    writeFileSync(fullPath, fileContent, "utf-8");
    success(`Created ${filePath}`);
  }
}

export async function initCommand(
  projectName: string,
  options: InitOptions
): Promise<void> {
  heading("Kanso Init");

  if (!projectName) {
    error("Project name is required.");
    error("Usage: kanso init <project-name>");
    process.exit(1);
  }

  const isDotName = projectName === ".";
  const invalidChars = /[/\\]|\.\./;
  if (projectName.startsWith("/") || projectName.includes(":")) {
    error(`Invalid project name: "${projectName}"`);
    info("Project name must be a relative path without absolute segments.");
    process.exit(1);
  }
  if (!isDotName && invalidChars.test(projectName)) {
    error(`Invalid project name: "${projectName}"`);
    info("Project name must not contain path separators or '..'.");
    process.exit(1);
  }

  const targetDir = join(process.cwd(), projectName);

  if (existsSync(targetDir) && !options.force) {
    error(`Directory "${projectName}" already exists.`);
    info("Use --force to overwrite the existing directory.");
    process.exit(1);
  }

  scaffoldProject(targetDir, projectName, !!options.force);

  console.log("");
  success(`Project created!`);
  console.log("");
  info(`Next steps:`);
  console.log(`  cd ${projectName}`);
  console.log(`  npm install`);
  console.log(`  kanso dev`);
  console.log("");
}
