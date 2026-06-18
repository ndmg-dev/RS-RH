import { Router } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { config } from '../config';
import { authForwarder } from '../middleware/auth';
import { generalLimiter, authLimiter } from '../middleware/rateLimiter';

const router = Router();

// ─── Proxy configuration ──────────────────────────────────────────────
const proxyOptions: Options = {
  target: config.springBootUrl,
  changeOrigin: true,
  // Do NOT rewrite paths — forward /api/v1/... as-is to Spring Boot
  pathRewrite: undefined,
  // Forward the original host header
  headers: {
    'X-Forwarded-By': 'mgca-gateway',
  },
  // Timeout settings
  proxyTimeout: 30_000,
  timeout: 30_000,
  // Error handling for proxy failures
  on: {
    error: (err, req, res) => {
      console.error(`[PROXY ERROR] ${(req as any).method} ${(req as any).originalUrl}:`, err.message);

      // Ensure res is a ServerResponse with status method
      if ('status' in res && typeof (res as any).status === 'function') {
        (res as any).status(502).json({
          timestamp: new Date().toISOString(),
          status: 502,
          error: 'Bad Gateway',
          message: 'Unable to reach the backend service. Please try again later.',
        });
      } else {
        // Fallback for raw http.ServerResponse
        (res as any).writeHead(502, { 'Content-Type': 'application/json' });
        (res as any).end(JSON.stringify({
          timestamp: new Date().toISOString(),
          status: 502,
          error: 'Bad Gateway',
          message: 'Unable to reach the backend service. Please try again later.',
        }));
      }
    },
    proxyReq: (proxyReq, req) => {
      // Log proxied requests in development
      if (config.nodeEnv !== 'production') {
        console.log(`[PROXY] ${req.method} ${req.url} → ${config.springBootUrl}${req.url}`);
      }
    },
  },
};

// ─── Auth endpoints (stricter rate limit) ──────────────────────────────
router.use(
  '/api/v1/auth',
  authLimiter,
  createProxyMiddleware(proxyOptions)
);

// ─── All other API endpoints ───────────────────────────────────────────
router.use(
  '/api/v1',
  generalLimiter,
  authForwarder,
  createProxyMiddleware(proxyOptions)
);

export default router;
