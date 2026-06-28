'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import LinearProgress from '@mui/material/LinearProgress';
import { TrendingUp, TrendingDown, Minus, Plus, Sparkles, ChevronDown, CheckCircle, XCircle, MinusCircle, FlaskConical, Link2 } from 'lucide-react';

import { ACTIVE_EXPERIMENTS, COMPLETED_EXPERIMENTS, RECOMMENDED_EXPERIMENTS, EXPERIMENT_TEMPLATES } from '@/data/experiments';
import ExperimentBuilder from '@/components/ExperimentBuilder';
import ConnectDataModal from '@/components/ConnectDataModal';
import { useConnections } from '@/hooks/useConnections';
import { api, type ExperimentRecord } from '@/lib/api';

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

type Tab = 'active' | 'completed';

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
  const [tab, setTab] = useState<Tab>('active');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [expandedExp, setExpandedExp] = useState<string | null>(null);
  const [connectOpen,  setConnectOpen]  = useState(false);
  const [dbExperiments, setDbExperiments] = useState<ExperimentRecord[] | null>(null);
  const { connections, youtubeChannels, connect, disconnect, connectYouTube, disconnectYouTubeChannel, reconnectYouTubeChannel, uploadCsv } = useConnections();
  const showLiveData = connections.length > 0 || youtubeChannels.some(c => c.status === 'ACTIVE');

  useEffect(() => {
    api.experiments.list()
      .then(setDbExperiments)
      .catch(() => setDbExperiments(null)); // Not logged in — fall back to static data
  }, []);

  const activeExperiments  = dbExperiments ? dbExperiments.filter(e => e.status === 'ACTIVE')    : ACTIVE_EXPERIMENTS;
  const completedExperiments = dbExperiments ? dbExperiments.filter(e => e.status === 'COMPLETED') : COMPLETED_EXPERIMENTS;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'active',    label: 'Active',    count: showLiveData ? activeExperiments.length : 0    },
    { key: 'completed', label: 'Completed', count: showLiveData ? completedExperiments.length : 0 },
  ];

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, pb: 8 }}>

      {/* ── Header ── */}
      <Box className="fade-in delay-1" sx={{ pt: { xs: 2.5, md: 5.5 }, pb: { xs: 3, md: 4 }, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ color: C.textPrimary, mb: 1, fontWeight: 500 }}>Experiment Lab</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setBuilderOpen(true)}
          sx={{ bgcolor: '#222222', color: '#FFFFFF', '&:hover': { bgcolor: '#3A3A3A' }, fontWeight: 600, fontSize: '0.8125rem', borderRadius: '10px', px: 2, textTransform: 'none', boxShadow: 'none' }}>
          New experiment
        </Button>
      </Box>

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
              <Box>
                {/* Get started prompt */}
                <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, borderBottom: `1px solid ${C.grey300}` }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: C.grey100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FlaskConical size={22} color={C.textMuted} />
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500, color: C.textPrimary, mb: 0.5, letterSpacing: '-0.015em' }}>Connect YouTube to track live results</Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, maxWidth: 340, lineHeight: 1.6 }}>
                      Link your YouTube channel so FOBA can measure experiment performance in real time.
                    </Typography>
                  </Box>
                  <Button variant="contained" startIcon={<Link2 size={15} />} onClick={() => setConnectOpen(true)}
                    sx={{ bgcolor: C.textPrimary, color: '#FFFFFF', '&:hover': { bgcolor: '#2A2828' }, fontWeight: 600, fontSize: '0.8125rem', borderRadius: '10px', px: 2, textTransform: 'none', boxShadow: 'none' }}>
                    Connect YouTube
                  </Button>
                </Box>

                {/* Recommendations */}
                <Box sx={{ pt: 2.5, pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Sparkles size={14} color={C.textMuted} />
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted }}>
                      Recommended experiments to start
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {RECOMMENDED_EXPERIMENTS.map((rec) => {
                      const template = EXPERIMENT_TEMPLATES.find(t => t.id === rec.templateId);
                      const impact = IMPACT_STYLE[rec.expectedImpact];
                      return (
                        <Box key={rec.id} sx={{ p: 2, borderRadius: '10px', border: `1px solid ${C.grey300}` }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.25 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Box sx={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: C.yellowLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', flexShrink: 0 }}>
                                {template?.icon}
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.015em', lineHeight: 1.2, mb: 0.2 }}>{rec.templateName}</Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary }}>{rec.creator}</Typography>
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
                          <Typography sx={{ fontSize: '0.8125rem', color: C.textSecondary, lineHeight: 1.6, letterSpacing: '-0.005em', mb: 1.25 }}>
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
                            <Box sx={{ mt: 1.25, pt: 1.25, borderTop: `1px solid ${C.grey100}`, display: 'flex', gap: { xs: 1, sm: 2 } }}>
                              <Box sx={{ flex: 1, minWidth: 0 }}><Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, mb: 0.25 }}>Metric</Typography><Typography sx={{ fontSize: '0.75rem', color: C.textPrimary, lineHeight: 1.4 }}>{template.successMetric}</Typography></Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}><Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, mb: 0.25 }}>Avg impact</Typography><Typography sx={{ fontSize: '0.75rem', color: C.successDark, fontWeight: 600, lineHeight: 1.4 }}>{template.avgImpact}</Typography></Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}><Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, mb: 0.25, whiteSpace: 'nowrap' }}>Time to result</Typography><Typography sx={{ fontSize: '0.75rem', color: C.textPrimary, lineHeight: 1.4 }}>{template.timeToResult}</Typography></Box>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            ) : (
              activeExperiments.map((exp: typeof ACTIVE_EXPERIMENTS[0] | ExperimentRecord, i) => {
                const id             = exp.id;
                const title          = exp.title;
                const creator        = 'creator' in exp ? exp.creator : (exp as ExperimentRecord).creator_name;
                const variable       = exp.variable;
                const successMetric  = 'successMetric' in exp ? exp.successMetric : (exp as ExperimentRecord).success_metric;
                const signal         = exp.signal;
                const currentLift    = 'currentLift' in exp ? exp.currentLift : (exp as ExperimentRecord).current_lift;
                const daysRunning    = 'daysRunning' in exp ? exp.daysRunning : (exp as ExperimentRecord).days_running;
                const hypothesis     = exp.hypothesis;
                return (
                  <Box key={id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', md: '1fr 110px 100px 80px 72px 72px' }, gap: { xs: 1, md: 1.5 }, py: 1.75, borderBottom: i < activeExperiments.length - 1 ? `1px solid ${C.grey100}` : 'none', alignItems: 'center' }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.3, mb: 0.2 }}>{title}</Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, lineHeight: 1.5, display: { md: 'none' } }}>{creator} · {daysRunning}d</Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, lineHeight: 1.5, display: { xs: 'none', md: 'block' } }}>{hypothesis.slice(0, 60)}…</Typography>
                    </Box>
                    <Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.8125rem', color: C.textSecondary }}>{creator}</Typography>
                    <Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.75rem', color: C.textSecondary, lineHeight: 1.4 }}>{variable.slice(0, 30)}</Typography>
                    <Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.75rem', color: C.textSecondary }}>{successMetric}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {signal === 'up'      && <TrendingUp size={15} color={C.successDark} />}
                      {signal === 'down'    && <TrendingDown size={15} color={C.errorMain} />}
                      {signal === 'neutral' && <Minus size={15} color={C.textMuted} />}
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: signal === 'up' ? C.successDark : signal === 'down' ? C.errorMain : C.textMuted }}>{currentLift}</Typography>
                    </Box>
                    <Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.75rem', color: C.textMuted }}>{daysRunning}d</Typography>
                  </Box>
                );
              })
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
                    <Button variant="outlined" startIcon={<Sparkles size={15} />} onClick={() => setTab('active')}
                      sx={{ color: C.textSecondary, borderColor: C.grey300, borderRadius: '10px', fontWeight: 500, fontSize: '0.8125rem', px: 2, textTransform: 'none', '&:hover': { borderColor: C.textPrimary, color: C.textPrimary, backgroundColor: 'transparent' } }}>
                      See recommendations
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ) : (completedExperiments as typeof COMPLETED_EXPERIMENTS).map((exp) => {
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
