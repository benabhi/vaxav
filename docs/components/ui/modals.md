# Componentes Modales

Los componentes modales son ventanas superpuestas que aparecen sobre el contenido principal para mostrar información importante, solicitar confirmación o permitir la entrada de datos sin cambiar de página.

## BaseModal

`BaseModal` es el componente base para todos los modales en la aplicación. Proporciona la estructura y funcionalidad básica que pueden utilizar otros componentes.

**Archivo**: `/components/ui/modals/BaseModal.vue`

### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `show` | `Boolean` | `required` | Controla la visibilidad del modal |
| `title` | `String` | `''` | Título del modal |
| `color` | `String` | `'blue'` | Color del borde y elementos del modal (`'blue'`, `'red'`, `'green'`, `'yellow'`, `'gray'`) |
| `closeOnClickOutside` | `Boolean` | `true` | Si el modal debe cerrarse al hacer clic fuera de él |

### Eventos

| Nombre | Descripción |
|--------|-------------|
| `close` | Emitido cuando se cierra el modal (al hacer clic fuera si `closeOnClickOutside` es `true`) |

### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido principal del modal |
| `footer` | Contenido del pie del modal (opcional) |

### Ejemplos de Uso

**Modal Básico**:
```vue
<BaseModal :show="showModal" title="Información" @close="showModal = false">
  <p>Este es un modal básico con información.</p>
  
  <div class="flex justify-end mt-4">
    <button @click="showModal = false" class="px-4 py-2 bg-blue-600 text-white rounded">
      Cerrar
    </button>
  </div>
</BaseModal>
```

**Modal de Confirmación**:
```vue
<BaseModal :show="showConfirmModal" title="Confirmar acción" color="red" @close="cancelAction">
  <p>¿Estás seguro de que deseas realizar esta acción? Esta operación no se puede deshacer.</p>
  
  <div class="flex space-x-3 mt-4">
    <button @click="confirmAction" class="flex-1 bg-red-600 text-white py-2 px-4 rounded">
      Confirmar
    </button>
    <button @click="cancelAction" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded">
      Cancelar
    </button>
  </div>
</BaseModal>
```

**Modal de Formulario**:
```vue
<BaseModal :show="showFormModal" title="Crear nuevo elemento" @close="closeForm">
  <form @submit.prevent="submitForm">
    <div class="mb-4">
      <label class="block text-white mb-2">Nombre</label>
      <input v-model="form.name" class="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white" />
    </div>
    
    <div class="mb-4">
      <label class="block text-white mb-2">Descripción</label>
      <textarea v-model="form.description" class="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"></textarea>
    </div>
    
    <div class="flex space-x-3">
      <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded">
        Guardar
      </button>
      <button type="button" @click="closeForm" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded">
        Cancelar
      </button>
    </div>
  </form>
</BaseModal>
```

## Uso en Vistas

El componente BaseModal se utiliza directamente en las vistas de la aplicación, como:

- **UsersView**: Para crear, editar y eliminar usuarios
- **RolesView**: Para crear, editar y eliminar roles

## Mejores Prácticas

1. **Accesibilidad**: Asegúrate de que los modales sean accesibles para todos los usuarios, incluyendo aquellos que utilizan lectores de pantalla.
2. **Enfoque**: Mantén el enfoque dentro del modal mientras está abierto para evitar que los usuarios interactúen con el contenido detrás del modal.
3. **Cierre**: Proporciona siempre una forma clara de cerrar el modal, como un botón de "Cerrar" o "Cancelar".
4. **Tamaño**: Mantén los modales lo más pequeños posible para evitar desplazamiento vertical excesivo.
5. **Contenido**: Mantén el contenido del modal enfocado en una sola tarea o tema.
6. **Colores**: Utiliza colores apropiados para el contexto (por ejemplo, rojo para acciones destructivas).

## Consideraciones Técnicas

- El componente BaseModal utiliza la API de slots de Vue para permitir la personalización del contenido.
- El modal se cierra automáticamente al hacer clic fuera de él si `closeOnClickOutside` es `true`.
- El modal tiene un diseño responsivo que se adapta a diferentes tamaños de pantalla.
- El componente utiliza Tailwind CSS para los estilos.
