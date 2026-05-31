import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(process.cwd(), ".test-post");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("kanso post", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, "content", "posts"), { recursive: true });
  });

  it("creates a post file from title", () => {
    execSync(`node ${CLI_PATH} post "Hello World"`, { cwd: TEST_DIR });

    const postPath = join(TEST_DIR, "content", "posts", "hello-world.md");
    assert.ok(existsSync(postPath));
  });

  it("generates correct front matter", () => {
    execSync(`node ${CLI_PATH} post "My Test Post"`, { cwd: TEST_DIR });

    const content = readFileSync(
      join(TEST_DIR, "content", "posts", "my-test-post.md"),
      "utf-8"
    );
    assert.ok(content.includes("title: My Test Post"));
    assert.ok(content.includes("layout: post"));
    assert.ok(content.includes("date:"));
  });

  it("uses today's date by default", () => {
    execSync(`node ${CLI_PATH} post "Dated Post"`, { cwd: TEST_DIR });

    const content = readFileSync(
      join(TEST_DIR, "content", "posts", "dated-post.md"),
      "utf-8"
    );
    const today = new Date().toISOString().slice(0, 10);
    assert.ok(content.includes(`date: ${today}`));
  });

  it("accepts custom date", () => {
    execSync(
      `node ${CLI_PATH} post "Custom Date" --date 2026-12-25`,
      { cwd: TEST_DIR }
    );

    const content = readFileSync(
      join(TEST_DIR, "content", "posts", "custom-date.md"),
      "utf-8"
    );
    assert.ok(content.includes("date: 2026-12-25"));
  });

  it("accepts tags", () => {
    execSync(
      `node ${CLI_PATH} post "Tagged Post" --tags "web, dev, kanso"`,
      { cwd: TEST_DIR }
    );

    const content = readFileSync(
      join(TEST_DIR, "content", "posts", "tagged-post.md"),
      "utf-8"
    );
    assert.ok(content.includes("tags: [web, dev, kanso]"));
  });

  it("accepts description", () => {
    execSync(
      `node ${CLI_PATH} post "Described" --description "A test post"`,
      { cwd: TEST_DIR }
    );

    const content = readFileSync(
      join(TEST_DIR, "content", "posts", "described.md"),
      "utf-8"
    );
    assert.ok(content.includes("description: A test post"));
  });

  it("generates slug from title", () => {
    execSync(
      `node ${CLI_PATH} post "This Is A Long Title!"`,
      { cwd: TEST_DIR }
    );

    assert.ok(
      existsSync(
        join(TEST_DIR, "content", "posts", "this-is-a-long-title.md")
      )
    );
  });

  it("handles accented characters in slug", () => {
    execSync(
      `node ${CLI_PATH} post "Ação e Reação"`,
      { cwd: TEST_DIR }
    );

    assert.ok(
      existsSync(
        join(TEST_DIR, "content", "posts", "acao-e-reacao.md")
      )
    );
  });

  it("fails if post already exists", () => {
    execSync(`node ${CLI_PATH} post "Duplicate"`, { cwd: TEST_DIR });
    try {
      execSync(`node ${CLI_PATH} post "Duplicate"`, {
        cwd: TEST_DIR,
        stdio: "pipe",
      });
      assert.fail("Should have thrown");
    } catch (e: any) {
      assert.ok(e.stderr.toString().includes("already exists"));
    }
  });

  it("creates posts directory if missing", () => {
    rmSync(join(TEST_DIR, "content", "posts"), {
      recursive: true,
      force: true,
    });
    execSync(`node ${CLI_PATH} post "New Dir"`, { cwd: TEST_DIR });

    assert.ok(
      existsSync(join(TEST_DIR, "content", "posts", "new-dir.md"))
    );
  });
});
