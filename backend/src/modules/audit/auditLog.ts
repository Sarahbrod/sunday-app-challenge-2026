// =============================================================================
// src/modules/audit/auditLog.ts
//
// Purpose: Writes immutable audit log entries for security-relevant events.
// Provides a thin wrapper over Prisma's AuditLog model with structured
// action names and mandatory IP hashing.
//
// Security considerations:
// - IP addresses are ALWAYS stored as SHA-256 hashes. The raw IP is never
//   written to the database. Pass the raw IP — this module hashes it.
// - Audit log rows are append-only. There is no update or delete helper.
//   Enforce this at the database level with a row-level security policy or
//   a restricted database role that has only INSERT on audit_logs.
// - action names follow dot-notation: <domain>.<verb> (e.g. "auth.login",
//   "connection.created", "csv.uploaded"). This makes log queries predictable
//   and prevents the namespace pollution that comes from free-form strings.
// - userAgent is stored for forensic purposes but must be truncated to
//   prevent log injection via an oversized header.
// - Audit log writes are best-effort — a failure here should be logged to
//   stderr but must NOT cause the primary operation to fail. Wrap calls in
//   try/catch at the call site.
// =============================================================================

import type { PrismaClient } from '@prisma/client';
import { sha256 } from '../../utils/encryption';

// ─── Action name constants ────────────────────────────────────────────────────
//
// Use these rather than raw strings to avoid typos and make querying reliable.

export const AuditAction = {
  // Auth
  AUTH_LOGIN:           'auth.login',
  AUTH_LOGOUT:          'auth.logout',
  AUTH_REGISTER:        'auth.register',
  AUTH_REFRESH:         'auth.token_refreshed',
  AUTH_PASSWORD_CHANGE: 'auth.password_changed',

  // OAuth / platform connections
  OAUTH_INITIATED:   'connection.oauth_initiated',
  OAUTH_COMPLETED:   'connection.oauth_completed',
  OAUTH_FAILED:      'connection.oauth_failed',
  CONNECTION_DISCONNECTED: 'connection.disconnected',

  // CSV uploads
  CSV_UPLOADED:    'csv.uploaded',
  CSV_PROCESSED:   'csv.processed',
  CSV_QUARANTINED: 'csv.quarantined',

  // Account
  ACCOUNT_UPDATED: 'account.updated',
  ACCOUNT_DELETED: 'account.deleted',
} as const;

export type AuditActionKey = typeof AuditAction[keyof typeof AuditAction];

// ─── Options ──────────────────────────────────────────────────────────────────

export interface LogEventOptions {
  /** Authenticated user ID — null for unauthenticated events. */
  userId?:      string | null;
  action:       AuditActionKey;
  resourceType?: string;
  resourceId?:  string;
  /** Raw client IP address. This module hashes it before storage. */
  rawIp:        string;
  userAgent?:   string;
  success:      boolean;
}

// ─── AuditLog service ─────────────────────────────────────────────────────────

export class AuditLogService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Appends an audit log entry. Never throws — failures are written to stderr.
   * Designed to be fire-and-forget from route handlers:
   *
   *   void auditLog.log({ userId, action: AuditAction.AUTH_LOGIN, rawIp, success: true });
   */
  async log(opts: LogEventOptions): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId:       opts.userId ?? null,
          action:       opts.action,
          resourceType: opts.resourceType ?? null,
          resourceId:   opts.resourceId   ?? null,
          ipHash:       sha256(opts.rawIp),
          userAgent:    opts.userAgent?.slice(0, 512) ?? null, // Truncate to prevent log injection
          success:      opts.success,
        },
      });
    } catch (err) {
      // Never let audit log failure propagate to callers.
      console.error('[auditLog] Failed to write audit log entry:', err);
    }
  }
}
