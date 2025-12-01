# Script para detener el entorno de desarrollo Vaxav
# Detiene todos los contenedores Docker

param(
    [switch]$Clean = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vaxav Game - Deteniendo Entorno" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Detener contenedores (y limpiar volumenes si se especifico -Clean)
if ($Clean) {
    Write-Host "Deteniendo contenedores y limpiando volumenes..." -ForegroundColor Yellow
    docker-compose down -v
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Fallo al detener los contenedores y limpiar volumenes" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Contenedores detenidos y volumenes eliminados" -ForegroundColor Green
    Write-Host ""
    Write-Host "ADVERTENCIA: Todos los datos de la base de datos han sido eliminados." -ForegroundColor Red
    Write-Host "La proxima vez que inicies el proyecto, necesitaras ejecutar las migraciones nuevamente." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "Deteniendo contenedores..." -ForegroundColor Yellow
    docker-compose down
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Fallo al detener los contenedores" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Contenedores detenidos" -ForegroundColor Green
    Write-Host ""
}

# Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  [OK] Entorno Detenido" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar nuevamente:" -ForegroundColor Yellow
Write-Host "  .\scripts\start.ps1" -ForegroundColor White
Write-Host ""
if (-not $Clean) {
    Write-Host "Tip: Usa '.\scripts\stop.ps1 -Clean' para tambien eliminar los volumenes de datos" -ForegroundColor Cyan
    Write-Host ""
}
