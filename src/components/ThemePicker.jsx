import { useI18n } from '../i18n/useI18n.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getTheme, setTheme } from '../theme.js';
import flashBang from '../assets/flash-bang.png';

function FlashTransition({ origin, onFinish, onCancel }) {
  const dialog = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const { t } = useI18n();
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  useEffect(() => {
    const timer = setTimeout(onFinish, loaded ? 1650 : 3000);
    return () => clearTimeout(timer);
  }, [loaded, onFinish]);
  const x = window.innerWidth * 0.55;
  const y = window.innerHeight * 0.42;
  const size = 2 * Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const style = {
    '--launch-x': `${origin.x}px`, '--launch-y': `${origin.y}px`,
    '--apex-x': `${(origin.x + x) / 2}px`, '--apex-y': `${Math.max(40, Math.min(origin.y, y) - 130)}px`,
    '--burst-x': `${x}px`, '--burst-y': `${y}px`, '--burst-size': `${size}px`,
  };
  return <dialog ref={dialog} aria-label={t('theme.transition')} style={style}
    onCancel={(event) => { event.preventDefault(); onCancel(); }}
    className="flash-stage fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 backdrop:bg-transparent">
    <img src={flashBang} alt="" className={`flash-grenade ${loaded ? 'is-flying' : ''}`} onLoad={() => setLoaded(true)} onError={onFinish} />
    {loaded && <div aria-hidden="true" className="flash-burst pointer-events-none absolute rounded-full bg-white" />}
    <button type="button" autoFocus onClick={onCancel} className="absolute top-4 right-4 z-10 min-h-11 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg">{t('common.cancel')}</button>
  </dialog>;
}

export default function ThemePicker() {
  const { t } = useI18n();
  const [value, update] = useState(getTheme);
  const [origin, setOrigin] = useState(null);
  function choose(theme, event) {
    if (theme === value) return;
    if (theme === 'light' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const bounds = event.currentTarget.getBoundingClientRect();
      setOrigin({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 });
      return;
    }
    setTheme(theme);
    update(theme);
  }
  const finish = useCallback(() => {
    setTheme('light');
    update('light');
    setOrigin(null);
  }, []);
  const cancel = useCallback(() => setOrigin(null), []);
  return <section aria-labelledby="theme-title" className="mt-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
    <h2 id="theme-title" className="text-lg font-semibold">{t('theme.title')}</h2>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('theme.description')}</p>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label={t('theme.label')}>
      {[['dark', t('theme.dark')], ['light', t('theme.light')], ['system', t('theme.system')]].map(([theme, label]) => <button key={theme} type="button" aria-pressed={value === theme} onClick={(event) => choose(theme, event)} className={`min-h-11 rounded-lg border px-4 text-sm ${theme === 'system' ? 'col-span-2 sm:col-span-1' : ''} ${value === theme ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-700'}`}>{label}</button>)}
    </div>
    {origin && <FlashTransition origin={origin} onFinish={finish} onCancel={cancel} />}
  </section>;
}
