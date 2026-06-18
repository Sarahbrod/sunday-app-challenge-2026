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
import { TrendingUp, TrendingDown, Minus, ArrowRight, Plus, FlaskConical, X } from 'lucide-react';

import { ACTIVE_EXPERIMENTS, RECOMMENDED_EXPERIMENTS, GROWTH_SCORE } from '@/data/experiments';
import ExperimentBuilder from '@/components/ExperimentBuilder';
import EmptyStateBanner from '@/components/EmptyStateBanner';
import ConnectDataModal from '@/components/ConnectDataModal';
import { useConnections } from '@/hooks/useConnections';
import type { CsvUploadResult } from '@/hooks/useCsvData';

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

// ─── CSV metric derivation ────────────────────────────────────────────────────

type DashMetric = { label: string; value: string; delta: string | null; pos: boolean | null; bottomLine: string; spark: number[] | null; isScore?: boolean };

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function deriveCsvMetrics(csv: CsvUploadResult): DashMetric[] {
  const { columnHeaders: headers, sampleRows: rows, dataSource, rowCount } = csv;
  const out: DashMetric[] = [];

  const findCol = (...names: string[]) =>
    headers.find(h => names.some(n => h.toLowerCase().includes(n.toLowerCase())));

  const sumCol = (col: string) => rows.reduce((s, r) => {
    const n = parseFloat((r[col] ?? '').replace(/,/g, ''));
    return s + (isNaN(n) ? 0 : n);
  }, 0);

  const avgCol = (col: string) => {
    const vals = rows.map(r => parseFloat((r[col] ?? '').replace(/,/g, '').replace('%', ''))).filter(n => !isNaN(n));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const spark = (col: string): number[] | null => {
    const v = rows.slice(0, 10).map(r => parseFloat((r[col] ?? '').replace(/,/g, ''))).filter(n => !isNaN(n) && n > 0);
    return v.length >= 3 ? v : null;
  };

  if (dataSource === 'YOUTUBE_EXPORT') {
    const viewsCol = findCol('views');
    const subsCol  = findCol('subscribers');
    const ctrCol   = findCol('ctr');
    const watchCol = findCol('watch time');
    const impCol   = findCol('impressions');

    if (viewsCol) out.push({ label: 'Total Views',    value: fmtNum(sumCol(viewsCol)),              delta: null, pos: null, bottomLine: `${rowCount.toLocaleString()} videos uploaded`,   spark: spark(viewsCol) });
    if (subsCol)  out.push({ label: 'Subscribers',     value: fmtNum(sumCol(subsCol)),               delta: null, pos: null, bottomLine: 'from uploaded videos',                            spark: spark(subsCol)  });
    if (ctrCol)   out.push({ label: 'Avg CTR',         value: `${avgCol(ctrCol).toFixed(1)}%`,       delta: null, pos: null, bottomLine: 'click-through rate',                              spark: null            });
    if (watchCol) out.push({ label: 'Watch Time',      value: `${Math.round(sumCol(watchCol)).toLocaleString()}h`, delta: null, pos: null, bottomLine: 'total hours watched',              spark: spark(watchCol) });
    if (impCol)   out.push({ label: 'Impressions',     value: fmtNum(sumCol(impCol)),                delta: null, pos: null, bottomLine: 'total impressions delivered',                    spark: null            });
  } else if (dataSource === 'SPOTIFY_EXPORT') {
    const streamsCol   = findCol('streams');
    const listenersCol = findCol('listeners');
    const startsCol    = findCol('starts');
    const downloadsCol = findCol('downloads');

    if (streamsCol)   out.push({ label: 'Total Streams',  value: fmtNum(sumCol(streamsCol)),   delta: null, pos: null, bottomLine: `${rowCount.toLocaleString()} episodes`,       spark: spark(streamsCol)   });
    if (listenersCol) out.push({ label: 'Listeners',      value: fmtNum(sumCol(listenersCol)), delta: null, pos: null, bottomLine: 'unique listeners',                             spark: spark(listenersCol) });
    if (startsCol)    out.push({ label: 'Starts',         value: fmtNum(sumCol(startsCol)),    delta: null, pos: null, bottomLine: 'episode starts',                               spark: spark(startsCol)    });
    if (downloadsCol) out.push({ label: 'Downloads',      value: fmtNum(sumCol(downloadsCol)), delta: null, pos: null, bottomLine: 'total downloads',                              spark: spark(downloadsCol) });
  } else {
    // Custom CSV — pick first 5 numeric columns
    const numericCols = headers.filter(h => {
      const vals = rows.slice(0, 5).map(r => parseFloat((r[h] ?? '').replace(/,/g, '')));
      return vals.filter(n => !isNaN(n)).length >= 3;
    });
    numericCols.slice(0, 5).forEach(col => {
      out.push({ label: col, value: fmtNum(sumCol(col)), delta: null, pos: null, bottomLine: `total ${col.toLowerCase()}`, spark: spark(col) });
    });
  }

  return out.slice(0, 5);
}

// ─── Hard-coded network metrics (shown when OAuth-connected) ──────────────────

const metrics: DashMetric[] = [
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

// Skeleton widths for experiment rows
const SKEL_ROWS = [
  { w1: '72%', w2: '60%', w3: '45%' },
  { w1: '58%', w2: '70%', w3: '50%' },
  { w1: '80%', w2: '55%', w3: '40%' },
];

export default function Dashboard() {
  const [builderOpen,   setBuilderOpen]   = useState(false);
  const [connectOpen,   setConnectOpen]   = useState(false);
  const { hasData, csvData, connections, youtubeChannels, connect, disconnect, connectYouTube, disconnectYouTubeChannel, reconnectYouTubeChannel, uploadCsv, clearCsv } = useConnections();

  const empty        = hasData !== true;
  // CSV data drives stat cards; OAuth (Spotify or active YT channel) drives experiments + growth score
  const showCsvStats = !!csvData;
  const showLiveData = connections.length > 0 || youtubeChannels.some(c => c.status === 'ACTIVE');
  const showStats    = showCsvStats || showLiveData;
  const activeMetrics: DashMetric[] = showCsvStats && !showLiveData ? deriveCsvMetrics(csvData!) : metrics;

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, pb: 8 }}>

      {/* ── Greeting ── */}
      <Box className="fade-in delay-1" sx={{ pt: { xs: 2.5, md: 5.5 }, pb: { xs: 3, md: 4 } }}>
        <Typography variant="h3" sx={{ color: C.textPrimary, fontWeight: 500 }}>
          Good morning, Alex.
        </Typography>
      </Box>

      {/* ── Empty state banner ── */}
      {empty && (
        <Box className="fade-in delay-1">
          <EmptyStateBanner onConnect={() => setConnectOpen(true)} />
        </Box>
      )}

      {/* ── Key metrics ── */}
      <Box className="fade-in delay-2" sx={{
        mb: 4,
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: `repeat(${activeMetrics.length}, 1fr)` },
        gap: 2,
      }}>
        {activeMetrics.map((m, idx) => {
          const sparkPath = showStats && m.spark ? buildSparkPath(m.spark) : null;
          const isLastOdd = idx === activeMetrics.length - 1 && activeMetrics.length % 2 !== 0;
          return (
            <Card key={m.label} sx={{
              overflow: 'hidden',
              gridColumn: { xs: isLastOdd ? 'span 2' : 'auto', md: 'auto' },
            }}>
              <Box sx={{ px: 2.5, pt: 2.5, pb: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, letterSpacing: '-0.005em', mb: 1.25, lineHeight: 1 }}>{m.label}</Typography>

                {/* Value */}
                {!showStats ? (
                  <Box sx={{ mb: sparkPath === null ? 1 : 0 }}>
                    <span className="skel-static" style={{ width: '60%', height: 28 }} />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                    <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: m.isScore ? '#E8C565' : C.textPrimary, letterSpacing: '-0.045em', lineHeight: 1 }}>{m.value}</Typography>
                    {m.isScore && <Typography sx={{ fontSize: '0.875rem', color: C.textSecondary }}>/100</Typography>}
                  </Box>
                )}

                {/* Sparkline */}
                {m.spark && (
                  <Box sx={{ my: 1.25 }}>
                    <svg width="100%" viewBox="0 0 100 28" preserveAspectRatio="none" style={{ display: 'block', height: 28 }}>
                      {!showStats ? (
                        <line x1="0" y1="18" x2="100" y2="18" stroke={C.grey300} strokeWidth="1.5" strokeLinecap="round" />
                      ) : (
                        <path d={sparkPath!} fill="none" stroke={C.grey300} strokeWidth="1.5" strokeLinecap="round" />
                      )}
                    </svg>
                  </Box>
                )}
                {!m.spark && <Box sx={{ flex: 1 }} />}

                {/* Footer */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: m.spark ? 0 : 1.5, pt: 1.5, borderTop: `1px solid ${C.grey300}` }}>
                  {showStats && m.delta && (
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: m.pos ? C.successDark : C.errorMain, letterSpacing: '-0.01em', flexShrink: 0 }}>{m.delta}</Typography>
                  )}
                  <Typography sx={{ fontSize: '0.75rem', color: !showStats ? C.textMuted : C.textSecondary, letterSpacing: '-0.005em', fontStyle: !showStats ? 'italic' : 'normal' }}>
                    {!showStats ? 'No data yet' : m.bottomLine}
                  </Typography>
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>

      {/* ── CSV source chip ── */}
      {csvData && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, mt: -1 }}>
          <Chip
            label={`${csvData.dataSource === 'YOUTUBE_EXPORT' ? 'YouTube Analytics' : csvData.dataSource === 'SPOTIFY_EXPORT' ? 'Spotify Podcasters' : 'Custom CSV'} · ${csvData.rowCount.toLocaleString()} rows`}
            size="small"
            onDelete={clearCsv}
            deleteIcon={<X size={12} />}
            sx={{
              height: 24,
              fontSize: '0.6875rem',
              fontWeight: 500,
              bgcolor: C.grey100,
              color: C.textSecondary,
              border: `1px solid ${C.grey300}`,
              '& .MuiChip-deleteIcon': { color: C.textMuted, '&:hover': { color: C.textPrimary } },
              '& .MuiChip-label': { px: '10px' },
            }}
          />
        </Box>
      )}

      <Grid container spacing={3} className="fade-in delay-3">

        {empty ? (
          /* ── Get Started card (no data connected) ── */
          <Grid size={{ xs: 12 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #1C1C1C 0%, #242424 100%)', border: 'none' }}>
              <CardContent sx={{ p: { xs: '24px !important', md: '36px !important' } }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 5 }, alignItems: { md: 'center' } }}>

                  {/* Copy + CTAs */}
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E8C565', mb: 1.5 }}>
                      Get started
                    </Typography>
                    <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.625rem' }, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.035em', lineHeight: 1.2, mb: 1.25 }}>
                      Start an experiment.<br />Build your growth score.
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, mb: 3, maxWidth: 500 }}>
                      FOBA tracks what you test, what wins, and how fast your network improves. Run your first experiment and watch your growth score take shape.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      <Button component={Link} href="/experiments" startIcon={<FlaskConical size={15} />}
                        sx={{ bgcolor: '#E8C565', color: '#1C1C1C', '&:hover': { bgcolor: '#D4B250' }, fontWeight: 700, fontSize: '0.875rem', borderRadius: '10px', px: 2.5, textTransform: 'none', boxShadow: 'none' }}>
                        Start an experiment
                      </Button>
                      <Button onClick={() => setConnectOpen(true)}
                        sx={{ borderRadius: '10px', px: 2.5, textTransform: 'none', fontWeight: 500, fontSize: '0.875rem', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.65)', '&:hover': { borderColor: 'rgba(255,255,255,0.4)', bgcolor: 'rgba(255,255,255,0.06)', color: '#FFFFFF' } }}>
                        Connect data
                      </Button>
                    </Box>
                  </Box>

                  {/* Feature tiles */}
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 1.75, flexShrink: 0, width: 288 }}>
                    {[
                      { icon: <FlaskConical size={17} color="#E8C565" />, title: 'Run experiments', body: 'A/B test thumbnails, titles, formats, and posting times across your whole network.' },
                      { icon: <TrendingUp size={17} color="#E8C565" />, title: 'Build your growth score', body: 'Track experiment velocity, win rate, and implementation speed to earn a 0–100 score.' },
                    ].map(f => (
                      <Box key={f.title} sx={{ p: 2, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', bgcolor: 'rgba(255,255,255,0.04)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Box sx={{ mt: 0.125, flexShrink: 0 }}>{f.icon}</Box>
                          <Box>
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF', mb: 0.375, letterSpacing: '-0.01em' }}>{f.title}</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>{f.body}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                </Box>
              </CardContent>
            </Card>
          </Grid>
        ) : (
        <>

        {/* ── Current experiments ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: '20px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em' }}>
                  Current experiments
                </Typography>
                {showLiveData && (
                  <Button component={Link} href="/experiments" size="small" endIcon={<ArrowRight size={13} />}
                    sx={{ fontSize: '0.75rem', color: C.textSecondary, textTransform: 'none', fontWeight: 400, letterSpacing: '-0.005em', minWidth: 0, px: 1, '&:hover': { color: C.textPrimary, backgroundColor: C.grey100 } }}>
                    View all
                  </Button>
                )}
              </Box>

              {/* Headers */}
              <Box sx={{ display: { xs: 'none', sm: 'grid' }, gridTemplateColumns: '1fr 120px 80px 64px 72px', gap: 1.5, pb: 1.25, borderBottom: `1px solid ${C.grey300}` }}>
                {['Experiment', 'Creator', 'Metric', 'Signal', 'Days'].map(col => (
                  <Typography key={col} sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted }}>{col}</Typography>
                ))}
              </Box>

              {!showLiveData ? (
                <>
                  {SKEL_ROWS.map((s, i) => (
                    <Box key={i} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 120px 80px 64px 72px' }, gap: { xs: 1, sm: 1.5 }, py: 1.75, borderBottom: i < SKEL_ROWS.length - 1 ? `1px solid ${C.grey100}` : 'none', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <span className="skel-static" style={{ width: s.w1, height: 12 }} />
                        <span className="skel-static" style={{ width: s.w2, height: 9 }} />
                      </Box>
                      <span className="skel-static" style={{ width: s.w3, height: 10, display: 'none' }} />
                      <span className="skel-static" style={{ width: '55%', height: 10 }} />
                      <span className="skel-static" style={{ width: '50%', height: 10 }} />
                      <span className="skel-static" style={{ width: '40%', height: 10 }} />
                    </Box>
                  ))}
                  <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pb: 1 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: C.grey100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FlaskConical size={20} color={C.textMuted} />
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: C.textPrimary, mb: 0.375, letterSpacing: '-0.01em' }}>No active experiments yet</Typography>
                      <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary }}>Start a test to track live results here.</Typography>
                    </Box>
                    <Button component={Link} href="/experiments" size="small" startIcon={<Plus size={14} />}
                      sx={{ bgcolor: C.textPrimary, color: '#FFFFFF', '&:hover': { bgcolor: '#2A2828' }, fontWeight: 600, fontSize: '0.8125rem', borderRadius: '10px', px: 2, textTransform: 'none', boxShadow: 'none' }}>
                      Start an experiment
                    </Button>
                  </Box>
                </>
              ) : (
                ACTIVE_EXPERIMENTS.map((exp, i) => (
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
                ))
              )}
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

                {!showLiveData ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2.5 }}>
                    {/* Empty donut */}
                    <Box sx={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
                      <svg width="90" height="90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r={R} fill="none" stroke={C.grey300} strokeWidth="8" strokeDasharray="4 3" />
                      </svg>
                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: C.textMuted, letterSpacing: '-0.04em', lineHeight: 1 }}>—</Typography>
                        <Typography sx={{ fontSize: '0.5625rem', color: C.textMuted, lineHeight: 1.4 }}>/100</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, mb: 0.5, letterSpacing: '-0.01em', lineHeight: 1.4 }}>Run experiments to build your score</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, lineHeight: 1.5 }}>Your network growth score appears here once you have active data.</Typography>
                    </Box>
                  </Box>
                ) : (
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
                )}

                {!showLiveData ? (
                  ['Experiment velocity', 'Win rate', 'Implementation'].map((label, i) => (
                    <Box key={label} sx={{ mb: i < 2 ? 1.5 : 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary }}>{label}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: C.textMuted }}>—</Typography>
                      </Box>
                      <Box sx={{ height: 3, borderRadius: 2, backgroundColor: C.grey300 }} />
                    </Box>
                  ))
                ) : (
                  GROWTH_SCORE.breakdown.map((b) => (
                    <Box key={b.label} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, letterSpacing: '-0.005em' }}>{b.label}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.textPrimary }}>{b.score}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={b.score}
                        sx={{ height: 3, borderRadius: 2, backgroundColor: C.grey300, '& .MuiLinearProgress-bar': { backgroundColor: b.score >= 75 ? C.successDark : b.score >= 60 ? C.warmMain : C.errorMain, borderRadius: 2 } }} />
                      <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, mt: 0.5 }}>{b.note}</Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Opportunities — always visible (template-based) */}
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
                  sx={{ mt: 1.5, fontSize: '0.75rem', color: C.textSecondary, borderColor: C.grey300, borderRadius: '10px', textTransform: 'none', fontWeight: 400, '&:hover': { borderColor: C.textPrimary, color: C.textPrimary, backgroundColor: 'transparent' } }}>
                  View all recommendations
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        </>
        )}

      </Grid>

      <ExperimentBuilder open={builderOpen} onClose={() => setBuilderOpen(false)} />
      <ConnectDataModal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        connections={connections}
        youtubeChannels={youtubeChannels}
        onConnect={connect}
        onDisconnect={disconnect}
        onConnectYouTube={connectYouTube}
        onDisconnectYouTubeChannel={disconnectYouTubeChannel}
        onReconnectYouTubeChannel={reconnectYouTubeChannel}
        onCsvUpload={uploadCsv}
        onViewData={() => setConnectOpen(false)}
      />
    </Box>
  );
}
