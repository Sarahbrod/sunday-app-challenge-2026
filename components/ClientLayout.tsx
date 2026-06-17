'use client';

import Box from '@mui/material/Box';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F2ED' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          ml:         { xs: 0, md: 'var(--sidebar-w, 220px)' },
          transition: 'margin-left 0.22s ease',
          flex:       1,
          minWidth:   0,
          // Push content below the fixed mobile top bar.
          pt:         { xs: '52px', md: 0 },
        }}
      >
        {children}
      </Box>
      <MobileNav />
    </Box>
  );
}
