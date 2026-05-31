import { Command } from "commander";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { initCommand } from "./commands/init.js";
import { buildCommand } from "./commands/build.js";

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
  .command("build")
  .description("Build the site for production")
  .action(buildCommand);

program.parse();
