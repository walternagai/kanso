#!/usr/bin/env node
import { Command } from "commander";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { initCommand } from "./commands/init.js";
import { postCommand } from "./commands/post.js";
import { buildCommand } from "./commands/build.js";
import { devCommand } from "./commands/dev.js";
import { deployCommand } from "./commands/deploy.js";
import { cleanCommand } from "./commands/clean.js";
import { serveCommand } from "./commands/serve.js";
import {
  themeListCommand,
  themeAddCommand,
  themeRemoveCommand,
  themeInfoCommand,
  themeStatusCommand,
} from "./commands/theme.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let pkg: { version: string };
try {
  pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));
} catch {
  pkg = { version: "0.0.0" };
}

const program = new Command();

program
  .name("kanso")
  .description("Build static sites with quiet speed.")
  .version(pkg.version);

program.addHelpText("after", `
Examples:
  kanso init my-site        Create a new project
  kanso post "My Post"      Create a new blog post
  kanso dev                 Start dev server with hot reload
  kanso build               Build for production
  kanso deploy --dry-run    Preview deployment
  kanso theme list          List available themes
  kanso theme add academic  Install a theme
  kanso theme status        Show installed themes
  kanso theme info blog     Show theme details
  kanso theme remove blog   Remove a theme
`);

program
  .command("init <project-name>")
  .description("Create a new Kanso project")
  .option("-f, --force", "Overwrite existing directory")
  .option("-y, --yes", "Skip prompts and use defaults")
  .action(initCommand);

program
  .command("post <title>")
  .description("Create a new blog post")
  .option("-d, --date <date>", "Publication date (YYYY-MM-DD)")
  .option("-t, --tags <tags>", "Comma-separated tags")
  .option("-l, --layout <layout>", "Template layout", "post")
  .option("--description <desc>", "Post description for SEO")
  .action(postCommand);

program
  .command("dev")
  .description("Start development server with hot reload")
  .option("-p, --port <port>", "Port to serve on", "3000")
  .option("--host <host>", "Host to bind to", "localhost")
  .action(devCommand);

program
  .command("build")
  .description("Build the site for production")
  .action(buildCommand);

program
  .command("deploy")
  .description("Deploy the site to a hosting provider")
  .option("--dry-run", "Preview deployment without publishing")
  .option("--provider <provider>", "Deploy provider (github-pages, netlify)")
  .option("--message <message>", "Custom commit message")
  .action(deployCommand);

program
  .command("clean")
  .description("Remove the dist/ directory")
  .action(cleanCommand);

program
  .command("serve")
  .description("Serve the dist/ directory locally")
  .option("-p, --port <port>", "Port to serve on", "3000")
  .action(serveCommand);

const themeCmd = program
  .command("theme")
  .description("Manage themes");

themeCmd
  .command("list")
  .description("List available themes")
  .action(themeListCommand);

themeCmd
  .command("add <theme-name>")
  .description("Install a theme into the current project")
  .option("-f, --force", "Overwrite existing files")
  .action(themeAddCommand);

themeCmd
  .command("remove <theme-name>")
  .description("Remove installed theme files from the project")
  .option("-f, --force", "Remove even modified files")
  .action(themeRemoveCommand);

themeCmd
  .command("info <theme-name>")
  .description("Show details about a theme")
  .action(themeInfoCommand);

themeCmd
  .command("status")
  .description("Show installed themes and their modification status")
  .action(themeStatusCommand);

program.parse();
