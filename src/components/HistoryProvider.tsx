// src/components/HistoryProvider.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useHistoryStore } from '@/lib/historyStore';

// This component serves as a provider to initialize the Zustand store
// and handle hydration in Next.js
export default function HistoryProvider({ children }: { children: ReactNode }) {
  const { loadHistory } = useHistoryStore();
  
  // Initialize the store on client side
  useEffect(() => {
    // Delay the initial load to ensure the component is fully mounted
    const timer = setTimeout(() => {
      loadHistory();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [loadHistory]);
  
  return <>{children}</>;
}