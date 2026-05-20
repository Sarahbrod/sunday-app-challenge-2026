'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
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
import Sidebar from '@/components/Sidebar';
import { TIER_STYLE, type Tier } from '@/components/VenueMap';

const VenueMap = dynamic(() => import('@/components/VenueMap'), { ssr: false });

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

const metrics = [
  { label: 'Total Sales',          value: '£1.42M', delta: '+8%',  positive: true,  sub: 'this month' },
  { label: 'Payment Completion',   value: '91%',    delta: '+3%',  positive: true,  sub: 'vs last month' },
  { label: 'Tip Conversion',       value: '18%',    delta: '−2%',  positive: false, sub: 'vs last month' },
  { label: 'Guest Satisfaction',   value: '4.6★',   delta: null,   positive: null,  sub: 'avg rating' },
  { label: 'Operational Health',   value: 'Good',   delta: null,   positive: null,  sub: 'network status' },
];

const signals = [
  {
    id: 1, severity: 'high' as const,
    venue: 'Edinburgh',     title: 'Staffing gap',
    detail: '3 unfilled shifts across this weekend; Saturday dinner and Sunday brunch are most exposed.',
    time: '2 hours ago',    tag: 'Staffing',
  },
  {
    id: 2, severity: 'high' as const,
    venue: 'Covent Garden', title: 'POS sync delayed',
    detail: 'Last successful sync was 47 minutes ago. Sales data may be incomplete for this period.',
    time: '47 mins ago',    tag: 'Operations',
  },
  {
    id: 3, severity: 'medium' as const,
    venue: 'Carnaby',       title: 'Declining repeat visits',
    detail: 'Repeat guest rate down 12% month-on-month. Satisfaction scores remain stable, suggesting a possible experience gap.',
    time: 'This month',     tag: 'Guest',
  },
];

const changes = [
  { id: 1, type: 'up',   venue: 'Shoreditch',    text: 'Brunch menu launch showing strong early uptake. Cover count up 18% on first weekend.',                       time: 'Today' },
  { id: 2, type: 'up',   venue: 'Network',       text: 'Payment adoption up 6% across the estate following cashless nudge rollout.',                                 time: 'Yesterday' },
  { id: 3, type: 'down', venue: 'Covent Garden', text: 'Guest satisfaction fell to 3.9★ this week, the lowest in the network. Linked to weekend staffing shortfalls.', time: '3 days ago' },
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
    insight: 'Every 5% increase in cashless adoption corresponds to +2.3% revenue per cover. Top venues are already above 95%.',
    note: "King's Cross and Shoreditch leading",
  },
  {
    title: 'Team Consistency', metric: '≤15% staff turnover', impact: 'High',
    insight: 'Venues holding turnover below 15% rate an average 0.4★ higher in guest satisfaction. Teams that know each other create measurably better service.',
    note: '4 of 8 venues in target range',
  },
  {
    title: 'Pre-Service Ritual', metric: '3 of 5 top venues', impact: 'Medium',
    insight: "Daily team briefing is the single most correlated behaviour with top performance. Shoreditch's pre-service model is directly replicable.",
    note: 'Shoreditch model documented',
  },
];

const menuData = {
  trending:  [{ name: 'House Black Daal', delta: '+23%' }, { name: 'Lamb Chops', delta: '+15%' }, { name: 'Roomali Roti', delta: '+8%' }],
  declining: [{ name: 'Chicken Ruby', delta: '−11%' }, { name: 'House Salad', delta: '−7%' }],
  opportunities: [
    {
      title: 'Naan bundle',
      detail: 'Add a prompted naan side to any main at £2.50. Current attach rate is 14%; a nudge at ordering could push this above 25%.',
      impact: 'Est. +£8K / month',
    },
    {
      title: 'Weekend brunch set',
      detail: 'A fixed 3-course brunch at £28 targets the repeat visit gap at Carnaby and Covent Garden. High-margin, experience-led format.',
      impact: 'Addresses repeat visit decline',
    },
    {
      title: 'Chai & dessert pairing',
      detail: 'Complimentary chai with any dessert for loyalty members. Drives dessert attachment and loyalty app sign-ups at low incremental cost.',
      impact: 'Boosts loyalty engagement',
    },
  ],
};

