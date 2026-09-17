import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { success, error, info } from "../utils/logger.js";
import { titleToSlug } from "../utils/slug.js";

interface PostOptions {
  date?: string;
  tags?: string;
  layout?: string;
  description?: string;
}

export function postCommand(title: string, options: PostOptions): void {
  if (!title) {
    error("Post title is required.");
    error("Usage: kanso post \"My Post Title\"");
    process.exit(1);
  }

  const projectRoot = process.cwd();
  const postsDir = join(projectRoot, "content", "posts");

  if (!existsSync(postsDir)) {
    mkdirSync(postsDir, { recursive: true });
  }

  const date = options.date || new Date().toISOString().slice(0, 10);
  const layout = options.layout || "post";
  const tags = options.tags
    ? options.tags.split(",").map((t) => t.trim())
    : [];
  const description = options.description || "";
  const slug = titleToSlug(title);
  const fileName = `${slug}.md`;
  const filePath = join(postsDir, fileName);

  if (existsSync(filePath)) {
    error(`Post already exists: content/posts/${fileName}`);
    info("Use a different title or remove the existing file.");
    process.exit(1);
  }

  const tagsLine = tags.length > 0 ? `\ntags: [${tags.join(", ")}]` : "";
  const descLine = description
    ? `\ndescription: ${description}`
    : "";

  const content = `---
title: ${title}
date: ${date}
layout: ${layout}${tagsLine}${descLine}
---

# ${title}

Write your post content here.
`;

  writeFileSync(filePath, content, "utf-8");

  success(`Post created: content/posts/${fileName}`);
  console.log("");
  info(`Edit the file and run kanso build to publish.`);
}
