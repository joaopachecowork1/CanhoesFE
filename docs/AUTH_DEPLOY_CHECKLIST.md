# Auth Deploy Checklist

Checklist mínima para um deploy com Google sign-in funcional entre Vercel e backend ASP.NET.

## Frontend (Vercel)

- `NEXTAUTH_URL=https://<teu-frontend>.vercel.app`
- `NEXTAUTH_SECRET=<valor estável e longo>`
- `GOOGLE_CLIENT_ID=<google-client-id>.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET=<google-client-secret>`
- `CANHOES_API_URL=https://<teu-backend>`
- `NEXT_PUBLIC_CANHOES_API_URL=https://<teu-backend>`
- `NEXT_PUBLIC_MOCK_AUTH=false`
- `NEXT_PUBLIC_DEV_AUTH_BYPASS=false`

## Backend

- `ASPNETCORE_ENVIRONMENT=Production`
- `Auth__UseMockAuth=false`
- `Auth__Google__ClientId=<mesmo GOOGLE_CLIENT_ID do frontend>`
- `Cors__OriginsCsv=https://<teu-frontend>.vercel.app`
- opcional para previews: `Cors__AllowedOriginSuffixesCsv=vercel.app`

## Google Cloud Console

- Authorized JavaScript origin:
  - `https://<teu-frontend>.vercel.app`
- Authorized redirect URI:
  - `https://<teu-frontend>.vercel.app/api/auth/callback/google`

## Smoke test depois do deploy

1. `GET /api/auth/providers`
2. iniciar `signIn("google")`
3. confirmar callback para `/api/auth/callback/google`
4. confirmar `GET /api/me` com sessão autenticada
5. abrir `/canhoes/admin` com conta admin
6. confirmar que o backend não está em mock auth
