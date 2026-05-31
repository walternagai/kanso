import { describe, it } from "node:test";
import assert from "node:assert";
import { minifyHtml } from "./minify.js";

describe("HTML Minifier", () => {
  it("removes HTML comments", () => {
    const input = "<html><!-- comment --><body></body></html>";
    const result = minifyHtml(input);
    assert.ok(!result.includes("<!--"));
    assert.ok(!result.includes("comment"));
  });

  it("collapses whitespace between tags", () => {
    const input = "<html>  <body>    <p>  hello  </p>  </body></html>";
    const result = minifyHtml(input);
    assert.ok(result.includes("<html><body>"));
    assert.ok(result.includes("</body></html>"));
  });

  it("removes type=text/javascript from script tags", () => {
    const input = '<script type="text/javascript">var x=1;</script>';
    const result = minifyHtml(input);
    assert.ok(!result.includes('type="text/javascript"'));
    assert.ok(result.includes("var x=1;"));
  });

  it("removes type=text/css from style tags", () => {
    const input = '<style type="text/css">body{}</style>';
    const result = minifyHtml(input);
    assert.ok(!result.includes('type="text/css"'));
    assert.ok(result.includes("body{}"));
  });

  it("preserves content inside tags", () => {
    const input =
      '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello</h1><p>World</p></body></html>';
    const result = minifyHtml(input);
    assert.ok(result.includes("<title>Test</title>"));
    assert.ok(result.includes("<h1>Hello</h1>"));
    assert.ok(result.includes("<p>World</p>"));
  });

  it("trims leading/trailing whitespace", () => {
    const input = "  <p>test</p>  ";
    const result = minifyHtml(input);
    assert.strictEqual(result, "<p>test</p>");
  });

  it("can skip comment removal", () => {
    const input = "<!-- keep --><p>test</p>";
    const result = minifyHtml(input, { removeComments: false });
    assert.ok(result.includes("<!-- keep -->"));
  });

  it("can skip whitespace collapsing", () => {
    const input = "<p>  hello  </p>";
    const result = minifyHtml(input, { collapseWhitespace: false });
    assert.ok(result.includes("  hello  "));
  });
});
