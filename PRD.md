# Resumen de Vaxav - MMO Espacial en Navegador Web

## Visión General
Vaxav es un juego multijugador masivo (MMO) basado en navegador con ambientación sci-fi retro. Los jugadores controlan pilotos en una galaxia sandbox donde pueden explorar, comerciar, minar recursos, participar en batallas y formar corporaciones. Inspirado en EVE Online pero adaptado a una interfaz web con gráficos minimalistas.

## Stack Tecnológico Propuesto
- **Backend**: 
  - PHP 8.3 con Laravel 12
  - Laravel/API (API RESTful con Eloquent ORM)
  - SQLite (inicial)
- **Frontend**: 
  - Vue (framework principal)
  - Axios (comunicación con API)
  - Pinia (gestión de estado)
  - Tailwind CSS (estilos)

## Estilo Visual
- Interfaz retro-futurista y minimalista
- Gráficos vectoriales simples para representación espacial
- Canvas con Konva.js para renderizado
- Paleta de colores inspirada en terminales clásicas

## Características Principales

### Sistema de Jugadores y Pilotos
- Un piloto por cuenta de usuario
- Diferentes razas con bonificadores específicos (Humanos, Cyborgs, etc.)
- Sistema de habilidades con 5 niveles por habilidad
- Certificados que agrupan habilidades en competencias específicas

### Universo del Juego
- Estructura jerárquica: Regiones > Constelaciones > Sistemas Solares
- Sistemas con estrellas, planetas, asteroides y estaciones
- Diversos tipos de planetas con recursos específicos
- Puertas estelares para viajar entre sistemas
- Niveles de seguridad variable (seguro, inseguro, nulo)

### Mecánicas de Juego
- Sistema de naves con diferentes clases y especializaciones
- Módulos equipables: armas, defensas, propulsión, utilidad
- Acciones basadas en temporizadores (minería, viaje, fabricación)
- Exploración de sistemas para descubrir recursos y anomalías
- Sistema económico con mercado dirigido por jugadores
- Corporaciones y alianzas con roles personalizables
- Sistema de guerras formales entre corporaciones

### Características Adicionales
- Misiones y agentes NPC de diferentes niveles
- Wiki interna integrada con el juego
- Sistema de comunicación con chats y mensajería
- Panel de administración completo

## Arquitectura Frontend-Backend

### Backend (API)
- Laravel como framework para la API RESTful
- Eloquent ORM para interacción con la base de datos
- Rutas API para todas las funcionalidades
- Autenticación segura con Sanctum
- Controladores para cada entidad principal
- Recursos API para formateo de respuestas
- Migraciones para gestión de esquema de base de datos
- Seeders para datos iniciales del juego

### Frontend (Vue)
- Estructura SPA (Single Page Application)
- Componentes para cada sección principal:
  - Dashboard del piloto
  - Mapa galáctico interactivo
  - Sistema de inventario
  - Panel de control de la nave
  - Mercado e intercambio
  - Gestión de corporaciones
- Pinia para gestión de estado global
- Axios para comunicación con la API
- Servicios por entidad (naves, pilotos, mercado, etc.)

## Roadmap Inicial (Ajustado para Vue)
1. **Fundación**:
   - Configuración del proyecto (Laravel + Vue)
   - Sistema de autenticación API + cliente Vue
   - Interfaz base con componentes Vue
   - Panel de control básico

2. **Mecánicas Core**:
   - Sistema de habilidades (API + componentes Vue)
   - Sistema de navegación con mapa interactivo
   - Implementación de recursos y inventario
   - Mecánicas de pilotaje

3. **Interacción**:
   - Sistema de comercio con Pinia para gestión de órdenes
   - Sistema de crafteo
   - Chat entre jugadores
   - Corporaciones básicas
   - Sistema de misiones

4. **Expansión**:
   - Sistema de guerra entre corporaciones
   - Conquista de sistemas
   - Crafteo avanzado
   - Razas y regiones adicionales
   - Eventos galácticos
