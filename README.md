# Vaxav

Juego web masivo asíncrono de ciencia ficción tipo sandbox. Un universo persistente donde los jugadores pueden combatir, recolectar recursos, comerciar, fabricar y formar alianzas en una economía completamente dirigida por jugadores.

## Stack Tecnológico

- **Backend:** PHP 8.2+ / Laravel 10+
- **Frontend:** Blade Templates, Tailwind CSS 3+, Alpine.js 3+
- **Base de Datos:** PostgreSQL 15+
- **Caché/Sesiones:** Redis
- **Web Server:** Nginx
- **Containerización:** Docker + Docker Compose

## Características Principales

- Sistema de ticks configurable (10 minutos por defecto)
- Economía 100% dirigida por jugadores
- Sistema de habilidades con inyección
- 5 clases de naves (Fragatas, Cruceros, Acorazados, Cargueros, Capitales)
- Sistema de combate PvE/PvP
- Corporaciones y alianzas de jugadores
- Exploración espacial y generación procedural
- Estaciones espaciales con módulos upgradables
- Sistema social completo (energía, nutrición, moral, estrés)

## Requisitos

- Docker Desktop (Windows/Mac) o Docker + Docker Compose (Linux)
- Git
- PowerShell (Windows) o Bash (Linux/Mac)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/benabhi/vaxav.git
cd vaxav
```

### 2. Ejecutar setup inicial

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x setup.sh
./setup.sh
```

Este script hará:
- Copiar `.env.example` a `.env`
- Construir contenedores Docker
- Instalar dependencias de Composer
- Generar application key
- Ejecutar migraciones
- Ejecutar seeders
- Compilar assets

### 3. Acceder a la aplicación

Abre tu navegador en: http://localhost:8080

## Comandos Útiles

### Iniciar servicios

**Windows:**
```powershell
.\start.ps1
```

**Linux/Mac:**
```bash
./start.sh
```

### Detener servicios

**Windows:**
```powershell
.\stop.ps1
```

**Linux/Mac:**
```bash
./stop.sh
```

### Limpiar caché

**Windows:**
```powershell
.\clean.ps1
```

**Linux/Mac:**
```bash
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear
docker-compose exec app php artisan view:clear
```

### Ver logs

```bash
docker-compose logs -f
```

### Entrar al contenedor de la aplicación

```bash
docker-compose exec app bash
```

### Ejecutar migraciones

```bash
docker-compose exec app php artisan migrate
```

### Ejecutar seeders

```bash
docker-compose exec app php artisan db:seed
```

### Ejecutar tests

```bash
docker-compose exec app php artisan test
```

## Servicios Docker

El proyecto incluye los siguientes servicios:

- **app** - Aplicación Laravel (PHP-FPM)
- **web** - Nginx web server (puerto 8080)
- **db** - PostgreSQL database (puerto 5432)
- **redis** - Redis server (puerto 6379)
- **queue** - Laravel queue worker
- **scheduler** - Laravel task scheduler

## Estructura del Proyecto

```
vaxav/
├── app/                    # Código de la aplicación Laravel
├── bootstrap/              # Archivos de bootstrap
├── docker/                 # Configuración de Docker
│   ├── nginx/             # Configuración de Nginx
│   └── php/               # Dockerfile de PHP
├── public/                 # Archivos públicos
├── resources/              # Vistas, assets, lang
├── storage/                # Archivos generados
├── PRD/                    # Documentación del proyecto
├── docker-compose.yml      # Configuración de servicios
├── setup.ps1 / setup.sh   # Scripts de setup inicial
├── start.ps1 / start.sh   # Scripts para iniciar servicios
├── stop.ps1 / stop.sh     # Scripts para detener servicios
├── clean.ps1              # Script para limpiar caché (Windows)
└── README.md              # Este archivo
```

## Documentación

La documentación completa del proyecto se encuentra en la carpeta `PRD/`:

- [PRD Master](./PRD/PRD-Master.md) - Índice principal
- [Arquitectura Técnica](./PRD/PRD-TechnicalArchitecture.md) - Stack y base de datos
- [Game Design](./PRD/PRD-GameDesign.md) - Mecánicas del juego
- [Universo](./PRD/PRD-Universe.md) - Mundo del juego
- [Naves y Combate](./PRD/PRD-ShipsAndCombat.md) - Sistema de naves
- [Economía](./PRD/PRD-Economy.md) - Sistema económico
- [Sistema Social](./PRD/PRD-SocialSystem.md) - Atributos y relaciones
- [Interfaz](./PRD/PRD-Interface.md) - UI/UX
- [Seguridad](./PRD/PRD-SecurityAndQuality.md) - Seguridad y calidad

## Desarrollo

### Base de datos

PostgreSQL está configurado con:
- Host: db (dentro de Docker) / localhost (desde tu máquina)
- Puerto: 5432
- Database: vaxav
- Usuario: vaxav
- Password: secret

### Redis

Redis está configurado en:
- Host: redis (dentro de Docker) / localhost (desde tu máquina)
- Puerto: 6379

### Variables de entorno

Edita el archivo `.env` para cambiar configuraciones:

```env
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=vaxav
DB_USERNAME=vaxav
DB_PASSWORD=secret

REDIS_HOST=redis
REDIS_PORT=6379

TICK_DURATION_MINUTES=10
TICK_ENABLED=true
```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Roadmap

### Fase 1: Fundamentos (MVP)
- Sistema de ticks
- Autenticación
- Creación de piloto
- Navegación básica

### Fase 2: Economía y Fabricación
- Minería
- Refinamiento
- Fabricación
- Mercado de jugadores

### Fase 3: Combate
- Sistema de combate PvE/PvP
- Doctrina de combate
- Clonación

### Fase 4: Social
- Corporaciones
- Alianzas
- Sistema social completo

### Fase 5: Expansión
- Generación procedural
- Stargates
- Nuevas facciones

### Fase 6: Endgame
- Conquista territorial
- Eventos globales
- Economía avanzada

## Licencia

Propietario - Todos los derechos reservados

## Contacto

Proyecto: [https://github.com/benabhi/vaxav](https://github.com/benabhi/vaxav)
