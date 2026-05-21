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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Sidebar from '@/components/Sidebar';
import DishoomOpsCard from '@/components/DishoomOpsCard';
import VenueMapComponent from '@/components/VenueMap';
import { TIER_STYLE, type Tier } from '@/components/venueData';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';


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
    detail: 'Three shifts still unfilled this weekend. Saturday dinner and Sunday brunch are most exposed.',
    time: '2 hours ago',    tag: 'Staffing',
    tier: 'good'  as Tier,
    impactNote: 'Up to 380 covers at risk if left unfilled',
    ctaLabel: 'Sort the rota',
  },
  {
    id: 2, severity: 'high' as const,
    venue: 'Covent Garden', title: 'Till sync has stalled',
    detail: 'Last successful sync was 47 minutes ago. Sales figures may be incomplete until this is resolved.',
    time: '47 mins ago',    tag: 'Operations',
    tier: 'risk'  as Tier,
    impactNote: 'Daily sales reporting affected',
    ctaLabel: 'Look into it',
  },
  {
    id: 3, severity: 'medium' as const,
    venue: 'Carnaby',       title: 'Guests not returning',
    detail: "Repeat visits down 12% month-on-month. Satisfaction is holding steady, but something in the experience isn't bringing guests back for a second visit.",
    time: 'This month',     tag: 'Guest',
    tier: 'watch' as Tier,
    impactNote: 'Repeat visits down 12% on the month',
    ctaLabel: 'Dig into this',
  },
];

const changes = [
  { id: 1, type: 'up',   venue: 'Shoreditch',    text: 'The new brunch is landing well. Covers up 18% on the first weekend, guests are leaning in.',                  time: 'Yesterday' },
  { id: 2, type: 'up',   venue: 'Network',       text: 'Cashless nudge is working. Payment adoption up 6% across the estate since the rollout.',                      time: 'Yesterday' },
  { id: 3, type: 'down', venue: 'Covent Garden', text: <>Guest satisfaction has slipped to 3.9<StarRoundedIcon sx={{ fontSize: '0.6rem', color: '#E8A020', verticalAlign: 'middle', position: 'relative', top: '-1px', mx: '1px' }} />, the lowest in the house. Weekend staffing is the likely cause.</>, time: '3 days ago' },
];

const venues = [
  { name: "King's Cross", score: 94, satisfaction: 4.8, trend: 'up',     tier: 'top',   region: 'London',     highlights: ['Pre-service ritual running every shift', 'Cashless payments at 97%', 'Staff retention above 90% this quarter'] },
  { name: 'Shoreditch',   score: 91, satisfaction: 4.7, trend: 'up',     tier: 'top',   region: 'London',     highlights: ['New brunch menu driving repeat visits up 18%', 'Team consistency at a record high', 'Tip conversion leading the estate at 24%'] },
  { name: 'Liverpool St', score: 83, satisfaction: 4.4, trend: 'stable', tier: 'good',  region: 'London',     highlights: ['Lunch service consistently fully booked', 'Payment completion up 3% this month'] },
  { name: 'Manchester',   score: 82, satisfaction: 4.4, trend: 'stable', tier: 'good',  region: 'Manchester', highlights: ['Guest satisfaction steady for six weeks', 'Lowest staff turnover outside London', 'Upsell rate on drinks above network average'] },
  { name: 'Kensington',   score: 80, satisfaction: 4.3, trend: 'stable', tier: 'good',  region: 'London',     highlights: ['Weekend covers up 9% month-on-month', 'Strong return visit rate at 31%'] },
  { name: 'Edinburgh',    score: 79, satisfaction: 4.3, trend: 'stable', tier: 'good',  region: 'Edinburgh',  highlights: ['Highest average spend per head outside London', 'Pre-service ritual adopted last month, scores improving'] },
  { name: 'Battersea',    score: 78, satisfaction: 4.2, trend: 'stable', tier: 'good',  region: 'London',     highlights: ['Cashless adoption jumped 8% after recent push', 'Kitchen and front-of-house NPS aligned'] },
  { name: 'Bristol',      score: 77, satisfaction: 4.2, trend: 'stable', tier: 'good',  region: 'Bristol',    highlights: ['Strongest opening quarter of any new location', 'Local press coverage driving walk-in covers'] },
  { name: 'Birmingham',   score: 74, satisfaction: 4.2, trend: 'down',   tier: 'watch', region: 'Birmingham', highlights: ['Guest satisfaction holding despite staffing pressure', 'Lunch trade outperforming forecast'] },
  { name: 'Carnaby',      score: 71, satisfaction: 4.1, trend: 'down',   tier: 'watch', region: 'London',     highlights: ['Brunch service scores above dinner', 'Payment adoption at 88%, above watch-list average'] },
  { name: 'Covent Garden',score: 65, satisfaction: 4.0, trend: 'down',   tier: 'risk',  region: 'London',     highlights: ['Weekend lunch remains strong despite weekday dip'] },
];

