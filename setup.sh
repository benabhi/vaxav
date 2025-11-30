#!/bin/bash

echo "==================================="
echo "  Vaxav - Setup Inicial"
echo "==================================="

# Copiar archivo de entorno
if [ ! -f .env ]; then
    echo "Copiando archivo .env..."
    cp .env.example .env
fi

# Construir y levantar contenedores
echo "Construyendo contenedores Docker..."
docker-compose build

echo "Levantando contenedores..."
docker-compose up -d

# Esperar a que la base de datos esté lista
echo "Esperando a que PostgreSQL esté listo..."
sleep 10

# Instalar dependencias de Composer
echo "Instalando dependencias de Composer..."
docker-compose exec app composer install

# Generar key de Laravel
echo "Generando application key..."
docker-compose exec app php artisan key:generate

# Ejecutar migraciones
echo "Ejecutando migraciones..."
docker-compose exec app php artisan migrate

# Ejecutar seeders
echo "Ejecutando seeders..."
docker-compose exec app php artisan db:seed

# Crear link de storage
echo "Creando storage link..."
docker-compose exec app php artisan storage:link

# Instalar dependencias de NPM
echo "Instalando dependencias de NPM..."
docker-compose exec app npm install

# Compilar assets
echo "Compilando assets..."
docker-compose exec app npm run build

echo "==================================="
echo "  Setup completado!"
echo "  Accede a: http://localhost:8080"
echo "==================================="
