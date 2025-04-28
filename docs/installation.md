# Instalación de Vaxav

Esta guía te ayudará a instalar y configurar el proyecto Vaxav en tu entorno de desarrollo.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- PHP 8.3 o superior
- Composer
- Node.js 18 o superior
- Yarn o npm
- Git

## Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/vaxav.git
cd vaxav
```

## Instalación del Backend (Laravel API)

1. Navega al directorio `/api`:
   ```bash
   cd api
   ```

2. Instala las dependencias de PHP:
   ```bash
   composer install
   ```

3. Copia el archivo de entorno:
   ```bash
   cp .env.example .env
   ```

4. Genera la clave de la aplicación:
   ```bash
   php artisan key:generate
   ```

5. Configura la base de datos en el archivo `.env`:
   ```
   DB_CONNECTION=sqlite
   DB_DATABASE=/ruta/absoluta/a/tu/proyecto/api/database/database.sqlite
   ```

6. Crea el archivo de base de datos SQLite:
   ```bash
   touch database/database.sqlite
   ```

7. Ejecuta las migraciones y los seeders:
   ```bash
   php artisan migrate --seed
   ```

## Instalación del Frontend (Vue.js)

1. Navega al directorio `/frontend`:
   ```bash
   cd ../frontend
   ```

2. Instala las dependencias de JavaScript:
   ```bash
   yarn install
   # o si usas npm
   npm install
   ```

3. Copia el archivo de entorno (si existe):
   ```bash
   cp .env.example .env
   ```

## Configuración de CORS

Para que el frontend pueda comunicarse con el backend, necesitas configurar CORS correctamente:

1. Abre el archivo `/api/config/cors.php`
2. Asegúrate de que los orígenes permitidos incluyan tu URL de desarrollo:
   ```php
   'allowed_origins' => [
       'http://localhost:5173',
       'http://127.0.0.1:5173',
       'http://0.0.0.0:5173',
       // Agrega aquí cualquier otro origen que necesites
   ],
   ```

## Verificación de la Instalación

Para verificar que todo está instalado correctamente:

1. Inicia el servidor de Laravel:
   ```bash
   cd api
   php artisan serve
   ```

2. En otra terminal, inicia el servidor de Vue.js:
   ```bash
   cd frontend
   yarn dev
   # o si usas npm
   npm run dev
   ```

3. Abre tu navegador y navega a:
   - Frontend: http://localhost:5173
   - API: http://localhost:8000/api

Si puedes ver la página de inicio de Vaxav y la API responde correctamente, ¡la instalación ha sido exitosa!

## Siguientes Pasos

Una vez que hayas completado la instalación, consulta la [Guía de Puesta en Marcha](./getting-started.md) para aprender a ejecutar y desarrollar el proyecto.
