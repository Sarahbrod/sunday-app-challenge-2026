import { createTheme } from '@mui/material/styles';

// ─── FOBA Design System — PioneerAi palette ───────────────────────────────────
// Yellow:    #F5E68A (hero accent)
// Orange:    #F07830 (warm accent / warning)
// Coral:     #E84030 (error / danger)
// Black:     #1A1818 (primary text / bg)
// Purple:    #8B6CF5 → #D4A0C8 (gradient)
// Cream:     #F5F2ED (background)

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#F5F2ED',
      paper: '#FFFFFF',
    },
    primary: {
      main: '#1A1818',
      dark: '#111010',
      light: '#3D3A3A',
      contrastText: '#F5E68A',
    },
    secondary: {
      main: '#8B6CF5',
      light: '#D4A0C8',
      dark: '#4828A8',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#E84030',
      dark: '#8C1808',
      light: '#FCE0DA',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F07830',
      dark: '#7A4808',
      light: '#FCE8D0',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#6EC890',
      dark: '#1A5C3A',
      light: '#D4F0E4',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#8B6CF5',
      dark: '#4828A8',
      light: '#E8E0FC',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#1A1818',
      secondary: '#696764',
      disabled: '#A8A5A0',
    },
    divider: 'rgba(0,0,0,0.06)',
    grey: {
      100: '#F5F2ED',
      300: '#E0DDD8',
      500: '#A8A5A0',
      700: '#696764',
      900: '#1A1818',
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
          backgroundColor: '#F5F2ED',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.06)',
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
