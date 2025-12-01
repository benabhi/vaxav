# Script para detener el entorno de desarrollo Vaxav
# Detiene todos los contenedores Docker

param(
    [switch]$Clean = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vaxav Game - Deteniendo Entorno" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Detener contenedores
Write-Host "Deteniendo contenedores..." -ForegroundColor Yellow
docker-compose down
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Falló al detener los contenedores" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Contenedores detenidos" -ForegroundColor Green
Write-Host ""

# Limpiar volúmenes si se especificó el parámetro -Clean
if ($Clean) {
    Write-Host "Limpiando volúmenes de datos..." -ForegroundColor Yellow
    docker-compose down -v
    Write-Host "✓ Volúmenes eliminados" -ForegroundColor Green
    Write-Host ""
    Write-Host "ADVERTENCIA: Todos los datos de la base de datos han sido eliminados." -ForegroundColor Red
    Write-Host "La próxima vez que inicies el proyecto, necesitarás ejecutar las migraciones nuevamente." -ForegroundColor Yellow
    Write-Host ""
}

# Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✓ Entorno Detenido" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar nuevamente:" -ForegroundColor Yellow
Write-Host "  .\scripts\start.ps1" -ForegroundColor White
Write-Host ""
if (-not $Clean) {
    Write-Host "Tip: Usa '.\scripts\stop.ps1 -Clean' para también eliminar los volúmenes de datos" -ForegroundColor Cyan
    Write-Host ""
}
