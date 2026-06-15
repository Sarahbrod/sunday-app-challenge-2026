'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { EXPERIMENT_TEMPLATES } from '@/data/experiments';

const C = {
  textPrimary:   '#1A1818',
  textSecondary: '#696764',
  textMuted:     '#A8A5A0',
  yellowMain:    '#F5E68A',
  successDark:   '#1A5C3A',
  warmMain:      '#F07830',
  grey100:       '#F5F2ED',
  grey300:       '#E0DDD8',
};

const CREATORS = ['TechTalk Daily','Pod & Chill','Creative Brief','Everyday Finance','Morning Mindset','Sarah Codes','Pixel Perfect','The Hustle Recap','GameStream Live','Vlog Universe','ByteSize News'];
const METRICS  = ['CTR','30s audience retention','Avg view duration','Subscriber conversion','Search impressions','Comment engagement','Longform click-through','Session duration'];
const IMPACTS: Array<'Low' | 'Medium' | 'High'> = ['Low', 'Medium', 'High'];

const IMPACT_STYLE = {
  Low:    { active: { bgcolor: C.grey300,       color: C.textPrimary } },
  Medium: { active: { bgcolor: C.warmMain,      color: '#fff'        } },
  High:   { active: { bgcolor: C.textPrimary,   color: C.yellowMain  } },
};

interface Props { open: boolean; onClose: () => void; }

