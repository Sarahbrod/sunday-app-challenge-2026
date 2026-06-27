'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import { Upload, Plus, TrendingUp, Users, Database } from 'lucide-react';
import type { CsvUploadResult } from '@/hooks/useCsvData';
import { TIER_STYLE } from '@/components/venueData';
import type { Tier } from '@/components/venueData';
import EmptyStateBanner from '@/components/EmptyStateBanner';
import ConnectDataModal from '@/components/ConnectDataModal';
import { useConnections } from '@/hooks/useConnections';
import {
  AreaChart, Area, XAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Cell, YAxis,
} from 'recharts';
import { PLAYBOOK, COMPLETED_EXPERIMENTS } from '@/data/experiments';

const C = {
  textPrimary:   '#1C1C1C',
  textSecondary: '#696764',
  textMuted:     '#A8A5A2',
  successDark:   '#1A5C3A',
  successMain:   '#6EC890',
  successLight:  '#D4F0E4',
  errorMain:     '#F21A27',
  warmMain:      '#E8C565',
  yellowMain:    '#E8C565',
  yellowLight:   '#FBF6DC',
  grey100:       '#F3EDE6',
  grey200:       '#EBE5DE',
  grey300:       '#DDD7D0',
  purpleMain:    '#7B9FD4',
};

const CREATORS_ROSTER = [
  { name: 'TechTalk Daily',   platform: 'YouTube',    tier: 'top'   as Tier, subs: '2.1M' },
  { name: 'Pod & Chill',      platform: 'Podcast',    tier: 'top'   as Tier, subs: '340K' },
  { name: 'Creative Brief',   platform: 'Newsletter', tier: 'good'  as Tier, subs: '89K'  },
  { name: 'Everyday Finance', platform: 'YouTube',    tier: 'good'  as Tier, subs: '890K' },
  { name: 'Morning Mindset',  platform: 'Podcast',    tier: 'good'  as Tier, subs: '210K' },
  { name: 'Sarah Codes',      platform: 'YouTube',    tier: 'good'  as Tier, subs: '560K' },
  { name: 'Pixel Perfect',    platform: 'YouTube',    tier: 'good'  as Tier, subs: '1.1M' },
  { name: 'The Hustle Recap', platform: 'Newsletter', tier: 'good'  as Tier, subs: '45K'  },
  { name: 'GameStream Live',  platform: 'YouTube',    tier: 'watch' as Tier, subs: '920K' },
  { name: 'Vlog Universe',    platform: 'YouTube',    tier: 'watch' as Tier, subs: '340K' },
  { name: 'ByteSize News',    platform: 'YouTube',    tier: 'risk'  as Tier, subs: '180K' },
];

const PLATFORM_COLORS: Record<string, string> = {
  YouTube:    '#F21A27',
  Podcast:    '#E8C565',
  Newsletter: '#1C1C1C',
};

const WEEKS = ['W7','W8','W9','W10','W11','W12','W13','W14','W15','W16','W17','W18'];

const TREND_DATA = WEEKS.map((week, i) => ({
  week,
  views:  [32,34,33,38,37,42,41,45,44,47,49,52][i],
  subs:   [16,17,16,19,18,21,20,23,21,23,24,25][i],
  engage: [5.8,6.0,5.9,6.2,6.1,6.4,6.3,6.6,6.5,6.7,6.8,6.9][i],
}));

const PLATFORM_DATA = [
  { label: 'YouTube',    count: 8, pct: 72, color: '#F21A27' },
  { label: 'Podcast',    count: 2, pct: 18, color: '#E8C565' },
  { label: 'Newsletter', count: 1, pct: 10, color: '#7B9FD4' },
];

