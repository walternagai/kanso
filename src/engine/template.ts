import nunjucks from "nunjucks";
import { join } from "path";

export interface TemplateData {
  [key: string]: unknown;
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
