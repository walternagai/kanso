import { deploy, DeployError } from "../engine/deploy.js";
import { error, info } from "../utils/logger.js";

interface DeployOptions {
  dryRun?: boolean;
  provider?: string;
  message?: string;
}

export async function deployCommand(options: DeployOptions): Promise<void> {
  try {
    await deploy(process.cwd(), options);
  } catch (e: unknown) {
    if (e instanceof DeployError) {
      error(e.message);
      for (const hint of e.hints) {
        info(hint);
      }
    } else {
      const msg = e instanceof Error ? e.message : String(e);
      error(`Deploy failed: ${msg}`);
    }
    process.exit(1);
  }
}
