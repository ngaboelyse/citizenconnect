// CitizenConnect - Local Server (no dependencies, Node.js built-ins only)
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const WWW_DIR  = path.join(__dirname, 'www');
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory and files exist
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
} catch (e) {
  console.error('Warning: could not create data/ directory:', e.message);
}
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
const NOTIFS_FILE  = path.join(DATA_DIR, 'notifications.json');
try {
  if (!fs.existsSync(REPORTS_FILE)) fs.writeFileSync(REPORTS_FILE, '[]');
  if (!fs.existsSync(NOTIFS_FILE))  fs.writeFileSync(NOTIFS_FILE,  '[]');
} catch (e) {
  console.error('Warning: could not create data files:', e.message);
}

// Helper: read a JSON file
function readJSON(filePath, cb) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    cb(err ? [] : JSON.parse(data || '[]'));
  });
}

// Helper: write a JSON file atomically
function writeJSON(filePath, data, cb) {
  const tmp = filePath + '.tmp';
  fs.writeFile(tmp, JSON.stringify(data, null, 2), err => {
    if (err) return cb(err);
    fs.rename(tmp, filePath, cb);
  });
}

// Helper: collect POST body
function readBody(req, cb) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => cb(body));
}

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // ── API routes ─────────────────────────────────────────────────────────────
  if (urlPath === '/api/reports') {
    if (req.method === 'GET') {
      readJSON(REPORTS_FILE, data => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      });
      return;
    }
    if (req.method === 'POST') {
      readBody(req, body => {
        try {
          const data = JSON.parse(body);
          writeJSON(REPORTS_FILE, data, err => {
            res.writeHead(err ? 500 : 200, { 'Content-Type': 'application/json' });
            res.end(err ? '{"error":"save failed"}' : '{"ok":true}');
          });
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end('{"error":"invalid json"}');
        }
      });
      return;
    }
  }

  if (urlPath === '/api/notifications') {
    if (req.method === 'GET') {
      readJSON(NOTIFS_FILE, data => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      });
      return;
    }
    if (req.method === 'POST') {
      readBody(req, body => {
        try {
          const data = JSON.parse(body);
          writeJSON(NOTIFS_FILE, data, err => {
            res.writeHead(err ? 500 : 200, { 'Content-Type': 'application/json' });
            res.end(err ? '{"error":"save failed"}' : '{"ok":true}');
          });
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end('{"error":"invalid json"}');
        }
      });
      return;
    }
  }

  // ── Static files ───────────────────────────────────────────────────────────
  if (urlPath === '/' || urlPath === '/login') {
    res.writeHead(302, { Location: '/login.html' });
    res.end();
    return;
  }

  // Strip .html extension from requests missing it
  const htmllessPages = ['/index', '/report-form', '/admin-dashboard', '/staff-dashboard'];
  if (htmllessPages.includes(urlPath)) {
    res.writeHead(302, { Location: urlPath + '.html' });
    res.end();
    return;
  }

  const filePath = path.join(WWW_DIR, urlPath);

  // Security: prevent path traversal
  const normalFilePath = path.normalize(filePath);
  const normalWwwDir  = path.normalize(WWW_DIR);
  if (!normalFilePath.toLowerCase().startsWith(normalWwwDir.toLowerCase())) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

// Listen on 0.0.0.0 so both IPv4 (127.0.0.1) and IPv6 (::1) connections work.
// Windows resolves "localhost" to ::1 first; binding only to 127.0.0.1 causes
// the browser to get connection-refused before falling back to IPv4.
server.listen(PORT, '0.0.0.0', () => {
  // Get the real LAN IP — skip loopback and virtual adapters (VirtualBox, VMware, etc.)
  let lanIP = '127.0.0.1';
  const nets = os.networkInterfaces();
  const candidates = [];
  for (const [name, iface] of Object.entries(nets)) {
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        candidates.push({ name, address: addr.address });
      }
    }
  }
  // Prefer real adapters: skip VirtualBox (192.168.56.x) and VMware ranges
  const virtualPatterns = [/^192\.168\.56\./, /VirtualBox/i, /VMware/i, /Loopback/i];
  const real = candidates.find(c =>
    !virtualPatterns.some(p => p.test(c.address) || p.test(c.name))
  );
  if (real) lanIP = real.address;
  else if (candidates.length) lanIP = candidates[0].address;

  const sharedUrl = `http://${lanIP}:${PORT}`;

  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║        CitizenConnect Running        ║');
  console.log('  ╠══════════════════════════════════════╣');
  console.log(`  ║  PC & Phone → ${sharedUrl.padEnd(22)}║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('  Press Ctrl+C to stop.\n');

  const platform = process.platform;
  const cmd =
    platform === 'win32'  ? `start "" "${sharedUrl}"` :
    platform === 'darwin' ? `open "${sharedUrl}"` :
                            `xdg-open "${sharedUrl}"`;
  exec(cmd, err => {
    if (err) console.log('Open your browser at:', sharedUrl);
  });
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use.`);
    console.error('Close the other CitizenConnect window, then try again.');
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});
