import { build } from "../engine/build.js";
import { error } from "../utils/logger.js";

interface BuildOptions {
  verbose?: boolean;
}

export async function buildCommand(options: BuildOptions = {}): Promise<void> {
  try {
    const result = await build(process.cwd(), { verbose: options.verbose });
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
