import { themeList, themeAdd, themeRemove, themeInfo, themeStatus, ThemeError } from "../themes/index.js";
import { error, info } from "../utils/logger.js";

interface ThemeOptions {
  force?: boolean;
}

function handleThemeError(e: unknown): never {
  if (e instanceof ThemeError) {
    error(e.message);
    for (const hint of e.hints) {
      info(hint);
    }
  } else {
    const msg = e instanceof Error ? e.message : String(e);
    error(`Theme command failed: ${msg}`);
  }
  process.exit(1);
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
  try {
    themeAdd(process.cwd(), themeName, options);
  } catch (e: unknown) {
    handleThemeError(e);
  }
}

export function themeRemoveCommand(themeName: string, options: ThemeOptions): void {
  if (!themeName) {
    error("Theme name is required.");
    info("Usage: kanso theme remove <theme-name>");
    process.exit(1);
  }
  try {
    themeRemove(process.cwd(), themeName, options);
  } catch (e: unknown) {
    handleThemeError(e);
  }
}

export function themeInfoCommand(themeName: string): void {
  if (!themeName) {
    error("Theme name is required.");
    info("Usage: kanso theme info <theme-name>");
    process.exit(1);
  }
  try {
    themeInfo(themeName);
  } catch (e: unknown) {
    handleThemeError(e);
  }
}

export function themeStatusCommand(): void {
  themeStatus(process.cwd());
}
