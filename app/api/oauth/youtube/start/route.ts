import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

// ─── Config ───────────────────────────────────────────────────────────────────

const CLIENT_ID    = process.env.YOUTUBE_CLIENT_ID;
const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI
  ?? `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/oauth/youtube/callback`;
const STATE_SECRET = process.env.OAUTH_STATE_SECRET;

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
].join(' ');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

/** AES-256-GCM encrypt an object into a base64url string. */
function encryptCookie(data: object, secret: string): string {
  const key = crypto.createHash('sha256').update(secret).digest();
  const iv  = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // layout: iv (12) | tag (16) | ciphertext
  return Buffer.concat([iv, tag, enc]).toString('base64url');
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET() {
  if (!CLIENT_ID || !STATE_SECRET) {
    return NextResponse.json(
      { error: 'YouTube OAuth is not configured. Set YOUTUBE_CLIENT_ID and OAUTH_STATE_SECRET in .env.local.' },
      { status: 503 },
    );
  }

  const codeVerifier   = generateCodeVerifier();
  const codeChallenge  = generateCodeChallenge(codeVerifier);
  const state          = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id:             CLIENT_ID,
    redirect_uri:          REDIRECT_URI,
    response_type:         'code',
    scope:                 SCOPES,
    state,
    code_challenge:        codeChallenge,
    code_challenge_method: 'S256',
    access_type:           'offline',
    prompt:                'consent', // always return refresh_token
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  // Store PKCE state in a short-lived encrypted httpOnly cookie (5 min)
  const cookieValue = encryptCookie(
    { codeVerifier, state, exp: Date.now() + 5 * 60 * 1000 },
    STATE_SECRET,
  );

  const res = NextResponse.json({ authUrl });
  res.cookies.set('yt_oauth_state', cookieValue, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   300,
    path:     '/',
  });
  return res;
}
