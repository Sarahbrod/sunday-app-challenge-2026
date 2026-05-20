'use client';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';

const NAV_ITEMS = [
  { label: 'Home',       icon: GridViewRoundedIcon,              active: true },
  { label: 'Performance',icon: TrendingUpRoundedIcon },
  { label: 'Venues',     icon: StorefrontOutlinedIcon },
  { label: 'Staffing',   icon: GroupsOutlinedIcon },
  { label: 'Menus',      icon: MenuBookOutlinedIcon },
  { label: 'Reports',    icon: BarChartOutlinedIcon },
  { label: 'Loyalty',    icon: FavoriteBorderRoundedIcon },
  { label: 'Accounting', icon: AccountBalanceWalletOutlinedIcon },
];

const HIGHLIGHT     = '#FDF3FD';
const ACTIVE_TEXT   = '#1A1A1A';
const ACTIVE_ICON   = '#6B6970';
const INACTIVE_TEXT = '#6B6970';
const INACTIVE_ICON = '#B7B5BB';

export default function Sidebar() {
  return (
    <Box
      component="nav"
      sx={{
        width: 220,
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1200,
        overflow: 'hidden',
      }}
    >
      {/* ── Brand / workspace switcher ── */}
      <Box
        sx={{
          px: 2,
          pt: 2.5,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
        }}
      >
        {/* Circular brand badge */}
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#F9E5CD',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Georgia, "Times New Roman", Times, serif !important',
              fontSize: '1.125rem',
              fontWeight: 400,
              color: '#72430B',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            D
          </Typography>
        </Box>

        {/* Workspace name + switcher */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            flex: 1,
            minWidth: 0,
            cursor: 'pointer',
            '&:hover .switcher-chevron': { color: '#0A0A0A' },
          }}
        >
          <Typography
            sx={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: '#0A0A0A',
              letterSpacing: '-0.015em',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Dishoom
          </Typography>
          <UnfoldMoreRoundedIcon
            className="switcher-chevron"
            sx={{ fontSize: '1rem', color: '#B7B5BB', flexShrink: 0, transition: 'color 0.14s ease' }}
          />
        </Box>

        {/* Layout toggle */}
        <IconButton
          size="small"
          sx={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: '6px',
            color: '#B7B5BB',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: '#6B6970' },
            transition: 'all 0.14s ease',
          }}
        >
          <SpaceDashboardOutlinedIcon sx={{ fontSize: '0.875rem' }} />
        </IconButton>
      </Box>

      {/* ── Nav items ── */}
      <List sx={{ px: 1.5, pt: 0.5, flex: 1, overflowY: 'auto' }} disablePadding>
        {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
          <ListItem key={label} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              sx={{
                borderRadius: '8px',
                py: 0.8,
                px: 1.25,
                backgroundColor: active ? HIGHLIGHT : 'transparent',
                '&:hover': {
                  backgroundColor: active ? HIGHLIGHT : 'rgba(253,243,253,0.6)',
                },
                transition: 'background-color 0.12s ease',
                minHeight: 36,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 28,
                  color: active ? ACTIVE_ICON : INACTIVE_ICON,
                  '& .MuiSvgIcon-root': { fontSize: '1rem' },
                }}
              >
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: '0.8125rem',
                  fontWeight: active ? 500 : 400,
                  color: active ? ACTIVE_TEXT : INACTIVE_TEXT,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* ── Bottom: settings + user ── */}
      <Box sx={{ px: 1.5, pt: 0.5, pb: 3 }}>

        {/* Settings */}
        <ListItemButton
          sx={{
            borderRadius: '8px',
            py: 0.8,
            px: 1.25,
            minHeight: 36,
            '&:hover': { backgroundColor: 'rgba(253,243,253,0.6)' },
            transition: 'background-color 0.12s ease',
          }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: INACTIVE_ICON, '& .MuiSvgIcon-root': { fontSize: '1rem' } }}>
            <SettingsOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 400, color: INACTIVE_TEXT, letterSpacing: '-0.01em', lineHeight: 1.3 }}
          />
        </ListItemButton>

        {/* Divider */}
        <Box sx={{ my: 1.5, height: '1px', backgroundColor: 'rgba(0,0,0,0.06)' }} />

        {/* User profile */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.25,
            py: 1,
            borderRadius: '10px',
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'rgba(253,243,253,0.6)' },
            transition: 'background-color 0.14s ease',
          }}
        >
          <Avatar
            sx={{
              width: 30,
              height: 30,
              backgroundColor: '#D0ABED',
              color: '#400F66',
              fontSize: '0.75rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            M
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#0A0A0A',
                letterSpacing: '-0.01em',
                lineHeight: 1.35,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Marcus
            </Typography>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                color: '#B7B5BB',
                letterSpacing: '-0.005em',
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
              }}
            >
              Ops Director
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
