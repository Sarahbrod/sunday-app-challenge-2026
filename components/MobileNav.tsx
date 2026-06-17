'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { LayoutGrid, FlaskConical, BarChart2, Menu, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const NAV_ITEMS: { label: string; icon: LucideIcon; href: string }[] = [
  { label: 'Home',        icon: LayoutGrid,  href: '/'            },
  { label: 'Experiments', icon: FlaskConical, href: '/experiments' },
  { label: 'Analytics',   icon: BarChart2,    href: '/analytics'   },
];

const BRAND_AVATAR = 'https://api.dicebear.com/9.x/initials/svg?seed=SM&backgroundColor=f21a27&textColor=ffffff&fontWeight=700&fontSize=38';
const USER_AVATAR  = 'https://api.dicebear.com/9.x/lorelei/svg?seed=AlexChen&backgroundColor=d4f0e4';

const ACTIVE_ICON = '#F21A27';
const ACTIVE_BG   = 'rgba(242, 26, 39, 0.07)';
const ACTIVE_TEXT = '#1C1C1C';
const MUTED       = '#A8A5A2';

export const MOBILE_NAV_HEIGHT = 52;

export default function MobileNav() {
  const [open, setOpen]   = useState(false);
  const pathname          = usePathname();

  // Close dropdown on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const accountActive = isActive('/account');

  return (
    <>
      {/* ── Fixed top bar ─────────────────────────────────── */}
      <Box
        component="nav"
        sx={{
          display:         { xs: 'flex', md: 'none' },
          position:        'fixed',
          top:             0,
          left:            0,
          right:           0,
          height:          MOBILE_NAV_HEIGHT,
          zIndex:          1300,
          alignItems:      'center',
          justifyContent:  'space-between',
          px:              2,
          backgroundColor: '#FFFFFF',
          borderBottom:    open ? 'none' : '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={BRAND_AVATAR}
            sx={{ width: 28, height: 28, backgroundColor: '#F21A27', flexShrink: 0 }}
          >
            S
          </Avatar>
          <Typography sx={{
            fontSize: '0.875rem', fontWeight: 600, color: '#1C1C1C',
            letterSpacing: '-0.02em', lineHeight: 1,
          }}>
            Shameless Media
          </Typography>
        </Box>

        {/* Hamburger / close */}
        <IconButton
          onClick={() => setOpen((o) => !o)}
          size="small"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          sx={{
            width: 36, height: 36, borderRadius: '8px', color: '#1C1C1C',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' },
            transition: 'background-color 0.12s',
          }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </IconButton>
      </Box>

      {/* ── Dropdown panel ────────────────────────────────── */}
      <Box
        sx={{
          display:         { xs: 'block', md: 'none' },
          position:        'fixed',
          top:             MOBILE_NAV_HEIGHT,
          left:            0,
          right:           0,
          zIndex:          1299,
          // Slide in from top
          transform:       open ? 'translateY(0)' : 'translateY(-8px)',
          opacity:         open ? 1 : 0,
          pointerEvents:   open ? 'auto' : 'none',
          transition:      'transform 0.2s cubic-bezier(0.16,1,0.3,1), opacity 0.18s ease',
          backgroundColor: '#FFFFFF',
          borderBottom:    '1px solid rgba(0,0,0,0.06)',
          boxShadow:       '0 8px 24px rgba(0,0,0,0.08)',
        }}
      >
        <Box sx={{ px: 1.5, pt: 1, pb: 1.5 }}>

          {/* Nav items */}
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const active = isActive(href);
            return (
              <Box
                key={label}
                component={Link}
                href={href}
                sx={{
                  display:        'flex',
                  alignItems:     'center',
                  gap:            1.5,
                  px:             1.5,
                  py:             1.125,
                  borderRadius:   '10px',
                  textDecoration: 'none',
                  backgroundColor: active ? ACTIVE_BG : 'transparent',
                  mb:             0.25,
                  '&:active':     { backgroundColor: ACTIVE_BG },
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.25 : 1.75}
                  color={active ? ACTIVE_ICON : MUTED}
                />
                <Typography sx={{
                  fontSize:    '0.9375rem',
                  fontWeight:  active ? 600 : 400,
                  color:       active ? ACTIVE_TEXT : '#6B6764',
                  letterSpacing: '-0.01em',
                }}>
                  {label}
                </Typography>

                {active && (
                  <Box sx={{
                    ml: 'auto', width: 6, height: 6,
                    borderRadius: '50%', bgcolor: ACTIVE_ICON,
                  }} />
                )}
              </Box>
            );
          })}

          {/* Divider */}
          <Box sx={{ height: '1px', bgcolor: 'rgba(0,0,0,0.06)', my: 1, mx: 1.5 }} />

          {/* Account row */}
          <Box
            component={Link}
            href="/account"
            sx={{
              display:        'flex',
              alignItems:     'center',
              gap:            1.5,
              px:             1.5,
              py:             1,
              borderRadius:   '10px',
              textDecoration: 'none',
              backgroundColor: accountActive ? ACTIVE_BG : 'transparent',
              '&:active':     { backgroundColor: ACTIVE_BG },
            }}
          >
            <Avatar
              src={USER_AVATAR}
              sx={{
                width:        30, height: 30,
                outline:      accountActive ? `2px solid ${ACTIVE_ICON}` : '2px solid transparent',
                outlineOffset: '1px',
                flexShrink:   0,
                transition:   'outline 0.12s',
              }}
            >
              A
            </Avatar>
            <Box>
              <Typography sx={{
                fontSize: '0.9375rem', fontWeight: accountActive ? 600 : 500,
                color: ACTIVE_TEXT, letterSpacing: '-0.01em', lineHeight: 1.3,
              }}>
                Alex
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: MUTED, lineHeight: 1.3 }}>
                Growth Director
              </Typography>
            </Box>
            {accountActive && (
              <Box sx={{
                ml: 'auto', width: 6, height: 6,
                borderRadius: '50%', bgcolor: ACTIVE_ICON,
              }} />
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Backdrop ──────────────────────────────────────── */}
      <Box
        onClick={() => setOpen(false)}
        sx={{
          display:       { xs: 'block', md: 'none' },
          position:      'fixed',
          inset:         0,
          zIndex:        1298,
          backgroundColor: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(2px)',
          opacity:        open ? 1 : 0,
          pointerEvents:  open ? 'auto' : 'none',
          transition:     'opacity 0.18s ease',
        }}
      />
    </>
  );
}
