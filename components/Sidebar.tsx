'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';

const EXPANDED_W  = 220;
const COLLAPSED_W = 60;

const NAV_ITEMS = [
  { label: 'Home',        icon: GridViewRoundedIcon,  href: '/'            },
  { label: 'Experiments', icon: BiotechOutlinedIcon,  href: '/experiments' },
  { label: 'Analytics',   icon: BarChartOutlinedIcon, href: '/analytics'   },
];

const HIGHLIGHT     = '#F5E68A';
const ACTIVE_TEXT   = '#1A1818';
const ACTIVE_ICON   = '#1A1818';
const INACTIVE_TEXT = '#696764';
const INACTIVE_ICON = '#A8A5A0';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-w',
      collapsed ? `${COLLAPSED_W}px` : `${EXPANDED_W}px`
    );
  }, [collapsed]);

  return (
    <Box
      component="nav"
      sx={{
        width: collapsed ? COLLAPSED_W : EXPANDED_W,
        transition: 'width 0.22s ease',
        flexShrink: 0,
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid rgba(0,0,0,0.05)',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        zIndex: 1200,
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      {collapsed ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2.5, pb: 2 }}>
          <IconButton onClick={() => setCollapsed(false)} size="small"
            sx={{ width: 32, height: 32, borderRadius: '6px', color: '#696764', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: '#1A1818' }, transition: 'all 0.14s ease' }}>
            <SpaceDashboardOutlinedIcon sx={{ fontSize: '1.125rem' }} />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ px: 2, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: '#F5E68A', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif !important', fontSize: '0.875rem', fontWeight: 700, color: '#1A1818', lineHeight: 1, userSelect: 'none', letterSpacing: '-0.02em' }}>
              S
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flex: 1, minWidth: 0, cursor: 'pointer', '&:hover .switcher-chevron': { color: '#1A1818' } }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1818', letterSpacing: '-0.02em', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Shameless Media
            </Typography>
            <UnfoldMoreRoundedIcon className="switcher-chevron" sx={{ fontSize: '1rem', color: '#A8A5A0', flexShrink: 0, transition: 'color 0.14s ease' }} />
          </Box>

          <IconButton onClick={() => setCollapsed(true)} size="small"
            sx={{ flexShrink: 0, width: 28, height: 28, borderRadius: '6px', color: '#A8A5A0', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: '#696764' }, transition: 'all 0.14s ease' }}>
            <SpaceDashboardOutlinedIcon sx={{ fontSize: '1.125rem' }} />
          </IconButton>
        </Box>
      )}

      {/* ── Nav items ── */}
      <List sx={{ px: collapsed ? 0.75 : 1.5, pt: 0.5, flex: 1, overflowY: 'auto' }} disablePadding>
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const active = isActive(href);
          return (
            <ListItem key={label} disablePadding sx={{ mb: 0.25 }}>
              {collapsed ? (
                <Tooltip title={label} placement="right" arrow>
                  <ListItemButton component={Link} href={href}
                    sx={{ borderRadius: '8px', py: 0.8, px: 0, justifyContent: 'center', backgroundColor: active ? HIGHLIGHT : 'transparent', '&:hover': { backgroundColor: active ? HIGHLIGHT : 'rgba(245,230,138,0.1)' }, transition: 'background-color 0.12s ease', minHeight: 36 }}>
                    <ListItemIcon sx={{ minWidth: 0, color: active ? ACTIVE_ICON : INACTIVE_ICON, '& .MuiSvgIcon-root': { fontSize: '1.0625rem' } }}>
                      <Icon />
                    </ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              ) : (
                <ListItemButton component={Link} href={href}
                  sx={{ borderRadius: '8px', py: 0.8, px: 1.25, backgroundColor: active ? HIGHLIGHT : 'transparent', '&:hover': { backgroundColor: active ? HIGHLIGHT : 'rgba(245,230,138,0.1)' }, transition: 'background-color 0.12s ease', minHeight: 36 }}>
                  <ListItemIcon sx={{ minWidth: 28, color: active ? ACTIVE_ICON : INACTIVE_ICON, '& .MuiSvgIcon-root': { fontSize: '1rem' } }}>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText primary={label}
                    primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 400, color: active ? ACTIVE_TEXT : INACTIVE_TEXT, letterSpacing: '-0.01em', lineHeight: 1.3 }} />
                </ListItemButton>
              )}
            </ListItem>
          );
        })}
      </List>

      {/* ── Bottom: account ── */}
      <Box sx={{ px: collapsed ? 0.75 : 1.5, pt: 0.5, pb: 3 }}>
        <Box sx={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.06)', mb: 1.5 }} />
        {(() => {
          const accountActive = isActive('/account');
          return collapsed ? (
            <Tooltip title="Alex — Account" placement="right" arrow>
              <Box component={Link} href="/account"
                sx={{ display: 'flex', justifyContent: 'center', py: 0.875, cursor: 'pointer', borderRadius: '10px', backgroundColor: accountActive ? '#F5E68A' : 'transparent', '&:hover': { backgroundColor: accountActive ? '#F5E68A' : 'rgba(245,230,138,0.1)' }, transition: 'background-color 0.14s ease', textDecoration: 'none' }}>
                <Avatar sx={{ width: 30, height: 30, backgroundColor: accountActive ? '#1A1818' : '#F5E68A', color: accountActive ? '#F5E68A' : '#1A1818', fontSize: '0.75rem', fontWeight: 700 }}>A</Avatar>
              </Box>
            </Tooltip>
          ) : (
            <Box component={Link} href="/account"
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.25, py: 0.875, borderRadius: '10px', cursor: 'pointer', backgroundColor: accountActive ? '#F5E68A' : 'transparent', '&:hover': { backgroundColor: accountActive ? '#F5E68A' : 'rgba(245,230,138,0.1)' }, transition: 'background-color 0.14s ease', textDecoration: 'none' }}>
              <Avatar sx={{ width: 30, height: 30, backgroundColor: accountActive ? '#1A1818' : '#F5E68A', color: accountActive ? '#F5E68A' : '#1A1818', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>A</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: accountActive ? 600 : 500, color: '#1A1818', letterSpacing: '-0.01em', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Alex
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: accountActive ? '#1A1818' : '#A8A5A0', letterSpacing: '-0.005em', lineHeight: 1.4, whiteSpace: 'nowrap' }}>
                  Growth Director
                </Typography>
              </Box>
            </Box>
          );
        })()}
      </Box>
    </Box>
  );
}
