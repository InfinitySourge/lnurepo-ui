import { useEffect, useRef, useId } from 'react';
import Button from './Button.jsx';
export default function Modal({ open, title, children, onClose, onClosed }) {
  const ref = useRef(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} aria-labelledby={id} onClose={onClosed} onCancel={(event) => { event.preventDefault(); onClose(); }}
    className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
    <h2 id={id} className="text-lg font-bold">{title}</h2>
    <div className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{children}</div>
    <div className="mt-6 flex justify-end"><Button onClick={onClose}>Зрозуміло</Button></div>
  </dialog>;
}
