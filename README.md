# LNUrepo UI

React/Vite university materials UI. Login uses the API's Microsoft OAuth flow.
Session credentials are HttpOnly cookies, not localStorage or URL tokens.

For development, set VITE_API_ORIGIN=http://localhost:8000 in .env.local and use
localhost:5173 for the UI. Production requires HTTPS and the UI/API on the same
site (lnurepo.info and api.lnurepo.info). VITE_* values are public build inputs;
never put secrets in them.

```powershell
npm ci
npm run dev
npm run test -- --maxWorkers=1 --no-file-parallelism
npm run lint
npm run build
npm audit
```

The API origin defaults to https://api.lnurepo.info. All session requests include
credentials. Protected UI routes depend on /auth/me; authorization is also enforced
on the API. See ../SECURITY-REPORT.md for configuration, deployment and remaining
infrastructure requirements.
