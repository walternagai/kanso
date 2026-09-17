import { rmSync, existsSync } from "fs";
import { join } from "path";
import { success, info, error } from "../utils/logger.js";
import { loadConfig } from "../engine/build.js";

export async function cleanCommand(): Promise<void> {
  const projectRoot = process.cwd();
  const hasConfig = existsSync(join(projectRoot, "kanso.config.js"));
  const hasContent = existsSync(join(projectRoot, "content"));

  if (!hasConfig && !hasContent) {
    error("This does not look like a Kanso project (no kanso.config.js or content/).");
    info("Run `kanso init <name>` first.");
    process.exit(1);
  }

  const config = await loadConfig(projectRoot);
  const outputDir = join(projectRoot, config.output.dir);

  if (outputDir === projectRoot) {
    error(
      `Refusing to delete: output.dir ("${config.output.dir}") resolves to the project root.`
    );
    process.exit(1);
  }
  if (existsSync(join(outputDir, "kanso.config.js"))) {
    error(
      `Refusing to delete: output.dir ("${config.output.dir}") contains kanso.config.js.`
    );
    process.exit(1);
  }

  if (!existsSync(outputDir)) {
    info(`${config.output.dir}/ does not exist, nothing to clean.`);
    return;
  }

  rmSync(outputDir, { recursive: true, force: true });
  success(`${config.output.dir}/ removed.`);
}