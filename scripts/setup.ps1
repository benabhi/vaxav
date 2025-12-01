# Script de configuracion inicial del proyecto Vaxav
# Este script configura todo el entorno de desarrollo desde cero

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vaxav Game - Setup Inicial" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker Desktop este ejecutandose
Write-Host "Verificando Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1 | Select-String "Server Version"
if (-not $dockerRunning) {
    Write-Host "ERROR: Docker Desktop no esta ejecutandose." -ForegroundColor Red
    Write-Host "Por favor, inicia Docker Desktop e intenta nuevamente." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Docker Desktop esta ejecutandose" -ForegroundColor Green
Write-Host ""

# Crear archivo .env si no existe
if (-not (Test-Path ".\src\.env")) {
    Write-Host "Creando archivo .env desde .env.example..." -ForegroundColor Yellow
    if (Test-Path ".\.env.example") {
        Copy-Item ".\.env.example" ".\src\.env"
        Write-Host "[OK] Archivo .env creado" -ForegroundColor Green
    } else {
        Write-Host "ADVERTENCIA: .env.example no encontrado" -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] Archivo .env ya existe" -ForegroundColor Green
}
Write-Host ""

# Construir y levantar contenedores
Write-Host "Construyendo y levantando contenedores Docker..." -ForegroundColor Yellow
docker-compose up -d --build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo la construccion de contenedores" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Contenedores levantados exitosamente" -ForegroundColor Green
Write-Host ""

# Esperar a que los servicios esten listos
Write-Host "Esperando a que los servicios esten listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "[OK] Servicios listos" -ForegroundColor Green
Write-Host ""

# Instalar dependencias de Composer
Write-Host "Instalando dependencias de Composer..." -ForegroundColor Yellow
docker-compose exec -T app composer install --no-interaction --prefer-dist --optimize-autoloader
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo la instalacion de dependencias de Composer" -ForegroundColor Red
    Write-Host "Verifica que el contenedor app este corriendo correctamente" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Dependencias de Composer instaladas (incluye Inertia y Ziggy)" -ForegroundColor Green
Write-Host ""

# Publicar middleware de Inertia
Write-Host "Publicando middleware de Inertia..." -ForegroundColor Yellow
docker-compose exec -T app php artisan inertia:middleware 2>&1 | Out-Null
Write-Host "[OK] Middleware de Inertia publicado" -ForegroundColor Green
Write-Host ""

# Generar clave de aplicacion
Write-Host "Generando clave de aplicacion Laravel..." -ForegroundColor Yellow
docker-compose exec -T app php artisan key:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ADVERTENCIA: Hubo problemas al generar la clave de aplicacion" -ForegroundColor Yellow
}
Write-Host "[OK] Clave de aplicacion generada" -ForegroundColor Green
Write-Host ""

# Ejecutar migraciones
Write-Host "Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
docker-compose exec -T app php artisan migrate --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "ADVERTENCIA: Hubo problemas al ejecutar migraciones" -ForegroundColor Yellow
}
Write-Host "[OK] Migraciones ejecutadas" -ForegroundColor Green
Write-Host ""

# Instalar dependencias de NPM
Write-Host "Instalando dependencias de NPM..." -ForegroundColor Yellow
docker-compose exec -T app npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo la instalacion de dependencias de NPM" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Dependencias de NPM instaladas" -ForegroundColor Green
Write-Host ""

# Compilar assets
Write-Host "Compilando assets frontend..." -ForegroundColor Yellow
docker-compose exec -T app npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ADVERTENCIA: Hubo problemas al compilar los assets" -ForegroundColor Yellow
}
Write-Host "[OK] Assets compilados" -ForegroundColor Green
Write-Host ""

# Resumen final
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  [OK] Setup Completado Exitosamente" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tu aplicacion esta lista en: http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "Comandos utiles:" -ForegroundColor Yellow
Write-Host "  .\scripts\start.ps1    - Iniciar contenedores" -ForegroundColor White
Write-Host "  .\scripts\stop.ps1     - Detener contenedores" -ForegroundColor White
Write-Host "  npm run dev            - Modo desarrollo (HMR)" -ForegroundColor White
Write-Host ""
