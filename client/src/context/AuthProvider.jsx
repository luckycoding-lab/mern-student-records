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

    // 1. Capture token from URL query params (bypasses iOS/Safari cross-domain cookie blocks)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('authToken', tokenFromUrl);
      // Clean up the URL query param without triggering a full page reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Retrieve token from URL or localStorage fallback
    const token = tokenFromUrl || localStorage.getItem('authToken');

    const verifyAuth = async () => {
      try {
        // Prepare headers (attaching Bearer token for Safari / iOS)
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers,
          credentials: 'include', // Retains cross-domain cookie check for desktop browsers
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) setUser(data.user);
        } else {
          localStorage.removeItem('authToken');
          if (isMounted) setUser(null);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Auth verification error:', err);
          localStorage.removeItem('authToken');
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

  // Logout handler
  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear client-side token and reset user state
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};