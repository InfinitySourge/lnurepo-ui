import { useI18n } from '../i18n/useI18n.js';
import FavoriteButton from './FavoriteButton.jsx';
import EmptyState from './EmptyState.jsx';
import { facultyLabel } from '../i18n/faculties.js';
export default function CatalogSection({ title, bucket, searching = false, materials = false, favorites = false, onRemoved }) {
  const { t, language } = useI18n();
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
    <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">{bucket.items.length}{bucket.has_more ? '+' : ''}</span></div>
    {!bucket.available ? <EmptyState title={t('catalog.unavailable')}>{t('catalog.unavailableDescription')}</EmptyState>
      : !bucket.items.length ? <EmptyState title={searching ? t('catalog.notFound') : t('catalog.empty')}>{searching ? t('catalog.notFoundDescription') : t('catalog.emptyDescription')}</EmptyState>
      : <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{bucket.items.map((i) => <li key={i.id} className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800"><h3 className="font-medium break-words">{i.title}</h3>{i.description && <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{i.description}</p>}<p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{facultyLabel(i.faculty, language)}</p>{materials && /^[1-9][0-9]{0,15}$/.test(i.id) && Number.isSafeInteger(Number(i.id)) && <FavoriteButton key={String(i.is_saved)} materialId={i.id} initiallySaved={favorites || i.is_saved === true} onRemoved={onRemoved} />}</li>)}</ul>}
    {bucket.has_more && <p className="mt-4 text-sm">{t('catalog.more', { count: 30 })}</p>}
  </section>;
}
