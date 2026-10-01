import Brand from './Brand.jsx';
export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 motion-reduce:animate-none ${className}`} />;
}
export default function Loading({ label = 'Завантажуємо дані…', children, fullPage = false }) {
  const content = <div role="status" className="flex flex-col items-center gap-5 p-8">
    <span aria-hidden="true" className="size-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600 motion-reduce:animate-none" />
    <p className="text-sm text-slate-500 dark:text-slate-400">{children || label}</p>
  </div>;
  return fullPage ? <main className="grid min-h-screen place-content-center gap-8 text-center"><Brand className="mx-auto" />{content}</main> : content;
}