const actions = [
  {
    urgency: 'Urgent', tag: 'Staffing',
    title:  'Address Edinburgh weekend staffing',
    detail: 'Three unfilled shifts risk service quality at a high-visibility venue. Approve overtime for existing team and escalate to regional agency contact.',
    impact: 'Prevents service failure across ~380 covers',
  },
  {
    urgency: 'Urgent', tag: 'Operations',
    title:  'Investigate Covent Garden POS sync',
    detail: 'A 47-minute gap means incomplete sales data and potential reconciliation issues at daily close. Contact venue manager and IT support.',
    impact: 'Restores data integrity for daily close',
  },
  {
    urgency: 'This week', tag: 'Training',
    title:  'Replicate Shoreditch briefing ritual at Carnaby',
    detail: "Three of the top five venues run a structured daily pre-service briefing. Carnaby's guest experience scores could recover with this intervention alone.",
    impact: 'Est. +0.3★ satisfaction over 30 days',
  },
  {
    urgency: 'This week', tag: 'Commercial',
    title:  'Push payment adoption to bottom three venues',
    detail: 'Birmingham, Carnaby, and Covent Garden are below the 82% cashless threshold, the level above which measurable revenue uplift becomes consistent.',
    impact: 'Est. +£12K / month across venues',
  },
];

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
  const [showVenueList, setShowVenueList] = useState(false);
  const [activeTier, setActiveTier] = useState<Tier | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>('London');

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
          <Typography sx={{ fontSize: '0.875rem', color: C.textMuted, letterSpacing: '-0.005em', mb: 2.5 }}>
            Wednesday, 20 May 2026 · Morning briefing · 8 Dishoom locations
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label="Network on target"       size="small" sx={{ backgroundColor: C.successLight, color: C.successDark, fontWeight: 500, fontSize: '0.6875rem' }} />
            <Chip label="3 items need attention"  size="small" sx={{ backgroundColor: C.errorLight,   color: C.errorDark,   fontWeight: 500, fontSize: '0.6875rem' }} />
          </Box>
        </Box>

        {/* ── Metrics ─────────────────────────────────────────────────── */}
        <Box className="fade-in delay-2" sx={{ mb: 4 }}>
          <Grid container spacing={1.5}>
            {metrics.map((m) => (
              <Grid key={m.label} size={{ xs: 12, sm: 6, md: 'grow' }}>
                <Card sx={{ height: '100%', cursor: 'default' }}>
                  <CardContent sx={{ p: '18px !important' }}>
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textMuted, mb: 1.25, display: 'block' }}>
                      {m.label}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mb: 0.5 }}>
                      <Typography sx={{ fontSize: '1.625rem', fontWeight: 300, color: C.textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {m.value}
                      </Typography>
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

        {/* ── Priority Signals + Recent Changes ───────────────────────── */}
        <Box className="fade-in delay-3" sx={{ mb: 4 }}>
          <Grid container spacing={2}>

            {/* Priority Signals */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <SectionLabel aside="3 items">Priority Signals</SectionLabel>
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
                  <SectionLabel>Recent Changes</SectionLabel>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {changes.map((c, i) => (
                      <Box key={c.id}>
                        <Box sx={{ display: 'flex', gap: 1.75, py: 1.75 }}>
                          <Box sx={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: c.type === 'up' ? C.successLight : c.type === 'down' ? C.errorLight : C.grey100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.1 }}>
                            <Typography sx={{ fontSize: '0.5625rem', color: c.type === 'up' ? C.successDark : c.type === 'down' ? C.errorMain : C.textMuted, lineHeight: 1, fontWeight: 700 }}>
                              {c.type === 'up' ? '↑' : c.type === 'down' ? '↓' : '→'}
                            </Typography>
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
                        {i < changes.length - 1 && <Divider sx={{ ml: 4.25 }} />}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* ── Venue Performance ───────────────────────────────────────── */}
        <Box className="fade-in delay-4" sx={{ mb: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted }}>
                  Venue Performance
                </Typography>
                {/* Region picker */}
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* All chip */}
                  <Box
                    onClick={() => setActiveRegion(null)}
                    sx={{
                      display: 'inline-flex', alignItems: 'center', gap: 0.6,
                      px: 1.25, py: 0.5, borderRadius: '99px', cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: activeRegion === null ? C.textSecondary : 'transparent',
                      backgroundColor: activeRegion === null ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.04)',
                      opacity: activeRegion !== null ? 0.45 : 1,
                      transition: 'all 0.15s ease', userSelect: 'none',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.07)', opacity: 1 },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.6875rem', fontWeight: activeRegion === null ? 600 : 400, color: activeRegion === null ? C.textPrimary : C.textSecondary, letterSpacing: '-0.005em', lineHeight: 1 }}>
                      All
                    </Typography>
                    <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, lineHeight: 1 }}>
                      {venues.length}
                    </Typography>
                  </Box>

                  {REGIONS.map(region => {
                    const count = venues.filter(v => v.region === region).length;
                    const isSelected = activeRegion === region;
                    const isDimmed = activeRegion !== null && !isSelected;
                    return (
                      <Box
                        key={region}
                        onClick={() => setActiveRegion(isSelected ? null : region)}
                        sx={{
                          display: 'inline-flex', alignItems: 'center', gap: 0.6,
                          px: 1.25, py: 0.5, borderRadius: '99px', cursor: 'pointer',
                          border: '1.5px solid',
                          borderColor: isSelected ? C.textSecondary : 'transparent',
                          backgroundColor: isSelected ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.04)',
                          opacity: isDimmed ? 0.45 : 1,
                          transition: 'all 0.15s ease', userSelect: 'none',
                          '&:hover': { backgroundColor: isSelected ? 'rgba(0,0,0,0.09)' : 'rgba(0,0,0,0.07)', opacity: 1 },
                        }}
                      >
                        <Typography sx={{ fontSize: '0.6875rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? C.textPrimary : C.textSecondary, letterSpacing: '-0.005em', lineHeight: 1 }}>
                          {region}
                        </Typography>
                        <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, lineHeight: 1 }}>
                          {count}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              <Grid container spacing={3}>

                {/* Left: Map + key + insight + toggle + full list */}
                <Grid size={{ xs: 12, md: 7 }}>

                  {/* Map */}
                  <Box sx={{ height: 360, borderRadius: '10px', overflow: 'hidden', border: `1px solid rgba(0,0,0,0.06)` }}>
                    <VenueMap activeTier={activeTier} activeRegion={activeRegion} />
                  </Box>

                  {/* Interactive key */}
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1.5, mb: 1.5, alignItems: 'center' }}>
                    {(Object.entries(TIER_STYLE) as [Tier, typeof TIER_STYLE[Tier]][]).map(([tier, s]) => {
                      const count = venues.filter(v => v.tier === tier).length;
                      const isSelected = activeTier === tier;
                      const isDimmed = activeTier !== null && !isSelected;
                      return (
                        <Box
                          key={tier}
                          onClick={() => setActiveTier(isSelected ? null : tier)}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.25,
                            py: 0.625,
                            borderRadius: '99px',
                            cursor: 'pointer',
                            border: '1.5px solid',
                            borderColor: isSelected ? s.bg : 'transparent',
                            backgroundColor: isSelected ? `${s.bg}18` : 'rgba(0,0,0,0.04)',
                            opacity: isDimmed ? 0.32 : 1,
                            transition: 'opacity 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
                            userSelect: 'none',
                            '&:hover': {
                              opacity: isDimmed ? 0.6 : 1,
                              backgroundColor: isSelected ? `${s.bg}22` : `${s.bg}12`,
                              borderColor: isSelected ? s.bg : `${s.bg}60`,
                            },
                          }}
                        >
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.bg, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.6875rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? C.textPrimary : C.textSecondary, letterSpacing: '-0.005em', lineHeight: 1, transition: 'all 0.15s ease' }}>
                            {s.label}
                          </Typography>
                          <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, lineHeight: 1 }}>
                            {count}
                          </Typography>
                        </Box>
                      );
                    })}
                    {activeTier && (
                      <Box
                        onClick={() => setActiveTier(null)}
                        sx={{ display: 'inline-flex', alignItems: 'center', px: 0.75, py: 0.625, cursor: 'pointer', color: C.textMuted, fontSize: '0.6875rem', borderRadius: '4px', transition: 'color 0.12s ease', '&:hover': { color: C.textPrimary } }}
                      >
                        × All
                      </Box>
                    )}
                  </Box>

                  {/* Toggle */}
                  <Button
                    size="small"
                    onClick={() => setShowVenueList(v => !v)}
                    sx={{ color: C.textSecondary, fontSize: '0.75rem', fontWeight: 400, px: 0, '&:hover': { backgroundColor: 'transparent', color: C.textPrimary } }}
                  >
                    {showVenueList ? '↑ Hide all venues' : '↓ Show all venues'}
                  </Button>

                  <Collapse in={showVenueList} timeout={200}>
                    <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column' }}>
                      {filteredVenues.length === 0 ? (
                        <Typography sx={{ fontSize: '0.8125rem', color: C.textMuted, py: 1.5, fontStyle: 'italic' }}>
                          No venues match the current filters.
                        </Typography>
                      ) : filteredVenues.map((v, i) => (
                        <Box key={v.name} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.25, borderBottom: i < filteredVenues.length - 1 ? `1px solid ${C.grey100}` : 'none' }}>
                          <Typography sx={{ fontSize: '0.6875rem', color: C.grey300, fontWeight: 500, width: 16, flexShrink: 0, textAlign: 'right' }}>
                            {i + 1}
                          </Typography>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', width: 110, flexShrink: 0 }}>
                            {v.name}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress variant="determinate" value={v.score} sx={{ '& .MuiLinearProgress-bar': { backgroundColor: TIER[v.tier], opacity: 0.75 } }} />
                          </Box>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: TIER[v.tier], width: 28, flexShrink: 0, textAlign: 'right' }}>
                            {v.score}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: C.textMuted, width: 36, flexShrink: 0, textAlign: 'right' }}>
                            {v.satisfaction}★
                          </Typography>
                          <Box sx={{ width: 16, flexShrink: 0, textAlign: 'center' }}>
                            <TrendArrow trend={v.trend} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </Grid>

                {/* Right: Top 5 */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, mb: 1.5 }}>
                    Top Performers{activeRegion ? ` · ${activeRegion}` : ''}
                  </Typography>
                  {filteredVenues.length === 0 ? (
                    <Typography sx={{ fontSize: '0.8125rem', color: C.textMuted, py: 1.5, fontStyle: 'italic' }}>
                      No venues match.
                    </Typography>
                  ) : filteredVenues.slice(0, 5).map((v, i) => {
                    const ts = TIER_STYLE[v.tier as keyof typeof TIER_STYLE];
                    return (
                      <Box
                        key={v.name}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          py: 1.5,
                          borderBottom: i < Math.min(filteredVenues.length, 5) - 1 ? `1px solid ${C.grey100}` : 'none',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.6875rem', color: C.grey300, fontWeight: 500, width: 14, flexShrink: 0, textAlign: 'right' }}>
                          {i + 1}
                        </Typography>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                            {v.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.35 }}>
                            <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>
                              {v.satisfaction}★
                            </Typography>
                            <TrendArrow trend={v.trend} />
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography sx={{ fontSize: '1.375rem', fontWeight: 300, color: TIER[v.tier], letterSpacing: '-0.03em', lineHeight: 1 }}>
                            {v.score}
                          </Typography>
                          <Chip
                            label={ts.label}
                            size="small"
                            sx={{
                              mt: 0.4,
                              height: 16,
                              backgroundColor: ts.bgPastel,
                              color: ts.textPastel,
                              fontSize: '0.5625rem',
                              fontWeight: 600,
                              letterSpacing: '0.02em',
                              '& .MuiChip-label': { px: '6px' },
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Grid>

              </Grid>
            </CardContent>

            {/* Network Insight — full-width blue band at card base */}
            <Box sx={{ backgroundColor: '#2D3482', px: 3, py: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: '0.5625rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  ✦ Network Insight
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.92)', lineHeight: 1.65, letterSpacing: '-0.01em', fontStyle: 'italic', maxWidth: 680 }}>
                "High-performing sites consistently front-load team briefings before each service. Consider replicating Shoreditch's pre-service ritual at Carnaby and Covent Garden. It's the highest-leverage operational change available this month."
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <Chip label="Shoreditch model"  size="small" sx={{ height: 18, backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: '0.5625rem', fontWeight: 600, '& .MuiChip-label': { px: '8px' } }} />
                <Chip label="2 venues affected" size="small" sx={{ height: 18, backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: '0.5625rem', fontWeight: 600, '& .MuiChip-label': { px: '8px' } }} />
              </Box>
            </Box>
          </Card>
        </Box>

        {/* ── Performance Drivers ─────────────────────────────────────── */}
        <Box className="fade-in delay-5" sx={{ mb: 4 }}>
          <SectionLabel>Performance Drivers</SectionLabel>
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
        <Box className="fade-in delay-6" sx={{ mb: 4 }}>
          <Card>
            <CardContent>
              <SectionLabel>Menu Highlights</SectionLabel>
              <Grid container spacing={3}>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.successDark, mb: 1.25 }}>
                    Trending ↑
                  </Typography>
                  {menuData.trending.map((item) => (
                    <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, borderBottom: `1px solid ${C.grey100}` }}>
                      <Typography sx={{ fontSize: '0.8125rem', color: C.textPrimary, letterSpacing: '-0.01em' }}>{item.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.successDark, letterSpacing: '0.01em' }}>{item.delta}</Typography>
                    </Box>
                  ))}
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.errorDark, mb: 1.25 }}>
                    Declining ↓
                  </Typography>
                  {menuData.declining.map((item) => (
                    <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, borderBottom: `1px solid ${C.grey100}` }}>
                      <Typography sx={{ fontSize: '0.8125rem', color: C.textPrimary, letterSpacing: '-0.01em' }}>{item.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.errorMain, letterSpacing: '0.01em' }}>{item.delta}</Typography>
                    </Box>
                  ))}
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ borderTop: `1px solid ${C.grey100}`, pt: 2.5 }}>
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.warmDark, mb: 2 }}>
                      Opportunities
                    </Typography>
                    <Grid container spacing={2}>
                      {menuData.opportunities.map((o) => (
                        <Grid key={o.title} size={{ xs: 12, sm: 4 }}>
                          <Box sx={{ backgroundColor: C.warmLight, border: `1px solid rgba(240,182,128,0.25)`, borderRadius: '8px', p: 1.75, height: '100%' }}>
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.warmDark, letterSpacing: '-0.01em', mb: 0.75 }}>
                              {o.title}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8125rem', color: C.warmDark, lineHeight: 1.6, letterSpacing: '-0.008em', mb: 1.25, opacity: 0.85 }}>
                              {o.detail}
                            </Typography>
                            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: C.warmDark, letterSpacing: '-0.005em', opacity: 0.7 }}>
                              {o.impact}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>

              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <Box className="fade-in delay-7">
          <SectionLabel aside="4 recommendations">Actions</SectionLabel>
          <Grid container spacing={2}>
            {actions.map((a) => {
              const urgent = a.urgency === 'Urgent';
              return (
                <Grid key={a.title} size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: '100%', backgroundColor: urgent ? '#FFFBFB' : '#FFFFFF', border: urgent ? `1px solid rgba(231,113,113,0.18)` : `1px solid rgba(0,0,0,0.045)` }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.25 }}>
                        <Chip label={a.urgency} size="small" sx={{ backgroundColor: urgent ? C.errorLight : C.grey100, color: urgent ? C.errorDark : C.textSecondary, fontWeight: 700, fontSize: '0.5625rem', letterSpacing: '0.05em', textTransform: 'uppercase', height: 18, '& .MuiChip-label': { px: '6px' } }} />
                        <Chip label={a.tag} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.5625rem', letterSpacing: '0.04em', fontWeight: 600, textTransform: 'uppercase', borderColor: C.grey300, color: C.textMuted, '& .MuiChip-label': { px: '6px' } }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.015em', lineHeight: 1.35, mb: 1 }}>
                        {a.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, lineHeight: 1.6, letterSpacing: '-0.008em', mb: 1.75 }}>
                        {a.detail}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, pt: 1.5, borderTop: `1px solid ${C.grey100}` }}>
                        <Typography sx={{ fontSize: '0.75rem', color: C.textMuted, letterSpacing: '-0.005em', fontStyle: 'italic', flex: 1 }}>
                          {a.impact}
                        </Typography>
                        <Button size="small" variant={urgent ? 'contained' : 'outlined'} sx={{ flexShrink: 0, ...(urgent ? { backgroundColor: C.errorDark, color: '#FFFFFF', '&:hover': { backgroundColor: '#8B0F2A' } } : { borderColor: C.grey300, color: C.textSecondary, '&:hover': { borderColor: C.grey500, backgroundColor: C.grey100 } }) }}>
                          Take action
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

      </Box>
    </Box>
  );
}
