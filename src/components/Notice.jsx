export default function Notice({ title, children, variant = 'info' }) {
  return <div role={variant === 'error' ? 'alert' : 'status'} className={`rounded-lg border p-4 text-sm leading-6 ${variant === 'error' ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200' : 'border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200'}`}>
    {title && <p className="font-semibold">{title}</p>}{children}
  </div>;
}
