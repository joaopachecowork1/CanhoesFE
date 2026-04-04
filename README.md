This is a [Next.js](https://nextjs.org) project — **Canhões do Ano**, a micro social network + voting platform.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🧪 Mock Mode (Offline Development)

You can run the entire app without a backend or Google OAuth using **Mock Mode**.

### Activate

Create a `.env.local` file in the `canhoesfe/` directory:

```bash
# .env.local
NEXT_PUBLIC_MOCK_AUTH=true
```

Or pass it inline:

```bash
NEXT_PUBLIC_MOCK_AUTH=true npm run dev
```

### What Mock Mode does

| Feature | Behaviour |
|---------|-----------|
| Authentication | Injects a `Dev Admin` user with `isAdmin: true` — no Google login required |
| Login page | Never shown — the app goes straight to the feed |
| Admin panel | Fully accessible and pre-populated with demo data |
| API calls | Intercepted and returned as static fixtures (no backend needed) |
| Dev banner | A 🧪 DEV MODE badge appears in the bottom-left corner |

> ⚠️ Mock mode is **hard-guarded** behind `process.env.NODE_ENV !== 'production'`. It can never run in a production deployment even if the env variable is accidentally set.

## Dev Auth Bypass (Google fallback in local dev)

If Google OAuth/Firebase billing is temporarily unavailable, you can enable a **development-only auth bypass**.

### Activate

Add to `.env.local`:

```bash
# Client-visible flags (used by the frontend auth context)
NEXT_PUBLIC_DEV_AUTH_BYPASS=true
NEXT_PUBLIC_DEV_AUTH_AUTO_ADMIN=true

# Optional mock identity (defaults shown)
NEXT_PUBLIC_DEV_AUTH_USER_ID=dev-admin-001
NEXT_PUBLIC_DEV_AUTH_NAME=Dev Admin
NEXT_PUBLIC_DEV_AUTH_EMAIL=dev-admin@canhoes.local
```

### Behaviour

| Feature | Behaviour |
|---------|-----------|
| Auth state | Treated as logged-in locally when bypass is enabled |
| Admin role | `isAdmin=true` when `NEXT_PUBLIC_DEV_AUTH_AUTO_ADMIN=true` |
| Google login UI | Stays visible and callable from login page |
| Visual safety | A `DEV AUTH BYPASS` badge is shown on screen |

### Safety

- Bypass is hard-guarded by `NODE_ENV !== "production"`.
- In production builds this bypass never activates even if env vars are set.
- Real Google auth flow is preserved (`signIn("google")` remains unchanged).

### Disable / remove later

1. Set `NEXT_PUBLIC_DEV_AUTH_BYPASS=false` (or remove it).
2. Restart the dev server.
3. Optional cleanup: remove `lib/auth/devAuth.ts` and `components/dev/DevAuthModeBanner.tsx` if no longer needed.

### Mock data

Fixtures live in `lib/mock/mockData.ts`. Edit them to adjust the data shown in dev.

---

## Project Structure

```
app/
  canhoes/(app)/          — Protected app pages (feed, admin, categorias, …)
  canhoes/(public)/       — Public pages (login)
  api/                    — Next.js API routes (auth, proxy, uploads)
components/
  chrome/canhoes/         — Navigation shell (bottom tabs, header)
  modules/canhoes/        — Feature modules
    admin/                — Admin panel & components
  dev/                    — DevModeBanner (dev-only)
  ui/                     — Shared UI components (shadcn/ui)
lib/
  api/                    — canhoesFetch wrapper
  mock/                   — Mock mode: index, mockData, mockFetch
  repositories/           — API repositories (canhoesRepo, hubRepo)
  auth/                   — Auth utilities (useIsAdmin)
contexts/
  AuthContext.tsx          — App-level auth state
hooks/
  useAuth.ts              — Re-export of AuthContext
```

## Architecture

- **UI → Repository → canhoesFetch → /api/proxy → Backend**
- Auth: NextAuth v4 with Google provider, JWT strategy
- Admin check: `user.isAdmin` from the `/api/me` backend endpoint
- Mock mode bypasses all auth and API calls with static fixtures

## Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint
```

---

## Google OAuth Notes (Local + Vercel)

- Local dev runs on `http://localhost:3000`.
- Keep `NEXTAUTH_URL=http://localhost:3000` in `.env.local`.
- In Google Cloud OAuth client, include:
	- `http://localhost:3000/api/auth/callback/google`
	- `https://canhoes.vercel.app/api/auth/callback/google`
- Avoid LAN callback URLs like `http://192.168.x.x/...` with Google OAuth web flow.
- Use **Mock Mode** (above) to avoid needing Google OAuth during development.
