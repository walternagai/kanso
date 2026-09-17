import { describe, it } from "node:test";
import assert from "node:assert";
import { getMimeType } from "./static-handler.js";

describe("getMimeType", () => {
  it("returns correct type for lowercase extension", () => {
    assert.strictEqual(getMimeType("photo.jpg"), "image/jpeg");
    assert.strictEqual(getMimeType("page.html"), "text/html");
  });

  it("returns correct type for uppercase extension", () => {
    assert.strictEqual(getMimeType("PHOTO.JPG"), "image/jpeg");
    assert.strictEqual(getMimeType("STYLE.CSS"), "text/css");
  });

  it("falls back to octet-stream for unknown extension", () => {
    assert.strictEqual(getMimeType("data.xyz"), "application/octet-stream");
  });
});