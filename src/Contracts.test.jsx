import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { setLanguage } from './i18n/language.js';

const user = { id: 'tenant:student', name: 'Марко Палій', email: 'student@lnu.edu.ua', first_name: 'Марко', last_name: 'Палій', faculty: 'Фізичний факультет', role_hint: 'student' };
const saved = { id: user.id, first_name: user.first_name, last_name: user.last_name, faculty: user.faculty, role: 'student', group: 'ФЗ-21' };
const empty = { available: true, items: [], has_more: false };

function mount({ profile = saved, failFaculties = false, pendingCatalog = false, path = '/' } = {}) {
  let current = profile;
  let facultiesFail = failFaculties;
  vi.stubGlobal('fetch', vi.fn(async (url, options) => {
    const route = decodeURIComponent(new URL(url).pathname);
    let data;
    let status = 200;
    if (route === '/auth/me') data = user;
    else if (route === '/api/profiles/' + user.id) {
      if (options.method === 'PUT') { current = { ...current, ...JSON.parse(options.body) }; status = 204; }
      else { data = current; status = current ? 200 : 404; }
    } else if (route === '/api/profiles' && options.method === 'POST') {
      current = { ...saved, ...JSON.parse(options.body) }; data = current; status = 201;
    } else if (route === '/api/faculties') {
      if (facultiesFail) { facultiesFail = false; status = 503; }
      else data = [{ id: 15, name: user.faculty }, { id: 20, name: 'Новий факультет з бази' }];
    } else if (route === '/api/catalog') {
      if (pendingCatalog) return new Promise(() => {});
      data = { disciplines: empty, teachers: empty, materials: empty };
    } else if (route === '/api/favorites') data = empty;
    else if (route === '/api/faq') data = { available: true, items: [] };
    else throw new Error('Unexpected route: ' + route);
    return { status, ok: status >= 200 && status < 300, json: async () => data };
  }));
  render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
}

beforeEach(() => { setLanguage('uk'); localStorage.clear(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); });

it('uses the canonical create profile contract and sends only the group', async () => {
  mount({ profile: null });
  await screen.findByRole('heading', { name: 'Завершіть реєстрацію' });
  fireEvent.click(screen.getByRole('button', { name: 'Зберегти профіль' }));
  expect(screen.getByLabelText('Група').getAttribute('aria-invalid')).toBe('true');
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Зрозуміло' }));
  fireEvent.change(screen.getByLabelText('Група'), { target: { value: 'ПМА-32' } });
  fireEvent.click(screen.getByRole('button', { name: 'Зберегти профіль' }));
  await screen.findByRole('heading', { name: 'Знання ближче, ніж здається' });
  const call = fetch.mock.calls.find(([, options]) => options.method === 'POST');
  expect(new URL(call[0]).pathname).toBe('/api/profiles');
  expect(JSON.parse(call[1].body)).toEqual({ group: 'ПМА-32' });
});

it('loads faculties from the API, retains Ukrainian values and preserves search across routes', async () => {
  mount();
  const faculty = await screen.findByRole('combobox', { name: 'Факультет' });
  await waitFor(() => expect(faculty.disabled).toBe(false));
  fireEvent.change(faculty, { target: { value: 'Новий' } });
  fireEvent.click(await screen.findByRole('option', { name: 'Новий факультет з бази' }));
  fireEvent.change(screen.getByLabelText('Що шукаємо?'), { target: { value: 'конспект' } });
  fireEvent.click(screen.getByRole('button', { name: 'Матеріали', exact: true }));
  const nav = within(screen.getByRole('navigation', { name: 'Навігація' }));
  fireEvent.click(nav.getByRole('link', { name: 'Питання та відповіді' }));
  await screen.findByRole('heading', { name: 'Питання та відповіді' });
  fireEvent.click(nav.getByRole('link', { name: 'Каталог' }));
  expect(await screen.findByLabelText('Що шукаємо?')).toHaveProperty('value', 'конспект');
  expect(screen.getByRole('combobox', { name: 'Факультет' }).value).toBe('Новий факультет з бази');
  expect(screen.getByRole('button', { name: 'Матеріали', exact: true }).getAttribute('aria-pressed')).toBe('true');
  await waitFor(() => {
    const call = fetch.mock.calls.filter(([url]) => new URL(url).pathname === '/api/catalog').at(-1);
    expect(new URL(call[0]).searchParams.get('faculty')).toBe('Новий факультет з бази');
  });
});

it('preserves an unsaved group in memory across navigation', async () => {
  mount({ path: '/profile' });
  await screen.findByRole('heading', { name: 'Ваш профіль' });
  fireEvent.change(screen.getByLabelText('Група'), { target: { value: 'ФЗ-22' } });
  const nav = within(screen.getByRole('navigation', { name: 'Навігація' }));
  fireEvent.click(nav.getByRole('link', { name: 'Питання та відповіді' }));
  await screen.findByRole('heading', { name: 'Питання та відповіді' });
  fireEvent.click(nav.getByRole('link', { name: 'Профіль' }));
  expect(await screen.findByLabelText('Група')).toHaveProperty('value', 'ФЗ-22');
  expect([...Array(localStorage.length)].map((_, i) => localStorage.key(i))).not.toContain(user.id);
});

it('shows a retryable faculty failure instead of a fabricated local list', async () => {
  mount({ failFaculties: true });
  await screen.findByRole('heading', { name: 'Не вдалося завантажити факультети' });
  expect(screen.getByRole('combobox', { name: 'Факультет' }).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Спробувати знову' }));
  await waitFor(() => expect(screen.getByRole('combobox', { name: 'Факультет' }).disabled).toBe(false));
});
