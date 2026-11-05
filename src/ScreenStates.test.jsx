import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { setLanguage } from './i18n/language.js';

const profile = { id: 'tenant:student', first_name: 'Марко', last_name: 'Студент', faculty: 'Фізичний факультет', role: 'student', group: 'ФЗ-21' };
const user = { id: profile.id, name: 'Марко Студент', email: 'student@example.invalid' };
const empty = { available: true, items: [], has_more: false };
const cases = [
  ['/', 'Знання ближче, ніж здається', '/api/catalog', 'Тут поки порожньо', 'Книга українською'],
  ['/favorites', 'Збережене', '/api/favorites', 'Тут поки порожньо', 'Книга українською'],
  ['/faq', 'Питання та відповіді', '/api/faq', 'Питання ще не додані', 'Як шукати матеріали?'],
];
beforeEach(() => { setLanguage('uk'); localStorage.clear(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); });

for (const [path, heading, endpoint, emptyHeading, itemHeading] of cases) {
  it.each(['loading', 'empty', 'error', 'data'])(`${path} renders the %s state from the API`, async (state) => {
    vi.stubGlobal('fetch', vi.fn(async (url, options) => {
      const route = decodeURIComponent(new URL(url).pathname);
      let data;
      let status = 200;
      if (route === '/auth/me') data = user;
      else if (route === '/api/profiles/' + profile.id) data = profile;
      else if (route === '/api/faculties') data = [{ id: 15, name: profile.faculty }];
      else if (route === endpoint) {
        if (state === 'loading') return new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));
        if (state === 'error') { status = 503; data = { detail: 'private database detail' }; }
        else {
          const bucket = { ...empty, items: state === 'data' ? [{ id: '1', title: 'Книга українською', faculty: profile.faculty, description: null }] : [] };
          data = endpoint === '/api/catalog' ? { disciplines: empty, teachers: empty, materials: bucket }
            : endpoint === '/api/favorites' ? bucket : { available: true, items: state === 'data' ? [{ id: '1', question: 'Як шукати матеріали?', answer: 'Оберіть факультет.' }] : [] };
        }
      } else throw new Error('Unexpected endpoint');
      return { status, ok: status < 400, json: async () => data };
    }));
    render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
    await screen.findByRole('heading', { name: heading });
    if (state === 'loading') expect(await screen.findByRole('status', { name: 'Завантажуємо дані' })).toBeTruthy();
    else if (state === 'empty') expect((await screen.findAllByRole('heading', { name: emptyHeading })).length).toBeGreaterThan(0);
    else if (state === 'error') {
      expect(await screen.findByText('Не вдалося завантажити дані')).toBeTruthy();
      expect(screen.queryByText(/private database/)).toBeNull();
    } else expect(await screen.findByText(itemHeading)).toBeTruthy();
  });
}
