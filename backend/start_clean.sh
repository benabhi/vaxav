#!/bin/bash

# Script para iniciar una base de datos limpia con roles, permisos y un superadmin

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando proceso de limpieza y configuración de la base de datos...${NC}"

# Ejecutar migración limpia
echo -e "${YELLOW}Ejecutando migración limpia...${NC}"
php artisan migrate:fresh
if [ $? -ne 0 ]; then
    echo -e "${RED}Error al ejecutar la migración. Abortando.${NC}"
    exit 1
fi
echo -e "${GREEN}Migración completada con éxito.${NC}"

# Sembrar roles y permisos
echo -e "${YELLOW}Sembrando roles y permisos...${NC}"
php artisan db:seed --class=Database\\Seeders\\RolesAndPermissionsSeeder
if [ $? -ne 0 ]; then
    echo -e "${RED}Error al sembrar roles y permisos. Abortando.${NC}"
    exit 1
fi
echo -e "${GREEN}Roles y permisos sembrados con éxito.${NC}"

# Crear superadmin
echo -e "${YELLOW}Creando usuario superadmin...${NC}"
php artisan vaxav:create_superadmin benabhi@gmail.com 31860933
if [ $? -ne 0 ]; then
    echo -e "${RED}Error al crear el superadmin. Abortando.${NC}"
    exit 1
fi
echo -e "${GREEN}Usuario superadmin creado con éxito.${NC}"

echo -e "${GREEN}¡Proceso completado! La base de datos ha sido configurada correctamente.${NC}"
echo -e "${YELLOW}Puedes iniciar sesión con:${NC}"
echo -e "Email: ${GREEN}benabhi@gmail.com${NC}"
echo -e "Contraseña: ${GREEN}31860933${NC}"
