# Script de reconstruccion total del proyecto Vaxav
# ADVERTENCIA: Este script elimina TODOS los datos y reconstruye desde cero
# Usalo solo para verificar la reproducibilidad del proyecto

param(
    [switch]$Force = $false
)

Write-Host "========================================" -ForegroundColor Red
Write-Host "  REBUILD TOTAL - PRUEBA DE FUEGO" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Este script eliminara:" -ForegroundColor Yellow
Write-Host "  - Todos los contenedores Docker" -ForegroundColor White
Write-Host "  - Todos los volumenes de datos (PostgreSQL, Redis)" -ForegroundColor White
Write-Host "  - Todas las imagenes Docker del proyecto" -ForegroundColor White
Write-Host "  - Carpetas node_modules y vendor" -ForegroundColor White
Write-Host "  - Assets compilados" -ForegroundColor White
Write-Host "  - Archivo .env" -ForegroundColor White
Write-Host ""

# Solicitar confirmacion si no se usa -Force
if (-not $Force) {
    $confirmation = Read-Host "Estas seguro de continuar? (escribe 'SI' para confirmar)"
    if ($confirmation -ne "SI") {
        Write-Host "Operacion cancelada." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FASE 1: Limpieza Total" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Detener contenedores y eliminar volumenes usando stop.ps1
Write-Host "Deteniendo contenedores y eliminando volumenes..." -ForegroundColor Yellow
if (Test-Path ".\scripts\stop.ps1") {
    & .\scripts\stop.ps1 -Clean
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Fallo al detener contenedores" -ForegroundColor Red
        exit 1
    }
} else {
    docker-compose down -v
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Fallo al detener contenedores" -ForegroundColor Red
        exit 1
    }
}
Write-Host "Contenedores detenidos y volumenes eliminados" -ForegroundColor Green
Write-Host ""

# 2. Eliminar imagenes del proyecto
Write-Host "Eliminando imagenes Docker del proyecto..." -ForegroundColor Yellow
docker-compose down --rmi local 2>&1 | Out-Null
$imageId = docker images -q vaxav-app 2>&1
if ($imageId) {
    docker rmi -f $imageId 2>&1 | Out-Null
}
Write-Host "Imagenes Docker eliminadas" -ForegroundColor Green
Write-Host ""

# 3. Eliminar carpetas generadas
Write-Host "Eliminando carpetas generadas..." -ForegroundColor Yellow

if (Test-Path ".\src\node_modules") {
    Remove-Item -Recurse -Force ".\src\node_modules" -ErrorAction SilentlyContinue
    Write-Host "  - node_modules eliminado" -ForegroundColor Gray
}

if (Test-Path ".\src\vendor") {
    Remove-Item -Recurse -Force ".\src\vendor" -ErrorAction SilentlyContinue
    Write-Host "  - vendor eliminado" -ForegroundColor Gray
}

if (Test-Path ".\src\public\build") {
    Remove-Item -Recurse -Force ".\src\public\build" -ErrorAction SilentlyContinue
    Write-Host "  - public/build eliminado" -ForegroundColor Gray
}

if (Test-Path ".\src\public\hot") {
    Remove-Item -Recurse -Force ".\src\public\hot" -ErrorAction SilentlyContinue
    Write-Host "  - public/hot eliminado" -ForegroundColor Gray
}

if (Test-Path ".\src\storage\framework\cache") {
    Get-ChildItem ".\src\storage\framework\cache" -Exclude ".gitignore" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  - storage/framework/cache limpiado" -ForegroundColor Gray
}

if (Test-Path ".\src\storage\framework\sessions") {
    Get-ChildItem ".\src\storage\framework\sessions" -Exclude ".gitignore" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  - storage/framework/sessions limpiado" -ForegroundColor Gray
}

if (Test-Path ".\src\storage\framework\views") {
    Get-ChildItem ".\src\storage\framework\views" -Exclude ".gitignore" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  - storage/framework/views limpiado" -ForegroundColor Gray
}

if (Test-Path ".\src\storage\logs") {
    Get-ChildItem ".\src\storage\logs" -Exclude ".gitignore" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  - storage/logs limpiado" -ForegroundColor Gray
}

Write-Host "Carpetas generadas eliminadas" -ForegroundColor Green
Write-Host ""

# 4. Eliminar archivos temporales
Write-Host "Eliminando archivos temporales..." -ForegroundColor Yellow

if (Test-Path ".\src\.env") {
    Remove-Item ".\src\.env" -Force -ErrorAction SilentlyContinue
    Write-Host "  - .env eliminado" -ForegroundColor Gray
}

if (Test-Path ".\src\package-lock.json") {
    Remove-Item ".\src\package-lock.json" -Force -ErrorAction SilentlyContinue
    Write-Host "  - package-lock.json eliminado" -ForegroundColor Gray
}

if (Test-Path ".\src\composer.lock") {
    Remove-Item ".\src\composer.lock" -Force -ErrorAction SilentlyContinue
    Write-Host "  - composer.lock eliminado" -ForegroundColor Gray
}

Write-Host "Archivos temporales eliminados" -ForegroundColor Green
Write-Host ""

# 5. Limpiar cache de Docker
Write-Host "Limpiando cache de Docker..." -ForegroundColor Yellow
docker system prune -f 2>&1 | Out-Null
Write-Host "Cache de Docker limpiado" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Limpieza Total Completada" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Esperando 3 segundos antes de reconstruir..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host ""

# FASE 2: Reconstruccion usando setup.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FASE 2: Reconstruccion Completa" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".\scripts\setup.ps1") {
    Write-Host "Ejecutando setup.ps1 para reconstruir el proyecto..." -ForegroundColor Yellow
    Write-Host ""
    & .\scripts\setup.ps1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  REBUILD EXITOSO" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "El proyecto ha sido completamente reconstruido desde cero." -ForegroundColor Green
        Write-Host "Esto confirma que el proyecto es 100% reproducible." -ForegroundColor Green
        Write-Host ""
        Write-Host "Aplicacion disponible en: http://localhost:8000" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "  ERROR EN REBUILD" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Hubo un error durante la reconstruccion." -ForegroundColor Red
        Write-Host "Revisa los logs arriba para mas detalles." -ForegroundColor Red
        Write-Host ""
        exit 1
    }
} else {
    Write-Host "ERROR: No se encontro el script setup.ps1" -ForegroundColor Red
    Write-Host "Asegurate de ejecutar este script desde el directorio raiz del proyecto." -ForegroundColor Red
    exit 1
}
