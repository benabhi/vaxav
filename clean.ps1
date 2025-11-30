# Vaxav - Limpiar Caché (PowerShell)

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Vaxav - Limpiando caché" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que los contenedores estén corriendo
try {
    docker-compose ps app | Out-Null
} catch {
    Write-Host "[ERROR] Los servicios no están corriendo" -ForegroundColor Red
    Write-Host "Ejecuta '.\start.ps1' primero" -ForegroundColor Yellow
    exit 1
}

Write-Host "Limpiando caché de Laravel..." -ForegroundColor Yellow
Write-Host ""

# Limpiar caché de configuración
Write-Host "[1/6] Limpiando config cache..." -ForegroundColor Cyan
docker-compose exec -T app php artisan config:clear
if ($LASTEXITCODE -eq 0) { Write-Host "  [OK]" -ForegroundColor Green } else { Write-Host "  [ERROR]" -ForegroundColor Red }

# Limpiar caché de aplicación
Write-Host "[2/6] Limpiando application cache..." -ForegroundColor Cyan
docker-compose exec -T app php artisan cache:clear
if ($LASTEXITCODE -eq 0) { Write-Host "  [OK]" -ForegroundColor Green } else { Write-Host "  [ERROR]" -ForegroundColor Red }

# Limpiar caché de rutas
Write-Host "[3/6] Limpiando route cache..." -ForegroundColor Cyan
docker-compose exec -T app php artisan route:clear
if ($LASTEXITCODE -eq 0) { Write-Host "  [OK]" -ForegroundColor Green } else { Write-Host "  [ERROR]" -ForegroundColor Red }

# Limpiar caché de vistas
Write-Host "[4/6] Limpiando view cache..." -ForegroundColor Cyan
docker-compose exec -T app php artisan view:clear
if ($LASTEXITCODE -eq 0) { Write-Host "  [OK]" -ForegroundColor Green } else { Write-Host "  [ERROR]" -ForegroundColor Red }

# Limpiar caché de eventos
Write-Host "[5/6] Limpiando event cache..." -ForegroundColor Cyan
docker-compose exec -T app php artisan event:clear
if ($LASTEXITCODE -eq 0) { Write-Host "  [OK]" -ForegroundColor Green } else { Write-Host "  [ERROR]" -ForegroundColor Red }

# Optimizar autoloader
Write-Host "[6/6] Optimizando autoloader..." -ForegroundColor Cyan
docker-compose exec -T app composer dump-autoload -o
if ($LASTEXITCODE -eq 0) { Write-Host "  [OK]" -ForegroundColor Green } else { Write-Host "  [ERROR]" -ForegroundColor Red }

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Caché limpiado completamente!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si quieres cachear nuevamente para producción:" -ForegroundColor Yellow
Write-Host "  docker-compose exec app php artisan config:cache" -ForegroundColor White
Write-Host "  docker-compose exec app php artisan route:cache" -ForegroundColor White
Write-Host "  docker-compose exec app php artisan view:cache" -ForegroundColor White
Write-Host ""
