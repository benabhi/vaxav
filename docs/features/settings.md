# Sistema de Configuración

Este documento describe el sistema de configuración implementado en VAXAV, que permite almacenar y gestionar configuraciones de la aplicación en la base de datos.

## Índice

1. [Descripción General](#descripción-general)
2. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
3. [API de Configuración](#api-de-configuración)
4. [Interfaz de Usuario](#interfaz-de-usuario)
5. [Configuraciones Disponibles](#configuraciones-disponibles)
6. [Uso en el Frontend](#uso-en-el-frontend)
7. [Uso en el Backend](#uso-en-el-backend)

## Descripción General

El sistema de configuración permite almacenar valores de configuración en la base de datos, lo que facilita su modificación sin necesidad de cambiar el código fuente. Esto es especialmente útil para valores que pueden necesitar ajustes frecuentes, como los requisitos de experiencia para subir de nivel las habilidades.

## Estructura de la Base de Datos

La configuración se almacena en la tabla `settings` con la siguiente estructura:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único |
| name | string | Nombre único de la configuración |
| value | text | Valor de la configuración |
| type | string | Tipo de dato (string, int, json, etc.) |
| description | text | Descripción de la configuración |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de última actualización |

## API de Configuración

El sistema proporciona los siguientes endpoints para gestionar la configuración:

### Listar todas las configuraciones

```
GET /api/admin/settings
```

### Obtener una configuración por ID

```
GET /api/admin/settings/{id}
```

### Crear una nueva configuración

```
POST /api/admin/settings
```

Parámetros:
- `name`: Nombre único de la configuración
- `value`: Valor de la configuración
- `type`: Tipo de dato (string, int, json, etc.)
- `description`: Descripción de la configuración (opcional)

### Actualizar una configuración existente

```
PUT /api/admin/settings/{id}
```

Parámetros:
- `name`: Nombre único de la configuración (opcional)
- `value`: Valor de la configuración (opcional)
- `type`: Tipo de dato (opcional)
- `description`: Descripción de la configuración (opcional)

### Eliminar una configuración

```
DELETE /api/admin/settings/{id}
```

### Obtener una configuración por nombre

```
GET /api/admin/settings/name/{name}
```

### Actualizar una configuración por nombre

```
PUT /api/admin/settings/name/{name}
```

Parámetros:
- `value`: Valor de la configuración
- `type`: Tipo de dato
- `description`: Descripción de la configuración (opcional)

## Interfaz de Usuario

La configuración se puede gestionar desde el panel de administración en la sección "Configuración". La interfaz proporciona formularios para editar las diferentes configuraciones disponibles.

## Configuraciones Disponibles

### Requisitos de XP para Habilidades (x1xp)

Esta configuración almacena los requisitos de experiencia para cada nivel de habilidad con multiplicador x1. El valor se almacena como un array JSON con los siguientes valores:

```json
[50, 150, 300, 600, 1000]
```

Donde:
- Índice 0: XP necesario para pasar de nivel 0 a nivel 1
- Índice 1: XP necesario para pasar de nivel 1 a nivel 2
- Índice 2: XP necesario para pasar de nivel 2 a nivel 3
- Índice 3: XP necesario para pasar de nivel 3 a nivel 4
- Índice 4: XP necesario para pasar de nivel 4 a nivel 5

## Uso en el Frontend

Para usar la configuración en el frontend, se han actualizado las funciones en `skillLevels.ts` para obtener los valores desde la API:

```typescript
import { getXPRequirements, getNextLevelXP, getProgressPercentage } from '@/config/skillLevels';

// Obtener los requisitos de XP
const xpRequirements = await getXPRequirements();

// Calcular el XP necesario para el siguiente nivel
const nextLevelXP = getNextLevelXP(currentLevel, multiplier, xpRequirements);

// Calcular el porcentaje de progreso
const progress = getProgressPercentage(currentXP, currentLevel, multiplier, xpRequirements);
```

## Uso en el Backend

Para usar la configuración en el backend, se utiliza el modelo `Setting` y el servicio `SkillService`:

```php
// Usando el modelo Setting directamente
$xpSetting = Setting::where('name', 'x1xp')->first();
$xpRequirements = json_decode($xpSetting->value, true);

// Usando el servicio SkillService
$xpRequirements = $this->skillService->getXpRequirements();
$minXp = $this->skillService->getMinXpForLevel($level, $multiplier);
```

## Implementación

La implementación del sistema de configuración incluye:

1. **Modelo `Setting`**: Proporciona métodos para obtener y establecer valores de configuración.
2. **Controlador `SettingController`**: Gestiona las operaciones CRUD para la configuración.
3. **Servicio `SkillService`**: Proporciona métodos para obtener y calcular valores relacionados con XP.
4. **Vista `SettingsView.vue`**: Proporciona una interfaz para editar la configuración.
5. **Archivo `skillLevels.ts`**: Proporciona funciones para obtener y utilizar la configuración en el frontend.

## Consideraciones de Rendimiento

Para mejorar el rendimiento, se implementa un sistema de caché en el frontend para evitar consultas innecesarias a la API:

```typescript
// Variable para almacenar en caché los requisitos de XP
let cachedXPRequirements: XPRequirements | null = null;

// Obtiene los requisitos de XP, utilizando la caché si está disponible
export async function getXPRequirements(): Promise<XPRequirements> {
  if (!cachedXPRequirements) {
    cachedXPRequirements = await fetchXPRequirements();
  }
  return cachedXPRequirements;
}
```

## Futuras Mejoras

1. **Caché en el Backend**: Implementar un sistema de caché en el backend para mejorar el rendimiento.
2. **Más Configuraciones**: Añadir más configuraciones al sistema, como multiplicadores, niveles máximos, etc.
3. **Validación Avanzada**: Implementar validación avanzada para los valores de configuración.
4. **Historial de Cambios**: Implementar un sistema para registrar los cambios en la configuración.
5. **Exportación/Importación**: Permitir exportar e importar configuraciones.
