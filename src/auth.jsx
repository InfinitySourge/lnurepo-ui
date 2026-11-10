import { useCallback, useEffect, useState } from 'react';
import { AuthContext } from './auth-context.js';
import { request, ApiError } from './api.js';
import { isProfile } from './profile.js';
const initial = { user: null, profile: null, profileUnavailable: false, loading: true, unavailable: false };
export function AuthProvider({ children }) {
  const [state, setState] = useState(initial);
  const [revision, setRevision] = useState(0);
  const [profileDraft, setProfileDraft] = useState(null);
  const [catalogFilters, setCatalogFilters] = useState({ faculty: null, query: '', category: 'all' });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const user = await request('/auth/me', { signal: controller.signal });
        if (!user || typeof user.id !== 'string' || typeof user.name !== 'string' || typeof user.email !== 'string') throw new ApiError();
        let profile = null;
        let profileUnavailable = false;
        try {
          profile = await request('/api/profiles/' + encodeURIComponent(user.id), { signal: controller.signal });
          if (!isProfile(profile) || profile.id !== user.id) throw new ApiError();
        } catch (error) {
          if (error.status === 401) throw error;
          if (error.status !== 404) profileUnavailable = true;
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
    setProfileDraft(null);
    setCatalogFilters({ faculty: null, query: '', category: 'all' });
    setState({ ...initial, loading: false });
  }
  async function saveProfile(values) {
    const path = '/api/profiles/' + encodeURIComponent(state.user.id);
    const body = { group: values.group };
    let saved;
    if (state.profile) {
      await request(path, { method: 'PUT', body });
      saved = await request(path);
    } else {
      saved = await request('/api/profiles', { method: 'POST', body });
    }
    if (!isProfile(saved) || saved.id !== state.user.id) throw new ApiError();
    setProfileDraft(null);
    setState((previous) => ({ ...previous, profile: saved, profileUnavailable: false }));
  }
  return <AuthContext.Provider value={{ ...state, retry, logout, saveProfile, profileDraft, setProfileDraft, catalogFilters, setCatalogFilters }}>{children}</AuthContext.Provider>;
}
