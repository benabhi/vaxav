# 🚀 Vaxav Game - Juego Web con Paneles Dinámicos

Proyecto de juego web desarrollado con Laravel 12, React, Inertia.js, y Golden Layout para paneles dinámicos. El juego simula la experiencia de un piloto espacial con naves, sistemas estelares y exploración.

## 📋 Stack Tecnológico

- **Backend**: Laravel 12 (PHP 8.2)
- **Frontend**: React 18 + Inertia.js 2
- **Estilos**: Tailwind CSS 4
- **Paneles Dinámicos**: Golden Layout 2
- **Base de Datos**: PostgreSQL 16
- **Cache/Sesiones**: Redis 7
- **Servidor Web**: Nginx (Alpine)
- **Contenedores**: Docker + Docker Compose

## 🎯 Características

- ✅ Interfaz con paneles dinámicos y reorganizables
- ✅ Sistema de inventario, estadísticas, mapa y chat
- ✅ Hot Module Replacement (HMR) para desarrollo rápido
- ✅ Arquitectura limpia con separación de contenedores
- ✅ Entorno reproducible con Docker
- ✅ Scripts PowerShell para automatización en Windows

## 🚦 Requisitos Previos

- **Docker Desktop** instalado y ejecutándose
- **Git** (para clonar el repositorio)
- **PowerShell** (incluido en Windows)

## 📦 Instalación Rápida

### Primera vez (Setup completo):

```powershell
# 1. Clonar el repositorio
git clone <tu-repositorio> vaxav
cd vaxav

# 2. Ejecutar setup automático
.\scripts\setup.ps1
```

El script `setup.ps1` realizará automáticamente:
- ✓ Verificación de Docker Desktop
- ✓ Creación del archivo `.env`
- ✓ Construcción de contenedores Docker
- ✓ Instalación de dependencias (Composer + NPM)
- ✓ Generación de clave de aplicación
- ✓ Ejecución de migraciones
- ✓ Compilación de assets

### Uso diario:

```powershell
# Iniciar el entorno
.\scripts\start.ps1

# Detener el entorno
.\scripts\stop.ps1

# Detener y limpiar datos
.\scripts\stop.ps1 -Clean
```

## 🌐 Acceso a la Aplicación

Una vez iniciado el entorno:

- **Aplicación Web**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🛠️ Comandos Útiles

### Desarrollo Frontend (HMR):
```powershell
docker-compose exec app npm run dev
```

### Ejecutar comandos Artisan:
```powershell
docker-compose exec app php artisan <comando>
```

### Ejecutar migraciones:
```powershell
docker-compose exec app php artisan migrate
```

### Instalar paquetes PHP:
```powershell
docker-compose exec app composer require <paquete>
```

### Instalar paquetes NPM:
```powershell
docker-compose exec app npm install <paquete>
```

### Acceder al contenedor:
```powershell
docker-compose exec app bash
```

### Ver logs:
```powershell
docker-compose logs -f
docker-compose logs -f app
docker-compose logs -f nginx
```

## 📁 Estructura del Proyecto

```
vaxav/
├── docker/                      # Configuración Docker
│   ├── nginx/                  # Configuración Nginx
│   └── php/                    # Dockerfile PHP
├── scripts/                     # Scripts PowerShell
│   ├── setup.ps1               # Setup inicial
│   ├── start.ps1               # Iniciar entorno
│   └── stop.ps1                # Detener entorno
├── src/                         # Código Laravel
│   ├── app/                    # Lógica de aplicación
│   ├── resources/
│   │   ├── js/
│   │   │   ├── Components/     # Componentes React
│   │   │   ├── Pages/          # Páginas Inertia
│   │   │   └── app.jsx         # Entry point React
│   │   └── css/
│   ├── routes/                 # Rutas de la aplicación
│   └── ...
├── docker-compose.yml          # Orquestación de servicios
├── .env.example                # Variables de entorno template
└── README.md                   # Este archivo
```

## 🎮 Desarrollo del Juego

### Agregar Nuevos Paneles

1. Crear componente en `src/resources/js/Components/`:
```jsx
const MiNuevoPanel = () => {
    return (
        <div className="p-4 h-full bg-gray-900 text-white">
            {/* Tu contenido */}
        </div>
    );
};
```

2. Registrar en `Game.jsx`:
```jsx
const components = {
    miPanel: MiNuevoPanel,
    // ... otros paneles
};
```

3. Agregar a la configuración del layout:
```jsx
{
    type: 'component',
    componentType: 'miPanel',
    title: 'Mi Nuevo Panel',
}
```

### Integración con Laravel

Usa Inertia.js para pasar datos desde Laravel a React:

```php
// En el controlador
return Inertia::render('Game', [
    'player' => $player,
    'ships' => $ships,
]);
```

```jsx
// En el componente React
export default function Game({ player, ships }) {
    // Usar props directamente
}
```

## 🐛 Troubleshooting

### Docker Desktop no inicia:
- Verifica que la virtualización esté habilitada en BIOS
- Reinicia el servicio de Docker Desktop

### Puerto 8000 ya está en uso:
```powershell
# Cambiar puerto en docker-compose.yml
ports:
  - "8080:80"  # Cambia 8000 por otro puerto
```

### Los cambios no se reflejan:
```powershell
# Limpiar cache y rebuild
docker-compose down
docker-compose up -d --build
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan cache:clear
```

### Error de permisos en Linux/Mac:
```bash
# Ajustar USER_ID y GROUP_ID en docker-compose.yml
args:
  USER_ID: 1000
  GROUP_ID: 1000
```

### Problemas con NPM:
```powershell
# Limpiar node_modules y reinstalar
docker-compose exec app rm -rf node_modules package-lock.json
docker-compose exec app npm install
```

## 🔧 Configuración Avanzada

### Variables de Entorno

Edita `src/.env` para personalizar:

- `APP_NAME`: Nombre de la aplicación
- `DB_*`: Credenciales de base de datos
- `REDIS_*`: Configuración de Redis
- `VITE_*`: Variables accesibles en frontend

### Tailwind CSS

Configuración en `src/tailwind.config.js`. Agrega tus propios estilos personalizados.

### Golden Layout

Documentación completa: https://github.com/golden-layout/golden-layout

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Soporte

Si encuentras algún problema o tienes preguntas, por favor abre un issue en el repositorio.

---

**¡Feliz desarrollo! 🚀**
