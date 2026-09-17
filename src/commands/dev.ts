import { devServer } from "../engine/server.js";
import { error } from "../utils/logger.js";
import { parsePort } from "../utils/port.js";

interface DevOptions {
  port?: string;
  host?: string;
}

export async function devCommand(options: DevOptions): Promise<void> {
  try {
    await devServer(process.cwd(), {
      port: parsePort(options.port),
      host: options.host || "localhost",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    error(`Dev server failed: ${msg}`);
    process.exit(1);
  }
}
