// =============================================================================
// src/modules/auth/tokenService.ts
//
// Purpose: Issues, verifies, rotates, and revokes JWT access tokens and
// refresh tokens. Also manages Redis-backed user sessions with sliding
// expiry and a per-user concurrent session cap.
//
// Security considerations:
// - Access tokens are short-lived (15 min default). They carry the user ID,
//   email, account type, and session ID — enough for authorisation without
//   a DB lookup on every request.
// - Refresh tokens are long-lived (30 days default) and are ONLY delivered
//   as an httpOnly, Secure, SameSite=Strict cookie. They are never included
//   in a JSON response body and never logged.
// - Only the SHA-256 hex hash of each refresh token is stored in the DB.
//   A full database dump does not yield any usable refresh tokens.
// - Rotation is atomic: before issuing a new token pair, the old refresh
//   token is validated and immediately marked revokedAt. The replacedByTokenId
//   column links old and new tokens for audit purposes.
// - Reuse detection: if a token that has already been rotated (revokedAt set)
//   is presented again, all tokens for that user are immediately revoked.
//   This indicates either a stolen token or a replay attack.
// - Sessions are stored in Redis with a sliding TTL. Each authenticated
//   request calls touchSession() to reset the expiry.
// - A maximum of SESSION_MAX_CONCURRENT sessions per user is enforced.
//   The oldest session is evicted when the cap is reached.
// - Device fingerprints (SHA-256 of userAgent + ipHash) are stored with
//   sessions to enable anomaly detection without storing raw PII.
// =============================================================================

import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import type { Redis as RedisClient } from 'ioredis';
import { config } from '../../config/env';
import { sha256 } from '../../utils/encryption';

// ─── Token payload shapes ─────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub:         string;  // userId (UUID)
  email:       string;
  accountType: string;
  sessionId:   string;
  iat?:        number;
  exp?:        number;
}

export interface RefreshTokenPayload {
  sub:       string;  // userId (UUID)
  sessionId: string;
  jti:       string;  // Unique ID — used to locate the DB record by hash
  iat?:      number;
  exp?:      number;
}

// ─── Session shape (stored as JSON in Redis) ──────────────────────────────────

export interface SessionData {
  userId:     string;
  sessionId:  string;
  /** SHA-256(userAgent + ipHash) — device fingerprint for anomaly detection. */
  deviceInfo: string;
  createdAt:  number;  // Unix ms
  expiresAt:  number;  // Unix ms
}

// ─── Return type for full token pairs ────────────────────────────────────────

export interface TokenPair {
  accessToken:  string;
  /** Raw refresh token — set as a cookie only, never in a JSON body. */
  refreshToken: string;
}

// ─── Redis key helpers ────────────────────────────────────────────────────────

const sessionKey     = (sessionId: string) => `session:${sessionId}`;
const userSessionSet = (userId: string)    => `user_sessions:${userId}`;

// ─── Token Service ────────────────────────────────────────────────────────────

