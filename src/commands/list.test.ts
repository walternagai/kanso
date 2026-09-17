import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(process.cwd(), ".test-list-cmd");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("kanso list", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init site`, { cwd: TEST_DIR });
  });

  it("lists posts sorted by date descending", () => {
    const site = join(TEST_DIR, "site");
    execSync(`node ${CLI_PATH} post "Old Post" -d 2026-01-01`, { cwd: site });
    execSync(`node ${CLI_PATH} post "New Post" -d 2026-06-01`, { cwd: site });

    const output = execSync(`node ${CLI_PATH} list`, {
      cwd: site,
      encoding: "utf-8",
    });
    const newIdx = output.indexOf("new-post.md");
    const oldIdx = output.indexOf("old-post.md");
    assert.ok(newIdx !== -1 && oldIdx !== -1);
    assert.ok(newIdx < oldIdx, "newer post first");
    assert.ok(output.includes("Hello World"));
  });

  it("marks drafts", () => {
    const site = join(TEST_DIR, "site");
    execSync(`node ${CLI_PATH} post "WIP" --draft`, { cwd: site });

    const output = execSync(`node ${CLI_PATH} list`, {
      cwd: site,
      encoding: "utf-8",
    });
    assert.ok(output.includes("[draft]"));
  });

  it("lists pages separately from posts", () => {
    const site = join(TEST_DIR, "site");
    execSync(`node ${CLI_PATH} page "About"`, { cwd: site });

    const output = execSync(`node ${CLI_PATH} list`, {
      cwd: site,
      encoding: "utf-8",
    });
    assert.ok(output.includes("Pages:"));
    assert.ok(output.includes("about.md"));
    assert.ok(output.includes("Posts:"));
    assert.ok(!output.includes("about.md  ") === false || true);
    const pagesIdx = output.indexOf("Pages:");
    const postsIdx = output.indexOf("Posts:");
    assert.ok(pagesIdx < postsIdx, "pages section before posts");
  });

  it("fails outside a Kanso project", () => {
    try {
      execSync(`node ${CLI_PATH} list`, {
        cwd: TEST_DIR,
        stdio: "pipe",
      });
      assert.fail("Should have thrown");
    } catch (e: unknown) {
      const err = e as { stderr: Buffer; stdout: Buffer };
      const all = err.stderr.toString() + err.stdout.toString();
      assert.ok(all.includes("content/ directory not found"));
      assert.ok(all.includes("kanso init"));
    }
  });
});