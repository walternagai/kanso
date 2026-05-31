import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import { readFileSync } from "fs";

export interface PageData {
  frontMatter: Record<string, unknown>;
  content: string;
  htmlContent: string;
  filePath: string;
  slug: string;
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
      } catch {
        // fall through
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

export function parseContent(filePath: string): PageData {
  const raw = readFileSync(filePath, "utf-8");
  const { data: frontMatter, content } = matter(raw);
  const htmlContent = md.render(content);
  const slug = filePathToSlug(filePath);

  return { frontMatter, content, htmlContent, filePath, slug };
}

export function parseContentString(
  raw: string,
  filePath: string
): PageData {
  const { data: frontMatter, content } = matter(raw);
  const htmlContent = md.render(content);
  const slug = filePathToSlug(filePath);

  return { frontMatter, content, htmlContent, filePath, slug };
}

export function renderMarkdown(markdown: string): string {
  return md.render(markdown);
}

function filePathToSlug(filePath: string): string {
  let slug = filePath
    .replace(/\\/g, "/")
    .replace(/\.md$/, "")
    .replace(/\/index$/, "");

  const lastSlash = slug.lastIndexOf("/");
  if (lastSlash !== -1) {
    slug = slug.substring(lastSlash + 1);
  }

  return slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
