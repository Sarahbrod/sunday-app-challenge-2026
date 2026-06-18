'use client';

import { useCallback, useEffect, useState } from 'react';

export function useDataState() {
  // null = not yet checked; false = no data; true = data connected
  const [hasData, setHasData] = useState<boolean | null>(null);

  useEffect(() => {
    const val = localStorage.getItem('has_data');
    setHasData(val === 'true');
  }, []);

  const connectData = useCallback(() => {
    localStorage.setItem('has_data', 'true');
    setHasData(true);
  }, []);

  return { hasData, connectData };
}
