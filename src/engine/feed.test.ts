import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { generateFeed } from "./feed.js";
import { defaultConfig, KansoConfig } from "../config.js";

const TEST_DIR = join(process.cwd(), ".test-feed");

function makePost(slug: string, date: string, title: string): string {
  const file = join(TEST_DIR, "content", "posts", `${slug}.md`);
  writeFileSync(
    file,
    `---\ntitle: ${title}\ndate: ${date}\nlayout: post\ndescription: Desc ${title}\n---\n\nContent.`
  );
  return file;
}

describe("Feed Generator", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, "content", "posts"), { recursive: true });
  });

  it("generates RSS feed by default", () => {
    const files = [
      makePost("post-1", "2026-05-30", "First Post"),
      makePost("post-2", "2026-05-29", "Second Post"),
    ];

    const config: KansoConfig = { ...defaultConfig, feed: { enabled: true, type: "rss", limit: 20 } };
    const result = generateFeed(files, join(TEST_DIR, "content"), config);

    assert.ok(result);
    assert.strictEqual(result.filename, "rss.xml");
    assert.ok(result.content.includes("<rss version="));
    assert.ok(result.content.includes("First Post"));
    assert.ok(result.content.includes("Second Post"));
  });

  it("generates Atom feed when configured", () => {
    const files = [makePost("post-1", "2026-05-30", "Atom Post")];

    const config: KansoConfig = { ...defaultConfig, feed: { enabled: true, type: "atom", limit: 20 } };
    const result = generateFeed(files, join(TEST_DIR, "content"), config);

    assert.ok(result);
    assert.strictEqual(result.filename, "atom.xml");
    assert.ok(result.content.includes("<feed xmlns="));
    assert.ok(result.content.includes("Atom Post"));
    assert.ok(result.content.includes("<generator>Kanso CLI</generator>"));
  });

  it("generates JSON feed when configured", () => {
    const files = [makePost("post-1", "2026-05-30", "JSON Post")];

    const config: KansoConfig = { ...defaultConfig, feed: { enabled: true, type: "json", limit: 20 } };
    const result = generateFeed(files, join(TEST_DIR, "content"), config);

    assert.ok(result);
    assert.strictEqual(result.filename, "feed.json");
    const parsed = JSON.parse(result.content);
    assert.strictEqual(parsed.version, "https://jsonfeed.org/version/1.1");
    assert.strictEqual(parsed.title, "My Kanso Site");
    assert.strictEqual(parsed.items.length, 1);
    assert.strictEqual(parsed.items[0].title, "JSON Post");
  });

  it("returns null when no posts exist", () => {
    const config: KansoConfig = { ...defaultConfig, feed: { enabled: true, type: "rss", limit: 20 } };
    const result = generateFeed([], join(TEST_DIR, "content"), config);
    assert.strictEqual(result, null);
  });

  it("sorts posts by date descending", () => {
    const files = [
      makePost("old", "2026-01-01", "Old Post"),
      makePost("new", "2026-06-01", "New Post"),
    ];

    const config: KansoConfig = { ...defaultConfig, feed: { enabled: true, type: "rss", limit: 20 } };
    const result = generateFeed(files, join(TEST_DIR, "content"), config);

    assert.ok(result);
    const newIdx = result.content.indexOf("New Post");
    const oldIdx = result.content.indexOf("Old Post");
    assert.ok(newIdx < oldIdx, "New post should come before old post");
  });

  it("limits number of posts", () => {
    const files = [
      makePost("p1", "2026-05-01", "Post 1"),
      makePost("p2", "2026-05-02", "Post 2"),
      makePost("p3", "2026-05-03", "Post 3"),
    ];

    const config: KansoConfig = { ...defaultConfig, feed: { enabled: true, type: "rss", limit: 2 } };
    const result = generateFeed(files, join(TEST_DIR, "content"), config);

    assert.ok(result);
    assert.ok(result.content.includes("Post 3"));
    assert.ok(result.content.includes("Post 2"));
    assert.ok(!result.content.includes("Post 1"));
  });

  it("excludes draft posts", () => {
    const files = [
      makePost("published", "2026-05-30", "Published"),
    ];
    writeFileSync(
      join(TEST_DIR, "content", "posts", "draft.md"),
      "---\ntitle: Draft\ndate: 2026-05-30\nlayout: post\ndraft: true\n---\n\nDraft content."
    );
    const allFiles = [...files, join(TEST_DIR, "content", "posts", "draft.md")];

    const config: KansoConfig = { ...defaultConfig, feed: { enabled: true, type: "rss", limit: 20 } };
    const result = generateFeed(allFiles, join(TEST_DIR, "content"), config);

    assert.ok(result);
    assert.ok(!result.content.includes("Draft"));
    assert.ok(result.content.includes("Published"));
  });
});
