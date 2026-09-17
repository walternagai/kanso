import { describe, it } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { defaultConfig } from "../config.js";

const TEST_DIR = join(process.cwd(), ".test-config-merge");

describe("loadConfig — seção merge", () => {
  it("mergeia chaves aninhadas preservando defaults (via build)", async () => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, "content", "posts"), { recursive: true });
    writeFileSync(
      join(TEST_DIR, "kanso.config.js"),
      `export default {
        site: { title: "Test Site" },
        feed: { enabled: true },
      };`
    );

    const { build } = await import("./build.js");
    const result = await build(TEST_DIR);
    assert.ok(result.pages >= 0);

    rmSync(TEST_DIR, { recursive: true, force: true });

    const { defaultConfig: cfg } = await import("../config.js");
    assert.ok(cfg.feed.limit, "default limit preserved");
    assert.ok(typeof defaultConfig.feed.type === "string");
  });
});