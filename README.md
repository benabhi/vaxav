# Vaxav - MMO Espacial en Navegador Web

Vaxav es un juego multijugador masivo (MMO) basado en navegador con ambientación sci-fi retro. Los jugadores controlan pilotos en una galaxia sandbox donde pueden explorar, comerciar, minar recursos, participar en batallas y formar corporaciones.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

- **Backend (API)**: Desarrollado con Laravel 12 y PHP 8.3
- **Frontend**: Desarrollado con Vue.js 3, Pinia, Axios y Tailwind CSS

### Directorio `/api`

Contiene el backend desarrollado con Laravel, que proporciona una API RESTful para el frontend.

### Directorio `/frontend`

Contiene el frontend desarrollado con Vue.js, que consume la API del backend.

## Requisitos

- PHP 8.3 o superior
- Composer
- Node.js 18 o superior
- Yarn o npm

## Instalación

### Backend (Laravel API)

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

5. Configura la base de datos en el archivo `.env`

6. Ejecuta las migraciones y los seeders:
   ```bash
   php artisan migrate --seed
   ```

### Frontend (Vue.js)

1. Navega al directorio `/frontend`:
   ```bash
   cd frontend
   ```

2. Instala las dependencias de JavaScript:
   ```bash
   yarn install
   ```

## Puesta en Marcha del Proyecto

### Instalación de PM2

PM2 es un gestor de procesos para Node.js que nos permite ejecutar y mantener aplicaciones en segundo plano. Es muy útil para ejecutar tanto el backend como el frontend de nuestro proyecto.

1. Instala PM2 globalmente:
   ```bash
   npm install -g pm2
   # o con yarn
   yarn global add pm2
   ```

2. Verifica la instalación:
   ```bash
   pm2 --version
   ```

### Ejecución con PM2

PM2 nos permite gestionar fácilmente nuestros servicios. Aquí hay algunos comandos útiles:

#### Iniciar los servicios

```bash
# Desde la raíz del proyecto
# Inicia el servidor de Laravel
pm2 start "cd api && php artisan serve --host=0.0.0.0 --port=8000" --name vaxav-api

# Inicia el servidor de Vue.js
pm2 start "cd frontend && yarn dev --host 0.0.0.0 --port 5173" --name vaxav-frontend
```

#### Ver el estado de los servicios

```bash
pm2 status
```

#### Ver los logs de los servicios

```bash
# Ver todos los logs
pm2 logs

# Ver logs de un servicio específico
pm2 logs vaxav-api
pm2 logs vaxav-frontend
```

#### Reiniciar los servicios

```bash
# Reiniciar todos los servicios
pm2 restart all

# Reiniciar un servicio específico
pm2 restart vaxav-api
pm2 restart vaxav-frontend
```

#### Detener los servicios

```bash
# Detener todos los servicios
pm2 stop all

# Detener un servicio específico
pm2 stop vaxav-api
pm2 stop vaxav-frontend
```

#### Eliminar los servicios de PM2

```bash
# Eliminar todos los servicios
pm2 delete all

# Eliminar un servicio específico
pm2 delete vaxav-api
pm2 delete vaxav-frontend
```

### Configuración con archivo ecosystem.config.js

También puedes crear un archivo `ecosystem.config.js` en la raíz del proyecto para configurar PM2:

```javascript
module.exports = {
  apps: [
    {
      name: 'vaxav-api',
      cwd: './api',
      script: 'php',
      args: 'artisan serve --host=0.0.0.0 --port=8000',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'vaxav-frontend',
      cwd: './frontend',
      script: 'yarn',
      args: 'dev --host 0.0.0.0 --port 5173',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
```

Luego puedes iniciar todos los servicios con:

```bash
pm2 start ecosystem.config.js
```

### Ejecución sin PM2

Si prefieres no usar PM2, puedes ejecutar cada servicio en una terminal separada:

```bash
# Terminal 1 - Backend
cd api
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 - Frontend
cd frontend
yarn dev --host 0.0.0.0 --port 5173
```

### Acceso a la aplicación

Una vez que los servicios estén en ejecución, puedes acceder a la aplicación en:

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8000/api

### Producción

Para producción, se recomienda:

1. Construir el frontend:
   ```bash
   cd frontend
   yarn build
   ```

2. Configurar un servidor web (Nginx, Apache) para servir el backend y los archivos estáticos del frontend.

