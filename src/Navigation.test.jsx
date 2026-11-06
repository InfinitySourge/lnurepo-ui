import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
const profile = {first_name:'Марко',last_name:'Студент',role:'student',faculty:'Фізичний факультет',group:'ФЗ-21'};
const bucket = {available:false,items:[],has_more:false};
function setup(saved = profile) {
  vi.stubGlobal('fetch', vi.fn(async (url, options) => {
    let data;
    const path = new URL(url).pathname;
    if (path === '/auth/me') data = {id:'test:user',name:'Марко Студент',email:'test@example.invalid',...profile,role_hint:'student'};
    else if (path === '/api/profiles') data = { ...profile, ...JSON.parse(options.body), id: 'test:user' };
    else if (decodeURIComponent(path) === '/api/profiles/test:user') data = saved && { ...saved, id: 'test:user' };
    else if (path === '/api/faculties') data = [{ id: 15, name: profile.faculty }];
    else if (path === '/api/catalog') data = {disciplines:bucket,teachers:bucket,materials:bucket};
    else if (path === '/api/favorites') data = bucket;
    else if (path === '/api/faq') data = {available:false,items:[]};
    else throw new Error('Unexpected endpoint');
    const status = data === null ? 404 : options.method === 'POST' ? 201 : 200;
    return {status,ok:status < 400,json:async () => data};
  }));
  render(<MemoryRouter initialEntries={['/profile']}><App /></MemoryRouter>);
}
afterEach(() => {cleanup();vi.unstubAllGlobals();});
it('opens catalog and favorites repeatedly and highlights the actual route', async () => {
  setup();
  await screen.findByRole('heading',{name:'Ваш профіль'});
  const nav = within(screen.getByRole('navigation',{name:'Навігація'}));
  for (let i = 0; i < 2; i++) {
    fireEvent.click(nav.getByRole('link',{name:'Каталог'}));
    await screen.findByRole('heading',{name:'Знання ближче, ніж здається'});
    expect(nav.getByRole('link',{name:'Каталог'}).getAttribute('aria-current')).toBe('page');
    fireEvent.click(nav.getByRole('link',{name:'Збережене'}));
    await screen.findByRole('heading',{name:'Збережене'});
    expect(nav.getByRole('link',{name:'Збережене'}).getAttribute('aria-current')).toBe('page');
    expect(nav.getByRole('link',{name:'Каталог'}).getAttribute('aria-current')).toBeNull();
  }
});
it('explains the profile gate and unlocks navigation after saving', async () => {
  setup(null);
  await screen.findByRole('heading',{name:'Завершіть реєстрацію'});
  fireEvent.click(screen.getByRole('link',{name:'Збережене'}));
  expect(await screen.findByRole('heading',{name:'Завершіть реєстрацію'})).toBeTruthy();
  expect(screen.getByRole('link',{name:'Профіль'}).getAttribute('aria-current')).toBe('page');
  fireEvent.change(screen.getByLabelText('Група'),{target:{value:profile.group}});
  fireEvent.click(screen.getByRole('button',{name:'Зберегти профіль'}));
  await screen.findByRole('heading',{name:'Знання ближче, ніж здається'});
  fireEvent.click(screen.getByRole('link',{name:'Збережене'}));
  expect(await screen.findByRole('heading',{name:'Збережене'})).toBeTruthy();
});
