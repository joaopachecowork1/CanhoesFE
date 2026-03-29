# CanhoesFE

Frontend for **Canhoes do Ano**, a private event-driven social app built with
Next.js App Router.

## Runtime flow

- UI -> repositories -> `canhoesFetch` -> `/api/proxy/*` -> backend API
- Google auth is handled by NextAuth
- The Google OpenID `id_token` is forwarded to the backend by the proxy route
- The backend `/api/me` endpoint is the source of truth for `isAdmin`

## Main areas

```text
app/
  canhoes/(app)/          protected app pages
  canhoes/(public)/       login and public entry points
  api/                    auth, proxy, uploads, me
components/
  chrome/canhoes/         event shell and navigation
  modules/canhoes/        event modules
  modules/hub/            social feed modules
  ui/                     shared UI primitives
contexts/
  AuthContext.tsx         app auth state hydrated from /api/me
hooks/
  useEventOverview.ts     active event + overview bootstrap
lib/
  api/                    fetch client and contracts
  repositories/           legacy and v1 repositories
  media.ts                media URL normalization
  canhoesEvent.ts         event selectors and shell events
```

## Auth

- NextAuth stores the Google `id_token` in the JWT/session
- `/api/proxy/*` forwards `Authorization: Bearer <id_token>` to the backend
- `/api/me` returns the backend-mapped user profile
- Frontend role checks must rely on the backend profile, not hardcoded emails

## Mock mode

Mock mode is dev-only and is guarded behind `NODE_ENV !== "production"`.

## Commands

```bash
npm run dev
npm run lint
npm run build
```
