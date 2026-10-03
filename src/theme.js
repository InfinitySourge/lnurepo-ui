const storageKey = 'lnurepo-theme';
export function getTheme() {
  try { const value = localStorage.getItem(storageKey); return ['light', 'dark', 'system'].includes(value) ? value : 'dark'; }
  catch { return 'dark'; }
}
export function setTheme(theme) {
  if (!['light', 'dark', 'system'].includes(theme)) throw new Error('Invalid theme');
  try { localStorage.setItem(storageKey, theme); } catch { /* Storage may be disabled. */ }
  applyTheme(theme);
}
function applyTheme(theme) {
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}
export function initializeTheme() {
  const theme = getTheme();
  applyTheme(theme);
  const media = matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', () => {
    const preference = getTheme();
    if (preference === 'system') applyTheme('system');
  });
  window.addEventListener('storage', (event) => { if (event.key === storageKey) applyTheme(getTheme()); });
}
