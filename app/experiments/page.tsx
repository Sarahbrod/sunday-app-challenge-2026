'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import LinearProgress from '@mui/material/LinearProgress';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Plus, Sparkles, BookOpen, ChevronDown, CheckCircle, XCircle, MinusCircle, FlaskConical, Link2 } from 'lucide-react';

import { ACTIVE_EXPERIMENTS, COMPLETED_EXPERIMENTS, RECOMMENDED_EXPERIMENTS, EXPERIMENT_TEMPLATES } from '@/data/experiments';
import ExperimentBuilder from '@/components/ExperimentBuilder';
import ConnectDataModal from '@/components/ConnectDataModal';
import { useConnections } from '@/hooks/useConnections';

const C = {
  textPrimary:   '#1C1C1C',
  textSecondary: '#696764',
  textMuted:     '#A8A5A2',
  successDark:   '#1A5C3A',
  successMain:   '#6EC890',
  successLight:  '#D4F0E4',
  errorMain:     '#F21A27',
  errorLight:    '#FCE0E0',
  warmMain:      '#E8C565',
  yellowMain:    '#E8C565',
  yellowLight:   '#FBF6DC',
  grey100:       '#F3EDE6',
  grey300:       '#DDD7D0',
  purpleMain:    '#7B9FD4',
  purpleLight:   '#E0EAF8',
};

type Tab = 'recommended' | 'active' | 'completed';

const IMPACT_STYLE = {
  High:   { bg: '#1C1C1C', text: '#E8C565' },
  Medium: { bg: C.grey100, text: C.textSecondary },
  Low:    { bg: C.grey100, text: C.textMuted },
} as const;

const WINNER_STYLE = {
  variant:      { icon: CheckCircle,  color: '#1A5C3A', bg: '#D4F0E4', label: 'Variant won'   },
  control:      { icon: XCircle,      color: '#F21A27', bg: '#FCE0E0', label: 'Control won'   },
  inconclusive: { icon: MinusCircle,  color: '#A8A5A2', bg: '#F3EDE6', label: 'Inconclusive'  },
} as const;

