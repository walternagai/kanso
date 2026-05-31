import { createHash } from "crypto";
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

export function addCacheBusting(outputDir: string): { files: number; hashes: Map<string, string> } {
  const hashes = new Map<string, string>();
  let files = 0;

  function processDir(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        processDir(fullPath);
      } else {
        const ext = extname(entry.name);
        if ([".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".woff", ".woff2"].includes(ext)) {
          const content = readFileSync(fullPath);
          const hash = createHash("md5").update(content).digest("hex").slice(0, 8);
          const newName = entry.name.replace(ext, `.${hash}${ext}`);
          hashes.set(entry.name, newName);
          files++;
        }
      }
    }
  }

  processDir(outputDir);
  return { files, hashes };
}
