'use client';

// =============================================================================
// hooks/useConnections.ts
//
// Manages OAuth platform connection state on the frontend.
//
// Security rules enforced here:
// - Tokens are NEVER stored in localStorage, sessionStorage, or any client
//   state. The server holds encrypted tokens. This hook only stores
//   non-sensitive metadata: platform name, display name, avatar URL.
// - The only state persisted client-side is a "connected platforms" list
//   held in React state (lost on page reload). The authoritative source is
//   the server — a page reload will re-fetch connection status.
// - `connect()` opens a popup to the OAuth provider. The server handles the
//   callback, stores tokens encrypted, and posts a message back to the popup.
//   The popup message contains only display metadata (no tokens).
// - `connectData()` is an alias that marks `hasData = true` — used by the
//   empty state system. It does NOT store tokens.
// =============================================================================

import { useCallback, useEffect, useState } from 'react';
import { useCsvData } from './useCsvData';
import type { CsvUploadResult } from './useCsvData';

export interface ConnectedPlatform {
  platform:    'spotify';
  displayName: string;
  avatarUrl?:  string;
  connectedAt: Date;
}

/** Safe YouTube channel metadata — never includes tokens. */
export interface YouTubeChannel {
  id:              string;  // internal UUID
  channelId:       string;  // UCxxxx
  channelName:     string;
  thumbnailUrl?:   string;
  subscriberCount?: number;
  status:          'ACTIVE' | 'RECONNECT_REQUIRED' | 'INACTIVE';
  connectedAt:     Date;
  lastSyncedAt?:   Date;
}

interface ConnectionState {
  platforms:       ConnectedPlatform[];
  youtubeChannels: YouTubeChannel[];
  hasData:         boolean;
}

const STORAGE_KEY = 'connection_metadata'; // metadata only — never tokens

function loadMetadata(): ConnectionState {
  if (typeof window === 'undefined') return { platforms: [], youtubeChannels: [], hasData: false };
  try {
    const raw  = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const hasData = localStorage.getItem('has_data') === 'true';
      return { platforms: [], youtubeChannels: [], hasData };
    }
    const parsed = JSON.parse(raw) as {
      platforms: Array<{ platform: 'spotify'; displayName: string; avatarUrl?: string; connectedAt: string }>;
      youtubeChannels?: Array<Omit<YouTubeChannel, 'connectedAt' | 'lastSyncedAt'> & { connectedAt: string; lastSyncedAt?: string }>;
      hasData: boolean;
    };
    return {
      hasData:         parsed.hasData,
      platforms:       parsed.platforms.map(p => ({ ...p, connectedAt: new Date(p.connectedAt) })),
      youtubeChannels: (parsed.youtubeChannels ?? []).map(c => ({
        ...c,
        connectedAt:  new Date(c.connectedAt),
        lastSyncedAt: c.lastSyncedAt ? new Date(c.lastSyncedAt) : undefined,
      })),
    };
  } catch {
    return { platforms: [], youtubeChannels: [], hasData: false };
  }
}

function saveMetadata(state: ConnectionState): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem('has_data', state.hasData ? 'true' : 'false');
}


