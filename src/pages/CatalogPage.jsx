import { useState } from 'react';
import SearchSelect from '../components/SearchSelect.jsx';
import DataState from '../components/DataState.jsx';
import CatalogSection from '../components/CatalogSection.jsx';
import CatalogFailure from '../components/CatalogFailure.jsx';
import { faculties } from '../data/faculties.js';
import { useAuth } from '../auth-context.js';
import { useCatalogData } from '../catalog.js';
const sections = [['disciplines', 'Дисципліни'], ['teachers', 'Викладачі'], ['materials', 'Матеріали']];
export default function CatalogPage() {
  const { profile } = useAuth();
  const [faculty, setFaculty] = useState(profile.faculty);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const result = useCatalogData(faculty, query.trim());
  return <div className="mx-auto max-w-5xl">
    <p className="mb-3 text-xs font-semibold tracking-widest text-blue-600 uppercase dark:text-blue-300">Ваш навчальний простір</p>
    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Знання ближче, ніж здається</h1>
    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">Дисципліни, викладачі та матеріали — в одному каталозі. Почніть зі свого факультету або оберіть інший.</p>
    <section aria-label="Пошук у каталозі" className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
      <SearchSelect label="Факультет" options={faculties} value={faculty} onChange={setFaculty} />
      <label className="mt-5 block text-sm font-semibold" htmlFor="catalog-search">Що шукаємо?</label>
      <input id="catalog-search" type="search" maxLength={100} disabled={!faculty} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Дисципліна, викладач або матеріал" className="mt-3 h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950" />
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Тип результатів">{[['all','Усе'],...sections].map(([key,label]) => <button type="button" key={key} aria-pressed={category === key} onClick={() => setCategory(key)} className={`min-h-11 rounded-full px-4 text-sm ${category === key ? 'bg-brand-950 text-white dark:bg-blue-600' : 'bg-slate-100 dark:bg-slate-800'}`}>{label}</button>)}</div>
    </section>
    <div className="mt-7 space-y-5" aria-live="polite" aria-busy={Boolean(faculty && result.loading)}>{!faculty ? <DataState status="empty" title="Оберіть факультет">Виберіть факультет зі списку.</DataState> : result.error ? <CatalogFailure error={result.error} retry={result.retry} /> : result.loading ? <DataState status="loading" /> : sections.filter(([k]) => category === 'all' || category === k).map(([k,title]) => <CatalogSection key={k} title={title} bucket={result.data[k]} searching={Boolean(query.trim())} />)}</div>
  </div>;
}
