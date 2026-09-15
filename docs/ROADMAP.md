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

El diagnóstico que ordenó todo esto: el juego tenía las piezas y casi ninguna se
tocaba con las demás. De los 25 atributos que calcula una nave, **dos** movían una
mecánica; de las 23 habilidades, **trece** no alteraban ningún número; la bodega
era una cifra sin contenido y los créditos no los escribía nadie.

De eso ya se pagó buena parte: la bodega tiene contenido, el rendimiento de
extracción decide cuánto traés, los créditos existen y ocho habilidades dejaron de
ser decorativas. El circuito de un minero cierra de punta a punta —viajar, minar,
volver, vender, comprar, montar— y hay un mercado entre jugadores donde los
precios los deciden ellos. Lo que falta es lo que lo hace crecer: aprender
habilidades nuevas, refinar lo que se saca, salir del sistema y fabricar.

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

### 1 · Ítems, bodega y libro mayor · **hecho**

- ~~Contenedores, montones de ítems y los dos libros —créditos e ítems—.~~
- ~~La bodega de la nave y la de la estación, con lo que se baja de una ranura.~~
- ~~El minero sale con su equipo de minería puesto.~~

### 2 · Minar · **hecho**

- ~~Cinturones con contenido y agotamiento compartido que se recupera solo.~~
- ~~La acción de extraer, con la regla del piso de tiempo.~~
- ~~La bodega con capacidad real, y el informe contando el botín.~~
- ~~Confirmar antes de encargar una orden.~~

Se volvieron mecánicos la bodega, el rendimiento de extracción y la estabilidad
del acumulador, y con ellos **Minería, Ingeniería de bodega, Estiba y Gestión de
energía**.

### 3 · El mercado regional · **hecho**

- ~~Comprar y vender contra la estación, con su asiento en los dos libros.~~
- ~~Órdenes de compra y de venta entre pilotos, con garantía.~~
- ~~Comisión al publicar e impuesto al vender, los dos con piso.~~
- ~~El mercado en el Neocom, con alcance por regiones.~~
- ~~Propiedades: qué tenés y dónde, en toda la galaxia.~~
- ~~El historial de precios de cada ítem.~~

Acá el bucle se cerró por primera vez: viajás, minás, volvés, cobrás y comprás.
El mercado es **la única puerta para conseguir módulos**, y con él las cuatro
habilidades de Comercio dejaron de ser adornos: **Regateo** mueve la horquilla y
la comisión, **Contabilidad** el impuesto y cuántas órdenes podés llevar, y
**Análisis de mercado** hasta dónde ves. Ver [el mercado](systems/MARKET.md).

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
