import { isProfile, validateProfile } from './profile.js';

// Demo-only session storage survives Vite reloads; never stores a real identity/token.
const storageKey = 'lnurepo-design-profile';
function loadProfile() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    return isProfile(saved) ? saved : null;
  } catch { return null; }
}
let profile = loadProfile();
const user = { id: 'demo:local', name: 'Демо Користувач', email: 'demo@example.invalid', first_name: 'Демо', last_name: 'Користувач' };
const empty = () => ({ available: false, items: [], has_more: false });
export function previewRequest(path, { method, body }) {
  if (path === '/auth/me' && method === 'GET') return { ...user };
  if (path === '/auth/logout' && method === 'POST') return null;
  if (path === '/api/profile' && method === 'GET') return profile && { ...profile };
  if (path === '/api/profile' && method === 'POST') {
    if (!body || Object.keys(validateProfile(body)).length) throw new Error('Invalid demo profile');
    profile = { ...body };
    try { sessionStorage.setItem(storageKey, JSON.stringify(profile)); } catch { /* In-memory fallback. */ }
    return { ...profile };
  }
  if (path === '/api/catalog' && method === 'GET') return { disciplines: empty(), teachers: empty(), materials: empty() };
  if (path === '/api/favorites' && method === 'GET') return empty();
  if (path === '/api/faq' && method === 'GET') return {available:false,items:[]};
  // Unknown requests must fail rather than accidentally fall through to production.
  throw new Error('Unsupported design preview request');
}
