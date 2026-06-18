// =============================================================================
// src/middleware/rateLimiter.ts
//
// Purpose: Redis-backed sliding-window rate limiting middleware.
// Provides three pre-configured limiters: global (per-IP), auth endpoints
// (per-IP with exponential backoff), and CSV upload (per user ID).
//
// Security considerations:
// - All limits are read from config — never hardcoded.
// - A sliding window (Redis sorted set) is used instead of a fixed counter
//   to prevent the "window-boundary burst" attack where a client sends
//   N requests just before and N requests just after a window resets.
// - Auth endpoints apply exponential backoff: each successive violation
//   doubles the Retry-After duration, capped at one hour. This makes
//   brute-force attacks economically infeasible without outright banning IPs.
// - Rate limit keys use SHA-256(rawIP) — the raw client IP is never
//   written to Redis. User-scoped keys use SHA-256(userId).
// - X-Forwarded-For is only trusted when TRUST_PROXY=1 env var is set,
//   preventing spoofing by clients who send a fake forwarded header.
// - The Lua script executes atomically; there is no race condition between
//   the count check and the increment.
// - On Redis failure, the middleware fails open (allows the request) with
//   a console error. In a hardened production deployment, consider failing
//   closed instead — change the catch block to call next(err).
// =============================================================================

import type { Request, Response, NextFunction } from 'express';
import type { Redis as RedisClient } from 'ioredis';
import { config } from '../config/env';
import { sha256 } from '../utils/encryption';

// ─── Augmented request type ───────────────────────────────────────────────────

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

// ─── Options ──────────────────────────────────────────────────────────────────

interface RateLimitOptions {
  /** Redis key namespace, e.g. "rl:global". Must be unique per limiter. */
  keyPrefix: string;
  /** Maximum allowed requests within the window. */
  max: number;
  /** Window duration in milliseconds. */
  windowMs: number;
  /** When true, tracks by authenticated userId instead of client IP. */
  trackByUser?: boolean;
  /** When true, applies exponential backoff after the first breach. */
  exponentialBackoff?: boolean;
}

// ─── Sliding-window Lua script ────────────────────────────────────────────────
//
// Executes atomically in Redis. For each call:
//   1. Remove all timestamps older than (now - windowMs).
//   2. Count remaining entries.
//   3. If count < max: add current timestamp entry, reset TTL, return [count+1, 0].
//   4. If count >= max: compute retryAfterMs from oldest entry, return [count, retryAfterMs].
//
// Returns a two-element array: [currentCount, retryAfterMs]
// retryAfterMs == 0 means the request is allowed.
//
const SLIDING_WINDOW_LUA = `
local key      = KEYS[1]
local now      = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local max      = tonumber(ARGV[3])
local ttl      = math.ceil(windowMs / 1000) + 1

redis.call('ZREMRANGEBYSCORE', key, '-inf', now - windowMs)
local count = redis.call('ZCARD', key)

if count < max then
  local member = tostring(now) .. ':' .. tostring(math.random(1, 2147483647))
  redis.call('ZADD', key, now, member)
  redis.call('EXPIRE', key, ttl)
  return {count + 1, 0}
else
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local retryAfter = 0
  if oldest and #oldest >= 2 then
    retryAfter = math.max(0, math.ceil(windowMs - (now - tonumber(oldest[2]))))
  end
  return {count, retryAfter}
end
`;

// ─── Exponential backoff helpers ──────────────────────────────────────────────

const MAX_BACKOFF_MS     = 3_600_000; // Cap at 1 hour
const INITIAL_BACKOFF_MS = 30_000;    // First backoff: 30 seconds

function backoffKey(keyPrefix: string, identifier: string): string {
  return `${keyPrefix}:backoff:${identifier}`;
}

async function getActiveBackoffMs(
  redis: RedisClient,
  bKey: string,
): Promise<number> {
  const raw = await redis.get(bKey);
  return raw ? parseInt(raw, 10) : 0;
}

async function escalateBackoff(
  redis: RedisClient,
  bKey: string,
): Promise<number> {
  const current = await getActiveBackoffMs(redis, bKey);
  const next    = current === 0
    ? INITIAL_BACKOFF_MS
    : Math.min(current * 2, MAX_BACKOFF_MS);
  // TTL matches the backoff duration so it auto-clears when the penalty expires.
  await redis.set(bKey, String(next), 'PX', next);
  return next;
}

// ─── Core factory ─────────────────────────────────────────────────────────────

