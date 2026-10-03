import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth-context.js';
import Brand from '../components/Brand.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import { DESIGN_PREVIEW, errorMessage } from '../api.js';
export default function AppLayout({ children }) {
  const { user, profile, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const name = profile ? profile.first_name + ' ' + profile.last_name : user.name || user.email;
  async function leave() {
    setBusy(true);
    try { await logout(); } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }
  return <div className="app-page min-h-screen">
    {DESIGN_PREVIEW && <div role="status" className="bg-amber-100 px-5 py-2 text-center text-xs text-amber-950">Локальний перегляд · демонстраційні дані</div>}
    <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4 focus:text-slate-900">Перейти до вмісту</a>
    <header className="flex h-20 items-center justify-between bg-brand-950 px-5 text-white sm:px-8"><Brand /><Button variant="ghost" className="text-white hover:bg-white/10" busy={busy} onClick={leave}>Вийти</Button></header>
    <div className="mx-auto grid max-w-[1500px] lg:min-h-[calc(100vh_-_5rem)] lg:grid-cols-[280px_1fr]">
      <aside aria-label="Профіль і збережені матеріали" className="app-panel border-b p-6 lg:border-r lg:border-b-0">
        <div className="flex items-center gap-4 lg:block">
          <div aria-hidden="true" className="mb-4 flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-brand-800 dark:bg-blue-950 dark:text-blue-200">{Array.from(name).slice(0, 2).join('').toUpperCase()}</div>
          <h2 className="text-lg font-semibold break-words">{name}</h2>
        </div>
        <p className="mt-1 text-xs break-all text-slate-500 dark:text-slate-400">{user.email}</p>
        <dl className="mt-6 space-y-4 text-sm">
          <div><dt className="text-xs text-slate-500 dark:text-slate-400">Статус</dt><dd className="mt-1">{profile ? profile.role === 'teacher' ? 'Викладач' : 'Студент' : 'Не заповнено'}</dd></div>
          <div><dt className="text-xs text-slate-500 dark:text-slate-400">Факультет</dt><dd className="mt-1">{profile?.faculty || 'Не заповнено'}</dd></div>
          {profile?.group && <div><dt className="text-xs text-slate-500 dark:text-slate-400">Група</dt><dd className="mt-1">{profile.group}</dd></div>}
        </dl>
        <nav aria-label="Навігація" className="mt-7 space-y-2">{[['/', 'Каталог'], ['/profile', 'Профіль'], ['/favorites', 'Збережене'], ['/faq', 'Питання та відповіді']].map(([to, label]) => <NavLink end={to === '/'} key={to} to={to} className="app-nav-link">{label}</NavLink>)}</nav>
        {!profile && <p role="status" className="mt-3 text-sm text-amber-800 dark:text-amber-200">Щоб відкрити каталог і збережене, спочатку заповніть та збережіть профіль.</p>}
        <a className="mt-8 inline-block text-xs text-blue-700 underline underline-offset-4 dark:text-blue-300" href="mailto:support@lnurepo.info">Повідомити про проблему</a>
      </aside>
      <main id="content" tabIndex={-1} className="min-w-0 p-5 outline-none sm:p-10 lg:p-12">
        {children}
      </main>
    </div>
    <Modal open={Boolean(error)} title="Не вдалося вийти" onClose={() => setError('')}>{error}</Modal>
  </div>;
}
