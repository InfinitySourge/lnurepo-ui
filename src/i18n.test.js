import { afterEach, expect, it, vi } from 'vitest';
import { dictionaries, translate } from './i18n/language.js';
import { facultyLabel, facultyNames } from './i18n/faculties.js';
const faculties = Object.keys(facultyNames);
import { validateProfile } from './profile.js';

afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

it('has matching nonempty translations and matching substitution names', () => {
  const tokens = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  expect(Object.keys(dictionaries.en).sort()).toEqual(Object.keys(dictionaries.uk).sort());
  for (const [key, text] of Object.entries(dictionaries.uk)) {
    expect(text.trim(), key).not.toBe('');
    expect(dictionaries.en[key].trim(), key).not.toBe('');
    expect(tokens(dictionaries.en[key]), key).toEqual(tokens(text));
  }
});

it('interpolates personal data literally without interpreting replacement tokens', () => {
  const name = '$& {email} <script>';
  expect(translate('en', 'support.body', { name, email: 'demo@example.invalid' })).toContain(`Name: ${name}\nAccount: demo@example.invalid`);
  expect(translate('en', 'catalog.more', { count: 30 })).toContain('first 30 results');
  expect(translate('unsupported', 'navigation.profile')).toBe('Профіль');
});

it('translates known faculties while keeping canonical Ukrainian values unchanged', () => {
  for (const value of faculties) {
    expect(facultyLabel(value, 'uk')).toBe(value);
    expect(facultyLabel(value, 'en')).toBeTruthy();
    expect(facultyLabel(value, 'en')).not.toBe(value);
  }
  expect(facultyLabel('Unknown faculty', 'en')).toBe('Unknown faculty');
  const errors = validateProfile({ first_name: '', last_name: '', role: '', faculty: '', group: '' });
  for (const key of Object.values(errors)) expect(dictionaries.en[key]).toBeTruthy();
  expect(errors.first_name).not.toBe(errors.last_name);
});

it('restores a selected language on reload and rejects unsupported preferences', async () => {
  vi.resetModules();
  let store = await import('./i18n/language.js');
  expect(store.getLanguage()).toBe('uk');
  store.setLanguage('en');
  vi.resetModules();
  store = await import('./i18n/language.js');
  expect(store.getLanguage()).toBe('en');
  store.setLanguage('fr');
  expect(store.getLanguage()).toBe('en');
  localStorage.setItem('lnurepo-language', '<script>');
  vi.resetModules();
  store = await import('./i18n/language.js');
  expect(store.getLanguage()).toBe('uk');
});

it('still changes language when browser storage is unavailable', async () => {
  vi.resetModules();
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Blocked'); });
  const store = await import('./i18n/language.js');
  expect(store.getLanguage()).toBe('uk');
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Blocked'); });
  expect(() => store.setLanguage('en')).not.toThrow();
  expect(store.getLanguage()).toBe('en');
  expect(document.documentElement.lang).toBe('en');
});

it('updates document metadata and synchronises language changes from another tab', async () => {
  vi.resetModules();
  localStorage.setItem('lnurepo-language', 'en');
  const store = await import('./i18n/language.js');
  const subscriber = vi.fn();
  const unsubscribe = store.subscribeLanguage(subscriber);
  store.initializeLanguage();
  expect(document.documentElement.lang).toBe('en');
  expect(document.title).toBe(dictionaries.en['app.title']);
  localStorage.setItem('lnurepo-language', 'uk');
  window.dispatchEvent(new StorageEvent('storage', { key: 'lnurepo-language', newValue: 'uk' }));
  expect(store.getLanguage()).toBe('uk');
  expect(document.title).toBe(dictionaries.uk['app.title']);
  expect(subscriber).toHaveBeenCalledOnce();
  unsubscribe();
});
