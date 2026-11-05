import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import ThemePicker from './components/ThemePicker.jsx';
import { setTheme } from './theme.js';
import { setLanguage } from './i18n/language.js';

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(window.matchMedia).mockReturnValue({ matches: false, addEventListener: vi.fn() });
  setTheme('dark');
  setLanguage('uk');
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); localStorage.clear(); });

it('plays the light-theme animation once and then applies and saves light mode', async () => {
  render(<ThemePicker />);
  fireEvent.click(screen.getByRole('button', { name: 'Світла' }));
  const dialog = screen.getByRole('dialog', { name: 'Перехід до світлої теми' });
  fireEvent.load(dialog.querySelector('img'));
  expect(document.documentElement.dataset.theme).toBe('dark');
  await act(() => vi.advanceTimersByTimeAsync(1650));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(localStorage.getItem('lnurepo-theme')).toBe('light');
  fireEvent.click(screen.getByRole('button', { name: 'Світла' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Темна' }));
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('lets the user cancel the animation and keeps the original theme', async () => {
  render(<ThemePicker />);
  fireEvent.click(screen.getByRole('button', { name: 'Світла' }));
  fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));
  await act(() => vi.advanceTimersByTimeAsync(5000));
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('respects reduced motion and switches immediately without a flash', () => {
  vi.spyOn(window, 'matchMedia').mockImplementation(() => ({ matches: true }));
  render(<ThemePicker />);
  fireEvent.click(screen.getByRole('button', { name: 'Світла' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.documentElement.dataset.theme).toBe('light');
});

it('still applies light mode if the animation fails to load', () => {
  render(<ThemePicker />);
  fireEvent.click(screen.getByRole('button', { name: 'Світла' }));
  fireEvent.error(screen.getByRole('dialog').querySelector('img'));
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('cleans up animation timers when leaving the profile', async () => {
  const view = render(<ThemePicker />);
  fireEvent.click(screen.getByRole('button', { name: 'Світла' }));
  fireEvent.load(screen.getByRole('dialog').querySelector('img'));
  view.unmount();
  await act(() => vi.advanceTimersByTimeAsync(5000));
  expect(document.documentElement.dataset.theme).toBe('dark');
});


it('launches a transparent sprite from the light button coordinates', () => {
  render(<ThemePicker />);
  const button = screen.getByRole('button', { name: 'Світла' });
  vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 200, width: 140, height: 44 });
  fireEvent.click(button);
  const dialog = screen.getByRole('dialog');
  expect(dialog.style.getPropertyValue('--launch-x')).toBe('170px');
  expect(dialog.style.getPropertyValue('--launch-y')).toBe('222px');
  expect(dialog.querySelector('img').src).toContain('flash-bang.png');
  fireEvent.load(dialog.querySelector('img'));
  expect(dialog.querySelector('.flash-burst')).toBeTruthy();
});
