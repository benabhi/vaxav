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
- ~~Acordar una orden es una acción: lleva tiempo y paga Comercio.~~
- ~~Las órdenes vencen, y cuánto duran lo decide Contactos.~~

Acá el bucle se cerró por primera vez: viajás, minás, volvés, cobrás y comprás.
El mercado es **la única puerta para conseguir módulos**, y con él las cuatro
habilidades de Comercio dejaron de ser adornos: **Regateo** mueve la horquilla y
la comisión, **Contabilidad** el impuesto y cuántas órdenes podés llevar,
**Análisis de mercado** hasta dónde ves y **Contactos** cuánto dura lo que
publicás. Ver [el mercado](systems/MARKET.md).

### 3b · El escáner y las rocas · **hecho**

- ~~Un cinturón deja de ser un tanque de mineral y pasa a ser un campo de rocas.~~
- ~~Cada roca trae lo suyo, se agota y desaparece; el campo repone solo.~~
- ~~Escanear **una roca** es una acción, con su módulo como requisito duro.~~
- ~~La lectura es por piloto, tiene profundidad según habilidad y vence al día.~~
- ~~Sin lectura vigente no se puede minar: la piedra es un bulto en el radar.~~

Ir al cinturón dejó de ser un botón que siempre devuelve lo mismo. Se volvieron
mecánicos el **alcance de sensores** y dos habilidades que no movían ningún
número, **Escaneo** y **Prospección**, y **Ciencias** pasó a tener por fin una
fuente de experiencia: escanear es la única acción que la paga, y por eso pesa por
encima de uno. Ver [el universo](systems/UNIVERSE.md).

### 4 · Requisitos de habilidad e inyecciones · **a medias**

- ~~Los módulos y los cascos declaran qué habilidades piden.~~
- ~~Se hacen cumplir al volar y al equipar, en dos lugares y sólo dos.~~
- Las habilidades se desbloquean inyectándolas en el laboratorio de una estación.
- La pantalla de habilidades muestra qué módulos y qué cascos abre cada una.

El escalón dejó de ser una etiqueta: el E no pide nada —es el que vuela una nave
de astillero— y el A pide la habilidad de su sistema. Con eso, entrenar dejó de
ser un número que sube y pasó a ser una llave.

De ahí salió una regla que condiciona todo lo que venga: **sólo se gatea con
habilidades que se puedan entrenar**. La experiencia se deposita por rama, así que
pedir una de una rama sin fuente sería cerrar la puerta con la llave adentro.
Ingeniería consigue la suya con el taller de la etapa 7, y Combate con el combate.
Ver [naves](systems/SHIPS.md).

Lo que falta —la inyección y el laboratorio— va después de vender porque un
inyector cuesta plata: al revés sería una reja sin llave.

### El cuartel general · **a medias**

Va fuera de la numeración porque **no es una etapa del circuito**: no agrega un
verbo al juego, agrega herramientas para operarlo. Se construye en paralelo, y por
eso no empuja para atrás a las etapas que siguen.

- ~~Roles, permisos y el guardia del área.~~
- ~~El registro de eventos, escribiendo desde los servicios que ya existen.~~
- ~~La pantalla que lo lista, con su traza de actividad, sus filtros y su
  paginado.~~
- ~~El constructor de sistemas: estrellas, planetas, estaciones y las puertas
  conectadas a mano.~~
- La pantalla para administrar roles: crearlos, cambiarles permisos y
  asignárselos.
- La ficha de piloto desde administración, y las estadísticas.
- El mapa de la galaxia. La grilla de hexágonos ya está: cada sistema tiene su
  casilla y se la gana al conectar una puerta. Falta dibujarla —en lienzo, con
  zoom y filtros— primero en el cuartel, que es donde hace falta para ver
  callejones sin salida y ramales sueltos, y después en el juego.

El orden no es caprichoso: el registro va **primero** porque es lo que hace
auditables a todas las herramientas que vengan después. Una que crea entidades sin
dejar constancia es una que nadie puede revisar, y agregarle el registro más tarde
significa que lo que pasó hasta entonces se perdió. Ver
[administración](systems/ADMIN.md).

