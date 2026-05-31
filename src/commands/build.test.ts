import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(process.cwd(), ".test-build");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("kanso build", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init . --force`, { cwd: TEST_DIR });
  });

  it("creates dist/ directory with HTML output", () => {
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    assert.ok(existsSync(join(TEST_DIR, "dist")));
    assert.ok(existsSync(join(TEST_DIR, "dist", "index.html")));
  });

  it("converts Markdown to HTML", () => {
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    const html = readFileSync(join(TEST_DIR, "dist", "index.html"), "utf-8");
    assert.ok(html.includes("<!DOCTYPE html>"));
    assert.ok(html.includes("Welcome"));
  });

  it("copies assets to dist/assets/", () => {
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    assert.ok(existsSync(join(TEST_DIR, "dist", "assets", "css", "style.css")));
    assert.ok(existsSync(join(TEST_DIR, "dist", "assets", "js", "main.js")));
  });

  it("generates sitemap.xml", () => {
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    assert.ok(existsSync(join(TEST_DIR, "dist", "sitemap.xml")));
    const sitemap = readFileSync(
      join(TEST_DIR, "dist", "sitemap.xml"),
      "utf-8"
    );
    assert.ok(sitemap.includes("<urlset"));
    assert.ok(sitemap.includes("example.com"));
  });

  it("generates robots.txt", () => {
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    assert.ok(existsSync(join(TEST_DIR, "dist", "robots.txt")));
    const robots = readFileSync(
      join(TEST_DIR, "dist", "robots.txt"),
      "utf-8"
    );
    assert.ok(robots.includes("User-agent: *"));
  });

  it("builds post pages from content/posts/", () => {
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    assert.ok(existsSync(join(TEST_DIR, "dist", "posts", "hello-world", "index.html")));
    const postHtml = readFileSync(
      join(TEST_DIR, "dist", "posts", "hello-world", "index.html"),
      "utf-8"
    );
    assert.ok(postHtml.includes("Hello World"));
  });

  it("applies layout to pages", () => {
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    const html = readFileSync(join(TEST_DIR, "dist", "index.html"), "utf-8");
    assert.ok(html.includes("<header>"));
    assert.ok(html.includes("<footer>"));
  });
});
