import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
const user = { id: 'tenant:user', name: 'Test Student', email: 'test@lnu.edu.ua' };
const profile = { first_name: 'Марко', last_name: 'Студент', role: 'student', faculty: 'Фізичний факультет', group: 'ФЗ-21' };
function response(body, status = 200) { return { status, ok: status >= 200 && status < 300, json: async () => body }; }
function renderApp(path = '/') { return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>); }
function signedIn(data = profile) {
  fetch.mockResolvedValueOnce(response(user)).mockResolvedValueOnce(response(data));
}
beforeEach(() => { vi.stubGlobal('fetch', vi.fn()); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); });
describe('Cookie authentication and profile', () => {
  it('redirects anonymous users to university OAuth without a password form', async () => {
    fetch.mockResolvedValue(response(null, 401));
    renderApp();
    expect((await screen.findByRole('link', { name: 'Увійти через Microsoft' })).href).toBe('https://api.lnurepo.info/auth/login');
    expect(fetch.mock.calls[0][1].credentials).toBe('include');
    expect(screen.queryByRole('textbox', { name: 'Електронна пошта' })).toBeNull();
  });
  it('sends a registered user from login to home, then logs out', async () => {
    signedIn();
    fetch.mockResolvedValueOnce(response(null, 204));
    renderApp('/login');
    expect(await screen.findByRole('heading', { name: 'Марко Студент' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Вийти' }));
    expect(await screen.findByRole('link', { name: 'Увійти через Microsoft' })).toBeTruthy();
    expect(fetch.mock.calls[2][0]).toBe('https://api.lnurepo.info/auth/logout');
    expect(fetch.mock.calls[2][1]).toMatchObject({ method: 'POST', credentials: 'include', redirect: 'error' });
    expect(localStorage.length).toBe(0);
  });
  it('hides protected content on network failure and retries', async () => {
    fetch.mockRejectedValueOnce(new Error('private server detail')).mockResolvedValue(response(null, 401));
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Сервер тимчасово недоступний' })).toBeTruthy();
    expect(screen.queryByText('private server detail')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Спробувати знову' }));
    expect(await screen.findByRole('link', { name: 'Увійти через Microsoft' })).toBeTruthy();
  });
  it('rejects malformed session data', async () => {
    fetch.mockResolvedValue(response({ name: '<script>bad()</script>' }));
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Сервер тимчасово недоступний' })).toBeTruthy();
  });
  it('blocks protected content when the profile endpoint is unavailable', async () => {
    fetch.mockResolvedValueOnce(response(user)).mockResolvedValueOnce(response(null, 404));
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Сервер тимчасово недоступний' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Знання ближче, ніж здається' })).toBeNull();
  });
  it('shows first-time onboarding with an accessible validation popup', async () => {
    signedIn(null);
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Завершіть реєстрацію' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Ім’я'), { target: { value: 'Марко123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти профіль' }));
    const dialog = screen.getByRole('dialog', { name: 'Перевірте дані профілю' });
    expect(within(dialog).getByText(/але не цифри/)).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(2);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Зрозуміло' }));
    expect(document.activeElement).toBe(screen.getByLabelText('Ім’я'));
  });
  it('saves valid profile to server and returns home', async () => {
    signedIn(null);
    fetch.mockResolvedValueOnce(response(profile));
    renderApp();
    await screen.findByRole('heading', { name: 'Завершіть реєстрацію' });
    fillProfile();
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти профіль' }));
    expect(await screen.findByRole('heading', { name: 'Марко Студент' })).toBeTruthy();
    expect(JSON.parse(fetch.mock.calls[2][1].body)).toEqual(profile);
    expect(fetch.mock.calls[2][1].credentials).toBe('include');
    expect(localStorage.length).toBe(0);
  });
  it('does not pretend saving succeeded on backend failure', async () => {
    signedIn(null);
    fetch.mockResolvedValueOnce(response({ detail: 'password=secret' }, 503));
    renderApp();
    await screen.findByRole('heading', { name: 'Завершіть реєстрацію' });
    fillProfile();
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти профіль' }));
    const dialog = await screen.findByRole('dialog', { name: 'Профіль не збережено' });
    expect(within(dialog).getByText(/Дані не збережені/)).toBeTruthy();
    expect(screen.getByLabelText('Ім’я').value).toBe('Марко');
    expect(screen.queryByText(/password=secret/)).toBeNull();
  });
  it('renders an unknown URL as an error page even without API', async () => {
    fetch.mockResolvedValue(response(null, 401));
    renderApp('/missing-page');
    expect(screen.getByRole('heading', { name: 'Сторінку не знайдено' })).toBeTruthy();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });
  it('provides keyboard faculty search and an honest empty catalogue', async () => {
    signedIn();
    const empty = { available: true, items: [], has_more: false };
    fetch.mockResolvedValue(response({ disciplines: empty, teachers: empty, materials: empty }));
    renderApp();
    await screen.findByRole('heading', { name: 'Знання ближче, ніж здається' });
    const search = screen.getByRole('combobox');
    fireEvent.change(search, { target: { value: 'Фізичний' } });
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(search.value).toBe('Фізичний факультет');
    await waitFor(() => expect(screen.getAllByRole('heading', { name: 'Тут поки порожньо' })).toHaveLength(3));
  });
});
function fillProfile() {
  for (const [name, value] of Object.entries(profile)) {
    const labels = { first_name: 'Ім’я', last_name: 'Прізвище', role: 'Ви студент чи викладач?', faculty: 'Факультет', group: 'Група' };
    fireEvent.change(screen.getByLabelText(labels[name]), { target: { value } });
  }
}
