'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Collapse from '@mui/material/Collapse';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Sidebar from '@/components/Sidebar';
import VenueMapComponent from '@/components/VenueMap';
import { TIER_STYLE, type Tier } from '@/components/venueData';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';


// ─── Design system tokens ─────────────────────────────────────────────────────
const C = {
  // Text
  textPrimary:    '#0A0A0A',
  textSecondary:  '#6B6970',
  textMuted:      '#B7B5BB',
  // Success / positive (green family)
  successDark:    '#2E5158',
  successMain:    '#8DD8A5',
  successLight:   '#E1FBED',
  // Error / danger (red family)
  errorDark:      '#6F0C23',
  errorMain:      '#E77171',
  errorLight:     '#FDDFDF',
  // Warning (yellow family)
  warningDark:    '#72430B',
  warningMain:    '#F3DF76',
  warningLight:   '#F9F8CD',
  // Warm amber (Dishoom / brand warmth)
  warmDark:       '#72430B',
  warmMain:       '#F0B680',
  warmLight:      '#F9E5CD',
  // Purple (interactive / platform)
  purpleDark:     '#400F66',
  purpleMain:     '#D0ABED',
  purpleLight:    '#F2E5FC',
  // Neutral
  grey100:        '#F6F6F9',
  grey300:        '#E2E1E5',
  grey500:        '#B7B5BB',
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const metricsData = {
  this_week: [
    { label: 'Total Sales',        value: '£342K',  delta: '+6%',  positive: true,  sub: 'this week' },
    { label: 'Payment Completion', value: '91%',    delta: '+2%',  positive: true,  sub: 'vs last week' },
    { label: 'Tip Conversion',     value: '18%',    delta: '−1%',  positive: false, sub: 'vs last week' },
    { label: 'Guest Satisfaction', value: '4.6',    delta: null,   positive: null,  sub: 'avg rating', starRating: true },
    { label: 'Operational Health', value: 'Good',   delta: null,   positive: null,  sub: 'across all houses' },
  ],
  last_week: [
    { label: 'Total Sales',        value: '£323K',  delta: '+3%',  positive: true,  sub: 'last week' },
    { label: 'Payment Completion', value: '89%',    delta: '+1%',  positive: true,  sub: 'vs prior week' },
    { label: 'Tip Conversion',     value: '19%',    delta: '+1%',  positive: true,  sub: 'vs prior week' },
    { label: 'Guest Satisfaction', value: '4.5',    delta: null,   positive: null,  sub: 'avg rating', starRating: true },
    { label: 'Operational Health', value: 'Good',   delta: null,   positive: null,  sub: 'across all houses' },
  ],
  this_month: [
    { label: 'Total Sales',        value: '£1.42M', delta: '+8%',  positive: true,  sub: 'this month' },
    { label: 'Payment Completion', value: '91%',    delta: '+3%',  positive: true,  sub: 'vs last month' },
    { label: 'Tip Conversion',     value: '18%',    delta: '−2%',  positive: false, sub: 'vs last month' },
    { label: 'Guest Satisfaction', value: '4.6',    delta: null,   positive: null,  sub: 'avg rating', starRating: true },
    { label: 'Operational Health', value: 'Good',   delta: null,   positive: null,  sub: 'across all houses' },
  ],
  last_month: [
    { label: 'Total Sales',        value: '£1.31M', delta: '+3%',  positive: true,  sub: 'last month' },
    { label: 'Payment Completion', value: '88%',    delta: '+2%',  positive: true,  sub: 'vs prior month' },
    { label: 'Tip Conversion',     value: '20%',    delta: '−1%',  positive: false, sub: 'vs prior month' },
    { label: 'Guest Satisfaction', value: '4.5',    delta: null,   positive: null,  sub: 'avg rating', starRating: true },
    { label: 'Operational Health', value: 'Good',   delta: null,   positive: null,  sub: 'across all houses' },
  ],
};

const signals = [
  {
    id: 1, severity: 'high' as const,
    venue: 'Edinburgh',     title: 'Weekend cover needed',
    detail: 'Three shifts still unfilled this weekend — Saturday dinner and Sunday brunch are most exposed.',
    time: '2 hours ago',    tag: 'Staffing',
    tier: 'good'  as Tier,
    impactNote: 'Up to 380 covers at risk if left unfilled',
    ctaLabel: 'Sort the rota',
    image: '/venue-edinburgh.jpeg',
  },
  {
    id: 2, severity: 'high' as const,
    venue: 'Covent Garden', title: 'Till sync has stalled',
    detail: 'Last successful sync was 47 minutes ago — sales figures may be incomplete until this is resolved.',
    time: '47 mins ago',    tag: 'Operations',
    tier: 'risk'  as Tier,
    impactNote: 'Daily sales reporting affected',
    ctaLabel: 'Look into it',
    image: '/venue-covent-garden.jpeg',
  },
  {
    id: 3, severity: 'medium' as const,
    venue: 'Carnaby',       title: 'Guests not returning',
    detail: "Repeat visits down 12% month-on-month. Satisfaction is holding steady — something in the experience isn't bringing guests back for a second visit.",
    time: 'This month',     tag: 'Guest',
    tier: 'watch' as Tier,
    impactNote: 'Repeat visits down 12% on the month',
    ctaLabel: 'Dig into this',
  },
];

const changes = [
  { id: 1, type: 'up',   venue: 'Shoreditch',    text: 'The new brunch is landing well — covers up 18% on the first weekend. Guests are leaning in.',                 time: 'Today' },
  { id: 2, type: 'up',   venue: 'Network',       text: 'Cashless nudge is working. Payment adoption up 6% across the estate since the rollout.',                      time: 'Yesterday' },
  { id: 3, type: 'down', venue: 'Covent Garden', text: <>Guest satisfaction has slipped to 3.9<StarRoundedIcon sx={{ fontSize: '0.6rem', color: '#E8A020', verticalAlign: 'middle', position: 'relative', top: '-1px', mx: '1px' }} /> — the lowest in the house. Weekend staffing is the likely cause.</>, time: '3 days ago' },
];

const venues = [
  { name: "King's Cross", score: 94, satisfaction: 4.8, trend: 'up',     tier: 'top',   region: 'London'     },
  { name: 'Shoreditch',   score: 91, satisfaction: 4.7, trend: 'up',     tier: 'top',   region: 'London'     },
  { name: 'Liverpool St', score: 83, satisfaction: 4.4, trend: 'stable', tier: 'good',  region: 'London'     },
  { name: 'Manchester',   score: 82, satisfaction: 4.4, trend: 'stable', tier: 'good',  region: 'Manchester' },
  { name: 'Kensington',   score: 80, satisfaction: 4.3, trend: 'stable', tier: 'good',  region: 'London'     },
  { name: 'Edinburgh',    score: 79, satisfaction: 4.3, trend: 'stable', tier: 'good',  region: 'Edinburgh'  },
  { name: 'Battersea',    score: 78, satisfaction: 4.2, trend: 'stable', tier: 'good',  region: 'London'     },
  { name: 'Birmingham',   score: 74, satisfaction: 4.2, trend: 'down',   tier: 'watch', region: 'Birmingham' },
  { name: 'Carnaby',      score: 71, satisfaction: 4.1, trend: 'down',   tier: 'watch', region: 'London'     },
  { name: 'Covent Garden',score: 65, satisfaction: 4.0, trend: 'down',   tier: 'risk',  region: 'London'     },
];

const REGIONS = [...new Set(venues.map(v => v.region))].sort();

const drivers = [
  {
    title: 'Payment Adoption', metric: '91% network avg', impact: 'High',
    insight: "Every 5% lift in cashless adoption adds roughly 2.3% to revenue per cover. King's Cross and Shoreditch are already above 95% — the rest have real ground to gain.",
    note: "King's Cross and Shoreditch out in front",
  },
  {
    title: 'Team Consistency', metric: '≤15% staff turnover', impact: 'High',
    insight: 'Houses keeping turnover under 15% score 0.4★ higher with guests. A team that knows each other — and knows the menu — brings the hospitality to life in ways a training manual never can.',
    note: '4 of our 8 houses in range',
  },
  {
    title: 'Pre-Service Ritual', metric: '3 of 5 top venues', impact: 'Medium',
    insight: "The pre-service gather — sharing the stories, the specials, the care behind the food — is the single behaviour most tied to top scores. Shoreditch's model is ready to hand over.",
    note: 'Shoreditch model ready to share',
  },
];

const menuData = {
  trending:  [{ name: 'House Black Daal', delta: '+23%' }, { name: 'Lamb Chops', delta: '+15%' }, { name: 'Roomali Roti', delta: '+8%' }],
  declining: [{ name: 'Chicken Ruby', delta: '−11%' }, { name: 'House Salad', delta: '−7%' }],
  opportunities: [
    {
      icon: LocalOfferOutlinedIcon,
      title: 'Naan alongside',
      detail: 'A prompt to add a naan with any main at £2.50. Only 14% of guests are taking one — a well-placed nudge at ordering could more than double that.',
      impact: 'Est. +£8K / month',
    },
    {
      icon: WbSunnyOutlinedIcon,
      title: 'Set brunch menu',
      detail: 'A three-course set at £28 — something to savour slowly. Targets the repeat visit gap at Carnaby and Covent Garden with a format guests want to return for.',
      impact: 'Addresses repeat visit decline',
    },
    {
      icon: LocalCafeOutlinedIcon,
      title: 'Chai with dessert',
      detail: 'Complimentary chai with every dessert for loyalty members. A small gesture that makes the end of a meal feel genuinely looked after — and brings guests into the app at almost no cost.',
      impact: 'Boosts loyalty engagement',
    },
  ],
};


// ─── Tier colour map — must stay in sync with TIER_STYLE in VenueMap ─────────
const TIER: Record<string, string> = {
  top:   '#2E7D52',
  good:  '#3B72C0',
  watch: C.warmDark,
  risk:  C.errorDark,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted }}>
        {children}
      </Typography>
      {aside && <Typography sx={{ fontSize: '0.75rem', color: C.textMuted, letterSpacing: '-0.005em' }}>{aside}</Typography>}
    </Box>
  );
}

