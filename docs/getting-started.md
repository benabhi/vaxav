# Puesta en Marcha de Vaxav

Esta guía te ayudará a poner en marcha el proyecto Vaxav en tu entorno de desarrollo.

## Prerrequisitos

Asegúrate de haber completado todos los pasos de la [Guía de Instalación](./installation.md).

## Estructura de Directorios

El proyecto está dividido en dos partes principales:

- **Backend (API)**: Directorio `/api` - Desarrollado con Laravel 12 y PHP 8.3
- **Frontend**: Directorio `/frontend` - Desarrollado con Vue.js 3, Pinia, Axios y Tailwind CSS

## Ejecución del Proyecto

Hay varias formas de ejecutar el proyecto:

### Método 1: Ejecución Manual

Este método requiere que ejecutes cada servicio en una terminal separada.

1. Inicia el servidor de Laravel:
   ```bash
   cd api
   php artisan serve --host=0.0.0.0 --port=8000
   ```

2. En otra terminal, inicia el servidor de Vue.js:
   ```bash
   cd frontend
   yarn dev --host 0.0.0.0 --port 5173
   # o si usas npm
   npm run dev -- --host 0.0.0.0 --port 5173
   ```

### Método 2: Ejecución con PM2

Este método te permite ejecutar ambos servicios en segundo plano. Para más detalles, consulta la [Guía de Uso de PM2](./pm2-usage.md).

1. Inicia el servidor de Laravel con PM2:
   ```bash
   pm2 start "cd api && php artisan serve --host=0.0.0.0 --port=8000" --name vaxav-api
   ```

2. Inicia el servidor de Vue.js con PM2:
   ```bash
   pm2 start "cd frontend && yarn dev --host 0.0.0.0 --port 5173" --name vaxav-frontend
   ```

## Acceso a la Aplicación

Una vez que los servicios estén en ejecución, puedes acceder a la aplicación en:

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8000/api

## Credenciales de Prueba

Para probar la aplicación, puedes usar las siguientes credenciales:

- **Email**: test@example.com
- **Contraseña**: password

## Desarrollo

### Flujo de Trabajo Recomendado

1. Inicia los servicios como se describe arriba
2. Realiza cambios en el código
3. Los cambios se aplicarán automáticamente gracias al hot-reloading
4. Para los cambios que requieren reinicio (como cambios en la configuración), reinicia el servicio correspondiente

### Comandos Útiles

#### Backend (Laravel)

- Crear un nuevo controlador:
  ```bash
  php artisan make:controller NombreController
  ```

- Crear un nuevo modelo con migración:
  ```bash
  php artisan make:model Nombre -m
  ```

- Ejecutar migraciones:
  ```bash
  php artisan migrate
  ```

- Revertir migraciones:
  ```bash
  php artisan migrate:rollback
  ```

- Ejecutar pruebas:
  ```bash
  php artisan test
  ```

#### Frontend (Vue.js)

- Lint y corregir archivos:
  ```bash
  yarn lint
  # o si usas npm
  npm run lint
  ```

- Ejecutar pruebas unitarias:
  ```bash
  yarn test:unit
  # o si usas npm
  npm run test:unit
  ```

- Construir para producción:
  ```bash
  yarn build
  # o si usas npm
  npm run build
  ```

## Siguientes Pasos

Una vez que tengas el proyecto en marcha, puedes:

- Explorar la [Documentación de la API](./api/authentication.md) para entender los endpoints disponibles
- Revisar la [Estructura del Proyecto](./architecture/project-structure.md) para entender la organización del código
- Consultar la [Guía de Contribución](./development/contributing.md) si deseas contribuir al proyecto
