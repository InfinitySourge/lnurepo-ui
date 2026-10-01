import Button from './Button.jsx';
import EmptyState from './EmptyState.jsx';
import Notice from './Notice.jsx';
import { Skeleton } from './Loading.jsx';
// Reusable template for future server-backed lists: no fabricated data or timers.
export default function DataState({ status, title, children, retry }) {
  if (status === 'loading') return <div role="status" aria-label="Завантажуємо матеріали" className="space-y-4">
    <Skeleton className="h-5 w-2/3" /><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" />
    <span className="sr-only">Завантажуємо матеріали…</span>
  </div>;
  if (status === 'error') return <div className="space-y-4"><Notice error title="Не вдалося завантажити дані">Спробуйте ще раз за мить.</Notice>{retry && <Button variant="secondary" onClick={retry}>Повторити</Button>}</div>;
  if (status === 'empty') return <EmptyState title={title}>{children}</EmptyState>;
  return children;
}
