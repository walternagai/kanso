import fsExtra from "fs-extra";
import { join } from "path";

const { copySync, statSync, readdirSync, mkdirSync, existsSync } = fsExtra;

export interface AssetResult {
  filesCopied: number;
  totalSize: number;
}

export function copyAssets(
  projectRoot: string,
  outputDir: string,
  options: { skipDotfiles?: boolean } = {}
): AssetResult {
  const skipDotfiles = options.skipDotfiles ?? true;
  let filesCopied = 0;
  let totalSize = 0;

  const assetsDir = join(projectRoot, "assets");
  if (existsSync(assetsDir)) {
    const destDir = join(outputDir, "assets");
    mkdirSync(destDir, { recursive: true });
    const result = copyDirSync(assetsDir, destDir, skipDotfiles);
    filesCopied += result.filesCopied;
    totalSize += result.totalSize;
  }

  const publicDir = join(projectRoot, "public");
  if (existsSync(publicDir)) {
    const result = copyDirSync(publicDir, outputDir, skipDotfiles);
    filesCopied += result.filesCopied;
    totalSize += result.totalSize;
  }

  return { filesCopied, totalSize };
}

function copyDirSync(
  src: string,
  dest: string,
  skipDotfiles: boolean
): AssetResult {
  let filesCopied = 0;
  let totalSize = 0;

  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (skipDotfiles && entry.name.startsWith(".")) {
      continue;
    }

    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      const result = copyDirSync(srcPath, destPath, skipDotfiles);
      filesCopied += result.filesCopied;
      totalSize += result.totalSize;
    } else {
      copySync(srcPath, destPath, { overwrite: true });
      const stat = statSync(destPath);
      filesCopied++;
      totalSize += stat.size;
    }
  }

  return { filesCopied, totalSize };
}

export function assetPath(
  siteUrl: string,
  assetRelativePath: string
): string {
  const base = siteUrl.replace(/\/$/, "");
  const path = assetRelativePath.startsWith("/")
    ? assetRelativePath
    : `/${assetRelativePath}`;
  return `${base}${path}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
