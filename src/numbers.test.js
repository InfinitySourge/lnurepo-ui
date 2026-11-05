import { describe, expect, it } from 'vitest';
import { formatNumber, parseNumber } from './i18n/numbers.js';

describe('Localized numbers', () => {
  it.each([['uk', '3,5'], ['en', '3.5']])('parses and formats a decimal in %s', (language, input) => {
    expect(parseNumber(input, language)).toBe(3.5);
    expect(formatNumber(3.5, language)).toBe(input);
  });
  it.each([['uk', '3.5'], ['en', '3,5'], ['uk', '3,5,1'], ['en', 'Infinity'], ['uk', ''], ['en', '1e20'], ['uk', '<script>']])('rejects ambiguous or invalid input %s %s', (language, input) => {
    expect(parseNumber(input, language)).toBeNull();
  });
  it('keeps zero and negative values, rejects nonfinite numbers', () => {
    expect(parseNumber('0', 'uk')).toBe(0);
    expect(parseNumber('-3,5', 'uk')).toBe(-3.5);
    expect(() => formatNumber(Infinity, 'en')).toThrow();
  });
});
it.each(['uk', 'en'])('parses the formatted thousands in %s', (language) => {
  expect(parseNumber(formatNumber(1234.5, language), language)).toBe(1234.5);
});
it('rejects an integer that cannot be represented safely', () => {
  expect(parseNumber('9007199254740993', 'en')).toBeNull();
});
