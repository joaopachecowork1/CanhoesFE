$ErrorActionPreference = "Stop"
$backupDir = Join-Path (Get-Location) "backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$output = Join-Path $backupDir "canhoes-$stamp.dump"
$dbUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "canhoes" }
$dbName = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "canhoes" }
$container = "canhoes-postgres"
docker container inspect canhoes-db 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) { $container = "canhoes-db"; $dbUser = "postgres"; $dbName = "Canhoes" }
$containerFile = "/tmp/canhoes-$stamp.dump"
docker exec $container pg_dump -U $dbUser -d $dbName -Fc -f $containerFile
if ($LASTEXITCODE -ne 0) { throw "pg_dump failed" }
docker cp "${container}:$containerFile" $output
if ($LASTEXITCODE -ne 0) { throw "docker cp failed" }
Write-Output $output
