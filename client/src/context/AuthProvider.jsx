import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Verify session on mount
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const verifyAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include', // Transmits cross-domain cookie
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) setUser(data.user);
        } else {
          if (isMounted) setUser(null);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Auth verification error:', err);
        }
        if (isMounted) setUser(null);
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) setAuthLoading(false);
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};