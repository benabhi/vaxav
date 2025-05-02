# API de Pilotos

Este documento describe los endpoints de la API relacionados con los pilotos en Vaxav.

## Visión General

La API de pilotos permite crear, obtener y actualizar información sobre los pilotos en el juego. Todos los endpoints requieren autenticación mediante token.

## Base URL

```
/api/pilots
```

## Endpoints

### Obtener Piloto Actual

Obtiene información sobre el piloto del usuario autenticado.

**Endpoint:** `GET /api/pilots/current`

**Autenticación:** Requerida

**Respuesta Exitosa (200 OK):**
```json
{
  "id": 1,
  "name": "Comandante Shepard",
  "race": "Humano",
  "credits": 10000.00,
  "user_id": 1,
  "corporation_id": null,
  "location_id": 1,
  "created_at": "2023-06-15T10:30:00.000000Z",
  "updated_at": "2023-06-15T10:30:00.000000Z"
}
```

**Respuesta de Error (404 Not Found):**
```json
{
  "message": "El usuario no tiene un piloto"
}
```

### Crear Piloto

Crea un nuevo piloto para el usuario autenticado.

**Endpoint:** `POST /api/pilots`

**Autenticación:** Requerida

**Parámetros de Solicitud:**
```json
{
  "name": "Comandante Shepard",
  "race": "Humano"
}
```

**Validación:**
- `name`: Requerido, string, máximo 255 caracteres
- `race`: Requerido, string, debe ser uno de: "Humano", "Cyborg", "Alienígena", "Sintético"

**Respuesta Exitosa (201 Created):**
```json
{
  "id": 1,
  "name": "Comandante Shepard",
  "race": "Humano",
  "credits": 10000.00,
  "user_id": 1,
  "corporation_id": null,
  "location_id": 1,
  "created_at": "2023-06-15T10:30:00.000000Z",
  "updated_at": "2023-06-15T10:30:00.000000Z"
}
```

**Respuesta de Error (400 Bad Request):**
```json
{
  "message": "El usuario ya tiene un piloto"
}
```

**Respuesta de Error (422 Unprocessable Entity):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": [
      "El campo nombre es obligatorio."
    ],
    "race": [
      "La raza seleccionada no es válida."
    ]
  }
}
```

### Obtener Piloto Específico

Obtiene información detallada sobre un piloto específico.

**Endpoint:** `GET /api/pilots/{id}`

**Autenticación:** Requerida

**Parámetros de Ruta:**
- `id`: ID del piloto

**Respuesta Exitosa (200 OK):**
```json
{
  "id": 1,
  "name": "Comandante Shepard",
  "race": "Humano",
  "credits": 10000.00,
  "user_id": 1,
  "corporation_id": null,
  "location_id": 1,
  "created_at": "2023-06-15T10:30:00.000000Z",
  "updated_at": "2023-06-15T10:30:00.000000Z"
}
```

**Respuesta de Error (403 Forbidden):**
```json
{
  "message": "This action is unauthorized."
}
```

**Respuesta de Error (404 Not Found):**
```json
{
  "message": "No query results for model [App\\Models\\Pilot] 1"
}
```

### Actualizar Piloto

Actualiza la información de un piloto específico.

**Endpoint:** `PUT /api/pilots/{id}`

**Autenticación:** Requerida

**Parámetros de Ruta:**
- `id`: ID del piloto

**Parámetros de Solicitud:**
```json
{
  "name": "Comandante Shepard Actualizado",
  "race": "Cyborg"
}
```

**Validación:**
- `name`: Opcional, string, máximo 255 caracteres
- `race`: Opcional, string, debe ser uno de: "Humano", "Cyborg", "Alienígena", "Sintético"

**Respuesta Exitosa (200 OK):**
```json
{
  "id": 1,
  "name": "Comandante Shepard Actualizado",
  "race": "Cyborg",
  "credits": 10000.00,
  "user_id": 1,
  "corporation_id": null,
  "location_id": 1,
  "created_at": "2023-06-15T10:30:00.000000Z",
  "updated_at": "2023-06-15T11:45:00.000000Z"
}
```

**Respuesta de Error (403 Forbidden):**
```json
{
  "message": "This action is unauthorized."
}
```

**Respuesta de Error (404 Not Found):**
```json
{
  "message": "No query results for model [App\\Models\\Pilot] 1"
}
```

**Respuesta de Error (422 Unprocessable Entity):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "race": [
      "La raza seleccionada no es válida."
    ]
  }
}
```

## Implementación en el Backend