3. Usar PM2 para mantener el servidor de Laravel en ejecución:
   ```bash
   pm2 start "cd api && php artisan serve --host=0.0.0.0 --port=80" --name vaxav-api-prod
   ```

4. Configurar PM2 para iniciar automáticamente en el arranque del sistema:
   ```bash
   pm2 startup
   pm2 save
   ```

## Autenticación

El sistema utiliza autenticación basada en tokens (Laravel Sanctum) para la comunicación entre el frontend y el backend.

### Credenciales de prueba

- **Email**: test@example.com
- **Contraseña**: password

## Estructura de la Base de Datos

### Principales Entidades

- **Users**: Usuarios registrados en el sistema
- **Pilots**: Pilotos controlados por los usuarios
- **Regions**: Regiones del universo
- **Constellations**: Constelaciones dentro de las regiones
- **SolarSystems**: Sistemas solares dentro de las constelaciones
- **Ships**: Naves espaciales que pueden ser pilotadas
- **Corporations**: Organizaciones de jugadores

## API Endpoints

### Autenticación

- `POST /api/login`: Iniciar sesión
- `POST /api/register`: Registrar un nuevo usuario
- `POST /api/logout`: Cerrar sesión
- `GET /api/user`: Obtener el usuario autenticado

### Pilotos

- `GET /api/pilots`: Listar pilotos
- `POST /api/pilots`: Crear un nuevo piloto
- `GET /api/pilots/{id}`: Obtener detalles de un piloto
- `PUT /api/pilots/{id}`: Actualizar un piloto
- `DELETE /api/pilots/{id}`: Eliminar un piloto

### Universo

- `GET /api/universe/regions`: Listar regiones
- `GET /api/universe/constellations`: Listar constelaciones
- `GET /api/universe/systems`: Listar sistemas solares

### Naves

- `GET /api/ships`: Listar naves del usuario
- `POST /api/ships`: Comprar una nueva nave
- `GET /api/ships/{id}`: Obtener detalles de una nave
- `PUT /api/ships/{id}`: Actualizar una nave
- `DELETE /api/ships/{id}`: Vender una nave

### Mercado

- `GET /api/market`: Listar artículos en venta
- `POST /api/market`: Poner un artículo a la venta
- `GET /api/market/{id}`: Obtener detalles de un artículo
- `POST /api/market/{id}/buy`: Comprar un artículo

## Contribución

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Solución de Problemas Comunes

### Problemas de CORS

Si encuentras errores de CORS al intentar comunicarte con la API desde el frontend, verifica:

1. La configuración de CORS en `/api/config/cors.php`:
   ```php
   'allowed_origins' => [
       'http://localhost:5173',
       'http://127.0.0.1:5173',
       'http://0.0.0.0:5173',
       // Agrega aquí cualquier otro origen que necesites
   ],
   ```

2. Reinicia el servidor de Laravel después de modificar la configuración:
   ```bash
   pm2 restart vaxav-api
   ```

### Problemas de Autenticación

Si tienes problemas con la autenticación:

1. Verifica que estás utilizando las credenciales correctas.
2. Asegúrate de que el token se está almacenando correctamente en localStorage.
3. Verifica que el token se está enviando en las cabeceras de las solicitudes.
4. Limpia el localStorage y vuelve a iniciar sesión:
   ```javascript
   localStorage.removeItem('auth_token');
   ```

### Problemas con PM2

Si PM2 no funciona correctamente:

1. Verifica que PM2 está instalado globalmente:
   ```bash
   pm2 --version
   ```

2. Si no está disponible en el PATH, puedes ejecutarlo con la ruta completa:
   ```bash
   ~/.npm-global/bin/pm2 status
   # o
   ~/.yarn/bin/pm2 status
   ```

3. Si tienes problemas para iniciar los servicios, intenta ejecutarlos directamente sin PM2 para ver los errores.

### Problemas con el Frontend

Si el frontend no se carga correctamente:

1. Verifica que las dependencias están instaladas:
   ```bash
   cd frontend
   yarn install
   ```

2. Verifica que no hay errores en la consola del navegador (F12).

3. Intenta limpiar la caché del navegador o usar el modo incógnito.

### Problemas con el Backend

Si el backend no responde correctamente:

1. Verifica que el servidor de Laravel está en ejecución:
   ```bash
   pm2 status
   ```

2. Verifica los logs para ver si hay errores:
   ```bash
   pm2 logs vaxav-api
   ```

3. Prueba los endpoints directamente con curl o Postman para aislar el problema.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.
