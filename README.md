# LNUrepo UI

React, Vite, Tailwind CSS. Node.js 24.

```powershell
npm ci
```

```powershell
npm run dev
```

API за замовчуванням: `https://api.lnurepo.info`. Для локального API вкажіть
`VITE_API_ORIGIN=http://127.0.0.1:8000` у файлі `.env.local`.
Локальний вхід налаштовується в бекенді; фронт використовує звичайні API-запити.

```powershell
npm run lint
```

```powershell
npm test -- --maxWorkers=1 --no-file-parallelism
```

```powershell
npm run build
```

Потрібен API зі схемою БД `20261106_02`. Профіль використовує `/api/profiles`,
факультети — `/api/faculties`, дані каталогу — `/api/catalog`, `/api/favorites`, `/api/faq`.
Редагується тільки група; ім'я, прізвище, статус і факультет надходять із API.
Мова й тема зберігаються на пристрої. Дані БД не перекладаються.

Push і PR запускають перевірки. Деплой — тільки вручну:
**Actions → Verify UI and deploy manually → Run workflow → main**.
Хостинг має підтримувати SPA-маршрути; `index.html` — без кешування,
файли з хешем у `assets` — з довгим кешуванням.
