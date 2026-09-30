import { useEffect, useState } from 'react';
import { AuthContext } from './auth-context.js';
import { API_ORIGIN } from './api.js';

// Never put session credentials in localStorage, query parameters or application logs.
export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true, unavailable: false });
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_ORIGIN}/auth/me`, { credentials: 'include', signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) return { user: null, loading: false, unavailable: false };
        if (!response.ok) throw new Error('Session check failed');
        return { user: await response.json(), loading: false, unavailable: false };
      })
      .then(setState)
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ user: null, loading: false, unavailable: true });
      });
    return () => controller.abort();
  }, []);

  async function logout() {
    const response = await fetch(`${API_ORIGIN}/auth/logout`, { method: 'POST', credentials: 'include' });
    if (!response.ok) throw new Error('Logout failed');
    setState({ user: null, loading: false, unavailable: false });
  }

  return <AuthContext.Provider value={{ ...state, logout }}>{children}</AuthContext.Provider>;
}
