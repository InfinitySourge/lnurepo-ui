import { useState } from 'react';
import { Link } from 'react-router-dom';
import './pages.css';

function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [notice, setNotice] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setNotice('Це демонстраційна форма. Авторизацію буде підключено пізніше.');
  }

  function toggleMode() {
    setIsRegistering((value) => !value);
    setNotice('');
  }

  return (
    <main className="auth-page">
      <Link aria-label="LNUrepo: на головну" className="auth-brand" to="/">
        LNUrepo
      </Link>
      <section className="auth-scene">
        <h1>
          Ласкаво просимо до
          <br />
          LNUrepo: вашого простору
          <br />
          навчальних матеріалів
        </h1>
        <section className="auth-panel" aria-labelledby="auth-heading">
          <h2 id="auth-heading">
            {isRegistering ? 'Створити акаунт' : 'Вхід у систему'}
          </h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="auth-email">
              Електронна пошта
            </label>
            <input
              autoComplete="email"
              id="auth-email"
              name="email"
              placeholder="Електронна пошта"
              required
              type="email"
            />
            <label className="visually-hidden" htmlFor="auth-password">
              Пароль
            </label>
            <input
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              id="auth-password"
              name="password"
              placeholder="Пароль"
              required
              type="password"
            />
            {isRegistering && (
              <>
                <label
                  className="visually-hidden"
                  htmlFor="auth-password-confirm"
                >
                  Підтвердіть пароль
                </label>
                <input
                  autoComplete="new-password"
                  id="auth-password-confirm"
                  name="passwordConfirm"
                  placeholder="Підтвердіть пароль"
                  required
                  type="password"
                />
              </>
            )}
            <button className="auth-submit" type="submit">
              {isRegistering ? 'Зареєструватися' : 'Увійти'}
            </button>
          </form>
          <button
            className="auth-mode-toggle"
            onClick={toggleMode}
            type="button"
          >
            {isRegistering ? 'Уже маєте акаунт? Увійти' : 'Створити акаунт'}
          </button>
          {notice && (
            <p className="auth-notice" role="status">
              {notice}
            </p>
          )}
        </section>
      </section>
    </main>
  );
}

export default AuthPage;
