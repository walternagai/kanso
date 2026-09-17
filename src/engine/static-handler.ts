import { IncomingMessage, ServerResponse } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { join, extname, relative } from "path";
import { MIME_TYPES } from "./mime.js";

export interface StaticHandlerOptions {
  /** Inject the Kanso live-reload client script into HTML responses */
  injectLiveReload?: boolean;
  /** Port used in the injected live-reload script (default 3000) */
  wsPort?: number;
}

export function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

export function createStaticHandler(
  outputDir: string,
  options: StaticHandlerOptions = {}
): (req: IncomingMessage, res: ServerResponse) => void {
  return (req, res) => {
    let urlPath = req.url || "/";
    if (urlPath === "/") urlPath = "/index.html";

    const filePath = join(outputDir, urlPath);

    if (relative(outputDir, filePath).startsWith("..")) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("403 Forbidden");
      return;
    }

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const contentType = getMimeType(filePath);
      const content = readFileSync(filePath);
      const ext = extname(filePath).toLowerCase();

      if (options.injectLiveReload && ext === ".html") {
        let html = content.toString();
        html = html.replace("</body>", `${getWsClientScript(options.wsPort || 3000)}</body>`);
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
        if (options.injectLiveReload) {
          html = html.replace("</body>", `${getWsClientScript(options.wsPort || 3000)}</body>`);
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      } else {
        const notFound = join(outputDir, "404.html");
        if (existsSync(notFound)) {
          let html = readFileSync(notFound, "utf-8");
          if (options.injectLiveReload) {
            html = html.replace("</body>", `${getWsClientScript(options.wsPort || 3000)}</body>`);
          }
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end(html);
        } else {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end("<h1>404 Not Found</h1>");
        }
      }
    }
  };
}

function getWsClientScript(_port: number): string {
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