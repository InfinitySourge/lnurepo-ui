import { useI18n } from '../i18n/useI18n.js';
import { useLayoutEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth-context.js';
import Brand from '../components/Brand.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import { errorMessage } from '../api.js';

export default function AppLayout({ children }) {
  const { t } = useI18n();
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const content = document.getElementById('content');
    content?.focus({ preventScroll: true });
    document.scrollingElement?.scrollTo?.({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  const { user, profile, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const name = profile ? profile.first_name + ' ' + profile.last_name : user.name || user.email;
  async function leave() {
    setBusy(true);
    try { await logout(); } catch (failure) { setError(failure); }
    finally { setBusy(false); }
  }
  return <div className="app-page min-h-dvh">
    <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4 focus:text-slate-900">{t('navigation.skip')}</a>
    <header className="flex h-16 items-center justify-between gap-3 bg-brand-950 px-4 text-white sm:px-8"><Brand /><Button variant="ghost" className="shrink-0 text-white hover:bg-white/10" busy={busy} onClick={leave}>{t('navigation.logout')}</Button></header>
    <div className="mx-auto grid max-w-[1500px] lg:min-h-[calc(100dvh_-_4rem)] lg:grid-cols-[260px_1fr]">
      <aside aria-label={t('navigation.aside')} className="app-panel min-w-0 border-b p-4 lg:border-r lg:border-b-0 lg:p-6">
        <div className="flex items-center gap-3 lg:block">
          <div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-brand-800 lg:mb-4 lg:size-14 dark:bg-blue-950 dark:text-blue-200">{Array.from(name).slice(0, 2).join('').toUpperCase()}</div>
          <h2 className="min-w-0 text-base font-semibold wrap-anywhere lg:text-lg">{name}</h2>
        </div>
        <p className="mt-2 hidden text-xs break-all text-slate-500 lg:block dark:text-slate-400">{user.email}</p>
        <nav aria-label={t('navigation.label')} className="mt-4 grid grid-cols-4 gap-1.5 lg:mt-7 lg:grid-cols-1">{[['/', t('navigation.catalog')], ['/profile', t('navigation.profile')], ['/favorites', t('navigation.favorites')], ['/faq', t('navigation.faq')]].map(([to, label]) => <NavLink end={to === '/'} key={to} to={to} aria-label={label} className="app-nav-link"><span className="lg:hidden">{to === '/faq' ? t('navigation.help') : label}</span><span className="hidden lg:inline">{label}</span></NavLink>)}</nav>
        {!profile && <p role="status" className="mt-3 text-sm text-amber-800 dark:text-amber-200">{t('navigation.profileGate')}</p>}
        <a className="mt-2 hidden min-h-11 lg:inline-flex items-center text-xs text-blue-700 underline underline-offset-4 lg:mt-5 dark:text-blue-300" href="mailto:support@lnurepo.info">{t('navigation.report')}</a>
      </aside>
      <main id="content" tabIndex={-1} className="min-w-0 p-4 outline-none sm:p-8 lg:p-12">{children}</main>
    </div>
    <footer className="app-panel border-t px-4 py-3 lg:hidden"><a className="inline-flex min-h-11 items-center text-sm text-blue-700 underline dark:text-blue-300" href="mailto:support@lnurepo.info">{t('navigation.report')}</a></footer>
    <Modal open={Boolean(error)} title={t('navigation.logoutFailed')} onClose={() => setError(null)}>{error && errorMessage(error)}</Modal>
  </div>;
}
