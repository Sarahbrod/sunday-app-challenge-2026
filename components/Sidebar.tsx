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
import { LayoutGrid, FlaskConical, BarChart2, PanelLeft, ChevronsUpDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const EXPANDED_W  = 248;
const COLLAPSED_W = 60;

const NAV_ITEMS: { label: string; icon: LucideIcon; href: string }[] = [
  { label: 'Home',        icon: LayoutGrid,   href: '/'            },
  { label: 'Experiments', icon: FlaskConical,  href: '/experiments' },
  { label: 'Analytics',   icon: BarChart2,     href: '/analytics'   },
];

const HIGHLIGHT     = 'rgba(242, 26, 39, 0.1)';
const ACTIVE_TEXT   = '#1C1C1C';
const ACTIVE_ICON   = '#F21A27';
const INACTIVE_TEXT = '#6B6764';
const INACTIVE_ICON = '#A8A5A2';

const BRAND_AVATAR = 'https://api.dicebear.com/9.x/initials/svg?seed=SM&backgroundColor=f21a27&textColor=ffffff&fontWeight=700&fontSize=38';
const USER_AVATAR  = '/alex-avatar.jpeg';

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
    <Box component="nav" sx={{
      width: collapsed ? COLLAPSED_W : EXPANDED_W,
      transition: 'width 0.22s ease',
      flexShrink: 0, position: 'fixed', top: 0, left: 0,
      height: '100vh', backgroundColor: '#FFFFFF',
      borderRight: '1px solid rgba(0,0,0,0.05)',
      display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
      zIndex: 1200, overflow: 'hidden',
    }}>

      {/* ── Header ── */}
      {collapsed ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2.5, pb: 2 }}>
          <IconButton onClick={() => setCollapsed(false)} size="small"
            sx={{ width: 32, height: 32, borderRadius: '6px', color: '#6B6764', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: '#1C1C1C' }, transition: 'all 0.14s ease' }}>
            <PanelLeft size={18} />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ px: 2, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar src={BRAND_AVATAR} sx={{ width: 36, height: 36, flexShrink: 0, backgroundColor: '#F21A27' }}>S</Avatar>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flex: 1, minWidth: 0, cursor: 'pointer', '&:hover .chevron': { color: '#1C1C1C' } }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1C1C1C', letterSpacing: '-0.02em', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              Shameless Media
            </Typography>
            <Box className="chevron" sx={{ display: 'flex', color: '#A8A5A2', transition: 'color 0.14s ease', ml: 0.25 }}>
              <ChevronsUpDown size={14} />
            </Box>
          </Box>

          <IconButton onClick={() => setCollapsed(true)} size="small"
            sx={{ flexShrink: 0, width: 28, height: 28, borderRadius: '6px', color: '#A8A5A2', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: '#6B6764' }, transition: 'all 0.14s ease' }}>
            <PanelLeft size={16} />
          </IconButton>
        </Box>
      )}

      {/* ── Nav ── */}
      <List sx={{ px: collapsed ? 0.75 : 1.5, pt: 0.5, flex: 1, overflowY: 'auto' }} disablePadding>
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const active = isActive(href);
          return (
            <ListItem key={label} disablePadding sx={{ mb: 0.25 }}>
              {collapsed ? (
                <Tooltip title={label} placement="right" arrow>
                  <ListItemButton component={Link} href={href} sx={{
                    borderRadius: '8px', py: 0.8, px: 0, justifyContent: 'center',
                    backgroundColor: active ? HIGHLIGHT : 'transparent',
                    '&:hover': { backgroundColor: active ? HIGHLIGHT : 'rgba(242,26,39,0.07)' },
                    transition: 'background-color 0.12s ease', minHeight: 36,
                    color: active ? ACTIVE_ICON : INACTIVE_ICON,
                  }}>
                    <Icon size={17} strokeWidth={active ? 2 : 1.75} />
                  </ListItemButton>
                </Tooltip>
              ) : (
                <ListItemButton component={Link} href={href} sx={{
                  borderRadius: '8px', py: 0.8, px: 1.25,
                  backgroundColor: active ? HIGHLIGHT : 'transparent',
                  '&:hover': { backgroundColor: active ? HIGHLIGHT : 'rgba(242,26,39,0.07)' },
                  transition: 'background-color 0.12s ease', minHeight: 36,
                  color: active ? ACTIVE_ICON : INACTIVE_ICON,
                  gap: 1.25,
                }}>
                  <Icon size={16} strokeWidth={active ? 2 : 1.75} />
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 400, color: active ? ACTIVE_TEXT : INACTIVE_TEXT, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                    {label}
                  </Typography>
                </ListItemButton>
              )}
            </ListItem>
          );
        })}
      </List>

      {/* ── Account ── */}
      <Box sx={{ px: collapsed ? 0.75 : 1.5, pt: 0.5, pb: 3 }}>
        <Box sx={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.06)', mb: 1.5 }} />
        {(() => {
          const accountActive = isActive('/account');
          return collapsed ? (
            <Tooltip title="Alex — Account" placement="right" arrow>
              <Box component={Link} href="/account" sx={{
                display: 'flex', justifyContent: 'center', py: 0.875,
                borderRadius: '10px',
                backgroundColor: accountActive ? HIGHLIGHT : 'transparent',
                '&:hover': { backgroundColor: accountActive ? HIGHLIGHT : 'rgba(242,26,39,0.07)' },
                transition: 'background-color 0.14s ease', textDecoration: 'none',
              }}>
                <Avatar src={USER_AVATAR} sx={{ width: 30, height: 30, backgroundColor: '#F21A27', outline: accountActive ? '2px solid #F21A27' : 'none', outlineOffset: '1px' }}>A</Avatar>
              </Box>
            </Tooltip>
          ) : (
            <Box component={Link} href="/account" sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, px: 1.25, py: 0.875,
              borderRadius: '10px',
              backgroundColor: accountActive ? HIGHLIGHT : 'transparent',
              '&:hover': { backgroundColor: accountActive ? HIGHLIGHT : 'rgba(242,26,39,0.07)' },
              transition: 'background-color 0.14s ease', textDecoration: 'none',
            }}>
              <Avatar src={USER_AVATAR} sx={{ width: 30, height: 30, backgroundColor: '#F21A27', flexShrink: 0, outline: accountActive ? '2px solid #F21A27' : 'none', outlineOffset: '1px' }}>A</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: accountActive ? 600 : 500, color: '#1C1C1C', letterSpacing: '-0.01em', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Alex
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: '#A8A5A2', letterSpacing: '-0.005em', lineHeight: 1.4 }}>
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
