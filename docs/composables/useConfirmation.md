# useConfirmation

El composable `useConfirmation` proporciona funcionalidad para gestionar diálogos de confirmación en la aplicación.

## Importación

```javascript
import { useConfirmation } from '@/composables/useConfirmation';
```

## Uso Básico

```javascript
const { confirm, confirmDelete, confirmSave } = useConfirmation();

// Confirmar una acción
const handleAction = async () => {
  const { confirmed } = await confirm({
    title: 'Confirmar acción',
    message: '¿Estás seguro de que deseas realizar esta acción?',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar'
  });
  
  if (confirmed) {
    // Realizar la acción
    console.log('Acción confirmada');
  }
};

// Confirmar eliminación
const handleDelete = async () => {
  const { confirmed, data } = await confirmDelete({
    title: 'Eliminar elemento',
    message: '¿Estás seguro de que deseas eliminar este elemento?',
    data: { id: 1, name: 'Elemento 1' }
  });
  
  if (confirmed) {
    // Eliminar el elemento
    console.log('Elemento eliminado:', data);
  }
};

// Confirmar guardado
const handleSave = async () => {
  const { confirmed } = await confirmSave({
    message: '¿Estás seguro de que deseas guardar los cambios?'
  });
  
  if (confirmed) {
    // Guardar los cambios
    console.log('Cambios guardados');
  }
};
```

## Estado

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `isOpen` | `Ref<Boolean>` | Indica si el diálogo está abierto |
| `isLoading` | `Ref<Boolean>` | Indica si se está procesando la acción |
| `config` | `Reactive<Object>` | Configuración del diálogo |

## Métodos

### confirm

Abre un diálogo de confirmación genérico.

```javascript
const { confirmed, data } = await confirm({
  title: 'Confirmar acción',
  message: '¿Estás seguro de que deseas realizar esta acción?',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  color: 'blue',
  icon: null,
  data: { id: 1 }
});
```

### confirmDelete

Abre un diálogo de confirmación de eliminación.

```javascript
const { confirmed, data } = await confirmDelete({
  title: 'Eliminar elemento',
  message: '¿Estás seguro de que deseas eliminar este elemento?',
  confirmText: 'Eliminar',
  cancelText: 'Cancelar',
  data: { id: 1 }
});
```

### confirmSave

Abre un diálogo de confirmación de guardado.

```javascript
const { confirmed, data } = await confirmSave({
  title: 'Guardar cambios',
  message: '¿Estás seguro de que deseas guardar los cambios?',
  confirmText: 'Guardar',
  cancelText: 'Cancelar',
  data: { id: 1 }
});
```

### handleConfirm

Confirma el diálogo actual.

```javascript
handleConfirm();
```

### handleCancel

Cancela el diálogo actual.

```javascript
handleCancel();
```

### close

Cierra el diálogo actual (equivalente a cancelar).

```javascript
close();
```

## Componente ConfirmationDialog

Para utilizar el composable `useConfirmation`, se recomienda incluir el componente `ConfirmationDialog` en el componente raíz de la aplicación:

```vue
<template>
  <div>
    <!-- Contenido de la aplicación -->
    <ConfirmationDialog />
  </div>
</template>

<script setup>
import ConfirmationDialog from '@/components/ui/modals/ConfirmationDialog.vue';
</script>
```

## Ejemplo Completo

```vue
<template>
  <div>
    <BaseButton @click="handleDeleteUser">Eliminar Usuario</BaseButton>
    <BaseButton @click="handleSaveUser">Guardar Usuario</BaseButton>
    <BaseButton @click="handleCustomAction">Acción Personalizada</BaseButton>
    
    <!-- Incluir el componente de diálogo de confirmación -->
    <ConfirmationDialog />
  </div>
</template>

<script setup>
import { useConfirmation } from '@/composables/useConfirmation';
import ConfirmationDialog from '@/components/ui/modals/ConfirmationDialog.vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';

const { confirm, confirmDelete, confirmSave } = useConfirmation();

// Eliminar usuario
const handleDeleteUser = async () => {
  const user = { id: 1, name: 'John Doe' };
  
  const { confirmed, data } = await confirmDelete({
    title: 'Eliminar Usuario',
    message: `¿Estás seguro de que deseas eliminar al usuario ${user.name}?`,
    data: user
  });
  
  if (confirmed) {
    // Eliminar el usuario
    console.log('Usuario eliminado:', data);
  }
};

// Guardar usuario
const handleSaveUser = async () => {
  const { confirmed } = await confirmSave({
    message: '¿Estás seguro de que deseas guardar los cambios del usuario?'
  });
  
  if (confirmed) {
    // Guardar los cambios
    console.log('Cambios guardados');
  }
};

// Acción personalizada
const handleCustomAction = async () => {
  const { confirmed } = await confirm({
    title: 'Acción Personalizada',
    message: '¿Estás seguro de que deseas realizar esta acción personalizada?',
    confirmText: 'Realizar Acción',
    cancelText: 'No Realizar',
    color: 'yellow',
    icon: 'exclamation'
  });
  
  if (confirmed) {
    // Realizar la acción
    console.log('Acción personalizada realizada');
  }
};
</script>
```

## Personalización

El composable `useConfirmation` permite personalizar varios aspectos del diálogo:

### Colores

- `blue` (por defecto): Para acciones informativas o neutrales
- `red`: Para acciones destructivas (eliminar)
- `green`: Para acciones positivas (guardar)
- `yellow`: Para acciones de advertencia

### Iconos

- `null` (por defecto): Sin icono
- `trash`: Icono de papelera (para eliminar)
- `save`: Icono de guardar
- `check`: Icono de verificación
- `exclamation`: Icono de exclamación

### Datos Adicionales

Puedes pasar datos adicionales al diálogo que se devolverán cuando se resuelva la promesa:

```javascript
const { confirmed, data } = await confirm({
  // Otras opciones...
  data: { id: 1, name: 'Elemento 1', extraInfo: 'Información adicional' }
});

if (confirmed) {
  console.log('Datos:', data); // { id: 1, name: 'Elemento 1', extraInfo: 'Información adicional' }
}
```
