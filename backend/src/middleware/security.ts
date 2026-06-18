// =============================================================================
// src/middleware/security.ts
//
// Purpose: Applies security HTTP response headers, CORS policy, and a
// per-request ID to the Express application. Call applySecurityMiddleware(app)
// once during application startup, before any route handlers are registered.
//
// Security considerations:
// - Allowed CORS origins are read from ALLOWED_ORIGINS env var. Wildcard (*)
//   is explicitly rejected in production — an error is thrown at startup.
// - Content-Security-Policy bans unsafe-inline and unsafe-eval. If the
//   frontend requires inline styles or scripts, prefer nonce-based CSP.
// - HSTS is set to 1 year with includeSubDomains and preload — only enable
//   preload after verifying all subdomains support HTTPS.
// - X-Content-Type-Options: nosniff prevents MIME-type sniffing attacks.
// - X-Frame-Options: DENY prevents clickjacking. Revisit if you need embeds.
// - Referrer-Policy: strict-origin-when-cross-origin limits referrer leakage.
// - Permissions-Policy restricts camera, microphone, geolocation, and payment
//   APIs that this application has no reason to use.
// - A unique X-Request-ID is injected into every request for log correlation.
//   If a trusted upstream proxy provides this header, it is preserved.
// - JSON body size is limited to 1 MB. CSV uploads use multipart and are
//   governed by fileValidator.ts / multer, not this limit.
// =============================================================================

import { randomUUID } from 'node:crypto';
import type { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors, { type CorsOptions } from 'cors';
import express from 'express';
import { config } from '../config/env';

// ─── CORS ─────────────────────────────────────────────────────────────────────

function buildCorsOptions(): CorsOptions {
  const allowedOrigins = config.app.allowedOrigins;

  if (config.isProduction && allowedOrigins.includes('*')) {
    throw new Error(
      '[security] ALLOWED_ORIGINS contains a wildcard (*) which is forbidden ' +
      'in production. List each allowed origin explicitly.',
    );
  }

  return {
    origin(requestOrigin, callback) {
      // Server-to-server requests have no Origin header — allow them.
      if (!requestOrigin) return callback(null, true);

      if (allowedOrigins.includes(requestOrigin)) {
        return callback(null, true);
      }

      return callback(
        Object.assign(new Error('CORS policy violation'), { status: 403 }),
      );
    },
    methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Retry-After',
      'X-Request-ID',
    ],
    credentials: true,
    maxAge:      86_400,  // Cache preflight for 24 hours
  };
}

// ─── Helmet (security headers) ────────────────────────────────────────────────

function buildHelmetOptions(): Parameters<typeof helmet>[0] {
  return {
    // Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
    strictTransportSecurity: {
      maxAge:            31_536_000,
      includeSubDomains: true,
      preload:           true,
    },

    // X-Content-Type-Options: nosniff
    contentTypeOptions: true,

    // X-Frame-Options: DENY
    frameguard: { action: 'deny' },

    // Remove X-Powered-By header (Express fingerprinting)
    hidePoweredBy: true,

    // Referrer-Policy: strict-origin-when-cross-origin
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // Content-Security-Policy
    // No unsafe-inline, no unsafe-eval.
    // Adjust script-src and style-src if the API serves any HTML responses.
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        'default-src':     ["'self'"],
        'script-src':      ["'self'"],
        'style-src':       ["'self'"],
        'img-src':         ["'self'", 'data:'],
        'connect-src':     ["'self'"],
        'font-src':        ["'self'"],
        'object-src':      ["'none'"],
        'frame-ancestors': ["'none'"],
        'base-uri':        ["'self'"],
        'form-action':     ["'self'"],
        ...(config.isProduction
          ? { 'upgrade-insecure-requests': [] }
          : {}),
      },
    },

    // Cross-Origin policies
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy:   { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
  };
}

// ─── Permissions-Policy ───────────────────────────────────────────────────────

function permissionsPolicy(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'interest-cohort=()',
    ].join(', '),
  );
  next();
}

// ─── Request ID ───────────────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

function requestId(req: Request, res: Response, next: NextFunction): void {
  // Preserve an ID set by a trusted upstream proxy; otherwise generate one.
  const id =
    (config.trustProxy
      ? (req.headers['x-request-id'] as string | undefined)
      : undefined) ?? randomUUID();

  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
}

// ─── CORS error handler ───────────────────────────────────────────────────────

function corsErrorHandler(
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err.message === 'CORS policy violation') {
    res.status(403).json({ error: 'Forbidden: origin not permitted.' });
    return;
  }
  next(err);
}

// ─── Global error handler ─────────────────────────────────────────────────────

function globalErrorHandler(
  err: Error & { status?: number; statusCode?: number },
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err.status ?? err.statusCode ?? 500;

  // Log the full error server-side, but never send stack traces to clients.
  console.error(`[error] ${req.requestId} ${req.method} ${req.path}`, {
    status,
    message: err.message,
    stack:   config.isProduction ? undefined : err.stack,
  });

  if (res.headersSent) return;

  res.status(status).json({
    error:     status < 500 ? err.message : 'An unexpected error occurred.',
    requestId: req.requestId,
  });
}

// ─── Compose and apply ────────────────────────────────────────────────────────

/**
 * Applies all security middleware to the Express application.
 * Call this before registering any routes.
 *
 * Usage:
 *   const app = express();
 *   applySecurityMiddleware(app);
 *   app.use('/api', router);
 */
export function applySecurityMiddleware(app: Application): void {
  // 1. Inject request ID first so all subsequent middleware can reference it.
  app.use(requestId);

  // 2. Security headers via helmet.
  app.use(helmet(buildHelmetOptions()));

  // 3. Permissions-Policy (not covered by helmet's defaults).
  app.use(permissionsPolicy);

  // 4. CORS — must come before body parsing so OPTIONS preflight is handled.
  app.use(cors(buildCorsOptions()));

  // 5. CORS error handler — must follow cors() in the middleware chain.
  // Express recognises a 4-argument function as an error handler.
  app.use(corsErrorHandler as Parameters<typeof app.use>[0]);

  // 6. Parse JSON bodies — 1 MB limit to mitigate payload-based DoS.
  //    CSV uploads use multipart via multer and are NOT subject to this limit.
  app.use(express.json({ limit: '1mb', strict: true }));

  // 7. Reject URL-encoded bodies larger than 32 KB.
  app.use(express.urlencoded({ extended: false, limit: '32kb' }));
}

/**
 * Registers the global error handler. Call this after all route handlers
 * are registered — error handlers must be the last middleware in the chain.
 *
 * Usage:
 *   app.use('/api', router);
 *   applyErrorHandler(app);  // ← last
 */
export function applyErrorHandler(app: Application): void {
  app.use(globalErrorHandler as Parameters<typeof app.use>[0]);
}
