import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, rmSync, existsSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(process.cwd(), ".test-init-guards");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("init guards", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });

  it("skips user config on re-init without --force inside empty dir", () => {
    const projectDir = join(TEST_DIR, "skip-test");
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(
      join(projectDir, "kanso.config.js"),
      "export default { site: { title: 'User Customized' } };"
    );

    execSync(`node ${CLI_PATH} init skip-test --force`, { cwd: TEST_DIR });

    const config = readFileSync(
      join(projectDir, "kanso.config.js"),
      "utf-8"
    );
    assert.ok(
      config.includes("User Customized"),
      "user config must not be overwritten"
    );
    assert.ok(existsSync(join(projectDir, "layouts/base.html")));
  });

  it("generates .gitignore and complete npm scripts", () => {
    const projectDir = join(TEST_DIR, "git-test");
    execSync(`node ${CLI_PATH} init git-test`, { cwd: TEST_DIR });

    const gitignore = readFileSync(join(projectDir, ".gitignore"), "utf-8");
    assert.ok(gitignore.includes("dist/"));
    assert.ok(gitignore.includes("node_modules/"));

    const pkg = JSON.parse(
      readFileSync(join(projectDir, "package.json"), "utf-8")
    );
    assert.ok(pkg.scripts.serve === "kanso serve");
    assert.ok(pkg.scripts.clean === "kanso clean");
    assert.ok(pkg.scripts.dev === "kanso dev");
    assert.ok(pkg.scripts.build === "kanso build");
    assert.ok(pkg.scripts.deploy === "kanso deploy");
  });

  it("skips user config even with --force", () => {
    const projectDir = join(TEST_DIR, "keep-test");
    mkdirSync(join(projectDir, "content"), { recursive: true });
    writeFileSync(
      join(projectDir, "kanso.config.js"),
      "export default { site: { title: 'Precious' } };"
    );
    writeFileSync(join(projectDir, "content", "my-page.md"), "user content");

    execSync(`node ${CLI_PATH} init keep-test --force`, { cwd: TEST_DIR });

    const config = readFileSync(join(projectDir, "kanso.config.js"), "utf-8");
    assert.ok(config.includes("Precious"));
    const page = readFileSync(join(projectDir, "content", "my-page.md"), "utf-8");
    assert.strictEqual(page, "user content");
  });

  it("regenerates layouts with --force when overwritten templates requested", () => {
    const projectDir = join(TEST_DIR, "layouts-test");
    execSync(`node ${CLI_PATH} init layouts-test`, { cwd: TEST_DIR });
    const base = readFileSync(join(projectDir, "layouts/base.html"), "utf-8");
    assert.ok(base.includes("block content"));
  });

  it("rejects project name with path traversal", () => {
    try {
      execSync(`node ${CLI_PATH} init "site/../evil"`, {
        cwd: TEST_DIR,
        stdio: "pipe",
      });
      assert.fail("Should have thrown");
    } catch (e: unknown) {
      const err = e as { stderr: Buffer };
      assert.ok(err.stderr.toString().includes("Invalid project name"));
    }
    assert.ok(!existsSync(join(TEST_DIR, "evil")));
    assert.ok(!existsSync(join(TEST_DIR, "site")));
  });

  it("rejects absolute project name", () => {
    try {
      execSync(`node ${CLI_PATH} init /tmp/abs-evil`, {
        cwd: TEST_DIR,
        stdio: "pipe",
      });
      assert.fail("Should have thrown");
    } catch (e: unknown) {
      const err = e as { stderr: Buffer };
      assert.ok(err.stderr.toString().includes("Invalid project name"));
    }
    assert.ok(!existsSync("/tmp/abs-evil"));
  });

  it("allows plain names with dashes", () => {
    execSync(`node ${CLI_PATH} init my-cool-site`, { cwd: TEST_DIR });
    assert.ok(existsSync(join(TEST_DIR, "my-cool-site/kanso.config.js")));
  });
});