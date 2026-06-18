import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

// ─── Config ───────────────────────────────────────────────────────────────────

const CLIENT_ID     = process.env.YOUTUBE_CLIENT_ID!;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
const REDIRECT_URI  = process.env.YOUTUBE_REDIRECT_URI
  ?? `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/oauth/youtube/callback`;
const STATE_SECRET  = process.env.OAUTH_STATE_SECRET!;
const APP_URL       = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface StoredState {
  codeVerifier: string;
  state:        string;
  exp:          number;
}

/** Decrypt a cookie encrypted by the /start route. */
function decryptCookie(encrypted: string, secret: string): StoredState | null {
  try {
    const key = crypto.createHash('sha256').update(secret).digest();
    const buf = Buffer.from(encrypted, 'base64url');
    const iv  = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const json = decipher.update(enc, undefined, 'utf8') + decipher.final('utf8');
    return JSON.parse(json) as StoredState;
  } catch {
    return null;
  }
}

function closePopup(reason: string): NextResponse {
  const params = new URLSearchParams({ status: 'error', reason });
  return NextResponse.redirect(`${APP_URL}/oauth/callback?${params.toString()}`);
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Provider denied access (user cancelled)
  if (error) return closePopup('access_denied');
  if (!code || !state) return closePopup('missing_params');

  // Validate PKCE state cookie
  const cookieRaw = req.cookies.get('yt_oauth_state')?.value;
  if (!cookieRaw) return closePopup('state_expired');

  const stored = decryptCookie(cookieRaw, STATE_SECRET);
  if (!stored || stored.state !== state || stored.exp < Date.now()) {
    return closePopup('state_mismatch');
  }

  // Exchange authorization code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      code,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
      code_verifier: stored.codeVerifier,
    }),
  });

  if (!tokenRes.ok) return closePopup('token_exchange_failed');

  const tokens = await tokenRes.json() as {
    access_token:   string;
    refresh_token?: string;
    expires_in:     number;
  };

  // Fetch YouTube channel info — read-only, no modification
  const channelRes = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
    { headers: { Authorization: `Bearer ${tokens.access_token}` } },
  );

  if (!channelRes.ok) return closePopup('channel_fetch_failed');

  const channelData = await channelRes.json() as {
    items?: Array<{
      id: string;
      snippet?: {
        title?: string;
        thumbnails?: { default?: { url?: string } };
      };
      statistics?: { subscriberCount?: string };
    }>;
  };

  const ch = channelData.items?.[0];
  if (!ch) return closePopup('no_channel');

  // Build success redirect — display metadata only, never tokens
  const successParams = new URLSearchParams({ status: 'success' });
  successParams.set('channelId',   ch.id);
  successParams.set('channelName', ch.snippet?.title ?? 'YouTube Channel');
  if (ch.snippet?.thumbnails?.default?.url) {
    successParams.set('thumbnailUrl', ch.snippet.thumbnails.default.url);
  }
  if (ch.statistics?.subscriberCount) {
    successParams.set('subscriberCount', ch.statistics.subscriberCount);
  }

  // Clear the PKCE state cookie and redirect the popup to the closer page
  const res = NextResponse.redirect(`${APP_URL}/oauth/callback?${successParams.toString()}`);
  res.cookies.delete('yt_oauth_state');

  // NOTE: tokens.refresh_token should be encrypted and stored in your DB here.
  // Until DB integration is complete, the connection persists in sessionStorage
  // (display metadata only — the refresh token is intentionally not forwarded).

  return res;
}
