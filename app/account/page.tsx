'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import { Check, Plus, Camera, Bell, Plug, Users, Shield, LogOut, Unlink, AlertTriangle, RefreshCw } from 'lucide-react';
import { useConnections } from '@/hooks/useConnections';

const C = {
  textPrimary:   '#1C1C1C',
  textSecondary: '#696764',
  textMuted:     '#A8A5A2',
  successDark:   '#1A5C3A',
  successLight:  '#D4F0E4',
  successMain:   '#6EC890',
  errorMain:     '#F21A27',
  warnMain:      '#B45309',
  yellowMain:    '#E8C565',
  yellowLight:   '#FBF6DC',
  grey100:       '#F3EDE6',
  grey200:       '#EDE8E1',
  grey300:       '#DDD7D0',
  purpleMain:    '#7B9FD4',
  purpleLight:   '#E0EAF8',
};

const TEAM_MEMBERS = [
  { name: 'Alex Chen',  role: 'Growth Director', email: 'alex@shamelessmedia.com',  avatar: 'A', owner: true  },
  { name: 'James Liu',  role: 'Analyst',          email: 'james@shamelessmedia.com', avatar: 'J', owner: false },
  { name: 'Priya Mehta',role: 'Creator Manager',  email: 'priya@shamelessmedia.com', avatar: 'P', owner: false },
];

// Brand icons for OAuth platforms
function YouTubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29.1 29.1 0 0 0 1 12a29.1 29.1 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29.1 29.1 0 0 0 23 12a29.1 29.1 0 0 0-.46-5.58z" fill="#FF0000"/>
      <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="#FFFFFF"/>
    </svg>
  );
}

function SpotifyIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#1DB954"/>
      <path d="M17.9 11.15c-2.9-1.72-7.69-1.88-10.46-1.04a.88.88 0 0 1-.54-1.68c3.18-.96 8.47-.78 11.82 1.21a.88.88 0 0 1-.82 1.51zm-.1 2.7a.73.73 0 0 1-1-.24c-2.41-1.48-6.09-1.91-8.94-1.04a.73.73 0 0 1-.42-1.4c3.26-.99 7.32-.51 10.11 1.19a.73.73 0 0 1 .25 1.49zm-1.15 2.6a.59.59 0 0 1-.81-.2c-2.1-1.28-4.73-1.57-7.84-.86a.59.59 0 0 1-.26-1.15c3.4-.77 6.32-.44 8.71 1a.59.59 0 0 1 .2.81z" fill="white"/>
    </svg>
  );
}

