import { useId } from 'react';
import { useI18n } from '../i18n/useI18n.js';

export default function LanguagePicker() {
  const id = useId();
  const { language, setLanguage, t } = useI18n();
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
    <label htmlFor={id} className="text-sm font-semibold">{t('language.label')}</label>
    <select id={id} value={language} onChange={(event) => setLanguage(event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:w-52 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
      <option value="uk" lang="uk">Українська</option>
      <option value="en" lang="en">English</option>
    </select>
  </div>;
}
