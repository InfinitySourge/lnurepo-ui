import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { setLanguage } from './i18n/language.js';

const user = { id: 'tenant:demo', name: 'Марко Студент', email: 'demo@example.invalid', first_name: 'Марко', last_name: 'Студент', faculty: 'Фізичний факультет', role_hint: 'student' };
const profile = { first_name: 'Марко', last_name: 'Студент', role: 'student', faculty: 'Фізичний факультет', group: 'ФЗ-21' };
const empty = { available: true, items: [], has_more: false };
function mount(path = '/profile', saved = profile) {
  vi.stubGlobal('fetch', vi.fn(async (url, options) => {
    const route = new URL(url).pathname;
    let data;
    if (route === '/auth/me') data = user;
    else if (route === '/api/profiles') data = { ...profile, ...JSON.parse(options.body), id: user.id };
    else if (decodeURIComponent(route) === '/api/profiles/' + user.id) data = saved && { ...saved, ...options.body && JSON.parse(options.body), id: user.id };
    else if (route === '/api/faculties') data = [{ id: 15, name: profile.faculty }];
    else if (route === '/api/catalog') data = { disciplines: empty, teachers: empty, materials: { ...empty, items: [{ id: 'test', faculty: profile.faculty, title: 'Навчальний матеріал українською', description: 'Український опис' }] } };
    else if (route === '/api/favorites') data = empty;
    else if (route === '/api/faq') data = { available: true, items: [{ id: 'test', question: 'Питання українською', answer: 'Відповідь українською' }] };
    else throw new Error('Unexpected endpoint');
    const status = data === null ? 404 : options.method === 'PUT' ? 204 : ['POST', 'PUT'].includes(options.method) ? 201 : 200;
    return { ok: status < 400, status, json: async () => data };
  }));
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
}
function changeLanguage(name) {
  fireEvent.change(screen.getByRole('combobox', { name: /Мова інтерфейсу|Interface language/ }), { target: { value: name === 'English' ? 'en' : 'uk' } });
}
beforeEach(() => { setLanguage('uk'); localStorage.clear(); });
afterEach(() => { cleanup(); act(() => setLanguage('uk')); localStorage.clear(); vi.unstubAllGlobals(); });

it('uses the saved language at login without showing a language selector', async () => {
  setLanguage('en');
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 401 })));
  render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>);
  expect((await screen.findByRole('link', { name: 'Sign in with Microsoft' })).href).toBe('https://api.lnurepo.info/auth/login');
  expect(screen.queryByRole('combobox', { name: 'Interface language' })).toBeNull();
  expect(document.documentElement.lang).toBe('en');
  expect(localStorage.getItem('lnurepo-language')).toBe('en');
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('keeps the edited group and sends Ukrainian account data in the English interface', async () => {
  mount();
  await screen.findByRole('heading', { name: 'Ваш профіль' });
  fireEvent.change(screen.getByLabelText('Група'), { target: { value: 'ФЗ-22' } });
  expect(screen.getAllByRole('combobox', { name: 'Мова інтерфейсу' })).toHaveLength(1);
  changeLanguage('English');
  expect(screen.getByLabelText('Group').value).toBe('ФЗ-22');
  expect(screen.queryByRole('textbox', { name: 'First name' })).toBeNull();
  expect(screen.getByText('Faculty of Physics')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));
  await screen.findByRole('heading', { name: 'Knowledge is closer than you think' });
  const mutation = fetch.mock.calls.find(([, options]) => ['POST', 'PUT'].includes(options.method));
  expect(JSON.parse(mutation[1].body)).toEqual({ group: 'ФЗ-22' });
  expect(JSON.parse(mutation[1].body)).not.toHaveProperty('language');
});

it('translates an open validation dialog and its field errors without resetting the form', async () => {
  mount('/profile/setup', null);
  await screen.findByRole('heading', { name: 'Завершіть реєстрацію' });
  fireEvent.change(screen.getByLabelText('Група'), { target: { value: '<script>' } });
  fireEvent.click(screen.getByRole('button', { name: 'Зберегти профіль' }));
  expect(screen.getByRole('dialog', { name: 'Перевірте дані профілю' })).toBeTruthy();
  act(() => setLanguage('en'));
  const dialog = screen.getByRole('dialog', { name: 'Check your profile details' });
  expect(within(dialog).getByText(/Enter a group/)).toBeTruthy();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Got it' }));
  expect(screen.getByLabelText('Group').value).toBe('<script>');
  expect(screen.getByLabelText('Group').getAttribute('aria-invalid')).toBe('true');
  expect(fetch).toHaveBeenCalledTimes(2);
});

it('preserves search and category, keeps material text Ukrainian and searches translated faculties', async () => {
  mount('/');
  await screen.findByRole('heading', { name: 'Знання ближче, ніж здається' });
  fireEvent.change(screen.getByLabelText('Що шукаємо?'), { target: { value: 'конспект' } });
  fireEvent.click(screen.getByRole('button', { name: 'Матеріали', exact: true }));
  expect(screen.queryByRole('combobox', { name: 'Мова інтерфейсу' })).toBeNull();
  act(() => setLanguage('en'));
  expect(screen.getByLabelText('What are you looking for?').value).toBe('конспект');
  expect(screen.getByRole('button', { name: 'Materials', exact: true }).getAttribute('aria-pressed')).toBe('true');
  expect(await screen.findByRole('heading', { name: 'Навчальний матеріал українською' })).toBeTruthy();
  const faculty = screen.getByRole('combobox');
  await waitFor(() => expect(faculty.disabled).toBe(false));
  fireEvent.change(faculty, { target: { value: 'Physics' } });
  fireEvent.keyDown(faculty, { key: 'Enter' });
  expect(faculty.value).toBe('Faculty of Physics');
  await waitFor(() => {
    const queries = fetch.mock.calls.filter(([url]) => new URL(url).pathname === '/api/catalog');
    expect(queries.length).toBeGreaterThan(0);
    expect(new URL(queries.at(-1)[0]).searchParams.get('faculty')).toBe(profile.faculty);
  });
});

it('leaves FAQ content unchanged and localises the support email draft', async () => {
  mount('/faq');
  await screen.findByText('Питання українською');
  expect(screen.queryByRole('combobox', { name: 'Мова інтерфейсу' })).toBeNull();
  act(() => setLanguage('en'));
  expect(screen.getByText('Питання українською')).toBeTruthy();
  expect(screen.getByText('Відповідь українською')).toBeTruthy();
  const href = new URL(screen.getByRole('link', { name: 'Contact support' }).href);
  expect(href.searchParams.get('subject')).toBe('LNUrepo — support request');
  expect(href.searchParams.get('body')).toContain('Name: Марко Студент');
  expect(href.searchParams.get('body')).toContain('Account: demo@example.invalid');
});

it('translates the complete legal page', async () => {
  mount('/legal');
  expect(screen.queryByRole('combobox', { name: 'Мова інтерфейсу' })).toBeNull();
  act(() => setLanguage('en'));
  expect(screen.getByRole('heading', { name: 'Terms of use and privacy' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: '6. Privacy and account data' })).toBeTruthy();
  expect(screen.queryByText(/Документ перебуває на погодженні/)).toBeNull();
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
});
