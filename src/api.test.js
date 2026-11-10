import { afterEach, describe, expect, it, vi } from 'vitest';
import { request, ApiError, errorMessage } from './api.js';
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('API request boundary', () => {
  it('uses HTTP status and safe field names from Problem Details without exposing server text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 400, ok: false, json: async () => ({
      type: 'about:blank', title: 'Bad Request', status: 500, detail: 'password=secret',
      errors: { group: ['SQL private detail'], unexpected: ['secret'] },
    }) }));
    const error = await request('/api/profiles', { method: 'POST', body: {} }).catch((failure) => failure);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.fields).toEqual(['group']);
    expect(errorMessage(error)).toContain('Перевірте дані');
    expect(JSON.stringify(error)).not.toContain('secret');
    expect(JSON.stringify(error)).not.toContain('SQL');
  });
  it('handles a proxy HTML error instead of JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 503, ok: false, json: async () => { throw new SyntaxError(); } }));
    await expect(request('/api/profiles')).rejects.toMatchObject({ status: 503, fields: [] });
  });
  it.each([400, 401, 403, 404, 409, 413, 422, 429, 500, 503])('has a useful message for HTTP %s', (status) => {
    expect(errorMessage(new ApiError(status))).not.toBe(errorMessage(new ApiError()));
  });
  it.each(['https://evil.example/api/profile', '//evil.example', '/api/profile?token=secret', '/api/../auth/me'])('rejects untrusted path %s', async (path) => {
    vi.stubGlobal('fetch', vi.fn());
    await expect(request(path)).rejects.toBeInstanceOf(ApiError);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('aborts a stuck request rather than leaving loading forever', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));
    const result = expect(request('/auth/me')).rejects.toMatchObject({ name: 'AbortError' });
    await vi.advanceTimersByTimeAsync(12000);
    await result;
  });
  it('honors external cancellation', async () => {
    vi.stubGlobal('fetch', vi.fn((url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));
    const controller = new AbortController();
    const result = expect(request('/auth/me', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await result;
  });
  it('never displays server-supplied secrets', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 503, ok: false, json: () => ({ detail: 'secret' }) }));
    try { await request('/api/profiles'); } catch (error) {
      expect(errorMessage(error)).not.toContain('secret');
      expect(error.status).toBe(503);
    }
  });
});

