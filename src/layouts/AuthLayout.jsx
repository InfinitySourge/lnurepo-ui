import Brand from '../components/Brand.jsx';
export default function AuthLayout({ children }) {
  return <main className="min-h-screen bg-brand-950 px-5 py-7 text-white sm:px-10">
    <div className="mx-auto max-w-7xl"><Brand /></div>
    <div className="mx-auto grid min-h-[80vh] max-w-6xl items-center gap-10 py-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
      <section><p className="mb-5 text-xs font-semibold tracking-[.18em] text-blue-200 uppercase">Університетський простір</p>
        <h1 className="max-w-xl text-3xl leading-tight font-semibold sm:text-5xl">Ласкаво просимо до LNUrepo: вашого простору навчальних матеріалів</h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-blue-100/80">Знання, впорядковані для навчання. Матеріали вашого факультету в одному місці.</p>
        <div className="mt-10 h-1 w-16 bg-blue-400" />
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-7 text-slate-900 shadow-xl sm:p-10 dark:border-slate-700 dark:bg-slate-900 dark:text-white">{children}</section>
    </div>
    <footer className="mx-auto max-w-7xl border-t border-white/15 pt-5 text-xs text-blue-100/70">LNUrepo · Навчальні матеріали університетської спільноти</footer>
  </main>;
}
