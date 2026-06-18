'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Eye, EyeOff, ArrowLeft, Check, TrendingUp, FlaskConical, BarChart2 } from 'lucide-react';

const C = {
  textPrimary:   '#1C1C1C',
  textSecondary: '#6B6764',
  textMuted:     '#A8A5A2',
  grey100:       '#F3EDE6',
  grey200:       '#EDE8E1',
  grey300:       '#DDD7D0',
  bg:            '#F3EDE6',
  red:           '#F21A27',
  yellow:        '#E8C565',
  yellowLight:   '#FBF6DC',
};

type AuthMode = 'signup' | 'login';

const ACCOUNT_TYPES = [
  { id: 'solo',     label: 'Solo',     icon: '🎙️', desc: 'Individual creator'           },
  { id: 'creator',  label: 'Creator',  icon: '✨',  desc: 'Content creator / influencer' },
  { id: 'agency',   label: 'Agency',   icon: '🏢', desc: 'Multi-creator management'      },
  { id: 'business', label: 'Business', icon: '💼', desc: 'Brand or media company'         },
];

const INTERESTS = [
  'Thumbnail Optimization', 'Title & Hook Writing', 'Audience Retention',
  'CTR Improvement', 'Monetization', 'Channel Growth', 'Content Scheduling',
  'Analytics & Data', 'Shorts Strategy', 'Collaboration', 'SEO & Discovery',
  'Community Building',
];

// ─── Step dots ────────────────────────────────────────────────────────────────

function StepDots({ step }: { step: 2 | 3 }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.625 }}>
      {[1, 2, 3].map((i) => {
        const done    = i < step;
        const current = i === step;
        return (
          <Box key={i} sx={{
            height: 6, width: current ? 18 : 6, borderRadius: '99px',
            backgroundColor: done || current ? C.textPrimary : C.grey300,
            opacity: done ? 0.35 : 1, transition: 'all 0.2s ease',
          }} />
        );
      })}
    </Box>
  );
}

// ─── Brand panel (left side of login) ────────────────────────────────────────

