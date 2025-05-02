# VxvModal

El componente `VxvModal` es una ventana modal superpuesta que se utiliza para mostrar contenido que requiere la atención del usuario sin cambiar de página.

## Características

- **Overlay translúcido con blur**: Fondo semi-transparente con efecto de desenfoque que permite ver el contenido detrás
- **Diseño centrado**: Se posiciona automáticamente en el centro de la pantalla
- **Colores personalizables**: Permite cambiar el color del borde y elementos decorativos
- **Cierre configurable**: Puede cerrarse al hacer clic fuera del modal o solo mediante botones
- **Estructura semántica**: Incluye secciones para título, contenido y pie de página

## Propiedades

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `show` | `Boolean` | `required` | Controla la visibilidad del modal |
| `title` | `String` | `''` | Título del modal |
| `color` | `String` | `'blue'` | Color del borde y elementos decorativos (`'blue'`, `'red'`, `'green'`, `'yellow'`, `'gray'`) |
| `closeOnClickOutside` | `Boolean` | `true` | Si el modal debe cerrarse al hacer clic fuera de él |

## Eventos

| Nombre | Descripción |
|--------|-------------|
| `close` | Emitido cuando se cierra el modal (al hacer clic fuera si `closeOnClickOutside` es `true`) |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido principal del modal |
| `footer` | Contenido del pie del modal (opcional) |

## Ejemplos de Uso

### Modal Básico

```vue
<VxvModal :show="showModal" title="Información" @close="showModal = false">
  <p class="text-white">Este es un modal básico con información.</p>

  <template #footer>
    <div class="flex justify-end">
      <VxvButton @click="showModal = false">Cerrar</VxvButton>
    </div>
  </template>
</VxvModal>
```

### Modal de Confirmación

```vue
<VxvModal
  :show="showConfirmModal"
  title="Confirmar eliminación"
  color="red"
  @close="cancelAction"
>
  <p class="text-white">¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.</p>

  <template #footer>
    <div class="flex space-x-3">
      <VxvButton variant="danger" @click="confirmAction">Eliminar</VxvButton>
      <VxvButton variant="secondary" @click="cancelAction">Cancelar</VxvButton>
    </div>
  </template>
</VxvModal>
```

### Modal con Formulario

```vue
<VxvModal :show="showFormModal" title="Crear elemento" color="green" @close="closeForm">
  <form @submit.prevent="submitForm">
    <div class="mb-4">
      <VxvInput
        v-model="form.name"
        label="Nombre"
        required
      />
    </div>

    <div class="mb-4">
      <VxvTextarea
        v-model="form.description"
        label="Descripción"
      />
    </div>

    <template #footer>
      <div class="flex space-x-3">
        <VxvButton type="submit" variant="primary">Guardar</VxvButton>
        <VxvButton type="button" variant="secondary" @click="closeForm">Cancelar</VxvButton>
      </div>
    </template>
  </form>
</VxvModal>
```

## Notas de Implementación

1. **Overlay con blur**: El modal utiliza un overlay con alta opacidad y efecto de desenfoque para mejorar el contraste visual y reducir las distracciones del contenido detrás. Este efecto proporciona un mayor enfoque en el contenido del modal.
2. **Accesibilidad**: El modal está diseñado teniendo en cuenta la accesibilidad, con estructura semántica y manejo adecuado del foco.
3. **Responsive**: El modal se adapta a diferentes tamaños de pantalla, manteniendo una buena experiencia en dispositivos móviles.
4. **Z-index**: El modal tiene un z-index alto (50) para asegurar que aparezca por encima de otros elementos de la interfaz.
5. **Animaciones**: El modal incluye transiciones suaves para mejorar la experiencia de usuario.
