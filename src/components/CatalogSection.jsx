import EmptyState from './EmptyState.jsx';
export default function CatalogSection({ title, bucket, searching = false }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
    <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">{bucket.items.length}{bucket.has_more ? '+' : ''}</span></div>
    {!bucket.available ? <EmptyState title="Розділ ще не підключено">База доступна, але джерело цього розділу ще не налаштоване.</EmptyState>
      : !bucket.items.length ? <EmptyState title={searching ? 'Нічого не знайдено' : 'Тут поки порожньо'}>{searching ? 'Спробуйте інший запит або факультет.' : 'Коли з’являться матеріали, вони будуть тут.'}</EmptyState>
      : <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{bucket.items.map((i) => <li key={i.id} className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800"><h3 className="font-medium break-words">{i.title}</h3>{i.description && <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{i.description}</p>}<p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{i.faculty}</p></li>)}</ul>}
    {bucket.has_more && <p className="mt-4 text-sm">Показано перші 30 результатів. Уточніть пошук.</p>}
  </section>;
}
