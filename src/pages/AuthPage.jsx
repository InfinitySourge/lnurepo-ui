import { useI18n } from '../i18n/useI18n.js';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { API_ORIGIN } from '../api.js';
import { useAuth } from '../auth-context.js';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Button from '../components/Button.jsx';
import Notice from '../components/Notice.jsx';
import Loading from '../components/Loading.jsx';
export default function AuthPage() {
  const { t } = useI18n();
  const { user, loading, unavailable, retry } = useAuth();
  const [params] = useSearchParams();
  if (loading) return <Loading fullPage>{t('auth.checking')}</Loading>;
  if (user) return <Navigate to="/" replace />;
  return <AuthLayout>
    <h2 className="text-2xl font-bold">{t('auth.title')}</h2>
    <p className="mt-3 mb-7 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('auth.description')}</p>
    <Button href={API_ORIGIN + '/auth/login'} className="w-full">{t('auth.microsoft')}</Button>
    <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">{t('auth.password')}</p>
    <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-6 text-slate-500 dark:border-slate-600 dark:text-slate-300">{t('auth.legalBefore')} <Link to="/legal" className="text-blue-700 underline dark:text-blue-300">{t('auth.legalLink')}</Link>. {t('auth.legalAfter')}</p>
    {params.get('error') === 'auth_failed' && <div className="mt-5"><Notice variant="error" title={t('auth.failed')}>{t('auth.failedDescription')}</Notice></div>}
    {unavailable && <div className="mt-5 space-y-3"><Notice variant="error" title={t('error.503Title')}>{t('auth.unavailableDescription')}</Notice><Button variant="secondary" onClick={retry}>{t('common.retry')}</Button></div>}
  </AuthLayout>;
}
