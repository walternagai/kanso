import { readdirSync, mkdirSync, writeFileSync, existsSync, rmSync, statSync } from "fs";
import { join, relative, dirname } from "path";
import { parseContent, PageData } from "./content.js";
import { TemplateEngine } from "./template.js";
import { copyAssets } from "./assets.js";
import { generateSitemap } from "./seo.js";
import { generateFeed } from "./feed.js";
import { heading, success, error, info, dim } from "../utils/logger.js";

export interface BuildResult {
  pages: number;
  assetsCopied: number;
  buildTime: number;
  totalSize: number;
}

export async function build(projectRoot: string): Promise<BuildResult> {
  const startTime = Date.now();

  const config = await loadConfig(projectRoot);
  const contentDir = join(projectRoot, config.content.dir);
  const outputDir = join(projectRoot, config.output.dir);

  if (existsSync(outputDir)) {
    rmSync(outputDir, { recursive: true, force: true });
  }
  mkdirSync(outputDir, { recursive: true });

  const engine = new TemplateEngine(projectRoot);
  const pages = collectMarkdownFiles(contentDir);
  let pagesBuilt = 0;
  const errors: string[] = [];

  for (const page of pages) {
    try {
      const pageData = parseContent(page);
      const relativePath = relative(contentDir, page);
      const htmlPath = markdownToHtmlPath(relativePath);

      const templateName =
        (pageData.frontMatter.layout as string) || "base";

      const html = engine.render(templateName, {
        ...pageData.frontMatter,
        title:
          (pageData.frontMatter.title as string) || config.site.title,
        content: pageData.htmlContent,
        site: config.site,
        page: {
          url: htmlToUrl(htmlPath),
          slug: pageData.slug,
        },
      });

      const destPath = join(outputDir, htmlPath);
      mkdirSync(dirname(destPath), { recursive: true });
      writeFileSync(destPath, html, "utf-8");
      pagesBuilt++;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${relative(projectRoot, page)}: ${msg}`);
    }
  }

  const assetResult = copyAssets(projectRoot, outputDir);

  if (config.seo.sitemap) {
    const sitemap = generateSitemap(pages, contentDir, config);
    writeFileSync(join(outputDir, "sitemap.xml"), sitemap, "utf-8");
  }

  if (config.seo.robots) {
    writeFileSync(
      join(outputDir, "robots.txt"),
      "User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml\n",
      "utf-8"
    );
  }

  if (config.feed.enabled) {
    const feed = generateFeed(pages, contentDir, config);
    if (feed) {
      writeFileSync(join(outputDir, "rss.xml"), feed, "utf-8");
    }
  }

  const buildTime = Date.now() - startTime;
  const totalSize = calculateDirSize(outputDir);

  heading("Kanso Build");
  console.log(`  Pages:     ${pagesBuilt} pages generated`);
  console.log(`  Assets:    ${assetResult.filesCopied} files copied`);
  console.log(`  Time:      ${buildTime}ms`);
  console.log(`  Size:      ${formatBytes(totalSize)}`);
  console.log("");

  if (errors.length > 0) {
    error(`${errors.length} page(s) failed:`);
    for (const err of errors) {
      console.log(`  ${dim(err)}`);
    }
    console.log("");
  }

  if (pagesBuilt > 0) {
    success(`Build successful! Output in ${config.output.dir}/`);
  } else {
    error("Build failed with no pages generated.");
  }

  return { pages: pagesBuilt, assetsCopied: assetResult.filesCopied, buildTime, totalSize };
}

function collectMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(fullPath));
    } else if (entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

function markdownToHtmlPath(mdPath: string): string {
  const withoutExt = mdPath.replace(/\.md$/, "");
  if (withoutExt === "index") {
    return "index.html";
  }
  if (withoutExt.endsWith("/index")) {
    return withoutExt.replace(/\/index$/, "/index.html");
  }
  return `${withoutExt}/index.html`;
}

function htmlToUrl(htmlPath: string): string {
  return "/" + htmlPath.replace(/index\.html$/, "").replace(/^\//, "");
}

async function loadConfig(projectRoot: string) {
  const configPath = join(projectRoot, "kanso.config.js");
  const { defaultConfig } = await import("../config.js");

  if (existsSync(configPath)) {
    const mod = await import(configPath);
    return { ...defaultConfig, ...mod.default };
  }
  return defaultConfig;
}

function calculateDirSize(dir: string): number {
  let total = 0;
  if (!existsSync(dir)) return total;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      total += calculateDirSize(fullPath);
    } else {
      total += statSync(fullPath).size;
    }
  }
  return total;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