function TrendArrow({ trend }: { trend: string }) {
  if (trend === 'up')   return <span style={{ color: C.successDark, fontSize: '0.75rem' }}>↑</span>;
  if (trend === 'down') return <span style={{ color: C.errorMain,   fontSize: '0.75rem' }}>↓</span>;
  return <span style={{ color: C.textMuted, fontSize: '0.75rem' }}>→</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [showVenueList, setShowVenueList] = useState(false);
  const [activeTier, setActiveTier] = useState<Tier | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>('London');
  const [snapshotRange, setSnapshotRange] = useState<keyof typeof metricsData>('this_week');

  const metrics = metricsData[snapshotRange];

  const filteredVenues = venues.filter(v =>
    (activeRegion == null || v.region === activeRegion) &&
    (activeTier == null || v.tier === activeTier)
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: C.grey100 }}>
      <Sidebar />

      <Box component="main" sx={{ ml: '220px', flex: 1, px: { xs: 3, md: 4, lg: 5 }, pb: 8, maxWidth: 1280 }}>

        {/* ── Greeting ────────────────────────────────────────────────── */}
        <Box className="fade-in delay-1" sx={{ pt: 5.5, pb: 4 }}>
          <Typography variant="h3" sx={{ color: C.textPrimary, mb: 1, fontWeight: 500 }}>
            Good morning, Marcus.
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: C.textMuted, letterSpacing: '-0.005em' }}>
            Wednesday, 20 May 2026 · Morning briefing · 8 houses
          </Typography>
        </Box>

        {/* ── Status banner ────────────────────────────────────────────── */}
        <Box className="fade-in delay-2" sx={{ mb: 3 }}>
          <Card sx={{ overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', minHeight: 200 }}>

              {/* Left — status panel */}
              <Box sx={{
                width: '38%', flexShrink: 0, p: 3.5,
                backgroundColor: '#1A3D2B',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Decorative rings */}
                <Box sx={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', top: -70, right: -70, pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)', top: -20, right: -20, pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', bottom: 24, right: 28, pointerEvents: 'none' }} />

                <Box>
                  <Box sx={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <CheckRoundedIcon sx={{ color: '#fff', fontSize: '1.375rem' }} />
                  </Box>
                  <Typography sx={{ fontSize: '1.375rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.25, mb: 1 }}>
                    The house is<br />in good shape.
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.005em', lineHeight: 1.5 }}>
                    Seven of our ten houses are on or above target today
                  </Typography>
                </Box>

                <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', mt: 2.5 }}>
                  Wed 20 May 2026 · Morning briefing
                </Typography>
              </Box>

              {/* Right — today at a glance */}
              <Box sx={{ flex: 1, p: 3.5, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted, mb: 2.5 }}>
                  Today at a Glance
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5, flex: 1 }}>
                  {[
                    { Icon: FormatListBulletedRoundedIcon, value: '2', label: 'Things worth\nyour attention', bg: C.grey100, iconColor: C.textSecondary, valueColor: C.textPrimary },
                    { Icon: TrendingUpRoundedIcon,          value: '3', label: 'Opportunities\nto act on',        bg: C.successLight, iconColor: '#2E7D52', valueColor: '#2E7D52' },
                    { Icon: WarningAmberRoundedIcon,        value: '1', label: 'One house\nneeding focus',        bg: C.errorLight,   iconColor: C.errorMain, valueColor: C.errorDark },
                  ].map(({ Icon, value, label, bg, iconColor, valueColor }) => (
                    <Box key={label} sx={{ flex: 1, backgroundColor: bg, borderRadius: '10px', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 110 }}>
                      <Icon sx={{ fontSize: '1.125rem', color: iconColor }} />
                      <Box>
                        <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: valueColor, letterSpacing: '-0.04em', lineHeight: 1, mb: 0.5 }}>
                          {value}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: C.textSecondary, lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                          {label}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

            </Box>
          </Card>
        </Box>

        {/* ── Priority Signals + Recent Changes ───────────────────────── */}
        <Box className="fade-in delay-3" sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em', mb: 2 }}>
            What matters today
          </Typography>

          {/* Attention cards */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {signals.filter(s => s.severity === 'high').map((s, i) => {
              const ts = TIER_STYLE[s.tier];
              return (
                <Grid key={s.id} size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ display: 'flex', overflow: 'hidden', height: '100%' }}>
                    {/* Content */}
                    <Box sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: C.grey100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: C.textMuted, lineHeight: 1 }}>{i + 1}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted }}>
                          Needs your eye
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em', lineHeight: 1.3, mb: 0.6 }}>
                        {s.venue} {s.title.toLowerCase()}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, lineHeight: 1.55, letterSpacing: '-0.005em', flex: 1, mb: 1.75 }}>
                        {s.detail}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Chip label={s.impactNote} size="small" sx={{ height: 20, fontSize: '0.5625rem', fontWeight: 500, backgroundColor: C.grey100, color: C.textSecondary, letterSpacing: '-0.005em', '& .MuiChip-label': { px: '8px' } }} />
                        <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, color: ts.bg, letterSpacing: '-0.01em', whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0, '&:hover': { opacity: 0.75 } }}>
                          {s.ctaLabel} →
                        </Typography>
                      </Box>
                    </Box>
                    {/* Venue photo */}
                    <Box sx={{ width: 110, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                      <Box
                        component="img"
                        src={s.image}
                        alt={s.venue}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,0.18) 0%, transparent 40%)' }} />
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Grid container spacing={2}>

            {/* Priority Signals */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <SectionLabel aside="3 items">Signals to act on</SectionLabel>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {signals.map((s, i) => (
                      <Box key={s.id}>
                        <Box sx={{ display: 'flex', gap: 2, py: 1.75 }}>
                          <Box sx={{ pt: 0.3, flexShrink: 0 }}>
                            <Box sx={{
                              width: 7, height: 7, borderRadius: '50%', mt: 0.25,
                              backgroundColor: s.severity === 'high' ? C.errorMain : C.warningMain,
                            }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.35 }}>
                                {s.venue}{' '}
                                <Typography component="span" sx={{ fontWeight: 400, color: C.textSecondary, fontSize: '0.8125rem' }}>
                                  , {s.title}
                                </Typography>
                              </Typography>
                              <Chip label={s.tag} size="small" variant="outlined" sx={{ flexShrink: 0, height: 18, fontSize: '0.5625rem', letterSpacing: '0.04em', fontWeight: 600, textTransform: 'uppercase', borderColor: C.grey300, color: C.textMuted, '& .MuiChip-label': { px: '6px' } }} />
                            </Box>
                            <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, lineHeight: 1.55, letterSpacing: '-0.005em', mb: 0.75 }}>
                              {s.detail}
                            </Typography>
                            <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>{s.time}</Typography>
                          </Box>
                        </Box>
                        {i < signals.length - 1 && <Divider sx={{ ml: 3.75 }} />}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Changes */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <SectionLabel>Across the estate</SectionLabel>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {changes.map((c, i) => (
                      <Box key={c.id}>
                        <Box sx={{ display: 'flex', gap: 1.75, py: 1.75, alignItems: 'flex-start' }}>
                          <Box sx={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: c.type === 'up' ? C.successLight : c.type === 'down' ? C.errorLight : C.grey100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: '1px' }}>
                            {c.type === 'up'
                              ? <TrendingUpRoundedIcon sx={{ fontSize: '1rem', color: C.successDark }} />
                              : c.type === 'down'
                              ? <TrendingDownRoundedIcon sx={{ fontSize: '1rem', color: C.errorMain }} />
                              : <TrendingFlatRoundedIcon sx={{ fontSize: '1rem', color: C.textMuted }} />
                            }
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', mb: 0.35, lineHeight: 1.35 }}>
                              {c.venue}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, lineHeight: 1.5, letterSpacing: '-0.005em', mb: 0.5 }}>
                              {c.text}
                            </Typography>
                            <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>{c.time}</Typography>
                          </Box>
                        </Box>
                        {i < changes.length - 1 && <Divider sx={{ ml: 5.5 }} />}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* ── Metrics ─────────────────────────────────────────────────── */}
        <Box className="fade-in delay-4" sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em' }}>
              Performance snapshot
            </Typography>
            <Select
              value={snapshotRange}
              onChange={(e) => setSnapshotRange(e.target.value as keyof typeof metricsData)}
              size="small"
              sx={{
                fontSize: '0.75rem', fontWeight: 500, color: C.textSecondary, height: 30,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: C.grey300 },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.grey500 },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.grey500, borderWidth: '1px' },
                '& .MuiSelect-select': { py: 0.5, pl: 1.25, pr: '28px !important', fontSize: '0.75rem' },
              }}
            >
              <MenuItem value="this_week"  sx={{ fontSize: '0.8125rem' }}>This week</MenuItem>
              <MenuItem value="last_week"  sx={{ fontSize: '0.8125rem' }}>Last week</MenuItem>
              <MenuItem value="this_month" sx={{ fontSize: '0.8125rem' }}>This month</MenuItem>
              <MenuItem value="last_month" sx={{ fontSize: '0.8125rem' }}>Last month</MenuItem>
            </Select>
          </Box>
          <Grid container spacing={1.5}>
            {metrics.map((m) => (
              <Grid key={m.label} size={{ xs: 12, sm: 6, md: 'grow' }}>
                <Card sx={{ height: '100%', cursor: 'default' }}>
                  <CardContent sx={{ p: '18px !important' }}>
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textMuted, mb: 1.25, display: 'block' }}>
                      {m.label}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                      <Typography sx={{ fontSize: '1.625rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {m.value}
                      </Typography>
                      {(m as typeof m & { starRating?: boolean }).starRating && (
                        <StarRoundedIcon sx={{ fontSize: '0.9375rem', color: '#E8A020', flexShrink: 0 }} />
                      )}
                      {m.delta && (
                        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: m.positive ? C.successDark : C.errorDark, letterSpacing: '0.01em' }}>
                          {m.delta}
                        </Typography>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, letterSpacing: '-0.005em' }}>
                      {m.sub}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── Venue Performance ───────────────────────────────────────── */}
        <Box className="fade-in delay-5" sx={{ mb: 4 }}>
          <Card>
            <CardContent>

              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em', mb: 0.4 }}>
                    House Performance
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: C.textMuted, letterSpacing: '-0.005em' }}>
                    Showing {filteredVenues.length} of {venues.length} houses
                    {activeRegion ? ` · ${activeRegion}` : ''}
                    {activeTier ? ` · ${TIER_STYLE[activeTier].label}` : ''}
                  </Typography>
                </Box>

                {/* Region picker */}
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0 }}>
                  {[{ label: 'All', value: null as string | null, count: venues.length }, ...REGIONS.map(r => ({ label: r, value: r, count: venues.filter(v => v.region === r).length }))].map(({ label, value, count }) => {
                    const isSelected = activeRegion === value;
                    const isDimmed = activeRegion !== null && !isSelected;
                    return (
                      <Box key={label} onClick={() => setActiveRegion(isSelected && value !== null ? null : value)}
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.125, py: 0.5, borderRadius: '99px', cursor: 'pointer', userSelect: 'none',
                          border: `1.5px solid ${isSelected ? C.textPrimary : C.grey300}`,
                          backgroundColor: isSelected ? C.textPrimary : 'transparent',
                          opacity: isDimmed ? 0.4 : 1,
                          transition: 'all 0.15s ease',
                          '&:hover': { opacity: 1, borderColor: C.textPrimary, backgroundColor: isSelected ? C.textPrimary : C.grey100 },
                        }}
                      >
                        <Typography sx={{ fontSize: '0.6875rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? '#fff' : C.textSecondary, lineHeight: 1, letterSpacing: '-0.005em' }}>
                          {label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.5625rem', color: isSelected ? 'rgba(255,255,255,0.65)' : C.textMuted, lineHeight: 1 }}>
                          {count}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              <Grid container spacing={3}>

                {/* Left: Map + tier key + full list */}
                <Grid size={{ xs: 12, md: 7 }}>

                  <Box sx={{ height: 360, borderRadius: '10px', overflow: 'hidden', border: `1px solid rgba(0,0,0,0.06)` }}>
                    {mounted && <VenueMapComponent activeTier={activeTier} activeRegion={activeRegion} />}
                  </Box>

                  {/* Tier filter */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1.5, alignItems: 'center' }}>
                    {(Object.entries(TIER_STYLE) as [Tier, typeof TIER_STYLE[Tier]][]).map(([tier, s]) => {
                      const count = venues.filter(v => v.tier === tier).length;
                      const isSelected = activeTier === tier;
                      const isDimmed = activeTier !== null && !isSelected;
                      return (
                        <Box key={tier} onClick={() => setActiveTier(isSelected ? null : tier)}
                          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.625, px: 1.125, py: 0.5, borderRadius: '99px', cursor: 'pointer', userSelect: 'none',
                            border: `1.5px solid ${isSelected ? s.bg : C.grey300}`,
                            backgroundColor: isSelected ? `${s.bg}14` : 'transparent',
                            opacity: isDimmed ? 0.3 : 1,
                            transition: 'all 0.15s ease',
                            '&:hover': { opacity: 1, borderColor: s.bg, backgroundColor: `${s.bg}0E` },
                          }}
                        >
                          <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: s.bg, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.6875rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? C.textPrimary : C.textSecondary, letterSpacing: '-0.005em', lineHeight: 1 }}>
                            {s.label}
                          </Typography>
                          <Typography sx={{ fontSize: '0.5625rem', color: C.textMuted, lineHeight: 1 }}>{count}</Typography>
                        </Box>
                      );
                    })}
                    {activeTier && (
                      <Box onClick={() => setActiveTier(null)} sx={{ display: 'inline-flex', alignItems: 'center', px: 0.75, py: 0.5, cursor: 'pointer', color: C.textMuted, fontSize: '0.6875rem', borderRadius: '4px', '&:hover': { color: C.textPrimary } }}>
                        × Clear
                      </Box>
                    )}
                  </Box>

                  {/* Show all toggle */}
                  <Button size="small" variant="outlined" onClick={() => setShowVenueList(v => !v)}
                    sx={{ mt: 1.5, color: C.textSecondary, fontSize: '0.75rem', fontWeight: 400, textTransform: 'none', letterSpacing: '-0.005em', borderColor: C.grey300, borderRadius: '6px', py: 0.5, px: 1.5, '&:hover': { borderColor: C.grey500, backgroundColor: 'transparent', color: C.textPrimary } }}
                  >
                    {showVenueList ? '↑ Hide all houses' : `↓ Show all houses (${filteredVenues.length})`}
                  </Button>

                  <Collapse in={showVenueList} timeout={200}>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column' }}>
                      {filteredVenues.length === 0 ? (
                        <Typography sx={{ fontSize: '0.8125rem', color: C.textMuted, py: 1.5, fontStyle: 'italic' }}>No houses match these filters.</Typography>
                      ) : filteredVenues.map((v, i) => {
                        const ts = TIER_STYLE[v.tier as Tier];
                        return (
                          <Box key={v.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.125, borderBottom: i < filteredVenues.length - 1 ? `1px solid ${C.grey100}` : 'none' }}>
                            <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, fontWeight: 600, width: 16, flexShrink: 0, textAlign: 'right' }}>{i + 1}</Typography>
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', width: 100, flexShrink: 0 }}>{v.name}</Typography>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress variant="determinate" value={v.score} sx={{ height: 3, borderRadius: 2, backgroundColor: C.grey100, '& .MuiLinearProgress-bar': { backgroundColor: ts.bg, borderRadius: 2, opacity: 0.7 } }} />
                            </Box>
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: ts.bg, width: 26, flexShrink: 0, textAlign: 'right', letterSpacing: '-0.02em' }}>{v.score}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, width: 34, flexShrink: 0, justifyContent: 'flex-end' }}>
                              <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>{v.satisfaction}</Typography>
                              <StarRoundedIcon sx={{ fontSize: '0.5625rem', color: '#E8A020' }} />
                            </Box>
                            <Box sx={{ width: 14, flexShrink: 0 }}><TrendArrow trend={v.trend} /></Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Collapse>
                </Grid>

                {/* Right: Top performers leaderboard */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.75 }}>
                    <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted }}>
                      Leading the way{activeRegion ? ` · ${activeRegion}` : ''}
                    </Typography>
                    <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted }}>
                      Score
                    </Typography>
                  </Box>

                  {filteredVenues.length === 0 ? (
                    <Typography sx={{ fontSize: '0.8125rem', color: C.textMuted, py: 1.5, fontStyle: 'italic' }}>No houses match.</Typography>
                  ) : filteredVenues.slice(0, 5).map((v, i) => {
                    const ts = TIER_STYLE[v.tier as Tier];
                    return (
                      <Box key={v.name} sx={{ py: 1.375, borderBottom: i < Math.min(filteredVenues.length, 5) - 1 ? `1px solid ${C.grey100}` : 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                          <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, fontWeight: 600, width: 16, flexShrink: 0, textAlign: 'right' }}>{i + 1}</Typography>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{v.name}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                            <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: ts.bg, letterSpacing: '-0.03em', lineHeight: 1 }}>{v.score}</Typography>
                            <TrendArrow trend={v.trend} />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: '28px' }}>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress variant="determinate" value={v.score} sx={{ height: 3, borderRadius: 2, backgroundColor: C.grey100, '& .MuiLinearProgress-bar': { backgroundColor: ts.bg, borderRadius: 2, opacity: 0.65 } }} />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, flexShrink: 0 }}>
                            <Typography sx={{ fontSize: '0.625rem', color: C.textMuted }}>{v.satisfaction}</Typography>
                            <StarRoundedIcon sx={{ fontSize: '0.5rem', color: '#E8A020' }} />
                          </Box>
                          <Chip label={ts.label} size="small" sx={{ height: 14, backgroundColor: ts.bgPastel, color: ts.textPastel, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.02em', '& .MuiChip-label': { px: '5px' } }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Grid>

              </Grid>
            </CardContent>

            {/* Venue Insight — full-width band at card base */}
            <Box sx={{ backgroundColor: '#EDEEFC', px: 3, py: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: '0.5625rem', color: C.purpleDark, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6 }}>
                  ✦ Venue Insight
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', color: C.purpleDark, lineHeight: 1.65, letterSpacing: '-0.01em', fontStyle: 'italic', maxWidth: 680 }}>
                "The houses that shine are the ones that gather before service — no exceptions. Replicating Shoreditch's pre-service ritual at Carnaby and Covent Garden is the single highest-leverage change available right now."
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <Chip label="Shoreditch model"  size="small" sx={{ height: 18, backgroundColor: 'rgba(64,15,102,0.1)', color: C.purpleDark, fontSize: '0.5625rem', fontWeight: 600, '& .MuiChip-label': { px: '8px' } }} />
                <Chip label="2 venues affected" size="small" sx={{ height: 18, backgroundColor: 'rgba(64,15,102,0.1)', color: C.purpleDark, fontSize: '0.5625rem', fontWeight: 600, '& .MuiChip-label': { px: '8px' } }} />
              </Box>
            </Box>
          </Card>
        </Box>

        {/* ── Performance Drivers ─────────────────────────────────────── */}
        <Box className="fade-in delay-6" sx={{ mb: 4 }}>
          <SectionLabel>What moves the needle</SectionLabel>
          <Grid container spacing={2}>
            {drivers.map((d) => (
              <Grid key={d.title} size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                        {d.title}
                      </Typography>
                      <Chip label={d.impact} size="small" sx={{ backgroundColor: d.impact === 'High' ? C.successLight : C.grey100, color: d.impact === 'High' ? C.successDark : C.textSecondary, fontWeight: 600, fontSize: '0.5625rem', letterSpacing: '0.04em', textTransform: 'uppercase', height: 18, '& .MuiChip-label': { px: '6px' } }} />
                    </Box>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 300, color: C.textPrimary, letterSpacing: '-0.02em', lineHeight: 1.2, mb: 1.5 }}>
                      {d.metric}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, lineHeight: 1.6, letterSpacing: '-0.008em', mb: 1.5 }}>
                      {d.insight}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, letterSpacing: '-0.005em' }}>
                      {d.note}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── Menu Highlights ─────────────────────────────────────────── */}
        <Box className="fade-in delay-7" sx={{ mb: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <SectionLabel>What guests are ordering</SectionLabel>
                <Button size="small" variant="text" sx={{ fontSize: '0.75rem', fontWeight: 500, color: C.textSecondary, textTransform: 'none', letterSpacing: '-0.005em', px: 1, minWidth: 0, '&:hover': { backgroundColor: C.grey100, color: C.textPrimary } }}>
                  View all
                </Button>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>

                {/* Left: menu movement */}
                <Box sx={{ width: '42%', flexShrink: 0, pr: 3.5 }}>

                  {/* Trending */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                      Guests are leaning into
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', mb: 3 }}>
                    {(() => {
                      const maxVal = Math.max(...menuData.trending.map(i => parseFloat(i.delta.replace('+', '').replace('%', ''))));
                      return menuData.trending.map((item) => {
                        const val = parseFloat(item.delta.replace('+', '').replace('%', ''));
                        return (
                          <Box key={item.name} sx={{ py: 1.125 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
                              <Typography sx={{ fontSize: '0.8125rem', color: C.textPrimary, letterSpacing: '-0.01em' }}>{item.name}</Typography>
                              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2E7D52', letterSpacing: '-0.01em' }}>{item.delta}</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={(val / maxVal) * 100} sx={{ height: 3, borderRadius: 2, backgroundColor: C.grey100, '& .MuiLinearProgress-bar': { backgroundColor: '#2E7D52', borderRadius: 2 } }} />
                          </Box>
                        );
                      });
                    })()}
                  </Box>

                  {/* Declining */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                      Guests are pulling back on
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {(() => {
                      const maxVal = Math.max(...menuData.declining.map(i => Math.abs(parseFloat(i.delta.replace('−', '-').replace('%', '')))));
                      return menuData.declining.map((item) => {
                        const val = Math.abs(parseFloat(item.delta.replace('−', '-').replace('%', '')));
                        return (
                          <Box key={item.name} sx={{ py: 1.125 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
                              <Typography sx={{ fontSize: '0.8125rem', color: C.textPrimary, letterSpacing: '-0.01em' }}>{item.name}</Typography>
                              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: C.errorMain, letterSpacing: '-0.01em' }}>{item.delta}</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={(val / maxVal) * 100} sx={{ height: 3, borderRadius: 2, backgroundColor: C.grey100, '& .MuiLinearProgress-bar': { backgroundColor: C.errorMain, borderRadius: 2 } }} />
                          </Box>
                        );
                      });
                    })()}
                  </Box>

                </Box>

                <Divider orientation="vertical" flexItem />

                {/* Right: opportunities */}
                <Box sx={{ flex: 1, pl: 3.5, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.purpleDark, mb: 1.75, opacity: 0.7 }}>
                    Opportunities
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {menuData.opportunities.map((o) => (
                      <Box key={o.title} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, backgroundColor: '#F0E6FA', border: '1px solid rgba(208,171,237,0.35)', borderRadius: '10px', p: '13px 15px' }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '7px', backgroundColor: 'rgba(208,171,237,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: '1px' }}>
                          <o.icon sx={{ fontSize: '1rem', color: C.purpleDark }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 0.4 }}>
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.purpleDark, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                              {o.title}
                            </Typography>
                            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: C.purpleDark, opacity: 0.5, letterSpacing: '-0.005em', flexShrink: 0, lineHeight: 1.3, pt: '1px' }}>
                              {o.impact}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.75rem', color: C.purpleDark, lineHeight: 1.55, opacity: 0.75, letterSpacing: '-0.005em' }}>
                            {o.detail}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>

              </Box>
            </CardContent>
          </Card>
        </Box>


      </Box>
    </Box>
  );
}
