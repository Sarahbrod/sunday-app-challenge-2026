import { createTheme } from '@mui/material/styles';

// ─── Shameless Media Design System ───────────────────────────────────────────
// Bold red:      #F21A27  (KEY brand — CTAs, active, at-risk)
// Wine red:      #8C0015  (dark red — gradients, deep accents)
// Periwinkle:    #7B9FD4  (secondary blue)
// Butter yellow: #E8C565  (warm accent)
// Paper white:   #F3EDE6  (background)
// Umber:         #2A1318  (dark panels)
// Charcoal:      #1C1C1C  (primary text)

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#F3EDE6',
      paper: '#FFFFFF',
    },
    primary: {
      main: '#F21A27',
      dark: '#8C0015',
      light: '#FCE0E0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7B9FD4',
      light: '#E0EAF8',
      dark: '#2A5A8C',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#F21A27',
      dark: '#8C0015',
      light: '#FCE0E0',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#E8C565',
      dark: '#B89530',
      light: '#FBF6DC',
      contrastText: '#2A1318',
    },
    success: {
      main: '#6EC890',
      dark: '#1A5C3A',
      light: '#D4F0E4',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#7B9FD4',
      dark: '#2A5A8C',
      light: '#E0EAF8',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#1C1C1C',
      secondary: '#6B6764',
      disabled: '#A8A5A2',
    },
    divider: 'rgba(0,0,0,0.06)',
    grey: {
      100: '#F3EDE6',
      300: '#DDD7D0',
      500: '#A8A5A2',
      700: '#6B6764',
      900: '#1C1C1C',
    },
  },
  typography: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    h1: { fontWeight: 300, letterSpacing: '-0.025em', lineHeight: 1.1 },
    h2: { fontWeight: 300, letterSpacing: '-0.02em',  lineHeight: 1.15 },
    h3: { fontWeight: 300, letterSpacing: '-0.018em', lineHeight: 1.2 },
    h4: { fontWeight: 400, letterSpacing: '-0.012em', lineHeight: 1.25 },
    h5: { fontWeight: 500, letterSpacing: '-0.008em', lineHeight: 1.3 },
    h6: { fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.4 },
    subtitle1: { fontWeight: 400, letterSpacing: '-0.01em',  lineHeight: 1.5  },
    subtitle2: { fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.45 },
    body1: { fontSize: '0.875rem',   letterSpacing: '-0.01em',  lineHeight: 1.6  },
    body2: { fontSize: '0.8125rem',  letterSpacing: '-0.008em', lineHeight: 1.55 },
    caption:  { fontSize: '0.6875rem', letterSpacing: '0.05em', fontWeight: 500, textTransform: 'uppercase' as const },
    overline: { fontSize: '0.6875rem', letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' as const, lineHeight: 1.5 },
    button:   { fontWeight: 500, letterSpacing: '-0.005em', textTransform: 'none' as const, fontSize: '0.8125rem' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': { fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif !important' },
        body: { fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', backgroundColor: '#F3EDE6' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.06)', borderRadius: 12, backgroundImage: 'none', transition: 'box-shadow 0.18s ease' },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: '20px', '&:last-child': { paddingBottom: '20px' } } },
    },
    MuiPaper:   { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiChip: {
      styleOverrides: {
        root:  { fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 500, fontSize: '0.6875rem', letterSpacing: '0.01em', height: 22 },
        label: { paddingLeft: 8, paddingRight: 8 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root:      { borderRadius: 8, fontWeight: 500, textTransform: 'none', letterSpacing: '-0.01em', boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
        sizeSmall: { fontSize: '0.75rem', padding: '4px 12px' },
      },
    },
    MuiListItemButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.06)', height: 4 },
        bar:  { borderRadius: 4 },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: 'rgba(0,0,0,0.06)' } } },
  },
});

export default theme;
