# Vaxav - Guía de Instalación para Windows

Esta guía está específicamente diseñada para usuarios de Windows que quieren desarrollar Vaxav usando PowerShell.

## 📋 Prerrequisitos

### 1. Docker Desktop para Windows

1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
2. Instala siguiendo el asistente
3. Reinicia tu computadora si es necesario
4. Abre Docker Desktop y espera a que se inicie completamente
5. Verifica que está funcionando:
   ```powershell
   docker --version
   docker-compose --version
   ```

### 2. Git para Windows

1. Descarga Git desde: https://git-scm.com/download/win
2. Instala con las opciones por defecto
3. Verifica la instalación:
   ```powershell
   git --version
   ```

### 3. PowerShell

Windows 10/11 ya incluye PowerShell. Verifica tu versión:
```powershell
$PSVersionTable.PSVersion
```

Deberías tener al menos PowerShell 5.1 o superior.

## 🚀 Instalación Rápida

### Paso 1: Clonar el repositorio

Abre PowerShell y ejecuta:

```powershell
cd Desktop
git clone https://github.com/benabhi/vaxav.git
cd vaxav
```

### Paso 2: Verificar Docker

Asegúrate de que Docker Desktop esté corriendo:

```powershell
docker ps
```

Si ves una tabla (aunque esté vacía), Docker está funcionando correctamente.

### Paso 3: Ejecutar el setup

```powershell
.\setup.ps1
```

Este script hará todo automáticamente:
- ✅ Copiar archivo de configuración
- ✅ Construir contenedores Docker
- ✅ Levantar servicios
- ✅ Instalar dependencias
- ✅ Configurar Laravel
- ✅ Ejecutar migraciones

**Nota:** La primera vez puede tardar 10-15 minutos en descargar todas las imágenes Docker.

### Paso 4: Verificar instalación

Abre tu navegador en: http://localhost:8080

¡Deberías ver la aplicación funcionando! 🎉

## 🎮 Comandos Principales

### Iniciar el proyecto

```powershell
.\start.ps1
```

### Detener el proyecto

```powershell
.\stop.ps1
```

### Limpiar caché de Laravel

```powershell
.\clean.ps1
```

### Ver logs en tiempo real

```powershell
docker-compose logs -f
```

Presiona `Ctrl+C` para salir de los logs.

### Entrar al contenedor

```powershell
docker-compose exec app bash
```

Dentro del contenedor puedes ejecutar comandos de Laravel:
```bash
php artisan --version
php artisan migrate
php artisan db:seed
exit  # Para salir del contenedor
```

## 🔧 Comandos Útiles de Laravel

Todos estos comandos se ejecutan dentro del contenedor:

```powershell
# Ejecutar migraciones
docker-compose exec app php artisan migrate

# Revertir última migración
docker-compose exec app php artisan migrate:rollback

# Ejecutar seeders
docker-compose exec app php artisan db:seed

# Crear nueva migración
docker-compose exec app php artisan make:migration create_pilots_table

# Crear modelo
docker-compose exec app php artisan make:model Pilot

# Crear controlador
docker-compose exec app php artisan make:controller PilotController

# Ejecutar tests
docker-compose exec app php artisan test

# Ver rutas
docker-compose exec app php artisan route:list
```

## 🗄️ Acceder a la Base de Datos

### Desde el contenedor

```powershell
docker-compose exec db psql -U vaxav -d vaxav
```

Comandos PostgreSQL útiles:
```sql
\dt              -- Listar tablas
\d pilots        -- Describir tabla pilots
SELECT * FROM pilots;
\q               -- Salir
```

### Desde tu PC (usando herramientas GUI)

Puedes usar herramientas como:
- **DBeaver** (gratis): https://dbeaver.io/download/
- **pgAdmin** (gratis): https://www.pgadmin.org/download/
- **TablePlus** (gratis con limitaciones): https://tableplus.com/

Configuración de conexión:
- **Host:** localhost
- **Puerto:** 5432
- **Base de datos:** vaxav
- **Usuario:** vaxav
- **Contraseña:** secret

