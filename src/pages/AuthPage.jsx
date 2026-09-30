import { Navigate } from 'react-router-dom';
import { API_ORIGIN } from '../api.js';
import { useAuth } from '../auth-context.js';
import './pages.css';

function AuthPage() {
  const { user, loading, unavailable } = useAuth();
  if (user) return <Navigate to="/" replace />;
  const failed = new URLSearchParams(window.location.search).has('error');
  return (
    <main className="auth-page">
      <span className="auth-brand">LNUrepo</span>
      <section className="auth-scene">
        <h1>Ласкаво просимо до<br />LNUrepo: вашого простору<br />навчальних матеріалів</h1>
        <section className="auth-panel" aria-labelledby="auth-heading">
          <h2 id="auth-heading">Вхід у систему</h2>
          <p>Увійдіть через університетський обліковий запис Microsoft.</p>
          <a className="auth-submit" href={`${API_ORIGIN}/auth/login`}>Увійти через Microsoft</a>
          {loading && <p role="status">Перевіряємо сесію…</p>}
          {unavailable && <p role="alert">Сервер недоступний. Спробуйте пізніше.</p>}
          {failed && <p role="alert">Не вдалося увійти. Використайте обліковий запис ЛНУ або зверніться до підтримки.</p>}
        </section>
      </section>
    </main>
  );
}

export default AuthPage;
