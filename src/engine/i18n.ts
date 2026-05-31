import { existsSync, readdirSync } from "fs";
import { join } from "path";

export interface I18nConfig {
  enabled: boolean;
  defaultLang: string;
  languages: string[];
}

export function detectLanguages(
  contentDir: string,
  config: I18nConfig
): string[] {
  if (!config.enabled) return [config.defaultLang];

  const langs: string[] = [];
  for (const lang of config.languages) {
    const langDir = join(contentDir, lang);
    if (existsSync(langDir)) {
      langs.push(lang);
    }
  }

  return langs.length > 0 ? langs : [config.defaultLang];
}

export function getLangFromPath(filePath: string, contentDir: string): string {
  const relative = filePath.replace(contentDir, "").replace(/^\//, "");
  const parts = relative.split("/");
  if (parts.length > 1 && parts[0].length === 2) {
    return parts[0];
  }
  return "";
}
