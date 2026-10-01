import { describe, expect, it } from 'vitest';
import { validateProfile, isProfile } from './profile.js';
import { initializeTheme, setTheme } from './theme.js';
const valid = { first_name: 'Мар’ян', last_name: 'Квітка-Основ’яненко', role: 'student', faculty: 'Фізичний факультет', group: 'ФЗ-21' };
describe('Profile validation', () => {
  it('accepts Unicode names and legitimate punctuation', () => expect(isProfile(valid)).toBe(true));
  it.each(['123', '<script>', 'Іван1', 'Іван\u202e', ' ', 'a'.repeat(81)])('rejects unsafe name %s', (first_name) => expect(validateProfile({ ...valid, first_name }).first_name).toBeTruthy());
  it('requires group only for students', () => {
    expect(validateProfile({ ...valid, group: '' }).group).toBeTruthy();
    expect(isProfile({ ...valid, role: 'teacher', group: '' })).toBe(true);
  });
  it('rejects fabricated roles and faculties', () => {
    expect(isProfile({ ...valid, role: 'admin' })).toBe(false);
    expect(isProfile({ ...valid, faculty: 'unknown' })).toBe(false);
  });
  it('changes theme without storing credentials or profile', () => {
    setTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    setTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    localStorage.setItem('lnurepo-theme', '<script>');
    initializeTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
    localStorage.clear();
  });
});

