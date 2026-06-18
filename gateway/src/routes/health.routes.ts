import { Router, Request, Response } from 'express';
import { config } from '../config';

const router = Router();

/**
 * GET /health
 * Gateway self-check — always returns 200 if the process is alive.
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'mgca-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /health/backend
 * Checks connectivity to the Spring Boot backend via its actuator health endpoint.
 */
router.get('/health/backend', async (_req: Request, res: Response) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${config.springBootUrl}/actuator/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      res.json({
        status: 'ok',
        service: 'mgca-backend',
        timestamp: new Date().toISOString(),
        backend: data,
      });
    } else {
      res.status(503).json({
        status: 'degraded',
        service: 'mgca-backend',
        timestamp: new Date().toISOString(),
        message: `Backend returned HTTP ${response.status}`,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(503).json({
      status: 'down',
      service: 'mgca-backend',
      timestamp: new Date().toISOString(),
      message: `Unable to reach backend: ${message}`,
    });
  }
});

export default router;
