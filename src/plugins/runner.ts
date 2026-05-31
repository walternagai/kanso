import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { info } from "../utils/logger.js";

export type HookName =
  | "build:start"
  | "build:end"
  | "page:render"
  | "page:done"
  | "config:loaded";

export interface BuildContext {
  projectRoot: string;
  config: Record<string, unknown>;
  pages: string[];
  startTime: number;
}

export interface PageContext {
  filePath: string;
  slug: string;
  frontMatter: Record<string, unknown>;
  htmlContent: string;
  outputHtml: string;
}

export interface PluginApi {
  on(hook: HookName, callback: (...args: unknown[]) => unknown): void;
}

export type PluginFunction = (api: PluginApi) => void | Promise<void>;

export interface PluginModule {
  default: PluginFunction;
}

export class PluginRunner {
  private hooks: Map<string, Array<(...args: unknown[]) => unknown>> = new Map();
  private loaded = false;

  createApi(): PluginApi {
    const self = this;
    return {
      on(hook: HookName, callback: (...args: unknown[]) => unknown) {
        if (!self.hooks.has(hook)) {
          self.hooks.set(hook, []);
        }
        self.hooks.get(hook)!.push(callback);
      },
    };
  }

  async loadPlugins(projectRoot: string): Promise<void> {
    if (this.loaded) return;

    const configPath = join(projectRoot, "kanso.config.js");
    if (!existsSync(configPath)) {
      this.loaded = true;
      return;
    }

    const rawConfig = readFileSync(configPath, "utf-8");
    const pluginMatch = rawConfig.match(/plugins\s*:\s*\[([\s\S]*?)\]/);
    if (!pluginMatch) {
      this.loaded = true;
      return;
    }

    const pluginNames = pluginMatch[1]
      .split(",")
      .map((p) => p.trim().replace(/['"]/g, ""))
      .filter(Boolean);

    const api = this.createApi();

    for (const pluginName of pluginNames) {
      try {
        const pluginPath = join(projectRoot, "node_modules", pluginName);
        if (existsSync(pluginPath)) {
          const mod = await import(pluginPath) as PluginModule;
          if (typeof mod.default === "function") {
            await mod.default(api);
            info(`Loaded plugin: ${pluginName}`);
          }
        } else {
          info(`Plugin not found: ${pluginName} (skipped)`);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        info(`Failed to load plugin ${pluginName}: ${msg}`);
      }
    }

    this.loaded = true;
  }

  async runHook(hook: HookName, ...args: unknown[]): Promise<unknown> {
    const callbacks = this.hooks.get(hook);
    if (!callbacks || callbacks.length === 0) {
      if (hook === "page:render" || hook === "config:loaded") return args[0];
      return undefined;
    }

    let result: unknown = hook === "page:render" || hook === "config:loaded" ? args[0] : undefined;

    for (const callback of callbacks) {
      const output = await callback(...args);
      if (hook === "page:render" || hook === "config:loaded") {
        if (output !== undefined) {
          result = output;
          args[0] = output;
        }
      }
    }

    return result;
  }

  reset(): void {
    this.hooks.clear();
    this.loaded = false;
  }
}