### 5 · Refinar

La refinería convierte mineral en material, con su merma.

### 6 · La puerta y el segundo sistema

Las puertas estelares como cuerpos del sistema, el salto como acción, y el
combustible que se gasta. Se vuelven mecánicos el alcance de salto y la eficiencia
de combustible.

- ~~La puerta como cuerpo, con su rumbo de la roseta y su gemela del otro lado.~~
- ~~El tanque con contenido: la nave guarda cuánto combustible le queda.~~
- ~~El salto como acción, con su costo y su tiempo dichos **antes** de apretar, y
  la pantalla de tránsito que dice de dónde a dónde.~~
- El combustible con nombre —helio-3— y dónde se carga: repostar en una estación,
  y el hielo del que sale.
- Repartir mineral propio y precios propios al segundo sistema, para que sea un
  lugar y no un pasillo.

### 7 · El taller

Recetas de módulos a partir de materiales refinados. El escalón marca qué
materiales pide: el de entrada se hace con lo de los Anillos, el de arriba exige
lo que sólo sale del Cinturón Exterior.

## Después

En orden de valor, no de dificultad: corporaciones, exploración de sistemas
nuevos, drones, combate, y estaciones de jugador. Cada uno espera a que el
circuito de abajo aguante su peso.

De ésos, el más cercano es **explorar**, y el mecanismo ya está construido: leer
una piedra desconocida es lo mismo que leer un sistema al que nadie fue. Lo que
falta no es el instrumento sino el lugar adonde llevarlo, y eso llega con la
puerta estelar de la etapa 6. Ver [universo](systems/UNIVERSE.md).

### Las cargas del láser, y por qué el árbol tiene que crecer

Un láser de extracción va a pedir **una carga específica para cada mineral**, como
en EVE: no se pica iridio con la carga del silicato. La carga es un consumible que
se compra, se lleva en la bodega y se gasta, y **cada tipo de carga tiene su
habilidad**.

Eso hace tres cosas a la vez. Le da al mineral escaso una segunda barrera que no
es el viaje —hay que tener la carga y saber usarla—; convierte la bodega en una
decisión antes de salir, porque el espacio que ocupa la carga no lo ocupa el
mineral; y **alarga el árbol de habilidades**, que es el punto.

Porque el catálogo de habilidades **se quiere grande a propósito**. Un juego idle
se mide en meses, y un árbol que se termina es un juego que se termina. Las
veintitrés de hoy son el esqueleto del primer circuito, no el destino: cada
sistema que se agregue —cargas, drones, fabricación, combate— trae las suyas, y
ésa es la forma en que el juego se hace largo sin inventar números más grandes.

El detalle fino de todo esto se decide **cuando el circuito esté cerrado**.
Afinarlo antes sería balancear una economía que todavía no existe.

### Anotado y sin hacer

Cosas decididas que no entraron todavía, para que no se pierdan entre una etapa y
la siguiente:

- **La ruta, dibujada mientras se viaja.** En el mapa de la galaxia, la línea
  entre origen y destino animada y de otro color; es la base de lo que va a
  necesitar el autopiloto para mostrar un recorrido de varios saltos. Y en el
  árbol del sistema, el cuerpo de destino destacado mientras se va hacia él.
- **La ficha de tránsito tiene que variar según a dónde se va.** Hoy cuenta igual
  un salto a otro sistema, un viaje a un cinturón y uno a una estación, y no son
  el mismo viaje.

## Lo que se decide en el camino

| Pregunta                                          | Se necesita en |
| ------------------------------------------------- | -------------- |
| ¿Se puede encolar más de una acción?              | Etapa 2        |
| ¿Qué se pierde al morir: la carga, la nave, nada? | Combate        |
| ¿El mapa es fijo o generado?                      | Etapa 6        |
| ¿Cuánto PvP directo y cuánto conflicto indirecto? | Combate        |
