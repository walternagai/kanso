import { readFileSync } from "fs";
import matter from "gray-matter";

export interface SearchEntry {
  title: string;
  url: string;
  content: string;
  tags: string[];
}

export function generateSearchIndex(
  files: string[],
  contentDir: string
): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const file of files) {
    const raw = readFileSync(file, "utf-8");
    const { data, content } = matter(raw);

    if (data.draft === true) continue;

    const slug = file
      .replace(contentDir, "")
      .replace(/\.md$/, "")
      .replace(/\/index$/, "/")
      .replace(/^\//, "");

    const plainText = content
      .replace(/<[^>]+>/g, "")
      .replace(/[#*_`~\[\]]/g, "")
      .trim();

    entries.push({
      title: String(data.title || ""),
      url: `/${slug}`,
      content: plainText.slice(0, 500),
      tags: (data.tags as string[]) || [],
    });
  }

  return entries;
}
