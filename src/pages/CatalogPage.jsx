import { useI18n } from '../i18n/useI18n.js';

import SearchSelect from '../components/SearchSelect.jsx';
import DataState from '../components/DataState.jsx';
import CatalogSection from '../components/CatalogSection.jsx';
import CatalogFailure from '../components/CatalogFailure.jsx';
import { facultyLabel } from '../i18n/faculties.js';
import { useFaculties } from '../faculties.js';
import Button from '../components/Button.jsx';
import { useAuth } from '../auth-context.js';
import { useCatalogData } from '../catalog.js';
export default function CatalogPage() {
  const { t, language } = useI18n();
  const sections = ['disciplines', 'teachers', 'materials'].map((key) => [key, t(`catalog.${key}`)]);
  const { profile, catalogFilters, setCatalogFilters } = useAuth();
  const faculty = catalogFilters.faculty ?? profile.faculty;
  const { query, category } = catalogFilters;
  const faculties = useFaculties();
  const setFilter = (name, value) => setCatalogFilters((previous) => ({ ...previous, [name]: value }));
  const result = useCatalogData(faculty, query.trim());
  return <div className="mx-auto max-w-5xl">
    <p className="mb-3 text-xs font-semibold tracking-widest text-blue-600 uppercase dark:text-blue-300">{t('catalog.eyebrow')}</p>
    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('catalog.title')}</h1>
    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">{t('catalog.description')}</p>
    <section aria-label={t('catalog.searchLabel')} className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
      <SearchSelect label={t('common.faculty')} options={faculties.data ?? []} value={faculty} onChange={(value) => setFilter('faculty', value)} disabled={faculties.loading || Boolean(faculties.error)} getOptionLabel={(value) => facultyLabel(value, language)} />
      {faculties.loading && <p role="status" className="mt-3 text-sm text-slate-500">{t('faculties.loading')}</p>}
      {faculties.error && <div role="alert" className="mt-3"><h2 className="font-semibold">{t('faculties.error')}</h2><Button variant="secondary" onClick={faculties.retry} className="mt-2">{t('common.retry')}</Button></div>}
      {faculties.data?.length === 0 && <p role="status" className="mt-3 text-sm">{t('faculties.empty')}</p>}
      <label className="mt-5 block text-sm font-semibold" htmlFor="catalog-search">{t('catalog.searchQuestion')}</label>
      <input id="catalog-search" type="search" maxLength={100} disabled={!faculty} value={query} onChange={(e) => setFilter('query', e.target.value)} placeholder={t('catalog.searchPlaceholder')} className="mt-3 h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950" />
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={t('catalog.categories')}>{[['all',t('catalog.all')],...sections].map(([key,label]) => <button type="button" key={key} aria-pressed={category === key} onClick={() => setFilter('category', key)} className={`min-h-11 rounded-full px-4 text-sm ${category === key ? 'bg-brand-950 text-white dark:bg-blue-600' : 'bg-slate-100 dark:bg-slate-800'}`}>{label}</button>)}</div>
    </section>
    <div className="mt-7 space-y-5" aria-live="polite" aria-busy={Boolean(faculty && result.loading)}>{!faculty ? <DataState status="empty" title={t('catalog.chooseFaculty')}>{t('catalog.chooseFacultyDescription')}</DataState> : result.error ? <CatalogFailure error={result.error} retry={result.retry} /> : result.loading ? <DataState status="loading" /> : sections.filter(([k]) => category === 'all' || category === k).map(([k,title]) => <CatalogSection key={k} title={title} bucket={result.data[k]} materials={k === 'materials'} searching={Boolean(query.trim())} />)}</div>
  </div>;
}
