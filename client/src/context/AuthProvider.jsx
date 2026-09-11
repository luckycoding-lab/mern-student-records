import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Read token from URL or existing localStorage inside the effect
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('authToken', tokenFromUrl);
      // Clean query parameter from browser bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = tokenFromUrl || localStorage.getItem('authToken');

    const verifyAuth = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers,
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) setUser(data.user);
        } else {
          // If the token was invalid, remove it
          localStorage.removeItem('authToken');
          if (isMounted) setUser(null);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        localStorage.removeItem('authToken');
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
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