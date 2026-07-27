$ErrorActionPreference = "Stop"
$legacy = docker container inspect canhoes-db 2>$null
if ($LASTEXITCODE -eq 0) {
  docker start canhoes-db | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Could not start existing canhoes-db container" }
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    docker exec canhoes-db pg_isready 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { Write-Output "Existing Canhoes PostgreSQL is ready."; exit 0 }
    Start-Sleep -Seconds 1
  }
  throw "Existing canhoes-db did not become ready"
}

docker compose up -d --wait postgres
if ($LASTEXITCODE -ne 0) { throw "Could not start PostgreSQL with Docker Compose" }
