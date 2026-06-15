'use client';

import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Grid from '@mui/material/Grid2';
import {
  AreaChart, Area, XAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Cell, YAxis,
} from 'recharts';
import { PLAYBOOK, COMPLETED_EXPERIMENTS } from '@/data/experiments';

const C = {
  textPrimary:   '#1A1818',
  textSecondary: '#696764',
  textMuted:     '#A8A5A0',
  successDark:   '#1A5C3A',
  successMain:   '#6EC890',
  successLight:  '#D4F0E4',
  errorMain:     '#E84030',
  warmMain:      '#F07830',
  yellowMain:    '#F5E68A',
  yellowLight:   '#FEFCE8',
  grey100:       '#F5F2ED',
  grey200:       '#EAE8E4',
  grey300:       '#E0DDD8',
  purpleMain:    '#8B6CF5',
};

const WEEKS = ['W7','W8','W9','W10','W11','W12','W13','W14','W15','W16','W17','W18'];

const TREND_DATA = WEEKS.map((week, i) => ({
  week,
  views:   [32,34,33,38,37,42,41,45,44,47,49,52][i],
  subs:    [16,17,16,19,18,21,20,23,21,23,24,25][i],
  engage:  [5.8,6.0,5.9,6.2,6.1,6.4,6.3,6.6,6.5,6.7,6.8,6.9][i],
}));

const PLATFORM_DATA = [
  { label: 'YouTube',    count: 8, pct: 72, color: '#E84030' },
  { label: 'Podcast',    count: 2, pct: 18, color: '#F07830' },
  { label: 'Newsletter', count: 1, pct: 10, color: '#F5E68A' },
];

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, unit }: {
  active?: boolean; payload?: { value: number }[]; label?: string; unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: '#1A1818', px: 1.5, py: 1, borderRadius: '7px', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
      <Typography sx={{ fontSize: '0.5625rem', color: 'rgba(255,255,255,0.45)', mb: 0.25, letterSpacing: '0.04em' }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {payload[0].value}{unit}
      </Typography>
    </Box>
  );
}

