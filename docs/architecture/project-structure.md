# Estructura del Proyecto Vaxav

Este documento describe la estructura general del proyecto Vaxav, explicando la organización de directorios y archivos.

## Visión General

El proyecto Vaxav está organizado en dos componentes principales:

1. **Backend (API)**: Una API RESTful desarrollada con Laravel 12
2. **Frontend**: Una aplicación SPA (Single Page Application) desarrollada con Vue.js 3

## Estructura de Directorios Raíz

```
vaxav/
├── api/                # Backend Laravel
├── frontend/           # Frontend Vue.js
├── docs/               # Documentación del proyecto
├── ecosystem.config.js # Configuración de PM2 (opcional)
└── README.md           # Documentación general
```

## Estructura del Backend (Laravel API)

```
api/
├── app/                # Código principal de la aplicación
│   ├── Console/        # Comandos de Artisan
│   ├── Exceptions/     # Manejadores de excepciones
│   ├── Http/           # Controladores, Middleware, Requests
│   │   ├── Controllers/# Controladores de la API
│   │   ├── Middleware/ # Middleware
│   │   └── Requests/   # Form Requests para validación
│   ├── Models/         # Modelos Eloquent
│   ├── Providers/      # Service Providers
│   └── Services/       # Servicios de la aplicación
├── bootstrap/          # Archivos de arranque
├── config/             # Archivos de configuración
├── database/           # Migraciones, factories y seeders
│   ├── factories/      # Factories para pruebas
│   ├── migrations/     # Migraciones de base de datos
│   └── seeders/        # Seeders para datos iniciales
├── public/             # Punto de entrada público
├── resources/          # Vistas y assets
├── routes/             # Definiciones de rutas
│   ├── api.php         # Rutas de la API
│   ├── channels.php    # Canales de broadcasting
│   ├── console.php     # Comandos de consola
│   └── web.php         # Rutas web
├── storage/            # Archivos generados por la aplicación
├── tests/              # Pruebas automatizadas
├── .env                # Variables de entorno
├── .env.example        # Ejemplo de variables de entorno
├── artisan             # CLI de Laravel
├── composer.json       # Dependencias de PHP
└── composer.lock       # Versiones exactas de dependencias
```

### Componentes Clave del Backend

#### Controladores

Los controladores se encuentran en `api/app/Http/Controllers/` y manejan las solicitudes HTTP. Los principales controladores son:

- `AuthController.php`: Maneja la autenticación (login, registro, logout)
- `PilotController.php`: Gestiona los pilotos
- `ShipController.php`: Gestiona las naves
- `MarketController.php`: Gestiona el mercado
- `UniverseController.php`: Gestiona el universo (regiones, constelaciones, sistemas)

#### Modelos

Los modelos se encuentran en `api/app/Models/` y representan las entidades de la base de datos:

- `User.php`: Usuarios del sistema
- `Pilot.php`: Pilotos controlados por los usuarios
- `Ship.php`: Naves espaciales
- `Region.php`: Regiones del universo
- `Constellation.php`: Constelaciones dentro de las regiones
- `SolarSystem.php`: Sistemas solares dentro de las constelaciones
- `Corporation.php`: Organizaciones de jugadores

#### Rutas

Las rutas de la API se definen en `api/routes/api.php` y están organizadas por grupos funcionales.

## Estructura del Frontend (Vue.js)

```
frontend/
├── public/             # Archivos estáticos públicos
├── src/                # Código fuente
│   ├── assets/         # Recursos estáticos (CSS, imágenes)
│   ├── components/     # Componentes Vue reutilizables
│   │   ├── layout/     # Componentes de layout
│   │   └── ui/         # Componentes de UI
│   ├── router/         # Configuración de rutas
│   ├── services/       # Servicios para comunicación con la API
│   ├── stores/         # Stores de Pinia para estado global
│   ├── views/          # Componentes de vista (páginas)
│   │   ├── auth/       # Vistas de autenticación
│   │   ├── market/     # Vistas del mercado
│   │   ├── pilot/      # Vistas de pilotos
│   │   ├── ships/      # Vistas de naves
│   │   └── universe/   # Vistas del universo
│   ├── App.vue         # Componente raíz
│   └── main.ts         # Punto de entrada
├── .env                # Variables de entorno
├── index.html          # Plantilla HTML
├── package.json        # Dependencias de JavaScript
├── tailwind.config.js  # Configuración de Tailwind CSS
├── tsconfig.json       # Configuración de TypeScript
└── vite.config.ts      # Configuración de Vite
```

### Componentes Clave del Frontend

#### Servicios

Los servicios se encuentran en `frontend/src/services/` y manejan la comunicación con la API:

- `api.ts`: Configuración base de Axios
- `authService.ts`: Servicios de autenticación
- `pilotService.ts`: Servicios relacionados con pilotos
- `shipService.ts`: Servicios relacionados con naves
- `marketService.ts`: Servicios relacionados con el mercado
- `universeService.ts`: Servicios relacionados con el universo

#### Stores

Los stores se encuentran en `frontend/src/stores/` y gestionan el estado global de la aplicación:

- `auth.ts`: Estado de autenticación
- `pilot.ts`: Estado del piloto actual
- `ships.ts`: Estado de las naves
- `market.ts`: Estado del mercado
- `universe.ts`: Estado del universo

#### Vistas

Las vistas se encuentran en `frontend/src/views/` y representan las páginas de la aplicación:

- `HomeView.vue`: Página principal
- `auth/LoginView.vue`: Página de inicio de sesión
- `auth/RegisterView.vue`: Página de registro
- `pilot/CreatePilotView.vue`: Página de creación de piloto
- `universe/UniverseView.vue`: Página del universo
- `ships/ShipsView.vue`: Página de naves
- `market/MarketView.vue`: Página del mercado

## Flujo de Datos

1. El usuario interactúa con la interfaz de usuario en el frontend
2. El frontend realiza solicitudes a la API a través de los servicios
3. La API procesa las solicitudes en los controladores
4. Los controladores interactúan con los modelos para acceder a la base de datos
5. La API devuelve respuestas JSON al frontend
6. El frontend actualiza el estado en los stores de Pinia
7. Los componentes Vue se actualizan automáticamente con los nuevos datos

## Convenciones de Nomenclatura

- **Controladores**: Singular, sufijo `Controller` (ej. `PilotController`)
- **Modelos**: Singular, primera letra mayúscula (ej. `Pilot`)
- **Migraciones**: Plural, snake_case (ej. `create_pilots_table`)
- **Componentes Vue**: PascalCase (ej. `PilotCard.vue`)
- **Archivos de servicio**: camelCase, sufijo `Service` (ej. `pilotService.ts`)
- **Stores**: camelCase (ej. `pilot.ts`)
