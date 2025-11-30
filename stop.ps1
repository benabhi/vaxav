# Vaxav - Detener Servicios (PowerShell)

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Vaxav - Deteniendo servicios" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Detener contenedores
Write-Host "Deteniendo contenedores..." -ForegroundColor Yellow
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Servicios detenidos correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para iniciar nuevamente, ejecuta:" -ForegroundColor Yellow
    Write-Host "  .\start.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[ERROR] Falló la detención de servicios" -ForegroundColor Red
    exit 1
}
