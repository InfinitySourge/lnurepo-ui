const storageKey = 'lnurepo-theme';
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
  let theme = 'system';
  try { theme = localStorage.getItem(storageKey) || 'system'; } catch { /* Optional preference. */ }
  if (!['light', 'dark', 'system'].includes(theme)) theme = 'system';
  applyTheme(theme);
  const media = matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', () => {
    let preference = 'system';
    try { preference = localStorage.getItem(storageKey) || 'system'; } catch { /* Optional preference. */ }
    if (preference === 'system') applyTheme('system');
  });
}
