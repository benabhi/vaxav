# Vaxav - Setup Inicial (PowerShell)
# Este script configura el proyecto completo en Windows

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Vaxav - Setup Inicial" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker Desktop esté corriendo
try {
    docker ps | Out-Null
    Write-Host "[OK] Docker Desktop está corriendo" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker Desktop no está corriendo. Por favor, inícialo y vuelve a ejecutar este script." -ForegroundColor Red
    exit 1
}

# Copiar archivo de entorno
if (-Not (Test-Path .env)) {
    Write-Host "Copiando archivo .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "[OK] Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host "[OK] Archivo .env ya existe" -ForegroundColor Green
}

# Construir y levantar contenedores
Write-Host ""
Write-Host "Construyendo contenedores Docker..." -ForegroundColor Yellow
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Falló la construcción de contenedores" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Levantando contenedores..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Falló el inicio de contenedores" -ForegroundColor Red
    exit 1
}

# Esperar a que la base de datos esté lista
Write-Host ""
Write-Host "Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Instalar dependencias de Composer
Write-Host ""
Write-Host "Instalando dependencias de Composer..." -ForegroundColor Yellow
docker-compose exec -T app composer install --no-interaction

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ADVERTENCIA] No se pudieron instalar las dependencias de Composer" -ForegroundColor Yellow
    Write-Host "Esto es normal si Laravel aún no está instalado" -ForegroundColor Yellow
}

# Generar key de Laravel
Write-Host ""
Write-Host "Generando application key..." -ForegroundColor Yellow
docker-compose exec -T app php artisan key:generate --no-interaction

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ADVERTENCIA] No se pudo generar la application key" -ForegroundColor Yellow
}

# Ejecutar migraciones
Write-Host ""
Write-Host "Ejecutando migraciones..." -ForegroundColor Yellow
docker-compose exec -T app php artisan migrate --force

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ADVERTENCIA] No se pudieron ejecutar las migraciones" -ForegroundColor Yellow
}

# Ejecutar seeders
Write-Host ""
Write-Host "Ejecutando seeders..." -ForegroundColor Yellow
docker-compose exec -T app php artisan db:seed --force

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ADVERTENCIA] No se pudieron ejecutar los seeders" -ForegroundColor Yellow
}

# Crear link de storage
Write-Host ""
Write-Host "Creando storage link..." -ForegroundColor Yellow
docker-compose exec -T app php artisan storage:link

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ADVERTENCIA] No se pudo crear el storage link" -ForegroundColor Yellow
}

# Instalar dependencias de NPM
Write-Host ""
Write-Host "Instalando dependencias de NPM..." -ForegroundColor Yellow
docker-compose exec -T app npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ADVERTENCIA] No se pudieron instalar las dependencias de NPM" -ForegroundColor Yellow
}

# Compilar assets
Write-Host ""
Write-Host "Compilando assets..." -ForegroundColor Yellow
docker-compose exec -T app npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ADVERTENCIA] No se pudieron compilar los assets" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Setup completado!" -ForegroundColor Green
Write-Host "  Accede a: http://localhost:8080" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comandos útiles:" -ForegroundColor Yellow
Write-Host "  .\start.ps1           - Iniciar servicios" -ForegroundColor White
Write-Host "  .\stop.ps1            - Detener servicios" -ForegroundColor White
Write-Host "  .\clean.ps1           - Limpiar caché de Laravel" -ForegroundColor White
Write-Host "  docker-compose logs -f - Ver logs en tiempo real" -ForegroundColor White
Write-Host ""
