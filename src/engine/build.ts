import { readdirSync, mkdirSync, writeFileSync, existsSync, rmSync, statSync, readFileSync } from "fs";
import { join, relative, dirname } from "path";
import matter from "gray-matter";
import { parseContent, PageData } from "./content.js";
import { TemplateEngine } from "./template.js";
import { copyAssets } from "./assets.js";
import { generateSitemap } from "./seo.js";
import { generateFeed } from "./feed.js";
import { paginateCollection, readCollection, PaginationData } from "./pagination.js";
import { minifyHtml } from "./minify.js";
import { generateRedirects, generateHeaders } from "./redirects.js";
import { buildCollections } from "./collections.js";
import { PluginRunner } from "../plugins/runner.js";
import { heading, success, error, info, dim } from "../utils/logger.js";

export interface BuildResult {
  pages: number;
  assetsCopied: number;
  buildTime: number;
  totalSize: number;
}

const pluginRunner = new PluginRunner();

export async function build(projectRoot: string): Promise<BuildResult> {
  const startTime = Date.now();

  await pluginRunner.loadPlugins(projectRoot);

  const config = await loadConfig(projectRoot);
  const contentDir = join(projectRoot, config.content.dir);
  const outputDir = join(projectRoot, config.output.dir);

  await pluginRunner.runHook("config:loaded", config);

  if (existsSync(outputDir)) {
    rmSync(outputDir, { recursive: true, force: true });
  }
  mkdirSync(outputDir, { recursive: true });

  const engine = new TemplateEngine(projectRoot);
  const pages = collectMarkdownFiles(contentDir);
  const collections = buildCollections(pages, contentDir);
  let pagesBuilt = 0;
  const errors: string[] = [];

  await pluginRunner.runHook("build:start", {
    projectRoot,
    config,
    pages,
    startTime,
  });

  // Build regular pages (skip drafts in production)
  for (const page of pages) {
    try {
      const pageData = parseContent(page);

      // Skip draft pages in production build
      if (pageData.frontMatter.draft === true) {
        continue;
      }
      const relativePath = relative(contentDir, page);
      const htmlPath = markdownToHtmlPath(relativePath);

      const templateName =
        (pageData.frontMatter.layout as string) || "base";

      // Check if this page has pagination config
      const paginationConfig = pageData.frontMatter.pagination as
        | { collection?: string; perPage?: number }
        | undefined;

      if (paginationConfig && paginationConfig.collection) {
        // For paginated pages, re-parse without Markdown rendering
        // so Nunjucks tags in content are not escaped
        const raw = readFileSync(page, "utf-8");
        const { data: fmData } = matter(raw);
        const rawPageData: PageData = {
          frontMatter: fmData,
          content: raw.replace(/^---[\s\S]*?---\n?/, ""),
          htmlContent: "", // Not used for paginated pages
          filePath: page,
          slug: pageData.slug,
        };

        const built = await buildPaginatedPage(
          engine,
          rawPageData,
          paginationConfig,
          contentDir,
          outputDir,
          config,
          projectRoot
        );
        pagesBuilt += built;
      } else {
        const pageUrl = htmlToUrl(htmlPath);
        const canonicalUrl = `${config.site.url}${pageUrl}`;

        const collectionsObj: Record<string, unknown> = {};
        for (const [name, col] of collections) {
          collectionsObj[name] = col.items;
        }

        const html = engine.render(templateName, {
          ...pageData.frontMatter,
          title:
            (pageData.frontMatter.title as string) || config.site.title,
          content: pageData.htmlContent,
          excerpt: (pageData.frontMatter.description as string) || "",
          site: config.site,
          collections: collectionsObj,
          page: {
            url: pageUrl,
            slug: pageData.slug,
            canonical: canonicalUrl,
          },
        });

        const pageCtx = await pluginRunner.runHook("page:render", {
          filePath: page,
          slug: pageData.slug,
          frontMatter: pageData.frontMatter,
          htmlContent: pageData.htmlContent,
          outputHtml: html,
        }) as { outputHtml: string };

        const finalHtml = config.build.minify
          ? minifyHtml(pageCtx.outputHtml)
          : pageCtx.outputHtml;
        const destPath = join(outputDir, htmlPath);
        mkdirSync(dirname(destPath), { recursive: true });
        writeFileSync(destPath, finalHtml, "utf-8");

        await pluginRunner.runHook("page:done", {
          filePath: page,
          slug: pageData.slug,
          frontMatter: pageData.frontMatter,
          htmlContent: pageData.htmlContent,
          outputHtml: finalHtml,
        });

        pagesBuilt++;
      }
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
      writeFileSync(join(outputDir, feed.filename), feed.content, "utf-8");
    }
  }

  // Generate redirects file
  const redirects = generateRedirects(projectRoot);
  if (redirects) {
    writeFileSync(join(outputDir, "_redirects"), redirects, "utf-8");
  }

  // Generate headers file
  const headers = generateHeaders(projectRoot);
  if (headers) {
    writeFileSync(join(outputDir, "_headers"), headers, "utf-8");
  }

  // Generate 404 page if content/404.md exists
  const notFoundPage = join(contentDir, "404.md");
  if (existsSync(notFoundPage)) {
    const notFoundData = parseContent(notFoundPage);
    const notFoundHtml = engine.render(
      (notFoundData.frontMatter.layout as string) || "base",
      {
        ...notFoundData.frontMatter,
        title: "404 — Page Not Found",
        content: notFoundData.htmlContent,
        site: config.site,
      }
    );
    writeFileSync(
      join(outputDir, "404.html"),
      config.build.minify ? minifyHtml(notFoundHtml) : notFoundHtml,
      "utf-8"
    );
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

  await pluginRunner.runHook("build:end", {
    projectRoot,
    config,
    pages,
    startTime,
    pagesBuilt,
    duration: buildTime,
  });

  return { pages: pagesBuilt, assetsCopied: assetResult.filesCopied, buildTime, totalSize };
}

async function buildPaginatedPage(
  engine: TemplateEngine,
  pageData: PageData,
  paginationConfig: { collection?: string; perPage?: number },
  contentDir: string,
  outputDir: string,
  config: Awaited<ReturnType<typeof loadConfig>>,
  projectRoot: string
): Promise<number> {
  const collectionName = paginationConfig.collection || "posts";
  const perPage =
    paginationConfig.perPage || config.pagination.perPage || 10;

  // Collect all markdown files in the collection directory
  const collectionDir = join(contentDir, collectionName);
  const collectionFiles = collectMarkdownFiles(collectionDir);
  const collection = readCollection(collectionFiles, collectionDir);

  // Make URLs relative to the paginated page's location
  const relativePath = relative(contentDir, pageData.filePath);
  const basePath = markdownToHtmlPath(relativePath)
    .replace(/index\.html$/, "")
    .replace(/^\//, "");

  const collectionWithUrls = collection.map((item) => ({
    ...item,
    url: basePath ? `/${basePath}${item.url}` : item.url,
  }));

  const paginatedPages = paginateCollection(collectionWithUrls, {
    perPage,
  }).map((p) => ({
    ...p,
    prev: p.prev
      ? basePath
        ? `/${basePath}${p.prev.replace(/^\//, "")}`
        : p.prev
      : null,
    next: p.next
      ? basePath
        ? `/${basePath}${p.next.replace(/^\//, "")}`
        : p.next
      : null,
    pages: p.pages.map((pg) => ({
      ...pg,
      url: basePath ? `/${basePath}${pg.url.replace(/^\//, "")}` : pg.url,
    })),
  }));

  let pagesBuilt = 0;

  for (const paginatedPage of paginatedPages) {
    const templateName =
      (pageData.frontMatter.layout as string) || "base";

    // Render content as Nunjucks template (not Markdown)
    const renderedContent = engine.renderString(pageData.content, {
      ...pageData.frontMatter,
      pagination: paginatedPage,
      site: config.site,
    });

    const html = engine.render(templateName, {
      ...pageData.frontMatter,
      title:
        (pageData.frontMatter.title as string) || config.site.title,
      content: renderedContent,
      pagination: paginatedPage,
      site: config.site,
      page: {
        url: paginatedPage.currentPage === 1
          ? `/${basePath}`
          : `/${basePath}page/${paginatedPage.currentPage}/`,
        slug: pageData.slug,
      },
    });

    const finalHtml = config.build.minify ? minifyHtml(html) : html;
    const pagePath =
      paginatedPage.currentPage === 1
        ? join(outputDir, basePath, "index.html")
        : join(
            outputDir,
            basePath,
            "page",
            String(paginatedPage.currentPage),
            "index.html"
          );

    mkdirSync(dirname(pagePath), { recursive: true });
    writeFileSync(pagePath, finalHtml, "utf-8");
    pagesBuilt++;
  }

  return pagesBuilt;
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
