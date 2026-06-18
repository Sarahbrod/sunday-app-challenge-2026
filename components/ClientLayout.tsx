'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname     = usePathname();
  const router       = useRouter();
  const isOnboarding = pathname.startsWith('/onboarding');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isOnboarding) {
      setReady(true);
      return;
    }
    const done = localStorage.getItem('onboarding_complete');
    if (!done) {
      router.replace('/onboarding');
    } else {
      setReady(true);
    }
  }, [isOnboarding, router]);

  // Onboarding page renders immediately — no sidebar, no nav
  if (isOnboarding) {
    return <>{children}</>;
  }

  // Other pages wait until we've confirmed onboarding is done
  if (!ready) return null;

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
          pt:         { xs: '52px', md: 0 },
        }}
      >
        {children}
      </Box>
      <MobileNav />
    </Box>
  );
}
