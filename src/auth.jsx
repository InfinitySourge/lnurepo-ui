import { useCallback, useEffect, useState } from 'react';
import { AuthContext } from './auth-context.js';
import { request, ApiError } from './api.js';
import { isProfile } from './profile.js';
const initial = { user: null, profile: null, profileUnavailable: false, loading: true, unavailable: false };
export function AuthProvider({ children }) {
  const [state, setState] = useState(initial);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const user = await request('/auth/me', { signal: controller.signal });
        if (!user || typeof user.id !== 'string' || typeof user.name !== 'string' || typeof user.email !== 'string') throw new ApiError();
        let profile = null;
        let profileUnavailable = false;
        try {
          profile = await request('/api/profile', { signal: controller.signal });
          if (profile !== null && !isProfile(profile)) throw new ApiError();
        } catch (error) {
          if (error.status === 401) throw error;
          profileUnavailable = true;
        }
        if (!controller.signal.aborted) setState({ user, profile, profileUnavailable, loading: false, unavailable: false });
      } catch (error) {
        if (!controller.signal.aborted) setState({ ...initial, loading: false, unavailable: error.status !== 401 });
      }
    }
    load();
    return () => controller.abort();
  }, [revision]);
  const retry = useCallback(() => { setState(initial); setRevision((value) => value + 1); }, []);
  async function logout() {
    try { await request('/auth/logout', { method: 'POST' }); }
    catch (error) { if (error.status !== 401) throw error; }
    setState({ ...initial, loading: false });
  }
  async function saveProfile(profile) {
    const saved = await request('/api/profile', { method: 'POST', body: profile });
    if (!isProfile(saved)) throw new ApiError();
    setState((previous) => ({ ...previous, profile: saved, profileUnavailable: false }));
  }
  return <AuthContext.Provider value={{ ...state, retry, logout, saveProfile }}>{children}</AuthContext.Provider>;
}
