import { build } from "../engine/build.js";
import { error } from "../utils/logger.js";

export async function buildCommand(): Promise<void> {
  try {
    await build(process.cwd());
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    error(`Build failed: ${msg}`);
    process.exit(1);
  }
}
