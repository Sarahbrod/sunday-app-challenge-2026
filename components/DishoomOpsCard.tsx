'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { TrendingUp, ArrowRight, Check } from 'lucide-react';
import snapshot from '@/data/opsSnapshot';

const C = {
  textPrimary:   '#1C1C1C',
  textSecondary: '#6B6764',
  textMuted:     '#A8A5A2',
  grey300:       '#DDD7D0',
};

const CREATOR_HEALTH = [
  { label: 'Growing',         count: 7, color: '#1A5C3A' },
  { label: 'Needs attention', count: 3, color: '#E8C565' },
  { label: 'At risk',         count: 1, color: '#F21A27' },
];

const R = 40, CIRC = 2 * Math.PI * R, TOTAL = CREATOR_HEALTH.reduce((s, e) => s + e.count, 0);

const SEGMENTS = (() => {
  let cum = 0;
  return CREATOR_HEALTH.map((e) => {
    const len = (e.count / TOTAL) * CIRC, angle = -90 + (cum / CIRC) * 360;
    cum += len;
    return { ...e, len, angle };
  });
})();

export default function FOBAOpsCard() {
  const { status, focus } = snapshot;
  return (
    <Card sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '40% 1fr' }, overflow: 'hidden', minHeight: { xs: 'auto', md: 220 } }}>
      {/* Left: gradient */}
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2.5, color: '#fff', background: 'linear-gradient(140deg, #1C0808 0%, #2A1318 40%, #8C0015 75%, #F21A27 100%)', minHeight: { xs: 180, md: 'auto' } }}>
        <Box>
          <Chip
            icon={<Box sx={{ display: 'flex', ml: '6px' }}><Check size={11} strokeWidth={2.5} color="#fff" /></Box>}
            label={status.chipLabel}
            size="small"
            sx={{ height: 22, fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', '& .MuiChip-label': { px: '7px' } }}
          />
        </Box>
        <Box sx={{ my: 'auto', py: 2 }}>
          <Typography sx={{ fontSize: { xs: '1.125rem', md: '1.3125rem' }, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.18, mb: 0.75, whiteSpace: 'pre-line' }}>
            {status.headline}
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.58)', letterSpacing: '-0.005em', lineHeight: 1.5 }}>
            {status.sub}
          </Typography>
        </Box>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <TrendingUp size={14} color="rgba(255,255,255,0.8)" />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>{status.trend.label}</Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.45)' }}>{status.trend.context}</Typography>
        </Box>
      </Box>

      {/* Right: health + priority */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' }, alignItems: 'stretch', p: 0 }}>
        <Box onClick={() => document.getElementById('section-venues')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'background-color 0.12s ease', '&:hover': { backgroundColor: 'rgba(0,0,0,0.025)' } }}>
          <Box>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, mb: 1.75 }}>Creator health</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
                <svg width="140" height="140" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={R} fill="none" stroke={C.grey300} strokeWidth="9" />
                  {SEGMENTS.map(({ label, len, angle, color }) => (
                    <circle key={label} cx="50" cy="50" r={R} fill="none" stroke={color} strokeWidth="9" strokeLinecap="butt" strokeDasharray={`${len} ${CIRC}`} transform={`rotate(${angle} 50 50)`} />
                  ))}
                </svg>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '1.1875rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.045em', lineHeight: 1 }}>{CREATOR_HEALTH[0].count}</Typography>
                  <Typography sx={{ fontSize: '0.5625rem', color: C.textMuted, letterSpacing: '0.01em', lineHeight: 1.4 }}>of {TOTAL}</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {CREATOR_HEALTH.map(({ label, count, color }) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color, letterSpacing: '-0.04em', lineHeight: 1, minWidth: 18, flexShrink: 0 }}>{count}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, letterSpacing: '-0.01em', lineHeight: 1 }}>{label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, borderColor: C.grey300, my: 2.5 }} />

        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, mb: 1.5 }}>Priority today</Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.025em', color: C.textPrimary, mb: 0.625, lineHeight: 1.2 }}>{focus.venue}</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, lineHeight: 1.6, letterSpacing: '-0.005em', mb: 0.875 }}>{focus.issue}</Typography>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.35 }}>{focus.impact}</Typography>
          </Box>
          <Button variant="outlined" size="small" endIcon={<ArrowRight size={13} />}
            sx={{ alignSelf: 'flex-start', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '-0.005em', textTransform: 'none', color: C.textSecondary, borderColor: C.grey300, borderRadius: '8px', px: 1.5, py: 0.625, minWidth: 0, '&:hover': { borderColor: C.textSecondary, backgroundColor: 'rgba(0,0,0,0.03)' } }}>
            {focus.ctaLabel}
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
