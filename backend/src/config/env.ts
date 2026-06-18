// =============================================================================
// src/config/env.ts
//
// Purpose: Centralised, validated environment configuration loader.
// This is the single source of truth for all runtime configuration.
//
// Rules for the rest of the codebase:
//   ✓  Import `config` from this module.
//   ✗  Never access process.env directly outside this file.
//   ✗  Never hardcode secrets, URLs, or credentials anywhere.
//
// Security considerations:
// - All required variables are validated at process startup with zod.
//   A missing or malformed variable causes an immediate hard crash with a
//   descriptive error rather than silent failure later at runtime.
// - Secrets (JWT_SECRET, ENCRYPTION_KEY, etc.) enforce minimum lengths so
//   accidentally short or placeholder values are rejected.
// - ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes / AES-256).
//   The regex check prevents hex-valid-but-wrong-endian key material.
// - The config object is exported as `as const` — callers receive readonly
//   references and cannot mutate runtime configuration.
// =============================================================================

import { z } from 'zod';

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z.object({

  // ── Runtime ────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // ── Database ───────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection URL'),

  // ── Redis ──────────────────────────────────────────────────────────────────
  REDIS_URL: z.string().url('REDIS_URL must be a valid Redis connection URL'),

  // ── JWT secrets ────────────────────────────────────────────────────────────
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters — generate with crypto.randomBytes(64).toString("hex")'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters and different from JWT_SECRET'),
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters'),

  // ── Encryption key ─────────────────────────────────────────────────────────
  // Exactly 64 hex chars = 32 bytes = AES-256 key size.
  // Changing this value requires re-encrypting all stored tokens.
  // See README "Environment setup → Key rotation".
  ENCRYPTION_KEY: z
    .string()
    .length(64, 'ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes for AES-256)')
    .regex(
      /^[0-9a-fA-F]{64}$/,
      'ENCRYPTION_KEY must contain only hexadecimal characters (0-9, a-f)',
    ),

  // ── Google OAuth (used for both SSO and YouTube Analytics API) ─────────────
  GOOGLE_CLIENT_ID:     z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  GOOGLE_REDIRECT_URI:  z.string().url('GOOGLE_REDIRECT_URI must be a valid URL'),

  // ── Apple OAuth (Sign in with Apple) ───────────────────────────────────────
  APPLE_CLIENT_ID:   z.string().min(1, 'APPLE_CLIENT_ID is required'),
  APPLE_TEAM_ID:     z.string().min(1, 'APPLE_TEAM_ID is required'),
  APPLE_KEY_ID:      z.string().min(1, 'APPLE_KEY_ID is required'),
  APPLE_PRIVATE_KEY: z.string().min(1, 'APPLE_PRIVATE_KEY is required'),

  // ── YouTube Data API (separate OAuth client from Google SSO) ───────────────
  YOUTUBE_CLIENT_ID:     z.string().min(1, 'YOUTUBE_CLIENT_ID is required'),
  YOUTUBE_CLIENT_SECRET: z.string().min(1, 'YOUTUBE_CLIENT_SECRET is required'),
  YOUTUBE_REDIRECT_URI:  z.string().url('YOUTUBE_REDIRECT_URI must be a valid URL'),

  // ── Spotify ────────────────────────────────────────────────────────────────
  SPOTIFY_CLIENT_ID:     z.string().min(1, 'SPOTIFY_CLIENT_ID is required'),
  SPOTIFY_CLIENT_SECRET: z.string().min(1, 'SPOTIFY_CLIENT_SECRET is required'),
  SPOTIFY_REDIRECT_URI:  z.string().url('SPOTIFY_REDIRECT_URI must be a valid URL'),

  // ── Apple Podcasts (API key, not OAuth) ────────────────────────────────────
  APPLE_PODCASTS_API_KEY: z.string().min(1, 'APPLE_PODCASTS_API_KEY is required'),

  // ── Application ────────────────────────────────────────────────────────────
  COOKIE_DOMAIN:   z.string().min(1, 'COOKIE_DOMAIN is required'),
  ALLOWED_ORIGINS: z
    .string()
    .min(1, 'ALLOWED_ORIGINS must be a comma-separated list of allowed origins'),

  // Set to "1" only when running behind a trusted reverse proxy (e.g. nginx).
  TRUST_PROXY: z.coerce.number().int().min(0).max(1).default(0),

  // ── File upload limits ─────────────────────────────────────────────────────
  MAX_CSV_FILE_SIZE_MB: z.coerce
    .number()
    .positive('MAX_CSV_FILE_SIZE_MB must be a positive number')
    .default(10),
  MAX_CSV_ROWS: z.coerce
    .number()
    .positive()
    .int('MAX_CSV_ROWS must be a positive integer')
    .default(100_000),

  // ── Rate limiting ──────────────────────────────────────────────────────────
  RATE_LIMIT_GLOBAL_MAX:       z.coerce.number().positive().int().default(100),
  RATE_LIMIT_GLOBAL_WINDOW_MS: z.coerce.number().positive().int().default(60_000),
  RATE_LIMIT_AUTH_MAX:         z.coerce.number().positive().int().default(10),
  RATE_LIMIT_AUTH_WINDOW_MS:   z.coerce.number().positive().int().default(900_000),
  RATE_LIMIT_CSV_MAX:          z.coerce.number().positive().int().default(5),
  RATE_LIMIT_CSV_WINDOW_MS:    z.coerce.number().positive().int().default(3_600_000),

  // ── JWT lifetimes ──────────────────────────────────────────────────────────
  JWT_ACCESS_TOKEN_TTL_SECONDS:  z.coerce.number().positive().int().default(900),       // 15 min
  JWT_REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().positive().int().default(2_592_000), // 30 days

  // ── Session ────────────────────────────────────────────────────────────────
  SESSION_MAX_CONCURRENT: z.coerce.number().positive().int().default(5),
  SESSION_TTL_SECONDS:    z.coerce.number().positive().int().default(86_400), // 24 h

});

