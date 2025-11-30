# Vaxav - Iniciar Servicios (PowerShell)

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Vaxav - Iniciando servicios" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker Desktop esté corriendo
try {
    docker ps | Out-Null
    Write-Host "[OK] Docker Desktop está corriendo" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker Desktop no está corriendo" -ForegroundColor Red
    Write-Host "Por favor, inicia Docker Desktop y vuelve a ejecutar este script." -ForegroundColor Yellow
    exit 1
}

# Levantar contenedores
Write-Host ""
Write-Host "Iniciando contenedores..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Servicios iniciados correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Accede a la aplicación en:" -ForegroundColor Cyan
    Write-Host "  App:        http://localhost:8080" -ForegroundColor White
    Write-Host "  PostgreSQL: localhost:5432" -ForegroundColor White
    Write-Host "  Redis:      localhost:6379" -ForegroundColor White
    Write-Host ""
    Write-Host "Comandos útiles:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs -f          - Ver logs en tiempo real" -ForegroundColor White
    Write-Host "  docker-compose ps               - Ver estado de servicios" -ForegroundColor White
    Write-Host "  docker-compose exec app bash    - Entrar al contenedor" -ForegroundColor White
    Write-Host "  .\stop.ps1                      - Detener servicios" -ForegroundColor White
    Write-Host "  .\clean.ps1                     - Limpiar caché" -ForegroundColor White
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "[ERROR] Falló el inicio de servicios" -ForegroundColor Red
    Write-Host "Ejecuta 'docker-compose logs' para ver más detalles" -ForegroundColor Yellow
    exit 1
}