const REGIONS = [...new Set(venues.map(v => v.region))].sort();

const drivers = [
  {
    title: 'Payment Adoption', metric: '91%', metricSub: 'network average', impact: 'High' as const,
    insight: "Every 5% lift in cashless adoption adds roughly 2.3% to revenue per cover. King's Cross and Shoreditch are already above 95%, and the rest have real ground to gain.",
    note: "King's Cross and Shoreditch out in front",
    Icon: PaymentsOutlinedIcon,
  },
  {
    title: 'Team Consistency', metric: '≤15%', metricSub: 'staff turnover target', impact: 'High' as const,
    insight: 'Houses keeping turnover under 15% score 0.4★ higher with guests. A team that knows each other, and knows the menu, brings the hospitality to life in ways a training manual never can.',
    note: '4 of 11 houses in range',
    Icon: GroupsOutlinedIcon,
  },
  {
    title: 'Pre-Service Ritual', metric: '3 of 5', metricSub: 'top venues doing this', impact: 'Medium' as const,
    insight: "The pre-service gather, sharing the stories, the specials, the care behind the food, is the single behaviour most tied to top scores. Shoreditch's model is ready to hand over.",
    note: 'Shoreditch model ready to share',
    Icon: AutoAwesomeOutlinedIcon,
  },
];

