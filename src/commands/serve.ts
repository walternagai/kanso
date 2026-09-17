import { createServer, IncomingMessage, ServerResponse } from "http";
import { existsSync } from "fs";
import { join } from "path";
import { heading, error, info } from "../utils/logger.js";
import { parsePort } from "../utils/port.js";
import { createStaticHandler } from "../engine/static-handler.js";

interface ServeOptions {
  port?: string;
  host?: string;
}

/** @returns {void} — starts a long-running HTTP server */
export function serveCommand(options: ServeOptions): void {
  let port: number;
  try {
    port = parsePort(options.port);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    error(msg);
    process.exit(1);
  }
  const host = options.host || "localhost";
  const outputDir = join(process.cwd(), "dist");

  if (!existsSync(outputDir)) {
    error("dist/ not found. Run `kanso build` first.");
    process.exit(1);
  }

  heading("Kanso Serve");

  const server = createServer(createHandler(outputDir));

  server.listen(port, host, () => {
    info(`Serving dist/ at http://${host}:${port}`);
    console.log("");
    info("Press Ctrl+C to stop.");
  });

  process.on("SIGINT", () => server.close());
}

/** Exported for testing — creates the HTTP request handler */
export function createHandler(
  outputDir: string
): (req: IncomingMessage, res: ServerResponse) => void {
  return createStaticHandler(outputDir);
}