export default function ExperimentLab() {
  const [tab, setTab] = useState<Tab>('recommended');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [expandedExp, setExpandedExp] = useState<string | null>(null);
  const [showLibrary,  setShowLibrary]  = useState(false);
  const [connectOpen,  setConnectOpen]  = useState(false);
  const { connections, youtubeChannels, connect, disconnect, connectYouTube, disconnectYouTubeChannel, reconnectYouTubeChannel, uploadCsv } = useConnections();
  const showLiveData = connections.length > 0 || youtubeChannels.some(c => c.status === 'ACTIVE');

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'recommended', label: 'Recommended', count: RECOMMENDED_EXPERIMENTS.length     },
    { key: 'active',      label: 'Active',       count: showLiveData ? ACTIVE_EXPERIMENTS.length : 0      },
    { key: 'completed',   label: 'Completed',    count: showLiveData ? COMPLETED_EXPERIMENTS.length : 0   },
  ];

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, pb: 8 }}>

      {/* ── Header ── */}
      <Box className="fade-in delay-1" sx={{ pt: { xs: 2.5, md: 5.5 }, pb: { xs: 3, md: 4 }, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ color: C.textPrimary, mb: 1, fontWeight: 500 }}>Experiment Lab</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<BookOpen size={16} />} onClick={() => setShowLibrary(v => !v)}
            sx={{ fontSize: '0.8125rem', color: C.textSecondary, borderColor: C.grey300, borderRadius: '10px', textTransform: 'none', fontWeight: 500, px: 2, py: 0.875, '&:hover': { borderColor: C.textPrimary, color: C.textPrimary, backgroundColor: 'transparent' } }}>
            Library
          </Button>
          {!showLiveData && (
            <Button variant="outlined" startIcon={<Link2 size={16} />} onClick={() => setConnectOpen(true)}
              sx={{ fontSize: '0.8125rem', color: C.textSecondary, borderColor: C.grey300, borderRadius: '10px', textTransform: 'none', fontWeight: 500, px: 2, py: 0.875, '&:hover': { borderColor: C.textPrimary, color: C.textPrimary, backgroundColor: 'transparent' } }}>
              Connect YouTube
            </Button>
          )}
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setBuilderOpen(true)}
            sx={{ bgcolor: '#222222', color: '#FFFFFF', '&:hover': { bgcolor: '#3A3A3A' }, fontWeight: 600, fontSize: '0.8125rem', borderRadius: '10px', px: 2, textTransform: 'none', boxShadow: 'none' }}>
            New experiment
          </Button>
        </Box>
      </Box>

      {/* ── Experiment library ── */}
      <Collapse in={showLibrary}>
        <Card className="fade-in delay-1" sx={{ mb: 3 }}>
          <CardContent sx={{ p: '20px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em' }}>Experiment library</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: C.textMuted }}>10 pre-built templates</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, gap: 1.5 }}>
              {EXPERIMENT_TEMPLATES.map((t) => (
                <Box key={t.id} onClick={() => setBuilderOpen(true)}
                  sx={{ p: 1.75, borderRadius: '10px', border: `1px solid ${C.grey300}`, cursor: 'pointer', transition: 'all 0.15s ease', '&:hover': { borderColor: C.textPrimary, backgroundColor: C.yellowLight } }}>
                  <Typography sx={{ fontSize: '1.25rem', mb: 0.75, lineHeight: 1 }}>{t.icon}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.3, mb: 0.5 }}>{t.name}</Typography>
                  <Typography sx={{ fontSize: '0.625rem', color: C.textMuted, lineHeight: 1.4, mb: 1 }}>{t.category}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: C.successDark }}>{t.avgImpact}</Typography>
                    <Chip label={t.difficulty} size="small" sx={{ height: 14, fontSize: '0.5rem', fontWeight: 600, bgcolor: t.difficulty === 'Easy' ? C.successLight : t.difficulty === 'Medium' ? C.yellowLight : C.errorLight, color: t.difficulty === 'Easy' ? C.successDark : t.difficulty === 'Medium' ? '#B89530' : C.errorMain, '& .MuiChip-label': { px: '5px' } }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      {/* ── Tabs ── */}
      <Box className="fade-in delay-2" sx={{ display: 'flex', borderBottom: `2px solid ${C.grey300}`, mb: 3 }}>
        {tabs.map(({ key, label, count }) => {
          const active = tab === key;
          return (
            <Box key={key} onClick={() => setTab(key)}
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 0.25, pb: 1.25, mr: 3, cursor: 'pointer', userSelect: 'none', borderBottom: `2px solid ${active ? C.textPrimary : 'transparent'}`, mb: '-2px', transition: 'border-color 0.15s ease', '&:hover': { borderBottomColor: active ? C.textPrimary : C.grey300 } }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400, color: active ? C.textPrimary : C.textSecondary, letterSpacing: '-0.01em', lineHeight: 1 }}>{label}</Typography>
              <Box sx={{ minWidth: 18, height: 18, borderRadius: '99px', backgroundColor: active ? C.textPrimary : C.grey300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: active ? '#fff' : C.textMuted, lineHeight: 1 }}>{count}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* ── Recommended ── */}
      {tab === 'recommended' && (
        <Box className="fade-in delay-2" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {RECOMMENDED_EXPERIMENTS.map((rec) => {
            const template = EXPERIMENT_TEMPLATES.find(t => t.id === rec.templateId);
            const impact = IMPACT_STYLE[rec.expectedImpact];
            return (
              <Card key={rec.id}>
                <CardContent sx={{ p: '20px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: C.yellowLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                        {template?.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.015em', lineHeight: 1.2, mb: 0.25 }}>{rec.templateName}</Typography>
                        <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary }}>{rec.creator}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                      <Chip label={rec.expectedImpact} size="small" sx={{ height: 20, bgcolor: impact.bg, color: impact.text, fontWeight: 600, fontSize: '0.5625rem', letterSpacing: '0.04em', '& .MuiChip-label': { px: '8px' } }} />
                      <Button variant="contained" size="small" onClick={() => setBuilderOpen(true)}
                        sx={{ bgcolor: '#222222', color: '#FFFFFF', '&:hover': { bgcolor: '#3A3A3A' }, fontWeight: 600, fontSize: '0.75rem', borderRadius: '8px', textTransform: 'none', boxShadow: 'none', px: 1.5, py: 0.5 }}>
                        Start
                      </Button>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, lineHeight: 1.6, letterSpacing: '-0.005em', mb: 1.5 }}>
                    {rec.rationale}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted }}>Confidence</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.textPrimary }}>{rec.confidence}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={rec.confidence}
                      sx={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: C.grey300, '& .MuiLinearProgress-bar': { backgroundColor: rec.confidence >= 80 ? C.successDark : C.warmMain, borderRadius: 2 } }} />
                  </Box>
                  {template && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${C.grey100}`, display: 'flex', gap: { xs: 1, sm: 2 } }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}><Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, mb: 0.25 }}>Metric</Typography><Typography sx={{ fontSize: '0.75rem', color: C.textPrimary, lineHeight: 1.4 }}>{template.successMetric}</Typography></Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}><Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, mb: 0.25 }}>Avg impact</Typography><Typography sx={{ fontSize: '0.75rem', color: C.successDark, fontWeight: 600, lineHeight: 1.4 }}>{template.avgImpact}</Typography></Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}><Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, mb: 0.25, whiteSpace: 'nowrap' }}>Time to result</Typography><Typography sx={{ fontSize: '0.75rem', color: C.textPrimary, lineHeight: 1.4 }}>{template.timeToResult}</Typography></Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* ── Active ── */}
      {tab === 'active' && (
        <Card className="fade-in delay-2">
          <CardContent sx={{ p: '20px !important' }}>
            <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: '1fr 110px 100px 80px 72px 72px', gap: 1.5, pb: 1.25, borderBottom: `1px solid ${C.grey300}` }}>
              {['Experiment', 'Creator', 'Variable', 'Metric', 'Signal', 'Days'].map(col => (
                <Typography key={col} sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted }}>{col}</Typography>
              ))}
            </Box>

            {!showLiveData ? (
              <Box sx={{ py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: C.grey100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FlaskConical size={22} color={C.textMuted} />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500, color: C.textPrimary, mb: 0.5, letterSpacing: '-0.015em' }}>Connect YouTube to track live results</Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, maxWidth: 340, lineHeight: 1.6 }}>
                    Link your YouTube channel so FOBA can measure experiment performance in real time.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button variant="contained" startIcon={<Link2 size={15} />} onClick={() => setConnectOpen(true)}
                    sx={{ bgcolor: C.textPrimary, color: '#FFFFFF', '&:hover': { bgcolor: '#2A2828' }, fontWeight: 600, fontSize: '0.8125rem', borderRadius: '10px', px: 2, textTransform: 'none', boxShadow: 'none' }}>
                    Connect YouTube
                  </Button>
                  <Button variant="outlined" startIcon={<Sparkles size={15} />} onClick={() => setTab('recommended')}
                    sx={{ color: C.textSecondary, borderColor: C.grey300, borderRadius: '10px', fontWeight: 500, fontSize: '0.8125rem', px: 2, textTransform: 'none', '&:hover': { borderColor: C.textPrimary, color: C.textPrimary, backgroundColor: 'transparent' } }}>
                    Browse recommendations
                  </Button>
                </Box>
              </Box>
            ) : (
              ACTIVE_EXPERIMENTS.map((exp, i) => (
                <Box key={exp.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', md: '1fr 110px 100px 80px 72px 72px' }, gap: { xs: 1, md: 1.5 }, py: 1.75, borderBottom: i < ACTIVE_EXPERIMENTS.length - 1 ? `1px solid ${C.grey100}` : 'none', alignItems: 'center' }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.3, mb: 0.2 }}>{exp.title}</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, lineHeight: 1.5, display: { md: 'none' } }}>{exp.creator} · {exp.daysRunning}d</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, lineHeight: 1.5, display: { xs: 'none', md: 'block' } }}>{exp.hypothesis.slice(0, 60)}…</Typography>
                  </Box>
                  <Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.8125rem', color: C.textSecondary }}>{exp.creator}</Typography>
                  <Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.75rem', color: C.textSecondary, lineHeight: 1.4 }}>{exp.variable.slice(0, 30)}</Typography>
                  <Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.75rem', color: C.textSecondary }}>{exp.successMetric}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {exp.signal === 'up'      && <TrendingUp size={15} color={C.successDark} />}
                    {exp.signal === 'down'    && <TrendingDown size={15} color={C.errorMain} />}
                    {exp.signal === 'neutral' && <Minus size={15} color={C.textMuted} />}
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: exp.signal === 'up' ? C.successDark : exp.signal === 'down' ? C.errorMain : C.textMuted }}>{exp.currentLift}</Typography>
                  </Box>
                  <Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.75rem', color: C.textMuted }}>{exp.daysRunning}d</Typography>
                </Box>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Completed ── */}
      {tab === 'completed' && (
        <Box className="fade-in delay-2" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!showLiveData ? (
            <Card>
              <CardContent sx={{ p: '20px !important' }}>
                <Box sx={{ py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#F3EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={22} color="#A8A5A2" />
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500, color: C.textPrimary, mb: 0.5, letterSpacing: '-0.015em' }}>No completed experiments yet</Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, maxWidth: 340, lineHeight: 1.6 }}>
                      Connect YouTube and run your first test — completed experiments with AI analysis appear here when you wrap up.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button variant="contained" startIcon={<Link2 size={15} />} onClick={() => setConnectOpen(true)}
                      sx={{ bgcolor: C.textPrimary, color: '#FFFFFF', '&:hover': { bgcolor: '#2A2828' }, fontWeight: 600, fontSize: '0.8125rem', borderRadius: '10px', px: 2, textTransform: 'none', boxShadow: 'none' }}>
                      Connect YouTube
                    </Button>
                    <Button variant="outlined" startIcon={<Sparkles size={15} />} onClick={() => setTab('recommended')}
                      sx={{ color: C.textSecondary, borderColor: C.grey300, borderRadius: '10px', fontWeight: 500, fontSize: '0.8125rem', px: 2, textTransform: 'none', '&:hover': { borderColor: C.textPrimary, color: C.textPrimary, backgroundColor: 'transparent' } }}>
                      See recommended tests
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ) : COMPLETED_EXPERIMENTS.map((exp) => {
            const isOpen = expandedExp === exp.id;
            const ws = WINNER_STYLE[exp.winner];
            const WinIcon = ws.icon;
            const template = EXPERIMENT_TEMPLATES.find(t => t.id === exp.templateId);
            return (
              <Card key={exp.id}>
                <CardContent sx={{ p: '20px !important' }}>
                  {/* Summary row */}
                  <Box onClick={() => setExpandedExp(isOpen ? null : exp.id)}
                    sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, cursor: 'pointer' }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: ws.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <WinIcon size={18} color={ws.color} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.375, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.015em', lineHeight: 1.2 }}>{exp.title}</Typography>
                        <Chip label={ws.label} size="small" sx={{ height: 18, bgcolor: ws.bg, color: ws.color, fontWeight: 600, fontSize: '0.5rem', letterSpacing: '0.04em', '& .MuiChip-label': { px: '6px' } }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary }}>{exp.creator} · {template?.category} · completed {exp.completedDate}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: exp.winner === 'variant' ? C.successDark : exp.winner === 'control' ? C.errorMain : C.textMuted, letterSpacing: '-0.03em', lineHeight: 1 }}>{exp.lift}</Typography>
                        <Typography sx={{ fontSize: '0.625rem', color: C.textMuted }}>{exp.successMetric}</Typography>
                      </Box>
                      <ChevronDown size={18} color={C.textMuted} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </Box>
                  </Box>

                  {/* Before/after */}
                  <Box sx={{ mt: 1.75, display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1, p: 1.5, borderRadius: '8px', backgroundColor: C.grey100 }}>
                      <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, mb: 0.5 }}>Control</Typography>
                      <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.03em' }}>{exp.baseline}{exp.metricUnit}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 1.5, borderRadius: '8px', backgroundColor: exp.winner === 'variant' ? C.successLight : exp.winner === 'control' ? C.errorLight : C.grey100 }}>
                      <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, mb: 0.5 }}>Variant</Typography>
                      <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: exp.winner === 'variant' ? C.successDark : exp.winner === 'control' ? C.errorMain : C.textPrimary, letterSpacing: '-0.03em' }}>{exp.result}{exp.metricUnit}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 1.5, borderRadius: '8px', backgroundColor: C.grey100 }}>
                      <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, mb: 0.5 }}>Significance</Typography>
                      <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.03em' }}>{exp.significance}%</Typography>
                    </Box>
                  </Box>

                  {/* AI report */}
                  <Collapse in={isOpen} timeout={200}>
                    <Box sx={{ mt: 2.5, pt: 2.5, borderTop: `1px solid ${C.grey300}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2 }}>
                        <Sparkles size={14} color={C.purpleMain} />
                        <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.purpleMain }}>AI Analysis</Typography>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        {[
                          { label: 'What happened',        text: exp.aiReport.whatHappened   },
                          { label: 'Why it may have',      text: exp.aiReport.whyItMayHave   },
                          { label: 'What we learned',      text: exp.aiReport.whatWeLearned  },
                          { label: 'What to test next',    text: exp.aiReport.whatToTestNext },
                        ].map(({ label, text }) => (
                          <Box key={label} sx={{ p: 1.75, borderRadius: '10px', backgroundColor: C.purpleLight }}>
                            <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.purpleMain, mb: 0.75 }}>{label}</Typography>
                            <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, lineHeight: 1.6, letterSpacing: '-0.005em' }}>{text}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

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