export default function ExperimentBuilder({ open, onClose }: Props) {
  const [templateId, setTemplateId]   = useState('');
  const [creator, setCreator]         = useState('');
  const [hypothesis, setHypothesis]   = useState('');
  const [variable, setVariable]       = useState('');
  const [metric, setMetric]           = useState('');
  const [startDate, setStartDate]     = useState('');
  const [impact, setImpact]           = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [confidence, setConfidence]   = useState(70);
  const [submitted, setSubmitted]     = useState(false);

  const template = EXPERIMENT_TEMPLATES.find(t => t.id === templateId);

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    const t = EXPERIMENT_TEMPLATES.find(t => t.id === id);
    if (t) {
      setHypothesis(t.defaultHypothesis);
      setMetric(t.successMetric);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTemplateId(''); setCreator(''); setHypothesis(''); setVariable(''); setMetric(''); setStartDate('');
      setImpact('Medium'); setConfidence(70);
      onClose();
    }, 1800);
  };

  const isValid = templateId && creator && hypothesis && variable && metric;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 24px 60px rgba(0,0,0,0.16)', m: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 3, pb: 2, borderBottom: `1px solid ${C.grey300}` }}>
        <Box>
          <Typography sx={{ fontSize: '1.0625rem', fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.02em' }}>New experiment</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: C.textMuted, mt: 0.25 }}>Define your hypothesis and what you're testing</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: C.textMuted, '&:hover': { color: C.textPrimary } }}>
          <CloseRoundedIcon sx={{ fontSize: '1.125rem' }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {submitted ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2rem', mb: 1.5 }}>🧪</Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: C.textPrimary, mb: 0.5 }}>Experiment created</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: C.textMuted }}>Added to your active experiments</Typography>
          </Box>
        ) : (
          <>
            {/* Template + Creator */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl size="small">
                <InputLabel sx={{ fontSize: '0.8125rem' }}>Experiment type</InputLabel>
                <Select value={templateId} label="Experiment type" onChange={e => handleTemplateChange(e.target.value)} sx={{ fontSize: '0.8125rem', borderRadius: '8px' }}>
                  {EXPERIMENT_TEMPLATES.map(t => (
                    <MenuItem key={t.id} value={t.id} sx={{ fontSize: '0.8125rem' }}>{t.icon} {t.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel sx={{ fontSize: '0.8125rem' }}>Creator</InputLabel>
                <Select value={creator} label="Creator" onChange={e => setCreator(e.target.value)} sx={{ fontSize: '0.8125rem', borderRadius: '8px' }}>
                  {CREATORS.map(c => <MenuItem key={c} value={c} sx={{ fontSize: '0.8125rem' }}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            {template && (
              <Box sx={{ p: 1.75, borderRadius: '10px', backgroundColor: C.grey100, display: 'flex', gap: 2 }}>
                <Typography sx={{ fontSize: '1.25rem' }}>{template.icon}</Typography>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.textPrimary, mb: 0.25 }}>{template.name}</Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: C.textSecondary, lineHeight: 1.5 }}>{template.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.875 }}>
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: C.successDark }}>{template.avgImpact} avg</Typography>
                    <Typography sx={{ fontSize: '0.625rem', color: C.textMuted }}>·</Typography>
                    <Typography sx={{ fontSize: '0.625rem', color: C.textMuted }}>{template.timeToResult}</Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Hypothesis */}
            <TextField label="Hypothesis" multiline rows={2} value={hypothesis} onChange={e => setHypothesis(e.target.value)}
              placeholder="If we [change X], then [metric Y] will [increase/decrease] because [reason]."
              InputProps={{ sx: { fontSize: '0.8125rem', borderRadius: '8px' } }}
              InputLabelProps={{ sx: { fontSize: '0.8125rem' } }} size="small" />

            {/* Variable */}
            <TextField label="Variable being tested" value={variable} onChange={e => setVariable(e.target.value)}
              placeholder="e.g. Thumbnail style (emotion face vs. graphic)"
              InputProps={{ sx: { fontSize: '0.8125rem', borderRadius: '8px' } }}
              InputLabelProps={{ sx: { fontSize: '0.8125rem' } }} size="small" />

            {/* Metric + Date */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl size="small">
                <InputLabel sx={{ fontSize: '0.8125rem' }}>Success metric</InputLabel>
                <Select value={metric} label="Success metric" onChange={e => setMetric(e.target.value)} sx={{ fontSize: '0.8125rem', borderRadius: '8px' }}>
                  {METRICS.map(m => <MenuItem key={m} value={m} sx={{ fontSize: '0.8125rem' }}>{m}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField type="date" label="Start date" value={startDate} onChange={e => setStartDate(e.target.value)}
                InputProps={{ sx: { fontSize: '0.8125rem', borderRadius: '8px' } }}
                InputLabelProps={{ shrink: true, sx: { fontSize: '0.8125rem' } }} size="small" />
            </Box>

            {/* Expected impact */}
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, mb: 1 }}>Expected impact</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {IMPACTS.map(i => (
                  <Box key={i} onClick={() => setImpact(i)}
                    sx={{ px: 2, py: 0.75, borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', transition: 'all 0.15s',
                      ...(impact === i ? IMPACT_STYLE[i].active : { bgcolor: C.grey100, color: C.textSecondary }),
                      '&:hover': impact !== i ? { bgcolor: C.grey300 } : {} }}>
                    {i}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Confidence */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary }}>Confidence level</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: C.textPrimary }}>{confidence}%</Typography>
              </Box>
              <Slider value={confidence} onChange={(_, v) => setConfidence(v as number)} min={0} max={100} step={5}
                sx={{ color: confidence >= 80 ? C.successDark : confidence >= 60 ? C.warmMain : C.textMuted, '& .MuiSlider-thumb': { width: 14, height: 14 }, '& .MuiSlider-track': { height: 4 }, '& .MuiSlider-rail': { height: 4, color: C.grey300 } }} />
              <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted }}>How confident are you this experiment will show a positive result?</Typography>
            </Box>
          </>
        )}
      </DialogContent>

      {!submitted && (
        <Box sx={{ px: 3, pb: 3, pt: 1, display: 'flex', gap: 1.5 }}>
          <Button onClick={onClose} fullWidth variant="outlined"
            sx={{ fontSize: '0.8125rem', color: C.textSecondary, borderColor: C.grey300, borderRadius: '10px', textTransform: 'none', fontWeight: 400, py: 1 }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} fullWidth variant="contained" disabled={!isValid}
            sx={{ fontSize: '0.8125rem', fontWeight: 600, borderRadius: '10px', textTransform: 'none', py: 1, boxShadow: 'none', bgcolor: C.textPrimary, color: C.yellowMain, '&:hover': { bgcolor: '#2A2828' }, '&.Mui-disabled': { bgcolor: C.grey300, color: C.textMuted } }}>
            Create experiment
          </Button>
        </Box>
      )}
    </Dialog>
  );
}
