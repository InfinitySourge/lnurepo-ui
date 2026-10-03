export default function EmptyState({ title, children }) {
  return <div className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center dark:border-slate-700">
    <svg aria-hidden="true" className="mx-auto mb-4 size-9 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4h14v16H5zM8 8h8M8 12h6M8 16h4" /></svg>
    <h3 className="font-semibold">{title}</h3><div className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">{children}</div>
  </div>;
}
