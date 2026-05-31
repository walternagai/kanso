import { readFileSync, existsSync } from "fs";
import { join } from "path";

export function generateRedirects(projectRoot: string): string | null {
  const redirectsFile = join(projectRoot, "redirects");
  if (!existsSync(redirectsFile)) return null;
  return readFileSync(redirectsFile, "utf-8");
}

export function generateHeaders(projectRoot: string): string | null {
  const headersFile = join(projectRoot, "headers");
  if (!existsSync(headersFile)) return null;
  return readFileSync(headersFile, "utf-8");
}