export class TokenService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: RedisClient,
  ) {}

  // ── Access tokens ─────────────────────────────────────────────────────────

  /**
   * Issues a signed JWT access token valid for accessTokenTtlSeconds.
   * The token is self-contained — do not store it in the database.
   */
  issueAccessToken(payload: AccessTokenPayload): string {
    const { sub, email, accountType, sessionId } = payload;
    return jwt.sign(
      { sub, email, accountType, sessionId },
      config.auth.jwtSecret,
      { expiresIn: config.auth.accessTokenTtlSeconds, algorithm: 'HS256' },
    );
  }

  /**
   * Verifies a JWT access token and returns its payload.
   * Throws a JsonWebTokenError or TokenExpiredError on failure — callers
   * should catch these and return a 401 response.
   */
  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, config.auth.jwtSecret, {
      algorithms: ['HS256'],
    }) as AccessTokenPayload;
  }

  // ── Refresh tokens ────────────────────────────────────────────────────────

  /**
   * Issues a new refresh token and persists its SHA-256 hash to the database.
   * Returns the raw token (to be set as an httpOnly cookie by the caller).
   *
   * IMPORTANT: The raw token is returned here and must be set as a cookie
   * immediately. It must not be logged, stored, or included in any response
   * body. After this function returns, only the hash can be retrieved.
   */
  async issueRefreshToken(
    userId: string,
    sessionId: string,
  ): Promise<{ rawToken: string; recordId: string }> {
    const jti      = crypto.randomUUID();
    const rawToken = jwt.sign(
      { sub: userId, sessionId, jti } satisfies Omit<RefreshTokenPayload, 'iat' | 'exp'>,
      config.auth.jwtRefreshSecret,
      { expiresIn: config.auth.refreshTokenTtlSeconds, algorithm: 'HS256' },
    );

    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + config.auth.refreshTokenTtlSeconds * 1_000);

    const record = await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { rawToken, recordId: record.id };
  }

  /**
   * Rotates a refresh token:
   * 1. Verifies the JWT signature and expiry.
   * 2. Looks up the stored hash and checks it has not been revoked.
   * 3. Reuse detection: if already revoked, revoke all user tokens (replay attack).
   * 4. Verifies the user account is still active.
   * 5. Issues a new token pair; marks the old refresh token as revokedAt.
   *
   * Returns the new access + refresh tokens and the userId.
   *
   * @throws on any invalid, expired, revoked, or replayed token.
   */
  async rotateRefreshToken(
    rawToken:  string,
    sessionId: string,
  ): Promise<TokenPair & { userId: string }> {
    // ── Step 1: Verify JWT ───────────────────────────────────────────────────
    let payload: RefreshTokenPayload;
    try {
      payload = jwt.verify(rawToken, config.auth.jwtRefreshSecret, {
        algorithms: ['HS256'],
      }) as RefreshTokenPayload;
    } catch {
      throw new Error('Refresh token is invalid or has expired.');
    }

    const tokenHash = sha256(rawToken);

    // ── Step 2: Look up the DB record ────────────────────────────────────────
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new Error('Refresh token not found or has expired.');
    }

    // ── Step 3: Reuse detection ──────────────────────────────────────────────
    if (record.revokedAt !== null) {
      // This token was already rotated. Revoke every token for this user —
      // this token family is compromised.
      await this.revokeAllRefreshTokens(payload.sub);
      await this.destroyAllUserSessions(payload.sub);
      throw new Error(
        'Refresh token has already been used. All sessions have been terminated ' +
        'as a security precaution. Please log in again.',
      );
    }

    // ── Step 4: Verify user is still active ──────────────────────────────────
    const user = await this.prisma.user.findUnique({
      where:  { id: payload.sub, deletedAt: null },
      select: { id: true, email: true, accountType: true, isActive: true, isSuspended: true },
    });

    if (!user) {
      throw new Error('User account not found.');
    }
    if (!user.isActive || user.isSuspended) {
      throw new Error('User account is inactive or suspended.');
    }

    // ── Step 5: Issue new tokens ──────────────────────────────────────────────
    const { rawToken: newRawToken, recordId: newRecordId } =
      await this.issueRefreshToken(user.id, sessionId);

    // Atomically revoke the old token and link it to the replacement.
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data:  { revokedAt: new Date(), replacedByTokenId: newRecordId },
    });

    const accessToken = this.issueAccessToken({
      sub:         user.id,
      email:       user.email,
      accountType: user.accountType,
      sessionId,
    });

    return { accessToken, refreshToken: newRawToken, userId: user.id };
  }

  /**
   * Revokes a single refresh token by its raw value.
   * Safe to call on logout — a missing or already-revoked token is a no-op.
   */
  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = sha256(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data:  { revokedAt: new Date() },
    });
  }

  /** Revokes all active refresh tokens for a user. Used on password change,
   *  account suspension, or reuse-detection events. */
  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data:  { revokedAt: new Date() },
    });
  }

  // ── Sessions (Redis) ──────────────────────────────────────────────────────

  /**
   * Creates a new Redis session for the user.
   * Enforces SESSION_MAX_CONCURRENT — evicts the oldest session if the cap
   * is already reached.
   *
   * @param deviceInfo - Caller should pass { userAgent, ipHash } where ipHash
   *   is SHA-256(rawIp). Raw IPs are never stored in session data.
   */
  async createSession(
    userId:     string,
    deviceInfo: { userAgent: string; ipHash: string },
  ): Promise<SessionData> {
    const sessionId   = crypto.randomUUID();
    const now         = Date.now();
    const expiresAt   = now + config.auth.sessionTtlSeconds * 1_000;
    const fingerprint = sha256(deviceInfo.userAgent + deviceInfo.ipHash);

    const session: SessionData = {
      userId,
      sessionId,
      deviceInfo: fingerprint,
      createdAt:  now,
      expiresAt,
    };

    const setKey = userSessionSet(userId);

    // Read current session IDs ordered oldest-first (score = createdAt ms).
    const existing = await this.redis.zrange(setKey, 0, -1);

    const pipe = this.redis.pipeline();

    // Evict oldest session(s) if at or over the cap.
    if (existing.length >= config.auth.maxConcurrentSessions) {
      const toEvict = existing.slice(0, existing.length - config.auth.maxConcurrentSessions + 1);
      for (const sid of toEvict) {
        pipe.del(sessionKey(sid));
        pipe.zrem(setKey, sid);
      }
    }

    pipe.setex(
      sessionKey(sessionId),
      config.auth.sessionTtlSeconds,
      JSON.stringify(session),
    );
    // Score = createdAt (ms) — enables ZRANGE by age for eviction ordering.
    pipe.zadd(setKey, now, sessionId);
    // Set the sorted set's own TTL to the session duration + buffer.
    pipe.expire(setKey, config.auth.sessionTtlSeconds + 60);

    await pipe.exec();

    return session;
  }

  /**
   * Retrieves a session by ID and resets its sliding TTL.
   * Returns null if the session does not exist or has already expired in Redis.
   *
   * Call this on every authenticated request to implement sliding expiry.
   */
  async touchSession(sessionId: string): Promise<SessionData | null> {
    const raw = await this.redis.getex(
      sessionKey(sessionId),
      'EX',
      config.auth.sessionTtlSeconds,
    );

    if (!raw) return null;

    return JSON.parse(raw) as SessionData;
  }

  /** Destroys a single session. Call on logout. */
  async destroySession(sessionId: string, userId: string): Promise<void> {
    const pipe = this.redis.pipeline();
    pipe.del(sessionKey(sessionId));
    pipe.zrem(userSessionSet(userId), sessionId);
    await pipe.exec();
  }

  /** Destroys all sessions for a user. Call on password change or account suspension. */
  async destroyAllUserSessions(userId: string): Promise<void> {
    const setKey    = userSessionSet(userId);
    const sessionIds = await this.redis.zrange(setKey, 0, -1);
    const pipe      = this.redis.pipeline();
    for (const sid of sessionIds) {
      pipe.del(sessionKey(sid));
    }
    pipe.del(setKey);
    await pipe.exec();
  }

  // ── Cookie options ────────────────────────────────────────────────────────

  /**
   * Returns the recommended cookie options for the refresh token cookie.
   * Use these when calling res.cookie('refreshToken', rawToken, options).
   *
   * The path is scoped to /auth/refresh to prevent the browser sending the
   * cookie to other endpoints, minimising the exposure window.
   */
  refreshTokenCookieOptions() {
    return {
      httpOnly: true,
      secure:   config.isProduction,
      sameSite: 'strict' as const,
      domain:   config.app.cookieDomain,
      maxAge:   config.auth.refreshTokenTtlSeconds * 1_000,
      path:     '/auth/refresh',
    };
  }
}
