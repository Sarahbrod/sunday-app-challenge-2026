'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import LinearProgress from '@mui/material/LinearProgress';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Plus } from 'lucide-react';

import { ACTIVE_EXPERIMENTS, RECOMMENDED_EXPERIMENTS, GROWTH_SCORE } from '@/data/experiments';
import ExperimentBuilder from '@/components/ExperimentBuilder';

const C = {
  textPrimary:   '#1C1C1C',
  textSecondary: '#696764',
  textMuted:     '#A8A5A2',
  successDark:   '#1A5C3A',
  successMain:   '#6EC890',
  errorMain:     '#F21A27',
  warmMain:      '#E8C565',
  yellowMain:    '#E8C565',
  grey100:       '#F3EDE6',
  grey300:       '#DDD7D0',
};

function buildSparkPath(pts: number[], w = 100, h = 28): string {
  const min = Math.min(...pts), max = Math.max(...pts), range = max - min || 1;
  const coords = pts.map((p, i) => ({ x: (i / (pts.length - 1)) * w, y: h - ((p - min) / range) * h * 0.7 - h * 0.15 }));
  return coords.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = coords[i - 1], cx = ((prev.x + p.x) / 2).toFixed(1);
    return `${acc} C${cx},${prev.y.toFixed(1)} ${cx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }, '');
}

const metrics = [
  { label: 'Views (this week)', value: '47.2M', delta: '+8%',  pos: true,  bottomLine: '3.1B views YTD',   spark: [38,41,39,44,42,48,46,51,49,52] },
  { label: 'Subscriber growth', value: '+23.4K', delta: '+12%', pos: true,  bottomLine: '+89K this month',  spark: [14,16,18,15,19,21,20,23,22,24] },
  { label: 'Avg engagement',    value: '6.8%',   delta: '+0.4%',pos: true,  bottomLine: 'vs last week',     spark: null },
  { label: 'Growth score',      value: '74',      delta: '+3',   pos: true,  bottomLine: 'this week',        spark: null, isScore: true },
  { label: 'Active experiments',value: '8',       delta: null,   pos: null,  bottomLine: '7 wrapping soon',  spark: null },
];

const R = 38, CIRC = 2 * Math.PI * R;
const SCORE_SEGMENTS = (() => {
  const score = GROWTH_SCORE.overall;
  const filled = (score / 100) * CIRC;
  return { filled, empty: CIRC - filled };
})();

export default function Dashboard() {
  const [builderOpen, setBuilderOpen] = useState(false);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, pb: 8 }}>

      {/* ── Greeting ── */}
      <Box className="fade-in delay-1" sx={{ pt: { xs: 2.5, md: 5.5 }, pb: { xs: 3, md: 4 } }}>
        <Typography variant="h3" sx={{ color: C.textPrimary, fontWeight: 500 }}>
          Good morning, Alex.
        </Typography>
      </Box>

      {/* ── Key metrics ── */}
      <Box className="fade-in delay-2" sx={{
        mb: 4,
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
        gap: 2,
      }}>
        {metrics.map((m, idx) => {
          const sparkPath = m.spark ? buildSparkPath(m.spark) : null;
          // Last card spans both columns on mobile when total is odd
          const isLastOdd = idx === metrics.length - 1 && metrics.length % 2 !== 0;
          return (
            <Card key={m.label} sx={{
              overflow: 'hidden',
              gridColumn: { xs: isLastOdd ? 'span 2' : 'auto', md: 'auto' },
            }}>
              <Box sx={{ px: 2.5, pt: 2.5, pb: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, letterSpacing: '-0.005em', mb: 1.25, lineHeight: 1 }}>{m.label}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: m.isScore ? '#E8C565' : C.textPrimary, letterSpacing: '-0.045em', lineHeight: 1 }}>{m.value}</Typography>
                  {m.isScore && <Typography sx={{ fontSize: '0.875rem', color: C.textSecondary }}>/100</Typography>}
                </Box>
                {sparkPath && (
                  <Box sx={{ my: 1.25 }}>
                    <svg width="100%" viewBox="0 0 100 28" preserveAspectRatio="none" style={{ display: 'block', height: 28 }}>
                      <path d={sparkPath} fill="none" stroke={C.grey300} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </Box>
                )}
                {!sparkPath && <Box sx={{ flex: 1 }} />}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: sparkPath ? 0 : 1.5, pt: 1.5, borderTop: `1px solid ${C.grey300}` }}>
                  {m.delta && <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: m.pos ? C.successDark : C.errorMain, letterSpacing: '-0.01em', flexShrink: 0 }}>{m.delta}</Typography>}
                  <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, letterSpacing: '-0.005em' }}>{m.bottomLine}</Typography>
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>

      <Grid container spacing={3} className="fade-in delay-3">

        {/* ── Current experiments ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: '20px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em' }}>
                  Current experiments
                </Typography>
                <Button component={Link} href="/experiments" size="small" endIcon={<ArrowRight size={13} />}
                  sx={{ fontSize: '0.75rem', color: C.textSecondary, textTransform: 'none', fontWeight: 400, letterSpacing: '-0.005em', minWidth: 0, px: 1, '&:hover': { color: C.textPrimary, backgroundColor: C.grey100 } }}>
                  View all
                </Button>
              </Box>

              {/* Headers */}
              <Box sx={{ display: { xs: 'none', sm: 'grid' }, gridTemplateColumns: '1fr 120px 80px 64px 72px', gap: 1.5, pb: 1.25, borderBottom: `1px solid ${C.grey300}` }}>
                {['Experiment', 'Creator', 'Metric', 'Signal', 'Days'].map(col => (
                  <Typography key={col} sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted }}>{col}</Typography>
                ))}
              </Box>

              {ACTIVE_EXPERIMENTS.map((exp, i) => (
                <Box key={exp.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', sm: '1fr 120px 80px 64px 72px' }, gap: { xs: 1, sm: 1.5 }, py: 1.5, borderBottom: i < ACTIVE_EXPERIMENTS.length - 1 ? `1px solid ${C.grey100}` : 'none', alignItems: 'center' }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.3, mb: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.title}</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, display: { sm: 'none' } }}>{exp.creator}</Typography>
                  </Box>
                  <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.8125rem', color: C.textSecondary }}>{exp.creator}</Typography>
                  <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.75rem', color: C.textSecondary }}>{exp.successMetric}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {exp.signal === 'up'      && <TrendingUp size={16} color={C.successDark} />}
                    {exp.signal === 'down'    && <TrendingDown size={16} color={C.errorMain} />}
                    {exp.signal === 'neutral' && <Minus size={16} color={C.textMuted} />}
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: exp.signal === 'up' ? C.successDark : exp.signal === 'down' ? C.errorMain : C.textMuted }}>{exp.currentLift}</Typography>
                  </Box>
                  <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.75rem', color: C.textMuted }}>{exp.daysRunning}d</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Right column: Growth score + Opportunities ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>

            {/* Growth score */}
            <Card>
              <CardContent sx={{ p: '20px !important' }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, mb: 2 }}>
                  Growth score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2.5 }}>
                  <Box sx={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
                    <svg width="90" height="90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r={R} fill="none" stroke={C.grey300} strokeWidth="8" />
                      <circle cx="50" cy="50" r={R} fill="none" stroke='#E8C565' strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${SCORE_SEGMENTS.filled} ${SCORE_SEGMENTS.empty}`}
                        transform="rotate(-90 50 50)" />
                    </svg>
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '1.375rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.04em', lineHeight: 1 }}>{GROWTH_SCORE.overall}</Typography>
                      <Typography sx={{ fontSize: '0.5625rem', color: C.textMuted, lineHeight: 1.4 }}>/100</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.successDark, letterSpacing: '-0.01em', mb: 0.25 }}>+{GROWTH_SCORE.delta} this week</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, letterSpacing: '-0.005em', lineHeight: 1.5 }}>Network is accelerating. Win rate and implementation on track.</Typography>
                  </Box>
                </Box>
                {GROWTH_SCORE.breakdown.map((b) => (
                  <Box key={b.label} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, letterSpacing: '-0.005em' }}>{b.label}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.textPrimary }}>{b.score}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={b.score}
                      sx={{ height: 3, borderRadius: 2, backgroundColor: C.grey300, '& .MuiLinearProgress-bar': { backgroundColor: b.score >= 75 ? C.successDark : b.score >= 60 ? C.warmMain : C.errorMain, borderRadius: 2 } }} />
                    <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, mt: 0.5 }}>{b.note}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ p: '20px !important' }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, mb: 2 }}>
                  Opportunities
                </Typography>
                {RECOMMENDED_EXPERIMENTS.slice(0, 3).map((rec, i) => (
                  <Box key={rec.id} sx={{ py: 1.25, borderBottom: i < 2 ? `1px solid ${C.grey100}` : 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.3, mb: 0.25 }}>{rec.templateName}</Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>{rec.creator}</Typography>
                      </Box>
                      <Chip label={rec.expectedImpact} size="small"
                        sx={{ height: 18, flexShrink: 0,
                          bgcolor: rec.expectedImpact === 'High' ? '#1C1C1C' : C.grey100,
                          color:   rec.expectedImpact === 'High' ? C.yellowMain : C.textSecondary,
                          fontWeight: 600, fontSize: '0.5rem', letterSpacing: '0.04em',
                          '& .MuiChip-label': { px: '6px' } }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.6875rem', color: C.textSecondary, lineHeight: 1.5, letterSpacing: '-0.005em' }}>{rec.rationale}</Typography>
                  </Box>
                ))}
                <Button component={Link} href="/experiments" fullWidth variant="outlined" size="small"
                  sx={{ mt: 1.5, fontSize: '0.75rem', color: C.textSecondary, borderColor: C.grey300, borderRadius: '8px', textTransform: 'none', fontWeight: 400, '&:hover': { borderColor: C.textPrimary, color: C.textPrimary, backgroundColor: 'transparent' } }}>
                  View all recommendations
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      <ExperimentBuilder open={builderOpen} onClose={() => setBuilderOpen(false)} />
    </Box>
  );
}
