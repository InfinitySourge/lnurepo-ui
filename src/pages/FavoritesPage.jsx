import DataState from '../components/DataState.jsx';
import CatalogSection from '../components/CatalogSection.jsx';
import CatalogFailure from '../components/CatalogFailure.jsx';
import { useCatalogData } from '../catalog.js';
export default function FavoritesPage() {
  const result = useCatalogData('', '', true);
  return <><h1 className="text-3xl font-bold">Збережене</h1><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Ваша особиста добірка навчальних матеріалів.</p><div className="mt-8" aria-live="polite" aria-busy={result.loading}>{result.error ? <CatalogFailure error={result.error} retry={result.retry} /> : result.loading ? <DataState status="loading" /> : <CatalogSection title="Улюблені матеріали" bucket={result.data} />}</div></>;
}
