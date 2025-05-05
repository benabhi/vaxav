# VxvToggleSwitch

El componente `VxvToggleSwitch` es un interruptor de palanca que permite a los usuarios alternar entre dos estados.

## Casos de Uso

- Activar/desactivar funcionalidades
- Cambiar entre estados binarios (encendido/apagado, activo/inactivo)
- Habilitar/deshabilitar opciones en formularios
- Alternar modos (como modo claro/oscuro)

## Ejemplos

### Básico

El toggle switch básico muestra un interruptor con etiqueta de texto que cambia según el estado.

```vue
<template>
  <div class="p-4 bg-gray-900 rounded-lg">
    <VxvToggleSwitch v-model="isActive" />
    <div class="mt-4 text-gray-300">
      Estado actual: {{ isActive ? 'Activo' : 'Inactivo' }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VxvToggleSwitch from '@/components/ui/forms/VxvToggleSwitch.vue';

const isActive = ref(false);
</script>
```

### Personalizado

Se pueden personalizar los colores y textos del toggle switch.

```vue
<template>
  <div class="p-4 bg-gray-900 rounded-lg">
    <VxvToggleSwitch
      v-model="isOnline"
      activeText="En línea"
      inactiveText="Fuera de línea"
      activeColor="bg-blue-500"
      inactiveColor="bg-red-500"
      activeTextColor="text-blue-400"
      inactiveTextColor="text-red-400"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VxvToggleSwitch from '@/components/ui/forms/VxvToggleSwitch.vue';

const isOnline = ref(true);
</script>
```

### Deshabilitado

El toggle switch puede estar deshabilitado para indicar que no está disponible.

```vue
<template>
  <div class="p-4 bg-gray-900 rounded-lg">
    <div class="mb-4">
      <VxvToggleSwitch
        v-model="isEnabled"
        disabled
      />
      <span class="ml-4 text-gray-400">Toggle deshabilitado (inactivo)</span>
    </div>
    <div>
      <VxvToggleSwitch
        v-model="isEnabledActive"
        disabled
      />
      <span class="ml-4 text-gray-400">Toggle deshabilitado (activo)</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VxvToggleSwitch from '@/components/ui/forms/VxvToggleSwitch.vue';

const isEnabled = ref(false);
const isEnabledActive = ref(true);
</script>
```

### Sin Etiqueta

El toggle switch puede mostrarse sin etiqueta de texto.

```vue
<template>
  <div class="p-4 bg-gray-900 rounded-lg flex items-center">
    <span class="text-gray-300 mr-4">Modo oscuro</span>
    <VxvToggleSwitch
      v-model="darkMode"
      :showLabel="false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VxvToggleSwitch from '@/components/ui/forms/VxvToggleSwitch.vue';

const darkMode = ref(true);
</script>
```

### Con Manejo de Eventos

El toggle switch emite eventos que pueden ser capturados para realizar acciones.

```vue
<template>
  <div class="p-4 bg-gray-900 rounded-lg">
    <VxvToggleSwitch
      v-model="notificationsEnabled"
      @change="handleChange"
    />
    <div class="mt-4 text-gray-300">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VxvToggleSwitch from '@/components/ui/forms/VxvToggleSwitch.vue';

const notificationsEnabled = ref(false);
const message = ref('Las notificaciones están desactivadas');

const handleChange = (value) => {
  message.value = value 
    ? 'Las notificaciones han sido activadas' 
    : 'Las notificaciones han sido desactivadas';
};
</script>
```

## Mejores Prácticas

- Utiliza textos descriptivos que indiquen claramente los dos estados
- Usa colores que tengan suficiente contraste para distinguir los estados
- Proporciona retroalimentación visual inmediata al usuario
- Asegúrate de que el componente sea accesible para usuarios con discapacidades
- Considera el uso de animaciones sutiles para mejorar la experiencia del usuario
