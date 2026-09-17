import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import http from "http";
import { createServer } from "http";

const TEST_DIR = join(process.cwd(), ".test-serve");

describe("createHandler", () => {
  const outputDir = join(TEST_DIR, "dist");

  before(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(join(outputDir, "index.html"), "<h1>Hello</h1>");
    writeFileSync(join(outputDir, "style.css"), "body {}");
    mkdirSync(join(outputDir, "posts"), { recursive: true });
    writeFileSync(join(outputDir, "posts", "index.html"), "<h1>Posts</h1>");
  });

  after(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  function withServer(
    handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
    fn: (url: string) => Promise<void>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = createServer(handler);
      let port: number;
      server.listen(0, () => {
        port = (server.address() as { port: number }).port;
        fn(`http://localhost:${port}`).then(
          () => server.close(() => resolve()),
          (err) => { server.close(() => reject(err)); }
        );
      });
    });
  }

  it("serves index.html at /", async () => {
    const { createHandler } = await import("./serve.js");
    await withServer(createHandler(outputDir), async (base) => {
      const res = await fetch(base + "/");
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.includes("<h1>Hello</h1>"));
    });
  });

  it("serves file by exact path", async () => {
    const { createHandler } = await import("./serve.js");
    await withServer(createHandler(outputDir), async (base) => {
      const res = await fetch(base + "/style.css");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body, "body {}");
    });
  });

  it("serves subdirectory index.html", async () => {
    const { createHandler } = await import("./serve.js");
    await withServer(createHandler(outputDir), async (base) => {
      const res = await fetch(base + "/posts/");
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.includes("<h1>Posts</h1>"));
    });
  });

  it("returns 404 for missing pages", async () => {
    const { createHandler } = await import("./serve.js");
    await withServer(createHandler(outputDir), async (base) => {
      const res = await fetch(base + "/missing");
      assert.strictEqual(res.status, 404);
    });
  });

  it("returns custom 404.html when available", async () => {
    writeFileSync(join(outputDir, "404.html"), "<h1>Custom Not Found</h1>");
    const { createHandler } = await import("./serve.js");
    await withServer(createHandler(outputDir), async (base) => {
      const res = await fetch(base + "/nope");
      assert.strictEqual(res.status, 404);
      assert.ok(res.body.includes("<h1>Custom Not Found</h1>"));
    });
  });

  it("blocks path traversal outside outputDir", async () => {
    const { createHandler } = await import("./serve.js");
    await withServerRaw(createHandler(outputDir), "/../kanso.config.js", async (base) => {
      const res = await fetchRaw(base.host, base.port, "/../kanso.config.js");
      assert.strictEqual(res.status, 403);
    });
  });
});

function withServerRaw(
  handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
  _rawPath: string,
  fn: (base: { host: string; port: number }) => Promise<void>
): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = createServer(handler);
    let port: number;
    server.listen(0, () => {
      port = (server.address() as { port: number }).port;
      fn({ host: "localhost", port }).then(
        () => server.close(() => resolve()),
        (err) => { server.close(() => reject(err)); }
      );
    });
  });
}

function fetchRaw(
  host: string,
  port: number,
  rawPath: string
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    http
      .get({ host, port, path: rawPath }, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () =>
          resolve({ status: res.statusCode || 0, body })
        );
      })
      .on("error", reject);
  });
}

function fetch(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () =>
          resolve({ status: res.statusCode || 0, body })
        );
      })
      .on("error", reject);
  });
}
