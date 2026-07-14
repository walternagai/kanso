import { describe, it } from "node:test";
import assert from "node:assert";
import {
  themeAddCommand,
  themeRemoveCommand,
  themeInfoCommand,
} from "./theme.js";

describe("theme commands — error handling", () => {
  it("themeAddCommand exits when name is empty", () => {
    const origExit = process.exit;
    let exitCode: number | null = null;
    process.exit = ((code?: number) => {
      exitCode = code ?? null;
      // Prevent further execution by throwing
      throw new Error(`process.exit(${code})`);
    }) as typeof process.exit;

    try {
      themeAddCommand("", {});
    } catch {
      // Expected
    }

    process.exit = origExit;
    assert.strictEqual(exitCode, 1);
  });

  it("themeRemoveCommand exits when name is empty", () => {
    const origExit = process.exit;
    let exitCode: number | null = null;
    process.exit = ((code?: number) => {
      exitCode = code ?? null;
      throw new Error(`process.exit(${code})`);
    }) as typeof process.exit;

    try {
      themeRemoveCommand("", {});
    } catch {
      // Expected
    }

    process.exit = origExit;
    assert.strictEqual(exitCode, 1);
  });

  it("themeInfoCommand exits when name is empty", () => {
    const origExit = process.exit;
    let exitCode: number | null = null;
    process.exit = ((code?: number) => {
      exitCode = code ?? null;
      throw new Error(`process.exit(${code})`);
    }) as typeof process.exit;

    try {
      themeInfoCommand("");
    } catch {
      // Expected
    }

    process.exit = origExit;
    assert.strictEqual(exitCode, 1);
  });
});
