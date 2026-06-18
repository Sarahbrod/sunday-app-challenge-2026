'use client';

import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { X, Upload, Check, ExternalLink, Loader, Unlink, Plus, ArrowRight, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import type { ConnectedPlatform, YouTubeChannel } from '@/hooks/useConnections';
import type { CsvUploadResult } from '@/hooks/useCsvData';

const C = {
  textPrimary:   '#1C1C1C',
  textSecondary: '#696764',
  textMuted:     '#A8A5A2',
  successDark:   '#1A5C3A',
  successLight:  '#D4F0E4',
  successMain:   '#6EC890',
  errorMain:     '#F21A27',
  errorLight:    '#FCE0E0',
  warnMain:      '#B45309',
  warnLight:     '#FEF3C7',
  grey100:       '#F3EDE6',
  grey200:       '#EDE8E1',
  grey300:       '#DDD7D0',
  yellowMain:    '#E8C565',
  yellowLight:   '#FBF6DC',
};

// ─── Brand SVG icons ──────────────────────────────────────────────────────────

function YouTubeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29.1 29.1 0 0 0 1 12a29.1 29.1 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29.1 29.1 0 0 0 23 12a29.1 29.1 0 0 0-.46-5.58z" fill="#FF0000"/>
      <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="#FFFFFF"/>
    </svg>
  );
}

function SpotifyIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#1DB954"/>
      <path d="M17.9 11.15c-2.9-1.72-7.69-1.88-10.46-1.04a.88.88 0 0 1-.54-1.68c3.18-.96 8.47-.78 11.82 1.21a.88.88 0 0 1-.82 1.51zm-.1 2.7a.73.73 0 0 1-1-.24c-2.41-1.48-6.09-1.91-8.94-1.04a.73.73 0 0 1-.42-1.4c3.26-.99 7.32-.51 10.11 1.19a.73.73 0 0 1 .25 1.49zm-1.15 2.6a.59.59 0 0 1-.81-.2c-2.1-1.28-4.73-1.57-7.84-.86a.59.59 0 0 1-.26-1.15c3.4-.77 6.32-.44 8.71 1a.59.59 0 0 1 .2.81z" fill="white"/>
    </svg>
  );
}

function AppleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#555"/>
    </svg>
  );
}

// ─── Source label helpers ─────────────────────────────────────────────────────

const SOURCE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  YOUTUBE_EXPORT: { label: 'YouTube Analytics', color: '#B91C1C', bg: '#FFF0F0' },
  SPOTIFY_EXPORT: { label: 'Spotify Podcasters', color: '#15803D', bg: '#F0FBF2' },
  CUSTOM:         { label: 'Custom CSV',          color: '#6B6764', bg: '#F3EDE6' },
  UNKNOWN:        { label: 'CSV',                 color: '#6B6764', bg: '#F3EDE6' },
};

