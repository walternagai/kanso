import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, rmSync, existsSync, writeFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(process.cwd(), ".test-clean-guards");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("clean guards", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });

  it("cleans custom output.dir from config", () => {
    execSync(`node ${CLI_PATH} init site`, { cwd: TEST_DIR });
    const site = join(TEST_DIR, "site");
    writeFileSync(
      join(site, "kanso.config.js"),
      `export default { output: { dir: "build" } };`
    );
    mkdirSync(join(site, "build"), { recursive: true });
    writeFileSync(join(site, "build", "index.html"), "<h1>x</h1>");

    execSync(`node ${CLI_PATH} clean`, { cwd: site });

    assert.ok(!existsSync(join(site, "build")));
    assert.ok(existsSync(join(site, "content")), "content untouched");
  });

  it("refuses to clean outside a Kanso project", () => {
    const result = execSync(
      `node ${CLI_PATH} clean 2>&1; echo "EXIT:$?"`,
      { cwd: TEST_DIR, encoding: "utf-8", shell: "/bin/bash" }
    );
    assert.ok(result.includes("EXIT:1"));
    assert.ok(result.includes("not look like a Kanso project"));
  });

  it("refuses to clean when output.dir is project root", () => {
    execSync(`node ${CLI_PATH} init site`, { cwd: TEST_DIR });
    const site = join(TEST_DIR, "site");
    writeFileSync(
      join(site, "kanso.config.js"),
      `export default { output: { dir: "." } };`
    );

    const result = execSync(
      `node ${CLI_PATH} clean 2>&1; echo "EXIT:$?"`,
      { cwd: site, encoding: "utf-8", shell: "/bin/bash" }
    );
    assert.ok(result.includes("EXIT:1"));
    assert.ok(result.includes("Refusing to delete"));
  });
});