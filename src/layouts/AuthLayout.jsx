import Brand from '../components/Brand.jsx';
export default function AuthLayout({ children }) {
  return <main className="app-page min-h-screen px-5 py-7 sm:px-10">
    <div className="mx-auto max-w-7xl"><Brand /></div>
    <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center gap-9 py-12">
      <svg aria-hidden="true" className="app-muted pointer-events-none absolute top-16 left-0 hidden size-28 -rotate-12 opacity-30 lg:block" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 28 50 12l38 16-38 16zM25 35v23q25 18 50 0V35M87 29v36M18 77h65M23 85h54" /></svg>
      <svg aria-hidden="true" className="app-muted pointer-events-none absolute right-0 bottom-20 hidden size-28 rotate-12 opacity-30 lg:block" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20q20-10 38 0 18-10 38 0v57q-20-10-38 0-18-10-38 0zM50 20v57M22 34h17M22 44h17M61 34h17M61 44h17" /></svg>
      <section className="text-center"><p className="app-muted mb-5 text-xs font-semibold tracking-[.18em] uppercase">Університетський простір</p>
        <h1 className="max-w-3xl text-3xl leading-tight font-semibold sm:text-5xl">Ваші знання.<br />Ваш простір. LNUrepo.</h1>
        <p className="app-muted mx-auto mt-5 max-w-lg text-base leading-7">Матеріали, дисципліни та викладачі вашого факультету в одному місці.</p>
      </section>
      <section className="app-panel w-full max-w-md rounded-2xl border p-7 shadow-xl sm:p-10">{children}</section>
    </div>
    <footer className="app-muted mx-auto max-w-7xl border-t border-slate-200 pt-5 text-xs dark:border-slate-800">LNUrepo · Навчальні матеріали університетської спільноти</footer>
  </main>;
}
