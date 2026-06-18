// =============================================================================
// src/modules/oauth/pkce.ts
//
// Purpose: Generates and verifies PKCE (Proof Key for Code Exchange) values
// per RFC 7636. PKCE prevents authorisation code interception attacks by
// binding the authorisation request to the token exchange.
//
// Security considerations:
// - code_verifier: 96 bytes of CSPRNG output, base64url-encoded → 128 chars.
//   RFC 7636 requires 43–128 chars from [A-Z a-z 0-9 - . _ ~]. base64url
//   without padding satisfies this.
// - code_challenge: SHA-256(ASCII(code_verifier)), then base64url-encoded.
//   The challenge is sent in the authorisation request; the verifier is sent
//   in the token exchange. The authorisation server rejects the token exchange
//   if SHA-256(verifier) ≠ stored challenge.
// - state parameter: 32 bytes of CSPRNG → 64 hex chars. Stored in Redis
//   per-user for the duration of the OAuth flow (5 minutes). Validated on
//   callback to prevent CSRF attacks.
// - All values use `crypto.randomBytes` from Node's built-in `node:crypto`.
//   Never use Math.random() or any user-space PRNG for security material.
// =============================================================================

import crypto from 'node:crypto';

// ─── PKCE ─────────────────────────────────────────────────────────────────────

export interface PKCEPair {
  codeVerifier:  string;
  codeChallenge: string;
}

/**
 * Generates a PKCE code_verifier + code_challenge pair.
 *
 * The verifier is stored server-side in Redis with the OAuth state.
 * The challenge is sent in the authorization_endpoint redirect URL.
 * The verifier is sent in the token_endpoint POST body.
 */
export function generatePKCE(): PKCEPair {
  // 96 random bytes → 128-char base64url string (no padding)
  const codeVerifier = crypto
    .randomBytes(96)
    .toString('base64url'); // Node 16+ built-in

  // SHA-256(ASCII(code_verifier)), base64url-encoded without padding
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier, 'ascii')
    .digest('base64url');

  return { codeVerifier, codeChallenge };
}

// ─── State parameter ──────────────────────────────────────────────────────────

/**
 * Generates a cryptographically random state parameter.
 * 32 bytes → 64 hex characters.
 *
 * Include as `state=<value>` in the authorisation redirect URL.
 * Store in Redis bound to the user session and compare on callback.
 */
export function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}
