import { build } from "../engine/build.js";
import { error } from "../utils/logger.js";

export async function buildCommand(): Promise<void> {
  try {
    const result = await build(process.cwd());
    if (result.errors.length > 0) {
      error(`${result.errors.length} page(s) failed to build`);
      process.exit(1);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    error(`Build failed: ${msg}`);
    process.exit(1);
  }
}