// ── Single trend panel ────────────────────────────────────────────────────────
function TrendPanel({
  label, dataKey, unit, color, latest, delta,
}: {
  label: string; dataKey: string; unit: string;
  color: string; latest: string; delta: string;
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, letterSpacing: '-0.005em' }}>{label}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {latest}
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: C.successDark }}>{delta}</Typography>
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={90}>
        <AreaChart data={TREND_DATA} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
          <defs>
            <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity={0.10} />
              <stop offset="100%" stopColor={color} stopOpacity={0.00} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke={C.grey200}
            strokeDasharray="3 0"
            strokeWidth={1}
          />
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            tick={{ fill: C.textMuted, fontSize: 9, letterSpacing: '0.02em' }}
            interval={5}
            dy={6}
          />
          <Tooltip
            content={<ChartTooltip unit={unit} />}
            cursor={{ stroke: C.grey300, strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#fill-${dataKey})`}
            dot={false}
            activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [importing, setImporting] = useState(false);
  const [imported, setImported]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setImporting(true);
    setTimeout(() => { setImporting(false); setImported(true); }, 1400);
  };

  const handleFile = () => {
    setImporting(true);
    setTimeout(() => { setImporting(false); setImported(true); }, 1400);
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, pb: 8 }}>

      {/* Header */}
      <Box className="fade-in delay-1" sx={{ pt: 5.5, pb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h3" sx={{ color: C.textPrimary, fontWeight: 500 }}>Analytics</Typography>
        <Button
          variant="outlined"
          startIcon={<UploadFileOutlinedIcon />}
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: importing ? C.textMuted : C.textPrimary,
            borderColor: importing ? C.grey300 : C.textPrimary,
            borderRadius: '10px',
            textTransform: 'none',
            px: 2,
            py: 0.875,
            '&:hover': { backgroundColor: C.grey100, borderColor: C.textPrimary },
          }}
        >
          {importing ? 'Importing…' : imported ? 'Data imported' : 'Upload data'}
        </Button>
      </Box>

      {/* ── Performance trends ── */}
      <Card className="fade-in delay-2" sx={{ mb: 3 }}>
        <CardContent sx={{ p: '24px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em' }}>
              Performance trends
            </Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>Last 12 weeks</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.75rem', color: C.textMuted, mb: 3.5 }}>Across all creators in the network</Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: { xs: 4, md: 5 } }}>
            <TrendPanel label="Weekly views"    dataKey="views"  unit="M" color={C.textPrimary}  latest="52M"  delta="+8%" />
            <TrendPanel label="Subscriber gain" dataKey="subs"   unit="K" color={C.warmMain}     latest="25K"  delta="+12%" />
            <TrendPanel label="Avg engagement"  dataKey="engage" unit="%" color={C.purpleMain}   latest="6.9%" delta="+0.4%" />
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3} className="fade-in delay-3">

        {/* ── Platform breakdown ── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: '24px !important' }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em', mb: 0.5 }}>
                Platform breakdown
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: C.textMuted, mb: 3 }}>Creators by platform type</Typography>

              {/* Recharts horizontal bar */}
              <Box sx={{ mb: 3 }}>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart
                    data={PLATFORM_DATA}
                    layout="vertical"
                    margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
                    barSize={10}
                  >
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={72}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: C.textSecondary, fontSize: 12, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                    />
                    <CartesianGrid horizontal={false} stroke={C.grey200} strokeDasharray="3 0" strokeWidth={1} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as typeof PLATFORM_DATA[0];
                        return (
                          <Box sx={{ bgcolor: '#1A1818', px: 1.5, py: 1, borderRadius: '7px' }}>
                            <Typography sx={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.45)', mb: 0.25 }}>{d.label}</Typography>
                            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{d.pct}%</Typography>
                            <Typography sx={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.45)' }}>{d.count} creators</Typography>
                          </Box>
                        );
                      }}
                    />
                    <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                      {PLATFORM_DATA.map((d) => (
                        <Cell key={d.label} fill={d.color} opacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {PLATFORM_DATA.map((p) => (
                  <Box key={p.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.625 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: p.color }} />
                    <Typography sx={{ fontSize: '0.6875rem', color: C.textSecondary }}>{p.label}</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: C.textPrimary }}>{p.pct}%</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ pt: 2.5, borderTop: `1px solid ${C.grey300}` }}>
                <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, mb: 1.5 }}>
                  Experiment results
                </Typography>
                {COMPLETED_EXPERIMENTS.slice(0, 4).map((exp) => (
                  <Box key={exp.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.875, borderBottom: `1px solid ${C.grey100}` }}>
                    <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {exp.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: exp.winner === 'variant' ? C.successDark : exp.winner === 'control' ? C.errorMain : C.textMuted, ml: 1.5, flexShrink: 0 }}>
                      {exp.lift}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Playbook + Import ── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Playbook */}
            <Card>
              <CardContent sx={{ p: '24px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em' }}>Creator playbook</Typography>
                  <Chip label="Updated live" size="small" sx={{ height: 18, bgcolor: C.successLight, color: C.successDark, fontWeight: 600, fontSize: '0.5rem', letterSpacing: '0.04em', '& .MuiChip-label': { px: '7px' } }} />
                </Box>
                <Typography sx={{ fontSize: '0.75rem', color: C.textMuted, mb: 2.5 }}>What works for each creator, built from completed experiments</Typography>
                {PLAYBOOK.map((entry, i) => (
                  <Box key={i} sx={{ py: 1.5, borderBottom: i < PLAYBOOK.length - 1 ? `1px solid ${C.grey100}` : 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 0.75 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em' }}>{entry.creator}</Typography>
                          <Chip label={entry.category} size="small" sx={{ height: 16, bgcolor: C.yellowLight, color: '#7A4808', fontWeight: 600, fontSize: '0.5rem', '& .MuiChip-label': { px: '6px' } }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, lineHeight: 1.6, letterSpacing: '-0.005em' }}>{entry.finding}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: C.successDark, flexShrink: 0 }}>{entry.impact}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, fontStyle: 'italic' }}>{entry.source}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Data import */}
            <Card>
              <CardContent sx={{ p: '24px !important' }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em', mb: 0.5 }}>Data import</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: C.textMuted, mb: 2.5 }}>Upload YouTube Analytics CSV to enrich experiment results</Typography>

                {imported ? (
                  <Box sx={{ p: 2.5, borderRadius: '10px', backgroundColor: C.successLight, border: `1px solid ${C.successMain}` }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: C.successDark, mb: 0.25 }}>CSV imported successfully</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: C.successDark, opacity: 0.8 }}>analytics_june_2026.csv · 847 rows · 14 columns · matched to 8 active experiments</Typography>
                  </Box>
                ) : (
                  <Box
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    sx={{ p: 3, borderRadius: '10px', border: `2px dashed ${importing ? C.yellowMain : C.grey300}`, backgroundColor: importing ? C.yellowLight : 'transparent', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { borderColor: C.textPrimary, backgroundColor: C.grey100 } }}>
                    <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
                    <Typography sx={{ fontSize: '1.5rem', mb: 1 }}>{importing ? '⏳' : '📊'}</Typography>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: C.textPrimary, mb: 0.5 }}>
                      {importing ? 'Importing…' : 'Drop YouTube Analytics CSV here'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: C.textMuted }}>
                      {importing ? 'Matching rows to experiments' : 'or click to browse · YouTube Studio → Analytics → Export'}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mt: 2, p: 1.5, borderRadius: '8px', backgroundColor: C.grey100, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: C.textPrimary }}>YouTube API connection</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>Real-time sync · coming soon</Typography>
                  </Box>
                  <Chip label="Coming soon" size="small" sx={{ height: 18, bgcolor: C.grey300, color: C.textMuted, fontWeight: 600, fontSize: '0.5rem', '& .MuiChip-label': { px: '7px' } }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