export function createRateLimiter(
  redis: RedisClient,
  options: RateLimitOptions,
) {
  const {
    keyPrefix,
    max,
    windowMs,
    trackByUser         = false,
    exponentialBackoff  = false,
  } = options;

  return async function rateLimiterMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // ── Resolve identifier ──────────────────────────────────────────────────
      let identifier: string;

      if (trackByUser) {
        const userId = (req as AuthenticatedRequest).user?.id;
        if (!userId) {
          // No authenticated user on this request — skip user-scoped limiting.
          // The auth middleware upstream will reject the request if auth is
          // required, so we do not need to act here.
          return next();
        }
        identifier = sha256(userId);
      } else {
        const rawIp = resolveClientIp(req);
        identifier  = sha256(rawIp);
      }

      const slidingKey = `${keyPrefix}:${identifier}`;
      const now        = Date.now();

      // ── Exponential backoff check (auth endpoints only) ─────────────────────
      if (exponentialBackoff) {
        const bKey      = backoffKey(keyPrefix, identifier);
        const backoffMs = await getActiveBackoffMs(redis, bKey);

        if (backoffMs > 0) {
          setRateLimitHeaders(res, max, 0, now + windowMs);
          res.setHeader('Retry-After', Math.ceil(backoffMs / 1000));
          res.status(429).json({
            error:              'Too many requests. Please wait before retrying.',
            retryAfterSeconds:  Math.ceil(backoffMs / 1000),
          });
          return;
        }
      }

      // ── Sliding-window check ────────────────────────────────────────────────
      const [count, retryAfterMs] = (await redis.eval(
        SLIDING_WINDOW_LUA,
        1,
        slidingKey,
        String(now),
        String(windowMs),
        String(max),
      )) as [number, number];

      setRateLimitHeaders(res, max, Math.max(0, max - count), now + windowMs);

      if (retryAfterMs > 0) {
        let replyAfterSeconds = Math.ceil(retryAfterMs / 1000);

        if (exponentialBackoff) {
          const bKey    = backoffKey(keyPrefix, identifier);
          const nextMs  = await escalateBackoff(redis, bKey);
          replyAfterSeconds = Math.ceil(nextMs / 1000);
          res.setHeader('Retry-After', replyAfterSeconds);
        } else {
          res.setHeader('Retry-After', replyAfterSeconds);
        }

        res.status(429).json({
          error:             'Rate limit exceeded.',
          retryAfterSeconds: replyAfterSeconds,
        });
        return;
      }

      next();
    } catch (err) {
      // Fail open — log the Redis error but do not block the request.
      // To fail closed instead, replace next() with next(err).
      console.error('[rateLimiter] Redis error — failing open:', err);
      next();
    }
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveClientIp(req: Request): string {
  if (config.trustProxy) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim() ?? 'unknown';
    }
  }
  return req.socket.remoteAddress ?? 'unknown';
}

function setRateLimitHeaders(
  res: Response,
  limit: number,
  remaining: number,
  resetEpochMs: number,
): void {
  res.setHeader('X-RateLimit-Limit',     limit);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset',     Math.ceil(resetEpochMs / 1000));
}

// ─── Pre-configured limiters ──────────────────────────────────────────────────

/**
 * Global limiter: 100 requests per minute per IP.
 * Apply to all routes as the outermost middleware.
 */
export function globalLimiter(redis: RedisClient) {
  return createRateLimiter(redis, {
    keyPrefix: 'rl:global',
    max:       config.rateLimit.global.max,
    windowMs:  config.rateLimit.global.windowMs,
  });
}

/**
 * Auth limiter: 10 requests per 15 minutes per IP, with exponential backoff.
 * Apply to /auth/login, /auth/register, /auth/refresh, /auth/forgot-password.
 */
export function authLimiter(redis: RedisClient) {
  return createRateLimiter(redis, {
    keyPrefix:         'rl:auth',
    max:               config.rateLimit.auth.max,
    windowMs:          config.rateLimit.auth.windowMs,
    exponentialBackoff: true,
  });
}

/**
 * CSV upload limiter: 5 uploads per hour per authenticated user.
 * Apply to the CSV upload route after the auth middleware.
 */
export function csvUploadLimiter(redis: RedisClient) {
  return createRateLimiter(redis, {
    keyPrefix:   'rl:csv',
    max:         config.rateLimit.csv.max,
    windowMs:    config.rateLimit.csv.windowMs,
    trackByUser: true,
  });
}
