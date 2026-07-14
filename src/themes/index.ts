import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from "fs";
import { join } from "path";
import { success, error, info, warn } from "../utils/logger.js";
import { blogTheme } from "./blog.js";
import { docsTheme } from "./docs.js";
import { academicTheme } from "./academic.js";
import { researchGroupTheme } from "./research-group.js";
import { ThemeManifest } from "./types.js";

export type { ThemeManifest };

export function getBundledThemes(): Record<string, ThemeManifest> {
  return {
    blog: blogTheme(),
    docs: docsTheme(),
    academic: academicTheme(),
    "research-group": researchGroupTheme(),
  };
}

export function themeList(): void {
  const themes = getBundledThemes();
  console.log("\nAvailable themes:\n");
  for (const [name, theme] of Object.entries(themes)) {
    console.log(`  ${name}`);
    console.log(`    ${theme.description}\n`);
  }
}

export function themeAdd(
  projectRoot: string,
  themeName: string,
  options: { force?: boolean } = {}
): void {
  const themes = getBundledThemes();
  const theme = themes[themeName];

  if (!theme) {
    error(`Theme "${themeName}" not found.`);
    info(`Available themes: ${Object.keys(themes).join(", ")}`);
    process.exit(1);
  }

  const layoutsDir = join(projectRoot, "layouts");
  mkdirSync(layoutsDir, { recursive: true });

  for (const layout of theme.layouts) {
    const filePath = join(layoutsDir, layout.name);
    if (existsSync(filePath) && !options.force) {
      info(`Layout ${layout.name} already exists (skipped)`);
      continue;
    }
    writeFileSync(filePath, layout.content, "utf-8");
    success(`Created layouts/${layout.name}`);
  }

  for (const asset of theme.assets) {
    const filePath = join(projectRoot, asset.path);
    const dir = filePath.substring(0, filePath.lastIndexOf("/"));
    mkdirSync(dir, { recursive: true });

    if (existsSync(filePath) && !options.force) {
      info(`Asset ${asset.path} already exists (skipped)`);
      continue;
    }
    writeFileSync(filePath, asset.content, "utf-8");
    success(`Created ${asset.path}`);
  }

  console.log("");
  success(`Theme "${themeName}" installed!`);
}

export function themeRemove(
  projectRoot: string,
  themeName: string,
  options: { force?: boolean } = {}
): void {
  const themes = getBundledThemes();
  const theme = themes[themeName];

  if (!theme) {
    error(`Theme "${themeName}" not found.`);
    info(`Available themes: ${Object.keys(themes).join(", ")}`);
    process.exit(1);
  }

  let removed = 0;
  let skipped = 0;

  for (const layout of theme.layouts) {
    const filePath = join(projectRoot, "layouts", layout.name);
    if (!existsSync(filePath)) continue;

    const currentContent = readFileSync(filePath, "utf-8");
    const isModified = currentContent.trim() !== layout.content.trim();

    if (isModified && !options.force) {
      warn(`layouts/${layout.name} has been modified (use --force to remove)`);
      skipped++;
      continue;
    }

    unlinkSync(filePath);
    success(`Removed layouts/${layout.name}`);
    removed++;
  }

  for (const asset of theme.assets) {
    const filePath = join(projectRoot, asset.path);
    if (!existsSync(filePath)) continue;

    const currentContent = readFileSync(filePath, "utf-8");
    const isModified = currentContent.trim() !== asset.content.trim();

    if (isModified && !options.force) {
      warn(`${asset.path} has been modified (use --force to remove)`);
      skipped++;
      continue;
    }

    unlinkSync(filePath);
    success(`Removed ${asset.path}`);
    removed++;
  }

  console.log("");
  if (removed > 0 && skipped === 0) {
    success(`Theme "${themeName}" removed (${removed} files).`);
  } else if (removed > 0) {
    warn(`Removed ${removed} file(s), skipped ${skipped} modified file(s).`);
  } else if (skipped > 0) {
    info(`No files removed. ${skipped} file(s) were modified — use --force to override.`);
  } else {
    info(`No files found for theme "${themeName}".`);
  }
}

export function themeInfo(themeName: string): void {
  const themes = getBundledThemes();
  const theme = themes[themeName];

  if (!theme) {
    error(`Theme "${themeName}" not found.`);
    info(`Available themes: ${Object.keys(themes).join(", ")}`);
    process.exit(1);
  }

  console.log(`\n${theme.name} — ${theme.description}\n`);
  console.log("Layouts:");
  for (const layout of theme.layouts) {
    console.log(`  layouts/${layout.name} (${layout.content.length} bytes)`);
  }
  console.log("\nAssets:");
  for (const asset of theme.assets) {
    console.log(`  ${asset.path} (${asset.content.length} bytes)`);
  }
  console.log("");
}

export function themeStatus(projectRoot: string): void {
  const themes = getBundledThemes();
  console.log("\nInstalled themes:\n");

  let anyInstalled = false;

  for (const [name, theme] of Object.entries(themes)) {
    const allFiles = [
      ...theme.layouts.map((l) => ({
        path: join(projectRoot, "layouts", l.name),
        expected: l.content.trim(),
        label: `layouts/${l.name}`,
      })),
      ...theme.assets.map((a) => ({
        path: join(projectRoot, a.path),
        expected: a.content.trim(),
        label: a.path,
      })),
    ];

    const present = allFiles.filter((f) => existsSync(f.path));

    if (present.length === 0) continue;

    anyInstalled = true;
    const total = allFiles.length;
    const modified = present.filter(
      (f) => readFileSync(f.path, "utf-8").trim() !== f.expected
    );
    const pristine = present.length - modified.length;

    console.log(`  ${name}  — ${pristine} original, ${modified.length} modified (${present.length}/${total} files present)`);
  }

  if (!anyInstalled) {
    console.log("  No themes installed. Use `kanso theme add <name>` to install one.\n");
  }

  console.log("");
}
