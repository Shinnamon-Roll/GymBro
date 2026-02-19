const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const root = __dirname;
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5500;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const safeJoin = (base, target) => {
  const targetPath = path.resolve(base, target.replace(/^\/+/, ""));
  if (!targetPath.startsWith(base)) return null;
  return targetPath;
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  let pathname = parsed.pathname || "/";
  if (pathname === "/") pathname = "/index.html";
  const filePath = safeJoin(root, pathname);
  if (!filePath) {
    res.writeHead(400);
    res.end("Bad Request");
    return;
  }
  fs.stat(filePath, (err, stat) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, "index.html");
      fs.stat(indexPath, (e2) => {
        if (e2) {
          res.writeHead(403);
          res.end("Forbidden");
          return;
        }
        streamFile(indexPath, res);
      });
      return;
    }
    streamFile(filePath, res);
  });
});

function streamFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const type = mime[ext] || "application/octet-stream";
  res.setHeader("Content-Type", type);
  res.setHeader("Cache-Control", "no-cache");
  const stream = fs.createReadStream(filePath);
  stream.on("error", () => {
    res.writeHead(500);
    res.end("Internal Server Error");
  });
  stream.pipe(res);
}

server.listen(port, () => {
  console.log(`Gymbro frontend running on http://localhost:${port}/index.html`);
});