La API de pilotos está implementada en el controlador `PilotController` en el backend:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Pilot;
use App\Models\SolarSystem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class PilotController extends Controller
{
    /**
     * Get the current user's pilot.
     */
    public function current(Request $request): JsonResponse
    {
        $user = $request->user();
        $pilot = $user->pilot;

        if (!$pilot) {
            return response()->json(['message' => 'El usuario no tiene un piloto'], 404);
        }

        return response()->json($pilot);
    }

    /**
     * Store a newly created pilot in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check if user already has a pilot
        if ($user->pilot) {
            return response()->json(['message' => 'El usuario ya tiene un piloto'], 400);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'race' => 'required|string|in:Humano,Cyborg,Alienígena,Sintético',
        ]);

        // Get a default starting location
        $startingLocation = SolarSystem::first();
        $locationId = $startingLocation ? $startingLocation->id : null;

        // Create the pilot
        $pilot = Pilot::create([
            'name' => $validated['name'],
            'race' => $validated['race'],
            'user_id' => $user->id,
            'credits' => 10000, // Starting credits
            'location_id' => $locationId,
        ]);

        return response()->json($pilot, 201);
    }

    /**
     * Display the specified pilot.
     */
    public function show($id): JsonResponse
    {
        $pilot = Pilot::findOrFail($id);
        
        // Check if the user is authorized to view this pilot
        $this->authorize('view', $pilot);
        
        return response()->json($pilot);
    }

    /**
     * Update the specified pilot in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $pilot = Pilot::findOrFail($id);
        
        // Check if the user is authorized to update this pilot
        $this->authorize('update', $pilot);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'race' => 'sometimes|required|string|in:Humano,Cyborg,Alienígena,Sintético',
        ]);
        
        $pilot->update($validated);
        
        return response()->json($pilot);
    }
}
```

## Implementación en el Frontend

En el frontend, la API de pilotos se consume a través del servicio `pilotService`:

```typescript
// src/services/pilotService.ts
import api from './api';

export interface Pilot {
  id: number;
  name: string;
  race: string;
  credits: number;
  user_id: number;
  corporation_id: number | null;
  location_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePilotData {
  name: string;
  race: string;
}

const pilotService = {
  /**
   * Obtener el piloto del usuario actual
   */
  getCurrentPilot: async () => {
    const response = await api.get('/pilots/current');
    return response.data;
  },

  /**
   * Crear un nuevo piloto
   */
  createPilot: async (data: CreatePilotData) => {
    const response = await api.post('/pilots', data);
    return response.data;
  },

  /**
   * Actualizar un piloto
   */
  updatePilot: async (id: number, data: Partial<Pilot>) => {
    const response = await api.put(`/pilots/${id}`, data);
    return response.data;
  },

  /**
   * Obtener información detallada de un piloto
   */
  getPilotDetails: async (id: number) => {
    const response = await api.get(`/pilots/${id}`);
    return response.data;
  },
};

export default pilotService;
```

## Gestión de Estado

El estado de los pilotos se gestiona a través del store `pilotStore`:

```typescript
// src/stores/pilot.ts
import { defineStore } from 'pinia';
import pilotService from '@/services/pilotService';
import type { Pilot, CreatePilotData } from '@/services/pilotService';

interface PilotState {
  currentPilot: Pilot | null;
  loading: boolean;
  error: string | null;
}

export const usePilotStore = defineStore('pilot', {
  state: (): PilotState => ({
    currentPilot: null,
    loading: false,
    error: null,
  }),

  getters: {
    hasPilot: (state) => !!state.currentPilot,
    pilotName: (state) => state.currentPilot?.name || '',
    pilotRace: (state) => state.currentPilot?.race || '',
    pilotCredits: (state) => state.currentPilot?.credits || 0,
  },

  actions: {
    async fetchCurrentPilot() {
      this.loading = true;
      this.error = null;

      try {
        const pilot = await pilotService.getCurrentPilot();
        this.currentPilot = pilot;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al obtener el piloto';
        this.currentPilot = null;
      } finally {
        this.loading = false;
      }
    },

    async createPilot(data: CreatePilotData) {
      this.loading = true;
      this.error = null;

      try {
        const pilot = await pilotService.createPilot(data);
        this.currentPilot = pilot;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear el piloto';
      } finally {
        this.loading = false;
      }
    },

    async updatePilot(data: Partial<Pilot>) {
      if (!this.currentPilot) {
        this.error = 'No hay piloto para actualizar';
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const updatedPilot = await pilotService.updatePilot(this.currentPilot.id, data);
        this.currentPilot = updatedPilot;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar el piloto';
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
```

## Consideraciones de Seguridad

- Todos los endpoints requieren autenticación mediante token.
- Las políticas de autorización aseguran que los usuarios solo puedan ver y actualizar sus propios pilotos, a menos que tengan roles de administrador o moderador.
- La validación de datos se realiza tanto en el frontend como en el backend para garantizar la integridad de los datos.

## Futuras Expansiones

La API de pilotos se expandirá en el futuro para incluir:

- Endpoints para gestionar habilidades de pilotos
- Endpoints para gestionar la relación entre pilotos y corporaciones
- Endpoints para gestionar la ubicación y movimiento de pilotos
- Endpoints para obtener estadísticas y logros de pilotos
