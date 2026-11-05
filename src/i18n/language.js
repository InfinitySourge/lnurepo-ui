
import uk from './uk.js';
import en from './en.js';

export const dictionaries = { uk, en };

const storageKey = 'lnurepo-language';
const listeners = new Set();

function readLanguage() {
  try {
    return localStorage.getItem(storageKey) === 'en' ? 'en' : 'uk';
  } catch {
    return 'uk';
  }
}

let language = readLanguage();

export function getLanguage() {
  return language;
}

export function translate(locale, key, values = {}) {
  const text = dictionaries[locale]?.[key] ?? uk[key] ?? key;

  return text.replace(/\{(\w+)\}/g, (token, name) =>
    Object.hasOwn(values, name) ? String(values[name]) : token
  );
}

export function t(key, values) {
  return translate(language, key, values);
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.title = t('app.title');
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', t('app.description'));
}

export function setLanguage(value) {
  if (!Object.hasOwn(dictionaries, value)) return;

  language = value;

  try {
    localStorage.setItem(storageKey, value);
  } catch {
    // Ignore storage errors
  }

  applyLanguage();
  listeners.forEach((listener) => listener());
}

export function subscribeLanguage(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initializeLanguage() {
  applyLanguage();

  window.addEventListener('storage', (event) => {
    if (event.key !== storageKey && event.key !== null) return;

    language = readLanguage();
    applyLanguage();
    listeners.forEach((listener) => listener());
  });
}
