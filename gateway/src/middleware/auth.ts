import { Request, Response, NextFunction } from 'express';

/**
 * Auth forwarding middleware.
 *
 * This middleware extracts the Bearer token from the Authorization header
 * and attaches it to `req.headers` so it is forwarded on proxied requests.
 *
 * JWT validation is NOT performed here — that responsibility belongs to
 * the Spring Boot backend. This gateway only passes the token through.
 */
export function authForwarder(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Token is already in the header — nothing to do.
    // http-proxy-middleware will forward all original headers automatically.
    // We just ensure the header is well-formed and present.
    const token = authHeader.substring(7).trim();

    if (!token) {
      // Malformed Bearer header (empty token) — let Spring Boot reject it.
      delete req.headers.authorization;
    }
  }

  next();
}

/**
 * Utility: Extract raw token string from a request's Authorization header.
 * Returns null if no valid Bearer token is present.
 */
export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  return token || null;
}
