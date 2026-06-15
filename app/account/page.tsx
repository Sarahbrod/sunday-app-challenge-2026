'use client';

import { useState } from 'react';
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
import Grid from '@mui/material/Grid2';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { TIER_STYLE } from '@/components/venueData';
import type { Tier } from '@/components/venueData';

const C = {
  textPrimary:   '#1A1818',
  textSecondary: '#696764',
  textMuted:     '#A8A5A0',
  successDark:   '#1A5C3A',
  successLight:  '#D4F0E4',
  errorMain:     '#E84030',
  yellowMain:    '#F5E68A',
  yellowLight:   '#FEFCE8',
  grey100:       '#F5F2ED',
  grey300:       '#E0DDD8',
  purpleMain:    '#8B6CF5',
  purpleLight:   '#E8E0FC',
};

const TEAM_MEMBERS = [
  { name: 'Alex Chen', role: 'Growth Director', email: 'alex@shamelessmedia.com',   avatar: 'A', owner: true  },
  { name: 'James Liu',      role: 'Analyst',         email: 'james@shamelessmedia.com',   avatar: 'J', owner: false },
  { name: 'Priya Mehta',    role: 'Creator Manager', email: 'priya@shamelessmedia.com',   avatar: 'P', owner: false },
];

const CREATORS_ROSTER = [
  { name: 'TechTalk Daily',   platform: 'YouTube',    tier: 'top'   as Tier, subs: '2.1M' },
  { name: 'Pod & Chill',      platform: 'Podcast',    tier: 'top'   as Tier, subs: '340K' },
  { name: 'Creative Brief',   platform: 'Newsletter', tier: 'good'  as Tier, subs: '89K'  },
  { name: 'Everyday Finance', platform: 'YouTube',    tier: 'good'  as Tier, subs: '890K' },
  { name: 'Morning Mindset',  platform: 'Podcast',    tier: 'good'  as Tier, subs: '210K' },
  { name: 'Sarah Codes',      platform: 'YouTube',    tier: 'good'  as Tier, subs: '560K' },
  { name: 'Pixel Perfect',    platform: 'YouTube',    tier: 'good'  as Tier, subs: '1.1M' },
  { name: 'The Hustle Recap', platform: 'Newsletter', tier: 'good'  as Tier, subs: '45K'  },
  { name: 'GameStream Live',  platform: 'YouTube',    tier: 'watch' as Tier, subs: '920K' },
  { name: 'Vlog Universe',    platform: 'YouTube',    tier: 'watch' as Tier, subs: '340K' },
  { name: 'ByteSize News',    platform: 'YouTube',    tier: 'risk'  as Tier, subs: '180K' },
];

const INTEGRATIONS = [
  { name: 'YouTube Analytics CSV',  desc: 'Manual upload via Analytics page',       status: 'connected', icon: '📊' },
  { name: 'YouTube Data API',       desc: 'Real-time sync · channel & video data',  status: 'soon',      icon: '▶️'  },
  { name: 'Spotify Podcasters API', desc: 'Episode plays, listener retention',       status: 'soon',      icon: '🎙️' },
  { name: 'Substack API',           desc: 'Open rates, subscriber growth',           status: 'soon',      icon: '✉️'  },
  { name: 'Google Analytics',       desc: 'Website traffic from video descriptions', status: 'soon',      icon: '📈' },
];

const PLATFORM_COLORS: Record<string, string> = {
  YouTube:    '#E84030',
  Podcast:    '#F07830',
  Newsletter: '#1A1818',
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, mb: 2 }}>
      {children}
    </Typography>
  );
}

