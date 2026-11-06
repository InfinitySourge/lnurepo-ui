import { useI18n } from '../i18n/useI18n.js';
import DataState from '../components/DataState.jsx';
import CatalogSection from '../components/CatalogSection.jsx';
import CatalogFailure from '../components/CatalogFailure.jsx';
import { useCatalogData } from '../catalog.js';
export default function FavoritesPage() {
  const { t } = useI18n();
  const result = useCatalogData('', '', true);
  return <><h1 className="text-3xl font-bold">{t('navigation.favorites')}</h1><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('favorites.description')}</p><div className="mt-8" aria-live="polite" aria-busy={result.loading}>{result.error ? <CatalogFailure error={result.error} retry={result.retry} /> : result.loading ? <DataState status="loading" /> : <CatalogSection title={t('favorites.materials')} bucket={result.data} materials favorites onRemoved={result.retry} />}</div></>;
}
