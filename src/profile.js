const namePattern = /^\p{L}[\p{L}\p{M} '’ʼ-]*$/u;
const validFaculty = (value) => typeof value === 'string' && Boolean(value.trim()) && value.length <= 120 && !/\p{C}/u.test(value);
export function initialProfile(user, profile) {
  if (profile) return Object.fromEntries(['first_name', 'last_name', 'role', 'faculty', 'group'].map((key) => [key, profile[key]]));
  const name = (value) => typeof value === 'string' && value.length <= 80 && namePattern.test(value) ? value : '';
  return {
    first_name: name(user.first_name),
    last_name: name(user.last_name),
    role: ['student', 'teacher'].includes(user.role_hint) ? user.role_hint : '',
    faculty: validFaculty(user.faculty) ? user.faculty : '',
    group: '',
  };
}
export function validateProfile(value) {
  const errors = {};
  for (const key of ['first_name', 'last_name']) {
    if (!value[key]?.trim() || value[key].length > 80 || !namePattern.test(value[key].trim())) {
      errors[key] = key === 'first_name' ? 'validation.firstName' : 'validation.lastName';
    }
  }
  if (!['student', 'teacher'].includes(value.role)) errors.role = 'validation.role';
  if (!validFaculty(value.faculty)) errors.faculty = 'validation.faculty';
  if ((value.role === 'student' && !value.group?.trim()) || value.group?.length > 32
      || (value.group && !/^[\p{L}\p{M}\p{N} .’'ʼ/-]+$/u.test(value.group))) {
    errors.group = 'validation.group';
  }
  return errors;
}
export function isProfile(value) {
  return value && typeof value === 'object'
    && ['first_name', 'last_name', 'role', 'faculty', 'group'].every((key) => typeof value[key] === 'string')
    && Object.keys(validateProfile(value)).length === 0;
}