export default function Account() {
  const [name,  setName]  = useState('Alex Chen');
  const [email, setEmail] = useState('alex@shamelessmedia.com');
  const [role,  setRole]  = useState('Growth Director');
  const [saved, setSaved] = useState(false);

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

      {/* Header */}
      <Box className="fade-in delay-1" sx={{ pt: 5.5, pb: 4 }}>
        <Typography variant="h3" sx={{ color: C.textPrimary, mb: 1, fontWeight: 500 }}>Account</Typography>
      </Box>

      <Grid container spacing={3} className="fade-in delay-2">

        {/* ── LEFT COLUMN ── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Profile */}
            <Card>
              <CardContent sx={{ p: '24px !important' }}>
                <SectionLabel>Profile</SectionLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
                  <Avatar sx={{ width: 56, height: 56, backgroundColor: C.yellowMain, color: C.textPrimary, fontSize: '1.25rem', fontWeight: 700, flexShrink: 0 }}>
                    {name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Button variant="outlined" size="small"
                      sx={{ fontSize: '0.75rem', color: C.textSecondary, borderColor: C.grey300, borderRadius: '8px', textTransform: 'none', fontWeight: 400, mr: 1, '&:hover': { borderColor: C.textPrimary, color: C.textPrimary } }}>
                      Change photo
                    </Button>
                    <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, mt: 0.75 }}>JPG or PNG, max 2MB</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <TextField label="Full name" value={name} onChange={e => setName(e.target.value)} size="small"
                    InputProps={{ sx: { fontSize: '0.8125rem', borderRadius: '8px' } }}
                    InputLabelProps={{ sx: { fontSize: '0.8125rem' } }} />
                  <TextField label="Role" value={role} onChange={e => setRole(e.target.value)} size="small"
                    InputProps={{ sx: { fontSize: '0.8125rem', borderRadius: '8px' } }}
                    InputLabelProps={{ sx: { fontSize: '0.8125rem' } }} />
                </Box>
                <TextField fullWidth label="Email address" value={email} onChange={e => setEmail(e.target.value)} size="small" sx={{ mb: 2 }}
                  InputProps={{ sx: { fontSize: '0.8125rem', borderRadius: '8px' } }}
                  InputLabelProps={{ sx: { fontSize: '0.8125rem' } }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Button variant="contained" onClick={handleSave}
                    startIcon={saved ? <CheckRoundedIcon sx={{ fontSize: '0.875rem !important' }} /> : undefined}
                    sx={{ bgcolor: saved ? C.successDark : C.textPrimary, color: saved ? '#fff' : C.yellowMain, '&:hover': { bgcolor: saved ? C.successDark : '#2A2828' }, fontWeight: 600, fontSize: '0.8125rem', borderRadius: '8px', textTransform: 'none', boxShadow: 'none', px: 2, transition: 'all 0.2s' }}>
                    {saved ? 'Saved' : 'Save changes'}
                  </Button>
                  <Button variant="text" size="small"
                    sx={{ fontSize: '0.75rem', color: C.textMuted, textTransform: 'none', fontWeight: 400, '&:hover': { color: C.textSecondary, backgroundColor: 'transparent' } }}>
                    Change password
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Team */}
            <Card>
              <CardContent sx={{ p: '24px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <SectionLabel>Team</SectionLabel>
                  <Button startIcon={<AddRoundedIcon />} size="small"
                    sx={{ fontSize: '0.75rem', color: C.textSecondary, textTransform: 'none', fontWeight: 400, '&:hover': { color: C.textPrimary } }}>
                    Invite
                  </Button>
                </Box>
                {TEAM_MEMBERS.map((m, i) => (
                  <Box key={m.email}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, backgroundColor: C.yellowMain, color: C.textPrimary, fontSize: '0.8125rem', fontWeight: 700, flexShrink: 0 }}>{m.avatar}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.125 }}>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em' }}>{m.name}</Typography>
                          {m.owner && <Chip label="Owner" size="small" sx={{ height: 16, bgcolor: C.yellowLight, color: '#7A4808', fontWeight: 700, fontSize: '0.5rem', '& .MuiChip-label': { px: '6px' } }} />}
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: C.textMuted }}>{m.email} · {m.role}</Typography>
                      </Box>
                      {!m.owner && (
                        <Button size="small"
                          sx={{ fontSize: '0.6875rem', color: C.textMuted, textTransform: 'none', fontWeight: 400, minWidth: 0, '&:hover': { color: C.errorMain, backgroundColor: 'transparent' } }}>
                          Remove
                        </Button>
                      )}
                    </Box>
                    {i < TEAM_MEMBERS.length - 1 && <Divider sx={{ borderColor: C.grey100 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Creator roster */}
            <Card>
              <CardContent sx={{ p: '24px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <SectionLabel>Creator roster</SectionLabel>
                  <Button startIcon={<AddRoundedIcon />} size="small"
                    sx={{ fontSize: '0.75rem', color: C.textSecondary, textTransform: 'none', fontWeight: 400, '&:hover': { color: C.textPrimary } }}>
                    Add creator
                  </Button>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                  {CREATORS_ROSTER.map((c) => {
                    const ts = TIER_STYLE[c.tier];
                    return (
                      <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: '8px', border: `1px solid ${C.grey300}`, '&:hover': { borderColor: C.textPrimary, '& .remove-btn': { opacity: 1 } } }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ts.bg, flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '2px', bgcolor: PLATFORM_COLORS[c.platform] ?? C.textMuted }} />
                            <Typography sx={{ fontSize: '0.625rem', color: C.textMuted }}>{c.platform} · {c.subs}</Typography>
                          </Box>
                        </Box>
                        <Typography className="remove-btn" sx={{ fontSize: '0.625rem', color: C.textMuted, cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s', '&:hover': { color: C.errorMain } }}>
                          Remove
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* ── RIGHT COLUMN ── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Workspace */}
            <Card>
              <CardContent sx={{ p: '24px !important' }}>
                <SectionLabel>Workspace</SectionLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.75, borderRadius: '10px', backgroundColor: C.grey100, mb: 2 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: C.yellowMain, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: C.textPrimary }}>S</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.015em' }}>Shameless Media</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: C.textMuted }}>3 members · 11 creators</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                  <Box sx={{ flex: 1, p: 1.5, borderRadius: '8px', border: `1px solid ${C.grey300}`, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.04em', lineHeight: 1 }}>13</Typography>
                    <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, mt: 0.25 }}>Experiments run</Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 1.5, borderRadius: '8px', border: `1px solid ${C.grey300}`, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: C.successDark, letterSpacing: '-0.04em', lineHeight: 1 }}>67%</Typography>
                    <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, mt: 0.25 }}>Win rate</Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 1.5, borderRadius: '8px', border: `1px solid ${C.grey300}`, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#F5E68A', letterSpacing: '-0.04em', lineHeight: 1 }}>74</Typography>
                    <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, mt: 0.25 }}>Growth score</Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 1.75, borderRadius: '10px', backgroundColor: C.purpleLight }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.purpleMain }}>Pro plan</Typography>
                    <Chip label="Active" size="small" sx={{ height: 16, bgcolor: C.successLight, color: C.successDark, fontWeight: 700, fontSize: '0.5rem', '& .MuiChip-label': { px: '6px' } }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, mb: 1.5 }}>Unlimited creators · Unlimited experiments · AI analysis</Typography>
                  <Button size="small" variant="outlined"
                    sx={{ fontSize: '0.6875rem', color: C.purpleMain, borderColor: C.purpleMain, borderRadius: '7px', textTransform: 'none', fontWeight: 500, '&:hover': { backgroundColor: C.purpleLight, borderColor: C.purpleMain } }}>
                    Manage billing
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardContent sx={{ p: '24px !important' }}>
                <SectionLabel>Notifications</SectionLabel>
                {[
                  { key: 'experimentResults'  as const, label: 'Experiment results',    desc: 'When an experiment reaches significance'      },
                  { key: 'weeklyDigest'       as const, label: 'Weekly digest',          desc: 'Summary of experiments and growth score'      },
                  { key: 'newRecommendations' as const, label: 'New recommendations',    desc: 'When AI surfaces a new experiment opportunity' },
                  { key: 'creatorAlerts'      as const, label: 'Creator alerts',         desc: 'When a creator needs attention'               },
                  { key: 'teamActivity'       as const, label: 'Team activity',          desc: 'When teammates start or complete experiments' },
                ].map((n, i, arr) => (
                  <Box key={n.key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.25 }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', mb: 0.2 }}>{n.label}</Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>{n.desc}</Typography>
                      </Box>
                      <Switch checked={notifs[n.key]} onChange={() => toggle(n.key)} size="small"
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: C.textPrimary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: C.textPrimary } }} />
                    </Box>
                    {i < arr.length - 1 && <Divider sx={{ borderColor: C.grey100 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Integrations */}
            <Card>
              <CardContent sx={{ p: '24px !important' }}>
                <SectionLabel>Integrations</SectionLabel>
                {INTEGRATIONS.map((integ, i) => (
                  <Box key={integ.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: C.grey100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                        {integ.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', mb: 0.2 }}>{integ.name}</Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>{integ.desc}</Typography>
                      </Box>
                      {integ.status === 'connected' ? (
                        <Chip label="Connected" size="small" sx={{ height: 18, bgcolor: C.successLight, color: C.successDark, fontWeight: 600, fontSize: '0.5rem', flexShrink: 0, '& .MuiChip-label': { px: '7px' } }} />
                      ) : (
                        <Chip label="Soon" size="small" sx={{ height: 18, bgcolor: C.grey300, color: C.textMuted, fontWeight: 600, fontSize: '0.5rem', flexShrink: 0, '& .MuiChip-label': { px: '7px' } }} />
                      )}
                    </Box>
                    {i < INTEGRATIONS.length - 1 && <Divider sx={{ borderColor: C.grey100 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Danger zone */}
            <Card sx={{ border: `1px solid ${C.errorMain}20` }}>
              <CardContent sx={{ p: '24px !important' }}>
                <SectionLabel>Danger zone</SectionLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, mb: 0.2 }}>Delete workspace</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>Permanently delete Shameless Media and all data. This cannot be undone.</Typography>
                  </Box>
                  <Button size="small" variant="outlined"
                    sx={{ fontSize: '0.75rem', color: C.errorMain, borderColor: `${C.errorMain}50`, borderRadius: '8px', textTransform: 'none', fontWeight: 500, flexShrink: 0, '&:hover': { borderColor: C.errorMain, backgroundColor: '#FCE0DA' } }}>
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
