import EmptyState from './EmptyState.jsx';
import { Skeleton } from './Loading.jsx';
export default function DataState({ status, title, children }) {
  if (status === 'loading') return <div role="status" aria-label="Завантажуємо дані" className="space-y-4">
    <Skeleton className="h-5 w-2/3" /><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" />
    <span className="sr-only">Завантажуємо дані…</span>
  </div>;
  if (status === 'empty') return <EmptyState title={title}>{children}</EmptyState>;
  return children;
}
