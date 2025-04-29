#!/bin/bash

# Script para ejecutar tests de Vitest con limpieza de caché
# Uso: ./run-tests.sh [ruta-a-los-tests]

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Limpiando caché de Vitest...${NC}"
rm -rf node_modules/.vitest

# Si se proporciona una ruta específica, ejecutar solo esos tests
if [ $# -eq 0 ]; then
  echo -e "${YELLOW}Ejecutando todos los tests...${NC}"
  npm run test:unit -- --no-cache
else
  echo -e "${YELLOW}Ejecutando tests en: $1${NC}"
  npm run test:unit -- --no-cache "$1"
fi

# Verificar el resultado
if [ $? -eq 0 ]; then
  echo -e "${GREEN}¡Tests completados con éxito!${NC}"
else
  echo -e "${RED}Los tests han fallado.${NC}"
  exit 1
fi
