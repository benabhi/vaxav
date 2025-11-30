# Vaxav - Instalación de Laravel (PowerShell)

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Vaxav - Instalando Laravel" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que los contenedores estén corriendo
Write-Host "Verificando contenedores..." -ForegroundColor Yellow
docker-compose ps | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Los contenedores no están corriendo" -ForegroundColor Red
    Write-Host "Ejecuta '.\start.ps1' primero" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Contenedores corriendo" -ForegroundColor Green
Write-Host ""

# Advertencia
Write-Host "ADVERTENCIA:" -ForegroundColor Yellow
Write-Host "Este script instalará Laravel 10 en el proyecto." -ForegroundColor White
Write-Host "Esto puede tomar varios minutos..." -ForegroundColor White
Write-Host ""
$confirm = Read-Host "¿Deseas continuar? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Instalación cancelada" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Paso 1/5: Instalando Laravel..." -ForegroundColor Cyan
docker-compose exec -T app composer create-project laravel/laravel:^10.0 temp --no-interaction

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Falló la instalación de Laravel" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Laravel descargado" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 2/5: Moviendo archivos a la raíz..." -ForegroundColor Cyan
docker-compose exec -T app bash -c "shopt -s dotglob && mv temp/* . 2>/dev/null || true"
docker-compose exec -T app rm -rf temp

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Falló al mover archivos" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Archivos movidos" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 3/5: Configurando .env..." -ForegroundColor Cyan
docker-compose exec -T app cp .env.example .env

# Actualizar configuración de base de datos
docker-compose exec -T app bash -c "sed -i 's/DB_CONNECTION=.*/DB_CONNECTION=pgsql/' .env"
docker-compose exec -T app bash -c "sed -i 's/DB_HOST=.*/DB_HOST=db/' .env"
docker-compose exec -T app bash -c "sed -i 's/DB_PORT=.*/DB_PORT=5432/' .env"
docker-compose exec -T app bash -c "sed -i 's/DB_DATABASE=.*/DB_DATABASE=vaxav/' .env"
docker-compose exec -T app bash -c "sed -i 's/DB_USERNAME=.*/DB_USERNAME=vaxav/' .env"
docker-compose exec -T app bash -c "sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=secret/' .env"

# Configurar Redis
docker-compose exec -T app bash -c "sed -i 's/REDIS_HOST=.*/REDIS_HOST=redis/' .env"
docker-compose exec -T app bash -c "sed -i 's/CACHE_DRIVER=.*/CACHE_DRIVER=redis/' .env"
docker-compose exec -T app bash -c "sed -i 's/SESSION_DRIVER=.*/SESSION_DRIVER=redis/' .env"
docker-compose exec -T app bash -c "sed -i 's/QUEUE_CONNECTION=.*/QUEUE_CONNECTION=redis/' .env"

Write-Host "[OK] .env configurado" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 4/5: Generando application key..." -ForegroundColor Cyan
docker-compose exec -T app php artisan key:generate --no-interaction

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Falló la generación de key" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Application key generada" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 5/5: Configurando permisos..." -ForegroundColor Cyan
docker-compose exec -T app chown -R www-data:www-data /var/www/html/storage
docker-compose exec -T app chown -R www-data:www-data /var/www/html/bootstrap/cache
docker-compose exec -T app chmod -R 755 /var/www/html/storage
docker-compose exec -T app chmod -R 755 /var/www/html/bootstrap/cache

Write-Host "[OK] Permisos configurados" -ForegroundColor Green
Write-Host ""

Write-Host "Reiniciando servicios..." -ForegroundColor Yellow
docker-compose restart queue scheduler

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  ¡Laravel instalado correctamente!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Accede a tu aplicación en:" -ForegroundColor Cyan
Write-Host "  http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Ejecutar migraciones: docker-compose exec app php artisan migrate" -ForegroundColor White
Write-Host "  2. Ver NEXT_STEPS.md para el roadmap de desarrollo" -ForegroundColor White
Write-Host ""
