// =============================================================================
// src/routes/oauthRoutes.ts
//
// Purpose: Express router for OAuth 2.0 + PKCE platform connection flows.
// Handles authorization initiation, callback processing, and disconnection
// for YouTube and Spotify.
//
// Security considerations:
// - All routes require authentication (requireAuth middleware must be applied
//   by the caller before mounting this router).
// - The /start route is rate-limited by the auth rate limiter to prevent
//   state-flooding attacks (generating many pending states to exhaust Redis).
// - The /callback route is rate-limited per IP using the auth limiter with
//   exponential backoff to prevent code-stuffing attacks.
// - The `error` query parameter from the provider is sanitised before logging.
//   Never log raw query strings that may contain token fragments.
// - state and code parameters are never logged — they are one-time secrets.
// - All error responses use generic messages — the real error is logged
//   server-side with the request ID for correlation.
// - On any callback error (state mismatch, token exchange failure, etc.),
//   the pending Redis state is already deleted (single-use). A retry requires
//   the user to restart the flow via /start.
//
// Mount this router on the Express app after auth middleware:
//   app.use('/api/oauth', requireAuth, oauthRouter);
// =============================================================================

import { Router, type Request, type Response } from 'express';
import type { PrismaClient } from '@prisma/client';
import type { Redis as RedisClient } from 'ioredis';
import { OAuthService, type SupportedPlatform, type YouTubeChannelMetadata } from '../modules/oauth/oauthService';
import { AuditLogService, AuditAction } from '../modules/audit/auditLog';
import { authLimiter } from '../middleware/rateLimiter';
import { config } from '../config/env';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
  requestId: string;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createOAuthRouter(
  prisma: PrismaClient,
  redis:  RedisClient,
): Router {
  const router       = Router();
  const oauthService = new OAuthService(prisma, redis);
  const auditLog     = new AuditLogService(prisma);

  const SUPPORTED: Set<string> = new Set(['youtube', 'spotify']);

  function resolveIp(req: Request): string {
    if (config.trustProxy) {
      const fwd = req.headers['x-forwarded-for'];
      if (typeof fwd === 'string') return fwd.split(',')[0]?.trim() ?? 'unknown';
    }
    return req.socket.remoteAddress ?? 'unknown';
  }

  // ── Validate platform param ────────────────────────────────────────────────

  function assertPlatform(
    platform: string,
    res: Response,
  ): platform is SupportedPlatform {
    if (!SUPPORTED.has(platform)) {
      res.status(400).json({ error: 'Unsupported platform.' });
      return false;
    }
    return true;
  }

  // ── GET /api/oauth/:platform/start ─────────────────────────────────────────
  //
  // Returns the authorization URL for the requested platform.
  // The frontend opens this URL (popup or redirect) to start the OAuth flow.
  //
  // Rate-limited: 10 per 15 minutes per IP (authLimiter).
  // Requires: authenticated user (req.user.id).

  router.get(
    '/:platform/start',
    authLimiter(redis),
    async (req: Request, res: Response): Promise<void> => {
      const { platform } = req.params as { platform: string };
      const authReq       = req as AuthenticatedRequest;

      if (!assertPlatform(platform, res)) return;

      try {
        const result = await oauthService.initiateOAuth(authReq.user.id, platform);

        void auditLog.log({
          userId:       authReq.user.id,
          action:       AuditAction.OAUTH_INITIATED,
          resourceType: 'PlatformConnection',
          rawIp:        resolveIp(req),
          userAgent:    req.headers['user-agent'],
          success:      true,
        });

        res.json({ authUrl: result.authUrl });
      } catch (err) {
        console.error(`[oauthRoutes] /start error [${authReq.requestId}]:`, err);
        res.status(500).json({ error: 'Could not initiate connection. Please try again.' });
      }
    },
  );

  // ── GET /api/oauth/:platform/callback ──────────────────────────────────────
  //
  // Receives the authorization code from the OAuth provider.
  // Validates state, exchanges code (with PKCE verifier), encrypts tokens,
  // stores the connection, and redirects the popup/window back to the frontend.
  //
  // Rate-limited: 10 per 15 minutes per IP (authLimiter with exponential backoff).
  // Requires: authenticated user (req.user.id via session cookie).

  router.get(
    '/:platform/callback',
    authLimiter(redis),
    async (req: Request, res: Response): Promise<void> => {
      const { platform }        = req.params as { platform: string };
      const { code, state, error } = req.query as Record<string, string | undefined>;
      const authReq              = req as AuthenticatedRequest;
      const rawIp                = resolveIp(req);

      if (!assertPlatform(platform, res)) return;

      // Provider denied access (user cancelled or permissions refused)
      if (error) {
        void auditLog.log({
          userId:  authReq.user.id,
          action:  AuditAction.OAUTH_FAILED,
          rawIp,
          userAgent: req.headers['user-agent'],
          success: false,
        });
        // Redirect to frontend with error flag — never expose the raw error value
        res.redirect(`${getCallbackRedirectBase()}?status=error&reason=access_denied`);
        return;
      }

      if (!code || !state) {
        res.status(400).json({ error: 'Missing required callback parameters.' });
        return;
      }

      try {
        // YouTube uses the multi-channel handler; all others use the generic one
        let redirectParams: string;

        if (platform === 'youtube') {
          const ch: YouTubeChannelMetadata = await oauthService.handleYouTubeChannelCallback(
            authReq.user.id, code, state,
          );
          redirectParams =
            `?status=success&platform=youtube` +
            `&channelId=${encodeURIComponent(ch.channelId)}` +
            `&channelName=${encodeURIComponent(ch.channelName)}` +
            (ch.thumbnailUrl ? `&thumbnailUrl=${encodeURIComponent(ch.thumbnailUrl)}` : '') +
            (ch.subscriberCount != null ? `&subscriberCount=${ch.subscriberCount}` : '');
        } else {
          const meta = await oauthService.handleCallback(authReq.user.id, platform, code, state);
          redirectParams =
            `?status=success&platform=${platform}` +
            `&username=${encodeURIComponent(meta.platformUsername)}` +
            (meta.avatarUrl ? `&avatarUrl=${encodeURIComponent(meta.avatarUrl)}` : '');
        }

        void auditLog.log({
          userId:       authReq.user.id,
          action:       AuditAction.OAUTH_COMPLETED,
          resourceType: 'PlatformConnection',
          rawIp,
          userAgent:    req.headers['user-agent'],
          success:      true,
        });

        res.redirect(`${getCallbackRedirectBase()}${redirectParams}`);
      } catch (err) {
        console.error(`[oauthRoutes] /callback error [${authReq.requestId}]:`, err);

        void auditLog.log({
          userId:  authReq.user.id,
          action:  AuditAction.OAUTH_FAILED,
          rawIp,
          userAgent: req.headers['user-agent'],
          success: false,
        });

        res.redirect(`${getCallbackRedirectBase()}?status=error&reason=server_error`);
      }
    },
  );

  // ── DELETE /api/oauth/:platform/disconnect ─────────────────────────────────
  //
  // Revokes the platform token and removes the connection record.

  router.delete(
    '/:platform/disconnect',
    async (req: Request, res: Response): Promise<void> => {
      const { platform } = req.params as { platform: string };
      const authReq       = req as AuthenticatedRequest;

      if (!assertPlatform(platform, res)) return;

      try {
        await oauthService.disconnect(authReq.user.id, platform);

        void auditLog.log({
          userId:       authReq.user.id,
          action:       AuditAction.CONNECTION_DISCONNECTED,
          resourceType: 'PlatformConnection',
          rawIp:        resolveIp(req),
          userAgent:    req.headers['user-agent'],
          success:      true,
        });

        res.json({ success: true });
      } catch (err) {
        console.error(`[oauthRoutes] /disconnect error [${authReq.requestId}]:`, err);
        res.status(500).json({ error: 'Could not disconnect. Please try again.' });
      }
    },
  );

  // ── GET /api/oauth/youtube/channels ───────────────────────────────────────
  //
  // Returns all YouTube channels for the authenticated user.
  // Excludes INACTIVE (soft-deleted) channels.
  // Never exposes tokens or credentials.

  router.get(
    '/youtube/channels',
    async (req: Request, res: Response): Promise<void> => {
      const authReq = req as AuthenticatedRequest;
      try {
        const channels = await oauthService.getYouTubeChannels(authReq.user.id);
        res.json({ channels });
      } catch (err) {
        console.error(`[oauthRoutes] /youtube/channels error [${authReq.requestId}]:`, err);
        res.status(500).json({ error: 'Could not load YouTube channels.' });
      }
    },
  );

  // ── DELETE /api/oauth/youtube/channels/:channelId ──────────────────────────
  //
  // Disconnects a single YouTube channel.
  // Query param `deleteData=true` hard-deletes historical data;
  // omitting it (or false) soft-deletes — data is retained.
  //
  // When this is the last channel under a Google account, also revokes
  // the Google OAuth token and removes the GoogleAccount row.

  router.delete(
    '/youtube/channels/:channelId',
    async (req: Request, res: Response): Promise<void> => {
      const { channelId } = req.params as { channelId: string };
      const deleteData    = req.query['deleteData'] === 'true';
      const authReq       = req as AuthenticatedRequest;

      try {
        await oauthService.disconnectYouTubeChannel(authReq.user.id, channelId, deleteData);

        void auditLog.log({
          userId:       authReq.user.id,
          action:       AuditAction.CONNECTION_DISCONNECTED,
          resourceType: 'YouTubeChannel',
          rawIp:        resolveIp(req),
          userAgent:    req.headers['user-agent'],
          success:      true,
        });

        res.json({ success: true, dataDeleted: deleteData });
      } catch (err) {
        console.error(`[oauthRoutes] /youtube/channels delete error [${authReq.requestId}]:`, err);
        res.status(500).json({ error: 'Could not disconnect channel. Please try again.' });
      }
    },
  );

  // ── GET /api/oauth/connections ─────────────────────────────────────────────
  //
  // Returns metadata for all active connections. Never exposes tokens.

  router.get(
    '/connections',
    async (req: Request, res: Response): Promise<void> => {
      const authReq = req as AuthenticatedRequest;

      try {
        const connections = await oauthService.getConnections(authReq.user.id);
        res.json({ connections });
      } catch (err) {
        console.error(`[oauthRoutes] /connections error [${authReq.requestId}]:`, err);
        res.status(500).json({ error: 'Could not load connections.' });
      }
    },
  );

  return router;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCallbackRedirectBase(): string {
  // In production this would be the frontend origin from config.
  // The callback page closes the popup and posts a message to the opener.
  return config.isProduction
    ? `${config.app.allowedOrigins[0]}/oauth/callback`
    : 'http://localhost:3000/oauth/callback';
}
