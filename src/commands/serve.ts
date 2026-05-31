import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { join, extname } from "path";
import { heading, error, info } from "../utils/logger.js";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

interface ServeOptions {
  port?: string;
}

export function serveCommand(options: ServeOptions): void {
  const port = parseInt(options.port || "3000", 10);
  const outputDir = join(process.cwd(), "dist");

  if (!existsSync(outputDir)) {
    error("dist/ not found. Run `kanso build` first.");
    process.exit(1);
  }

  heading("Kanso Serve");

  const server = createServer((req, res) => {
    let urlPath = req.url || "/";
    if (urlPath === "/") urlPath = "/index.html";

    const filePath = join(outputDir, urlPath);

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const ext = extname(filePath);
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(readFileSync(filePath));
    } else {
      const indexPath = join(outputDir, urlPath, "index.html");
      if (existsSync(indexPath)) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(readFileSync(indexPath));
      } else {
        const notFound = join(outputDir, "404.html");
        if (existsSync(notFound)) {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end(readFileSync(notFound));
        } else {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end("<h1>404 Not Found</h1>");
        }
      }
    }
  });

  server.listen(port, () => {
    console.log(`  Serving dist/ at http://localhost:${port}`);
    console.log("");
    info("Press Ctrl+C to stop.");
  });
}
