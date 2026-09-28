import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Determine listening port:
// - If Nginx reverse proxy is active in AI Studio (DEFAULT_APP_PORT is defined or NGINX_PORT equals PORT),
//   bind to DEFAULT_APP_PORT (3000) so Nginx can proxy to it and there is no EADDRINUSE conflict on 8080.
// - If directly on Cloud Run (PORT set by Cloud Run and no Nginx), bind to process.env.PORT.
// - Otherwise fallback to 3000.
const PORT = Number(
  process.env.DEFAULT_APP_PORT ||
  (process.env.NGINX_PORT && process.env.PORT === process.env.NGINX_PORT ? 3000 : process.env.PORT) ||
  3000
);

// Health check endpoints for Cloud Run, monitoring, and readiness probes
app.get(['/healthz', '/health', '/__health'], (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve compiled static assets from dist/
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// SPA fallback: any non-asset route serves index.html
app.get('*', (_req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('Application is ready. Please refresh.');
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`FitTrack Pro server running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown handling for Cloud Run container lifecycle
const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
