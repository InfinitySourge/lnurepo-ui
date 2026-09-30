import { useState } from 'react';
import { Link } from 'react-router-dom';
import './pages.css';
import { useAuth } from '../auth-context.js';

const faculties = [
  'Факультет прикладної математики та інформатики',
  'Факультет електроніки та комп’ютерних технологій',
  'Факультет журналістики',
  'Факультет іноземних мов',
  'Факультет культури і мистецтв',
  'Факультет міжнародних відносин',
  'Факультет педагогічної освіти',
  'Факультет управління фінансами та бізнесу',
  'Фізичний факультет',
  'Філологічний факультет',
  'Філософський факультет',
  'Хімічний факультет',
  'Юридичний факультет',
];

function HomePage() {
  const { user, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [isFacultyListOpen, setIsFacultyListOpen] = useState(false);

  const normalizedQuery = query.toLocaleLowerCase('uk');
  const filteredFaculties = faculties.filter((faculty) =>
    faculty.toLocaleLowerCase('uk').includes(normalizedQuery),
  );

  const handleFacultySelect = (faculty) => {
    setSelectedFaculty(faculty);
    setQuery(faculty);
    setIsFacultyListOpen(false);
  };

  return (
    <div className="home-page">
      <header className="home-topbar">
        <Link className="home-brand" to="/">
          LNUrepo
        </Link>
        <button className="home-account-link" type="button" onClick={() => {
          setLogoutError('');
          logout().catch(() => setLogoutError('Не вдалося вийти. Спробуйте ще раз.'));
        }}>Вийти</button>
        {logoutError && <p role="alert">{logoutError}</p>}
      </header>

      <aside
        className="home-sidebar"
        aria-label="Профіль і збережені матеріали"
      >
        <div className="profile-summary">
          <div className="profile-avatar" aria-hidden="true">
            {user.name?.slice(0, 2) || 'ЛНУ'}
          </div>
          <h2>
            {user.name || user.email}
          </h2>
        </div>
        <dl className="profile-details">
          <div>
            <dt>Факультет:</dt>
            <dd>Факультет прикладної математики та інформатики</dd>
          </div>
          <div>
            <dt>Спеціальність:</dt>
            <dd>Системний аналіз</dd>
          </div>
          <div>
            <dt>Група:</dt>
            <dd>ПМА-32</dd>
          </div>
        </dl>

        <h3 className="saved-title">Збережені матеріали</h3>
        <a
          className="report-link"
          href="mailto:support@lnurepo.info?subject=%D0%9F%D0%BE%D0%B2%D1%96%D0%B4%D0%BE%D0%BC%D0%B8%D1%82%D0%B8%20%D0%BF%D1%80%D0%BE%20%D0%BF%D1%80%D0%BE%D0%B1%D0%BB%D0%B5%D0%BC%D1%83"
        >
          Повідомити про проблему
        </a>
      </aside>

      <main className="home-content">
        <h1>База навчальних матеріалів ЛНУ</h1>
        <section className="faculty-picker" aria-label="Вибір факультету">
          <label htmlFor="faculty-search">Оберіть потрібний факультет</label>
          <div className="faculty-search-field">
            <input
              aria-controls="faculty-options"
              aria-expanded={isFacultyListOpen}
              autoComplete="off"
              id="faculty-search"
              onBlur={() =>
                window.setTimeout(() => setIsFacultyListOpen(false), 120)
              }
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                setSelectedFaculty('');
                setIsFacultyListOpen(Boolean(nextQuery.trim()));
              }}
              onFocus={() => setIsFacultyListOpen(Boolean(query.trim()))}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setIsFacultyListOpen(false);
                if (event.key === 'Enter' && filteredFaculties[0]) {
                  event.preventDefault();
                  handleFacultySelect(filteredFaculties[0]);
                }
              }}
              placeholder="Почніть вводити назву факультету"
              role="combobox"
              value={query}
            />
            <svg
              aria-hidden="true"
              className="faculty-search-icon"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="10.8" cy="10.8" r="6.5" />
              <path d="m16 16 4.2 4.2" />
            </svg>
          </div>
          {isFacultyListOpen && (
            <ul className="faculty-options" id="faculty-options" role="listbox">
              {filteredFaculties.length > 0 ? (
                filteredFaculties.map((faculty) => (
                  <li
                    key={faculty}
                    role="option"
                    aria-selected={selectedFaculty === faculty}
                  >
                    <button
                      onMouseDown={() => handleFacultySelect(faculty)}
                      type="button"
                    >
                      {faculty}
                    </button>
                  </li>
                ))
              ) : (
                <li className="faculty-empty">Факультетів не знайдено</li>
              )}
            </ul>
          )}
          {selectedFaculty && (
            <p className="faculty-selection" role="status">
              Обрано: {selectedFaculty}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default HomePage;
