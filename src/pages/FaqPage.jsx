import { useI18n } from '../i18n/useI18n.js';
import { useEffect, useState } from 'react';
import { ApiError, request } from '../api.js';
import DataState from '../components/DataState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import CatalogFailure from '../components/CatalogFailure.jsx';
import SupportCard from '../components/SupportCard.jsx';
export default function FaqPage() {
  const { t } = useI18n();
  const [revision, revise] = useState(0);
  const [result, update] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    request('/api/faq', {signal:controller.signal}).then((data) => {
      if (!data || typeof data.available !== 'boolean' || !Array.isArray(data.items) || data.items.length > 100 || (!data.available && data.items.length) || !data.items.every((i) => i && [['id',128],['question',300],['answer',5000]].every(([k,n]) => typeof i[k] === 'string' && i[k].length > 0 && i[k].length <= n))) throw new ApiError();
      if (!controller.signal.aborted) update({revision,data});
    }).catch((error) => {if (!controller.signal.aborted) update({revision,error});});
    return () => controller.abort();
  }, [revision]);
  const current = result?.revision === revision ? result : null;
  return <div className="mx-auto max-w-3xl"><h1 className="text-3xl font-bold">{t('navigation.faq')}</h1><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('faq.description')}</p><div className="mt-8" aria-live="polite" aria-busy={!current}>
    {!current ? <DataState status="loading" /> : current.error ? <CatalogFailure error={current.error} retry={() => revise((v) => v+1)} /> : !current.data.available ? <EmptyState title={t('faq.unavailable')}>{t('faq.unavailableDescription')}</EmptyState> : !current.data.items.length ? <EmptyState title={t('faq.empty')}>{t('faq.emptyDescription')}</EmptyState> : <div className="space-y-3">{current.data.items.map((i) => <details key={i.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><summary className="cursor-pointer font-semibold">{i.question}</summary><p className="mt-4 text-sm leading-7 whitespace-pre-wrap break-words">{i.answer}</p></details>)}</div>}
  </div><SupportCard /></div>;
}
