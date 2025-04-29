# VxvCard

El componente `VxvCard` es un contenedor visual que proporciona un estilo consistente para mostrar contenido en un recuadro gris con bordes redondeados y sombra. Puede mostrar un título opcional con o sin borde, con un espaciado optimizado para ambos casos. Cuando se muestra sin borde, el espaciado entre el título y el contenido es más compacto pero mantiene una separación visual adecuada.

## Propiedades

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| title | String | `''` | Título de la tarjeta. Si se proporciona, se muestra en la parte superior |
| hasBorder | Boolean | `false` | Si es `true`, muestra un borde debajo del título |
| maxWidth | String | `''` | Ancho máximo de la tarjeta (xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, full) |
| centered | Boolean | `false` | Si es `true`, centra la tarjeta horizontalmente con `mx-auto` |

## Slots

| Nombre | Descripción |
|--------|-------------|
| default | Contenido principal de la tarjeta |

## Ejemplos de uso

### Tarjeta básica sin título

```vue
<VxvCard>
  <p>Este es el contenido de la tarjeta.</p>
</VxvCard>
```

### Tarjeta con título

```vue
<VxvCard title="Título de la tarjeta">
  <p>Este es el contenido de la tarjeta con título.</p>
</VxvCard>
```

### Tarjeta con título y borde

```vue
<VxvCard title="Título de la tarjeta" :has-border="true">
  <p>Este es el contenido de la tarjeta con título y borde.</p>
</VxvCard>
```

### Tarjeta centrada con ancho máximo

```vue
<VxvCard title="Título de la tarjeta" max-width="md" centered>
  <p>Esta tarjeta está centrada y tiene un ancho máximo de md.</p>
</VxvCard>
```

### Tarjeta con formulario

```vue
<VxvCard title="Formulario de contacto" :has-border="true" max-width="lg" centered>
  <form @submit.prevent="handleSubmit">
    <div class="mb-4">
      <VxvInput
        id="name"
        v-model="form.name"
        label="Nombre"
        required
      />
    </div>
    <div class="mb-4">
      <VxvInput
        id="email"
        v-model="form.email"
        label="Correo electrónico"
        type="email"
        required
      />
    </div>
    <div class="mb-4">
      <VxvTextarea
        id="message"
        v-model="form.message"
        label="Mensaje"
        rows="4"
        required
      />
    </div>
    <VxvButton type="submit" variant="primary">
      Enviar mensaje
    </VxvButton>
  </form>
</VxvCard>
```

### Tarjeta en una cuadrícula

```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <VxvCard title="Estadísticas" :has-border="true">
    <p>Contenido de estadísticas...</p>
  </VxvCard>

  <VxvCard title="Actividad reciente" :has-border="true">
    <p>Contenido de actividad reciente...</p>
  </VxvCard>

  <VxvCard title="Acciones rápidas" :has-border="true">
    <p>Contenido de acciones rápidas...</p>
  </VxvCard>
</div>
```
