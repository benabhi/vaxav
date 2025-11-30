#!/bin/bash

echo "==================================="
echo "  Vaxav - Iniciando servicios"
echo "==================================="

# Levantar contenedores
docker-compose up -d

echo "Servicios iniciados!"
echo "App: http://localhost:8080"
echo "PostgreSQL: localhost:5432"
echo "Redis: localhost:6379"
echo ""
echo "Comandos útiles:"
echo "  docker-compose logs -f          # Ver logs"
echo "  docker-compose down             # Detener servicios"
echo "  docker-compose exec app bash    # Entrar al contenedor"
echo "==================================="
