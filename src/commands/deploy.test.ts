import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(process.cwd(), ".test-deploy");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("kanso deploy", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init . --force`, { cwd: TEST_DIR });
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });
  });

  it("dry-run shows file count without deploying", () => {
    const output = execSync(
      `node ${CLI_PATH} deploy --dry-run --provider github-pages`,
      { cwd: TEST_DIR, encoding: "utf-8" }
    );
    assert.ok(output.includes("Dry run"));
    assert.ok(output.includes("files"));
  });

  it("fails without config for GitHub Pages", () => {
    try {
      execSync(`node ${CLI_PATH} deploy --provider github-pages`, {
        cwd: TEST_DIR,
        stdio: "pipe",
      });
      assert.fail("Should have thrown");
    } catch (e: any) {
      assert.ok(
        e.stderr.toString().includes("not configured") ||
          e.stdout.toString().includes("not configured")
      );
    }
  });

  it("fails without NETLIFY_AUTH_TOKEN for Netlify", () => {
    try {
      execSync(`node ${CLI_PATH} deploy --provider netlify`, {
        cwd: TEST_DIR,
        stdio: "pipe",
        env: { ...process.env, NETLIFY_AUTH_TOKEN: "" },
      });
      assert.fail("Should have thrown");
    } catch (e: any) {
      assert.ok(
        e.stderr.toString().includes("NETLIFY_AUTH_TOKEN") ||
          e.stdout.toString().includes("NETLIFY_AUTH_TOKEN")
      );
    }
  });

  it("fails with unknown provider", () => {
    try {
      execSync(`node ${CLI_PATH} deploy --provider vercel`, {
        cwd: TEST_DIR,
        stdio: "pipe",
      });
      assert.fail("Should have thrown");
    } catch (e: any) {
      assert.ok(
        e.stderr.toString().includes("Unknown provider") ||
          e.stdout.toString().includes("Unknown provider")
      );
    }
  });
});
