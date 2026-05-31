import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { build } from "./build.js";
import { heading, success, error, info } from "../utils/logger.js";

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

export async function deploy(
  projectRoot: string,
  options: DeployOptions = {}
): Promise<void> {
  heading("Kanso Deploy");

  const config = await loadDeployConfig(projectRoot);
  const provider = options.provider || config.provider;

  if (options.dryRun) {
    await dryRun(projectRoot, provider, config);
    return;
  }

  if (config.buildBeforeDeploy !== false) {
    await build(projectRoot);
  }

  const outputDir = join(projectRoot, "dist");
  if (!existsSync(outputDir)) {
    error("dist/ directory not found. Run `kanso build` first.");
    process.exit(1);
  }

  switch (provider) {
    case "github-pages":
      await deployGitHubPages(projectRoot, config, options);
      break;
    case "netlify":
      await deployNetlify(projectRoot, config);
      break;
    default:
      error(`Unknown provider: ${provider}`);
      info('Supported providers: "github-pages", "netlify"');
      process.exit(1);
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
    error("GitHub repo not configured.");
    info('Add to kanso.config.js: deploy: { repo: "username/repo" }');
    process.exit(1);
  }

  try {
    execSync("git init", { cwd: outputDir, stdio: "pipe" });
    execSync(`git checkout -b ${branch}`, { cwd: outputDir, stdio: "pipe" });
    execSync("git add -A", { cwd: outputDir, stdio: "pipe" });
    execSync(`git commit -m "${commitMsg}"`, { cwd: outputDir, stdio: "pipe" });
    execSync(`git push origin ${branch} --force`, {
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
      error("Network error: Could not connect to GitHub.");
      info("Check your internet connection and try again.");
    } else if (msg.includes("Authentication failed") || msg.includes("403")) {
      error("Authentication failed: Invalid or missing GitHub token.");
      info("Set GITHUB_TOKEN environment variable or configure SSH key.");
    } else if (msg.includes("does not exist") || msg.includes("does not have a repository")) {
      error(`Repository not found: ${repo}`);
      info("Verify the repo name in kanso.config.js and ensure it exists on GitHub.");
    } else {
      error(`GitHub Pages deploy failed: ${msg}`);
    }
    process.exit(1);
  }
}

async function deployNetlify(
  projectRoot: string,
  config: DeployConfig
): Promise<void> {
  const token = process.env.NETLIFY_AUTH_TOKEN;

  if (!token) {
    error("NETLIFY_AUTH_TOKEN not set.");
    info("Set it via: export NETLIFY_AUTH_TOKEN=your-token");
    info("Get a token at: https://app.netlify.com/user/applications#personal-access-tokens");
    process.exit(1);
  }

  try {
    execSync("netlify deploy --prod --dir=dist", {
      cwd: projectRoot,
      stdio: "inherit",
    });
    success("Deployed to Netlify!");
  } catch {
    error("Netlify deploy failed. Is netlify-cli installed?");
    info("Install: npm install -g netlify-cli");
    process.exit(1);
  }
}

async function dryRun(
  projectRoot: string,
  provider: string,
  config: DeployConfig
): Promise<void> {
  const outputDir = join(projectRoot, "dist");

  if (!existsSync(outputDir)) {
    error("dist/ not found. Run `kanso build` first.");
    return;
  }

  const { readdirSync, statSync } = await import("fs");
  let fileCount = 0;
  let totalSize = 0;

  function countFiles(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        countFiles(fullPath);
      } else {
        fileCount++;
        totalSize += statSync(fullPath).size;
      }
    }
  }
  countFiles(outputDir);

  const sizeStr =
    totalSize < 1024
      ? `${totalSize} B`
      : totalSize < 1048576
        ? `${(totalSize / 1024).toFixed(1)} KB`
        : `${(totalSize / 1048576).toFixed(1)} MB`;

  console.log("Dry run — no files will be published\n");
  console.log(`  Provider: ${provider}`);
  console.log(`  Files:    ${fileCount} files`);
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
    const cfg = { ...defaultConfig, ...mod.default };
    return cfg.deploy as DeployConfig;
  }
  return defaultConfig.deploy as DeployConfig;
}
