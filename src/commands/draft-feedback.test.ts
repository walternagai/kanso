import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, rmSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(process.cwd(), ".test-draft-feedback");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("draft feedback", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init site`, { cwd: TEST_DIR });
  });

  it("post --draft creates file with draft: true", () => {
    const site = join(TEST_DIR, "site");
    execSync(`node ${CLI_PATH} post "WIP Post" --draft`, { cwd: site });

    const post = readFileSync(
      join(site, "content/posts/wip-post.md"),
      "utf-8"
    );
    assert.ok(post.includes("draft: true"));
  });

  it("build reports skipped drafts", () => {
    const site = join(TEST_DIR, "site");
    execSync(`node ${CLI_PATH} post "WIP Post" --draft`, { cwd: site });
    const output = execSync(`node ${CLI_PATH} build 2>&1`, {
      cwd: site,
      encoding: "utf-8",
      shell: "/bin/bash",
    });
    assert.ok(output.includes("draft(s) skipped"));
  });

  it("build without drafts does not show skip message", () => {
    const site = join(TEST_DIR, "site");
    const output = execSync(`node ${CLI_PATH} build`, {
      cwd: site,
      encoding: "utf-8",
    });
    assert.ok(!output.includes("draft(s) skipped"));
  });
});