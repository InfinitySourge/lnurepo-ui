import { useState } from 'react';
import { useAuth } from '../auth-context.js';
import Brand from '../components/Brand.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import Notice from '../components/Notice.jsx';
import { errorMessage } from '../api.js';
export default function AppLayout({ children, compactSidebar = false }) {
  const { user, profile, profileUnavailable, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const name = profile ? profile.first_name + ' ' + profile.last_name : user.name || user.email;
  async function leave() {
    setBusy(true);
    try { await logout(); } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }
  return <div className="min-h-screen">
    <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4 focus:text-slate-900">Перейти до вмісту</a>
    <header className="flex h-20 items-center justify-between bg-brand-950 px-5 text-white sm:px-8"><Brand /><Button variant="ghost" className="text-white hover:bg-white/10" busy={busy} onClick={leave}>Вийти</Button></header>
    <div className="mx-auto grid max-w-[1500px] lg:min-h-[calc(100vh_-_5rem)] lg:grid-cols-[280px_1fr]">
      <aside aria-label="Профіль і збережені матеріали" className={`${compactSidebar ? 'hidden lg:block' : ''} border-b border-slate-200 bg-white p-6 lg:border-r lg:border-b-0 dark:border-slate-800 dark:bg-slate-900`}>
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
        <Button variant="secondary" to="/profile" className="mt-6 w-full">Редагувати профіль</Button>
        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700"><h3 className="text-sm font-semibold">Збережені матеріали</h3><p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Цей розділ готується. Збереження матеріалів ще не підключено.</p></div>
        <a className="mt-8 inline-block text-xs text-blue-700 underline underline-offset-4 dark:text-blue-300" href="mailto:support@lnurepo.info">Повідомити про проблему</a>
      </aside>
      <main id="content" tabIndex={-1} className="min-w-0 p-5 outline-none sm:p-10 lg:p-12">
        {profileUnavailable && <div className="mb-6"><Notice title="Профіль тимчасово недоступний">Можна переглядати головну. Спробуйте заповнити профіль пізніше.</Notice></div>}
        {children}
      </main>
    </div>
    <Modal open={Boolean(error)} title="Не вдалося вийти" onClose={() => setError('')}>{error}</Modal>
  </div>;
}
