import { useI18n } from '../i18n/useI18n.js';
import { useAuth } from '../auth-context.js';
export default function SupportCard({ titleKey = 'support.title', descriptionKey = 'support.description', bodyKey = 'support.body', values = {} }) {
  const { t } = useI18n();
  const { user, profile } = useAuth();
  const name = profile ? `${profile.first_name} ${profile.last_name}` : user?.name || '';
  const body = t(bodyKey, { ...values, name, email: user?.email || '' });
  const href = `mailto:support@lnurepo.info?${new URLSearchParams({subject:t('support.subject'),body}).toString().replaceAll('+','%20')}`;
  return <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/40"><h2 className="text-xl font-semibold">{t(titleKey)}</h2><p className="mt-3 text-sm leading-6">{t(descriptionKey)}</p><a className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white" href={href}>{t('support.write')}</a><p className="mt-3 text-xs text-slate-500 dark:text-slate-400">support@lnurepo.info · {t('support.warning')}</p></section>;
}
