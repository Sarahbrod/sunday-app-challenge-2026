'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { BarChart2 } from 'lucide-react';

interface Props {
  onConnect: () => void;
  label?: string;
  cta?: string;
}

export default function EmptyStateBanner({
  onConnect,
  label = 'Connect your data to unlock the full platform',
  cta   = 'Connect data',
}: Props) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 2, flexWrap: 'wrap',
      px: 2, py: 1.5, mb: 3,
      borderRadius: '12px',
      backgroundColor: '#FFFFFF',
      border: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#F3EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BarChart2 size={16} color="#A8A5A2" />
        </Box>
        <Typography sx={{ fontSize: '0.8125rem', color: '#6B6764', letterSpacing: '-0.01em' }}>
          {label}
        </Typography>
      </Box>
      <Button onClick={onConnect}
        sx={{ bgcolor: '#1C1C1C', color: '#FFFFFF', '&:hover': { bgcolor: '#2A2828' }, fontWeight: 600, fontSize: '0.8125rem', borderRadius: '10px', px: 2, py: 0.875, textTransform: 'none', boxShadow: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {cta}
      </Button>
    </Box>
  );
}
