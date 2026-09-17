import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import chokidar from "chokidar";
import { join, extname, relative } from "path";
import { build } from "./build.js";
import { heading, info, error } from "../utils/logger.js";
import { createStaticHandler } from "./static-handler.js";

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

  const server = createServer(
    createStaticHandler(outputDir, {
      injectLiveReload: true,
      wsPort: port,
    })
  );

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
  let needsRebuild = false;

  watcher.on("all", (event, filePath) => {
    if (isBuilding) {
      needsRebuild = true;
      return;
    }

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
        if (needsRebuild) {
          needsRebuild = false;
          const t = setTimeout(async () => {
            try {
              await build(projectRoot);
              broadcast({ type: "reload" });
              info("Rebuilt pending changes");
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : String(e);
              broadcast({ type: "error", message: msg });
            }
          }, 300);
          void t;
        }
      }
    }, 300);
  });

  server.listen(port, host, () => {
    info(`Local:   http://${host}:${port}`);
    info(`Network: http://0.0.0.0:${port}`);
    console.log("");
    info("Watching for changes...");
  });

  process.on("SIGINT", () => {
    watcher.close();
    server.close();
    process.exit(0);
  });
}