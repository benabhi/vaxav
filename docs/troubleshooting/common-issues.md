# Problemas Comunes en Vaxav

Esta guía aborda los problemas más comunes que puedes encontrar al trabajar con Vaxav y cómo solucionarlos.

## Problemas de Instalación

### Composer Install Falla

**Problema:** Al ejecutar `composer install` en el directorio `/api`, aparecen errores.

**Soluciones:**
1. Verifica que tienes PHP 8.3 o superior instalado:
   ```bash
   php -v
   ```

2. Asegúrate de tener las extensiones de PHP requeridas:
   ```bash
   # En Ubuntu/Debian
   sudo apt install php8.3-mbstring php8.3-xml php8.3-curl php8.3-sqlite3

   # En macOS con Homebrew
   brew install php
   ```

3. Limpia la caché de Composer:
   ```bash
   composer clear-cache
   ```

### Yarn/NPM Install Falla

**Problema:** Al ejecutar `yarn install` o `npm install` en el directorio `/frontend`, aparecen errores.

**Soluciones:**
1. Verifica que tienes Node.js 18 o superior instalado:
   ```bash
   node -v
   ```

2. Limpia la caché:
   ```bash
   # Para yarn
   yarn cache clean

   # Para npm
   npm cache clean --force
   ```

3. Elimina el directorio `node_modules` y vuelve a intentarlo:
   ```bash
   rm -rf node_modules
   yarn install
   ```

## Problemas de Ejecución

### El Servidor Laravel No Inicia

**Problema:** Al ejecutar `php artisan serve`, aparece un error o el servidor no inicia.

**Soluciones:**
1. Verifica que el puerto 8000 no esté en uso:
   ```bash
   # En Linux/macOS
   lsof -i :8000

   # En Windows
   netstat -ano | findstr :8000
   ```

2. Si el puerto está en uso, puedes usar otro:
   ```bash
   php artisan serve --port=8001
   ```

3. Verifica que tienes los permisos correctos:
   ```bash
   chmod -R 755 storage bootstrap/cache
   ```

### El Servidor Vue.js No Inicia

**Problema:** Al ejecutar `yarn dev` o `npm run dev`, aparece un error o el servidor no inicia.

**Soluciones:**
1. Verifica que el puerto 5173 no esté en uso:
   ```bash
   # En Linux/macOS
   lsof -i :5173

   # En Windows
   netstat -ano | findstr :5173
   ```

2. Si el puerto está en uso, puedes usar otro:
   ```bash
   yarn dev --port 5174
   ```

3. Verifica que todas las dependencias están instaladas:
   ```bash
   yarn install
   ```

## Problemas de CORS

**Problema:** Errores de CORS al intentar comunicarse con la API desde el frontend.

**Soluciones:**
1. Verifica la configuración de CORS en `/backend/config/cors.php`:
   ```php
   'allowed_origins' => [
       'http://localhost:5173',
       'http://127.0.0.1:5173',
       'http://0.0.0.0:5173',
       // Agrega aquí cualquier otro origen que necesites
   ],
   ```

2. Asegúrate de que el servidor de Laravel está configurado correctamente:
   ```php
   // En config/cors.php
   'supports_credentials' => true,
   ```

3. Reinicia el servidor de Laravel después de modificar la configuración:
   ```bash
   pm2 restart vaxav-api
   # o
   php artisan serve
   ```

## Problemas de Autenticación

**Problema:** No puedes iniciar sesión o recibes errores de autenticación.

**Soluciones:**
1. Verifica que estás utilizando las credenciales correctas.

2. Asegúrate de que el token se está almacenando correctamente en localStorage:
   ```javascript
   // En la consola del navegador
   localStorage.getItem('auth_token')
   ```

3. Verifica que el token se está enviando en las cabeceras de las solicitudes:
   ```javascript
   // En el código
   api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
   ```

4. Limpia el localStorage y vuelve a iniciar sesión:
   ```javascript
   // En la consola del navegador
   localStorage.removeItem('auth_token');
   ```

5. Verifica que Sanctum está configurado correctamente:
   ```php
   // En config/sanctum.php
   'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,127.0.0.1')),
   ```

## Problemas con PM2

**Problema:** PM2 no funciona correctamente.

**Soluciones:**
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

4. Reinicia PM2:
   ```bash
   pm2 kill
   pm2 start ecosystem.config.js
   ```

## Problemas con la Base de Datos

**Problema:** Errores relacionados con la base de datos.

**Soluciones:**
1. Verifica que la base de datos existe y es accesible:
   ```bash
   # Para SQLite
   ls -la database/database.sqlite
   ```

2. Ejecuta las migraciones:
   ```bash
   php artisan migrate
   ```

3. Si necesitas empezar de cero, puedes restablecer la base de datos:
   ```bash
   php artisan migrate:fresh --seed
   ```

4. Verifica la configuración de la base de datos en `.env`:
   ```
   DB_CONNECTION=sqlite
   DB_DATABASE=/ruta/absoluta/a/tu/proyecto/api/database/database.sqlite
   ```

## Problemas con el Frontend

**Problema:** El frontend no se carga correctamente o muestra errores.

**Soluciones:**
1. Verifica que las dependencias están instaladas:
   ```bash
   cd frontend
   yarn install
   ```

2. Verifica que no hay errores en la consola del navegador (F12).

3. Limpia la caché del navegador o usa el modo incógnito.

4. Verifica que la URL de la API es correcta:
   ```javascript
   // En src/services/api.ts
   const api = axios.create({
     baseURL: 'http://localhost:8000/api',
     // ...
   });
   ```

## Problemas con el Backend

**Problema:** El backend no responde correctamente o muestra errores.

**Soluciones:**
1. Verifica que el servidor de Laravel está en ejecución:
   ```bash
   pm2 status
   ```

2. Verifica los logs para ver si hay errores:
   ```bash
   pm2 logs vaxav-api
   # o
   tail -f storage/logs/laravel.log
   ```

3. Prueba los endpoints directamente con curl o Postman:
   ```bash
   curl http://localhost:8000/api/user
   ```

4. Habilita el modo de depuración en Laravel:
   ```
   # En .env
   APP_DEBUG=true
   ```

## Problemas de Rendimiento

**Problema:** La aplicación es lenta o no responde.

**Soluciones:**
1. Verifica el uso de recursos:
   ```bash
   pm2 monit
   ```

2. Optimiza la configuración de PHP:
   ```
   # En php.ini
   memory_limit = 256M
   ```

3. Utiliza la caché de Laravel:
   ```bash
   php artisan config:cache
   php artisan route:cache
   ```

4. Optimiza las consultas a la base de datos utilizando índices y eager loading.

## Contacto para Soporte

Si no puedes resolver un problema con las soluciones anteriores, puedes:

1. Abrir un issue en el repositorio de GitHub
2. Contactar al equipo de desarrollo en [correo@ejemplo.com]
3. Buscar ayuda en la comunidad de Laravel o Vue.js
