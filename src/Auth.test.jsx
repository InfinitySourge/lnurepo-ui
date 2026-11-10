import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
const user = { id: 'tenant:user', name: 'Test Student', email: 'test@lnu.edu.ua', first_name: 'Марко', last_name: 'Студент', faculty: 'Фізичний факультет', role_hint: 'student' };
const profile = { first_name: 'Марко', last_name: 'Студент', role: 'student', faculty: 'Фізичний факультет', group: 'ФЗ-21' };
function response(body, status = 200) { if (body?.first_name && body?.group !== undefined) body = { ...body, id: user.id }; if (body === null && status === 200) status = 404; return { status, ok: status >= 200 && status < 300, json: async () => body }; }
function renderApp(path = '/') { return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>); }
function signedIn(data = profile) {
  fetch.mockResolvedValueOnce(response(user)).mockResolvedValueOnce(response(data));
}
beforeEach(() => { vi.stubGlobal('fetch', vi.fn()); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); });
describe('Cookie authentication and profile', () => {
  it('explains how to resolve rejected automatic account fields', async () => {
    signedIn();
    fetch.mockResolvedValueOnce(response({ errors: { faculty: ['Unknown faculty'] } }, 400));
    renderApp('/profile');
    await screen.findByRole('heading', { name: 'Ваш профіль' });
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти профіль' }));
    const dialog = await screen.findByRole('dialog', { name: 'Профіль не збережено' });
    expect(within(dialog).getByRole('link', { name: 'Увійти знову' })).toBeTruthy();
    expect(within(dialog).getByRole('link', { name: 'support@lnurepo.info' }).href).toBe('mailto:support@lnurepo.info');
    expect(within(dialog).getByText(/зверніться до підтримки/)).toBeTruthy();
  });
  it('offers sign-in and support when automatic account data is missing', async () => {
    fetch.mockResolvedValueOnce(response({ id: user.id, name: user.name, email: user.email })).mockResolvedValueOnce(response(null));
    renderApp('/profile');
    await screen.findByText('Не всі дані облікового запису отримано');
    expect(screen.getByRole('button', { name: 'Зберегти профіль' }).disabled).toBe(true);
    expect(screen.getByRole('link', { name: 'Увійти знову' }).href).toBe('https://api.lnurepo.info/auth/login');
    expect(screen.getByRole('textbox', { name: 'Група' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Група' }).closest('fieldset').disabled).toBe(true);
    expect(screen.queryByRole('textbox', { name: 'Ім’я' })).toBeNull();
    const contact = new URL(screen.getByRole('link', { name: 'Написати підтримці' }).href);
    expect(contact.pathname).toBe('support@lnurepo.info');
    expect(contact.searchParams.get('body')).toContain(user.email);
    expect(contact.searchParams.get('body')).toContain('Факультет');
    expect(contact.searchParams.get('body')).toContain('Статус');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('highlights the group rejected by the API and preserves entered data', async () => {
    signedIn();
    fetch.mockResolvedValueOnce(response({ errors: { group: ['Invalid group'] } }, 400));
    renderApp('/profile');
    await screen.findByRole('heading', { name: 'Ваш профіль' });
    fireEvent.change(screen.getByLabelText('Група'), { target: { value: 'ФЗ-22' } });
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти профіль' }));
    const dialog = await screen.findByRole('dialog', { name: 'Профіль не збережено' });
    expect(within(dialog).getByText(/Перевірте дані/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Зрозуміло' }));
    expect(screen.getByLabelText('Група').value).toBe('ФЗ-22');
    expect(screen.getByLabelText('Група').getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(screen.getByLabelText('Група'));
  });
  it('prefills Microsoft data and saves the manually entered group', async () => {
    const microsoft = { ...user, first_name: 'Марко', last_name: 'Палій', faculty: profile.faculty, role_hint: 'student' };
    const completed = { ...profile, last_name: 'Палій' };
    fetch.mockResolvedValueOnce(response(microsoft)).mockResolvedValueOnce(response(null)).mockResolvedValueOnce(response(completed));
    renderApp();
    await screen.findByRole('heading', { name: 'Завершіть реєстрацію' });
    expect(screen.queryByRole('textbox', { name: 'Ім’я' })).toBeNull();
    expect(screen.getByText('Палій')).toBeTruthy();
    expect(within(screen.getByRole('main')).getByText(profile.faculty)).toBeTruthy();
    expect(screen.getByLabelText('Група').value).toBe('');
    fireEvent.change(screen.getByLabelText('Група'), { target: { value: profile.group } });
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти профіль' }));
    await screen.findByRole('heading', { name: 'Марко Палій' });
    expect(JSON.parse(fetch.mock.calls[2][1].body)).toEqual({ group: completed.group });
  });
  it('redirects anonymous users to university OAuth without a password form', async () => {
    fetch.mockResolvedValue(response(null, 401));
    renderApp();
    expect((await screen.findByRole('link', { name: 'Увійти через Microsoft' })).href).toBe('https://api.lnurepo.info/auth/login');
    expect(fetch.mock.calls[0][1].credentials).toBe('include');
    expect(screen.queryByRole('textbox', { name: 'Електронна пошта' })).toBeNull();
  });
  it('sends a registered user from login to home, then logs out', async () => {
    signedIn();
    fetch.mockImplementation((url) => Promise.resolve(new URL(url).pathname === '/auth/logout' ? response(null, 204) : new URL(url).pathname === '/api/faculties' ? response([{ id: 15, name: profile.faculty }]) : response({ disciplines: { available: true, items: [], has_more: false }, teachers: { available: true, items: [], has_more: false }, materials: { available: true, items: [], has_more: false } })));
    renderApp('/login');
    expect(await screen.findByRole('heading', { name: 'Марко Студент' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Вийти' }));
    expect(await screen.findByRole('link', { name: 'Увійти через Microsoft' })).toBeTruthy();
    const logout = fetch.mock.calls.find(([url]) => new URL(url).pathname === '/auth/logout');
    expect(logout[0]).toBe('https://api.lnurepo.info/auth/logout');
    expect(logout[1]).toMatchObject({ method: 'POST', credentials: 'include', redirect: 'error' });
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
    fetch.mockResolvedValueOnce(response(user)).mockResolvedValueOnce(response(null, 503));
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Сервер тимчасово недоступний' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Знання ближче, ніж здається' })).toBeNull();
  });
  it('shows first-time onboarding with an accessible validation popup', async () => {
    signedIn(null);
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Завершіть реєстрацію' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Група'), { target: { value: '<script>' } });
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти профіль' }));
    const dialog = screen.getByRole('dialog', { name: 'Перевірте дані профілю' });
    expect(within(dialog).getByText(/Вкажіть групу/)).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(2);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Зрозуміло' }));
    expect(document.activeElement).toBe(screen.getByLabelText('Група'));
  });
  it('saves valid profile to server and returns home', async () => {
    signedIn(null);
    fetch.mockResolvedValueOnce(response(profile));
    renderApp();
    await screen.findByRole('heading', { name: 'Завершіть реєстрацію' });
    fillProfile();
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти профіль' }));
    expect(await screen.findByRole('heading', { name: 'Марко Студент' })).toBeTruthy();
    expect(JSON.parse(fetch.mock.calls[2][1].body)).toEqual({ group: profile.group });
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
    expect(within(dialog).getByText(/Зміни не підтверджено/)).toBeTruthy();
    expect(screen.getByLabelText('Група').value).toBe(profile.group);
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
    fetch.mockImplementation((url) => Promise.resolve(new URL(url).pathname === '/api/faculties' ? response([{ id: 15, name: profile.faculty }]) : response({ disciplines: empty, teachers: empty, materials: empty })));
    renderApp();
    await screen.findByRole('heading', { name: 'Знання ближче, ніж здається' });
    const search = screen.getByRole('combobox');
    await waitFor(() => expect(search.disabled).toBe(false));
    fireEvent.change(search, { target: { value: 'Фізичний' } });
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(search.value).toBe('Фізичний факультет');
    await waitFor(() => expect(screen.getAllByRole('heading', { name: 'Тут поки порожньо' })).toHaveLength(3));
  });
});
function fillProfile() {
  fireEvent.change(screen.getByLabelText('Група'), { target: { value: profile.group } });
}
