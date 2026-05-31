const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
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
  console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
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