function fmtSubs(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

// ─── Mini preview table ───────────────────────────────────────────────────────

function PreviewTable({ headers, rows }: { headers: string[]; rows: Record<string, string>[] }) {
  const visibleCols = headers.slice(0, 4);
  const visibleRows = rows.slice(0, 5);
  return (
    <Box sx={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${C.grey300}` }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.6875rem' }}>
        <thead>
          <tr>
            {visibleCols.map(h => (
              <th key={h} style={{ padding: '6px 10px', textAlign: 'left', backgroundColor: C.grey100, color: C.textMuted, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', borderBottom: `1px solid ${C.grey300}`, fontSize: '0.5625rem' }}>
                {h.length > 18 ? h.slice(0, 18) + '…' : h}
              </th>
            ))}
            {headers.length > 4 && (
              <th style={{ padding: '6px 10px', backgroundColor: C.grey100, color: C.textMuted, fontSize: '0.5625rem', borderBottom: `1px solid ${C.grey300}` }}>
                +{headers.length - 4} more
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : C.grey100 }}>
              {visibleCols.map(h => (
                <td key={h} style={{ padding: '5px 10px', color: C.textSecondary, borderBottom: i < visibleRows.length - 1 ? `1px solid ${C.grey200}` : 'none', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {String(row[h] ?? '').length > 22 ? String(row[h] ?? '').slice(0, 22) + '…' : String(row[h] ?? '')}
                </td>
              ))}
              {headers.length > 4 && <td style={{ borderBottom: i < visibleRows.length - 1 ? `1px solid ${C.grey200}` : 'none' }} />}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open:                       boolean;
  onClose:                    () => void;
  connections:                ConnectedPlatform[];
  youtubeChannels:            YouTubeChannel[];
  onConnect:                  (platform: 'spotify') => Promise<void>;
  onDisconnect:               (platform: 'spotify') => Promise<void>;
  onConnectYouTube:           () => Promise<YouTubeChannel>;
  onDisconnectYouTubeChannel: (channelId: string, deleteData: boolean) => Promise<void>;
  onReconnectYouTubeChannel:  (channelId: string) => Promise<void>;
  onCsvUpload:                (file: File) => Promise<CsvUploadResult>;
  onViewData?:                () => void;
}

type Tab = 'connect' | 'csv';

// ─── Channel card ─────────────────────────────────────────────────────────────

interface ChannelCardProps {
  channel:      YouTubeChannel;
  loading:      string | null;
  onDisconnect: (ch: YouTubeChannel) => void;
  onReconnect:  (channelId: string) => void;
}

function ChannelCard({ channel, loading, onDisconnect, onReconnect }: ChannelCardProps) {
  const isReconnecting = loading === `reconnect-${channel.channelId}`;
  const status = channel.status;

  const borderColor =
    status === 'ACTIVE'             ? `${C.successMain}50`  :
    status === 'RECONNECT_REQUIRED' ? `${C.warnMain}50`     : C.grey300;

  const bgColor =
    status === 'ACTIVE'             ? `${C.successMain}08`  :
    status === 'RECONNECT_REQUIRED' ? `${C.warnLight}`      : C.grey100;

  return (
    <Box sx={{ p: 2, borderRadius: '12px', border: `1px solid ${borderColor}`, backgroundColor: bgColor }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>

        {/* Thumbnail or fallback */}
        <Box sx={{ width: 40, height: 40, borderRadius: '8px', overflow: 'hidden', flexShrink: 0, bgcolor: C.grey200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {channel.thumbnailUrl
            ? <Box component="img" src={channel.thumbnailUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <YouTubeIcon size={20} />}
        </Box>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: status === 'INACTIVE' ? C.textMuted : C.textPrimary, letterSpacing: '-0.015em', lineHeight: 1.3 }}>
            {channel.channelName}
          </Typography>

          {status === 'ACTIVE' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.375 }}>
              {channel.subscriberCount != null && (
                <Typography sx={{ fontSize: '0.6875rem', color: C.textSecondary }}>
                  {fmtSubs(channel.subscriberCount)} subscribers
                </Typography>
              )}
              <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: C.successMain }} />
              <Typography sx={{ fontSize: '0.6875rem', color: C.successDark, fontWeight: 500 }}>Active</Typography>
            </Box>
          )}

          {status === 'RECONNECT_REQUIRED' && (
            <Box sx={{ mt: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                <AlertTriangle size={11} color={C.warnMain} />
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: C.warnMain }}>Reconnect required</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.6875rem', color: C.warnMain, lineHeight: 1.4, opacity: 0.85 }}>
                We lost access. Usually happens when access is revoked in your Google account settings.
              </Typography>
            </Box>
          )}

          {status === 'INACTIVE' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.375 }}>
              <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>Disconnected · Historical data retained</Typography>
            </Box>
          )}
        </Box>

        {/* CTA */}
        <Box sx={{ flexShrink: 0 }}>
          {status === 'ACTIVE' && (
            <Button size="small" onClick={() => onDisconnect(channel)}
              startIcon={<Unlink size={12} />}
              sx={{ fontSize: '0.6875rem', color: C.textMuted, textTransform: 'none', fontWeight: 500, borderRadius: '8px', border: `1px solid ${C.grey300}`, px: 1.5, '&:hover': { color: C.errorMain, borderColor: `${C.errorMain}50`, backgroundColor: `${C.errorMain}08` } }}>
              Disconnect
            </Button>
          )}
          {status === 'RECONNECT_REQUIRED' && (
            <Button size="small" onClick={() => onReconnect(channel.channelId)} disabled={isReconnecting}
              startIcon={isReconnecting ? <Loader size={12} /> : <RefreshCw size={12} />}
              sx={{ bgcolor: C.warnMain, color: '#FFFFFF', '&:hover': { bgcolor: '#92400E' }, '&:disabled': { bgcolor: C.grey300, color: C.textMuted }, fontWeight: 600, fontSize: '0.6875rem', borderRadius: '8px', px: 1.5, textTransform: 'none', boxShadow: 'none' }}>
              {isReconnecting ? 'Reconnecting…' : 'Reconnect'}
            </Button>
          )}
          {status === 'INACTIVE' && (
            <Button size="small" onClick={() => onDisconnect(channel)}
              startIcon={<Trash2 size={12} />}
              sx={{ fontSize: '0.6875rem', color: C.textMuted, textTransform: 'none', fontWeight: 500, borderRadius: '8px', border: `1px solid ${C.grey300}`, px: 1.5, '&:hover': { color: C.errorMain, borderColor: `${C.errorMain}50`, backgroundColor: `${C.errorMain}08` } }}>
              Remove
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Disconnect confirmation ──────────────────────────────────────────────────

interface DisconnectConfirmProps {
  channel:    YouTubeChannel;
  loading:    string | null;
  onConfirm:  (deleteData: boolean) => void;
  onCancel:   () => void;
}

function DisconnectConfirm({ channel, loading, onConfirm, onCancel }: DisconnectConfirmProps) {
  const isWorking = loading === `disconnect-yt-${channel.channelId}`;
  return (
    <Box sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${C.grey300}`, bgcolor: C.grey100 }}>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: C.textPrimary, mb: 0.5, letterSpacing: '-0.01em' }}>
        Disconnect {channel.channelName}?
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, lineHeight: 1.55, mb: 2 }}>
        FOBA will stop syncing analytics and comments for this channel. Choose what to do with data already imported.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button fullWidth onClick={() => onConfirm(false)} disabled={isWorking}
          startIcon={isWorking ? <Loader size={14} /> : <Check size={14} />}
          sx={{ justifyContent: 'flex-start', textAlign: 'left', bgcolor: C.textPrimary, color: '#FFFFFF', '&:hover': { bgcolor: '#2A2828' }, '&:disabled': { bgcolor: C.grey300, color: C.textMuted }, fontWeight: 600, fontSize: '0.8125rem', borderRadius: '10px', px: 2, textTransform: 'none', boxShadow: 'none' }}>
          {isWorking ? 'Disconnecting…' : 'Keep data + disconnect'}
        </Button>
        <Button fullWidth onClick={() => onConfirm(true)} disabled={isWorking}
          startIcon={<Trash2 size={14} />}
          sx={{ justifyContent: 'flex-start', textAlign: 'left', color: C.errorMain, borderColor: `${C.errorMain}40`, border: '1px solid', borderRadius: '10px', px: 2, textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', '&:hover': { bgcolor: `${C.errorMain}08`, borderColor: C.errorMain }, '&:disabled': { color: C.textMuted, borderColor: C.grey300 } }}>
          Delete data + disconnect
        </Button>
        <Button fullWidth onClick={onCancel} disabled={isWorking}
          sx={{ color: C.textMuted, textTransform: 'none', fontSize: '0.8125rem', borderRadius: '10px', '&:hover': { color: C.textPrimary, backgroundColor: C.grey200 } }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConnectDataModal({
  open, onClose, connections, youtubeChannels,
  onConnect, onDisconnect, onConnectYouTube,
  onDisconnectYouTubeChannel, onReconnectYouTubeChannel,
  onCsvUpload, onViewData,
}: Props) {
  const [tab,          setTab]          = useState<Tab>('connect');
  const [loading,      setLoading]      = useState<string | null>(null);
  const [dragOver,     setDragOver]     = useState(false);
  const [uploadResult, setUploadResult] = useState<CsvUploadResult | null>(null);
  const [csvError,     setCsvError]     = useState<string | null>(null);
  const [channelAdded, setChannelAdded] = useState<YouTubeChannel | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<YouTubeChannel | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isConnected = (pid: string) => connections.some(c => c.platform === pid);
  const getConn     = (pid: string) => connections.find(c => c.platform === pid);

  const visibleYtChannels = youtubeChannels.filter(c => c.status !== 'INACTIVE' || disconnectTarget?.channelId === c.channelId);

  function resetCsvState() {
    setUploadResult(null);
    setCsvError(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleClose() {
    resetCsvState();
    setChannelAdded(null);
    setDisconnectTarget(null);
    onClose();
  }

  async function handleConnectSpotify() {
    setLoading('spotify');
    try { await onConnect('spotify'); } finally { setLoading(null); }
  }

  async function handleDisconnectSpotify() {
    setLoading('disconnect-spotify');
    try { await onDisconnect('spotify'); } finally { setLoading(null); }
  }

  async function handleConnectYouTube() {
    setLoading('youtube');
    try {
      const ch = await onConnectYouTube();
      setChannelAdded(ch);
    } catch {
      // error surface is minimal — user can retry
    } finally {
      setLoading(null);
    }
  }

  async function handleReconnectYouTubeChannel(channelId: string) {
    setLoading(`reconnect-${channelId}`);
    try { await onReconnectYouTubeChannel(channelId); } finally { setLoading(null); }
  }

  async function handleDisconnectConfirm(deleteData: boolean) {
    if (!disconnectTarget) return;
    const key = `disconnect-yt-${disconnectTarget.channelId}`;
    setLoading(key);
    try {
      await onDisconnectYouTubeChannel(disconnectTarget.channelId, deleteData);
      setDisconnectTarget(null);
    } finally {
      setLoading(null);
    }
  }

  async function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvError('Only .csv files are accepted.');
      return;
    }
    setCsvError(null);
    setLoading('csv');
    try {
      const result = await onCsvUpload(file);
      setUploadResult(result);
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  }

  const sourceInfo = uploadResult ? (SOURCE_LABEL[uploadResult.dataSource] ?? SOURCE_LABEL.UNKNOWN) : null;
  const showSuccess = !!uploadResult || !!channelAdded;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '18px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', m: 2, overflow: 'hidden' } } }}
    >
      {/* Header */}
      <Box sx={{ px: 3, pt: 3, pb: 2.5, borderBottom: `1px solid ${C.grey200}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.02em', mb: 0.25 }}>
            {uploadResult ? 'Import successful' : channelAdded ? 'Channel added' : 'Connect your data'}
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary }}>
            {uploadResult
              ? 'Your data is ready to explore'
              : channelAdded
              ? `${channelAdded.channelName} is now connected to FOBA`
              : 'Link an account or upload a CSV to unlock insights'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: C.textMuted, mt: -0.5, '&:hover': { color: C.textPrimary } }}>
          <X size={18} />
        </IconButton>
      </Box>

      {/* Tabs — hidden on success screens */}
      {!showSuccess && (
        <Box sx={{ display: 'flex', borderBottom: `1px solid ${C.grey200}`, px: 3 }}>
          {(['connect', 'csv'] as const).map((k, idx) => (
            <Box key={k} onClick={() => setTab(k)}
              sx={{ py: 1.5, mr: 3, cursor: 'pointer', userSelect: 'none', fontSize: '0.8125rem', fontWeight: tab === k ? 600 : 400, color: tab === k ? C.textPrimary : C.textMuted, borderBottom: `2px solid ${tab === k ? C.textPrimary : 'transparent'}`, mb: '-1px', transition: 'all 0.15s' }}>
              {idx === 0 ? 'Connect account' : 'Upload CSV'}
            </Box>
          ))}
        </Box>
      )}

      <DialogContent sx={{ px: 3, py: 3 }}>

        {/* ── Channel added confirmation ── */}
        {channelAdded && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, p: 2, borderRadius: '12px', backgroundColor: C.successLight, border: `1px solid ${C.successMain}40` }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#FFFFFF', border: `2px solid ${C.successMain}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={22} color={C.successDark} strokeWidth={2.5} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: C.successDark, letterSpacing: '-0.015em', mb: 0.25 }}>
                  {channelAdded.channelName}
                </Typography>
                {channelAdded.subscriberCount != null && (
                  <Typography sx={{ fontSize: '0.75rem', color: C.successDark, opacity: 0.85 }}>
                    {fmtSubs(channelAdded.subscriberCount)} subscribers
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ mb: 2.5, p: 2, borderRadius: '12px', border: `1px solid ${C.grey300}` }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, mb: 1 }}>
                Access granted
              </Typography>
              {['Analytics', 'Comments', 'Channel info'].map((item, i) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, borderBottom: i < 2 ? `1px solid ${C.grey100}` : 'none' }}>
                  <Check size={13} color={C.successDark} />
                  <Typography sx={{ fontSize: '0.8125rem', color: C.textPrimary }}>{item}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                onClick={() => { handleClose(); onViewData?.(); }}
                endIcon={<ArrowRight size={14} />}
                sx={{ bgcolor: C.textPrimary, color: '#FFFFFF', '&:hover': { bgcolor: '#2A2828' }, fontWeight: 600, fontSize: '0.8125rem', borderRadius: '10px', px: 2.5, textTransform: 'none', boxShadow: 'none' }}>
                Go to dashboard
              </Button>
              <Button
                onClick={() => setChannelAdded(null)}
                startIcon={<Plus size={14} />}
                variant="outlined"
                sx={{ color: C.textSecondary, borderColor: C.grey300, borderRadius: '10px', fontWeight: 500, fontSize: '0.8125rem', px: 2, textTransform: 'none', '&:hover': { borderColor: C.textPrimary, color: C.textPrimary, backgroundColor: 'transparent' } }}>
                Add another channel
              </Button>
            </Box>
          </Box>
        )}

        {/* ── CSV success screen ── */}
        {uploadResult && sourceInfo && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, borderRadius: '12px', backgroundColor: C.successLight, border: `1px solid ${C.successMain}40` }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#FFFFFF', border: `2px solid ${C.successMain}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={22} color={C.successDark} strokeWidth={2.5} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: C.successDark, letterSpacing: '-0.015em', mb: 0.25 }}>
                  {uploadResult.rowCount.toLocaleString()} rows imported
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: C.successDark, opacity: 0.85 }}>
                  {uploadResult.columnCount} columns · {uploadResult.truncated ? `truncated at ${(100_000).toLocaleString()} rows` : 'complete'}
                </Typography>
              </Box>
              <Chip label={sourceInfo.label} size="small"
                sx={{ bgcolor: sourceInfo.bg, color: sourceInfo.color, fontWeight: 700, fontSize: '0.625rem', height: 20, '& .MuiChip-label': { px: '8px' } }} />
            </Box>

            {Object.keys(uploadResult.summaryStats).length > 0 && (
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
                {Object.entries(uploadResult.summaryStats).map(([k, v]) => (
                  <Box key={k} sx={{ px: 1.75, py: 1.25, borderRadius: '10px', border: `1px solid ${C.grey300}`, minWidth: 100 }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>{v}</Typography>
                    <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, mt: 0.375 }}>{k}</Typography>
                  </Box>
                ))}
              </Box>
            )}

            {uploadResult.sampleRows.length > 0 && (
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, mb: 1 }}>
                  Data preview · first {Math.min(5, uploadResult.sampleRows.length)} of {uploadResult.rowCount.toLocaleString()} rows
                </Typography>
                <PreviewTable headers={uploadResult.columnHeaders} rows={uploadResult.sampleRows} />
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button onClick={() => { handleClose(); onViewData?.(); }} endIcon={<ArrowRight size={14} />}
                sx={{ bgcolor: C.textPrimary, color: '#FFFFFF', '&:hover': { bgcolor: '#2A2828' }, fontWeight: 600, fontSize: '0.8125rem', borderRadius: '10px', px: 2.5, textTransform: 'none', boxShadow: 'none' }}>
                View analytics
              </Button>
              <Button onClick={resetCsvState} startIcon={<Plus size={14} />} variant="outlined"
                sx={{ color: C.textSecondary, borderColor: C.grey300, borderRadius: '10px', fontWeight: 500, fontSize: '0.8125rem', px: 2, textTransform: 'none', '&:hover': { borderColor: C.textPrimary, color: C.textPrimary, backgroundColor: 'transparent' } }}>
                Upload another file
              </Button>
            </Box>
          </Box>
        )}

        {/* ── Connect account tab ── */}
        {!showSuccess && tab === 'connect' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* ── YouTube section ── */}
            <Box>
              {/* Section header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: '7px', backgroundColor: '#FFF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <YouTubeIcon size={16} />
                  </Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.015em' }}>
                    YouTube channels
                  </Typography>
                  {visibleYtChannels.length > 0 && (
                    <Chip label={visibleYtChannels.filter(c => c.status === 'ACTIVE').length} size="small"
                      sx={{ height: 18, bgcolor: C.successLight, color: C.successDark, fontWeight: 700, fontSize: '0.625rem', '& .MuiChip-label': { px: '6px' } }} />
                  )}
                </Box>
                {visibleYtChannels.length > 0 && (
                  <Button size="small" onClick={() => void handleConnectYouTube()} disabled={!!loading}
                    startIcon={loading === 'youtube' ? <Loader size={12} /> : <Plus size={12} />}
                    sx={{ fontSize: '0.6875rem', color: C.textSecondary, textTransform: 'none', fontWeight: 500, borderRadius: '8px', border: `1px solid ${C.grey300}`, px: 1.5, '&:hover': { color: C.textPrimary, borderColor: C.textPrimary }, '&:disabled': { color: C.textMuted, borderColor: C.grey200 } }}>
                    {loading === 'youtube' ? 'Connecting…' : 'Add channel'}
                  </Button>
                )}
              </Box>

              {/* Channels or connect prompt */}
              {visibleYtChannels.length === 0 ? (
                <Box sx={{ p: 2, borderRadius: '12px', border: `1px solid ${C.grey300}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: C.textPrimary, mb: 0.25, letterSpacing: '-0.01em' }}>
                      Connect a YouTube channel
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: C.textMuted, lineHeight: 1.4 }}>
                      FOBA uses read-only access to pull analytics and comments. We never post or modify your content.
                    </Typography>
                  </Box>
                  <Button size="small" onClick={() => void handleConnectYouTube()} disabled={!!loading}
                    endIcon={loading === 'youtube' ? <Loader size={13} /> : <ExternalLink size={13} />}
                    sx={{ bgcolor: C.textPrimary, color: '#FFFFFF', '&:hover': { bgcolor: '#2A2828' }, '&:disabled': { bgcolor: C.grey300, color: C.textMuted }, fontWeight: 600, fontSize: '0.8125rem', borderRadius: '10px', px: 2, textTransform: 'none', boxShadow: 'none', flexShrink: 0 }}>
                    {loading === 'youtube' ? 'Connecting…' : 'Continue with Google'}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {disconnectTarget ? (
                    <DisconnectConfirm
                      channel={disconnectTarget}
                      loading={loading}
                      onConfirm={handleDisconnectConfirm}
                      onCancel={() => setDisconnectTarget(null)}
                    />
                  ) : (
                    visibleYtChannels.map(ch => (
                      <ChannelCard
                        key={ch.channelId}
                        channel={ch}
                        loading={loading}
                        onDisconnect={setDisconnectTarget}
                        onReconnect={handleReconnectYouTubeChannel}
                      />
                    ))
                  )}
                </Box>
              )}
            </Box>

            {/* Divider */}
            <Box sx={{ borderTop: `1px solid ${C.grey200}` }} />

            {/* ── Spotify section ── */}
            {(() => {
              const connected = isConnected('spotify');
              const conn      = getConn('spotify');
              const isLoading = loading === 'spotify';
              const isDisconn = loading === 'disconnect-spotify';
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: '12px', border: `1px solid ${connected ? C.successMain + '50' : C.grey300}`, backgroundColor: connected ? `${C.successMain}08` : '#FFFFFF' }}>
                  <Box sx={{ width: 42, height: 42, borderRadius: '10px', backgroundColor: '#F0FBF2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <SpotifyIcon size={22} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.015em' }}>Spotify</Typography>
                    </Box>
                    {connected && conn ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: C.successDark, fontWeight: 500 }}>{conn.displayName}</Typography>
                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: C.successMain }} />
                        <Typography sx={{ fontSize: '0.6875rem', color: C.successDark }}>Connected</Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: '0.75rem', color: C.textMuted, lineHeight: 1.4 }}>Podcast streams, listeners & episodes</Typography>
                    )}
                  </Box>
                  {connected ? (
                    <Button size="small" onClick={() => void handleDisconnectSpotify()} disabled={isDisconn}
                      startIcon={isDisconn ? <Loader size={13} /> : <Unlink size={13} />}
                      sx={{ fontSize: '0.6875rem', color: C.textMuted, textTransform: 'none', fontWeight: 500, borderRadius: '8px', border: `1px solid ${C.grey300}`, px: 1.5, flexShrink: 0, '&:hover': { color: C.errorMain, borderColor: `${C.errorMain}50`, backgroundColor: '#FCE0E010' } }}>
                      {isDisconn ? 'Disconnecting…' : 'Disconnect'}
                    </Button>
                  ) : (
                    <Button size="small" onClick={() => void handleConnectSpotify()} disabled={!!loading}
                      endIcon={isLoading ? <Loader size={13} /> : <ExternalLink size={13} />}
                      sx={{ bgcolor: C.textPrimary, color: '#FFFFFF', '&:hover': { bgcolor: '#2A2828' }, '&:disabled': { bgcolor: C.grey300, color: C.textMuted }, fontWeight: 600, fontSize: '0.8125rem', borderRadius: '10px', px: 2, textTransform: 'none', boxShadow: 'none', flexShrink: 0 }}>
                      {isLoading ? 'Connecting…' : 'Connect'}
                    </Button>
                  )}
                </Box>
              );
            })()}

            {/* ── Apple coming soon ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: '12px', border: `1px solid ${C.grey300}`, opacity: 0.6 }}>
              <Box sx={{ width: 42, height: 42, borderRadius: '10px', backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AppleIcon size={22} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.015em' }}>Apple Music</Typography>
                  <Chip label="Coming Soon" size="small" sx={{ height: 16, bgcolor: C.grey200, color: C.textMuted, fontWeight: 600, fontSize: '0.5rem', '& .MuiChip-label': { px: '6px' } }} />
                </Box>
                <Typography sx={{ fontSize: '0.75rem', color: C.textMuted }}>Streaming data & listener analytics</Typography>
              </Box>
            </Box>

            <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, textAlign: 'center', lineHeight: 1.6 }}>
              OAuth connections use read-only scopes. Tokens are encrypted server-side and never exposed client-side.
            </Typography>
          </Box>
        )}

        {/* ── CSV upload tab ── */}
        {!showSuccess && tab === 'csv' && (
          <Box>
            <Box
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              sx={{ p: '32px 24px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', border: `2px dashed ${dragOver ? C.textPrimary : loading === 'csv' ? C.yellowMain : C.grey300}`, backgroundColor: dragOver ? C.grey100 : loading === 'csv' ? C.yellowLight : 'transparent', transition: 'all 0.2s', '&:hover': { borderColor: C.textPrimary, backgroundColor: C.grey100 } }}>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) void processFile(f); }} />
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                {loading === 'csv'
                  ? <Box sx={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${C.yellowMain}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', '@keyframes spin': { to: { transform: 'rotate(360deg)' } } }} />
                  : <Upload size={28} color={C.textMuted} />}
              </Box>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, mb: 0.5, letterSpacing: '-0.015em' }}>
                {loading === 'csv' ? 'Processing your file…' : 'Drop your CSV here'}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: C.textMuted }}>
                {loading === 'csv' ? 'Validating and parsing rows' : 'or click to browse · .csv files only'}
              </Typography>
            </Box>

            {csvError && (
              <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '8px', bgcolor: C.errorLight, border: `1px solid ${C.errorMain}30` }}>
                <Typography sx={{ fontSize: '0.75rem', color: C.errorMain }}>{csvError}</Typography>
              </Box>
            )}

            <Box sx={{ mt: 2.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                { label: 'YouTube Studio', desc: 'Analytics → Export as CSV' },
                { label: 'Spotify for Podcasters', desc: 'Performance → Download' },
              ].map(f => (
                <Box key={f.label} sx={{ flex: 1, minWidth: 140, p: 1.5, borderRadius: '10px', backgroundColor: C.grey100, border: `1px solid ${C.grey300}` }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.textPrimary, mb: 0.25 }}>{f.label}</Typography>
                  <Typography sx={{ fontSize: '0.625rem', color: C.textMuted }}>{f.desc}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '10px', border: `1px solid ${C.grey300}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary }}>Real-time API sync</Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>Automatic refresh · no manual uploads needed</Typography>
              </Box>
              <Chip label="Coming soon" size="small" sx={{ height: 18, bgcolor: C.grey300, color: C.textMuted, fontWeight: 600, fontSize: '0.5rem', '& .MuiChip-label': { px: '7px' } }} />
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
