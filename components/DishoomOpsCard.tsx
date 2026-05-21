'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import snapshot, { type OpsMetric } from '@/data/opsSnapshot';

// Tokens matched to page.tsx design system
const C = {
  textPrimary:   '#0A0A0A',
  textSecondary: '#6B6970',
  textMuted:     '#B7B5BB',
  successDark:   '#1A5433',
  successMain:   '#2E7D52',
  successLight:  '#E1FBED',
  warmDark:      '#72430B',
  warmLight:     '#F9E5CD',
  grey100:       '#F6F6F9',
  grey300:       '#E2E1E5',
};

const TIER_TOKENS = {
  success: { color: C.successMain, bg: C.successLight, icon: <TrendingUpRoundedIcon /> },
  warning: { color: C.warmDark,    bg: C.warmLight,    icon: <WarningAmberRoundedIcon /> },
  neutral: { color: C.textMuted,   bg: C.grey100,      icon: <RadioButtonUncheckedRoundedIcon /> },
};

export default function DishoomOpsCard() {
  const { brand, status, focus, metrics } = snapshot;

  return (
    <Card
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '40% 1fr' },
        overflow: 'hidden',
        minHeight: { xs: 'auto', md: 220 },
      }}
    >
      {/* ── Left: photo + status ───────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 2.5,
          color: '#fff',
          backgroundImage: `
            linear-gradient(105deg,
              rgba(5,20,15,0.97) 0%,
              rgba(5,20,15,0.82) 45%,
              rgba(5,20,15,0.45) 75%,
              rgba(5,20,15,0.20) 100%
            ),
            url('/images/dishoom-interior.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          minHeight: { xs: 180, md: 'auto' },
        }}
      >
        {/* Top row: brand + status chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <Typography
            sx={{
              fontSize: '0.625rem',
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1,
            }}
          >
            {brand}
          </Typography>

          <Chip
            icon={<CheckRoundedIcon sx={{ fontSize: '0.75rem !important', ml: '6px !important', color: '#6EE7B7 !important' }} />}
            label={status.chipLabel}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.5625rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              bgcolor: 'rgba(110,231,183,0.12)',
              color: '#6EE7B7',
              border: '1px solid rgba(110,231,183,0.22)',
              '& .MuiChip-label': { px: '7px' },
            }}
          />
        </Box>

        {/* Main copy */}
        <Box sx={{ my: 'auto', py: 2 }}>
          <Typography
            sx={{
              fontSize: { xs: '1.125rem', md: '1.3125rem' },
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.18,
              mb: 0.75,
              whiteSpace: 'pre-line',
            }}
          >
            {status.headline}
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.58)', letterSpacing: '-0.005em', lineHeight: 1.5 }}>
            {status.sub}
          </Typography>
        </Box>

        {/* Bottom: trend text + icon */}
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <TrendingUpRoundedIcon sx={{ fontSize: '0.875rem', color: '#6EE7B7' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
            {status.trend.label}
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.45)' }}>
            {status.trend.context}
          </Typography>
        </Box>
      </Box>

      {/* ── Right: focus + metrics ──────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
          alignItems: 'stretch',
          p: 0,
        }}
      >
        {/* Focus today */}
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, mb: 1.5 }}>
              Focus today
            </Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.025em', color: C.textPrimary, mb: 0.5, lineHeight: 1.2 }}>
              {focus.venue}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em', mb: 0.75, lineHeight: 1.3 }}>
              {focus.impact}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, lineHeight: 1.55, letterSpacing: '-0.005em' }}>
              {focus.issue}
            </Typography>
          </Box>
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ display: { xs: 'none', sm: 'block' }, borderColor: C.grey300, my: 2.5 }}
        />

        {/* Snapshot metrics */}
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, mb: 1.75 }}>
            This week
          </Typography>
          <Stack divider={<Divider sx={{ borderColor: C.grey300, my: 1.25 }} />}>
            {metrics.map((m) => (
              <MetricRow key={m.id} metric={m} />
            ))}
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}

function MetricRow({ metric }: { metric: OpsMetric }) {
  const { color, bg, icon } = TIER_TOKENS[metric.tier];
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          bgcolor: bg,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          '& svg': { fontSize: '0.9375rem' },
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: '1.25rem',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color,
          minWidth: 22,
          flexShrink: 0,
        }}
      >
        {metric.value}
      </Typography>
      <Box>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          {metric.label}
        </Typography>
        <Typography sx={{ fontSize: '0.6875rem', color: C.textSecondary, letterSpacing: '-0.005em', lineHeight: 1.35 }}>
          {metric.sub}
        </Typography>
      </Box>
    </Stack>
  );
}
