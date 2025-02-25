'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

export default function ErrorLogger() {
  const { user, status } = useAuth();

  useEffect(() => {
    console.log('=== ERROR LOGGER INFO ===');
    console.log('Current path:', window.location.pathname);
    console.log('Auth status:', status);
    console.log('Auth cookie exists:', document.cookie.includes('auth-token'));
    console.log('User data:', user);
    
    // Log window history state
    console.log('History length:', window.history.length);
    console.log('History state:', window.history.state);
    
    // Add a listener for navigation events
    const handleNavigation = () => {
      console.log('Navigation event detected');
      console.log('New path:', window.location.pathname);
    };
    
    window.addEventListener('popstate', handleNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [user, status]);

  return null;
}