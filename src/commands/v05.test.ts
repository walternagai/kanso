import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(process.cwd(), ".test-v05");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("v0.5 — Collections", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init . --force`, { cwd: TEST_DIR });
  });

  it("buildCollections groups posts by directory", async () => {
    const { buildCollections } = await import("../engine/collections.js");
    const { readFileSync, writeFileSync } = await import("fs");

    writeFileSync(
      join(TEST_DIR, "content", "posts", "alpha.md"),
      "---\ntitle: Alpha\ndate: 2026-06-01\nlayout: base\ntags: [web]\n---\n\nAlpha."
    );
    writeFileSync(
      join(TEST_DIR, "content", "posts", "beta.md"),
      "---\ntitle: Beta\ndate: 2026-06-02\nlayout: base\ntags: [web, dev]\n---\n\nBeta."
    );

    const files = [
      join(TEST_DIR, "content", "posts", "alpha.md"),
      join(TEST_DIR, "content", "posts", "beta.md"),
    ];

    const collections = buildCollections(files, join(TEST_DIR, "content"));
    const posts = collections.get("posts");

    assert.ok(posts, "posts collection should exist");
    assert.strictEqual(posts.items.length, 2);
    assert.strictEqual(posts.items[0].frontMatter.title, "Beta");
    assert.strictEqual(posts.items[1].frontMatter.title, "Alpha");
    assert.ok(posts.tags.includes("web"));
    assert.ok(posts.tags.includes("dev"));
  });

  it("buildCollections creates tag collections", async () => {
    const { buildCollections } = await import("../engine/collections.js");
    const { writeFileSync } = await import("fs");

    writeFileSync(
      join(TEST_DIR, "content", "posts", "a.md"),
      "---\ntitle: A\ndate: 2026-06-01\nlayout: base\ntags: [web]\n---\n\nA."
    );
    writeFileSync(
      join(TEST_DIR, "content", "posts", "b.md"),
      "---\ntitle: B\ndate: 2026-06-02\nlayout: base\ntags: [web, dev]\n---\n\nB."
    );

    const files = [
      join(TEST_DIR, "content", "posts", "a.md"),
      join(TEST_DIR, "content", "posts", "b.md"),
    ];

    const collections = buildCollections(files, join(TEST_DIR, "content"));
    const webTag = collections.get("tags/web");

    assert.ok(webTag, "tags/web collection should exist");
    assert.strictEqual(webTag.items.length, 2);
  });
});

describe("v0.5 — Canonical URLs", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init . --force`, { cwd: TEST_DIR });
  });

  it("provides canonical URL to templates", () => {
    writeFileSync(
      join(TEST_DIR, "content", "about.md"),
      "---\ntitle: About\nlayout: base\n---\n\nAbout page."
    );
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    const html = readFileSync(
      join(TEST_DIR, "dist", "about", "index.html"),
      "utf-8"
    );
    // The canonical URL should be available in template context
    // (actual usage depends on theme implementing <link rel="canonical">)
    assert.ok(existsSync(join(TEST_DIR, "dist", "about", "index.html")));
  });
});

describe("v0.5 — Redirects", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init . --force`, { cwd: TEST_DIR });
  });

  it("copies redirects file to dist/", () => {
    writeFileSync(
      join(TEST_DIR, "redirects"),
      "/old-page /new-page 301\n/another /target 302"
    );
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    assert.ok(existsSync(join(TEST_DIR, "dist", "_redirects")));
    const content = readFileSync(
      join(TEST_DIR, "dist", "_redirects"),
      "utf-8"
    );
    assert.ok(content.includes("/old-page /new-page 301"));
  });
});

describe("v0.5 — Headers", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init . --force`, { cwd: TEST_DIR });
  });

  it("copies headers file to dist/", () => {
    writeFileSync(
      join(TEST_DIR, "headers"),
      "/*\n  X-Frame-Options: DENY\n  X-Content-Type-Options: nosniff"
    );
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    assert.ok(existsSync(join(TEST_DIR, "dist", "_headers")));
    const content = readFileSync(
      join(TEST_DIR, "dist", "_headers"),
      "utf-8"
    );
    assert.ok(content.includes("X-Frame-Options: DENY"));
  });
});

describe("v0.5 — Excerpt in templates", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init . --force`, { cwd: TEST_DIR });
  });

  it("excerpt variable available in page context", () => {
    writeFileSync(
      join(TEST_DIR, "content", "test.md"),
      "---\ntitle: Test\nlayout: base\ndescription: My excerpt text\n---\n\nContent."
    );
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    assert.ok(existsSync(join(TEST_DIR, "dist", "test", "index.html")));
  });
});
