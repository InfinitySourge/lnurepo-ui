import { useI18n } from '../i18n/useI18n.js';
import EmptyState from './EmptyState.jsx';
import { Skeleton } from './Loading.jsx';
export default function DataState({ status, title, children }) {
  const { t } = useI18n();
  if (status === 'loading') return <div role="status" aria-label={t('common.loadingLabel')} className="space-y-4">
    <Skeleton className="h-5 w-2/3" /><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" />
    <span className="sr-only">{t('common.loading')}</span>
  </div>;
  if (status === 'empty') return <EmptyState title={title}>{children}</EmptyState>;
  return children;
}
