const configuredOrigin = import.meta.env.VITE_API_ORIGIN || 'https://api.lnurepo.info';
const url = new URL(configuredOrigin);
if (url.pathname !== '/' || url.search || url.hash || url.username || url.password
    || !['http:', 'https:'].includes(url.protocol) || (import.meta.env.PROD && url.protocol !== 'https:')) {
  throw new Error('Invalid API origin');
}
export const API_ORIGIN = url.origin;
export class ApiError extends Error {
  constructor(status = 0) { super('Request failed'); this.status = status; }
}
// Credentials stay in HttpOnly cookies. Never render raw API exception text.
export async function request(path, { signal, method = 'GET', body } = {}) {
  if (!/^\/(auth|api)\/[a-z/]+$/.test(path)) throw new ApiError();
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, 12000);
  try {
    const response = await fetch(API_ORIGIN + path, {
      method, credentials: 'include', cache: 'no-store', redirect: 'error',
      signal: controller.signal,
      ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
    if (response.status === 401 || !response.ok) throw new ApiError(response.status);
    return response.status === 204 ? null : await response.json();
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
export function errorMessage(error) {
  if (error.status === 401) return 'Сесія завершилась. Увійдіть знову; введені дані ще не збережені.';
  if (error.status === 403) return 'Доступ заборонено. Перевірте обліковий запис або зверніться до підтримки.';
  if (error.status === 422) return 'Перевірте правильність полів. Сервер не прийняв ці дані.';
  if (error.status === 429) return 'Забагато спроб. Зачекайте хвилину й спробуйте знову.';
  return 'Не вдалося зв’язатися із сервером. Дані не збережені. Спробуйте ще раз.';
}
