# Script para iniciar el entorno de desarrollo Vaxav
# Levanta todos los contenedores Docker

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vaxav Game - Iniciando Entorno" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker Desktop esté ejecutándose
Write-Host "Verificando Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1 | Select-String "Server Version"
if (-not $dockerRunning) {
    Write-Host "ERROR: Docker Desktop no está ejecutándose." -ForegroundColor Red
    Write-Host "Por favor, inicia Docker Desktop e intenta nuevamente." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker Desktop está ejecutándose" -ForegroundColor Green
Write-Host ""

# Levantar contenedores
Write-Host "Levantando contenedores..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Falló al levantar los contenedores" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Contenedores levantados" -ForegroundColor Green
Write-Host ""

# Mostrar estado de contenedores
Write-Host "Estado de los contenedores:" -ForegroundColor Yellow
docker-compose ps
Write-Host ""

# Información de acceso
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✓ Entorno Iniciado" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Aplicación: http://localhost:8000" -ForegroundColor Green
Write-Host "Base de datos PostgreSQL: localhost:5432" -ForegroundColor Green
Write-Host "Redis: localhost:6379" -ForegroundColor Green
Write-Host ""
Write-Host "Para desarrollo con HMR ejecuta:" -ForegroundColor Yellow
Write-Host "  docker-compose exec app npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Para detener el entorno:" -ForegroundColor Yellow
Write-Host "  .\scripts\stop.ps1" -ForegroundColor White
Write-Host ""
