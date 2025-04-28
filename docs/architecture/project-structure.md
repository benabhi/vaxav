# Estructura del Proyecto Vaxav

Este documento describe la estructura general del proyecto Vaxav, explicando la organización de directorios y archivos.

## Visión General

El proyecto Vaxav está organizado en dos componentes principales:

1. **Backend (API)**: Una API RESTful desarrollada con Laravel 12
2. **Frontend**: Una aplicación SPA (Single Page Application) desarrollada con Vue.js 3

## Estructura de Directorios Raíz

```
vaxav/
├── backend/            # Backend Laravel
├── frontend/           # Frontend Vue.js
├── docs/               # Documentación del proyecto
├── ecosystem.config.js # Configuración de PM2 (opcional)
└── README.md           # Documentación general
```

## Estructura del Backend (Laravel)

```
backend/
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

Los controladores se encuentran en `backend/app/Http/Controllers/` y manejan las solicitudes HTTP. Los principales controladores son:

- `AuthController.php`: Maneja la autenticación (login, registro, logout)
- `Admin/UserController.php`: Gestiona los usuarios (CRUD)
- `Admin/RoleController.php`: Gestiona los roles y permisos
- `PilotController.php`: Gestiona los pilotos
- `ShipController.php`: Gestiona las naves
- `MarketController.php`: Gestiona el mercado
- `UniverseController.php`: Gestiona el universo (regiones, constelaciones, sistemas)

#### Middleware

Los middleware se encuentran en `backend/app/Http/Middleware/` y filtran las solicitudes HTTP:

- `CheckPermission.php`: Verifica si el usuario tiene el permiso requerido para acceder a una ruta

#### Modelos

Los modelos se encuentran en `backend/app/Models/` y representan las entidades de la base de datos:

- `User.php`: Usuarios del sistema
- `Role.php`: Roles de usuario
- `Permission.php`: Permisos para acciones específicas
- `Pilot.php`: Pilotos controlados por los usuarios
- `Ship.php`: Naves espaciales
- `Region.php`: Regiones del universo
- `Constellation.php`: Constelaciones dentro de las regiones
- `SolarSystem.php`: Sistemas solares dentro de las constelaciones
- `Corporation.php`: Organizaciones de jugadores

#### Rutas

Las rutas de la API se definen en `backend/routes/api.php` y están organizadas por grupos funcionales.

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

#### Componentes

Los componentes se encuentran en `frontend/src/components/` y están organizados por funcionalidad:

- `ui/`: Componentes de interfaz de usuario básicos
  - `buttons/`: Botones y controles de acción
  - `forms/`: Campos de formulario y controles relacionados
  - `modals/`: Componentes de ventanas modales
    - `BaseModal.vue`: Componente base para todos los modales
- `layout/`: Componentes de estructura (header, sidebar, etc.)

#### Servicios

Los servicios se encuentran en `frontend/src/services/` y manejan la comunicación con la API:

- `api.js`: Configuración base de Axios
- `authService.js`: Servicios de autenticación
- `pilotService.js`: Servicios relacionados con pilotos
- `shipService.js`: Servicios relacionados con naves
- `marketService.js`: Servicios relacionados con el mercado
- `universeService.js`: Servicios relacionados con el universo

#### Stores

Los stores se encuentran en `frontend/src/stores/` y gestionan el estado global de la aplicación:

- `auth.js`: Estado de autenticación y usuario actual
- `pilot.js`: Estado del piloto actual
- `ships.js`: Estado de las naves
- `market.js`: Estado del mercado
- `universe.js`: Estado del universo

#### Vistas

Las vistas se encuentran en `frontend/src/views/` y representan las páginas de la aplicación:

- `HomeView.vue`: Página principal
- `auth/LoginView.vue`: Página de inicio de sesión
- `auth/RegisterView.vue`: Página de registro
- `admin/UsersView.vue`: Gestión de usuarios
- `admin/RolesView.vue`: Gestión de roles y permisos
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
- **Archivos de servicio**: camelCase, sufijo `Service` (ej. `pilotService.js`)
- **Stores**: camelCase (ej. `pilot.js`)

## Sistema de Autenticación y Autorización

El sistema de autenticación y autorización de Vaxav utiliza Laravel Sanctum para la autenticación basada en tokens y un sistema personalizado de roles y permisos para la autorización.

### Componentes de Autenticación

- **Backend**:
  - `AuthController.php`: Maneja login, logout y obtención del usuario actual
  - `User.php`: Modelo de usuario con relaciones a roles
  - Middleware `auth:sanctum`: Protege rutas que requieren autenticación

- **Frontend**:
  - `auth.js`: Store que gestiona el estado de autenticación
  - `api.js`: Configura Axios para incluir el token en las solicitudes
  - `LoginView.vue`: Interfaz de inicio de sesión
  - `RegisterView.vue`: Interfaz de registro

### Componentes de Autorización

- **Backend**:
  - `Role.php`: Modelo que representa roles de usuario
  - `Permission.php`: Modelo que representa permisos específicos
  - `CheckPermission.php`: Middleware que verifica permisos
  - `RoleController.php`: Gestiona roles y permisos

- **Frontend**:
  - `RolesView.vue`: Interfaz para gestionar roles
  - `UsersView.vue`: Interfaz para asignar roles a usuarios

Para más detalles sobre el sistema de autenticación y autorización, consulte la [documentación específica](../auth/README.md).