## 🐛 Solución de Problemas

### Error: "Docker is not running"

**Solución:** Abre Docker Desktop y espera a que se inicie completamente (el ícono en la barra de tareas debe estar quieto).

### Error: "Port 8080 is already in use"

**Solución:** Otro programa está usando el puerto 8080. Puedes:

1. Cerrar la aplicación que usa el puerto
2. O cambiar el puerto en `docker-compose.yml`:
   ```yaml
   web:
     ports:
       - "8081:80"  # Cambiar 8080 a 8081
   ```

### Error: "Cannot connect to database"

**Solución:**
1. Asegúrate de que todos los contenedores estén corriendo:
   ```powershell
   docker-compose ps
   ```
2. Reinicia los servicios:
   ```powershell
   .\stop.ps1
   .\start.ps1
   ```

### Los cambios en el código no se reflejan

**Solución:** Limpia el caché de Laravel:
```powershell
.\clean.ps1
```

### Error de permisos en PowerShell

**Solución:** Si recibes un error sobre "ejecución de scripts deshabilitada", ejecuta:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## 📁 Estructura de Archivos (Windows)

```
C:\Users\TuUsuario\Desktop\vaxav\
├── .env                        # Tu configuración (no se sube a Git)
├── .env.example                # Plantilla de configuración
├── setup.ps1                   # ⭐ Setup inicial
├── start.ps1                   # ⭐ Iniciar proyecto
├── stop.ps1                    # ⭐ Detener proyecto
├── clean.ps1                   # ⭐ Limpiar caché
├── docker-compose.yml          # Configuración de servicios
├── app\                        # Código de Laravel
├── database\                   # Migraciones y seeders
├── resources\                  # Vistas y assets
├── public\                     # Archivos públicos
└── storage\                    # Archivos generados
```

## 🎨 Desarrollo de Frontend

### Compilar assets en desarrollo

```powershell
docker-compose exec app npm run dev
```

### Compilar assets para producción

```powershell
docker-compose exec app npm run build
```

### Modo watch (recompila automáticamente)

```powershell
docker-compose exec app npm run dev -- --watch
```

## 📊 Monitoreo

### Ver estado de contenedores

```powershell
docker-compose ps
```

### Ver uso de recursos

```powershell
docker stats
```

### Ver logs de un servicio específico

```powershell
docker-compose logs -f app      # Laravel
docker-compose logs -f db       # PostgreSQL
docker-compose logs -f redis    # Redis
docker-compose logs -f queue    # Queue Worker
```

## 🔄 Actualizar el Proyecto

Cuando hay cambios en el repositorio:

```powershell
# Detener servicios
.\stop.ps1

# Obtener últimos cambios
git pull

# Reconstruir contenedores (si hay cambios en Docker)
docker-compose build

# Iniciar servicios
.\start.ps1

# Ejecutar migraciones nuevas
docker-compose exec app php artisan migrate

# Limpiar caché
.\clean.ps1
```

## 💡 Tips para Desarrollo

1. **Usa Visual Studio Code**
   - Descarga: https://code.visualstudio.com/
   - Extensiones recomendadas:
     - Laravel Extension Pack
     - PHP Intelephense
     - Docker
     - GitLens

2. **Abre el proyecto en VS Code**
   ```powershell
   code .
   ```

3. **Terminal integrada**
   VS Code tiene una terminal integrada (`` Ctrl+` ``) donde puedes ejecutar comandos PowerShell.

4. **Hot Reload**
   Los cambios en archivos PHP se aplican automáticamente gracias a los volúmenes de Docker.

## 🆘 Ayuda Adicional

- **Documentación completa:** Ver `PRD/` folder
- **Próximos pasos:** Ver `NEXT_STEPS.md`
- **Estado del proyecto:** Ver `PROJECT_STATUS.md`
- **Cambios:** Ver `CHANGELOG.md`

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía
2. Revisa los logs: `docker-compose logs -f`
3. Abre un issue en GitHub: https://github.com/benabhi/vaxav/issues

---

**¡Bienvenido a Vaxav! 🚀**
