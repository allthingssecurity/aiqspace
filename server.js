const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8999;
const ROOT = __dirname;

const mime = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  if (body) res.end(body); else res.end();
}

function safeJoin(base, target) {
  const targetPath = path.posix.normalize('/' + target).replace(/^\/+/, '');
  return path.join(base, targetPath);
}

const server = http.createServer((req, res) => {
  try {
    // Strip query string (e.g., ?v=timestamp)
    const urlPath = req.url.split('?')[0] || '/';

    // Default to index.html
    const filePath = urlPath === '/' ? 'index.html' : urlPath;
    const abs = safeJoin(ROOT, filePath);

    // Prevent directory traversal
    if (!abs.startsWith(ROOT)) {
      return send(res, 403, { 'Content-Type': 'text/plain' }, 'Forbidden');
    }

    fs.stat(abs, (err, stat) => {
      if (err || !stat.isFile()) {
        return send(res, 404, { 'Content-Type': 'text/plain' }, 'Not Found');
      }

      const ext = path.extname(abs).toLowerCase();
      const type = mime[ext] || 'application/octet-stream';
      const stream = fs.createReadStream(abs);
      res.writeHead(200, {
        'Content-Type': type,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      stream.pipe(res);
      stream.on('error', () => {
        send(res, 500, { 'Content-Type': 'text/plain' }, 'Server Error');
      });
    });
  } catch (e) {
    send(res, 500, { 'Content-Type': 'text/plain' }, 'Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`AIQNex game server running at http://localhost:${PORT}`);
});

