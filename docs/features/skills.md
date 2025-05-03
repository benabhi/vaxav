# Sistema de Habilidades

Este documento describe el sistema de habilidades implementado en Vaxav.

## Visión General

El sistema de habilidades permite a los pilotos mejorar sus capacidades en diferentes áreas a través del entrenamiento. Las habilidades están organizadas en categorías y tienen diferentes niveles de complejidad, representados por multiplicadores.

## Estructura de Datos

### Categorías de Habilidades

Las categorías agrupan habilidades relacionadas:

- **Combate**: Habilidades relacionadas con el combate y el uso de armas.
- **Minería**: Habilidades relacionadas con la extracción y procesamiento de recursos.
- **Comercio**: Habilidades relacionadas con el comercio y la economía.
- **Exploración**: Habilidades relacionadas con la exploración y el descubrimiento.
- **Ingeniería**: Habilidades relacionadas con la construcción y reparación de naves y estructuras.
- **Liderazgo**: Habilidades relacionadas con el liderazgo y la gestión de corporaciones.
- **Navegación**: Habilidades relacionadas con la navegación y el pilotaje de naves.
- **Ciencia**: Habilidades relacionadas con la investigación y el desarrollo tecnológico.

### Habilidades

Cada habilidad tiene las siguientes propiedades:

- **Nombre**: Nombre único de la habilidad.
- **Descripción**: Descripción detallada de la habilidad.
- **Categoría**: Categoría a la que pertenece la habilidad.
- **Multiplicador**: Factor que determina la complejidad y tiempo de entrenamiento (1-5).
- **Prerrequisitos**: Otras habilidades que deben alcanzar cierto nivel antes de poder entrenar esta habilidad.

### Multiplicadores

Los multiplicadores determinan la complejidad y el tiempo de entrenamiento de una habilidad:

- **x1 (Básico)**: Habilidades fundamentales sin prerrequisitos.
- **x2 (Intermedio)**: Requieren habilidades básicas.
- **x3 (Avanzado)**: Requieren habilidades intermedias.
- **x4 (Experto)**: Requieren múltiples habilidades avanzadas.
- **x5 (Maestro)**: El nivel más alto, requieren habilidades expertas.

### Niveles de Habilidad

Los pilotos pueden entrenar habilidades hasta el nivel 5:

- **Nivel 0**: Sin entrenamiento (estado inicial).
- **Nivel 1**: Entrenamiento básico.
- **Nivel 2**: Entrenamiento intermedio.
- **Nivel 3**: Entrenamiento avanzado.
- **Nivel 4**: Entrenamiento experto.
- **Nivel 5**: Maestría completa.

Cada nivel proporciona bonificaciones adicionales y puede desbloquear nuevas habilidades como prerrequisitos.

## Entrenamiento de Habilidades

Los pilotos ganan experiencia (XP) en habilidades a través de diversas actividades:

1. **Entrenamiento Pasivo**: Los pilotos ganan XP con el tiempo en la habilidad que están entrenando actualmente.
2. **Entrenamiento Activo**: Los pilotos ganan XP adicional al usar activamente una habilidad (combate, minería, etc.).
3. **Implantes y Bonificaciones**: Ciertos implantes o bonificaciones de raza pueden aumentar la velocidad de entrenamiento.

## Prerrequisitos

Las habilidades más avanzadas requieren que el piloto tenga otras habilidades en cierto nivel:

- Las habilidades básicas (x1) no tienen prerrequisitos.
- Las habilidades intermedias (x2) suelen requerir habilidades básicas en nivel 3-4.
- Las habilidades avanzadas (x3) suelen requerir habilidades intermedias en nivel 3-5.
- Las habilidades expertas (x4) requieren múltiples habilidades avanzadas.
- Las habilidades maestras (x5) requieren habilidades expertas y representan el pináculo de una especialización.

## Implementación Técnica

### Tablas de Base de Datos

- **skills_categories**: Almacena las categorías de habilidades.
- **skills**: Almacena las habilidades disponibles.
- **skills_prerequisites**: Almacena los prerrequisitos de las habilidades.
- **pilots_skills**: Almacena las habilidades de cada piloto, su nivel actual y experiencia.

### API

La API proporciona endpoints para:

- Obtener todas las habilidades y categorías.
- Obtener las habilidades de un piloto específico.
- Obtener detalles de una habilidad, incluyendo prerrequisitos.
- Iniciar y detener el entrenamiento de habilidades.
- Administrar habilidades y categorías (solo para administradores).

Para más detalles sobre los endpoints de la API, consulte la [documentación de la API de habilidades](../api/skills.md).

## Interfaz de Usuario

### Panel de Administración

Los administradores pueden gestionar habilidades y categorías a través del panel de administración:

- **Gestión de Categorías**: Crear, editar y eliminar categorías de habilidades.
- **Gestión de Habilidades**: Crear, editar y eliminar habilidades, definir multiplicadores y prerrequisitos.

### Interfaz de Piloto

Los pilotos pueden ver y entrenar sus habilidades a través de la interfaz de piloto:

- **Vista de Habilidades**: Muestra todas las habilidades del piloto, organizadas por categorías.
- **Detalles de Habilidad**: Muestra información detallada sobre una habilidad, incluyendo bonificaciones por nivel.
- **Cola de Entrenamiento**: Permite a los pilotos poner habilidades en cola para entrenar automáticamente.

## Futuras Mejoras

- **Árbol de Habilidades Visual**: Implementar una visualización gráfica del árbol de habilidades y prerrequisitos.
- **Especialización de Razas**: Diferentes razas comenzarán con bonificaciones en ciertas categorías de habilidades.
- **Certificados**: Agrupar conjuntos de habilidades en certificados que desbloquean ciertos equipos o naves.
- **Redistribución de Atributos**: Permitir a los pilotos redistribuir atributos para optimizar la velocidad de entrenamiento en diferentes categorías.
