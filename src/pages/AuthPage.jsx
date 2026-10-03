import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { API_ORIGIN, DESIGN_PREVIEW } from '../api.js';
import { useAuth } from '../auth-context.js';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Button from '../components/Button.jsx';
import Notice from '../components/Notice.jsx';
import Loading from '../components/Loading.jsx';
export default function AuthPage() {
  const { user, loading, unavailable, retry } = useAuth();
  const [params] = useSearchParams();
  if (loading) return <Loading fullPage>Перевіряємо сесію…</Loading>;
  if (user) return <Navigate to="/" replace />;
  return <AuthLayout>
    <h2 className="text-2xl font-bold">Вхід у систему</h2>
    <p className="mt-3 mb-7 text-sm leading-6 text-slate-600 dark:text-slate-300">Для входу та першої реєстрації використайте університетський обліковий запис Microsoft.</p>
    <Button href={DESIGN_PREVIEW ? '/' : API_ORIGIN + '/auth/login'} className="w-full">{DESIGN_PREVIEW ? 'Відкрити локальний деморежим' : 'Увійти через Microsoft'}</Button>
    <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Пароль вводиться лише на сторінці Microsoft. LNUrepo не отримує і не зберігає ваш пароль.</p>
    <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-6 text-slate-500 dark:border-slate-600 dark:text-slate-300">Перед входом ознайомтеся з <Link to="/legal" className="text-blue-700 underline dark:text-blue-300">правилами та приватністю</Link>. Матеріали не є офіційними рекомендаціями університету.</p>
    {params.get('error') === 'auth_failed' && <div className="mt-5"><Notice variant="error" title="Не вдалося увійти">Використайте обліковий запис ЛНУ або зверніться до підтримки.</Notice></div>}
    {unavailable && <div className="mt-5 space-y-3"><Notice variant="error" title="Сервер тимчасово недоступний">Спробуйте ще раз за мить.</Notice><Button variant="secondary" onClick={retry}>Спробувати знову</Button></div>}
  </AuthLayout>;
}
