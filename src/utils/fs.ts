import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

export function calculateDirSize(dir: string): number {
  let total = 0;
  if (!existsSync(dir)) return total;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      total += calculateDirSize(fullPath);
    } else {
      total += statSync(fullPath).size;
    }
  }
  return total;
}

export function countFilesInDir(dir: string): { count: number; size: number } {
  let count = 0;
  let size = 0;
  if (!existsSync(dir)) return { count, size };
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = countFilesInDir(fullPath);
      count += sub.count;
      size += sub.size;
    } else {
      count++;
      size += statSync(fullPath).size;
    }
  }
  return { count, size };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}