import nunjucks from "nunjucks";
import { join } from "path";

export interface TemplateData {
  [key: string]: unknown;
}

function formatDate(value: unknown, format: string): string {
  if (!value) return "";
  const date = new Date(String(value));
  if (isNaN(date.getTime())) return String(value);

  const pad = (n: number) => String(n).padStart(2, "0");

  const map: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  };

  let result = format;
  for (const [token, val] of Object.entries(map)) {
    result = result.replace(token, val);
  }
  return result;
}

function excerpt(value: unknown, maxLength: number = 140): string {
  if (!value) return "";
  const text = String(value)
    .replace(/<[^>]+>/g, "")
    .replace(/[#*_`~\[\]]/g, "")
    .trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

function dateToISO(value: unknown): string {
  if (!value) return "";
  const date = new Date(String(value));
  if (isNaN(date.getTime())) return String(value);
  return date.toISOString();
}

function dateToUTC(value: unknown): string {
  if (!value) return "";
  const date = new Date(String(value));
  if (isNaN(date.getTime())) return String(value);
  return date.toUTCString();
}

export class TemplateEngine {
  private env: nunjucks.Environment;
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;

    const loader = new nunjucks.FileSystemLoader([
      join(projectRoot, "layouts"),
      join(projectRoot, "components"),
    ]);

    this.env = new nunjucks.Environment(loader, {
      autoescape: true,
      throwOnUndefined: false,
      trimBlocks: false,
      lstripBlocks: false,
    });

    this.env.addFilter("formatDate", formatDate);
    this.env.addFilter("excerpt", excerpt);
    this.env.addFilter("dateToISO", dateToISO);
    this.env.addFilter("dateToUTC", dateToUTC);
  }

  render(templatePath: string, data: TemplateData): string {
    const name = templatePath.endsWith(".html")
      ? templatePath
      : `${templatePath}.html`;
    return this.env.render(name, data);
  }

  renderString(templateString: string, data: TemplateData): string {
    return this.env.renderString(templateString, data);
  }
}

let engineInstance: TemplateEngine | null = null;

export function getTemplateEngine(projectRoot: string): TemplateEngine {
  if (!engineInstance) {
    engineInstance = new TemplateEngine(projectRoot);
  }
  return engineInstance;
}

export function resetTemplateEngine(): void {
  engineInstance = null;
}
