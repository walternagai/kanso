import { Command } from "commander";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { initCommand } from "./commands/init.js";
import { buildCommand } from "./commands/build.js";
import { devCommand } from "./commands/dev.js";
import { deployCommand } from "./commands/deploy.js";

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

program
  .command("init <project-name>")
  .description("Create a new Kanso project")
  .option("-f, --force", "Overwrite existing directory")
  .option("-y, --yes", "Skip prompts and use defaults")
  .action(initCommand);

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
  .option("--provider <provider>", "Override deploy provider")
  .option("--message <message>", "Custom commit message")
  .action(deployCommand);

program.parse();