function ChartTooltip({ active, payload, label, unit }: {
  active?: boolean; payload?: { value: number }[]; label?: string; unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: '#1C1C1C', px: 1.5, py: 1, borderRadius: '7px', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
      <Typography sx={{ fontSize: '0.5625rem', color: 'rgba(255,255,255,0.45)', mb: 0.25, letterSpacing: '0.04em' }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {payload[0].value}{unit}
      </Typography>
    </Box>
  );
}

function TrendPanel({ label, dataKey, unit, color, latest, delta }: {
  label: string; dataKey: string; unit: string; color: string; latest: string; delta: string;
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, letterSpacing: '-0.005em' }}>{label}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>{latest}</Typography>
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
          <CartesianGrid vertical={false} stroke={C.grey200} strokeDasharray="3 0" strokeWidth={1} />
          <XAxis dataKey="week" tickLine={false} axisLine={false}
            tick={{ fill: C.textMuted, fontSize: 9, letterSpacing: '0.02em' }} interval={5} dy={6} />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: C.grey300, strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5}
            fill={`url(#fill-${dataKey})`} dot={false} activeDot={{ r: 3, fill: color, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

const SOURCE_LABEL: Record<string, string> = {
  YOUTUBE_EXPORT: 'YouTube Analytics',
  SPOTIFY_EXPORT: 'Spotify Podcasters',
  CUSTOM:         'Custom CSV',
  UNKNOWN:        'CSV',
};

function CsvDataSection({ data }: { data: CsvUploadResult }) {
  const labelCol = data.columnHeaders.find(h =>
    /title|name|date|video|episode|show/i.test(h)
  ) ?? data.columnHeaders[0];
  const numericCol = data.columnHeaders.find(h =>
    /views|streams|plays|listeners|impressions|starts|downloads/i.test(h)
  );

  const chartRows = numericCol && labelCol
    ? data.sampleRows.slice(0, 12).map(r => ({
        label: (r[labelCol] ?? '').slice(0, 18) || '—',
        value: parseFloat((r[numericCol] ?? '0').replace(/,/g, '')) || 0,
      })).filter(r => r.value > 0)
    : [];

  const displayLabel = SOURCE_LABEL[data.dataSource] ?? 'CSV';

  return (
    <Card className="fade-in delay-1" sx={{ mb: 3, border: `1px solid #DDD7D0` }}>
      <CardContent sx={{ p: '24px !important' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#F3EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={16} color={C.textMuted} />
            </Box>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em' }}>
              Your {displayLabel} data
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`${data.rowCount.toLocaleString()} rows`}  size="small" sx={{ height: 18, bgcolor: '#F3EDE6', color: C.textSecondary, fontWeight: 600, fontSize: '0.5625rem', '& .MuiChip-label': { px: '7px' } }} />
            <Chip label={`${data.columnCount} columns`} size="small" sx={{ height: 18, bgcolor: '#F3EDE6', color: C.textSecondary, fontWeight: 600, fontSize: '0.5625rem', '& .MuiChip-label': { px: '7px' } }} />
            {data.truncated && <Chip label="Truncated" size="small" sx={{ height: 18, bgcolor: '#FFF0F0', color: '#B91C1C', fontWeight: 600, fontSize: '0.5625rem', '& .MuiChip-label': { px: '7px' } }} />}
          </Box>
        </Box>
        {data.summaryStats && Object.keys(data.summaryStats).length > 0 && (
          <Box sx={{ display: 'flex', gap: 3, mb: 2.5, mt: 1.5, flexWrap: 'wrap' }}>
            {Object.entries(data.summaryStats).map(([k, v]) => (
              <Box key={k}>
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>{v}</Typography>
                <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, mt: 0.375 }}>{k}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Chart */}
        {chartRows.length > 1 && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, mb: 1.5 }}>
              {numericCol} by {labelCol}
            </Typography>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartRows} margin={{ top: 0, right: 4, bottom: 0, left: 0 }} barSize={14}>
                <XAxis dataKey="label" tickLine={false} axisLine={false}
                  tick={{ fill: C.textMuted, fontSize: 8 }} />
                <YAxis hide />
                <CartesianGrid vertical={false} stroke={C.grey200} strokeDasharray="3 0" strokeWidth={1} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0] as { payload: { label: string }; value: number };
                  return (
                    <Box sx={{ bgcolor: '#1C1C1C', px: 1.5, py: 1, borderRadius: '7px' }}>
                      <Typography sx={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.45)', mb: 0.25 }}>{d.payload.label}</Typography>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                        {typeof d.value === 'number' ? d.value.toLocaleString() : d.value}
                      </Typography>
                    </Box>
                  );
                }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="value" fill={C.textPrimary} radius={[3, 3, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Data table */}
        <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, mb: 1 }}>
          Data preview · first {Math.min(data.sampleRows.length, 20)} rows
        </Typography>
        <Box sx={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${C.grey300}` }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.6875rem' }}>
            <thead>
              <tr>
                {data.columnHeaders.slice(0, 6).map(h => (
                  <th key={h} style={{ padding: '7px 12px', textAlign: 'left', backgroundColor: '#F3EDE6', color: C.textMuted, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', borderBottom: `1px solid ${C.grey300}`, fontSize: '0.5625rem' }}>
                    {h.length > 20 ? h.slice(0, 20) + '…' : h}
                  </th>
                ))}
                {data.columnHeaders.length > 6 && (
                  <th style={{ padding: '7px 12px', backgroundColor: '#F3EDE6', color: C.textMuted, fontSize: '0.5rem', borderBottom: `1px solid ${C.grey300}` }}>+{data.columnHeaders.length - 6} more</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.sampleRows.slice(0, 20).map((row, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9F5EF' }}>
                  {data.columnHeaders.slice(0, 6).map(h => (
                    <td key={h} style={{ padding: '6px 12px', color: C.textSecondary, borderBottom: i < Math.min(data.sampleRows.length, 20) - 1 ? `1px solid #EDE8E1` : 'none', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(row[h] ?? '')}
                    </td>
                  ))}
                  {data.columnHeaders.length > 6 && <td style={{ borderBottom: i < Math.min(data.sampleRows.length, 20) - 1 ? `1px solid #EDE8E1` : 'none' }} />}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        {data.rowCount > 20 && (
          <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, mt: 1.25 }}>
            Showing 20 of {data.rowCount.toLocaleString()} rows.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [uploadModalOpen, setUploadModal] = useState(false);
  const { hasData, csvData, connections, youtubeChannels, connect, disconnect, connectYouTube, disconnectYouTubeChannel, reconnectYouTubeChannel, uploadCsv } = useConnections();
  const empty = hasData !== true;
  const showNetworkCharts = connections.length > 0 || youtubeChannels.some(c => c.status === 'ACTIVE');

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, pb: 8 }}>

      {/* ── Header ── */}
      <Box className="fade-in delay-1" sx={{
        pt: { xs: 3, md: 5.5 }, pb: { xs: 3, md: 4 },
        display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between', gap: { xs: 2, sm: 0 },
      }}>
        <Typography variant="h3" sx={{ color: C.textPrimary, fontWeight: 500 }}>Performance</Typography>
        <Button
          variant="outlined"
          startIcon={<Upload size={16} />}
          onClick={() => setUploadModal(true)}
          sx={{
            fontSize: '0.8125rem', fontWeight: 500,
            color: C.textSecondary,
            borderColor: C.grey300,
            borderRadius: '10px', textTransform: 'none', px: 2, py: 0.875,
            '&:hover': { borderColor: C.textPrimary, color: C.textPrimary, backgroundColor: 'transparent' },
            alignSelf: { xs: 'flex-start', sm: 'auto' },
          }}
        >
          Connect data
        </Button>
      </Box>

      {/* ── Empty state banner ── */}
      {empty && (
        <Box className="fade-in delay-1">
          <EmptyStateBanner
            onConnect={() => setUploadModal(true)}
            label="Connect your data to see network performance"
          />
        </Box>
      )}

      {/* ── Uploaded CSV data ── */}
      {csvData && <CsvDataSection data={csvData} />}

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

          {showNetworkCharts ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: { xs: 4, md: 5 } }}>
              <TrendPanel label="Weekly views"    dataKey="views"  unit="M" color={C.textPrimary} latest="52M"  delta="+8%"   />
              <TrendPanel label="Subscriber gain" dataKey="subs"   unit="K" color={C.warmMain}    latest="25K"  delta="+12%"  />
              <TrendPanel label="Avg engagement"  dataKey="engage" unit="%" color={C.purpleMain}  latest="6.9%" delta="+0.4%" />
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: { xs: 4, md: 5 } }}>
              {[
                { label: 'Weekly views',    icon: <TrendingUp size={18} color="#A8A5A2" />, desc: 'Views per week across all channels' },
                { label: 'Subscriber gain', icon: <Users size={18} color="#A8A5A2" />,      desc: 'Net new subscribers per week'       },
                { label: 'Avg engagement',  icon: <TrendingUp size={18} color="#A8A5A2" />, desc: 'Average engagement rate per video'  },
              ].map(({ label, icon, desc }) => (
                <Box key={label}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary }}>{label}</Typography>
                    <span className="skel-static" style={{ width: 52, height: 18 }} />
                  </Box>
                  <Box sx={{ height: 90, borderRadius: '8px', backgroundColor: '#F3EDE6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                    {icon}
                    <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, textAlign: 'center', lineHeight: 1.4 }}>{desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
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

              {showNetworkCharts ? (
                <>
                  <Box sx={{ mb: 3 }}>
                    <ResponsiveContainer width="100%" height={80}>
                      <BarChart data={PLATFORM_DATA} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }} barSize={10}>
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis type="category" dataKey="label" width={72} tickLine={false} axisLine={false}
                          tick={{ fill: C.textSecondary, fontSize: 12, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }} />
                        <CartesianGrid horizontal={false} stroke={C.grey200} strokeDasharray="3 0" strokeWidth={1} />
                        <Tooltip cursor={{ fill: 'transparent' }}
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload as typeof PLATFORM_DATA[0];
                            return (
                              <Box sx={{ bgcolor: '#1C1C1C', px: 1.5, py: 1, borderRadius: '7px' }}>
                                <Typography sx={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.45)', mb: 0.25 }}>{d.label}</Typography>
                                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{d.pct}%</Typography>
                                <Typography sx={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.45)' }}>{d.count} creators</Typography>
                              </Box>
                            );
                          }}
                        />
                        <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                          {PLATFORM_DATA.map((d) => <Cell key={d.label} fill={d.color} opacity={0.85} />)}
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
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 3 }}>
                    {[{ label: 'YouTube', w: '72%', color: '#F21A27' }, { label: 'Podcast', w: '18%', color: '#E8C565' }, { label: 'Newsletter', w: '10%', color: '#7B9FD4' }].map(p => (
                      <Box key={p.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, width: 72, flexShrink: 0 }}>{p.label}</Typography>
                        <Box sx={{ flex: 1, height: 10, borderRadius: '0 4px 4px 0', backgroundColor: C.grey300 }} />
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    {['YouTube', 'Podcast', 'Newsletter'].map(l => (
                      <Box key={l} sx={{ display: 'flex', alignItems: 'center', gap: 0.625 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: C.grey300 }} />
                        <span className="skel-static" style={{ width: 48, height: 10 }} />
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ pt: 2.5, borderTop: `1px solid ${C.grey300}` }}>
                    <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, mb: 1.5 }}>Experiment results</Typography>
                    {[80, 65, 50, 70].map((w, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${C.grey100}` }}>
                        <span className="skel-static" style={{ width: `${w}%`, height: 10 }} />
                        <span className="skel-static" style={{ width: 36, height: 10, marginLeft: 12 }} />
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Creator playbook ── */}
        <Grid size={{ xs: 12, md: 7 }}>
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
                        <Chip label={entry.category} size="small" sx={{ height: 16, bgcolor: C.yellowLight, color: '#B89530', fontWeight: 600, fontSize: '0.5rem', '& .MuiChip-label': { px: '6px' } }} />
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
        </Grid>
      </Grid>

      {/* ── Creator roster ── */}
      <Card className="fade-in delay-4" sx={{ mt: 3 }}>
        <CardContent sx={{ p: '24px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em' }}>Creator roster</Typography>
            <Button startIcon={<Plus size={16} />} size="small"
              sx={{ fontSize: '0.75rem', color: C.textSecondary, textTransform: 'none', fontWeight: 400, '&:hover': { color: C.textPrimary } }}>
              Add creator
            </Button>
          </Box>
          <Typography sx={{ fontSize: '0.75rem', color: C.textMuted, mb: 3 }}>All creators in the network</Typography>
          {showNetworkCharts ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 1 }}>
              {CREATORS_ROSTER.map((c) => {
                const ts = TIER_STYLE[c.tier];
                return (
                  <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: '8px', border: `1px solid ${C.grey300}`, '&:hover': { borderColor: C.textPrimary } }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ts.bg, flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '2px', bgcolor: PLATFORM_COLORS[c.platform] ?? C.textMuted }} />
                        <Typography sx={{ fontSize: '0.625rem', color: C.textMuted }}>{c.platform} · {c.subs}</Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 1, mb: 3 }}>
                {[75, 60, 80, 55, 70, 65, 72, 58].map((w, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: '8px', border: `1px solid ${C.grey300}` }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: C.grey300, flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <span className="skel-static" style={{ width: `${w}%`, height: 10 }} />
                      <span className="skel-static" style={{ width: '45%', height: 8 }} />
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: C.grey100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} color={C.textMuted} />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: C.textPrimary, mb: 0.375, letterSpacing: '-0.01em' }}>No creators added yet</Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary }}>Connect your account to track creator performance.</Typography>
                </Box>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <ConnectDataModal
        open={uploadModalOpen}
        onClose={() => setUploadModal(false)}
        connections={connections}
        youtubeChannels={youtubeChannels}
        onConnect={connect}
        onDisconnect={disconnect}
        onConnectYouTube={connectYouTube}
        onDisconnectYouTubeChannel={disconnectYouTubeChannel}
        onReconnectYouTubeChannel={reconnectYouTubeChannel}
        onCsvUpload={uploadCsv}
        onViewData={() => setUploadModal(false)}
      />

    </Box>
  );
}
