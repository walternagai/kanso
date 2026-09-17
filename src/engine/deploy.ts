import { execSync, execFileSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { build } from "./build.js";
import { heading, success, error, info } from "../utils/logger.js";
import { countFilesInDir, formatBytes } from "../utils/fs.js";

export interface DeployOptions {
  dryRun?: boolean;
  provider?: string;
  message?: string;
}

export interface DeployConfig {
  provider: "github-pages" | "netlify";
  repo?: string;
  branch?: string;
  siteId?: string;
  buildBeforeDeploy?: boolean;
}

export class DeployError extends Error {
  constructor(message: string, public readonly hints: string[] = []) {
    super(message);
    this.name = "DeployError";
  }
}

export async function deploy(
  projectRoot: string,
  options: DeployOptions = {}
): Promise<void> {
  heading("Kanso Deploy");

  const config = await loadDeployConfig(projectRoot);
  const provider = options.provider || config.provider;

  switch (provider) {
    case "github-pages":
    case "netlify":
      break;
    default:
      throw new DeployError(`Unknown provider: ${provider}`, [
        'Supported providers: "github-pages", "netlify"',
      ]);
  }

  if (options.dryRun) {
    await dryRun(projectRoot, provider, config);
    return;
  }

  if (config.buildBeforeDeploy !== false) {
    await build(projectRoot);
  }

  const outputDir = join(projectRoot, "dist");
  if (!existsSync(outputDir)) {
    throw new DeployError("dist/ directory not found. Run `kanso build` first.");
  }

  switch (provider) {
    case "github-pages":
      await deployGitHubPages(projectRoot, config, options);
      break;
    case "netlify":
      await deployNetlify(projectRoot, config);
      break;
  }
}

async function deployGitHubPages(
  projectRoot: string,
  config: DeployConfig,
  options: DeployOptions
): Promise<void> {
  const outputDir = join(projectRoot, "dist");
  const repo = config.repo;
  const branch = config.branch || "gh-pages";
  const commitMsg =
    options.message ||
    `[kanso] Deploy: ${new Date().toISOString().slice(0, 19).replace("T", " ")}`;

  if (!repo) {
    throw new DeployError("GitHub repo not configured.", [
      'Add to kanso.config.js: deploy: { repo: "username/repo" }',
    ]);
  }

  try {
    execFileSync("git", ["init"], { cwd: outputDir, stdio: "pipe" });
    execFileSync("git", ["checkout", "-B", branch], {
      cwd: outputDir,
      stdio: "pipe",
    });
    execFileSync("git", ["add", "-A"], { cwd: outputDir, stdio: "pipe" });
    execFileSync("git", ["commit", "-m", commitMsg], {
      cwd: outputDir,
      stdio: "pipe",
    });
    execFileSync("git", ["push", "origin", branch, "--force"], {
      cwd: outputDir,
      stdio: "pipe",
      env: { ...process.env },
    });

    success(`Deployed to GitHub Pages!`);
    console.log(`  Repo: ${repo}`);
    console.log(`  Branch: ${branch}`);
    const url = `https://${repo.split("/")[0]}.github.io/${repo.split("/")[1]}/`;
    console.log(`  URL: ${url}`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);

    if (msg.includes("Could not resolve host")) {
      throw new DeployError("Network error: Could not connect to GitHub.", [
        "Check your internet connection and try again.",
      ]);
    } else if (msg.includes("Authentication failed") || msg.includes("403")) {
      throw new DeployError(
        "Authentication failed: Invalid or missing GitHub token.",
        [
          "Set GITHUB_TOKEN environment variable or configure SSH key.",
        ]
      );
    } else if (msg.includes("does not exist") || msg.includes("does not have a repository")) {
      throw new DeployError(`Repository not found: ${repo}`, [
        "Verify the repo name in kanso.config.js and ensure it exists on GitHub.",
      ]);
    } else {
      throw new DeployError(`GitHub Pages deploy failed: ${msg}`);
    }
  }
}

async function deployNetlify(
  projectRoot: string,
  _config: DeployConfig
): Promise<void> {
  const token = process.env.NETLIFY_AUTH_TOKEN;

  if (!token) {
    throw new DeployError("NETLIFY_AUTH_TOKEN not set.", [
      "Set it via: export NETLIFY_AUTH_TOKEN=your-token",
      "Get a token at: https://app.netlify.com/user/applications#personal-access-tokens",
    ]);
  }

  try {
    execSync("netlify deploy --prod --dir=dist", {
      cwd: projectRoot,
      stdio: "inherit",
    });
    success("Deployed to Netlify!");
  } catch {
    throw new DeployError("Netlify deploy failed. Is netlify-cli installed?", [
      "Install: npm install -g netlify-cli",
    ]);
  }
}

async function dryRun(
  projectRoot: string,
  provider: string,
  _config: DeployConfig
): Promise<void> {
  const outputDir = join(projectRoot, "dist");

  if (!existsSync(outputDir)) {
    error("dist/ not found. Run `kanso build` first.");
    return;
  }

  const { count, size: totalSize } = countFilesInDir(outputDir);
  const sizeStr = formatBytes(totalSize);

  console.log("Dry run — no files will be published\n");
  console.log(`  Provider: ${provider}`);
  console.log(`  Files:    ${count} files`);
  console.log(`  Size:     ${sizeStr}`);
  console.log(`  Output:   ${outputDir}`);
  console.log("");
  info("Run without --dry-run to deploy.");
}

async function loadDeployConfig(
  projectRoot: string
): Promise<DeployConfig> {
  const configPath = join(projectRoot, "kanso.config.js");
  const { defaultConfig } = await import("../config.js");

  if (existsSync(configPath)) {
    const mod = await import(configPath);
    const cfg = {
      ...defaultConfig,
      ...mod.default,
      deploy: { ...defaultConfig.deploy, ...mod.default?.deploy },
    };
    return cfg.deploy;
  }
  return defaultConfig.deploy;
}
