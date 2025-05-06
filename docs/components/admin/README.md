# Componentes de Administración

Esta sección documenta los componentes utilizados en el panel de administración de VAXAV.

## Índice

1. [Componentes Generales](./admin.md)
2. [Componentes de Administración de Habilidades](./skills.md)
3. [Componentes de Administración de Pilotos](./pilots.md)

## Componentes Generales

Los componentes generales de administración proporcionan la estructura y funcionalidad básica del panel de administración. Estos incluyen:

- Componentes de layout
- Componentes de navegación
- Componentes de tablas y formularios
- Componentes de modales y diálogos

Para más detalles, consulte la [documentación de componentes generales de administración](./admin.md).

## Componentes de Administración de Habilidades

Los componentes de administración de habilidades proporcionan interfaces para gestionar las habilidades y categorías de habilidades en el juego. Estos incluyen:

- Vista de lista de habilidades
- Vista de creación de habilidades
- Vista de edición de habilidades
- Vista de lista de categorías de habilidades
- Vista de creación de categorías de habilidades
- Vista de edición de categorías de habilidades

Para más detalles, consulte la [documentación de componentes de administración de habilidades](./skills.md).

## Componentes de Administración de Pilotos

Los componentes de administración de pilotos proporcionan interfaces para gestionar los pilotos y sus habilidades en el juego. Estos incluyen:

- Vista de lista de pilotos
- Vista de edición de pilotos
- Vista de gestión de habilidades de pilotos

Para más detalles, consulte la [documentación de componentes de administración de pilotos](./pilots.md).

## Patrones de Uso

Al desarrollar nuevos componentes para el panel de administración, siga estos patrones:

1. Utilice los componentes base existentes para mantener la consistencia.
2. Extraiga la lógica de negocio en composables para facilitar la reutilización y las pruebas.
3. Utilice el componente `AdminCrudView` para vistas CRUD.
4. Siga las convenciones de nomenclatura existentes.
5. Documente los nuevos componentes siguiendo el formato existente.

## Consideraciones de Seguridad

Todos los componentes de administración deben:

1. Verificar los permisos del usuario antes de mostrar acciones o secciones restringidas.
2. Proporcionar retroalimentación clara para todas las acciones del usuario.
3. Mostrar estados de carga durante operaciones asíncronas.
4. Implementar validación de datos tanto en el cliente como en el servidor.
5. Manejar adecuadamente los errores y mostrar mensajes de error claros.

## Futuras Mejoras

El panel de administración se expandirá en el futuro para incluir:

1. Gestión de naves
2. Gestión de corporaciones
3. Gestión de sistemas solares
4. Gestión de mercado
5. Estadísticas y métricas
6. Herramientas de moderación
