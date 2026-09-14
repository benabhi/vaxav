# Hoja de ruta

> El orden en que se construye Vaxav y por qué ese orden. Cada etapa deja algo que
> se puede jugar; ninguna es sólo andamio.
>
> Ver también: [MVP](MVP.md) · [arquitectura](systems/ARCHITECTURE.md)

## Hecho

| Qué                    | Qué dejó                                                                     |
| ---------------------- | ---------------------------------------------------------------------------- |
| Esqueleto              | SvelteKit, estructura, configuración, tests                                  |
| Estilos y portada      | El sistema de diseño y la página pública                                     |
| Pilotos                | Alta en cuatro pasos, ingreso, sesión, base propia                           |
| Interfaz               | El HUD de Elite Dangerous, el Neocom y las pestañas                          |
| El universo en la base | Región, constelación, sistema, cuerpo y estación como filas; Ánfora sembrado |
| Naves                  | Cinco cascos, catálogo de módulos, la calculadora de equipamiento            |
| Motor de acciones      | Encolar, resolver perezoso e idempotente, informar. Primera acción: viajar   |
| Habilidades            | Curva, prerrequisitos, pozo por familia y la pantalla del árbol              |
| Bitácora               | El registro paginado de cada acción resuelta, con su aviso al volver         |

## Lo que falta

El diagnóstico que ordena todo lo que sigue: el juego tiene las piezas y casi
ninguna se toca con las demás. De los 25 atributos que calcula una nave, **dos**
mueven una mecánica; de las 23 habilidades, **trece** no alteran ningún número; la
bodega es una cifra sin contenido y los créditos no los escribe nadie.

Cerrar el primer circuito completo es lo que convierte eso en un juego: elegir
minero, viajar al cinturón, minar, volver a una estación, vender, comprar algo
mejor y desbloquear habilidades nuevas.

Las etapas van por **dependencia**: sin contenedor el mineral no tiene dónde caer,
sin mineral no hay qué vender, sin plata no hay con qué comprar.

### 0 · Desmontaje y enderezado · **hecho**

La única que no agrega un verbo. Va primera porque las siguientes tocan los mismos
archivos.

- ~~Fuera las pantallas cartel y la maqueta del chat.~~
- ~~Resolver una acción pasa a ser un despachador por clase.~~
- ~~El sistema sale de dónde está el piloto, no de una constante.~~
- ~~Ofrecer sólo la profesión que tiene algo que hacer.~~
- ~~La calificación A-E pasa a ser el escalón tecnológico.~~
- ~~Enderezar la documentación que quedó vieja.~~

### 1 · Ítems, bodega y libro mayor

Contenedores, montones de ítems y los dos libros —créditos e ítems—. Sin esto el
mineral no tiene dónde caer, y elegir mal la forma del contenedor es lo más caro
de revertir de todo el plan.

### 2 · Minar

Cinturones con contenido y agotamiento compartido que se recupera solo, la acción
de extraer, y la bodega con capacidad real. Se vuelven mecánicos la bodega, el
rendimiento de extracción y la estabilidad del acumulador.

### 3 · El mercado de la estación

Comprar y vender a precio fijo, con su asiento en el libro. Acá el bucle se cierra
por primera vez: viajás, minás, volvés, cobrás.

**Es la única puerta para conseguir módulos.** El equipamiento ya no los surte, así
que hasta que esta etapa exista sólo se monta lo que se trae puesto de fábrica. Es
también donde van la búsqueda y los filtros: el día que haya cientos de módulos, el
problema no es comprarlos sino encontrarlos.

### 4 · Requisitos de habilidad e inyecciones

Los módulos y los cascos piden habilidades, y las habilidades se desbloquean
inyectándolas en el laboratorio de una estación. Va después de vender porque un
inyector cuesta plata.

### 5 · Refinar

La refinería convierte mineral en material, con su merma.

### 6 · La puerta y el segundo sistema

Las puertas estelares como cuerpos del sistema, el salto como acción, y el
combustible que se gasta. Se vuelven mecánicos el alcance de salto y la eficiencia
de combustible.

### 7 · El taller

Recetas de módulos a partir de materiales refinados. El escalón marca qué
materiales pide: el de entrada se hace con lo de los Anillos, el de arriba exige
lo que sólo sale del Cinturón Exterior.

## Después

En orden de valor, no de dificultad: mercado entre pilotos, corporaciones,
exploración y prospección, drones, combate, y estaciones de jugador. Cada uno
espera a que el circuito de abajo aguante su peso.

De ésos, el más cercano es **el escáner**: hoy un cinturón revela todo lo que
tiene apenas llegás, y escanear es lo que convertiría eso en una actividad con
decisiones propias. Le daría además trabajo a Escaneo, a Prospección y al alcance
de sensores, que son tres cosas que hoy no mueven ningún número. Ver
[universo](systems/UNIVERSE.md).

## Lo que se decide en el camino

| Pregunta                                          | Se necesita en |
| ------------------------------------------------- | -------------- |
| ¿Se puede encolar más de una acción?              | Etapa 2        |
| ¿Qué se pierde al morir: la carga, la nave, nada? | Combate        |
| ¿El mapa es fijo o generado?                      | Etapa 6        |
| ¿Cuánto PvP directo y cuánto conflicto indirecto? | Combate        |
