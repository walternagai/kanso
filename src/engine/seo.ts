import { KansoConfig } from "../config.js";

export function generateSitemap(
  pages: string[],
  contentDir: string,
  config: KansoConfig
): string {
  const urls = pages
    .map((page) => {
      const slug = page
        .replace(contentDir, "")
        .replace(/\.md$/, "")
        .replace(/\/index$/, "/")
        .replace(/^\//, "");
      return `  <url>
    <loc>${config.site.url}/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${config.site.url}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`;
}
