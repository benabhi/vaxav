# Vaxav - MMO Espacial en Navegador Web

Vaxav es un juego multijugador masivo (MMO) basado en navegador con ambientación sci-fi retro. Los jugadores controlan pilotos en una galaxia sandbox donde pueden explorar, comerciar, minar recursos, participar en batallas y formar corporaciones.

## Documentación

Para una documentación más detallada, consulta la [carpeta docs](./docs/README.md).

### Guía de Estilo y Componentes

Para mantener la coherencia visual y estructural en toda la aplicación, consulta nuestra [Guía de Estilo](./docs/design/style-guide.md) que incluye información sobre componentes, estructura, paleta de colores y mejores prácticas.

Para visualizar y documentar los componentes de UI, utilizamos [Storybook](./frontend/docs/storybook.md).

## Visión General

El proyecto está dividido en dos partes principales:

- **Backend**: Desarrollado con Laravel 12 y PHP 8.3
- **Frontend**: Desarrollado con Vue.js 3, Pinia, Axios y Tailwind CSS

Para más detalles sobre la estructura del proyecto, consulta la [documentación de estructura del proyecto](./docs/architecture/project-structure.md).

## Requisitos

- PHP 8.3 o superior
- Composer
- Node.js 18 o superior
- Yarn o npm

## Instalación Rápida

Para instrucciones detalladas de instalación, consulta la [guía de instalación](./docs/installation.md).

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

### Frontend (Vue.js)

```bash
cd frontend
yarn install
```

## Ejecución

Para instrucciones detalladas sobre cómo poner en marcha el proyecto, consulta:

- [Guía de Puesta en Marcha](./docs/getting-started.md)
- [Uso de PM2](./docs/pm2-usage.md)

### Inicio Rápido con PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar el servidor de Laravel
pm2 start "cd backend && php artisan serve --host=0.0.0.0 --port=8000" --name vaxav-backend

# Iniciar el servidor de Vue.js
pm2 start "cd frontend && yarn dev --host 0.0.0.0 --port 5173" --name vaxav-frontend

# Ver el estado de los servicios
pm2 status
```

### Acceso a la Aplicación

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8000/api
- **Storybook**: http://localhost:6006

## Autenticación

El sistema utiliza autenticación basada en tokens (Laravel Sanctum) para la comunicación entre el frontend y el backend. Para más detalles, consulta la [documentación de autenticación](./docs/api/authentication.md).

### Credenciales de prueba

- **Email**: test@example.com
- **Contraseña**: password

## Testing

El proyecto incluye tests automatizados tanto para el frontend como para el backend. Para más detalles, consulta la [documentación de testing](./docs/testing/README.md).

### Ejecutar Tests del Backend

```bash
cd backend
php artisan test
```

### Ejecutar Tests del Frontend

```bash
# Método recomendado (usando el script de limpieza de caché)
cd frontend
./test-clean.sh

# Método alternativo
cd frontend
npm run test:unit -- --no-cache
```

> **Importante**: Siempre ejecuta los tests del frontend con el script `test-clean.sh` o con la opción `--no-cache` para evitar problemas con la caché de Vitest. Para más detalles sobre cómo resolver problemas con los tests, consulta la [documentación de solución de problemas con Vitest](./docs/testing/testing-vitest.md).

## Solución de Problemas

Si encuentras problemas al usar Vaxav, consulta la [guía de solución de problemas comunes](./docs/troubleshooting/common-issues.md).

## Contribución

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.
