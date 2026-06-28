'use client';

// =============================================================================
// hooks/useConnections.ts
//
// Manages OAuth platform connection state.
// Authoritative source is Django — sessionStorage is only a fast initial cache.
// Tokens are NEVER stored client-side; only display metadata is kept here.
// =============================================================================

import { useCallback, useEffect, useState } from 'react';
import { useCsvData } from './useCsvData';
import type { CsvUploadResult } from './useCsvData';
import { api, ApiError } from '@/lib/api';

export interface ConnectedPlatform {
  id:          string;
  platform:    'spotify';
  displayName: string;
  avatarUrl?:  string;
  connectedAt: Date;
}

/** Safe YouTube channel metadata — never includes tokens. */
export interface YouTubeChannel {
  id:              string;  // Django UUID
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

export function useConnections() {
  const [state, setState] = useState<ConnectionState>({
    platforms: [], youtubeChannels: [], hasData: false,
  });
  const [initialized, setInitialized] = useState(false);
  const { upload: uploadCsvFile, clear: clearCsvFile, csvData } = useCsvData();

  // ── Load channels from Django on mount ────────────────────────────────────

  useEffect(() => {
    api.connections.youtube.list()
      .then((channels) => {
        const mapped: YouTubeChannel[] = channels.map(c => ({
          id:              c.id,
          channelId:       c.channel_id,
          channelName:     c.channel_name,
          thumbnailUrl:    c.thumbnail_url || undefined,
          subscriberCount: c.subscriber_count || undefined,
          status:          c.status,
          connectedAt:     new Date(c.connected_at),
          lastSyncedAt:    c.last_synced_at ? new Date(c.last_synced_at) : undefined,
        }));
        const hasData =
          mapped.some(c => c.status === 'ACTIVE') ||
          localStorage.getItem('has_data') === 'true';
        setState({ platforms: [], youtubeChannels: mapped, hasData });
      })
      .catch(() => {
        // Not logged in yet — fall back to localStorage flag
        const hasData = localStorage.getItem('has_data') === 'true';
        setState({ platforms: [], youtubeChannels: [], hasData });
      })
      .finally(() => setInitialized(true));
  }, []);

  // ── Spotify connect (demo stub — real OAuth TBD) ──────────────────────────

  const connect = useCallback(async (platform: 'spotify'): Promise<void> => {
    await new Promise(res => setTimeout(res, 1600));
    setState(prev => {
      const filtered = prev.platforms.filter(p => p.platform !== platform);
      const next: ConnectionState = {
        ...prev,
        hasData: true,
        platforms: [...filtered, {
          id:          crypto.randomUUID(),
          platform,
          displayName: 'ShamelessPodcast',
          connectedAt: new Date(),
        }],
      };
      localStorage.setItem('has_data', 'true');
      return next;
    });
  }, []);

  const disconnect = useCallback(async (platform: 'spotify'): Promise<void> => {
    await new Promise(res => setTimeout(res, 800));
    setState(prev => {
      const platforms = prev.platforms.filter(p => p.platform !== platform);
      const next: ConnectionState = {
        ...prev,
        platforms,
        hasData: platforms.length > 0 || prev.youtubeChannels.some(c => c.status === 'ACTIVE'),
      };
      if (!next.hasData) localStorage.removeItem('has_data');
      return next;
    });
  }, []);

  // ── YouTube ────────────────────────────────────────────────────────────────

  const connectYouTube = useCallback(async (): Promise<YouTubeChannel> => {
    // 1. Fetch the Google auth URL (Next.js server generates PKCE + state)
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
    const metadata = await new Promise<{
      channelId: string; channelName: string; thumbnailUrl?: string; subscriberCount?: number;
    }>((resolve, reject) => {
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
        if (event.origin !== window.location.origin) return;
        if (!event.data || event.data.type !== 'YOUTUBE_OAUTH_CALLBACK') return;
        cleanup(timer);
        popup?.close();
        if (event.data.status === 'success') {
          resolve({
            channelId:       event.data.channelId as string,
            channelName:     event.data.channelName as string,
            thumbnailUrl:    event.data.thumbnailUrl as string | undefined,
            subscriberCount: event.data.subscriberCount as number | undefined,
          });
        } else {
          reject(new Error((event.data.error as string | undefined) ?? 'Connection failed.'));
        }
      }
      window.addEventListener('message', handler);
    });

    // 4. Persist to Django (metadata only — tokens stored by Next.js callback)
    let savedRecord: YouTubeChannel;
    try {
      const record = await api.connections.youtube.register({
        channel_id:       metadata.channelId,
        channel_name:     metadata.channelName,
        thumbnail_url:    metadata.thumbnailUrl,
        subscriber_count: metadata.subscriberCount,
      });
      savedRecord = {
        id:              record.id,
        channelId:       record.channel_id,
        channelName:     record.channel_name,
        thumbnailUrl:    record.thumbnail_url || undefined,
        subscriberCount: record.subscriber_count || undefined,
        status:          record.status,
        connectedAt:     new Date(record.connected_at),
      };
    } catch {
      // Not logged in — create an in-memory record so UI updates
      savedRecord = {
        id:              metadata.channelId,
        channelId:       metadata.channelId,
        channelName:     metadata.channelName,
        thumbnailUrl:    metadata.thumbnailUrl,
        subscriberCount: metadata.subscriberCount,
        status:          'ACTIVE',
        connectedAt:     new Date(),
      };
    }

    setState(prev => {
      const filtered = prev.youtubeChannels.filter(c => c.channelId !== savedRecord.channelId);
      const next: ConnectionState = {
        ...prev,
        hasData: true,
        youtubeChannels: [...filtered, savedRecord],
      };
      localStorage.setItem('has_data', 'true');
      return next;
    });

    return savedRecord;
  }, []);

