import { useState } from 'react';
import AppLayout from '../layouts/AppLayout.jsx';
import SearchSelect from '../components/SearchSelect.jsx';
import DataState from '../components/DataState.jsx';
import { faculties } from '../data/faculties.js';
export default function HomePage() {
  const [faculty, setFaculty] = useState('');
  return <AppLayout>
    <p className="mb-3 text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Навчальний простір</p>
    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">База навчальних матеріалів ЛНУ</h1>
    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">Оберіть факультет, щоб перейти до його навчальних матеріалів.</p>
    <section aria-label="Вибір факультету" className="mt-9 max-w-3xl rounded-xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
      <SearchSelect label="Оберіть потрібний факультет" options={faculties} value={faculty} onChange={setFaculty} placeholder="Почніть вводити назву факультету" />
      <div className="mt-7"><DataState status="empty" title={faculty ? 'Матеріали ще не додані' : 'Навчальні матеріали'}>
        {faculty ? <><p className="mb-2 font-medium">{faculty}</p><p>Каталог готується. Тут з’являться предмети та матеріали факультету.</p></> : 'Почніть із вибору факультету. Каталог матеріалів буде підключено наступним етапом.'}
      </DataState></div>
    </section>
  </AppLayout>;
}
