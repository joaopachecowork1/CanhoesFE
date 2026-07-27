param([Parameter(Mandatory = $true)][string]$Path)
$ErrorActionPreference = "Stop"
$resolved = Resolve-Path -LiteralPath $Path -ErrorAction Stop
$dbUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "canhoes" }
$dbName = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "canhoes" }
$container = "canhoes-postgres"
docker container inspect canhoes-db 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) { $container = "canhoes-db"; $dbUser = "postgres"; $dbName = "Canhoes" }
$containerFile = "/tmp/canhoes-restore.dump"
docker cp $resolved "${container}:$containerFile"
if ($LASTEXITCODE -ne 0) { throw "docker cp failed" }
docker exec $container pg_restore --clean --if-exists --no-owner -U $dbUser -d $dbName $containerFile
if ($LASTEXITCODE -ne 0) { throw "pg_restore failed" }
