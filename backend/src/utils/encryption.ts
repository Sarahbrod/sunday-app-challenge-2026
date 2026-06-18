// =============================================================================
// src/utils/encryption.ts
//
// Purpose: AES-256-GCM authenticated encryption helpers for storing OAuth
// tokens and other sensitive strings in the database.
//
// Security considerations:
// - AES-256-GCM is an authenticated cipher — any tampering with the
//   ciphertext causes decryption to throw. Silent data corruption is
//   impossible; the auth tag covers both the ciphertext and the IV.
// - A fresh, cryptographically random 96-bit IV is generated on every
//   encrypt() call. Reusing an IV with the same GCM key completely breaks
//   confidentiality — this function never reuses IVs.
// - Output format: base64(iv[12 bytes] || authTag[16 bytes] || ciphertext)
//   All three components are required and verified on decrypt.
// - The ENCRYPTION_KEY is read from config on each call rather than cached
//   as a module-level Buffer. This minimises the window during which the
//   key material sits in an accessible heap reference.
// - sha256() and safeEqual() are provided for hashing refresh tokens and
//   IP addresses — they are one-way and distinct from encrypt/decrypt.
//
// Key rotation:
// - Changing ENCRYPTION_KEY requires a re-encryption pass over all rows
//   that hold encrypted values (SSOProvider.accessToken/refreshToken and
//   PlatformConnection.accessToken/refreshToken).
// - Use scripts/rotate-encryption-key.ts for this — it decrypts with the
//   OLD_ENCRYPTION_KEY env var and re-encrypts with ENCRYPTION_KEY in a
//   single database transaction.
// =============================================================================

import crypto from 'node:crypto';
import { config } from '../config/env';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALGORITHM = 'aes-256-gcm' as const;
const IV_BYTES  = 12;  // 96-bit IV — NIST recommendation for GCM
const TAG_BYTES = 16;  // 128-bit authentication tag (GCM maximum)
const KEY_BYTES = 32;  // 256-bit key

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Derives the 32-byte key Buffer from the hex string in config.
 * Validated here as defence-in-depth even though env.ts already enforces
 * the correct length and character set.
 */
function deriveKey(): Buffer {
  const key = Buffer.from(config.encryption.key, 'hex');
  if (key.length !== KEY_BYTES) {
    throw new Error(
      `[encryption] Key is ${key.length} bytes; expected ${KEY_BYTES}. ` +
      `ENCRYPTION_KEY must be exactly ${KEY_BYTES * 2} hex characters.`,
    );
  }
  return key;
}

// ─── Encrypt / Decrypt ────────────────────────────────────────────────────────

/**
 * Encrypts a UTF-8 plaintext string with AES-256-GCM.
 *
 * Returns a single base64-encoded string:
 *   base64( randomIV[12] || authTag[16] || ciphertext[variable] )
 *
 * Store the returned string directly in the database column.
 * Pass it back to decrypt() to retrieve the original value.
 *
 * @throws if the encryption key is invalid.
 */
export function encrypt(plaintext: string): string {
  const key    = deriveKey();
  const iv     = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // Layout: [IV (12)] [tag (16)] [ciphertext (n)]
  return Buffer.concat([iv, tag, ciphertext]).toString('base64');
}

/**
 * Decrypts a value previously produced by `encrypt()`.
 *
 * Verifies the GCM authentication tag before returning plaintext.
 * Any modification to the stored value — even a single bit — causes this
 * function to throw rather than return garbage data.
 *
 * @throws if the value is malformed, tampered with, or the key has changed.
 */
export function decrypt(encoded: string): string {
  const key  = deriveKey();
  const data = Buffer.from(encoded, 'base64');

  const minimumLength = IV_BYTES + TAG_BYTES + 1;
  if (data.length < minimumLength) {
    throw new Error(
      `[encryption] Encoded value is ${data.length} bytes; ` +
      `minimum valid length is ${minimumLength}. The value may be truncated or corrupted.`,
    );
  }

  const iv         = data.subarray(0, IV_BYTES);
  const tag        = data.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = data.subarray(IV_BYTES + TAG_BYTES);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  try {
    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    // Do not propagate the underlying crypto error — it may leak information
    // about the ciphertext structure or key state.
    throw new Error(
      '[encryption] Decryption failed. The stored value may be corrupted, ' +
      'or the ENCRYPTION_KEY has been changed without running a re-encryption migration.',
    );
  }
}

// ─── Hashing utilities ────────────────────────────────────────────────────────

/**
 * Returns the SHA-256 hex digest of a string.
 *
 * Use for:
 * - Storing refresh token hashes (RefreshToken.tokenHash)
 * - Storing IP hashes (AuditLog.ipHash, rate limit keys)
 *
 * This is one-way. Do not use it where you need to recover the original value.
 */
export function sha256(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value, 'utf8')
    .digest('hex');
}

/**
 * Constant-time string comparison to prevent timing side-channel attacks.
 *
 * Use when comparing hashes (e.g. checking a submitted refresh token
 * against a stored hash). Returns false immediately when lengths differ
 * without leaking which byte differs.
 */
export function safeEqual(a: string, b: string): boolean {
  // Different lengths cannot be equal, but we must not short-circuit in a
  // way that leaks timing information about the content.
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(a, 'utf8'),
    Buffer.from(b, 'utf8'),
  );
}
