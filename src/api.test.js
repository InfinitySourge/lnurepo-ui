import { afterEach, describe, expect, it, vi } from 'vitest';
import { request, ApiError, errorMessage } from './api.js';
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('API request boundary', () => {
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
    try { await request('/api/profile'); } catch (error) {
      expect(errorMessage(error)).not.toContain('secret');
      expect(error.status).toBe(503);
    }
  });
});

