import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(process.cwd(), ".test-v04");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("v0.4 — Clean", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init . --force`, { cwd: TEST_DIR });
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });
  });

  it("removes dist/ directory", () => {
    assert.ok(existsSync(join(TEST_DIR, "dist")));
    execSync(`node ${CLI_PATH} clean`, { cwd: TEST_DIR });
    assert.ok(!existsSync(join(TEST_DIR, "dist")));
  });

  it("handles missing dist/ gracefully", () => {
    rmSync(join(TEST_DIR, "dist"), { recursive: true, force: true });
    const output = execSync(`node ${CLI_PATH} clean`, {
      cwd: TEST_DIR,
      encoding: "utf-8",
    });
    assert.ok(output.includes("nothing to clean") || output.includes("does not exist"));
  });
});

describe("v0.4 — Serve", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init . --force`, { cwd: TEST_DIR });
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });
  });

  it("serves dist/ on specified port", async () => {
    const { spawn } = await import("child_process");
    const child = spawn("node", [CLI_PATH, "serve", "--port", "3459"], {
      cwd: TEST_DIR,
      stdio: "pipe",
    });

    await new Promise<void>((resolve) => {
      child.stdout?.on("data", (data: Buffer) => {
        if (data.toString().includes("localhost:3459")) resolve();
      });
    });

    try {
      const res = await fetch("http://localhost:3459/");
      assert.strictEqual(res.status, 200);
      assert.ok((await res.text()).includes("Welcome"));
    } finally {
      child.kill();
    }
  });
});

describe("v0.4 — Drafts", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init . --force`, { cwd: TEST_DIR });
  });

  it("excludes draft pages from build", () => {
    writeFileSync(
      join(TEST_DIR, "content", "draft-post.md"),
      "---\ntitle: Draft\ndate: 2026-06-01\nlayout: base\ndraft: true\n---\n\nThis is a draft."
    );
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });
    assert.ok(!existsSync(join(TEST_DIR, "dist", "draft-post", "index.html")));
  });

  it("includes non-draft pages in build", () => {
    writeFileSync(
      join(TEST_DIR, "content", "published.md"),
      "---\ntitle: Published\nlayout: base\n---\n\nThis is published."
    );
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });
    assert.ok(existsSync(join(TEST_DIR, "dist", "published", "index.html")));
  });
});

describe("v0.4 — 404 Page", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init . --force`, { cwd: TEST_DIR });
  });

  it("generates 404.html from content/404.md", () => {
    writeFileSync(
      join(TEST_DIR, "content", "404.md"),
      "---\ntitle: Page Not Found\nlayout: base\n---\n\n# 404\n\nPage not found."
    );
    execSync(`node ${CLI_PATH} build`, { cwd: TEST_DIR });
    assert.ok(existsSync(join(TEST_DIR, "dist", "404.html")));
    const html = readFileSync(join(TEST_DIR, "dist", "404.html"), "utf-8");
    assert.ok(html.includes("404"));
  });
});

describe("v0.4 — Excerpts and Date Filters", () => {
  it("excerpt filter strips HTML and truncates", async () => {
    const { TemplateEngine } = await import("../engine/template.js");
    const engine = new TemplateEngine("/tmp");
    const result = engine.renderString(
      "{{ '<p>Hello world this is a long text</p>' | excerpt(10) }}",
      {}
    );
    assert.ok(result.length <= 14);
    assert.ok(result.includes("..."));
  });

  it("formatDate formats date string", async () => {
    const { TemplateEngine } = await import("../engine/template.js");
    const engine = new TemplateEngine("/tmp");
    const result = engine.renderString(
      "{{ '2026-05-30T12:00:00' | formatDate('DD/MM/YYYY') }}",
      {}
    );
    assert.strictEqual(result, "30/05/2026");
  });

  it("dateToISO formats to ISO", async () => {
    const { TemplateEngine } = await import("../engine/template.js");
    const engine = new TemplateEngine("/tmp");
    const result = engine.renderString(
      "{{ '2026-05-30' | dateToISO }}",
      {}
    );
    assert.ok(result.includes("2026-05-30"));
  });
});
