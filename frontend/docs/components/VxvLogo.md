# VxvLogo

El componente `VxvLogo` es un elemento visual que muestra el logo de VAXAV con un efecto neón asombroso. El logo es un enlace que lleva al home por defecto.

## Propiedades

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| to | String | `'/'` | Ruta de destino para el enlace del logo |
| size | String | `'md'` | Tamaño del logo (sm, md, lg, xl) |

## Ejemplos de uso

### Logo básico

```vue
<VxvLogo />
```

### Logo con tamaño personalizado

```vue
<VxvLogo size="lg" />
```

### Logo con ruta personalizada

```vue
<VxvLogo to="/dashboard" />
```

### Logo en el header

```vue
<header class="bg-gray-800">
  <div class="container mx-auto px-4 py-3 flex items-center">
    <VxvLogo size="md" />
    <!-- Resto del contenido del header -->
  </div>
</header>
```

### Logo en el footer

```vue
<footer class="bg-gray-900 py-8">
  <div class="container mx-auto text-center">
    <VxvLogo size="lg" />
    <p class="mt-4 text-gray-400">© 2023 VAXAV. Todos los derechos reservados.</p>
  </div>
</footer>
```

## Características

- **Efecto neón**: El logo tiene un efecto neón que pulsa suavemente para atraer la atención.
- **Efecto hover**: Al pasar el mouse por encima, el logo se ilumina con un efecto de parpadeo neón más intenso.
- **Fuente futurista**: Utiliza fuentes futuristas (Orbitron, Rajdhani, Audiowide) para un aspecto espacial.
- **Enlace al home**: Por defecto, el logo es un enlace que lleva al home de la aplicación.
- **Tamaños responsivos**: Disponible en varios tamaños para adaptarse a diferentes contextos.

## Notas de implementación

- El componente requiere que las fuentes Orbitron, Rajdhani y Audiowide estén disponibles. Estas fuentes se cargan desde Google Fonts en el archivo `index.html`.
- El efecto neón está implementado con CSS puro, utilizando `text-shadow` y animaciones.
- Para un mejor rendimiento, las animaciones se detienen cuando el componente no está visible en la pantalla.
