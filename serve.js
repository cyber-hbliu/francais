#!/usr/bin/env node
// Tiny static server with HTTP Range support (needed so the lesson audio can be sought and replayed).
// Usage: node serve.js [port]   → http://localhost:8137
const http = require("http"), fs = require("fs"), path = require("path"), { exec } = require("child_process");
const root = __dirname, port = +process.argv[2] || 8137;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".pdf": "application/pdf", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const file = path.normalize(path.join(root, p));
  if (!file.startsWith(root) || /(^|\/)\.(git|claude)(\/|$)/.test(p)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end("Not found"); }
    const type = types[path.extname(file).toLowerCase()] || "application/octet-stream";
    const range = req.headers.range;
    const base = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "no-cache" };
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start = m[1] ? +m[1] : 0, end = m[2] ? +m[2] : st.size - 1;
      if (!m[1] && m[2]) { start = Math.max(0, st.size - +m[2]); end = st.size - 1; }
      end = Math.min(end, st.size - 1);
      if (start > end || start >= st.size) { res.writeHead(416, { "Content-Range": `bytes */${st.size}` }); return res.end(); }
      res.writeHead(206, { ...base, "Content-Range": `bytes ${start}-${end}/${st.size}`, "Content-Length": end - start + 1 });
      fs.createReadStream(file, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { ...base, "Content-Length": st.size });
      fs.createReadStream(file).pipe(res);
    }
  });
}).listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`French study app → ${url}   (Ctrl+C to stop)`);
  if (process.env.NO_OPEN !== "1" && process.platform === "darwin" && !process.env.CLAUDE_PREVIEW) exec(`open ${url}`);
});
