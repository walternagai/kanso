import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { copyAssets, assetPath, formatBytes } from "./assets.js";

const TEST_DIR = join(process.cwd(), ".test-assets");

describe("Asset Pipeline", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, "assets", "css"), { recursive: true });
    mkdirSync(join(TEST_DIR, "assets", "js"), { recursive: true });
    mkdirSync(join(TEST_DIR, "assets", "images"), { recursive: true });
    mkdirSync(join(TEST_DIR, "public"), { recursive: true });
    mkdirSync(join(TEST_DIR, "dist"), { recursive: true });
  });

  it("copies assets/ to dist/assets/", () => {
    writeFileSync(join(TEST_DIR, "assets", "css", "style.css"), "body {}");
    writeFileSync(join(TEST_DIR, "assets", "js", "main.js"), "console.log()");

    const result = copyAssets(TEST_DIR, join(TEST_DIR, "dist"));

    assert.ok(existsSync(join(TEST_DIR, "dist", "assets", "css", "style.css")));
    assert.ok(existsSync(join(TEST_DIR, "dist", "assets", "js", "main.js")));
    assert.strictEqual(result.filesCopied, 2);
  });

  it("copies public/ to dist/ root level", () => {
    writeFileSync(join(TEST_DIR, "public", "favicon.ico"), "fav");
    writeFileSync(join(TEST_DIR, "public", "robots.txt"), "User-agent: *");

    const result = copyAssets(TEST_DIR, join(TEST_DIR, "dist"));

    assert.ok(existsSync(join(TEST_DIR, "dist", "favicon.ico")));
    assert.ok(existsSync(join(TEST_DIR, "dist", "robots.txt")));
  });

  it("skips dotfiles by default", () => {
    writeFileSync(join(TEST_DIR, "assets", ".hidden"), "secret");
    writeFileSync(join(TEST_DIR, "assets", "visible.txt"), "public");

    copyAssets(TEST_DIR, join(TEST_DIR, "dist"));

    assert.ok(!existsSync(join(TEST_DIR, "dist", "assets", ".hidden")));
    assert.ok(existsSync(join(TEST_DIR, "dist", "assets", "visible.txt")));
  });

  it("preserves directory structure", () => {
    mkdirSync(join(TEST_DIR, "assets", "fonts"), { recursive: true });
    writeFileSync(join(TEST_DIR, "assets", "fonts", "roboto.woff2"), "font");

    copyAssets(TEST_DIR, join(TEST_DIR, "dist"));

    assert.ok(
      existsSync(join(TEST_DIR, "dist", "assets", "fonts", "roboto.woff2"))
    );
  });

  it("handles missing assets/ directory", () => {
    rmSync(join(TEST_DIR, "assets"), { recursive: true, force: true });
    writeFileSync(join(TEST_DIR, "public", "file.txt"), "data");

    const result = copyAssets(TEST_DIR, join(TEST_DIR, "dist"));
    assert.strictEqual(result.filesCopied, 1);
  });

  it("handles missing public/ directory", () => {
    rmSync(join(TEST_DIR, "public"), { recursive: true, force: true });
    writeFileSync(join(TEST_DIR, "assets", "style.css"), "body {}");

    const result = copyAssets(TEST_DIR, join(TEST_DIR, "dist"));
    assert.strictEqual(result.filesCopied, 1);
  });

  it("counts total size correctly", () => {
    const content = "a".repeat(1024);
    writeFileSync(join(TEST_DIR, "assets", "big.css"), content);

    const result = copyAssets(TEST_DIR, join(TEST_DIR, "dist"));
    assert.ok(result.totalSize >= 1024);
  });
});

describe("assetPath", () => {
  it("generates correct asset URL", () => {
    assert.strictEqual(
      assetPath("https://example.com", "css/style.css"),
      "https://example.com/css/style.css"
    );
  });

  it("handles trailing slash in site URL", () => {
    assert.strictEqual(
      assetPath("https://example.com/", "css/style.css"),
      "https://example.com/css/style.css"
    );
  });

  it("handles leading slash in asset path", () => {
    assert.strictEqual(
      assetPath("https://example.com", "/css/style.css"),
      "https://example.com/css/style.css"
    );
  });
});

describe("formatBytes", () => {
  it("formats bytes", () => {
    assert.strictEqual(formatBytes(0), "0 B");
    assert.strictEqual(formatBytes(1024), "1.0 KB");
    assert.strictEqual(formatBytes(1048576), "1.0 MB");
  });
});