function fmtSubs(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

const NOTIF_ITEMS = [
  { key: 'experimentResults'  as const, label: 'Experiment results',   desc: 'When an experiment reaches significance'      },
  { key: 'weeklyDigest'       as const, label: 'Weekly digest',         desc: 'Summary of experiments and growth score'      },
  { key: 'newRecommendations' as const, label: 'New recommendations',   desc: 'When AI surfaces a new experiment opportunity' },
  { key: 'creatorAlerts'      as const, label: 'Creator alerts',        desc: 'When a creator needs attention'               },
  { key: 'teamActivity'       as const, label: 'Team activity',         desc: 'When teammates start or complete experiments' },
];

const USER_AVATAR = '/alex-avatar.jpeg';

function SectionHeader({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
      <Box sx={{ color: C.textMuted, display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em' }}>
        {children}
      </Typography>
    </Box>
  );
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    fontSize: '0.8125rem',
    borderRadius: '10px',
    backgroundColor: '#fff',
    '& fieldset': { borderColor: C.grey300 },
    '&:hover fieldset': { borderColor: C.textMuted },
    '&.Mui-focused fieldset': { borderColor: C.textPrimary, borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root': { fontSize: '0.8125rem' },
};

export default function Account() {
  const router = useRouter();
  const [name,  setName]  = useState('Alex Chen');
  const [email, setEmail] = useState('alex@shamelessmedia.com');
  const [role,  setRole]  = useState('Growth Director');
  const [saved, setSaved] = useState(false);

  const {
    connections,
    youtubeChannels,
    connect,
    disconnect,
    connectYouTube,
    disconnectYouTubeChannel,
    reconnectYouTubeChannel,
  } = useConnections();

  const [ytLoading,      setYtLoading]      = useState(false);
  const [ytError,        setYtError]        = useState<string | null>(null);
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [disconnecting,  setDisconnecting]  = useState<string | null>(null);

  const handleConnectYouTube = async () => {
    setYtLoading(true);
    setYtError(null);
    try {
      await connectYouTube();
    } catch (err) {
      setYtError(err instanceof Error ? err.message : 'Connection failed.');
    } finally {
      setYtLoading(false);
    }
  };

  const handleDisconnectYouTube = async (channelId: string) => {
    setDisconnecting(channelId);
    try {
      await disconnectYouTubeChannel(channelId, true);
    } finally {
      setDisconnecting(null);
    }
  };

  const handleConnectSpotify = async () => {
    setSpotifyLoading(true);
    try {
      await connect('spotify');
    } finally {
      setSpotifyLoading(false);
    }
  };

  const handleDisconnectSpotify = async () => {
    setDisconnecting('spotify');
    try {
      await disconnect('spotify');
    } finally {
      setDisconnecting(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('onboarding_complete');
    localStorage.removeItem('has_data');
    router.replace('/onboarding');
  };

  const [notifs, setNotifs] = useState({
    experimentResults:   true,
    weeklyDigest:        true,
    newRecommendations:  true,
    creatorAlerts:       true,
    teamActivity:        false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (key: keyof typeof notifs) =>
    setNotifs(n => ({ ...n, [key]: !n[key] }));

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, pb: 8 }}>

      {/* ── Profile hero ── */}
      <Card className="fade-in delay-1" sx={{ mt: { xs: 2.5, md: 5.5 }, mb: 3, overflow: 'hidden' }}>
        <Box sx={{
          position: 'relative',
          px: { xs: 3, md: 4 }, pt: { xs: 3, md: 4 }, pb: 3,
          display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3,
        }}>
          {/* Subtle warm gradient backdrop */}
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #FBF6DC 0%, #F3EDE6 50%, #FFFFFF 100%)', opacity: 0.55, pointerEvents: 'none' }} />

          {/* Avatar with camera overlay */}
          <Box sx={{ position: 'relative', flexShrink: 0, zIndex: 1 }}>
            <Avatar src={USER_AVATAR} sx={{ width: 80, height: 80, border: `3px solid #fff`, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
              {name.charAt(0)}
            </Avatar>
            <Box sx={{
              position: 'absolute', bottom: 0, right: 0,
              width: 26, height: 26, borderRadius: '50%', bgcolor: C.textPrimary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff', cursor: 'pointer',
              '&:hover': { bgcolor: '#2A2828' }, transition: 'background 0.15s',
            }}>
              <Camera size={12} color="#fff" />
            </Box>
          </Box>

          {/* Name / meta */}
          <Box sx={{ flex: 1, minWidth: 0, zIndex: 1 }}>
            <Typography sx={{ fontSize: '1.375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.025em', lineHeight: 1.2, mb: 0.375 }}>
              {name}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: C.textSecondary, mb: 1.25 }}>
              {role} · {email}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Shameless Media" size="small"
                sx={{ height: 20, bgcolor: C.yellowLight, color: '#B89530', fontWeight: 600, fontSize: '0.6875rem', '& .MuiChip-label': { px: '8px' } }} />
              <Chip label="Pro plan" size="small"
                sx={{ height: 20, bgcolor: C.purpleLight, color: C.purpleMain, fontWeight: 600, fontSize: '0.6875rem', '& .MuiChip-label': { px: '8px' } }} />
              <Chip label="Owner" size="small"
                sx={{ height: 20, bgcolor: C.grey200, color: C.textSecondary, fontWeight: 600, fontSize: '0.6875rem', '& .MuiChip-label': { px: '8px' } }} />
            </Box>
          </Box>

          {/* Workspace stats + logout */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0, zIndex: 1 }}>
            <Box sx={{ display: 'flex', gap: { xs: 2, md: 3 } }}>
              {[
                { value: '13',  label: 'Experiments', color: C.textPrimary },
                { value: '67%', label: 'Win rate',    color: C.successDark },
                { value: '74',  label: 'Growth score',color: C.yellowMain  },
              ].map(s => (
                <Box key={s.label} sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, mt: 0.375, lineHeight: 1.3 }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
            <Button
              onClick={handleLogout}
              startIcon={<LogOut size={14} />}
              size="small"
              sx={{
                fontSize: '0.75rem', color: C.textMuted, textTransform: 'none', fontWeight: 500,
                borderRadius: '8px', border: `1px solid ${C.grey300}`, px: 1.5,
                '&:hover': { color: C.textPrimary, borderColor: C.textPrimary, backgroundColor: 'transparent' },
              }}
            >
              Log out
            </Button>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3} className="fade-in delay-2">

        {/* ── LEFT: Profile edit + Team ── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Edit profile */}
            <Card>
              <CardContent sx={{ p: '24px !important' }}>
                <SectionHeader icon={<Camera size={15} />}>Edit profile</SectionHeader>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <TextField label="Full name" value={name} onChange={e => setName(e.target.value)} size="small" sx={fieldSx} />
                  <TextField label="Role"      value={role}  onChange={e => setRole(e.target.value)}  size="small" sx={fieldSx} />
                </Box>
                <TextField fullWidth label="Email address" value={email} onChange={e => setEmail(e.target.value)} size="small" sx={{ ...fieldSx, mb: 3 }} />

                <Divider sx={{ borderColor: C.grey100, mb: 2.5 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Button variant="text" size="small"
                    sx={{ fontSize: '0.8125rem', color: C.textMuted, textTransform: 'none', fontWeight: 400, px: 0, '&:hover': { color: C.textPrimary, backgroundColor: 'transparent' } }}>
                    Change password
                  </Button>
                  <Button variant="contained" onClick={handleSave}
                    startIcon={saved ? <Check size={14} strokeWidth={2.5} /> : undefined}
                    sx={{
                      bgcolor: saved ? C.successDark : C.textPrimary,
                      color: saved ? '#fff' : C.yellowMain,
                      '&:hover': { bgcolor: saved ? C.successDark : '#2A2828' },
                      fontWeight: 600, fontSize: '0.8125rem', borderRadius: '10px',
                      textTransform: 'none', boxShadow: 'none', px: 2.5, transition: 'all 0.2s',
                    }}>
                    {saved ? 'Saved' : 'Save changes'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Team */}
            <Card>
              <CardContent sx={{ p: '24px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <SectionHeader icon={<Users size={15} />}>Team</SectionHeader>
                  <Button startIcon={<Plus size={14} />} size="small"
                    sx={{ fontSize: '0.75rem', color: C.textSecondary, textTransform: 'none', fontWeight: 500, borderRadius: '8px', px: 1.25, '&:hover': { color: C.textPrimary, backgroundColor: C.grey100 } }}>
                    Invite member
                  </Button>
                </Box>

                {TEAM_MEMBERS.map((m, i) => (
                  <Box key={m.email}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
                      <Avatar
                        src={m.owner ? USER_AVATAR : undefined}
                        sx={{ width: 38, height: 38, bgcolor: m.owner ? C.yellowMain : C.grey200, color: C.textPrimary, fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>
                        {m.avatar}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em' }}>{m.name}</Typography>
                          {m.owner && (
                            <Chip label="Owner" size="small"
                              sx={{ height: 16, bgcolor: C.yellowLight, color: '#B89530', fontWeight: 700, fontSize: '0.5rem', '& .MuiChip-label': { px: '6px' } }} />
                          )}
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: C.textMuted }}>{m.role} · {m.email}</Typography>
                      </Box>
                      {!m.owner && (
                        <Button size="small"
                          sx={{ fontSize: '0.6875rem', color: C.textMuted, textTransform: 'none', fontWeight: 400, minWidth: 0, px: 1, borderRadius: '6px', '&:hover': { color: C.errorMain, backgroundColor: '#FCE0E020' } }}>
                          Remove
                        </Button>
                      )}
                    </Box>
                    {i < TEAM_MEMBERS.length - 1 && <Divider sx={{ borderColor: C.grey100 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Plan */}
            <Card sx={{ background: 'linear-gradient(135deg, #E0EAF8 0%, #EDE8F5 100%)', border: `1px solid ${C.purpleLight}` }}>
              <CardContent sx={{ p: '24px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: C.purpleMain, letterSpacing: '-0.02em', mb: 0.25 }}>Pro plan</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, lineHeight: 1.5 }}>
                      Unlimited creators · Unlimited experiments · AI analysis
                    </Typography>
                  </Box>
                  <Chip label="Active" size="small"
                    sx={{ height: 18, bgcolor: C.successLight, color: C.successDark, fontWeight: 700, fontSize: '0.5rem', '& .MuiChip-label': { px: '7px' } }} />
                </Box>
                <Button size="small" variant="outlined"
                  sx={{ fontSize: '0.6875rem', color: C.purpleMain, borderColor: `${C.purpleMain}50`, borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 2, '&:hover': { backgroundColor: 'rgba(123,159,212,0.1)', borderColor: C.purpleMain } }}>
                  Manage billing
                </Button>
              </CardContent>
            </Card>

          </Box>
        </Grid>

        {/* ── RIGHT: Notifications + Integrations ── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Notifications */}
            <Card>
              <CardContent sx={{ p: '24px !important' }}>
                <SectionHeader icon={<Bell size={15} />}>Notifications</SectionHeader>
                {NOTIF_ITEMS.map((n, i) => (
                  <Box key={n.key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 1.25 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', mb: 0.2 }}>{n.label}</Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, lineHeight: 1.4 }}>{n.desc}</Typography>
                      </Box>
                      <Switch
                        checked={notifs[n.key]}
                        onChange={() => toggle(n.key)}
                        size="small"
                        sx={{
                          flexShrink: 0,
                          '& .MuiSwitch-switchBase.Mui-checked': { color: C.textPrimary },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: C.textPrimary },
                        }}
                      />
                    </Box>
                    {i < NOTIF_ITEMS.length - 1 && <Divider sx={{ borderColor: C.grey100 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Integrations */}
            <Card>
              <CardContent sx={{ p: '24px !important' }}>
                <SectionHeader icon={<Plug size={15} />}>Connected accounts</SectionHeader>

                {/* ── YouTube ── */}
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#FFF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <YouTubeIcon size={18} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em' }}>YouTube</Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>
                        {youtubeChannels.length > 0 ? `${youtubeChannels.length} channel${youtubeChannels.length > 1 ? 's' : ''} connected` : 'Connect to track live video performance'}
                      </Typography>
                    </Box>
                    <Button
                      onClick={handleConnectYouTube}
                      disabled={ytLoading}
                      size="small"
                      variant={youtubeChannels.length > 0 ? 'outlined' : 'contained'}
                      startIcon={ytLoading ? <CircularProgress size={12} color="inherit" /> : <Plus size={13} />}
                      sx={youtubeChannels.length > 0 ? {
                        fontSize: '0.6875rem', color: C.textSecondary, borderColor: C.grey300,
                        borderRadius: '8px', textTransform: 'none', fontWeight: 500, px: 1.5, flexShrink: 0,
                        '&:hover': { borderColor: C.textPrimary, color: C.textPrimary, backgroundColor: 'transparent' },
                      } : {
                        fontSize: '0.6875rem', bgcolor: C.textPrimary, color: '#fff',
                        borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 1.5, flexShrink: 0,
                        boxShadow: 'none', '&:hover': { bgcolor: '#2A2828', boxShadow: 'none' },
                      }}
                    >
                      {ytLoading ? 'Connecting…' : youtubeChannels.length > 0 ? 'Add channel' : 'Connect'}
                    </Button>
                  </Box>

                  {ytError && (
                    <Box sx={{ mx: 1, mb: 1, p: 1.25, borderRadius: '8px', backgroundColor: '#FCE0E0', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <AlertTriangle size={13} color="#C41520" />
                      <Typography sx={{ fontSize: '0.6875rem', color: '#C41520', lineHeight: 1.4 }}>{ytError}</Typography>
                    </Box>
                  )}

                  {youtubeChannels.map(ch => (
                    <Box key={ch.channelId} sx={{
                      ml: 6, mb: 1, p: 1.25, borderRadius: '10px',
                      border: `1px solid ${ch.status === 'RECONNECT_REQUIRED' ? '#F5B5B5' : C.grey300}`,
                      backgroundColor: ch.status === 'RECONNECT_REQUIRED' ? '#FFF8F8' : '#FFFFFF',
                      display: 'flex', alignItems: 'center', gap: 1.25,
                    }}>
                      {ch.thumbnailUrl ? (
                        <Avatar src={ch.thumbnailUrl} sx={{ width: 28, height: 28, flexShrink: 0 }} />
                      ) : (
                        <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: C.grey100, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <YouTubeIcon size={14} />
                        </Box>
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.2 }} noWrap>
                          {ch.channelName}
                        </Typography>
                        {ch.subscriberCount ? (
                          <Typography sx={{ fontSize: '0.625rem', color: C.textMuted }}>{fmtSubs(ch.subscriberCount)} subscribers</Typography>
                        ) : null}
                      </Box>
                      {ch.status === 'ACTIVE' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: C.successMain }} />
                          <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: C.successDark }}>Active</Typography>
                        </Box>
                      )}
                      {ch.status === 'RECONNECT_REQUIRED' && (
                        <Button size="small" startIcon={<RefreshCw size={11} />} onClick={() => reconnectYouTubeChannel(ch.channelId)}
                          sx={{ fontSize: '0.625rem', color: C.warnMain ?? '#B45309', textTransform: 'none', fontWeight: 600, px: 1, borderRadius: '6px', flexShrink: 0, '&:hover': { backgroundColor: '#FEF3C7' } }}>
                          Reconnect
                        </Button>
                      )}
                      <Button size="small" startIcon={disconnecting === ch.channelId ? <CircularProgress size={10} color="inherit" /> : <Unlink size={11} />}
                        disabled={disconnecting === ch.channelId}
                        onClick={() => handleDisconnectYouTube(ch.channelId)}
                        sx={{ fontSize: '0.625rem', color: C.textMuted, textTransform: 'none', fontWeight: 400, px: 1, borderRadius: '6px', flexShrink: 0, minWidth: 0, '&:hover': { color: C.errorMain, backgroundColor: '#FCE0E020' } }}>
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ borderColor: C.grey100, my: 0.5 }} />

                {/* ── Spotify ── */}
                <Box sx={{ mt: 1 }}>
                  {(() => {
                    const spotifyConn = connections.find(c => c.platform === 'spotify');
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#F0FBF2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <SpotifyIcon size={18} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em' }}>Spotify for Podcasters</Typography>
                          {spotifyConn ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: C.successMain }} />
                              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: C.successDark }}>{spotifyConn.displayName}</Typography>
                            </Box>
                          ) : (
                            <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>Connect to track episode plays and listener data</Typography>
                          )}
                        </Box>
                        {spotifyConn ? (
                          <Button size="small" startIcon={disconnecting === 'spotify' ? <CircularProgress size={10} color="inherit" /> : <Unlink size={11} />}
                            disabled={disconnecting === 'spotify'}
                            onClick={handleDisconnectSpotify}
                            sx={{ fontSize: '0.6875rem', color: C.textMuted, borderColor: C.grey300, borderRadius: '8px', textTransform: 'none', fontWeight: 500, px: 1.5, flexShrink: 0, border: `1px solid ${C.grey300}`, '&:hover': { color: C.errorMain, borderColor: '#F5B5B5', backgroundColor: '#FCE0E020' } }}>
                            Disconnect
                          </Button>
                        ) : (
                          <Button size="small" variant="contained" disabled={spotifyLoading}
                            startIcon={spotifyLoading ? <CircularProgress size={12} color="inherit" /> : <Plus size={13} />}
                            onClick={handleConnectSpotify}
                            sx={{ fontSize: '0.6875rem', bgcolor: '#1DB954', color: '#fff', borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 1.5, flexShrink: 0, boxShadow: 'none', '&:hover': { bgcolor: '#17a349', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: C.grey300, color: C.textMuted } }}>
                            {spotifyLoading ? 'Connecting…' : 'Connect'}
                          </Button>
                        )}
                      </Box>
                    );
                  })()}
                </Box>

                <Divider sx={{ borderColor: C.grey100, my: 1.5 }} />

                {/* Coming soon */}
                {[
                  { icon: '✉️', name: 'Substack',        desc: 'Open rates, subscriber growth' },
                  { icon: '📈', name: 'Google Analytics', desc: 'Website traffic from content'  },
                ].map((integ, i, arr) => (
                  <Box key={integ.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, opacity: 0.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: C.grey100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                        {integ.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em' }}>{integ.name}</Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>{integ.desc}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, flexShrink: 0, fontStyle: 'italic' }}>Coming soon</Typography>
                    </Box>
                    {i < arr.length - 1 && <Divider sx={{ borderColor: C.grey100 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>

          </Box>
        </Grid>
      </Grid>

      {/* ── Danger zone ── */}
      <Card className="fade-in delay-3" sx={{ mt: 3, border: `1px solid ${C.errorMain}18` }}>
        <CardContent sx={{ p: '20px 24px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#FCE0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={15} color={C.errorMain} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: C.textPrimary, mb: 0.2, letterSpacing: '-0.01em' }}>Delete workspace</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: C.textMuted }}>Permanently delete Shameless Media and all data. This cannot be undone.</Typography>
              </Box>
            </Box>
            <Button size="small" variant="outlined"
              sx={{ fontSize: '0.75rem', color: C.errorMain, borderColor: `${C.errorMain}40`, borderRadius: '10px', textTransform: 'none', fontWeight: 500, px: 2, flexShrink: 0, '&:hover': { borderColor: C.errorMain, backgroundColor: '#FCE0E0' } }}>
              Delete workspace
            </Button>
          </Box>
        </CardContent>
      </Card>

    </Box>
  );
}