function BrandPanel() {
  return (
    <Box sx={{
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: '44%',
      minHeight: '100vh',
      backgroundColor: C.textPrimary,
      p: '52px 48px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background texture — subtle diagonal lines */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 32px)',
      }} />
      {/* Warm circle glow */}
      <Box sx={{
        position: 'absolute', width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,197,101,0.12) 0%, transparent 70%)',
        top: '-80px', right: '-120px', pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(242,26,39,0.08) 0%, transparent 70%)',
        bottom: '80px', left: '-60px', pointerEvents: 'none',
      }} />

      {/* Logo */}
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: '72px' }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            background: `linear-gradient(135deg, ${C.red} 0%, #C41520 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1 }}>F</Typography>
          </Box>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>FOBA Media</Typography>
        </Box>

        {/* Headline */}
        <Typography sx={{
          fontSize: 'clamp(1.625rem, 2.5vw, 2.25rem)',
          fontWeight: 700, color: '#FFFFFF',
          letterSpacing: '-0.03em', lineHeight: 1.15, mb: 2,
        }}>
          Built for creators<br />who test, learn,<br />and grow.
        </Typography>
        <Typography sx={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, mb: '56px' }}>
          Run structured experiments across your content, track what works, and compound every win.
        </Typography>

        {/* Feature list */}
        {[
          { icon: FlaskConical, label: 'A/B test thumbnails, titles, and hooks' },
          { icon: TrendingUp,   label: 'Track growth signals across platforms'  },
          { icon: BarChart2,    label: 'AI-powered experiment recommendations'  },
        ].map(({ icon: Icon, label }) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.75 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={15} color="rgba(255,255,255,0.7)" />
            </Box>
            <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.4, letterSpacing: '-0.01em' }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Bottom stats row */}
      <Box sx={{ position: 'relative', display: 'flex', gap: 4 }}>
        {[
          { value: '1,200+', label: 'Experiments run'  },
          { value: '67%',    label: 'Avg win rate'      },
          { value: '3.4×',   label: 'Avg growth uplift' },
        ].map(({ value, label }) => (
          <Box key={label}>
            <Typography sx={{ fontSize: '1.375rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.40)', mt: 0.5 }}>{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── OAuth icons ──────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.251 17.64 11.943 17.64 9.2z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1C1C1C">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();

  const [step,        setStep]       = useState<1 | 2 | 3>(1);
  const [authMode,    setAuthMode]   = useState<AuthMode>('signup');
  const [showPw,      setShowPw]     = useState(false);
  const [accountType, setAccType]    = useState<string | null>(null);
  const [interests,   setInterests]  = useState<string[]>([]);
  const [name,        setName]       = useState('');
  const [email,       setEmail]      = useState('');
  const [password,    setPassword]   = useState('');

  const finish = () => {
    localStorage.setItem('onboarding_complete', 'true');
    localStorage.setItem('has_data', 'false');
    router.replace('/');
  };

  const toggleInterest = (v: string) =>
    setInterests(p => p.includes(v) ? p.filter(i => i !== v) : [...p, v]);

  const inputSx = {
    borderRadius: '10px', fontSize: '0.8125rem',
    backgroundColor: '#FFFFFF',
  };
  const labelSx = { fontSize: '0.8125rem' };
  const ctaSx   = {
    bgcolor: C.textPrimary, color: '#FFFFFF',
    '&:hover': { bgcolor: '#2A2828' },
    fontWeight: 600, fontSize: '0.875rem',
    borderRadius: '10px', py: 1.375,
    textTransform: 'none', boxShadow: 'none',
  } as const;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', backgroundColor: C.bg }}>

      {/* ── Left brand panel (step 1 only) ── */}
      {step === 1 && <BrandPanel />}

      {/* ── Right / main content ── */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: '24px 20px', sm: '40px 48px', md: '48px 64px' },
        minHeight: '100vh',
      }}>

        {/* ── Screen 1: Auth ── */}
        {step === 1 && (
          <Box className="fade-in" sx={{ width: '100%', maxWidth: 400 }}>

            {/* Mobile logo (hidden on desktop where the panel shows) */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.25, mb: 4 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '8px', background: `linear-gradient(135deg, ${C.red} 0%, #C41520 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF' }}>F</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.02em' }}>FOBA Media</Typography>
            </Box>

            {/* Heading */}
            <Box sx={{ mb: 3.5 }}>
              <Typography sx={{ fontSize: '1.625rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.2, mb: 0.625 }}>
                Welcome to FOBA Media
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: C.textSecondary, lineHeight: 1.6 }}>
                {authMode === 'signup' ? 'Create your account to get started.' : 'Sign in to your account.'}
              </Typography>
            </Box>

            {/* Sign up / Log in toggle */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 3, p: 0.5, backgroundColor: C.grey200, borderRadius: '10px' }}>
              {(['signup', 'login'] as AuthMode[]).map((mode) => {
                const active = authMode === mode;
                return (
                  <Box key={mode} onClick={() => setAuthMode(mode)} sx={{
                    flex: 1, textAlign: 'center', py: 0.875, borderRadius: '8px',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    backgroundColor: active ? '#FFFFFF' : 'transparent',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                  }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400, color: active ? C.textPrimary : C.textSecondary, letterSpacing: '-0.01em' }}>
                      {mode === 'signup' ? 'Sign up' : 'Log in'}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Fields */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
              {authMode === 'signup' && (
                <TextField fullWidth label="Full name" value={name} onChange={e => setName(e.target.value)} size="small"
                  InputProps={{ sx: inputSx }} InputLabelProps={{ sx: labelSx }} />
              )}
              <TextField fullWidth label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} size="small"
                InputProps={{ sx: inputSx }} InputLabelProps={{ sx: labelSx }} />
              <Box>
                <TextField fullWidth label="Password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} size="small"
                  InputProps={{
                    sx: inputSx,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPw(v => !v)} edge="end" sx={{ color: C.textMuted }}>
                          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{ sx: labelSx }} />
                {authMode === 'login' && (
                  <Box sx={{ textAlign: 'right', mt: 0.75 }}>
                    <Typography component="span" sx={{ fontSize: '0.75rem', color: C.textSecondary, cursor: 'pointer', '&:hover': { color: C.textPrimary } }}>
                      Forgot password?
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Button fullWidth onClick={() => setStep(2)} sx={{ ...ctaSx, mb: 3 }}>
              {authMode === 'signup' ? 'Create account' : 'Sign in'}
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, px: 1.5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                or
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Button fullWidth variant="outlined" startIcon={<GoogleIcon />}
                sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textSecondary, borderColor: C.grey300, borderRadius: '10px', textTransform: 'none', py: 1.125, backgroundColor: '#FFFFFF', '&:hover': { borderColor: C.textPrimary, color: C.textPrimary, backgroundColor: '#FFFFFF' } }}>
                Continue with Google
              </Button>
              <Button fullWidth variant="outlined" startIcon={<AppleIcon />}
                sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.textSecondary, borderColor: C.grey300, borderRadius: '10px', textTransform: 'none', py: 1.125, backgroundColor: '#FFFFFF', '&:hover': { borderColor: C.textPrimary, color: C.textPrimary, backgroundColor: '#FFFFFF' } }}>
                Continue with Apple
              </Button>
            </Box>

            <Typography sx={{ textAlign: 'center', fontSize: '0.75rem', color: C.textMuted, mt: 3.5, lineHeight: 1.7 }}>
              By continuing you agree to FOBA Media's{' '}
              <Typography component="span" sx={{ color: C.textSecondary, cursor: 'pointer', '&:hover': { color: C.textPrimary } }}>Terms</Typography>
              {' '}and{' '}
              <Typography component="span" sx={{ color: C.textSecondary, cursor: 'pointer', '&:hover': { color: C.textPrimary } }}>Privacy Policy</Typography>.
            </Typography>
          </Box>
        )}

        {/* ── Screen 2: Account Type ── */}
        {step === 2 && (
          <Box className="fade-in" sx={{ width: '100%', maxWidth: 520 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
              <IconButton size="small" onClick={() => setStep(1)}
                sx={{ width: 32, height: 32, borderRadius: '8px', color: C.textSecondary, '&:hover': { backgroundColor: '#FFFFFF', color: C.textPrimary } }}>
                <ArrowLeft size={17} />
              </IconButton>
              <StepDots step={2} />
            </Box>

            <Typography sx={{ fontSize: '1.625rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.2, mb: 0.75 }}>
              What best describes you?
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: C.textSecondary, mb: 3.5, lineHeight: 1.6 }}>
              This helps us personalise your recommendations.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 4 }}>
              {ACCOUNT_TYPES.map(({ id, label, icon, desc }) => {
                const selected = accountType === id;
                return (
                  <Box key={id} onClick={() => setAccType(id)} sx={{
                    p: 2.5, borderRadius: '14px', cursor: 'pointer',
                    border: `1.5px solid ${selected ? C.textPrimary : C.grey300}`,
                    backgroundColor: selected ? C.textPrimary : '#FFFFFF',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: C.textPrimary, backgroundColor: selected ? C.textPrimary : C.grey100 },
                  }}>
                    <Typography sx={{ fontSize: '1.625rem', lineHeight: 1, mb: 1.25 }}>{icon}</Typography>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: selected ? '#FFFFFF' : C.textPrimary, letterSpacing: '-0.015em', mb: 0.375 }}>
                      {label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: selected ? 'rgba(255,255,255,0.55)' : C.textMuted, lineHeight: 1.4 }}>
                      {desc}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Button fullWidth disabled={!accountType} onClick={() => setStep(3)}
              sx={{ ...ctaSx, '&.Mui-disabled': { bgcolor: C.grey300, color: C.textMuted } }}>
              Continue
            </Button>
          </Box>
        )}

        {/* ── Screen 3: Interests ── */}
        {step === 3 && (
          <Box className="fade-in" sx={{ width: '100%', maxWidth: 520 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
              <IconButton size="small" onClick={() => setStep(2)}
                sx={{ width: 32, height: 32, borderRadius: '8px', color: C.textSecondary, '&:hover': { backgroundColor: '#FFFFFF', color: C.textPrimary } }}>
                <ArrowLeft size={17} />
              </IconButton>
              <StepDots step={3} />
            </Box>

            <Typography sx={{ fontSize: '1.625rem', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.2, mb: 0.75 }}>
              What are you most interested in?
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: C.textSecondary, mb: 3.5, lineHeight: 1.6 }}>
              Select all that apply — we'll tailor your experiment recommendations.
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
              {INTERESTS.map((v) => {
                const selected = interests.includes(v);
                return (
                  <Box key={v} onClick={() => toggleInterest(v)} sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.625,
                    px: 1.75, py: 0.875, borderRadius: '99px', cursor: 'pointer',
                    border: `1.5px solid ${selected ? C.textPrimary : C.grey300}`,
                    backgroundColor: selected ? C.textPrimary : '#FFFFFF',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: C.textPrimary, backgroundColor: selected ? C.textPrimary : C.grey100 },
                  }}>
                    {selected && <Check size={12} color="#FFFFFF" strokeWidth={2.5} />}
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: selected ? 600 : 400, color: selected ? '#FFFFFF' : C.textSecondary, letterSpacing: '-0.01em', lineHeight: 1 }}>
                      {v}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Button fullWidth onClick={finish} sx={{ ...ctaSx, mb: 1.5 }}>
              Get Started
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography component="span" onClick={finish}
                sx={{ fontSize: '0.8125rem', color: C.textMuted, cursor: 'pointer', letterSpacing: '-0.01em', '&:hover': { color: C.textSecondary } }}>
                Skip for now
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
