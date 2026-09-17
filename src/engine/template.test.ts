import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import {
  TemplateEngine,
  getTemplateEngine,
  resetTemplateEngine,
} from "./template.js";

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

describe("TemplateEngine — filters and utilities", () => {
  const TEST_DIR_F = join(process.cwd(), ".test-template-filters");

  beforeEach(() => {
    rmSync(TEST_DIR_F, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR_F, "layouts"), { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR_F, { recursive: true, force: true });
  });

  it("formatDate returns empty string for null value", () => {
    const engine = new TemplateEngine(TEST_DIR_F);
    writeFileSync(join(TEST_DIR_F, "layouts/base.html"), "{{ dt | formatDate('YYYY') }}");
    const result = engine.render("base", { dt: null });
    assert.strictEqual(result, "");
  });

  it("formatDate returns original string for invalid date", () => {
    const engine = new TemplateEngine(TEST_DIR_F);
    writeFileSync(
      join(TEST_DIR_F, "layouts/base.html"),
      "{{ dt | formatDate('YYYY') }}"
    );
    const result = engine.render("base", { dt: "not-a-date" });
    assert.strictEqual(result, "not-a-date");
  });

  it("excerpt strips HTML and truncates", () => {
    const engine = new TemplateEngine(TEST_DIR_F);
    writeFileSync(
      join(TEST_DIR_F, "layouts/base.html"),
      "{{ content | excerpt }}"
    );
    const longText = "A".repeat(200);
    const result = engine.render("base", { content: `<p>${longText}</p>` });
    assert.ok(result.length <= 143); // 140 + "..."
    assert.ok(result.endsWith("..."));
  });

  it("excerpt returns empty for null value", () => {
    const engine = new TemplateEngine(TEST_DIR_F);
    writeFileSync(join(TEST_DIR_F, "layouts/base.html"), "{{ content | excerpt }}");
    const result = engine.render("base", { content: null });
    assert.strictEqual(result, "");
  });

  it("excerpt returns full text if under max length", () => {
    const engine = new TemplateEngine(TEST_DIR_F);
    writeFileSync(join(TEST_DIR_F, "layouts/base.html"), "{{ content | excerpt }}");
    const result = engine.render("base", { content: "Short text" });
    assert.strictEqual(result, "Short text");
  });

  it("dateToISO returns ISO string", () => {
    const engine = new TemplateEngine(TEST_DIR_F);
    writeFileSync(
      join(TEST_DIR_F, "layouts/base.html"),
      "{{ dt | dateToISO }}"
    );
    const result = engine.render("base", { dt: "2026-07-13" });
    assert.ok(result.startsWith("2026-07-13"));
  });

  it("dateToISO returns empty for null value", () => {
    const engine = new TemplateEngine(TEST_DIR_F);
    writeFileSync(join(TEST_DIR_F, "layouts/base.html"), "{{ dt | dateToISO }}");
    const result = engine.render("base", { dt: null });
    assert.strictEqual(result, "");
  });

  it("dateToUTC returns UTC string", () => {
    const engine = new TemplateEngine(TEST_DIR_F);
    writeFileSync(
      join(TEST_DIR_F, "layouts/base.html"),
      "{{ dt | dateToUTC }}"
    );
    const result = engine.render("base", { dt: "2026-07-13" });
    assert.ok(result.includes("2026"));
    assert.ok(result.includes("Jul") || result.includes("July"));
  });

  it("dateToUTC returns empty string for null value", () => {
    const engine = new TemplateEngine(TEST_DIR_F);
    writeFileSync(join(TEST_DIR_F, "layouts/base.html"), "{{ dt | dateToUTC }}");
    const result = engine.render("base", { dt: null });
    assert.strictEqual(result, "");
  });

  it("dateToUTC returns original string for invalid date", () => {
    const engine = new TemplateEngine(TEST_DIR_F);
    writeFileSync(
      join(TEST_DIR_F, "layouts/base.html"),
      "{{ dt | dateToUTC }}"
    );
    const result = engine.render("base", { dt: "not-a-date" });
    assert.strictEqual(result, "not-a-date");
  });

  it("render accepts .html suffix directly", () => {
    const engine = new TemplateEngine(TEST_DIR_F);
    writeFileSync(
      join(TEST_DIR_F, "layouts/base.html"),
      "{{ title }}"
    );
    const result = engine.render("base.html", { title: "Works" });
    assert.strictEqual(result, "Works");
  });

  it("formatDate replaces repeated tokens (regression: first-occurrence-only)", () => {
    const engine = new TemplateEngine(TEST_DIR_F);
    writeFileSync(
      join(TEST_DIR_F, "layouts/base.html"),
      "{{ dt | formatDate('MM/YYYY/MM') }}"
    );
    const result = engine.render("base", { dt: "2026-05-07" });
    assert.strictEqual(result, "05/2026/05");
  });

  it("formatDate replaces all occurrences of each token", () => {
    const engine = new TemplateEngine(TEST_DIR_F);
    writeFileSync(
      join(TEST_DIR_F, "layouts/base.html"),
      "{{ dt | formatDate('YYYY/YYYY') }}"
    );
    const result = engine.render("base", { dt: "2026-05-07" });
    assert.strictEqual(result, "2026/2026");
  });
});

describe("getTemplateEngine / resetTemplateEngine", () => {
  const TEST_DIR_G = join(process.cwd(), ".test-template-global");

  beforeEach(() => {
    rmSync(TEST_DIR_G, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR_G, "layouts"), { recursive: true });
    writeFileSync(join(TEST_DIR_G, "layouts/base.html"), "{{ title }}");
  });

  afterEach(() => {
    resetTemplateEngine();
    rmSync(TEST_DIR_G, { recursive: true, force: true });
  });

  it("getTemplateEngine returns singleton", () => {
    const a = getTemplateEngine(TEST_DIR_G);
    const b = getTemplateEngine(TEST_DIR_G);
    assert.strictEqual(a, b);
  });

  it("resetTemplateEngine clears singleton", () => {
    const a = getTemplateEngine(TEST_DIR_G);
    resetTemplateEngine();
    const b = getTemplateEngine(TEST_DIR_G);
    assert.notStrictEqual(a, b);
  });
});
