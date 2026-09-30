import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';

beforeEach(() => { vi.stubGlobal('fetch', vi.fn()); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function renderApp(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
}

describe('Cookie authentication', () => {
  it('redirects anonymous users and provides university OAuth login', async () => {
    fetch.mockResolvedValue({ status: 401 });
    renderApp();
    const login = await screen.findByRole('link', { name: 'Увійти через Microsoft' });
    expect(login.getAttribute('href')).toBe('https://api.lnurepo.info/auth/login');
    expect(fetch.mock.calls[0][1].credentials).toBe('include');
    expect(screen.queryByRole('textbox', { name: 'Електронна пошта' })).toBeNull();
  });

  it('shows authenticated identity and deletes session on logout', async () => {
    fetch.mockResolvedValueOnce({ status: 200, ok: true,
      json: async () => ({ id: 'tenant:user', name: 'Test Student', email: 'test@lnu.edu.ua' }) });
    fetch.mockResolvedValueOnce({ status: 204, ok: true });
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Test Student' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Вийти' }));
    expect(await screen.findByRole('link', { name: 'Увійти через Microsoft' })).toBeTruthy();
    expect(fetch.mock.calls[1]).toEqual([
      'https://api.lnurepo.info/auth/logout', { method: 'POST', credentials: 'include' },
    ]);
  });

  it('does not show protected content on network failure', async () => {
    fetch.mockRejectedValue(new Error('Network unavailable'));
    renderApp();
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('сервером'));
    expect(screen.queryByRole('heading', { name: 'База навчальних матеріалів ЛНУ' })).toBeNull();
  });
});
