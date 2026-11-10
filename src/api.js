import { t } from './i18n/language.js';
const configuredOrigin = import.meta.env.VITE_API_ORIGIN || 'https://api.lnurepo.info';
const url = new URL(configuredOrigin);
if (url.pathname !== '/' || url.search || url.hash || url.username || url.password
    || !['http:', 'https:'].includes(url.protocol) || (import.meta.env.PROD && url.protocol !== 'https:')) {
  throw new Error('Invalid API origin');
}
export const API_ORIGIN = url.origin;
export class ApiError extends Error {
  constructor(status = 0, fields = []) {
    super('Request failed');
    this.status = status;
    this.fields = fields;
  }
}
export async function request(path, { signal, method = 'GET', body, query } = {}) {
  const fixed = ['/auth/me', '/auth/logout', '/api/catalog', '/api/favorites', '/api/faq', '/api/faculties', '/api/profiles'];
  let decoded;
  try { decoded = decodeURIComponent(path); } catch { throw new ApiError(); }
  if (!fixed.includes(path) && !/^\/api\/profiles\/[a-zA-Z0-9:-]{1,73}$/.test(decoded) && !/^\/api\/favorites\/[1-9][0-9]{0,15}$/.test(path)) throw new ApiError();
  let suffix = '';
  if (query !== undefined) {
    const allowed = path === '/api/catalog' ? ['faculty', 'q'] : path === '/api/faculties' ? ['offset', 'limit'] : [];
    if (!allowed.length || method !== 'GET' || !query || typeof query !== 'object' || Array.isArray(query)
        || Object.entries(query).some(([key, value]) => !allowed.includes(key) || typeof value !== 'string')) throw new ApiError();
    suffix = '?' + new URLSearchParams(query).toString();
  }
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, 12000);
  try {
    const response = await fetch(API_ORIGIN + path + suffix, {
      method, credentials: 'include', cache: 'no-store', redirect: 'error',
      signal: controller.signal,
      ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
    if (!response.ok) {
      let problem;
      try { problem = await response.json(); } catch { }
      const fields = problem?.errors && typeof problem.errors === 'object' && !Array.isArray(problem.errors)
        ? ['first_name', 'last_name', 'role', 'faculty', 'group', 'body', 'query.faculty', 'query.q']
          .filter((field) => Object.hasOwn(problem.errors, field)) : [];
      throw new ApiError(response.status, fields);
    }
    return response.status === 204 ? null : await response.json();
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
export function errorMessage(error) {
  return t([400, 401, 403, 404, 409, 413, 422, 429, 500, 503].includes(error?.status) ? `error.${error.status}` : 'error.network');
}
