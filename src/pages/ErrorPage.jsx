import { useI18n } from '../i18n/useI18n.js';
import Brand from '../components/Brand.jsx';
import Button from '../components/Button.jsx';
export default function ErrorPage({ code = 404, retry }) {
  const { t } = useI18n();
  const errorCode = [404, 403, 503, 500].includes(code) ? code : 500;
  const title = t(`error.${errorCode}Title`);
  const description = t(`error.${errorCode}Description`);
  return <main className="flex min-h-screen flex-col p-7 sm:p-10">
    <Brand /><section className="m-auto w-full max-w-lg py-16">
      <p className="text-6xl font-bold tracking-tight text-blue-800 dark:text-blue-300">{code}</p>
      <h1 className="mt-5 text-2xl font-bold">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-8 flex flex-wrap gap-3"><Button to="/">{t('common.home')}</Button>{retry && <Button variant="secondary" onClick={retry}>{t('common.retry')}</Button>}</div>
    </section>
  </main>;
}
