import { faculties } from './data/faculties.js';
const namePattern = /^\p{L}[\p{L}\p{M} '’ʼ-]*$/u;
export function validateProfile(value) {
  const errors = {};
  for (const key of ['first_name', 'last_name']) {
    if (!value[key]?.trim() || value[key].length > 80 || !namePattern.test(value[key].trim())) {
      errors[key] = 'Введіть ім’я літерами (до 80 символів). Дозволені пробіли, апостроф і дефіс, але не цифри.';
    }
  }
  if (!['student', 'teacher'].includes(value.role)) errors.role = 'Оберіть статус.';
  if (!faculties.includes(value.faculty)) errors.faculty = 'Оберіть факультет зі списку.';
  if ((value.role === 'student' && !value.group?.trim()) || value.group?.length > 32
      || (value.group && !/^[\p{L}\p{M}\p{N} .’'ʼ/-]+$/u.test(value.group))) {
    errors.group = 'Вкажіть групу (до 32 символів): літери, цифри, пробіл, крапка або дефіс.';
  }
  return errors;
}
export function isProfile(value) {
  return value && typeof value === 'object'
    && ['first_name', 'last_name', 'role', 'faculty', 'group'].every((key) => typeof value[key] === 'string')
    && Object.keys(validateProfile(value)).length === 0;
}
