# Componentes UI

Los componentes UI son los bloques de construcción básicos de la interfaz de usuario de Vaxav. Estos componentes están diseñados para ser reutilizables, consistentes y accesibles.

## Documentación en Storybook

Algunos componentes tienen documentación interactiva en Storybook. Para más detalles, consulta [Componentes Documentados en Storybook](./storybook-components.md).

Para iniciar Storybook, ejecuta:

```bash
cd frontend
npm run storybook
```

Esto iniciará Storybook en `http://localhost:6006`.

## Categorías de Componentes

Los componentes UI están organizados en las siguientes categorías:

### Botones y Controles de Acción

- [Botones](./buttons.md): Componentes para acciones primarias y secundarias.

### Formularios

- [Inputs](./forms.md): Campos de entrada de texto, números, etc.
- [Selects](./forms.md#select): Componentes de selección.
- [Checkboxes y Radios](./forms.md#checkbox-y-radio): Componentes de selección múltiple y única.

### Feedback

- [Alertas y Notificaciones](./feedback.md): Componentes `VxvAlert` y `VxvNotification` para mostrar mensajes de éxito, error, advertencia e información.

### Modales y Diálogos

- [Modal](./modals.md): Ventanas modales para mostrar contenido superpuesto.

### Navegación

- [Sidebar](./navigation.md#vxvsidebar): Barra lateral para navegación.
- [SidebarGroup](./navigation.md#vxvsidebargroup): Grupos de navegación colapsables.
- [NavLink](./navigation.md#vxvnavlink): Enlaces de navegación estilizados.
- [Tabs](./navigation.md#tabs): Pestañas para cambiar entre diferentes vistas.
- [Breadcrumbs](./navigation.md#vxvbreadcrumb): Migas de pan para mostrar la ubicación actual.

### Layout

- [PageTitle](./layout.md#vxvpagetitle): Título de página con breadcrumb y acciones opcionales.
- [StatusBar](./layout.md#vxvstatusbar): Barra de estado que se muestra encima del footer con información y cronómetro de acción.

### Timers

- [ActionTimer](./timers.md): Cronómetro con barra de progreso que muestra una acción en curso y el tiempo restante.

### Visualización de Datos

- [Tables](./data-display.md#tables): Tablas para mostrar datos tabulares.
- [Cards](./data-display.md#cards): Tarjetas para mostrar información agrupada.

## Principios de Diseño

Los componentes UI de Vaxav siguen estos principios de diseño:

1. **Consistencia**: Los componentes mantienen un estilo y comportamiento consistente en toda la aplicación.
2. **Reutilización**: Los componentes están diseñados para ser reutilizados en diferentes contextos.
3. **Accesibilidad**: Los componentes son accesibles para todos los usuarios, incluyendo aquellos con discapacidades.
4. **Responsividad**: Los componentes se adaptan a diferentes tamaños de pantalla.
5. **Personalización**: Los componentes pueden ser personalizados mediante props y slots.

## Uso de Tailwind CSS

Los componentes UI utilizan Tailwind CSS para los estilos. Esto proporciona varias ventajas:

- **Consistencia**: Tailwind proporciona un sistema de diseño consistente.
- **Flexibilidad**: Los componentes pueden ser personalizados fácilmente.
- **Rendimiento**: Tailwind genera solo el CSS necesario.

## Temas

Los componentes UI soportan temas claro y oscuro mediante las clases de Tailwind:

```html
<div class="dark:bg-gray-900 dark:text-white">
  <!-- Contenido -->
</div>
```

## Mejores Prácticas

1. **Componentes Pequeños y Enfocados**: Cada componente debe tener una única responsabilidad.
2. **Props Validadas**: Todas las props deben tener validación de tipo y valores por defecto cuando sea apropiado.
3. **Slots Nombrados**: Utiliza slots nombrados para permitir la personalización del contenido.
4. **Eventos Nombrados Consistentemente**: Usa convenciones de nombres para eventos (ej. `update:modelValue`).
5. **Documentación Clara**: Documenta todas las props, slots y eventos de cada componente.

## Contribución

Si deseas contribuir a los componentes UI, por favor sigue estas pautas:

1. Asegúrate de que el componente sigue los principios de diseño mencionados anteriormente.
2. Documenta todas las props, slots y eventos del componente.
3. Proporciona ejemplos de uso del componente.
4. Asegúrate de que el componente es accesible.
5. Asegúrate de que el componente funciona en temas claro y oscuro.
6. Crea un story en Storybook para el componente siguiendo el patrón de los stories existentes.

## Componentes con Stories en Storybook

Los siguientes componentes tienen documentación interactiva en Storybook:

- [VxvButton](./buttons.md): Botón principal de la aplicación.
- [VxvInput](./forms.md): Campo de entrada de texto.
- [VxvAlert](./feedback.md): Componente para mostrar mensajes importantes.
- [VxvTable](./tables.md): Tabla para mostrar datos tabulares.

Para ver la lista completa y el plan de documentación, consulta [Componentes Documentados en Storybook](./storybook-components.md).
