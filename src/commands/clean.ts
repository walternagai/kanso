import { rmSync, existsSync } from "fs";
import { join } from "path";
import { success, info } from "../utils/logger.js";

export function cleanCommand(): void {
  const distDir = join(process.cwd(), "dist");

  if (!existsSync(distDir)) {
    info("dist/ does not exist, nothing to clean.");
    return;
  }

  rmSync(distDir, { recursive: true, force: true });
  success("dist/ removed.");
}
