import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

interface ErrorResponseBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path?: string;
}

/**
 * Global Express error handler.
 * Returns a structured JSON error response.
 * Stack traces are never exposed in production.
 */
export function errorHandler(
  err: Error & { status?: number; statusCode?: number },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status || err.statusCode || 500;
  const isProduction = config.nodeEnv === 'production';

  const body: ErrorResponseBody = {
    timestamp: new Date().toISOString(),
    status,
    error: getErrorLabel(status),
    message: isProduction && status === 500
      ? 'Internal server error'
      : err.message || 'An unexpected error occurred',
  };

  // Include path for debugging in non-production
  if (!isProduction) {
    body.path = req.originalUrl;
  }

  // Log the full error server-side
  console.error(
    `[ERROR] ${req.method} ${req.originalUrl} → ${status}`,
    isProduction ? err.message : err.stack
  );

  res.status(status).json(body);
}

/**
 * Map HTTP status code to a human-readable label.
 */
function getErrorLabel(status: number): string {
  const labels: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    409: 'Conflict',
    413: 'Payload Too Large',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };
  return labels[status] || 'Error';
}