  const disconnectYouTubeChannel = useCallback(async (
    channelId:  string,
    deleteData: boolean,
  ): Promise<void> => {
    // Find the Django UUID for this channel
    const channel = state.youtubeChannels.find(c => c.channelId === channelId);

    if (channel && channel.id !== channel.channelId) {
      // Has a real Django UUID — call the API
      try {
        await api.connections.youtube.remove(channel.id);
      } catch (err) {
        if (!(err instanceof ApiError && err.status === 404)) throw err;
      }
    }

    setState(prev => {
      const youtubeChannels = deleteData
        ? prev.youtubeChannels.filter(c => c.channelId !== channelId)
        : prev.youtubeChannels.map(c =>
            c.channelId === channelId ? { ...c, status: 'INACTIVE' as const } : c,
          );
      const hasData =
        prev.platforms.length > 0 || youtubeChannels.some(c => c.status === 'ACTIVE');
      if (!hasData) localStorage.removeItem('has_data');
      return { ...prev, youtubeChannels, hasData };
    });
  }, [state.youtubeChannels]);

  const reconnectYouTubeChannel = useCallback(async (channelId: string): Promise<void> => {
    // Re-run full OAuth flow then update state
    await connectYouTube();
    setState(prev => ({
      ...prev,
      youtubeChannels: prev.youtubeChannels.map(c =>
        c.channelId === channelId ? { ...c, status: 'ACTIVE' as const } : c,
      ),
    }));
  }, [connectYouTube]);

  // ── CSV ────────────────────────────────────────────────────────────────────

  const connectData = useCallback((): void => {
    setState(prev => {
      localStorage.setItem('has_data', 'true');
      return { ...prev, hasData: true };
    });
  }, []);

  const uploadCsv = useCallback(async (file: File): Promise<CsvUploadResult> => {
    const result = await uploadCsvFile(file);
    setState(prev => {
      localStorage.setItem('has_data', 'true');
      return { ...prev, hasData: true };
    });
    return result;
  }, [uploadCsvFile]);

  const clearCsv = useCallback(() => {
    clearCsvFile();
    setState(prev => {
      const hasData = prev.platforms.length > 0 || prev.youtubeChannels.some(c => c.status === 'ACTIVE');
      if (!hasData) localStorage.removeItem('has_data');
      return { ...prev, hasData };
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
