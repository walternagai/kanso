import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { join, extname } from "path";
import { WebSocketServer, WebSocket } from "ws";
import chokidar from "chokidar";
import { build } from "./build.js";
import { heading, success, info } from "../utils/logger.js";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

const WS_CLIENT_SCRIPT = `
<script>
(function() {
  var ws = new WebSocket('ws://' + location.host + '/__kanso_ws');
  var reconnectTimer;
  ws.onmessage = function(e) {
    if (e.data === 'reload') location.reload();
  };
  ws.onclose = function() {
    reconnectTimer = setTimeout(function() { location.reload(); }, 1000);
  };
})();
</script>
`;

export interface DevServerOptions {
  port?: number;
  host?: string;
}

export async function devServer(
  projectRoot: string,
  options: DevServerOptions = {}
): Promise<void> {
  const port = options.port || 3000;
  const host = options.host || "localhost";

  heading("Kanso Dev Server");

  await build(projectRoot);

  const outputDir = join(projectRoot, "dist");

  const server = createServer((req, res) => {
    handleRequest(req, res, outputDir);
  });

  const wss = new WebSocketServer({ server, path: "/__kanso_ws" });
  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
  });

  const watchDirs = ["content", "layouts", "components", "assets", "public"];
  const watchPaths = watchDirs.map((d) => join(projectRoot, d));

  const watcher = chokidar.watch(watchPaths, {
    ignored: /node_modules/,
    persistent: true,
    ignoreInitial: true,
  });

  let rebuildTimer: ReturnType<typeof setTimeout> | null = null;

  watcher.on("all", (event, filePath) => {
    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(async () => {
      try {
        await build(projectRoot);
        for (const client of clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send("reload");
          }
        }
        info(`Rebuilt after ${event}: ${filePath.replace(projectRoot, "")}`);
      } catch {
        // Build errors are logged by the build function
      }
    }, 300);
  });

  server.listen(port, host, () => {
    console.log(`  Local:   http://${host}:${port}`);
    console.log(`  Network: http://0.0.0.0:${port}`);
    console.log("");
    info("Watching for changes...");
  });

  process.on("SIGINT", () => {
    watcher.close();
    server.close();
    process.exit(0);
  });
}

function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  outputDir: string
): void {
  let urlPath = req.url || "/";
  if (urlPath === "/") urlPath = "/index.html";

  const filePath = join(outputDir, urlPath);

  if (existsSync(filePath) && statSync(filePath).isFile()) {
    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const content = readFileSync(filePath);

    if (ext === ".html") {
      let html = content.toString();
      html = html.replace("</body>", `${WS_CLIENT_SCRIPT}</body>`);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(html);
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    }
  } else {
    const indexPath = join(outputDir, urlPath, "index.html");
    if (existsSync(indexPath)) {
      let html = readFileSync(indexPath, "utf-8");
      html = html.replace("</body>", `${WS_CLIENT_SCRIPT}</body>`);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>404 Not Found</h1>");
    }
  }
}
