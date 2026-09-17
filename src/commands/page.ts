import { writeFileSync, existsSync } from "fs";
import { join } from "path";
import { success, error, info } from "../utils/logger.js";
import { titleToSlug } from "../utils/slug.js";

interface PageOptions {
  layout?: string;
}

export function pageCommand(title: string, options: PageOptions): void {
  if (!title) {
    error("Page title is required.");
    error('Usage: kanso page "My Page Title"');
    process.exit(1);
  }

  const projectRoot = process.cwd();
  const contentDir = join(projectRoot, "content");

  if (!existsSync(contentDir)) {
    error("content/ directory not found.");
    info("This does not look like a Kanso project. Run `kanso init` first.");
    process.exit(1);
  }

  const layout = options.layout || "base";
  const slug = titleToSlug(title);
  const fileName = `${slug}.md`;
  const filePath = join(contentDir, fileName);

  if (existsSync(filePath)) {
    error(`Page already exists: content/${fileName}`);
    info("Use a different title or remove the existing file.");
    process.exit(1);
  }

  const content = `---
title: ${title}
layout: ${layout}
---

# ${title}

Write your page content here.
`;

  writeFileSync(filePath, content, "utf-8");

  success(`Page created: content/${fileName}`);
  console.log("");
  info(`Edit the file and run kanso build to publish.`);
}