import { deploy } from "../engine/deploy.js";
import { error } from "../utils/logger.js";

interface DeployOptions {
  dryRun?: boolean;
  provider?: string;
  message?: string;
}

export async function deployCommand(options: DeployOptions): Promise<void> {
  try {
    await deploy(process.cwd(), options);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    error(`Deploy failed: ${msg}`);
    process.exit(1);
  }
}
