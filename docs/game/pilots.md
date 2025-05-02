# Sistema de Pilotos

Este documento describe el sistema de pilotos en Vaxav, incluyendo su creación, atributos, y cómo interactúan con el resto del juego.

## Visión General

En Vaxav, cada usuario debe crear un piloto después de registrarse y verificar su correo electrónico. El piloto es la representación del jugador dentro del universo del juego y es necesario para interactuar con los sistemas de juego como exploración, comercio y combate.

## Flujo de Creación de Piloto

1. **Registro de Usuario**: El jugador crea una cuenta en el sistema.
2. **Verificación de Email**: El jugador verifica su dirección de correo electrónico.
3. **Creación de Piloto**: El jugador crea un piloto proporcionando un nombre y seleccionando una raza.
4. **Inicio del Juego**: Una vez creado el piloto, el jugador puede acceder a todas las funcionalidades del juego.

## Atributos del Piloto

Cada piloto tiene los siguientes atributos:

| Atributo | Descripción |
|----------|-------------|
| Nombre | Nombre único del piloto |
| Raza | Raza del piloto (Humano, Cyborg, Alienígena, Sintético) |
| Créditos | Moneda del juego para comprar y vender |
| Ubicación | Sistema solar donde se encuentra el piloto |
| Corporación | Organización a la que pertenece el piloto (opcional) |

## Razas de Pilotos

Vaxav ofrece cuatro razas diferentes, cada una con sus propias bonificaciones:

### Humano
- **Bonificaciones**: 
  - +10% a habilidades de comercio
  - +5% a habilidades diplomáticas
- **Descripción**: Versátiles y adaptables, los humanos destacan en el comercio y la diplomacia.

### Cyborg
- **Bonificaciones**: 
  - +10% a habilidades de ingeniería
  - +5% a resistencia de armadura
- **Descripción**: Mezcla de humano y máquina, los cyborgs son excelentes ingenieros y tienen mayor resistencia.

### Alienígena
- **Bonificaciones**: 
  - +10% a velocidad de nave
  - +5% a capacidad de escudos
- **Descripción**: Seres de otros mundos con tecnología avanzada, destacan en velocidad y defensa.

### Sintético
- **Bonificaciones**: 
  - +10% a eficiencia de minería
  - +5% a capacidad de carga
- **Descripción**: Inteligencias artificiales en cuerpos robóticos, excelentes en minería y transporte.

## Ubicación Inicial

Todos los pilotos comienzan en el sistema solar "Nexus Prime", un sistema de alta seguridad en el centro del Imperio. Desde allí, pueden viajar a otros sistemas solares a medida que exploran el universo.

## Créditos Iniciales

Cada piloto comienza con 10,000 créditos, suficientes para comprar una nave básica y comenzar sus aventuras.

## Relación con Otros Sistemas

### Naves
Los pilotos pueden poseer múltiples naves, pero solo pueden pilotar una a la vez. Las naves determinan las capacidades de combate, minería y transporte del piloto.

### Corporaciones
Los pilotos pueden unirse a corporaciones, que son organizaciones de jugadores que trabajan juntos. Las corporaciones ofrecen beneficios como acceso a instalaciones especiales y misiones grupales.

### Habilidades
Los pilotos pueden desarrollar habilidades en diversas áreas como combate, minería, comercio, etc. Estas habilidades mejoran con el uso y proporcionan bonificaciones a las actividades relacionadas.

## Implementación Técnica

### Modelo de Datos

El piloto se implementa como un modelo en la base de datos con las siguientes relaciones:

- **Usuario**: Cada piloto pertenece a un único usuario (relación uno a uno).
- **Corporación**: Un piloto puede pertenecer a una corporación (relación muchos a uno).
- **Naves**: Un piloto puede poseer múltiples naves (relación uno a muchos).
- **Habilidades**: Un piloto puede tener múltiples habilidades (relación uno a muchos).
- **Ubicación**: Un piloto está ubicado en un sistema solar (relación muchos a uno).

### API

La API proporciona endpoints para:

- Crear un piloto
- Obtener información del piloto actual
- Actualizar atributos del piloto
- Obtener detalles específicos del piloto

Para más detalles sobre los endpoints de la API, consulte la [documentación de la API de pilotos](../api/pilots.md).

## Interfaz de Usuario

La interfaz de usuario para la creación y gestión de pilotos incluye:

- **Vista de Creación de Piloto**: Formulario para crear un nuevo piloto.
- **Vista de Inicio**: Muestra información del piloto y acciones rápidas.
- **Panel de Piloto**: Muestra estadísticas detalladas y habilidades del piloto.

## Futuras Mejoras

El sistema de pilotos se expandirá en el futuro con:

- Sistema de habilidades más detallado
- Especialización de pilotos
- Reputación con diferentes facciones
- Misiones específicas por raza
- Personalización de apariencia
