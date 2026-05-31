import { readFileSync } from "fs";
import matter from "gray-matter";
import { KansoConfig } from "../config.js";

interface FeedItem {
  title: string;
  url: string;
  description: string;
  date: string;
  author: string;
}

function collectPosts(
  pages: string[],
  contentDir: string,
  config: KansoConfig
): FeedItem[] {
  return pages
    .filter((page) => {
      const raw = readFileSync(page, "utf-8");
      const { data } = matter(raw);
      return data.layout === "post" && data.date && !data.draft;
    })
    .sort((a, b) => {
      const aData = matter(readFileSync(a, "utf-8")).data;
      const bData = matter(readFileSync(b, "utf-8")).data;
      return (
        new Date(bData.date as string).getTime() -
        new Date(aData.date as string).getTime()
      );
    })
    .slice(0, config.feed.limit || 20)
    .map((page) => {
      const raw = readFileSync(page, "utf-8");
      const { data } = matter(raw);
      const slug = page
        .replace(contentDir, "")
        .replace(/\.md$/, "")
        .replace(/\/index$/, "/")
        .replace(/^\//, "");
      return {
        title: String(data.title || ""),
        url: `${config.site.url}/${slug}`,
        description: String(data.description || ""),
        date: String(data.date || ""),
        author: String(data.author || config.site.title),
      };
    });
}

export function generateFeed(
  pages: string[],
  contentDir: string,
  config: KansoConfig
): { filename: string; content: string } | null {
  const posts = collectPosts(pages, contentDir, config);
  if (posts.length === 0) return null;

  switch (config.feed.type) {
    case "atom":
      return { filename: "atom.xml", content: generateAtom(posts, config) };
    case "json":
      return { filename: "feed.json", content: generateJsonFeed(posts, config) };
    case "rss":
    default:
      return { filename: "rss.xml", content: generateRss(posts, config) };
  }
}

function generateRss(posts: FeedItem[], config: KansoConfig): string {
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${p.url}</link>
      <description>${escapeXml(p.description)}</description>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <guid>${p.url}</guid>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.site.title)}</title>
    <link>${config.site.url}</link>
    <description>${escapeXml(config.site.title)}</description>
    <language>${config.site.language}</language>
    <atom:link href="${config.site.url}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

function generateAtom(posts: FeedItem[], config: KansoConfig): string {
  const entries = posts
    .map(
      (p) => `  <entry>
    <title>${escapeXml(p.title)}</title>
    <link href="${p.url}"/>
    <id>${p.url}</id>
    <updated>${new Date(p.date).toISOString()}</updated>
    <summary>${escapeXml(p.description)}</summary>
    <author>
      <name>${escapeXml(p.author)}</name>
    </author>
  </entry>`
    )
    .join("\n");

  const now = new Date().toISOString();
  const latestDate =
    posts.length > 0 ? new Date(posts[0].date).toISOString() : now;

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(config.site.title)}</title>
  <link href="${config.site.url}/atom.xml" rel="self"/>
  <link href="${config.site.url}"/>
  <id>${config.site.url}/</id>
  <updated>${latestDate}</updated>
  <generator>Kanso CLI</generator>
${entries}
</feed>`;
}

function generateJsonFeed(posts: FeedItem[], config: KansoConfig): string {
  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: config.site.title,
    home_page_url: config.site.url,
    feed_url: `${config.site.url}/feed.json`,
    items: posts.map((p) => ({
      id: p.url,
      url: p.url,
      title: p.title,
      content_text: p.description,
      date_published: new Date(p.date).toISOString(),
      authors: [{ name: p.author }],
    })),
  };
  return JSON.stringify(feed, null, 2);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
