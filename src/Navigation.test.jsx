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
    if (path === '/auth/me') data = {id:'demo:test',name:'Марко Студент',email:'demo@example.invalid'};
    else if (path === '/api/profile') data = options.method === 'POST' ? JSON.parse(options.body) : saved;
    else if (path === '/api/catalog') data = {disciplines:bucket,teachers:bucket,materials:bucket};
    else if (path === '/api/favorites') data = bucket;
    else if (path === '/api/faq') data = {available:false,items:[]};
    else throw new Error('Unexpected endpoint');
    return {status:200,ok:true,json:async () => data};
  }));
  render(<MemoryRouter initialEntries={['/profile']}><App /></MemoryRouter>);
}
afterEach(() => {cleanup();vi.unstubAllGlobals();sessionStorage.clear();});
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
  const labels = {first_name:'Ім’я',last_name:'Прізвище',role:'Ви студент чи викладач?',faculty:'Факультет',group:'Група'};
  for (const [key,value] of Object.entries(profile)) fireEvent.change(screen.getByLabelText(labels[key]),{target:{value}});
  fireEvent.click(screen.getByRole('button',{name:'Зберегти профіль'}));
  await screen.findByRole('heading',{name:'Знання ближче, ніж здається'});
  fireEvent.click(screen.getByRole('link',{name:'Збережене'}));
  expect(await screen.findByRole('heading',{name:'Збережене'})).toBeTruthy();
});
it('retains the demo profile after a module reload', async () => {
  const before = await import('./design-preview.js');
  before.previewRequest('/api/profile',{method:'POST',body:profile});
  vi.resetModules();
  const after = await import('./design-preview.js');
  expect(after.previewRequest('/api/profile',{method:'GET'})).toEqual(profile);
});
