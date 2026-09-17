import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(process.cwd(), ".test-hints");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("contextual hints", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init site`, { cwd: TEST_DIR });
  });

  it("post suggests preview and build", () => {
    const site = join(TEST_DIR, "site");
    execSync(`node ${CLI_PATH} post "Hinted"`, { cwd: site });
    // post output goes to stdout; re-run capturing it
    const output = execSync(`node ${CLI_PATH} post "Hinted2"`, {
      cwd: site,
      encoding: "utf-8",
    });
    assert.ok(output.includes("Preview with kanso dev"));
    assert.ok(output.includes("kanso build"));
  });

  it("page suggests preview and build", () => {
    const site = join(TEST_DIR, "site");
    const output = execSync(`node ${CLI_PATH} page "Contact"`, {
      cwd: site,
      encoding: "utf-8",
    });
    assert.ok(output.includes("Preview with kanso dev"));
  });

  it("successful build suggests serve", () => {
    const site = join(TEST_DIR, "site");
    const output = execSync(`node ${CLI_PATH} build`, {
      cwd: site,
      encoding: "utf-8",
    });
    assert.ok(output.includes("Preview with kanso serve"));
  });
});