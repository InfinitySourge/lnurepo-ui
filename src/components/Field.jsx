import { useId } from 'react';
export default function Field({ label, error, hint, children, ...props }) {
  const id = useId();
  const classes = `min-h-11 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-950 dark:text-white ${error ? 'border-red-600' : 'border-slate-300 dark:border-slate-700'}`;
  const shared = { id, 'aria-invalid': Boolean(error), 'aria-describedby': error || hint ? `${id}-help` : undefined, className: classes, ...props };
  return <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
    {children ? <select {...shared}>{children}</select> : <input {...shared} />}
    {(error || hint) && <p id={`${id}-help`} className={`text-xs leading-5 ${error ? 'text-red-700 dark:text-red-300' : 'text-slate-500 dark:text-slate-400'}`}>{error || hint}</p>}
  </div>;
}
