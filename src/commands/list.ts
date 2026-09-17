import { readdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { heading, info, error, dim } from "../utils/logger.js";

interface ContentItem {
  file: string;
  title: string;
  date: string | null;
  draft: boolean;
}

function scanDir(dir: string, recursive: boolean): ContentItem[] {
  if (!existsSync(dir)) return [];
  const items: ContentItem[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) items.push(...scanDir(fullPath, true));
      continue;
    }
    if (!entry.name.endsWith(".md")) continue;

    try {
      const { data } = matter(readFileSync(fullPath, "utf-8"));
      const rawDate = data.date;
      const dateStr =
        rawDate instanceof Date
          ? rawDate.toISOString().slice(0, 10)
          : typeof rawDate === "string"
            ? rawDate.slice(0, 10)
            : null;
      items.push({
        file: entry.name,
        title: (data.title as string) || "(no title)",
        date: dateStr,
        draft: data.draft === true,
      });
    } catch {
      items.push({ file: entry.name, title: "(parse error)", date: null, draft: false });
    }
  }
  return items;
}

function printItems(items: ContentItem[]): void {
  const sorted = [...items].sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.file.localeCompare(b.file);
  });

  for (const item of sorted) {
    const date = item.date ?? "";
    const label = item.draft ? `${item.file} [draft]` : item.file;
    console.log(`  ${label}${date ? `  ${dim(date)}` : ""}  ${dim(item.title)}`);
  }
}

export function listCommand(): void {
  heading("Kanso List");

  const contentDir = join(process.cwd(), "content");
  if (!existsSync(contentDir)) {
    error("content/ directory not found.");
    info("This does not look like a Kanso project. Run `kanso init` first.");
    process.exit(1);
  }

  const posts = scanDir(join(contentDir, "posts"), true);
  const pages = scanDir(contentDir, false).filter(
    (p) => p.file !== "index.md"
  );
  const index = scanDir(contentDir, false).filter(
    (p) => p.file === "index.md"
  );

  if (index.length > 0) {
    console.log("\nHome:");
    printItems(index);
  }

  if (pages.length > 0) {
    console.log("\nPages:");
    printItems(pages);
  } else {
    info("\nNo pages. Create one with: kanso page \"About\"");
  }

  if (posts.length > 0) {
    console.log("\nPosts:");
    printItems(posts);
  } else {
    info("\nNo posts. Create one with: kanso post \"My Post\"");
  }

  console.log("");
}