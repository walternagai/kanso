import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { join, extname, relative } from "path";
import { WebSocketServer, WebSocket } from "ws";
import chokidar from "chokidar";
import { build } from "./build.js";
import { heading, success, info, error } from "../utils/logger.js";

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

function getWsClientScript(port: number): string {
  return `
<script>
(function() {
  var ws = new WebSocket('ws://' + location.host + '/__kanso_ws');
  ws.onmessage = function(e) {
    var data = JSON.parse(e.data);
    if (data.type === 'reload') {
      location.reload();
    } else if (data.type === 'css') {
      var links = document.querySelectorAll('link[rel="stylesheet"]');
      links.forEach(function(link) {
        link.href = link.href.split('?')[0] + '?t=' + Date.now();
      });
    } else if (data.type === 'error') {
      var overlay = document.getElementById('__kanso_error');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = '__kanso_error';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#fee;color:#c00;padding:16px;font-family:monospace;z-index:99999;white-space:pre-wrap;border-bottom:2px solid #c00';
        document.body.appendChild(overlay);
      }
      overlay.textContent = data.message;
    }
  };
  ws.onclose = function() {
    setTimeout(function() { location.reload(); }, 1000);
  };
})();
</script>
`;
}

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
    handleRequest(req, res, outputDir, port);
  });

  const wss = new WebSocketServer({ server, path: "/__kanso_ws" });
  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
  });

  function broadcast(data: object) {
    const msg = JSON.stringify(data);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  }

  const watchDirs = ["content", "layouts", "components", "assets", "public"];
  const watchPaths = watchDirs.map((d) => join(projectRoot, d));

  const watcher = chokidar.watch(watchPaths, {
    ignored: /node_modules/,
    persistent: true,
    ignoreInitial: true,
  });

  let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
  let isBuilding = false;

  watcher.on("all", (event, filePath) => {
    if (isBuilding) return;

    const ext = extname(filePath);
    const isCssChange = ext === ".css";
    const relativePath = relative(projectRoot, filePath);

    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(async () => {
      isBuilding = true;
      try {
        await build(projectRoot);

        if (isCssChange) {
          broadcast({ type: "css" });
          info(`CSS updated: ${relativePath}`);
        } else {
          broadcast({ type: "reload" });
          info(`Rebuilt: ${relativePath}`);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        broadcast({ type: "error", message: msg });
        error(`Build error: ${msg}`);
      } finally {
        isBuilding = false;
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
  outputDir: string,
  port: number
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
      html = html.replace("</body>", `${getWsClientScript(port)}</body>`);
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
      html = html.replace("</body>", `${getWsClientScript(port)}</body>`);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>404 Not Found</h1>");
    }
  }
}
