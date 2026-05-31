import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { TemplateEngine } from "./template.js";

const TEST_DIR = join(process.cwd(), ".test-template");

describe("TemplateEngine", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, "layouts"), { recursive: true });
    mkdirSync(join(TEST_DIR, "components"), { recursive: true });
  });

  it("renders variable interpolation", () => {
    writeFileSync(
      join(TEST_DIR, "layouts/base.html"),
      "<h1>{{ title }}</h1>"
    );
    const engine = new TemplateEngine(TEST_DIR);
    const result = engine.render("base", { title: "Hello" });
    assert.strictEqual(result, "<h1>Hello</h1>");
  });

  it("renders nested variable access", () => {
    writeFileSync(
      join(TEST_DIR, "layouts/base.html"),
      "<title>{{ site.title }}</title>"
    );
    const engine = new TemplateEngine(TEST_DIR);
    const result = engine.render("base", {
      site: { title: "My Site" },
    });
    assert.strictEqual(result, "<title>My Site</title>");
  });

  it("renders conditionals (if/else)", () => {
    writeFileSync(
      join(TEST_DIR, "layouts/base.html"),
      "{% if show %}Yes{% else %}No{% endif %}"
    );
    const engine = new TemplateEngine(TEST_DIR);

    const withTrue = engine.render("base", { show: true });
    assert.strictEqual(withTrue, "Yes");

    const withFalse = engine.render("base", { show: false });
    assert.strictEqual(withFalse, "No");
  });

  it("renders loops (for)", () => {
    writeFileSync(
      join(TEST_DIR, "layouts/base.html"),
      "{% for item in items %}<p>{{ item }}</p>{% endfor %}"
    );
    const engine = new TemplateEngine(TEST_DIR);
    const result = engine.render("base", {
      items: ["A", "B", "C"],
    });
    assert.strictEqual(result, "<p>A</p><p>B</p><p>C</p>");
  });

  it("renders loop metadata (loop.index)", () => {
    writeFileSync(
      join(TEST_DIR, "layouts/base.html"),
      "{% for item in items %}{{ loop.index }}:{{ item }} {% endfor %}"
    );
    const engine = new TemplateEngine(TEST_DIR);
    const result = engine.render("base", {
      items: ["X", "Y"],
    });
    assert.strictEqual(result, "1:X 2:Y ");
  });

  it("includes partials", () => {
    writeFileSync(
      join(TEST_DIR, "components/header.html"),
      "<header>Logo</header>"
    );
    writeFileSync(
      join(TEST_DIR, "layouts/base.html"),
      '{% include "header.html" %}<main></main>'
    );
    const engine = new TemplateEngine(TEST_DIR);
    const result = engine.render("base", {});
    assert.strictEqual(result, "<header>Logo</header><main></main>");
  });

  it("handles missing template with error", () => {
    const engine = new TemplateEngine(TEST_DIR);
    assert.throws(() => {
      engine.render("nonexistent", {});
    }, /template not found/);
  });

  it("handles empty collection in loop (no error)", () => {
    writeFileSync(
      join(TEST_DIR, "layouts/base.html"),
      "{% for item in items %}<p>{{ item }}</p>{% endfor %}"
    );
    const engine = new TemplateEngine(TEST_DIR);
    const result = engine.render("base", { items: [] });
    assert.strictEqual(result, "");
  });

  it("renders raw/unescaped HTML with safe filter", () => {
    writeFileSync(
      join(TEST_DIR, "layouts/base.html"),
      "{{ htmlContent | safe }}"
    );
    const engine = new TemplateEngine(TEST_DIR);
    const result = engine.render("base", {
      htmlContent: "<b>bold</b>",
    });
    assert.strictEqual(result, "<b>bold</b>");
  });

  it("supports layout inheritance with extends and block", () => {
    writeFileSync(
      join(TEST_DIR, "layouts/base.html"),
      "<!DOCTYPE html><body>{% block content %}Default{% endblock %}</body>"
    );
    writeFileSync(
      join(TEST_DIR, "layouts/page.html"),
      '{% extends "base.html" %}\n{% block content %}<h1>{{ title }}</h1>{% endblock %}'
    );
    const engine = new TemplateEngine(TEST_DIR);
    const result = engine.render("page", { title: "My Page" });
    assert.strictEqual(
      result,
      "<!DOCTYPE html><body><h1>My Page</h1></body>"
    );
  });
});