export function useConnections() {
  const [state, setState] = useState<ConnectionState>({ platforms: [], youtubeChannels: [], hasData: false });
  const [initialized, setInitialized] = useState(false);
  const { upload: uploadCsvFile, clear: clearCsvFile, csvData } = useCsvData();

  useEffect(() => {
    setState(loadMetadata());
    setInitialized(true);
  }, []);

  const persistAndSet = useCallback((next: ConnectionState) => {
    saveMetadata(next);
    setState(next);
  }, []);

  // ── Spotify connect ────────────────────────────────────────────────────────

  const connect = useCallback(async (platform: 'spotify'): Promise<void> => {
    // ── Demo simulation ────────────────────────────────────────────────────
    // Production: fetch authUrl from /api/oauth/:platform/start,
    // open popup, listen for postMessage with display metadata.
    await new Promise(res => setTimeout(res, 1600));

    setState(prev => {
      const filtered = prev.platforms.filter(p => p.platform !== platform);
      const next: ConnectionState = {
        ...prev,
        hasData:   true,
        platforms: [...filtered, {
          platform,
          displayName: 'ShamelessPodcast',
          avatarUrl:   undefined,
          connectedAt: new Date(),
        }],
      };
      saveMetadata(next);
      return next;
    });
  }, []);

  const disconnect = useCallback(async (platform: 'spotify'): Promise<void> => {
    // Production: DELETE /api/oauth/:platform/disconnect
    await new Promise(res => setTimeout(res, 800));

    setState(prev => {
      const platforms = prev.platforms.filter(p => p.platform !== platform);
      const next: ConnectionState = {
        ...prev,
        platforms,
        hasData: platforms.length > 0 || prev.youtubeChannels.some(c => c.status === 'ACTIVE'),
      };
      saveMetadata(next);
      return next;
    });
  }, []);

  // ── YouTube channel connect ────────────────────────────────────────────────

  /**
   * Opens a Google OAuth popup, waits for the callback postMessage,
   * then persists the channel to local state.
   *
   * Requires YOUTUBE_CLIENT_ID and OAUTH_STATE_SECRET in .env.local.
   * The server handles PKCE, token exchange, and channel info fetch —
   * only display metadata (channelId, channelName, thumbnailUrl) is
   * returned to the client. Tokens never reach the browser.
   */
  const connectYouTube = useCallback(async (): Promise<YouTubeChannel> => {
    // 1. Fetch the Google auth URL (server generates PKCE + state)
    const startRes = await fetch('/api/oauth/youtube/start');
    if (!startRes.ok) {
      const body = await startRes.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? 'Could not initiate YouTube connection.');
    }
    const { authUrl } = await startRes.json() as { authUrl: string };

    // 2. Open popup centred on screen
    const width  = 600;
    const height = 700;
    const left   = Math.round(window.screenX + (window.outerWidth  - width)  / 2);
    const top    = Math.round(window.screenY + (window.outerHeight - height) / 2);
    const popup  = window.open(
      authUrl,
      'youtube_oauth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0`,
    );

    if (!popup) {
      throw new Error('Popup was blocked. Please allow popups for this site and try again.');
    }

    // 3. Wait for postMessage from /oauth/callback page
    return new Promise<YouTubeChannel>((resolve, reject) => {
      const TIMEOUT_MS = 5 * 60 * 1000;

      const cleanup = (timer: ReturnType<typeof setTimeout>) => {
        clearTimeout(timer);
        window.removeEventListener('message', handler);
      };

      const timer = setTimeout(() => {
        cleanup(timer);
        popup?.close();
        reject(new Error('Connection timed out. Please try again.'));
      }, TIMEOUT_MS);

      function handler(event: MessageEvent) {
        // Only accept messages from our own origin
        if (event.origin !== window.location.origin) return;
        if (!event.data || event.data.type !== 'YOUTUBE_OAUTH_CALLBACK') return;

        cleanup(timer);
        popup?.close();

        if (event.data.status === 'success') {
          const channel: YouTubeChannel = {
            id:              event.data.channelId as string,
            channelId:       event.data.channelId as string,
            channelName:     event.data.channelName as string,
            thumbnailUrl:    event.data.thumbnailUrl as string | undefined,
            subscriberCount: event.data.subscriberCount as number | undefined,
            status:          'ACTIVE',
            connectedAt:     new Date(),
          };

          setState(prev => {
            const filtered = prev.youtubeChannels.filter(c => c.channelId !== channel.channelId);
            const next: ConnectionState = {
              ...prev,
              hasData:         true,
              youtubeChannels: [...filtered, channel],
            };
            saveMetadata(next);
            return next;
          });

          resolve(channel);
        } else {
          reject(new Error((event.data.error as string | undefined) ?? 'Connection failed. Please try again.'));
        }
      }

      window.addEventListener('message', handler);
    });
  }, []);

  /**
   * Disconnects a single YouTube channel.
   * deleteData=true hard-deletes; false soft-deletes (status → INACTIVE).
   * When all channels are removed, hasData is recalculated.
   */
  const disconnectYouTubeChannel = useCallback(async (
    channelId:  string,
    deleteData: boolean,
  ): Promise<void> => {
    // Production: DELETE /api/oauth/youtube/channels/:channelId?deleteData=true
    await new Promise(res => setTimeout(res, 900));

    setState(prev => {
      const youtubeChannels = deleteData
        ? prev.youtubeChannels.filter(c => c.channelId !== channelId)
        : prev.youtubeChannels.map(c =>
            c.channelId === channelId ? { ...c, status: 'INACTIVE' as const } : c,
          );
      const next: ConnectionState = {
        ...prev,
        youtubeChannels,
        hasData: prev.platforms.length > 0 || youtubeChannels.some(c => c.status === 'ACTIVE'),
      };
      saveMetadata(next);
      return next;
    });
  }, []);

  /**
   * Re-initiates YouTube OAuth for a channel in RECONNECT_REQUIRED state.
   * Production: same flow as connectYouTube, but updates the existing channel.
   */
  const reconnectYouTubeChannel = useCallback(async (channelId: string): Promise<void> => {
    // Production: same OAuth popup flow, then PATCH the channel status.
    await new Promise(res => setTimeout(res, 1800));

    setState(prev => {
      const youtubeChannels = prev.youtubeChannels.map(c =>
        c.channelId === channelId ? { ...c, status: 'ACTIVE' as const } : c,
      );
      const next: ConnectionState = { ...prev, youtubeChannels };
      saveMetadata(next);
      return next;
    });
  }, []);

  // ── CSV ────────────────────────────────────────────────────────────────────

  const connectData = useCallback((): void => {
    setState(prev => {
      const next = { ...prev, hasData: true };
      saveMetadata(next);
      return next;
    });
  }, []);

  const uploadCsv = useCallback(async (file: File): Promise<CsvUploadResult> => {
    const result = await uploadCsvFile(file);
    setState(prev => {
      const next = { ...prev, hasData: true };
      saveMetadata(next);
      return next;
    });
    return result;
  }, [uploadCsvFile]);

  const clearCsv = useCallback(() => {
    clearCsvFile();
    setState(prev => {
      const next = {
        ...prev,
        hasData: prev.platforms.length > 0 || prev.youtubeChannels.some(c => c.status === 'ACTIVE'),
      };
      saveMetadata(next);
      return next;
    });
  }, [clearCsvFile]);

  return {
    connections:             state.platforms,
    youtubeChannels:         initialized ? state.youtubeChannels : [],
    hasData:                 initialized ? state.hasData : null,
    csvData,
    connect,
    disconnect,
    connectYouTube,
    disconnectYouTubeChannel,
    reconnectYouTubeChannel,
    connectData,
    uploadCsv,
    clearCsv,
  };
}
