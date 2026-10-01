import { useId, useState } from 'react';
export default function SearchSelect({ label, options, value, onChange, placeholder = 'Почніть вводити…' }) {
  const id = useId();
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const filtered = options.filter((item) => item.toLocaleLowerCase('uk').includes(query.toLocaleLowerCase('uk')));
  function choose(option) { setQuery(option); onChange(option); setOpen(false); }
  return <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <label className="mb-3 block text-sm font-semibold" htmlFor={id}>{label}</label>
    <div className="relative">
      <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-options`} aria-activedescendant={open && filtered[active] ? `${id}-${active}` : undefined}
        maxLength={120} autoComplete="off" value={query} placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(event) => { setQuery(event.target.value); onChange(''); setActive(0); setOpen(true); }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
          if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setActive((item) => Math.max(0, Math.min(item + 1, filtered.length - 1))); }
          if (event.key === 'ArrowUp') { event.preventDefault(); setActive((item) => Math.max(0, item - 1)); }
          if (event.key === 'Enter' && open && filtered[active]) { event.preventDefault(); choose(filtered[active]); }
        }}
        className="h-12 w-full rounded-lg border border-slate-300 bg-white py-3 pr-12 pl-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900" />
      <svg aria-hidden="true" className="pointer-events-none absolute top-3.5 right-4 size-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>
    </div>
    {open && <ul id={`${id}-options`} role="listbox" aria-label={label} className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
      {filtered.length ? filtered.map((option, index) => <li id={`${id}-${index}`} key={option} role="option" aria-selected={value === option} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)}
        className={`cursor-pointer rounded-md px-3 py-3 text-sm ${active === index ? 'bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{option}</li>) : <li className="px-3 py-4 text-sm text-slate-500">Нічого не знайдено. Спробуйте інший запит.</li>}
    </ul>}
  </div>;
}
