export function parsePort(raw: string | undefined): number {
  const port = parseInt(raw || "3000", 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid port: "${raw}". Port must be a number between 1 and 65535.`
    );
  }
  return port;
}