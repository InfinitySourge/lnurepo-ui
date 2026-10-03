# LNUrepo UI

React + Vite + Tailwind CSS v4. Node.js 24 is used in CI.

## Structure

- `components/`: Button, Field, SearchSelect, Modal, Notice, Loading/Skeleton,
  DataState (loading/empty), catalog results/errors, support, Brand, ErrorBoundary.
- `layouts/`: shared university-style authentication and application shells.
- `pages/`: Microsoft login, API-backed catalogue/favorites/FAQ, profile onboarding/edit,
  public legal page and 404/403/500/503 errors.
- `api.js`: trusted API origin, cookie requests, 12-second timeout, safe errors.
- `auth.jsx`: real session/profile state and retry; no real credentials or profile in storage.
- `profile.js`: client validation; the API independently validates mutations.
- `theme.js`: dark by default; light/dark/system controls are in the profile.
- `public/theme-init.js`: selects the saved theme before React's first paint.

Your supplied icon is `public/favicon.svg`; wordmark is `public/wordmark.svg`.
The original handwritten page CSS and unused starter icon sprite are removed.
Catalogue/favorites/FAQ read optional database sources through the API. Missing
sources, empty rows and errors have separate states. See the API's CATALOG-CONTRACT.md.

## Local design preview (no Entra or database)

```powershell
cd D:\Projects\LNUrepo\lnurepo-ui
npm run dev:preview
```

Open the loopback address printed by Vite. Fill and save the demo profile to open
catalogue/favorites. Only this explicit development mode uses fixtures; its demo
profile survives reloads in sessionStorage for the current browser tab. No real
tokens or credentials are stored. This adapter is excluded from production builds.
`npm run dev` uses the real API instead. Do not expose the development server publicly.

## Production order — important

1. Apply API migration `migrations/002_profiles.sql` with a schema-owner account.
   Grant the API runtime role SELECT, INSERT, UPDATE on `user_profiles`.
2. Deploy the API; verify authenticated GET/POST `/api/profile`.
3. Deploy this UI. CI publishes hashed assets first, index.html last.
4. Configure the host/CDN for SPA routes: valid paths `/login`, `/profile`,
   `/profile/setup`, `/favorites`, `/faq`, `/legal` should serve index.html while preserving the browser URL.
   Unknown paths should serve index.html as the error document so React renders 404.
   Do not rewrite `/assets/*` or missing scripts to HTML.
5. In Cloudflare response-header rules, set X-Content-Type-Options=nosniff,
   X-Frame-Options=DENY, Referrer-Policy=no-referrer, Permissions-Policy disabling
   unused camera/microphone/geolocation; ensure HTTPS/HSTS for your domain.
   Send CSP as an HTTP header, including `frame-ancestors 'none'`.
   index.html already contains a restrictive CSP fallback, but HTML meta cannot
   enforce frame-ancestors. Use the same source directives as the built index.html.
6. Avoid stale CDN HTML: respect index.html Cache-Control=no-store and purge
   previously cached HTML if necessary. SVG branding and theme-init.js use no-cache.

An authenticated user with a saved profile reaches home, including from /login.
Without a profile, first login redirects to profile setup. If the API cannot serve
profiles, protected content stays blocked with a retry option.
Real API saving is never simulated: failed requests keep the form and show an error.
The self-declared teacher/student field is NOT a permission or proof of employment.

`VITE_API_ORIGIN` defaults to https://api.lnurepo.info. VITE_* values are public,
never secrets. Production requires an HTTPS origin; CSP follows the build-time origin.
Keep UI/API same-site for the secure SameSite=Lax cookies. API remains responsible
for authentication, CSRF, object ownership, validation and permission enforcement.

## Checks

```powershell
npm ci
npm run lint
npm run test -- --maxWorkers=1 --no-file-parallelism
npm run build
npm audit --audit-level=high
```

The obsolete visual-check script was removed. Current automated checks cover
authentication, validation, API client behavior, routing and demo-profile reloads.
Responsive layouts and first-paint behavior still need browser verification.

Optional development: set VITE_API_ORIGIN=http://localhost:8000 in .env.local.
The production CSP is deliberately disabled only for Vite's development server,
which injects development scripts/styles. Do not expose that server publicly.
