#!/bin/bash

# Script para ejecutar tests de Vitest con la nueva configuración
# Uso: ./test-clean.sh [ruta-a-los-tests]

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Limpiando caché de Vitest...${NC}"
rm -rf node_modules/.vitest

# Si se proporciona una ruta específica, ejecutar solo esos tests
if [ $# -eq 0 ]; then
  echo -e "${YELLOW}Ejecutando todos los tests con la nueva configuración...${NC}"
  npx vitest run --config vitest.config.ts
else
  echo -e "${YELLOW}Ejecutando tests en: $1 con la nueva configuración...${NC}"
  npx vitest run --config vitest.config.ts "$1"
fi

# Verificar el resultado
if [ $? -eq 0 ]; then
  echo -e "${GREEN}¡Tests completados con éxito!${NC}"
else
  echo -e "${RED}Los tests han fallado.${NC}"
  exit 1
fi
