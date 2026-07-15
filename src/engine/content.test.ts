import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { parseContent, parseContentString, renderMarkdown } from "./content.js";

const TEST_DIR = join(process.cwd(), ".test-content");

describe("Content Parser", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });

  it("parses YAML front matter", () => {
    const file = join(TEST_DIR, "test.md");
    writeFileSync(
      file,
      "---\ntitle: Hello World\ndate: 2026-05-30\ntags: [web, dev]\n---\n\nContent here."
    );
    const result = parseContent(file);
    assert.strictEqual(result.frontMatter.title, "Hello World");
    assert.deepStrictEqual(result.frontMatter.tags, ["web", "dev"]);
  });

  it("renders Markdown to HTML", () => {
    const file = join(TEST_DIR, "md.md");
    writeFileSync(file, "---\ntitle: Test\n---\n\n## Heading\n\n**Bold** text.");
    const result = parseContent(file);
    assert.ok(result.htmlContent.includes("<h2>Heading</h2>"));
    assert.ok(result.htmlContent.includes("<strong>Bold</strong>"));
  });

  it("handles missing front matter gracefully", () => {
    const file = join(TEST_DIR, "no-fm.md");
    writeFileSync(file, "Just content, no front matter.");
    const result = parseContent(file);
    assert.deepStrictEqual(result.frontMatter, {});
    assert.ok(result.htmlContent.includes("Just content"));
  });

  it("parses content from string", () => {
    const raw = "---\ntitle: Inline\n---\n\nParagraph.";
    const result = parseContentString(raw, "inline.md");
    assert.strictEqual(result.frontMatter.title, "Inline");
    assert.ok(result.htmlContent.includes("<p>Paragraph.</p>"));
  });

  it("renders syntax highlighting for code blocks", () => {
    const file = join(TEST_DIR, "code.md");
    writeFileSync(
      file,
      '---\ntitle: Code\n---\n\n```javascript\nconst x = 1;\n```'
    );
    const result = parseContent(file);
    assert.ok(result.htmlContent.includes("hljs"));
    assert.ok(result.htmlContent.includes("hljs-keyword"));
  });

  it("renders unordered lists", () => {
    const html = renderMarkdown("- Item 1\n- Item 2");
    assert.ok(html.includes("<ul>"));
    assert.ok(html.includes("<li>Item 1</li>"));
  });

  it("renders tables", () => {
    const html = renderMarkdown("| A | B |\n|---|---|\n| 1 | 2 |");
    assert.ok(html.includes("<table>"));
    assert.ok(html.includes("<td>1</td>"));
  });

  it("renders blockquotes", () => {
    const html = renderMarkdown("> Quote text");
    assert.ok(html.includes("<blockquote>"));
  });

  it("renders links", () => {
    const html = renderMarkdown("[link](https://example.com)");
    assert.ok(html.includes('href="https://example.com"'));
  });

  it("renders images", () => {
    const html = renderMarkdown("![alt](img.png)");
    assert.ok(html.includes("<img"));
    assert.ok(html.includes('src="img.png"'));
  });

  it("generates slug from file path", () => {
    const file = join(TEST_DIR, "my-first-post.md");
    writeFileSync(file, "---\ntitle: Test\n---\n\nBody.");
    const result = parseContent(file);
    assert.strictEqual(result.slug, "my-first-post");
  });
});
