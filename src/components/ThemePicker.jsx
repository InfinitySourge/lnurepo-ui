import { useState } from 'react';
import { getTheme, setTheme } from '../theme.js';
export default function ThemePicker() {
  const [value, update] = useState(getTheme);
  return <section aria-labelledby="theme-title" className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
    <h2 id="theme-title" className="text-lg font-semibold">Вигляд простору</h2>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Тема зберігається на цьому пристрої, незалежно від збереження профілю.</p>
    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Тема">
      {[['dark', 'Темна'], ['light', 'Світла'], ['system', 'Як у системі']].map(([theme, label]) => <button key={theme} type="button" aria-pressed={value === theme} onClick={() => { setTheme(theme); update(theme); }} className={`min-h-11 rounded-lg border px-4 text-sm ${value === theme ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-700'}`}>{label}</button>)}
    </div>
  </section>;
}
