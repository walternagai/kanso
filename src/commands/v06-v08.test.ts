import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { defaultConfig } from "../config.js";

const TEST_DIR = join(process.cwd(), ".test-v06-v08");

describe("v0.6 — i18n", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, "content", "pt"), { recursive: true });
    mkdirSync(join(TEST_DIR, "content", "en"), { recursive: true });
  });

  it("detectLanguages finds language directories", async () => {
    const { detectLanguages } = await import("../engine/i18n.js");
    const langs = detectLanguages(join(TEST_DIR, "content"), {
      enabled: true,
      defaultLang: "pt",
      languages: ["pt", "en"],
    });
    assert.ok(langs.includes("pt"));
    assert.ok(langs.includes("en"));
  });

  it("getLangFromPath extracts language code", async () => {
    const { getLangFromPath } = await import("../engine/i18n.js");
    const lang = getLangFromPath(
      join(TEST_DIR, "content", "pt", "sobre.md"),
      join(TEST_DIR, "content")
    );
    assert.strictEqual(lang, "pt");
  });
});

describe("v0.7 — Search Index", () => {
  it("generateSearchIndex creates index from files", async () => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, "content", "posts"), { recursive: true });
    writeFileSync(
      join(TEST_DIR, "content", "posts", "hello.md"),
      "---\ntitle: Hello\ntags: [web]\n---\n\nHello world content here."
    );
    writeFileSync(
      join(TEST_DIR, "content", "posts", "draft.md"),
      "---\ntitle: Draft\ndraft: true\n---\n\nDraft content."
    );

    const { generateSearchIndex } = await import("../engine/search.js");
    const files = [
      join(TEST_DIR, "content", "posts", "hello.md"),
      join(TEST_DIR, "content", "posts", "draft.md"),
    ];
    const index = generateSearchIndex(files, join(TEST_DIR, "content"));

    assert.strictEqual(index.length, 1);
    assert.strictEqual(index[0].title, "Hello");
    assert.ok(index[0].content.includes("Hello world"));
  });
});

describe("v0.8 — SEO", () => {
  it("generateSitemap creates valid XML", async () => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, "content"), { recursive: true });
    writeFileSync(
      join(TEST_DIR, "content", "index.md"),
      "---\ntitle: Home\n---\n\nHome."
    );

    const { generateSitemap } = await import("../engine/seo.js");
    const files = [join(TEST_DIR, "content", "index.md")];
    const config = {
      ...defaultConfig,
      site: { url: "https://example.com", title: "Test", language: "en" },
    };
    const sitemap = generateSitemap(files, join(TEST_DIR, "content"), config);

    assert.ok(sitemap.includes("<urlset"));
    assert.ok(sitemap.includes("example.com"));
    assert.ok(sitemap.includes("</urlset>"));
  });
});
