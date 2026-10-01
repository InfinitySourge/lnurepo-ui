import { Link } from 'react-router-dom';

const variants = {
  primary: 'bg-brand-950 text-white hover:bg-brand-800 dark:bg-blue-600 dark:hover:bg-blue-500',
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  danger: 'bg-red-700 text-white hover:bg-red-800',
};
export default function Button({ children, variant = 'primary', busy = false, disabled, className = '', to, href, ...props }) {
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${variants[variant] || variants.primary} ${className}`;
  if (to) return <Link to={to} className={classes} {...props}>{children}</Link>;
  if (href) return <a href={href} className={classes} {...props}>{children}</a>;
  return <button type="button" className={classes} disabled={disabled || busy} aria-busy={busy || undefined} {...props}>
    {busy && <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" aria-hidden="true" />}
    {children}
  </button>;
}
