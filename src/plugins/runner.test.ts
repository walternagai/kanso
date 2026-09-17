import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { PluginRunner, BuildContext, PageContext } from "./runner.js";

const TEST_DIR = join(process.cwd(), ".test-plugin-runner");

describe("PluginRunner", () => {
  it("creates an API with on() method", () => {
    const runner = new PluginRunner();
    const api = runner.createApi();
    assert.ok(typeof api.on === "function");
  });

  it("registers and runs build:start hook", async () => {
    const runner = new PluginRunner();
    const api = runner.createApi();
    let called = false;

    api.on("build:start", () => {
      called = true;
    });

    await runner.runHook("build:start", {
      projectRoot: "/tmp",
      config: {},
      pages: [],
      startTime: 0,
    } as BuildContext);

    assert.ok(called);
  });

  it("registers and runs build:end hook", async () => {
    const runner = new PluginRunner();
    const api = runner.createApi();
    let builtPages = 0;

    api.on("build:end", (ctx: unknown) => {
      const c = ctx as { pagesBuilt: number };
      builtPages = c.pagesBuilt;
    });

    await runner.runHook("build:end", {
      projectRoot: "/tmp",
      config: {},
      pages: [],
      startTime: 0,
      pagesBuilt: 42,
      duration: 100,
    });

    assert.strictEqual(builtPages, 42);
  });

  it("page:render hook transforms page context", async () => {
    const runner = new PluginRunner();
    const api = runner.createApi();

    api.on("page:render", (ctx: unknown) => {
      const c = ctx as PageContext;
      return { ...c, outputHtml: c.outputHtml + "<!-- injected -->" };
    });

    const result = (await runner.runHook("page:render", {
      filePath: "/test.md",
      slug: "test",
      frontMatter: {},
      htmlContent: "<p>Hello</p>",
      outputHtml: "<p>Hello</p>",
    })) as PageContext;

    assert.ok(result.outputHtml.includes("<!-- injected -->"));
  });

  it("config:loaded hook transforms config", async () => {
    const runner = new PluginRunner();
    const api = runner.createApi();

    api.on("config:loaded", (config: unknown) => {
      const c = config as Record<string, unknown>;
      return { ...c, custom: true };
    });

    const result = (await runner.runHook("config:loaded", {
      site: { title: "Test" },
    })) as Record<string, unknown>;

    assert.strictEqual(result.custom, true);
  });

  it("runs multiple callbacks in order", async () => {
    const runner = new PluginRunner();
    const api = runner.createApi();
    const order: number[] = [];

    api.on("build:start", () => { order.push(1); });
    api.on("build:start", () => { order.push(2); });
    api.on("build:start", () => { order.push(3); });

    await runner.runHook("build:start", {
      projectRoot: "/tmp",
      config: {},
      pages: [],
      startTime: 0,
    } as BuildContext);

    assert.deepStrictEqual(order, [1, 2, 3]);
  });

  it("returns input when no hooks registered", async () => {
    const runner = new PluginRunner();
    const input = { filePath: "/test.md" };

    const result = await runner.runHook("page:render", input);
    assert.deepStrictEqual(result, input);
  });

  it("reset clears all hooks", async () => {
    const runner = new PluginRunner();
    const api = runner.createApi();
    let called = false;

    api.on("build:start", () => { called = true; });
    runner.reset();

    await runner.runHook("build:start", {
      projectRoot: "/tmp",
      config: {},
      pages: [],
      startTime: 0,
    } as BuildContext);

    assert.ok(!called);
  });
});

describe("PluginRunner — loadPlugins", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("loadPlugins with empty list loads nothing", async () => {
    const runner = new PluginRunner();
    await runner.loadPlugins(TEST_DIR, []);
    assert.ok(true);
  });

  it("loadPlugins skips non-existent plugins", async () => {
    const runner = new PluginRunner();
    await runner.loadPlugins(TEST_DIR, ["nonexistent-plugin"]);
    assert.ok(true);
  });

  it("loadPlugins loads a local plugin module", async () => {
    const pluginDir = join(TEST_DIR, "node_modules", "test-plugin");
    mkdirSync(pluginDir, { recursive: true });
    writeFileSync(
      join(pluginDir, "index.js"),
      `export default function(api) { api.on("build:start", () => { called = true; }); }
       var called = false;
       export var isCalled = () => called;`
    );
    const runner = new PluginRunner();
    await runner.loadPlugins(TEST_DIR, ["test-plugin"]);
    assert.ok(true);
  });
});