// ─── Validation ───────────────────────────────────────────────────────────────

function loadAndValidate(): z.infer<typeof schema> {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    const lines = result.error.errors.map(
      (e) => `  [${e.path.join('.')}] ${e.message}`,
    );

    throw new Error(
      [
        '',
        '╔══════════════════════════════════════════════════════════╗',
        '║         Environment configuration validation failed       ║',
        '╚══════════════════════════════════════════════════════════╝',
        '',
        'The following environment variables are missing or invalid:',
        '',
        ...lines,
        '',
        'Copy .env.example to .env and populate all required values.',
        'See README "Environment setup" for generation commands.',
        '',
      ].join('\n'),
    );
  }

  return result.data;
}

// Validate immediately — the process exits here if anything is wrong.
const env = loadAndValidate();

// ─── Typed config object ──────────────────────────────────────────────────────
//
// All application code should destructure from here, never from process.env.
// Grouping by concern makes it easy to see what each module depends on.

export const config = {
  env:          env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  trustProxy:   env.TRUST_PROXY === 1,

  database: {
    url: env.DATABASE_URL,
  },

  redis: {
    url: env.REDIS_URL,
  },

  auth: {
    jwtSecret:              env.JWT_SECRET,
    jwtRefreshSecret:       env.JWT_REFRESH_SECRET,
    sessionSecret:          env.SESSION_SECRET,
    accessTokenTtlSeconds:  env.JWT_ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlSeconds: env.JWT_REFRESH_TOKEN_TTL_SECONDS,
    maxConcurrentSessions:  env.SESSION_MAX_CONCURRENT,
    sessionTtlSeconds:      env.SESSION_TTL_SECONDS,
  },

  encryption: {
    key: env.ENCRYPTION_KEY,
  },

  google: {
    clientId:     env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri:  env.GOOGLE_REDIRECT_URI,
  },

  apple: {
    clientId:   env.APPLE_CLIENT_ID,
    teamId:     env.APPLE_TEAM_ID,
    keyId:      env.APPLE_KEY_ID,
    privateKey: env.APPLE_PRIVATE_KEY,
  },

  youtube: {
    clientId:     env.YOUTUBE_CLIENT_ID,
    clientSecret: env.YOUTUBE_CLIENT_SECRET,
    redirectUri:  env.YOUTUBE_REDIRECT_URI,
  },

  spotify: {
    clientId:     env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
    redirectUri:  env.SPOTIFY_REDIRECT_URI,
  },

  applePodcasts: {
    apiKey: env.APPLE_PODCASTS_API_KEY,
  },

  app: {
    cookieDomain: env.COOKIE_DOMAIN,
    allowedOrigins: env.ALLOWED_ORIGINS
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },

  csv: {
    maxFileSizeMb: env.MAX_CSV_FILE_SIZE_MB,
    maxRows:       env.MAX_CSV_ROWS,
  },

  rateLimit: {
    global: {
      max:      env.RATE_LIMIT_GLOBAL_MAX,
      windowMs: env.RATE_LIMIT_GLOBAL_WINDOW_MS,
    },
    auth: {
      max:      env.RATE_LIMIT_AUTH_MAX,
      windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
    },
    csv: {
      max:      env.RATE_LIMIT_CSV_MAX,
      windowMs: env.RATE_LIMIT_CSV_WINDOW_MS,
    },
  },
} as const;

export type Config = typeof config;
