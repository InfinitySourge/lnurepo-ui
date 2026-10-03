// Blocking, first-party head script: choose theme before CSS/React's first paint.
(() => {
  let preference = 'dark';
  try {
    const stored = localStorage.getItem('lnurepo-theme');
    if (['dark', 'light', 'system'].includes(stored)) preference = stored;
  } catch { /* Local storage is optional. */ }
  const dark = preference === 'dark' || (preference === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();
