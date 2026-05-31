import { themeList, themeAdd } from "../themes/index.js";
import { error, info } from "../utils/logger.js";

interface ThemeOptions {
  force?: boolean;
}

export function themeListCommand(): void {
  themeList();
}

export function themeAddCommand(themeName: string, options: ThemeOptions): void {
  if (!themeName) {
    error("Theme name is required.");
    info("Usage: kanso theme add <theme-name>");
    process.exit(1);
  }
  themeAdd(process.cwd(), themeName, options);
}
