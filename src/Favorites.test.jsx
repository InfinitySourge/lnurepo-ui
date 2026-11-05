import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import FavoriteButton from './components/FavoriteButton.jsx';
import { setLanguage } from './i18n/language.js';

beforeEach(() => { setLanguage('uk'); vi.stubGlobal('fetch', vi.fn()); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); });
const response = (status, data) => ({ status, ok: status < 400, json: async () => data });

it('saves a material through the API and removes the saved association', async () => {
  fetch.mockResolvedValueOnce(response(201, { material_id: 7 })).mockResolvedValueOnce(response(204));
  render(<FavoriteButton materialId="7" />);
  fireEvent.click(screen.getByRole('button', { name: 'Зберегти матеріал' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Прибрати зі збереженого' }));
  await screen.findByRole('button', { name: 'Зберегти матеріал' });
  expect(fetch.mock.calls[0][0]).toMatch(/\/api\/favorites$/);
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ material_id: 7 });
  expect(fetch.mock.calls[1][0]).toMatch(/\/api\/favorites\/7$/);
  expect(fetch.mock.calls[1][1].method).toBe('DELETE');
});

it('confirms a conflict is an existing own favorite before showing it as saved', async () => {
  fetch.mockResolvedValueOnce(response(409)).mockResolvedValueOnce(response(200, { material_id: 7 }));
  render(<FavoriteButton materialId="7" />);
  fireEvent.click(screen.getByRole('button', { name: 'Зберегти матеріал' }));
  await screen.findByRole('button', { name: 'Прибрати зі збереженого' });
  expect(fetch.mock.calls[1][1].method).toBe('GET');
});

it('keeps the previous state on failure and never exposes server details', async () => {
  fetch.mockResolvedValue(response(503, { detail: 'private database password' }));
  render(<FavoriteButton materialId="7" />);
  fireEvent.click(screen.getByRole('button', { name: 'Зберегти матеріал' }));
  await screen.findByRole('dialog', { name: 'Не вдалося змінити добірку' });
  expect(screen.queryByRole('button', { name: 'Прибрати зі збереженого' })).toBeNull();
  expect(screen.queryByText(/private database/)).toBeNull();
});

it('refreshes the saved list after a successful removal', async () => {
  fetch.mockResolvedValue(response(204));
  const removed = vi.fn();
  render(<FavoriteButton materialId="7" initiallySaved onRemoved={removed} />);
  fireEvent.click(screen.getByRole('button', { name: 'Прибрати зі збереженого' }));
  await screen.findByRole('button', { name: 'Зберегти матеріал' });
  expect(removed).toHaveBeenCalledTimes(1);
});
