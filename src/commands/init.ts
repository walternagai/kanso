import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { success, error, heading, info } from "../utils/logger.js";

interface InitOptions {
  force?: boolean;
  yes?: boolean;
}

const TEMPLATES = {
  "kanso.config.js": `export default {
  site: {
    title: "My Kanso Site",
    url: "https://example.com",
    language: "pt_BR"
  },
  content: {
    dir: "content"
  },
  output: {
    dir: "dist"
  },
  markdown: {
    syntaxHighlight: true,
    callouts: true
  },
  seo: {
    sitemap: true,
    robots: true
  },
  feed: {
    enabled: false,
    type: "rss"
  },
  pagination: {
    perPage: 10
  },
  deploy: {
    provider: "github-pages"
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
    "deploy": "kanso deploy"
  }
}
`,
  "content/index.md": `---
title: Welcome
layout: base
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
    {{ content | safe }}
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
`,
  "assets/js/main.js": `// Kanso - your JavaScript here
`,
  "public/.gitkeep": "",
} as const;

function scaffoldProject(targetDir: string, projectName: string): void {
  mkdirSync(targetDir, { recursive: true });

  for (const [filePath, content] of Object.entries(TEMPLATES)) {
    const fullPath = join(targetDir, filePath);
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

  const targetDir = join(process.cwd(), projectName);

  if (existsSync(targetDir) && !options.force) {
    error(`Directory "${projectName}" already exists.`);
    info("Use --force to overwrite the existing directory.");
    process.exit(1);
  }

  scaffoldProject(targetDir, projectName);

  console.log("");
  success(`Project created!`);
  console.log("");
  info(`Next steps:`);
  console.log(`  cd ${projectName}`);
  console.log(`  npm install`);
  console.log(`  kanso dev`);
  console.log("");
}
