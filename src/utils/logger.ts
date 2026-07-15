const useColor = !process.env.NO_COLOR && process.env.FORCE_COLOR !== "0";

const colors = {
  reset: useColor ? "\x1b[0m" : "",
  red: useColor ? "\x1b[31m" : "",
  green: useColor ? "\x1b[32m" : "",
  yellow: useColor ? "\x1b[33m" : "",
  blue: useColor ? "\x1b[34m" : "",
  cyan: useColor ? "\x1b[36m" : "",
  dim: useColor ? "\x1b[2m" : "",
  bold: useColor ? "\x1b[1m" : "",
} as const;

export function success(msg: string): void {
  console.log(`${colors.green}✔${colors.reset} ${msg}`);
}

export function error(msg: string): void {
  console.error(`${colors.red}✖${colors.reset} ${msg}`);
}

export function info(msg: string): void {
  console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`);
}

export function warn(msg: string): void {
  console.error(`${colors.yellow}⚠${colors.reset} ${msg}`);
}

export function dim(msg: string): string {
  return `${colors.dim}${msg}${colors.reset}`;
}

export function bold(msg: string): string {
  return `${colors.bold}${msg}${colors.reset}`;
}

export function heading(msg: string): void {
  console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`);
}
