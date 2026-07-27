param([switch]$ExistingDatabase)
$ErrorActionPreference = "Stop"
if (-not $ExistingDatabase) {
  throw "Baseline is only for a verified existing database. Use npm run db:migrate for a new database."
}
npx prisma migrate resolve --applied 00000000000000_baseline
if ($LASTEXITCODE -ne 0) { throw "Could not record Prisma baseline" }
