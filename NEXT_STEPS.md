# Próximos Pasos - Vaxav

## Estado Actual del Proyecto

✅ Estructura inicial creada
✅ Docker configurado (PHP 8.2, PostgreSQL, Redis, Nginx)
✅ Repositorio Git inicializado
✅ Primer commit realizado
✅ Push a GitHub completado

## Siguientes Pasos para Continuar el Desarrollo

### 1. Instalar Laravel

El proyecto tiene la estructura base, pero necesita instalar Laravel completo. Ejecuta:

```bash
# Construir contenedores
docker-compose build

# Levantar contenedores
docker-compose up -d

# Instalar Laravel fresh en el contenedor
docker-compose exec app composer create-project laravel/laravel:^10.0 temp
docker-compose exec app sh -c "mv temp/* temp/.* . 2>/dev/null || true && rm -rf temp"

# O alternativamente, instalar dependencias del composer.json actual
docker-compose exec app composer install

# Copiar .env
docker-compose exec app cp .env.example .env

# Generar application key
docker-compose exec app php artisan key:generate

# Verificar que funciona
# Visita: http://localhost:8080
```

### 2. Configurar Base de Datos

```bash
# Ejecutar migraciones (cuando estén creadas)
docker-compose exec app php artisan migrate

# Ejecutar seeders (cuando estén creados)
docker-compose exec app php artisan db:seed
```

### 3. Estructura de Desarrollo Recomendada

#### Fase 1: Sistema Base
1. Crear migraciones para las tablas principales:
   - game_config
   - users
   - pilots
   - factions
   - solar_systems
   - planets
   - moons
   - stations

2. Crear modelos Eloquent correspondientes

3. Crear seeders con datos iniciales:
   - Configuración del juego (game_config)
   - 4 facciones NPC
   - Sistema Vaxav inicial
   - Estaciones básicas

#### Fase 2: Autenticación y Registro
1. Implementar registro de usuario
2. Creación de piloto con nombre aleatorio
3. Selección de carrera inicial
4. Dashboard básico

#### Fase 3: Sistema de Habilidades
1. Crear migración y seeders para skills
2. Implementar sistema de inyección
3. Panel de habilidades
4. Sistema de experiencia

#### Fase 4: Navegación y Mundo
1. Implementar navegación entre sistemas/planetas/lunas
2. Vista de mapa
3. Información de ubicaciones

#### Fase 5: Economía Básica
1. Sistema de inventario
2. Items básicos
3. Mercado simple

## Comandos Útiles para Desarrollo

### Artisan Commands a Crear

```bash
# Procesamiento de ticks
php artisan game:process-tick

# Limpiar cache
php artisan cache:clear

# Optimizar
php artisan optimize

# Crear migración
php artisan make:migration create_pilots_table

# Crear modelo
php artisan make:model Pilot

# Crear seeder
php artisan make:seeder FactionsSeeder

# Crear controller
php artisan make:controller PilotController
```

### Docker Commands

```bash
# Ver logs
docker-compose logs -f

# Entrar al contenedor
docker-compose exec app bash

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Ver estado
docker-compose ps
```

## Estructura de Carpetas a Crear

```
app/
├── Console/
│   └── Commands/
│       └── ProcessTick.php          # Comando principal de ticks
├── GameSystems/                      # Sistema del juego
│   ├── Careers/
│   │   ├── CareerInterface.php
│   │   ├── MinerCareer.php
│   │   ├── BountyHunterCareer.php
│   │   ├── SmuglerCareer.php
│   │   └── TransporterCareer.php
│   ├── Skills/
│   │   └── SkillService.php
│   ├── Combat/
│   │   └── CombatEngine.php
│   ├── Navigation/
│   │   └── NavigationService.php
│   └── Economy/
│       └── MarketService.php
├── Http/
│   ├── Controllers/
│   │   ├── Auth/
│   │   ├── PilotController.php
│   │   ├── SkillsController.php
│   │   ├── MarketController.php
│   │   └── NavigationController.php
│   └── Middleware/
├── Models/
│   ├── User.php
│   ├── Pilot.php
│   ├── Faction.php
│   ├── Skill.php
│   ├── SolarSystem.php
│   ├── Planet.php
│   ├── Moon.php
│   ├── Station.php
│   ├── Ship.php
│   └── Item.php
└── Services/
    ├── GameConfigService.php
    └── TickProcessorService.php

database/
├── migrations/
├── seeders/
│   ├── GameConfigSeeder.php
│   ├── FactionsSeeder.php
│   ├── SkillsSeeder.php
│   ├── SolarSystemSeeder.php
│   └── CareerSeeder.php
└── factories/

resources/
├── views/
│   ├── layouts/
│   │   └── app.blade.php
│   ├── auth/
│   ├── dashboard/
│   ├── pilot/
│   ├── skills/
│   └── market/
├── css/
│   └── app.css
└── js/
    └── app.js

routes/
├── web.php
└── api.php
```

## Prioridades de Desarrollo

### Sprint 1: Fundamentos (1-2 semanas)
- [ ] Instalar Laravel completo
- [ ] Crear todas las migraciones principales
- [ ] Seeders con datos iniciales
- [ ] Sistema de autenticación
- [ ] Creación de piloto

### Sprint 2: Sistema de Ticks (1 semana)
- [ ] Tabla game_config
- [ ] Comando artisan game:process-tick
- [ ] Laravel Scheduler configurado
- [ ] Queue system funcionando

### Sprint 3: Habilidades (1-2 semanas)
- [ ] Sistema completo de skills
- [ ] Inyección de habilidades
- [ ] Panel de habilidades
- [ ] Experiencia y progreso

### Sprint 4: Navegación (1 semana)
- [ ] Sistema de navegación
- [ ] Mapa visual
- [ ] Información de ubicaciones

### Sprint 5: Economía (2 semanas)
- [ ] Items e inventario
- [ ] Mercado básico
- [ ] Transacciones

## Recursos de la Documentación

Toda la documentación completa está en `PRD/`:
- Arquitectura: `PRD/PRD-TechnicalArchitecture.md`
- Esquemas SQL: Líneas 159-1163 del archivo de arquitectura
- Game Design: `PRD/PRD-GameDesign.md`

## Testing

Crear tests desde el inicio:

```bash
# Feature test
php artisan make:test PilotCreationTest

# Unit test
php artisan make:test --unit SkillServiceTest

# Ejecutar tests
php artisan test
```

## Notas Importantes

1. **JSONB en PostgreSQL**: Usar para atributos dinámicos (metadata, config, bonuses)
2. **Redis**: Configurado para cache, sesiones y queues
3. **Queue System**: Esencial para procesamiento de ticks
4. **Scheduler**: Debe correr cada minuto en producción
5. **Migrations**: Crear en orden de dependencias (usar foreign keys)

## Contacto y Recursos

- Repositorio: https://github.com/benabhi/vaxav
- Documentación Laravel: https://laravel.com/docs/10.x
- PostgreSQL Docs: https://www.postgresql.org/docs/15/
