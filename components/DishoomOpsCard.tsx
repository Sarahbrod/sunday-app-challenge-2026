'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import Button from '@mui/material/Button';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import snapshot from '@/data/opsSnapshot';

const C = {
  textPrimary:   '#0A0A0A',
  textSecondary: '#6B6970',
  textMuted:     '#B7B5BB',
  grey300:       '#E2E1E5',
};

// Colours — AA accessible on white (5–7:1 contrast) while keeping original hues
const VENUE_HEALTH = [
  { label: 'Healthy',  count: 7, color: '#2E7D52' }, // green  5.0:1
  { label: 'At risk',  count: 3, color: '#A85208' }, // amber  5.0:1
  { label: 'Critical', count: 1, color: '#B83C3C' }, // red    5.4:1
];

const R     = 34;
const CIRC  = 2 * Math.PI * R;
const TOTAL = VENUE_HEALTH.reduce((s, e) => s + e.count, 0);

const SEGMENTS = (() => {
  let cum = 0;
  return VENUE_HEALTH.map((e) => {
    const len   = (e.count / TOTAL) * CIRC;
    const angle = -90 + (cum / CIRC) * 360;
    cum += len;
    return { ...e, len, angle };
  });
})();

export default function DishoomOpsCard() {
  const { status, focus } = snapshot;

  return (
    <Card
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '40% 1fr' },
        overflow: 'hidden',
        minHeight: { xs: 'auto', md: 220 },
      }}
    >
      {/* ── Left: photo + status ─────────────────────────────── */}
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
            url('/images/dishoom-food.jpeg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          minHeight: { xs: 180, md: 'auto' },
        }}
      >
        <Box>
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

      {/* ── Right: venue health + focus ──────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
          alignItems: 'stretch',
          p: 0,
        }}
      >
        {/* ── Venue health ── */}
        <Box
          onClick={() => document.getElementById('section-venues')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          sx={{
            p: 2.5,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'background-color 0.12s ease',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.025)' },
          }}
        >
          {/* Top: label + donut + rows */}
          <Box>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, mb: 1.75 }}>
              Venue health
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Donut with center count */}
              <Box sx={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
                <svg width="96" height="96" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={R} fill="none" stroke={C.grey300} strokeWidth="9" />
                  {SEGMENTS.map(({ label, len, angle, color }) => (
                    <circle
                      key={label}
                      cx="50" cy="50" r={R}
                      fill="none"
                      stroke={color}
                      strokeWidth="9"
                      strokeLinecap="butt"
                      strokeDasharray={`${len} ${CIRC}`}
                      transform={`rotate(${angle} 50 50)`}
                    />
                  ))}
                </svg>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '1.1875rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.045em', lineHeight: 1 }}>
                    {VENUE_HEALTH[0].count}
                  </Typography>
                  <Typography sx={{ fontSize: '0.5625rem', color: C.textMuted, letterSpacing: '0.01em', lineHeight: 1.4 }}>
                    of {TOTAL}
                  </Typography>
                </Box>
              </Box>

              {/* Status rows */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {VENUE_HEALTH.map(({ label, count, color }) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color, letterSpacing: '-0.04em', lineHeight: 1, minWidth: 16, flexShrink: 0 }}>
                      {count}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, letterSpacing: '-0.01em', lineHeight: 1 }}>
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Bottom: total count */}
          <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, letterSpacing: '-0.005em' }}>
            {TOTAL} venues across the estate
          </Typography>
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ display: { xs: 'none', sm: 'block' }, borderColor: C.grey300, my: 2.5 }}
        />

        {/* ── Focus today ── */}
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Top: venue + issue + impact */}
          <Box>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, mb: 1.5 }}>
              Focus today
            </Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.025em', color: C.textPrimary, mb: 0.625, lineHeight: 1.2 }}>
              {focus.venue}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, lineHeight: 1.6, letterSpacing: '-0.005em', mb: 0.875 }}>
              {focus.issue}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.35 }}>
              {focus.impact}
            </Typography>
          </Box>

          {/* Bottom: CTA */}
          <Button
            variant="outlined"
            size="small"
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '0.8125rem !important' }} />}
            sx={{
              alignSelf: 'flex-start',
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '-0.005em',
              textTransform: 'none',
              color: C.textSecondary,
              borderColor: C.grey300,
              borderRadius: '8px',
              px: 1.5,
              py: 0.625,
              minWidth: 0,
              '&:hover': { borderColor: C.textSecondary, backgroundColor: 'rgba(0,0,0,0.03)' },
            }}
          >
            {focus.ctaLabel}
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
