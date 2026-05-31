import { readFileSync } from "fs";
import matter from "gray-matter";
import { KansoConfig } from "../config.js";

export function generateFeed(
  pages: string[],
  contentDir: string,
  config: KansoConfig
): string | null {
  const posts = pages
    .filter((page) => {
      const raw = readFileSync(page, "utf-8");
      const { data } = matter(raw);
      return data.layout === "post" && data.date;
    })
    .sort((a, b) => {
      const aData = matter(readFileSync(a, "utf-8")).data;
      const bData = matter(readFileSync(b, "utf-8")).data;
      return new Date(bData.date as string).getTime() - new Date(aData.date as string).getTime();
    })
    .slice(0, 20);

  if (posts.length === 0) return null;

  const items = posts
    .map((page) => {
      const raw = readFileSync(page, "utf-8");
      const { data } = matter(raw);
      const slug = page
        .replace(contentDir, "")
        .replace(/\.md$/, "")
        .replace(/\/index$/, "/")
        .replace(/^\//, "");

      return `    <item>
      <title>${escapeXml(String(data.title || ""))}</title>
      <link>${config.site.url}/${slug}</link>
      <description>${escapeXml(String(data.description || ""))}</description>
      <pubDate>${new Date(data.date as string).toUTCString()}</pubDate>
      <guid>${config.site.url}/${slug}</guid>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.site.title)}</title>
    <link>${config.site.url}</link>
    <description></description>
    <language>${config.site.language}</language>
    <atom:link href="${config.site.url}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
