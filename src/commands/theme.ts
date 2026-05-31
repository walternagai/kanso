import { themeList, themeAdd, themeRemove, themeInfo, themeStatus } from "../themes/index.js";
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

export function themeRemoveCommand(themeName: string, options: ThemeOptions): void {
  if (!themeName) {
    error("Theme name is required.");
    info("Usage: kanso theme remove <theme-name>");
    process.exit(1);
  }
  themeRemove(process.cwd(), themeName, options);
}

export function themeInfoCommand(themeName: string): void {
  if (!themeName) {
    error("Theme name is required.");
    info("Usage: kanso theme info <theme-name>");
    process.exit(1);
  }
  themeInfo(themeName);
}

export function themeStatusCommand(): void {
  themeStatus(process.cwd());
}
