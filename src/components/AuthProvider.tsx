// src/components/AuthProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthContextType = {
  user: any | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: 'loading',
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const refreshAuth = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const session = await res.json();
        if (session.user) {
          setUser(session.user);
          setStatus('authenticated');
        } else {
          setUser(null);
          setStatus('unauthenticated');
        }
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    } catch (error) {
      setUser(null);
      setStatus('unauthenticated');
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, refresh: refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// Export the useAuth hook
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;