import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(process.cwd(), ".test-pagination");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("Pagination Integration", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init . --force`, { cwd: TEST_DIR });

    // Create 12 posts for pagination testing
    for (let i = 1; i <= 12; i++) {
      writeFileSync(
        join(TEST_DIR, "content", "posts", `post-${String(i).padStart(2, "0")}.md`),
        `---\ntitle: Post ${i}\ndate: 2026-05-${String(i).padStart(2, "0")}\nlayout: post\n---\n\nContent of post ${i}.`
      );
    }

    // Create a paginated listing page
    writeFileSync(
      join(TEST_DIR, "content", "blog.md"),
      `---\ntitle: Blog\nlayout: base\npagination:\n  collection: posts\n  perPage: 5\n---\n\n# Blog\n\n{% for post in pagination.items %}\n<article><a href="{{ post.url }}">{{ post.title }}</a></article>\n{% endfor %}\n\n{% if pagination.prev %}<a href="{{ pagination.prev }}">Previous</a>{% endif %}\n{% if pagination.next %}<a href="{{ pagination.next }}">Next</a>{% endif %}`
    );
  });

  it("generates paginated pages", () => {
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    assert.ok(existsSync(join(TEST_DIR, "dist", "blog", "index.html")));
    assert.ok(existsSync(join(TEST_DIR, "dist", "blog", "page", "2", "index.html")));
    assert.ok(existsSync(join(TEST_DIR, "dist", "blog", "page", "3", "index.html")));
  });

  it("does not generate page 4 (only 3 pages for 12 items at 5/page)", () => {
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    assert.ok(!existsSync(join(TEST_DIR, "dist", "blog", "page", "4", "index.html")));
  });

  it("page 1 has correct content", () => {
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    const html = readFileSync(
      join(TEST_DIR, "dist", "blog", "index.html"),
      "utf-8"
    );
    assert.ok(html.includes("Blog"));
    assert.ok(html.includes("Post 12"));
    assert.ok(html.includes("Post 11"));
    assert.ok(html.includes("Post 10"));
  });

  it("page 2 has correct content", () => {
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    const html = readFileSync(
      join(TEST_DIR, "dist", "blog", "page", "2", "index.html"),
      "utf-8"
    );
    assert.ok(html.includes("Post 7"));
    assert.ok(html.includes("Post 6"));
  });

  it("page 1 has next link but no prev link", () => {
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    const html = readFileSync(
      join(TEST_DIR, "dist", "blog", "index.html"),
      "utf-8"
    );
    assert.ok(html.includes("/blog/page/2/"));
    assert.ok(!html.includes("/blog/page/1/"));
  });

  it("last page has prev link but no next link", () => {
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    const html = readFileSync(
      join(TEST_DIR, "dist", "blog", "page", "3", "index.html"),
      "utf-8"
    );
    assert.ok(html.includes("/blog/page/2/"));
    assert.ok(!html.includes("/blog/page/4/"));
  });

  it("regular pages still work alongside paginated pages", () => {
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });

    assert.ok(existsSync(join(TEST_DIR, "dist", "index.html")));
    assert.ok(existsSync(join(TEST_DIR, "dist", "posts", "post-01", "index.html")));
  });
});
