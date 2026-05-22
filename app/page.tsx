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
import WineBarOutlinedIcon from '@mui/icons-material/WineBarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';


const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildSparkPath(pts: number[], w = 100, h = 28): string {
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  const coords = pts.map((p, i) => ({
    x: (i / (pts.length - 1)) * w,
    y: h - ((p - min) / range) * h * 0.7 - h * 0.15,
  }));
  return coords.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = coords[i - 1];
    const cx = ((prev.x + p.x) / 2).toFixed(1);
    return `${acc} C${cx},${prev.y.toFixed(1)} ${cx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }, '');
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const perfMetrics = [
  {
    label:        'Revenue pacing',
    value:        '£342K',
    contextLabel: 'this week',
    delta:        '+6%',
    positive:     true  as true,
    bottomLine:   '£2.1M MTD',
    spark:        [58, 54, 62, 57, 66, 61, 68, 64, 71, 68],
  },
  {
    label:        'Labour status',
    value:        '18%',
    contextLabel: 'vs target',
    delta:        '−1%',
    positive:     false as false,
    bottomLine:   '+£1.2k risk today',
    spark:        [14, 16, 15, 17, 16, 18, 17, 19, 18, 18],
  },
  {
    label:        'Guest satisfaction',
    value:        '4.6',
    contextLabel: '',
    delta:        '+0.2',
    positive:     true  as true,
    bottomLine:   'vs last week',
    starRating:   true  as true,
    spark:        null  as null,
  },
  {
    label:        'Payment completion',
    value:        '91%',
    contextLabel: 'completion',
    delta:        '+2%',
    positive:     true  as true,
    bottomLine:   '89% last week',
    spark:        [80, 83, 82, 85, 84, 87, 88, 89, 90, 91],
  },
  {
    label:        'Forecast (week)',
    value:        '£640K',
    contextLabel: 'forecast sales',
    delta:        null  as null,
    positive:     null  as null,
    bottomLine:   'High labour pressure · Saturday dinner',
    spark:        null  as null,
  },
];

const signals = [
  {
    id: 1, severity: 'high' as const,
    venue: 'Edinburgh',     title: 'Weekend cover needed',
    sub: '3 shifts unfilled — Sat & Sun most exposed',
    detail: 'Three shifts still unfilled this weekend. Saturday dinner and Sunday brunch are most exposed.',
    time: '2 hours ago',    tag: 'Staffing',
    tier: 'good'  as Tier,
    impactNote: 'Service risk',
    ctaLabel: 'Sort the rota',
  },
  {
    id: 2, severity: 'high' as const,
    venue: 'Covent Garden', title: 'Till sync has stalled',
    sub: 'Last successful sync 47 mins ago',
    detail: 'Last successful sync was 47 minutes ago. Sales figures may be incomplete until this is resolved.',
    time: '47 mins ago',    tag: 'Operations',
    tier: 'risk'  as Tier,
    impactNote: 'Data integrity',
    ctaLabel: 'Look into it',
  },
  {
    id: 3, severity: 'medium' as const,
    venue: 'Carnaby',       title: 'Guests not returning',
    sub: 'Repeat visits down 12% month-on-month',
    detail: "Repeat visits down 12% month-on-month. Satisfaction is holding steady, but something in the experience isn't bringing guests back for a second visit.",
    time: 'This month',     tag: 'Guest',
    tier: 'watch' as Tier,
    impactNote: 'Revenue risk',
    ctaLabel: 'Dig into this',
  },
];

const changes = [
  { id: 1, type: 'up',   venue: 'Shoreditch',    text: 'The new brunch is landing well. Covers up 18% on the first weekend, guests are leaning in.',                  time: 'Yesterday' },
  { id: 2, type: 'up',   venue: 'Network',       text: 'Cashless nudge is working. Payment adoption up 6% across the estate since the rollout.',                      time: 'Yesterday' },
  { id: 3, type: 'down', venue: 'Covent Garden', text: <>Guest satisfaction has slipped to 3.9<StarRoundedIcon sx={{ fontSize: '0.6rem', color: '#E8A020', verticalAlign: 'middle', position: 'relative', top: '-1px', mx: '1px' }} />, the lowest in the house. Weekend staffing is the likely cause.</>, time: '3 days ago' },
];

const venues = [
  { name: "King's Cross", score: 94, satisfaction: 4.8, trend: 'up',   vsAvg: '+14%', weeklyDelta:  2, tier: 'top',   region: 'London',     highlights: ['Pre-service ritual running every shift', 'Cashless payments at 97%', 'Staff retention above 90% this quarter'] },
  { name: 'Shoreditch',   score: 91, satisfaction: 4.7, trend: 'up',   vsAvg: '+11%', weeklyDelta:  0, tier: 'top',   region: 'London',     highlights: ['New brunch menu driving repeat visits up 18%', 'Team consistency at a record high', 'Tip conversion leading the estate at 24%'] },
  { name: 'Liverpool St', score: 83, satisfaction: 4.4, trend: 'flat', vsAvg:  '+3%', weeklyDelta:  1, tier: 'good',  region: 'London',     highlights: ['Lunch service consistently fully booked', 'Payment completion up 3% this month'] },
  { name: 'Manchester',   score: 82, satisfaction: 4.4, trend: 'up',   vsAvg:  '+2%', weeklyDelta:  8, tier: 'good',  region: 'Manchester', highlights: ['Guest satisfaction steady for six weeks', 'Lowest staff turnover outside London', 'Upsell rate on drinks above network average'] },
  { name: 'Kensington',   score: 80, satisfaction: 4.3, trend: 'down', vsAvg:  '-1%', weeklyDelta: -2, tier: 'good',  region: 'London',     highlights: ['Weekend covers up 9% month-on-month', 'Strong return visit rate at 31%'] },
  { name: 'Edinburgh',    score: 79, satisfaction: 4.3, trend: 'flat', vsAvg:  '-1%', weeklyDelta:  5, tier: 'good',  region: 'Edinburgh',  highlights: ['Highest average spend per head outside London', 'Pre-service ritual adopted last month, scores improving'] },
  { name: 'Battersea',    score: 78, satisfaction: 4.2, trend: 'down', vsAvg:  '-4%', weeklyDelta: -3, tier: 'good',  region: 'London',     highlights: ['Cashless adoption jumped 8% after recent push', 'Kitchen and front-of-house NPS aligned'] },
  { name: 'Bristol',      score: 77, satisfaction: 4.2, trend: 'flat', vsAvg:  '-4%', weeklyDelta:  3, tier: 'good',  region: 'Bristol',    highlights: ['Strongest opening quarter of any new location', 'Local press coverage driving walk-in covers'] },
  { name: 'Birmingham',   score: 74, satisfaction: 4.2, trend: 'down', vsAvg:  '-7%', weeklyDelta: -5, tier: 'watch', region: 'Birmingham', highlights: ['Guest satisfaction holding despite staffing pressure', 'Lunch trade outperforming forecast'] },
  { name: 'Carnaby',      score: 71, satisfaction: 4.1, trend: 'down', vsAvg: '-11%', weeklyDelta: -7, tier: 'watch', region: 'London',     highlights: ['Brunch service scores above dinner', 'Payment adoption at 88%, above watch-list average'] },
  { name: 'Covent Garden',score: 65, satisfaction: 4.0, trend: 'down', vsAvg: '-19%', weeklyDelta: -4, tier: 'risk',  region: 'London',     highlights: ['Weekend lunch remains strong despite weekday dip'] },
];

type SortView = 'performance' | 'risk' | 'improvement';

const SORT_TABS: { key: SortView; label: string }[] = [
  { key: 'performance', label: 'By performance' },
  { key: 'risk',        label: 'By risk' },
  { key: 'improvement', label: 'By improvement' },
];

const TIER_ORDER: Record<string, number> = { risk: 0, watch: 1, good: 2, top: 3 };

const drivers = [
  {
    title: 'Drink Attach Rate', metric: '62%', metricSub: 'covers ordering a drink', impact: 'High' as const,
    insight: "Covers that include a drink — cocktail, wine, or chai — spend 38% more on average. Houses hitting 75%+ attach consistently lead on total revenue. Six locations are below 65% and have real ground to gain.",
    note: "King's Cross leads the estate at 79%",
    Icon: WineBarOutlinedIcon,
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
    { name: 'House Black Daal', delta: '+23%', img: `${BASE}/images/food/daal.jpg`,    orders: 1842 },
    { name: 'Lamb Chops',       delta: '+15%', img: `${BASE}/images/food/lamb.jpg`,    orders: 1340 },
    { name: 'Roomali Roti',     delta: '+8%',  img: `${BASE}/images/food/roti.jpg`,    orders: 983  },
  ],
  declining: [
    { name: 'Chicken Ruby', delta: '−11%', img: `${BASE}/images/food/chicken.jpg`, orders: 612 },
    { name: 'House Salad',  delta: '−7%',  img: `${BASE}/images/food/salad.jpg`,   orders: 448 },
  ],
  opportunities: [
    {
      icon: LocalOfferOutlinedIcon,
      title: 'Naan alongside',
      detail: 'A prompt to add a naan with any main at £2.50. Only 14% of guests are taking one; a well-placed nudge at ordering could more than double that.',
      impact: 'Est. +£8K / month',
      iconBg: '#FDF3FD', iconColor: '#EA41E2',
    },
    {
      icon: WbSunnyOutlinedIcon,
      title: 'Set brunch menu',
      detail: 'A three-course set at £28, something to savour slowly. Targets the repeat visit gap at Carnaby and Covent Garden with a format guests want to return for.',
      impact: 'Addresses repeat visit decline',
      iconBg: '#FDF3FD', iconColor: '#EA41E2',
    },
    {
      icon: LocalCafeOutlinedIcon,
      title: 'Chai with dessert',
      detail: 'Complimentary chai with every dessert for loyalty members. A small gesture that makes the end of a meal feel genuinely looked after, and brings guests into the app at almost no cost.',
      impact: 'Boosts loyalty engagement',
      iconBg: '#FDF3FD', iconColor: '#EA41E2',
    },
    {
      icon: CardGiftcardOutlinedIcon,
      title: 'Birthday dining offer',
      detail: 'A personalised invite for loyalty members in the month of their birthday. Early data from King\'s Cross shows a 34% redemption rate and spend 22% above the average cover.',
      impact: 'Est. +£5K / month',
      iconBg: '#FDF3FD', iconColor: '#EA41E2',
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
  const [sortView, setSortView] = useState<SortView>('performance');

  const sortedVenues = [...venues].sort((a, b) => {
    if (sortView === 'risk')        return TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || a.score - b.score;
    if (sortView === 'improvement') return b.weeklyDelta - a.weeklyDelta;
    return b.score - a.score;
  });

  const filteredVenues = sortedVenues.filter(v =>
    activeTier == null || v.tier === activeTier
  );

  const mapActiveTiers: Tier[] | null = sortView === 'risk' ? ['risk', 'watch'] : null;

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
            Thursday · Morning briefing · 11 locations · Lunch service in 2h
          </Typography>
        </Box>

        {/* ── Status banner ────────────────────────────────────────────── */}
        <Box className="fade-in delay-2" sx={{ mb: 4 }}>
          <DishoomOpsCard />
        </Box>

        {/* ── Performance snapshot cards ───────────────────────────────── */}
        <Box className="fade-in delay-3" sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          {perfMetrics.map((m) => {
            const sparkPath = m.spark ? buildSparkPath(m.spark) : null;
            return (
              <Card key={m.label} sx={{ flex: '1 1 0', minWidth: { xs: 'calc(50% - 8px)', md: 0 }, p: 0, overflow: 'hidden' }}>
                <Box sx={{ px: 2.5, pt: 2.5, pb: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Title */}
                  <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, letterSpacing: '-0.005em', mb: 1.25, lineHeight: 1 }}>
                    {m.label}
                  </Typography>

                  {/* Value row */}
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.045em', lineHeight: 1 }}>
                      {m.value}
                    </Typography>
                    {m.contextLabel && (
                      <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, letterSpacing: '-0.005em', lineHeight: 1 }}>
                        {m.contextLabel}
                      </Typography>
                    )}
                  </Box>

                  {/* Star rating (guest satisfaction) */}
                  {m.starRating && (
                    <Box sx={{ display: 'flex', gap: '2px', mt: 0.875, mb: 0.25 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <StarRoundedIcon key={i} sx={{ fontSize: '0.9375rem', color: '#E8A020' }} />
                      ))}
                      <StarRoundedIcon sx={{ fontSize: '0.9375rem', color: '#E8A020', opacity: 0.22 }} />
                    </Box>
                  )}

                  {/* Sparkline */}
                  {sparkPath && (
                    <Box sx={{ my: 1.25 }}>
                      <svg width="100%" viewBox="0 0 100 28" preserveAspectRatio="none" style={{ display: 'block', height: 28 }}>
                        <path d={sparkPath} fill="none" stroke={m.positive === false ? C.errorMain : '#C8C8C8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Box>
                  )}

                  {/* Spacer to push bottom line down */}
                  {!sparkPath && !m.starRating && <Box sx={{ flex: 1 }} />}
                  {m.starRating && <Box sx={{ flex: 1 }} />}

                  {/* Bottom line */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: sparkPath ? 0 : 1.5, pt: 1.5, borderTop: `1px solid ${C.grey300}` }}>
                    {m.delta && (
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: m.positive ? '#2E7D52' : C.errorMain, letterSpacing: '-0.01em', lineHeight: 1, flexShrink: 0 }}>
                        {m.delta}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, letterSpacing: '-0.005em', lineHeight: 1.3 }}>
                      {m.bottomLine}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>

        {/* ── Priority Signals + Recent Changes ───────────────────────── */}
        <Box id="section-focus" className="fade-in delay-3" sx={{ mb: 4 }}>
          <SectionLabel large>Focus areas</SectionLabel>

          <Grid container spacing={2}>

            {/* Priority Signals */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: '20px !important' }}>
                  <SectionLabel aside="3 items">Signals to act on</SectionLabel>

                  {/* Column headers */}
                  <Box sx={{
                    display: { xs: 'none', md: 'grid' },
                    gridTemplateColumns: '76px 1fr 96px 88px',
                    gap: 1.5, pb: 1.25,
                    borderBottom: `1px solid ${C.grey300}`,
                  }}>
                    {['Priority', 'Issue', 'Venue', 'Impact'].map((col) => (
                      <Typography key={col} sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted }}>
                        {col}
                      </Typography>
                    ))}
                  </Box>

                  {/* Rows */}
                  {signals.map((s, i) => (
                    <Box key={s.id} sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: 'auto 1fr', md: '76px 1fr 96px 88px' },
                      gap: { xs: 1.25, md: 1.5 },
                      py: 1.75,
                      borderBottom: i < signals.length - 1 ? `1px solid ${C.grey100}` : 'none',
                      alignItems: 'flex-start',
                    }}>

                      {/* Priority */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {s.severity === 'high'
                          ? <WarningAmberRoundedIcon sx={{ fontSize: '0.9375rem', color: C.errorMain, flexShrink: 0 }} />
                          : <InfoOutlinedIcon sx={{ fontSize: '0.9375rem', color: C.textMuted, flexShrink: 0 }} />
                        }
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1, whiteSpace: 'nowrap', color: s.severity === 'high' ? C.errorMain : C.textSecondary }}>
                          {s.severity === 'high' ? 'High' : 'Medium'}
                        </Typography>
                      </Box>

                      {/* Issue */}
                      <Box>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.3, mb: 0.3 }}>
                          {s.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, lineHeight: 1.45, letterSpacing: '-0.005em' }}>
                          {s.sub}
                        </Typography>
                      </Box>

                      {/* Venue — hidden on mobile */}
                      <Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.8125rem', color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                        {s.venue}
                      </Typography>

                      {/* Impact — hidden on mobile */}
                      <Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.75rem', color: C.textSecondary, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                        {s.impactNote}
                      </Typography>
                    </Box>
                  ))}
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


        {/* ── Venue Performance ───────────────────────────────────────── */}
        <Box id="section-venues" className="fade-in delay-5" sx={{ mb: 4 }}>
          <Card>
            <CardContent>

              {/* Header */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-start' }, justifyContent: 'space-between', mb: 2.5, gap: { xs: 1.5, sm: 2 } }}>
                <Box>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em', mb: 0.4 }}>
                    House Performance
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: C.textMuted, letterSpacing: '-0.005em' }}>
                    {sortView === 'performance' && 'Sorted by score'}
                    {sortView === 'risk' && 'Sorted by risk · worst first'}
                    {sortView === 'improvement' && 'Sorted by weekly improvement'}
                    {activeTier ? ` · ${TIER_STYLE[activeTier].label}` : ''}
                  </Typography>
                </Box>

                {/* Sort tabs */}
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
                  {SORT_TABS.map(({ key, label }) => {
                    const isSelected = sortView === key;
                    return (
                      <Box key={key} onClick={() => { setSortView(key); setActiveTier(null); }}
                        sx={{ display: 'inline-flex', alignItems: 'center', px: 1.25, py: 0.5, borderRadius: '99px', cursor: 'pointer', userSelect: 'none',
                          border: `1.5px solid ${isSelected ? C.textPrimary : C.grey300}`,
                          backgroundColor: isSelected ? C.textPrimary : 'transparent',
                          transition: 'all 0.15s ease',
                          '&:hover': { borderColor: C.textPrimary, backgroundColor: isSelected ? C.textPrimary : C.grey100 },
                        }}
                      >
                        <Typography sx={{ fontSize: '0.6875rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? '#fff' : C.textSecondary, lineHeight: 1, letterSpacing: '-0.005em', whiteSpace: 'nowrap' }}>
                          {label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              <Grid container spacing={3}>

                {/* Left: Map */}
                <Grid size={{ xs: 12, md: 7 }}>

                  <Box sx={{ position: 'relative', height: 360, borderRadius: '10px', overflow: 'hidden', border: `1px solid rgba(0,0,0,0.06)` }}>
                    {mounted && <VenueMapComponent activeTier={activeTier} activeTiers={mapActiveTiers} />}

                    {/* Floating tier legend */}
                    <Box sx={{
                      position: 'absolute', bottom: 12, left: 12,
                      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0, zIndex: 1000,
                      bgcolor: '#fff', borderRadius: '99px',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
                      px: 0.5, py: 0.5,
                      maxWidth: 'calc(100% - 24px)',
                    }}>
                      {(Object.entries(TIER_STYLE) as [Tier, typeof TIER_STYLE[Tier]][]).map(([tier, s]) => {
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

                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, letterSpacing: '-0.005em' }}>
                      Select a tier to refine the map
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
                      {sortView === 'performance' && 'Leading the way'}
                      {sortView === 'risk' && 'Most at risk'}
                      {sortView === 'improvement' && 'Most improved'}
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
          <SectionLabel large>Performance drivers</SectionLabel>
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
                            bgcolor: isHigh ? '#EDEEFC' : C.grey100,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <d.Icon sx={{ fontSize: '1rem', color: isHigh ? '#2E377E' : C.textSecondary }} />
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
                            bgcolor: isHigh ? '#EDEEFC' : C.grey100,
                            color: isHigh ? '#2E377E' : C.textSecondary,
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
        <Box id="section-menu" className="fade-in delay-7" sx={{ mb: 4 }}>
          <SectionLabel large action={
            <Button size="small" variant="text" sx={{ fontSize: '0.75rem', fontWeight: 500, color: C.textSecondary, textTransform: 'none', letterSpacing: '-0.005em', px: 1, minWidth: 0, '&:hover': { backgroundColor: C.grey100, color: C.textPrimary } }}>
              View all
            </Button>
          }>What guests are ordering</SectionLabel>
          <Card>
            <CardContent sx={{ p: '20px !important' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch', gap: 0 }}>

                {/* Left: menu movement */}
                <Box sx={{ width: { xs: '100%', md: '36%' }, flexShrink: 0, pr: { xs: 0, md: 3 }, pb: { xs: 3, md: 0 }, display: 'flex', flexDirection: 'column' }}>

                  {/* Trending up */}
                  <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, lineHeight: 1, mb: 1.25 }}>
                    Trending up
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {menuData.trending.map((item, i) => (
                      <Box key={item.name} sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: i < menuData.trending.length - 1 ? `1px solid ${C.grey300}` : 'none' }}>
                        <Box component="img" src={item.img} alt={item.name} sx={{ width: 34, height: 34, borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.8125rem', color: C.textPrimary, letterSpacing: '-0.01em', fontWeight: 500, mb: 0.25 }}>{item.name}</Typography>
                          <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, letterSpacing: '-0.005em' }}>{item.orders.toLocaleString()} orders</Typography>
                        </Box>
                        <Box sx={{ px: 1, py: 0.375, borderRadius: '6px', backgroundColor: '#D1FAE5', flexShrink: 0 }}>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#065F46', letterSpacing: '-0.01em', lineHeight: 1 }}>{item.delta}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Trending down */}
                  <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, lineHeight: 1, mb: 1.25, mt: 2.25 }}>
                    Trending down
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {menuData.declining.map((item, i) => (
                      <Box key={item.name} sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: i < menuData.declining.length - 1 ? `1px solid ${C.grey300}` : 'none' }}>
                        <Box component="img" src={item.img} alt={item.name} sx={{ width: 34, height: 34, borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.8125rem', color: C.textPrimary, letterSpacing: '-0.01em', fontWeight: 500, mb: 0.25 }}>{item.name}</Typography>
                          <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, letterSpacing: '-0.005em' }}>{item.orders.toLocaleString()} orders</Typography>
                        </Box>
                        <Box sx={{ px: 1, py: 0.375, borderRadius: '6px', backgroundColor: '#FEE2E2', flexShrink: 0 }}>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#991B1B', letterSpacing: '-0.01em', lineHeight: 1 }}>{item.delta}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                </Box>

                <Divider orientation="vertical" flexItem sx={{ borderColor: C.grey300, display: { xs: 'none', md: 'block' } }} />
                <Divider sx={{ borderColor: C.grey300, display: { xs: 'block', md: 'none' } }} />

                {/* Right: opportunities */}
                <Box sx={{ flex: 1, pl: { xs: 0, md: 3 }, pt: { xs: 3, md: 0 }, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, lineHeight: 1, mb: 1.25 }}>
                    Opportunities
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    {menuData.opportunities.map((o, i) => (
                      <Box key={o.title} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.875, borderBottom: i < menuData.opportunities.length - 1 ? `1px solid ${C.grey300}` : 'none' }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: o.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: '1px' }}>
                          <o.icon sx={{ fontSize: '0.9375rem', color: o.iconColor }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.375, flexWrap: 'wrap' }}>
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                              {o.title}
                            </Typography>
                            <Box sx={{ px: 0.875, py: 0.25, borderRadius: '5px', backgroundColor: o.impact.includes('£') ? '#D1FAE5' : C.grey100, flexShrink: 0 }}>
                              <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.02em', color: o.impact.includes('£') ? '#065F46' : C.textSecondary, lineHeight: 1 }}>
                                {o.impact}
                              </Typography>
                            </Box>
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
