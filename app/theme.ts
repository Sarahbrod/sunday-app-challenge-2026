import { createTheme } from '@mui/material/styles';

// ─── Sunday Design System ────────────────────────────────────────────────────
// Main:      #FF17E9 (magenta), #E8308A (print pink), #000000, #FFFFFF
// Greys:     #B7B5BB, #F5F5F6
// Nav:       #FDF3FD highlight, grey text
// Red:       #6F0C23 → #E77171 → #FDDFDF  (error / danger)
// Green:     #2E5158 → #8DD8A5 → #E1FBED  (success / positive)
// Blue:      #2D3482 → #7193E9 → #EBEDFB  (info)
// Warm:      #72430B → #F0B680 → #F9E5CD  (brand warmth / Dishoom)
// Yellow:    #5A5D38 → #F3DF76 → #F9F8CD  (warning)

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#F6F6F9',
      paper: '#FFFFFF',
    },
    primary: {
      main: '#E8308A',
      dark: '#C01F6E',
      light: '#FDDFDF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#400F66',
      light: '#D0ABED',
      dark: '#2A0A44',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#E77171',
      dark: '#6F0C23',
      light: '#FDDFDF',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F3DF76',
      dark: '#72430B',
      light: '#F9F8CD',
      contrastText: '#3D2A00',
    },
    success: {
      main: '#8DD8A5',
      dark: '#2E5158',
      light: '#E1FBED',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#7193E9',
      dark: '#2D3482',
      light: '#EBEDFB',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#0A0A0A',
      secondary: '#6B6970',
      disabled: '#B7B5BB',
    },
    divider: 'rgba(0,0,0,0.06)',
    grey: {
      100: '#F5F5F6',
      300: '#E2E1E5',
      500: '#B7B5BB',
      700: '#6B6970',
      900: '#1A1A1A',
    },
  },
  typography: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    h1: { fontWeight: 300, letterSpacing: '-0.025em', lineHeight: 1.1 },
    h2: { fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.15 },
    h3: { fontWeight: 300, letterSpacing: '-0.018em', lineHeight: 1.2 },
    h4: { fontWeight: 400, letterSpacing: '-0.012em', lineHeight: 1.25 },
    h5: { fontWeight: 500, letterSpacing: '-0.008em', lineHeight: 1.3 },
    h6: { fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.4 },
    subtitle1: { fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.5 },
    subtitle2: { fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.45 },
    body1: { fontSize: '0.875rem', letterSpacing: '-0.01em', lineHeight: 1.6 },
    body2: { fontSize: '0.8125rem', letterSpacing: '-0.008em', lineHeight: 1.55 },
    caption: {
      fontSize: '0.6875rem',
      letterSpacing: '0.05em',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
    },
    overline: {
      fontSize: '0.6875rem',
      letterSpacing: '0.08em',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
      letterSpacing: '-0.005em',
      textTransform: 'none' as const,
      fontSize: '0.8125rem',
    },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': {
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif !important',
        },
        body: {
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          backgroundColor: '#F6F6F9',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.045)',
          borderRadius: 12,
          backgroundImage: 'none',
          transition: 'box-shadow 0.18s ease, transform 0.18s ease',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',
          '&:last-child': { paddingBottom: '20px' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 500,
          fontSize: '0.6875rem',
          letterSpacing: '0.01em',
          height: 22,
        },
        label: { paddingLeft: 8, paddingRight: 8 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          textTransform: 'none',
          letterSpacing: '-0.01em',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        sizeSmall: { fontSize: '0.75rem', padding: '4px 12px' },
      },
    },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(0,0,0,0.06)',
          height: 4,
        },
        bar: { borderRadius: 4 },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: 'rgba(0,0,0,0.06)' } },
    },
  },
});

export default theme;
