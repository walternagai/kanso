import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { execSync, spawn, ChildProcess } from "child_process";
import http from "http";

const TEST_DIR = join(process.cwd(), ".test-dev");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

function fetch(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode || 0, body }));
      })
      .on("error", reject);
  });
}

describe("kanso dev", () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} init . --force`, { cwd: TEST_DIR });
  });

  it("starts server and serves index page", async () => {
    const child = spawn("node", [CLI_PATH, "dev", "--port", "3456"], {
      cwd: TEST_DIR,
      stdio: "pipe",
    });

    await new Promise<void>((resolve) => {
      child.stdout?.on("data", (data: Buffer) => {
        if (data.toString().includes("http://localhost:3456")) {
          resolve();
        }
      });
    });

    try {
      const res = await fetch("http://localhost:3456/");
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.includes("Welcome"));
      assert.ok(res.body.includes("__kanso_ws"));
    } finally {
      child.kill();
    }
  });

  it("serves CSS assets", async () => {
    const child = spawn("node", [CLI_PATH, "dev", "--port", "3457"], {
      cwd: TEST_DIR,
      stdio: "pipe",
    });

    await new Promise<void>((resolve) => {
      child.stdout?.on("data", (data: Buffer) => {
        if (data.toString().includes("http://localhost:3457")) {
          resolve();
        }
      });
    });

    try {
      const res = await fetch("http://localhost:3457/assets/css/style.css");
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.includes("font-family"));
    } finally {
      child.kill();
    }
  });

  it("returns 404 for missing pages", async () => {
    const child = spawn("node", [CLI_PATH, "dev", "--port", "3458"], {
      cwd: TEST_DIR,
      stdio: "pipe",
    });

    await new Promise<void>((resolve) => {
      child.stdout?.on("data", (data: Buffer) => {
        if (data.toString().includes("http://localhost:3458")) {
          resolve();
        }
      });
    });

    try {
      const res = await fetch("http://localhost:3458/nonexistent");
      assert.strictEqual(res.status, 404);
    } finally {
      child.kill();
    }
  });
});