const menuData = {
  trending:  [
    { name: 'House Black Daal', delta: '+23%', img: '/images/food/daal.jpg',    orders: 1842 },
    { name: 'Lamb Chops',       delta: '+15%', img: '/images/food/lamb.jpg',    orders: 1340 },
    { name: 'Roomali Roti',     delta: '+8%',  img: '/images/food/roti.jpg',    orders: 983  },
  ],
  declining: [
    { name: 'Chicken Ruby', delta: '−11%', img: '/images/food/chicken.jpg', orders: 612 },
    { name: 'House Salad',  delta: '−7%',  img: '/images/food/salad.jpg',   orders: 448 },
  ],
  opportunities: [
    {
      icon: LocalOfferOutlinedIcon,
      title: 'Naan alongside',
      detail: 'A prompt to add a naan with any main at £2.50. Only 14% of guests are taking one; a well-placed nudge at ordering could more than double that.',
      impact: 'Est. +£8K / month',
    },
    {
      icon: WbSunnyOutlinedIcon,
      title: 'Set brunch menu',
      detail: 'A three-course set at £28, something to savour slowly. Targets the repeat visit gap at Carnaby and Covent Garden with a format guests want to return for.',
      impact: 'Addresses repeat visit decline',
    },
    {
      icon: LocalCafeOutlinedIcon,
      title: 'Chai with dessert',
      detail: 'Complimentary chai with every dessert for loyalty members. A small gesture that makes the end of a meal feel genuinely looked after, and brings guests into the app at almost no cost.',
      impact: 'Boosts loyalty engagement',
    },
    {
      icon: CardGiftcardOutlinedIcon,
      title: 'Birthday dining offer',
      detail: 'A personalised invite for loyalty members in the month of their birthday. Early data from King\'s Cross shows a 34% redemption rate and spend 22% above the average cover.',
      impact: 'Est. +£5K / month',
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

function SectionLabel({ children, aside, action, large }: {
  children: React.ReactNode;
  aside?: React.ReactNode;
  action?: React.ReactNode;
  large?: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography sx={large ? {
        fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em', lineHeight: 1,
      } : {
        fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, lineHeight: 1,
      }}>
        {children}
      </Typography>
      {aside && <Typography sx={{ fontSize: '0.75rem', color: C.textMuted, letterSpacing: '-0.005em' }}>{aside}</Typography>}
      {action}
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
  const [activeTier, setActiveTier] = useState<Tier | null>(null);
  const [expandedVenue, setExpandedVenue] = useState<string | null>(null);
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

      <Box component="main" sx={{ ml: { xs: 0, md: 'var(--sidebar-w, 220px)' }, transition: 'margin-left 0.22s ease', flex: 1, minWidth: 0, px: { xs: 2, sm: 3, md: 4, lg: 5 }, pb: 8 }}>

        {/* ── Greeting ────────────────────────────────────────────────── */}
        <Box className="fade-in delay-1" sx={{ pt: 5.5, pb: 4 }}>
          <Typography variant="h3" sx={{ color: C.textPrimary, mb: 1, fontWeight: 500 }}>
            Good morning, Marcus.
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: C.textMuted, letterSpacing: '-0.005em' }}>
            Morning briefing · 11 locations · Lunch service in 2h
          </Typography>
        </Box>

        {/* ── Status banner ────────────────────────────────────────────── */}
        <Box className="fade-in delay-2" sx={{ mb: 3 }}>
          <DishoomOpsCard />
        </Box>

        {/* ── Priority Signals + Recent Changes ───────────────────────── */}
        <Box className="fade-in delay-3" sx={{ mb: 4 }}>
          <SectionLabel large>What matters today</SectionLabel>

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
                  <SectionLabel>Across venues</SectionLabel>
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
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em', lineHeight: 1 }}>
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
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-start' }, justifyContent: 'space-between', mb: 2.5, gap: { xs: 1.5, sm: 2 } }}>
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
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: { xs: 'nowrap', sm: 'wrap' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' }, flexShrink: 0, overflowX: { xs: 'auto', sm: 'visible' }, pb: { xs: 0.5, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
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

                  {/* Map with overlaid legend */}
                  <Box sx={{ position: 'relative', height: 360, borderRadius: '10px', overflow: 'hidden', border: `1px solid rgba(0,0,0,0.06)` }}>
                    {mounted && <VenueMapComponent activeTier={activeTier} activeRegion={activeRegion} />}

                    {/* Floating tier legend */}
                    <Box sx={{
                      position: 'absolute', bottom: 12, left: 12,
                      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0, zIndex: 1000,
                      bgcolor: '#fff', borderRadius: '99px',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
                      px: 0.5, py: 0.5,
                      maxWidth: 'calc(100% - 24px)',
                    }}>
                      {(Object.entries(TIER_STYLE) as [Tier, typeof TIER_STYLE[Tier]][]).map(([tier, s], idx, arr) => {
                        const count = venues.filter(v => v.tier === tier).length;
                        const isSelected = activeTier === tier;
                        const isDimmed = activeTier !== null && !isSelected;
                        return (
                          <Box key={tier} onClick={() => setActiveTier(isSelected ? null : tier)}
                            sx={{
                              display: 'inline-flex', alignItems: 'center', gap: 0.75,
                              px: 1.25, py: 0.625, borderRadius: '99px',
                              cursor: 'pointer', userSelect: 'none',
                              bgcolor: isSelected ? `${s.bg}12` : 'transparent',
                              opacity: isDimmed ? 0.35 : 1,
                              transition: 'all 0.15s ease',
                              '&:hover': { opacity: 1, bgcolor: `${s.bg}0E` },
                            }}
                          >
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.bg, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: '0.6875rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? C.textPrimary : C.textSecondary, letterSpacing: '-0.005em', lineHeight: 1, whiteSpace: 'nowrap' }}>
                              {s.label}
                            </Typography>
                            <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: isSelected ? s.bg : C.textMuted, lineHeight: 1 }}>
                              {count}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Hint text */}
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, letterSpacing: '-0.005em' }}>
                      Select a tier to filter the map and leaderboard
                    </Typography>
                    {activeTier && (
                      <Typography onClick={() => setActiveTier(null)} sx={{ fontSize: '0.6875rem', color: C.textSecondary, cursor: 'pointer', ml: 0.5, '&:hover': { color: C.textPrimary } }}>
                        · Clear
                      </Typography>
                    )}
                  </Box>

                </Grid>

                {/* Right: Top performers leaderboard */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.75 }}>
                    <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted }}>
                      Leading the way{activeRegion ? ` · ${activeRegion}` : ''}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted }}>
                        Score
                      </Typography>
                      <Tooltip
                        title={
                          <Box sx={{ p: 0.5, maxWidth: 220 }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.75 }}>How the score is calculated</Typography>
                            <Typography sx={{ fontSize: '0.6875rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.8)' }}>
                              A composite of guest satisfaction (40%), payment completion (25%), tip conversion (20%), and operational health (15%). Updated weekly.
                            </Typography>
                          </Box>
                        }
                        placement="left"
                        arrow
                      >
                        <InfoOutlinedIcon sx={{ fontSize: '0.75rem', color: C.textMuted, cursor: 'default', '&:hover': { color: C.textSecondary } }} />
                      </Tooltip>
                    </Box>
                  </Box>

                  {filteredVenues.length === 0 ? (
                    <Typography sx={{ fontSize: '0.8125rem', color: C.textMuted, py: 1.5, fontStyle: 'italic' }}>No houses match.</Typography>
                  ) : filteredVenues.slice(0, 5).map((v, i) => {
                    const ts = TIER_STYLE[v.tier as Tier];
                    const isOpen = expandedVenue === v.name;
                    return (
                      <Box key={v.name} sx={{ borderBottom: i < Math.min(filteredVenues.length, 5) - 1 ? `1px solid ${C.grey100}` : 'none' }}>
                        <Box
                          onClick={() => setExpandedVenue(isOpen ? null : v.name)}
                          sx={{ py: 1.375, cursor: 'pointer', '&:hover': { '& .venue-name': { color: C.textPrimary } } }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                            <Box sx={{ width: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25 }}>
                              <ExpandMoreRoundedIcon sx={{ fontSize: '0.9375rem', color: C.textMuted, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }} />
                              <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, fontWeight: 600, lineHeight: 1 }}>{i + 1}</Typography>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography className="venue-name" sx={{ fontSize: '0.8125rem', fontWeight: 500, color: isOpen ? C.textPrimary : C.textSecondary, letterSpacing: '-0.01em', lineHeight: 1.2, transition: 'color 0.15s' }}>{v.name}</Typography>
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
                        <Collapse in={isOpen} timeout={180}>
                          <Box sx={{ pl: '28px', pb: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            {(v as typeof v & { highlights?: string[] }).highlights?.map((h) => (
                              <Box key={h} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.875 }}>
                                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: ts.bg, mt: '5px', flexShrink: 0, opacity: 0.7 }} />
                                <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, lineHeight: 1.5, letterSpacing: '-0.005em' }}>{h}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Grid>

              </Grid>
            </CardContent>

          </Card>
        </Box>

        {/* ── Performance Drivers ─────────────────────────────────────── */}
        <Box className="fade-in delay-6" sx={{ mb: 4 }}>
          <SectionLabel large>Performance levers</SectionLabel>
          <Grid container spacing={2}>
            {drivers.map((d) => {
              const isHigh = d.impact === 'High';
              return (
                <Grid key={d.title} size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: '20px !important' }}>

                      {/* Header: icon + title + impact */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
                            bgcolor: isHigh ? C.successLight : C.grey100,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <d.Icon sx={{ fontSize: '1rem', color: isHigh ? C.successMain : C.textSecondary }} />
                          </Box>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                            {d.title}
                          </Typography>
                        </Box>
                        <Chip
                          label={d.impact}
                          size="small"
                          sx={{
                            height: 18, flexShrink: 0, ml: 1,
                            bgcolor: isHigh ? C.successLight : C.grey100,
                            color: isHigh ? C.successDark : C.textSecondary,
                            fontWeight: 600, fontSize: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                            '& .MuiChip-label': { px: '6px' },
                          }}
                        />
                      </Box>

                      {/* Metric callout */}
                      <Box sx={{ mb: 2, pb: 2, borderBottom: `1px solid ${C.grey300}` }}>
                        <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.04em', lineHeight: 1, mb: 0.25 }}>
                          {d.metric}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, letterSpacing: '-0.005em' }}>
                          {d.metricSub}
                        </Typography>
                      </Box>

                      {/* Insight */}
                      <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, lineHeight: 1.6, letterSpacing: '-0.008em', flex: 1 }}>
                        {d.insight}
                      </Typography>

                      {/* Note */}
                      <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${C.grey100}`, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: isHigh ? C.successMain : C.textMuted, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, letterSpacing: '-0.005em' }}>
                          {d.note}
                        </Typography>
                      </Box>

                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* ── Menu Highlights ─────────────────────────────────────────── */}
        <Box className="fade-in delay-7" sx={{ mb: 4 }}>
          <SectionLabel large action={
            <Button size="small" variant="text" sx={{ fontSize: '0.75rem', fontWeight: 500, color: C.textSecondary, textTransform: 'none', letterSpacing: '-0.005em', px: 1, minWidth: 0, '&:hover': { backgroundColor: C.grey100, color: C.textPrimary } }}>
              View all
            </Button>
          }>What guests are ordering</SectionLabel>
          <Card>
            <CardContent sx={{ p: '20px !important' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch', gap: 0 }}>

                {/* Left: menu movement */}
                <Box sx={{ width: { xs: '100%', md: '42%' }, flexShrink: 0, pr: { xs: 0, md: 3 }, pb: { xs: 3, md: 0 } }}>

                  {/* Trending up */}
                  <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, lineHeight: 1, mb: 1.5 }}>
                    Trending up
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {(() => {
                      const maxVal = Math.max(...menuData.trending.map(i => parseFloat(i.delta.replace('+', '').replace('%', ''))));
                      return menuData.trending.map((item) => {
                        const val = parseFloat(item.delta.replace('+', '').replace('%', ''));
                        return (
                          <Box key={item.name} sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Box component="img" src={item.img} alt={item.name} sx={{ width: 36, height: 36, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.25 }}>
                                <Typography sx={{ fontSize: '0.8125rem', color: C.textPrimary, letterSpacing: '-0.01em', fontWeight: 500 }}>{item.name}</Typography>
                                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2E7D52', letterSpacing: '-0.01em' }}>{item.delta}</Typography>
                              </Box>
                              <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, letterSpacing: '-0.005em', mb: 0.625 }}>{item.orders.toLocaleString()} orders</Typography>
                              <LinearProgress variant="determinate" value={(val / maxVal) * 100} sx={{ height: 3, borderRadius: 2, backgroundColor: C.grey100, '& .MuiLinearProgress-bar': { backgroundColor: '#2E7D52', borderRadius: 2 } }} />
                            </Box>
                          </Box>
                        );
                      });
                    })()}
                  </Box>

                  {/* Trending down */}
                  <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, lineHeight: 1, mb: 1.5, mt: 2.5 }}>
                    Trending down
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {(() => {
                      const maxVal = Math.max(...menuData.declining.map(i => Math.abs(parseFloat(i.delta.replace('−', '-').replace('%', '')))));
                      return menuData.declining.map((item) => {
                        const val = Math.abs(parseFloat(item.delta.replace('−', '-').replace('%', '')));
                        return (
                          <Box key={item.name} sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Box component="img" src={item.img} alt={item.name} sx={{ width: 36, height: 36, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.25 }}>
                                <Typography sx={{ fontSize: '0.8125rem', color: C.textPrimary, letterSpacing: '-0.01em', fontWeight: 500 }}>{item.name}</Typography>
                                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: C.errorMain, letterSpacing: '-0.01em' }}>{item.delta}</Typography>
                              </Box>
                              <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, letterSpacing: '-0.005em', mb: 0.625 }}>{item.orders.toLocaleString()} orders</Typography>
                              <LinearProgress variant="determinate" value={(val / maxVal) * 100} sx={{ height: 3, borderRadius: 2, backgroundColor: C.grey100, '& .MuiLinearProgress-bar': { backgroundColor: C.errorMain, borderRadius: 2 } }} />
                            </Box>
                          </Box>
                        );
                      });
                    })()}
                  </Box>

                </Box>

                <Divider orientation="vertical" flexItem sx={{ borderColor: C.grey300, display: { xs: 'none', md: 'block' } }} />
                <Divider sx={{ borderColor: C.grey300, display: { xs: 'block', md: 'none' } }} />

                {/* Right: opportunities */}
                <Box sx={{ flex: 1, pl: { xs: 0, md: 3 }, pt: { xs: 3, md: 0 }, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, lineHeight: 1, mb: 1.5 }}>
                    Opportunities
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {menuData.opportunities.map((o) => (
                      <Box key={o.title} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, backgroundColor: C.grey100, border: `1px solid ${C.grey300}`, borderRadius: '10px', p: '12px 14px' }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: '7px', backgroundColor: '#fff', border: `1px solid ${C.grey300}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: '1px' }}>
                          <o.icon sx={{ fontSize: '0.9375rem', color: C.textSecondary }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 0.375 }}>
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                              {o.title}
                            </Typography>
                            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 500, color: C.textMuted, letterSpacing: '-0.005em', flexShrink: 0, lineHeight: 1.3, pt: '1px' }}>
                              {o.impact}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, lineHeight: 1.55, letterSpacing: '-0.005em' }}>
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
