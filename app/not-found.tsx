'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { LayoutGrid, ArrowLeft } from 'lucide-react';

const C = {
  textPrimary:   '#1C1C1C',
  textSecondary: '#696764',
  textMuted:     '#A8A5A2',
  red:           '#F21A27',
  redLight:      'rgba(242, 26, 39, 0.06)',
  grey100:       '#F3EDE6',
  grey300:       '#DDD7D0',
};

export default function NotFound() {
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      px: 3,
      pb: { xs: '52px', md: 0 },
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background number */}
      <Typography sx={{
        position:   'absolute',
        fontSize:   { xs: '28vw', md: '18vw' },
        fontWeight: 800,
        color:      'rgba(0,0,0,0.04)',
        letterSpacing: '-0.06em',
        lineHeight: 1,
        userSelect: 'none',
        pointerEvents: 'none',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        whiteSpace: 'nowrap',
      }}>
        404
      </Typography>

      {/* Content */}
      <Box sx={{ position: 'relative', textAlign: 'center', maxWidth: 420 }}>

        {/* Icon badge */}
        <Box sx={{
          display:        'inline-flex',
          alignItems:     'center',
          justifyContent: 'center',
          width:  56,
          height: 56,
          borderRadius:    '16px',
          backgroundColor: C.redLight,
          mb: 3,
        }}>
          <Box sx={{
            width:  10, height: 10,
            borderRadius: '50%',
            bgcolor: C.red,
          }} />
        </Box>

        <Typography sx={{
          fontSize:      { xs: '1.75rem', sm: '2.25rem' },
          fontWeight:    600,
          color:         C.textPrimary,
          letterSpacing: '-0.04em',
          lineHeight:    1.15,
          mb:            1.5,
        }}>
          Page not found
        </Typography>

        <Typography sx={{
          fontSize:    '0.9375rem',
          color:       C.textSecondary,
          lineHeight:  1.65,
          letterSpacing: '-0.01em',
          mb:          4,
        }}>
          The page you're looking for doesn't exist or has been moved.
          Head back to the dashboard to keep building.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            component={Link}
            href="/"
            variant="contained"
            startIcon={<LayoutGrid size={15} />}
            sx={{
              bgcolor:       C.textPrimary,
              color:         '#FFFFFF',
              fontWeight:    500,
              fontSize:      '0.875rem',
              borderRadius:  '99px',
              textTransform: 'none',
              px: 3,
              py: 1.125,
              boxShadow:     '0 1px 3px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.10)',
              letterSpacing: '-0.01em',
              '&:hover': {
                bgcolor:   '#2A2828',
                boxShadow: '0 2px 8px rgba(0,0,0,0.22), 0 6px 20px rgba(0,0,0,0.12)',
              },
            }}
          >
            Go to dashboard
          </Button>

          <Button
            onClick={() => window.history.back()}
            variant="outlined"
            startIcon={<ArrowLeft size={15} />}
            sx={{
              color:         C.textSecondary,
              borderColor:   C.grey300,
              bgcolor:       '#FFFFFF',
              fontWeight:    400,
              fontSize:      '0.875rem',
              borderRadius:  '99px',
              textTransform: 'none',
              px: 3,
              py: 1.125,
              letterSpacing: '-0.01em',
              boxShadow:     '0 1px 2px rgba(0,0,0,0.06)',
              '&:hover': {
                borderColor:     C.textPrimary,
                color:           C.textPrimary,
                backgroundColor: '#FAFAFA',
                boxShadow:       '0 1px 4px rgba(0,0,0,0.10)',
              },
            }}
          >
            Go back
          </Button>
        </Box>

        {/* Divider + quick links */}
        <Box sx={{ mt: 5, pt: 3, borderTop: `1px solid ${C.grey300}` }}>
          <Typography sx={{ fontSize: '0.6875rem', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 2 }}>
            Or jump to
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Experiments', href: '/experiments' },
              { label: 'Analytics',   href: '/analytics'   },
              { label: 'Account',     href: '/account'     },
            ].map(({ label, href }) => (
              <Typography
                key={href}
                component={Link}
                href={href}
                sx={{
                  fontSize:       '0.8125rem',
                  color:          C.textSecondary,
                  textDecoration: 'none',
                  letterSpacing:  '-0.01em',
                  '&:hover':      { color: C.textPrimary, textDecoration: 'underline', textDecorationColor: C.grey300 },
                }}
              >
                {label}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
