import { useI18n } from '../i18n/useI18n.js';
import { Link } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
export default function LegalPage() {
  const { t } = useI18n();
  const sectionSizes = [2, 2, 3, 3, 3, 4, 1];
  return <main className="app-page mx-auto min-h-screen max-w-4xl px-5 py-8"><Brand />
    <h1 className="mt-10 text-3xl font-bold">{t('legal.title')}</h1>
    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('legal.edition')}</p>
    <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{t('legal.draft')}</p>
    <div className="mt-8 space-y-5">{sectionSizes.map((size, index) => <section key={index} className="app-panel rounded-xl border p-6"><h2 className="text-lg font-semibold">{t(`legal.section${index + 1}.title`)}</h2>{Array.from({ length: size }, (_, paragraph) => <p key={paragraph} className="mt-3 text-sm leading-7">{t(`legal.section${index + 1}.p${paragraph + 1}`)}</p>)}</section>)}</div>
    <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/40"><h2 className="text-xl font-semibold">{t('legal.contact')}</h2><p className="mt-3 text-sm leading-7">{t('legal.contactDescription')}</p><a href="mailto:support@lnurepo.info" className="mt-3 inline-block text-lg font-semibold text-blue-700 underline dark:text-blue-300">support@lnurepo.info</a><p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">{t('legal.contactHint')}</p></section>
    <div className="mt-8 flex flex-wrap gap-5 text-sm underline"><Link to="/login">{t('legal.login')}</Link><Link to="/">{t('legal.catalog')}</Link></div>
  </main>;
}
