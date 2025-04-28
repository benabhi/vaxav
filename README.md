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

## Ejecución

### Desarrollo

Para ejecutar el proyecto en modo desarrollo, puedes usar PM2:

```bash
# Inicia el servidor de Laravel
pm2 start "cd api && php artisan serve --host=0.0.0.0 --port=8000" --name vaxav-api

# Inicia el servidor de Vue.js
pm2 start "cd frontend && yarn dev --host 0.0.0.0 --port 5173" --name vaxav-frontend
```

O puedes ejecutar cada servicio en una terminal separada:

```bash
# Terminal 1 - Backend
cd api
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 - Frontend
cd frontend
yarn dev --host 0.0.0.0 --port 5173
```

### Producción

Para producción, se recomienda:

1. Construir el frontend:
   ```bash
   cd frontend
   yarn build
   ```

2. Configurar un servidor web (Nginx, Apache) para servir el backend y los archivos estáticos del frontend.

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

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.
