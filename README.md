# Canhões

Aplicação full-stack em Next.js. O browser, os Route Handlers, a autenticação e a camada de dados vivem neste único projeto; não é necessário arrancar um backend C#.

## Requisitos

- Node.js 20+
- npm
- Docker Desktop (PostgreSQL local)

## Arranque local

1. Copiar `.env.example` para `.env.local` e preencher `NEXTAUTH_SECRET`.
2. Executar:

```powershell
npm install
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

A aplicação fica disponível em `http://localhost:3000/canhoes`.

O login Google requer `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`. Para desenvolvimento sem Google, definir `DEV_AUTH_BYPASS_ENABLED=true`; isto ativa um provider Credentials real do NextAuth, resolve o utilizador na base de dados e é recusado em produção. O utilizador local é configurado por `DEV_AUTH_EMAIL` e `DEV_AUTH_NAME`.

## Base de dados

O PostgreSQL é gerido pelo `docker-compose.yml` e guarda dados num volume persistente. A role administrativa é lida exclusivamente de `User.isAdmin`.

```powershell
npm run db:up        # iniciar PostgreSQL
npm run db:migrate   # aplicar migrations Prisma
npm run db:seed      # seed idempotente
npm run db:backup    # criar pg_dump em backups/
npm run db:restore   # restaurar um dump (passar -BackupFile ao script)
npm run db:studio    # abrir Prisma Studio
npm run db:down      # parar a infraestrutura
```

Numa base de dados EF já existente, usar `npm run db:baseline -- -ExistingDatabase` uma única vez antes de `db:migrate`. Deve existir um backup verificado antes desta operação.

## Uploads

Por omissão os ficheiros ficam em `.data/uploads`, fora do Git. `UPLOADS_DIR` permite escolher outro diretório. Os nomes são gerados no servidor, a escrita é atómica, os caminhos são validados e apenas JPEG, PNG, GIF e WebP até 10 MB são aceites.

## Qualidade

```powershell
npm run lint
npm test
npm run build
npm start
```

As APIs públicas permanecem sob `/api/v1`. Rotas administrativas passam pela autorização server-side, devolvendo `401` sem sessão e `403` sem role. A atualização das vistas usa invalidação TanStack Query e polling apenas quando a página está visível e online.
