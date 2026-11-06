import { describe, expect, it } from 'vitest';
import { initialProfile, validateProfile, isProfile } from './profile.js';
import { initializeTheme, setTheme } from './theme.js';
const valid = { first_name: 'Мар’ян', last_name: 'Квітка-Основ’яненко', role: 'student', faculty: 'Фізичний факультет', group: 'ФЗ-21' };
describe('Profile validation', () => {
  it('prefills a new profile from Microsoft and leaves the group empty', () => {
    expect(initialProfile({ first_name: 'Марко', last_name: 'Палій', faculty: valid.faculty, role_hint: 'student' }, null))
      .toEqual({ first_name: 'Марко', last_name: 'Палій', faculty: valid.faculty, role: 'student', group: '' });
  });
  it('keeps saved data instead of overwriting it with Microsoft prefills', () => {
    expect(initialProfile({ first_name: 'Іван', faculty: 'unknown' }, valid)).toEqual(valid);
  });
  it('rejects malformed automatic account fields', () => {
    expect(initialProfile({ first_name: {}, last_name: '<script>', faculty: '\u202e', role_hint: 'admin' }, null))
      .toEqual({ first_name: '', last_name: '', faculty: '', role: '', group: '' });
  });
  it('accepts Unicode names and legitimate punctuation', () => expect(isProfile(valid)).toBe(true));
  it.each(['123', '<script>', 'Іван1', 'Іван\u202e', ' ', 'a'.repeat(81)])('rejects unsafe name %s', (first_name) => expect(validateProfile({ ...valid, first_name }).first_name).toBeTruthy());
  it('requires group only for students', () => {
    expect(validateProfile({ ...valid, group: '' }).group).toBeTruthy();
    expect(isProfile({ ...valid, role: 'teacher', group: '' })).toBe(true);
  });
  it('rejects fabricated roles and malformed faculties', () => {
    expect(isProfile({ ...valid, role: 'admin' })).toBe(false);
    expect(isProfile({ ...valid, faculty: '' })).toBe(false);
  });
  it('accepts faculty names added to the database without a frontend release', () => {
    expect(isProfile({ ...valid, faculty: 'Новий факультет' })).toBe(true);
  });
  it('changes theme without storing credentials or profile', () => {
    setTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    setTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    localStorage.setItem('lnurepo-theme', '<script>');
    initializeTheme();
    expect(document.documentElement.dataset.theme).toBe('dark');
    localStorage.clear();
  });
});

