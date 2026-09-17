import { describe, it } from "node:test";
import assert from "node:assert";
import { parsePort } from "./port.js";

describe("parsePort", () => {
  it("parses valid port", () => {
    assert.strictEqual(parsePort("3000"), 3000);
    assert.strictEqual(parsePort("8080"), 8080);
  });

  it("defaults to 3000 when undefined", () => {
    assert.strictEqual(parsePort(undefined), 3000);
  });

  it("throws on non-numeric input", () => {
    assert.throws(() => parsePort("abc"), /Invalid port/);
  });

  it("throws on port below 1", () => {
    assert.throws(() => parsePort("0"), /Invalid port/);
  });

  it("throws on port above 65535", () => {
    assert.throws(() => parsePort("70000"), /Invalid port/);
  });
});