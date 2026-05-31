import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(process.cwd(), ".test-theme");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("Theme System", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init . --force`, { cwd: TEST_DIR });
  });

  it("lists available themes", () => {
    const output = execSync(`node ${CLI_PATH} theme list`, {
      encoding: "utf-8",
    });
    assert.ok(output.includes("blog"));
    assert.ok(output.includes("docs"));
    assert.ok(output.includes("academic"));
    assert.ok(output.includes("research-group"));
  });

  it("installs academic theme", () => {
    execSync(`node ${CLI_PATH} theme add academic`, { cwd: TEST_DIR });

    assert.ok(existsSync(join(TEST_DIR, "layouts", "base.html")));
    assert.ok(existsSync(join(TEST_DIR, "layouts", "post.html")));
    assert.ok(existsSync(join(TEST_DIR, "layouts", "page.html")));
    assert.ok(existsSync(join(TEST_DIR, "assets", "css", "style.css")));
    assert.ok(existsSync(join(TEST_DIR, "assets", "js", "theme.js")));
  });

  it("academic theme has dark mode CSS", () => {
    execSync(`node ${CLI_PATH} theme add academic --force`, { cwd: TEST_DIR });

    const css = readFileSync(
      join(TEST_DIR, "assets", "css", "style.css"),
      "utf-8"
    );
    assert.ok(css.includes('[data-theme="dark"]'));

    const js = readFileSync(
      join(TEST_DIR, "assets", "js", "theme.js"),
      "utf-8"
    );
    assert.ok(js.includes("toggleTheme"));
  });

  it("academic theme has navigation", () => {
    execSync(`node ${CLI_PATH} theme add academic --force`, { cwd: TEST_DIR });

    const html = readFileSync(
      join(TEST_DIR, "layouts", "base.html"),
      "utf-8"
    );
    assert.ok(html.includes("Ensino"));
    assert.ok(html.includes("Pesquisa"));
    assert.ok(html.includes("Extensão"));
  });

  it("installs blog theme", () => {
    execSync(`node ${CLI_PATH} theme add blog --force`, { cwd: TEST_DIR });

    assert.ok(existsSync(join(TEST_DIR, "layouts", "base.html")));
    const html = readFileSync(
      join(TEST_DIR, "layouts", "base.html"),
      "utf-8"
    );
    assert.ok(html.includes("Posts"));
  });

  it("installs docs theme with sidebar", () => {
    execSync(`node ${CLI_PATH} theme add docs --force`, { cwd: TEST_DIR });

    const html = readFileSync(
      join(TEST_DIR, "layouts", "base.html"),
      "utf-8"
    );
    assert.ok(html.includes("sidebar"));
  });

  it("installs research-group theme", () => {
    execSync(`node ${CLI_PATH} theme add research-group --force`, { cwd: TEST_DIR });

    const html = readFileSync(
      join(TEST_DIR, "layouts", "base.html"),
      "utf-8"
    );
    assert.ok(html.includes("Projetos"));
    assert.ok(html.includes("Publicações"));
    assert.ok(html.includes("Equipe"));
  });

  it("fails with unknown theme", () => {
    try {
      execSync(`node ${CLI_PATH} theme add nonexistent`, {
        cwd: TEST_DIR,
        stdio: "pipe",
      });
      assert.fail("Should have thrown");
    } catch (e: any) {
      assert.ok(e.stderr.toString().includes("not found"));
    }
  });

  it("skips existing files without --force", () => {
    execSync(`node ${CLI_PATH} theme add blog`, { cwd: TEST_DIR });
    const output = execSync(`node ${CLI_PATH} theme add blog`, {
      cwd: TEST_DIR,
      encoding: "utf-8",
    });
    assert.ok(output.includes("skipped"));
  });
});
