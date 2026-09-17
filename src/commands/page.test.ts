import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const TEST_DIR = join(process.cwd(), ".test-page-cmd");
const ORIGINAL_CWD = process.cwd();

describe("kanso page", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, "content"), { recursive: true });
    process.chdir(TEST_DIR);
  });

  afterEach(() => {
    process.chdir(ORIGINAL_CWD);
  });

  it("creates page in content/ with base layout", async () => {
    const { pageCommand } = await import("./page.js");
    pageCommand("About Me", {});

    const filePath = join(TEST_DIR, "content", "about-me.md");
    assert.ok(existsSync(filePath));
    const content = readFileSync(filePath, "utf-8");
    assert.ok(content.includes("title: \"About Me\""));
    assert.ok(content.includes("layout: base"));
    assert.ok(!content.includes("date:"), "pages should not have date");
  });

  it("rejects empty title", async () => {
    const { pageCommand } = await import("./page.js");
    const origExit = process.exit;
    let exitCode: number | null = null;
    process.exit = ((code?: number) => {
      exitCode = code ?? null;
      throw new Error("exit");
    }) as typeof process.exit;
    try {
      pageCommand("", {});
    } catch {
      // expected
    }
    process.exit = origExit;
    assert.strictEqual(exitCode, 1);
  });

  it("rejects existing page file", async () => {
    const { pageCommand } = await import("./page.js");
    writeFileSync(join(TEST_DIR, "content", "about.md"), "existing");
    const origExit = process.exit;
    let exitCode: number | null = null;
    process.exit = ((code?: number) => {
      exitCode = code ?? null;
      throw new Error("exit");
    }) as typeof process.exit;
    try {
      pageCommand("About", {});
    } catch {
      // expected
    }
    process.exit = origExit;
    assert.strictEqual(exitCode, 1);
    const content = readFileSync(
      join(TEST_DIR, "content", "about.md"),
      "utf-8"
    );
    assert.strictEqual(content, "existing", "existing file untouched");
  });
});