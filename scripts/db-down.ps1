$ErrorActionPreference = "Stop"
docker container inspect canhoes-db 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
  docker stop canhoes-db | Out-Null
  exit $LASTEXITCODE
}
docker compose down
