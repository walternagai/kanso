import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { readFileSync } from "fs";

const TEST_DIR = join(process.cwd(), ".test-posts-listing");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("scaffold posts listing (E2E)", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });

  it("lists created posts on the built home page", () => {
    execSync(`node ${CLI_PATH} init site`, { cwd: TEST_DIR });
    const site = join(TEST_DIR, "site");

    execSync(`node ${CLI_PATH} post "Second Post"`, { cwd: site });
    execSync(`node ${CLI_PATH} build`, { cwd: site });

    const home = readFileSync(join(site, "dist/index.html"), "utf-8");
    assert.ok(home.includes("Hello World"), "scaffold post should appear");
    assert.ok(home.includes("Second Post"), "new post should appear");
    assert.ok(home.includes('href="/posts/hello-world"'));
  });
});