import { getLanguage } from './language.js';

const locales = { uk: 'uk-UA', en: 'en-US' };
export function formatNumber(value, language = getLanguage(), options = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError('Expected a finite number');
  return new Intl.NumberFormat(locales[language] ?? locales.uk, options).format(value);
}
export function parseNumber(value, language = getLanguage()) {
  if (typeof value !== 'string' || value.length > 64) return null;
  const trimmed = value.trim();
  const pattern = language === 'en'
    ? /^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/
    : /^[+-]?(?:\d+|\d{1,3}(?:[\u00a0\u202f ]\d{3})+)(?:,\d+)?$/;
  if (!pattern.test(trimmed)) return null;
  const normalized = language === 'en' ? trimmed.replaceAll(',', '') : trimmed.replace(/[\u00a0\u202f ]/g, '').replace(',', '.');
  const number = Number(normalized);
  return Number.isFinite(number) && (!Number.isInteger(number) || Number.isSafeInteger(number)) ? number : null;
}
