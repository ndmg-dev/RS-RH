import dotenv from 'dotenv';

// Load environment variables before anything else
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health.routes';
import proxyRoutes from './routes/proxy.routes';

// ─── Create Express Application ───────────────────────────────────────
const app = express();

// ─── Security Middleware ───────────────────────────────────────────────
app.use(helmet({
  // Relax CSP for API gateway (no HTML served)
  contentSecurityPolicy: false,
}));

// ─── CORS ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: config.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours preflight cache
}));

// ─── Body Parsing ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request Logger ───────────────────────────────────────────────────
app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Log after response is sent
  _res.on('finish', () => {
    const duration = Date.now() - start;
    const status = _res.statusCode;
    const color = status >= 500 ? '\x1b[31m'   // red
                : status >= 400 ? '\x1b[33m'   // yellow
                : status >= 300 ? '\x1b[36m'   // cyan
                : '\x1b[32m';                  // green
    const reset = '\x1b[0m';

    console.log(
      `${color}${method}${reset} ${originalUrl} ${color}${status}${reset} — ${duration}ms`
    );
  });

  next();
});

// ─── Routes ────────────────────────────────────────────────────────────
app.use(healthRoutes);
app.use(proxyRoutes);

// ─── 404 Catch-All ─────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    timestamp: new Date().toISOString(),
    status: 404,
    error: 'Not Found',
    message: `Cannot ${_req.method} ${_req.originalUrl}`,
  });
});

// ─── Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║          MGCA Gateway — Social Network BFF          ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Gateway:    http://localhost:${config.port}                 ║`);
  console.log(`║  Backend:    ${config.springBootUrl.padEnd(39)}║`);
  console.log(`║  Environment: ${config.nodeEnv.padEnd(38)}║`);
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
});

export default app;
