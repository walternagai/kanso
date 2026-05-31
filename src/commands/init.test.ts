import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(process.cwd(), ".test-projects");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("kanso init", () => {
  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("creates a project with all expected files", () => {
    const projectDir = join(TEST_DIR, "test-project");
    execSync(`node ${CLI_PATH} init test-project`, { cwd: TEST_DIR });

    const expectedFiles = [
      "kanso.config.js",
      "package.json",
      "content/index.md",
      "content/posts/hello-world.md",
      "layouts/base.html",
      "layouts/post.html",
      "components/header.html",
      "components/footer.html",
      "assets/css/style.css",
      "assets/js/main.js",
    ];

    for (const file of expectedFiles) {
      assert.ok(existsSync(join(projectDir, file)), `Missing: ${file}`);
    }
  });

  it("generates correct package.json with kanso scripts", () => {
    const projectDir = join(TEST_DIR, "my-blog");
    execSync(`node ${CLI_PATH} init my-blog`, { cwd: TEST_DIR });

    const pkg = JSON.parse(
      readFileSync(join(projectDir, "package.json"), "utf-8")
    );
    assert.strictEqual(pkg.name, "my-blog");
    assert.strictEqual(pkg.scripts.dev, "kanso dev");
    assert.strictEqual(pkg.scripts.build, "kanso build");
    assert.strictEqual(pkg.scripts.deploy, "kanso deploy");
  });

  it("generates valid kanso.config.js", () => {
    const projectDir = join(TEST_DIR, "cfg-test");
    execSync(`node ${CLI_PATH} init cfg-test`, { cwd: TEST_DIR });

    const config = readFileSync(
      join(projectDir, "kanso.config.js"),
      "utf-8"
    );
    assert.ok(config.includes("site:"), "Missing site config");
    assert.ok(config.includes("content:"), "Missing content config");
    assert.ok(config.includes("output:"), "Missing output config");
  });

  it("fails if directory already exists without --force", () => {
    mkdirSync(join(TEST_DIR, "existing"), { recursive: true });
    try {
      execSync(`node ${CLI_PATH} init existing`, {
        cwd: TEST_DIR,
        stdio: "pipe",
      });
      assert.fail("Should have thrown");
    } catch (e: any) {
      assert.ok(e.stderr.toString().includes("already exists"));
    }
  });

  it("overwrites with --force flag", () => {
    const projectDir = join(TEST_DIR, "force-test");
    mkdirSync(projectDir, { recursive: true });
    execSync(`node ${CLI_PATH} init force-test --force`, { cwd: TEST_DIR });
    assert.ok(existsSync(join(projectDir, "kanso.config.js")));
  });

  it("generates base.html with template syntax", () => {
    const projectDir = join(TEST_DIR, "tmpl-test");
    execSync(`node ${CLI_PATH} init tmpl-test`, { cwd: TEST_DIR });

    const layout = readFileSync(
      join(projectDir, "layouts/base.html"),
      "utf-8"
    );
    assert.ok(layout.includes("{{ title }}"));
    assert.ok(layout.includes("{{ site.title }}"));
    assert.ok(layout.includes('{{ include "header" }}'));
  });

  it("generates index.md with front matter", () => {
    const projectDir = join(TEST_DIR, "md-test");
    execSync(`node ${CLI_PATH} init md-test`, { cwd: TEST_DIR });

    const index = readFileSync(
      join(projectDir, "content/index.md"),
      "utf-8"
    );
    assert.ok(index.startsWith("---"));
    assert.ok(index.includes("title:"));
    assert.ok(index.includes("layout:"));
  });
});
