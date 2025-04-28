# Uso de PM2 en Vaxav

PM2 es un gestor de procesos para Node.js que nos permite ejecutar y mantener aplicaciones en segundo plano. Esta guía te ayudará a utilizar PM2 para gestionar los servicios de Vaxav.

## Instalación de PM2

Antes de comenzar, necesitas instalar PM2 globalmente:

```bash
# Usando npm
npm install -g pm2

# Usando yarn
yarn global add pm2
```

Verifica la instalación:

```bash
pm2 --version
```

## Comandos Básicos de PM2

### Iniciar Servicios

Para iniciar los servicios de Vaxav con PM2:

```bash
# Desde la raíz del proyecto
# Inicia el servidor de Laravel
pm2 start "cd backend && php artisan serve --host=0.0.0.0 --port=8000" --name vaxav-backend

# Inicia el servidor de Vue.js
pm2 start "cd frontend && yarn dev --host 0.0.0.0 --port 5173" --name vaxav-frontend
```

### Ver Estado de los Servicios

Para ver el estado de todos los servicios gestionados por PM2:

```bash
pm2 status
```

Esto mostrará una tabla con información sobre cada servicio, incluyendo:
- ID del proceso
- Nombre
- Modo
- Estado (online, stopped, errored)
- Uso de CPU
- Uso de memoria

### Ver Logs

Para ver los logs de todos los servicios:

```bash
pm2 logs
```

Para ver los logs de un servicio específico:

```bash
pm2 logs vaxav-backend
pm2 logs vaxav-frontend
```

Para ver solo los últimos N líneas de logs:

```bash
pm2 logs --lines 200
```

### Reiniciar Servicios

Para reiniciar todos los servicios:

```bash
pm2 restart all
```

Para reiniciar un servicio específico:

```bash
pm2 restart vaxav-backend
pm2 restart vaxav-frontend
```

### Detener Servicios

Para detener todos los servicios:

```bash
pm2 stop all
```

Para detener un servicio específico:

```bash
pm2 stop vaxav-backend
pm2 stop vaxav-frontend
```

### Eliminar Servicios

Para eliminar todos los servicios de PM2 (esto no elimina los archivos, solo los procesos):

```bash
pm2 delete all
```

Para eliminar un servicio específico:

```bash
pm2 delete vaxav-backend
pm2 delete vaxav-frontend
```

## Configuración Avanzada con ecosystem.config.js

Para una gestión más avanzada, puedes crear un archivo `ecosystem.config.js` en la raíz del proyecto:

```javascript
module.exports = {
  apps: [
    {
      name: 'vaxav-backend',
      cwd: './backend',
      script: 'php',
      args: 'artisan serve --host=0.0.0.0 --port=8000',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      }
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
      env_production: {
        NODE_ENV: 'production',
      }
    },
  ],
};
```

Luego puedes iniciar todos los servicios con:

```bash
pm2 start ecosystem.config.js
```

Para iniciar en modo producción:

```bash
pm2 start ecosystem.config.js --env production
```

## Monitoreo con PM2

PM2 proporciona una interfaz web para monitorear tus aplicaciones:

```bash
pm2 plus
```

Esto te llevará a una página web donde puedes registrarte para usar PM2 Plus, que ofrece monitoreo avanzado.

## Configuración para Inicio Automático

Para configurar PM2 para que inicie automáticamente cuando el sistema arranque:

```bash
pm2 startup
```

Sigue las instrucciones que aparecen en pantalla.

Después de configurar los servicios como deseas, guarda la configuración actual:

```bash
pm2 save
```

## Solución de Problemas con PM2

### PM2 no está en el PATH

Si recibes un error de "comando no encontrado", puedes usar la ruta completa:

```bash
~/.npm-global/bin/pm2 status
# o
~/.yarn/bin/pm2 status
```

### Servicios que Fallan al Iniciar

Si un servicio falla al iniciar, verifica los logs:

```bash
pm2 logs vaxav-backend
```

### Reinicio de Servicios

Si necesitas reiniciar un servicio con una configuración diferente:

```bash
pm2 delete vaxav-backend
pm2 start "cd backend && php artisan serve --host=0.0.0.0 --port=8000" --name vaxav-backend
```

### Actualización de PM2

Para actualizar PM2 a la última versión:

```bash
npm install -g pm2@latest
# o
yarn global add pm2@latest
```

## Recursos Adicionales

- [Documentación oficial de PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 en GitHub](https://github.com/Unitech/pm2)
