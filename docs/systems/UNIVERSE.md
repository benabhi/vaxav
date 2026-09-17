# El universo

> **Implementado.** El universo vive en la base de datos y se carga con
> `npm run db:seed`. El plano —qué existe y dónde— está en
> `src/lib/game/universe.ts`.
>
> Ver también: [acciones](ACTIONS.md) · [facciones](FACTIONS.md) ·
> [naves](SHIPS.md)

## Cómo está organizado

```
Galaxia
└── Región                agrupación grande; a futuro define política y mercados
    └── Constelación      un puñado de sistemas vecinos
        └── Sistema       una estrella y todo lo que la orbita
            └── Cuerpo ↺  estrella, planeta, luna, cinturón o estación
```

Los cuerpos forman un **árbol**: la estrella no tiene padre, los planetas cuelgan
de ella, las lunas de los planetas y las estaciones de cualquiera de ellos. Una
sola tabla con tipo y padre, y no una por tipo: dibujar un sistema sería unir
cinco tablas y cada tipo nuevo obligaría a tocar el esquema.

**Toda estación es orbital.** Cuelga de un planeta, de una luna o de un cinturón;
no hay bases en superficie.

### La taxonomía es estricta

**Una constelación pertenece a una sola región, y un sistema a una sola
constelación.** Ninguna constelación tiene parte de sus sistemas en otra región.

No es una convención que haya que recordar: **la base no permite otra cosa.**
`constellation.region_id` es obligatorio y apunta a una región; `system` guarda su
constelación y **no guarda región alguna**, así que la región de un sistema se
deriva de su constelación y no hay dónde escribir una contradicción.

Esa es la razón de que no exista `system.region_id`, y conviene que siga sin
existir: dos caminos para la misma respuesta son dos que en algún momento dicen
cosas distintas.

### La taxonomía es un árbol; la posición, un grafo

Son dos cosas separadas y **nada obliga a que coincidan**. Dónde cae un sistema en
la grilla lo decide el rumbo de las puertas que lo unen al mapa; a qué
constelación pertenece lo decide quien lo crea. Se puede conectar un sistema de
una constelación a uno de otra sin problema, y así es como se arma una galaxia
interesante.

De ahí sale una **convención, ésta sí de las que hay que sostener a mano**: un
territorio debería ser un continente y no un archipiélago. Una constelación
desparramada en tres parches se dibuja como tres manchas del mismo color y deja de
significar algo mirando el mapa.

El constructor **no lo impide** —hacerlo ataría las manos al construir— pero el
sembrador de prueba lo respeta: cada constelación crece colgándose de los suyos, y
como las constelaciones de una región van seguidas, la región queda de una pieza.
El mapa es el que delata cuando esto se rompe.

El piloto siempre está **en un cuerpo concreto** de un sistema concreto: atracado
en una estación, en órbita de un planeta, dentro de un cinturón. Moverse entre
cuerpos del mismo sistema es una acción de viaje corta; entre sistemas, un salto,
que es más caro y pide Astrogación.

## Cómo se llaman las cosas

La nomenclatura es la de EVE, y no es un detalle de ambientación: **el nombre de
un cuerpo dice dónde está**. Con nombres propios sueltos hay que aprenderse el
mapa de memoria; con esta convención, leer un nombre es leer una dirección.

| Qué      | Cómo se llama                             | Ejemplo                 |
| -------- | ----------------------------------------- | ----------------------- |
| Estrella | El nombre del sistema                     | `Ánfora`                |
| Planeta  | Sistema + **número romano**, hacia afuera | `Ánfora III`            |
| Luna     | Planeta + **letra minúscula**             | `Ánfora III-a`          |
| Cinturón | Nombre propio, o `Anillos de <planeta>`   | `Anillos de Ánfora III` |
| Estación | **Nombre propio**                         | `Muelle de los Anillos` |

Los planetas se numeran **desde la estrella hacia afuera**, y las lunas en el
mismo orden dentro de su planeta. Así el número no es un rótulo: es la posición,
y `Ánfora IV` está más lejos que `Ánfora II` sin tener que consultar nada.

**Las estaciones son la excepción y llevan nombre propio.** Son obra de alguien
—una corporación las construyó y las bautizó— y un número las volvería
intercambiables, que es justo lo contrario de lo que son.

Eso deja un hueco: «Hábitat Talo» no dice dónde está. Se llena **al señalar el
nombre**, con el camino completo:

```
HÁBITAT TALO
  Orbita    Cinturón Exterior
  Sistema   Ánfora
  Región    Deriva Exterior
  Saltos    Acá
```

Va en un aviso y no escrito en la fila a propósito: una designación entera en cada
renglón de una tabla —cuerpo, sistema, región— empuja las cifras fuera de la
pantalla, y el noventa y nueve por ciento del tiempo no hace falta. Cuando hace
falta es una pregunta puntual sobre un renglón, y ahí aparece.

## Tipos de cuerpo

| Tipo                   | Qué lo caracteriza                         | Para qué sirve                                       |
| ---------------------- | ------------------------------------------ | ---------------------------------------------------- |
| Estrella               | Clase espectral, actividad                 | Referencia del sistema; algunas dañan si te acercás  |
| Planeta rocoso         | Temperatura, atmósfera, gravedad           | Minería de superficie, futuras instalaciones         |
| Gigante gaseoso        | Composición, anillos                       | Extracción de gases; sus anillos son campos minables |
| Luna                   | Tamaño, hielo                              | Agua y combustible                                   |
| Cinturón de asteroides | Densidad, riqueza, agotamiento             | Extracción de mineral                                |
| Estación               | Corporación que la opera, servicios, tasas | Atracar, reparar, refinar, comerciar                 |
| Puerta estelar         | Rumbo, adónde lleva, distancia de salto    | Salir del sistema                                    |

Cada cuerpo tiene **atributos que se traducen a mecánica**, no a ambientación:
una atmósfera densa encarece el aterrizaje, un cinturón agotado da menos por
ciclo, una estación de otra facción cobra más comisión.

## Sistema inicial propuesto: Ánfora

Una estrella amarilla tranquila en el borde de la región, con lo justo para
sostener las cuatro actividades del juego sin salir de casa. Es donde empiezan
todos los pilotos.

| Cuerpo                    | Tipo             | Detalle                                                                                                  |
| ------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| **Ánfora**                | Estrella clase G | Amarilla, estable                                                                                        |
| **Ánfora I**              | Rocoso abrasado  | Sin atmósfera, cara soleada a 400 °C; metales pesados en superficie                                      |
| **Ánfora II**             | Rocoso templado  | Atmósfera fina respirable con equipo; alberga Puerto Ánfora                                              |
| **Puerto Ánfora**         | Estación         | La principal: hangar, refinería, mercado y aduana. Parte de acá **el Dominio**                           |
| **Ánfora III**            | Gigante gaseoso  | Sus **anillos** son el campo de asteroides principal: silicatos y hierro                                 |
| **Muelle de los Anillos** | Estación         | Plataforma de acopio en órbita de Ánfora III. Parte de acá **la Concordia**                              |
| **Ánfora III-a**          | Luna helada      | Hielo de agua: combustible y soporte vital                                                               |
| **Planta Escarcha**       | Estación         | Puesto de agua y combustible en órbita de la luna. Poco más que tanques y una refinería                  |
| **Ánfora IV**             | Rocoso helado    | Lejano y pobre; buen escondite                                                                           |
| **Amarre Franco**         | Estación         | Carguero varado y reacondicionado en órbita de Ánfora IV. Sin bandera: no responde a ninguna de las tres |
| **Cinturón Exterior**     | Cinturón         | Disperso y peligroso; mineral raro para quien se anima                                                   |
| **Hábitat Talo**          | Estación         | Excavado en un asteroide del Cinturón Exterior. Parte de acá **el Pacto**                                |

Tres de las estaciones son los **puntos de partida** del juego: cada
[facción](FACTIONS.md) arranca en la suya. Mientras Ánfora sea el único sistema
conviven las tres acá; cuando el mapa crezca, cada facción va a tener su espacio.
El Amarre Franco no es de nadie, y ese es justamente su atractivo.

Las distancias se miden en **unidades de salto**. La duración base de un viaje es
proporcional a la distancia; los bonos hacen el resto (ver
[ACTIONS.md](ACTIONS.md)).

```
        Ánfora ☉
          │
     I ───┼─── II ──[Puerto Ánfora]
          │
        III ══ anillos ══ III-a
          │      └──[Muelle de los Anillos]
          │
         IV ──[Amarre Franco]
          │
    Cinturón Exterior ──[Hábitat Talo]
```

## Qué hay dentro de una estación: los módulos

Una estación no es un punto en el mapa: es un conjunto de **módulos**, y no todas
tienen los mismos. Que a una le falte el astillero cambia la ruta de un piloto
tanto como una distancia.

Se llaman módulos y no servicios a propósito: **son lo que un jugador
instala en su propia estación**, y conviene que el nombre lo diga desde ahora.

| Módulo           | Para qué                                        | Estado      |
| ---------------- | ----------------------------------------------- | ----------- |
| **Equipamiento** | Montar y desmontar los módulos de la nave       | **Andando** |
| **Bodega**       | Dejar carga guardada en tierra firme            | Etapa 1     |
| **Mercado**      | Comprar y vender en la estación                 | Etapa 3     |
| **Laboratorio**  | Inyectar habilidades, y más adelante clonar     | Etapa 4     |
| **Refinería**    | Convertir el mineral en material aprovechable   | Etapa 5     |
| **Taller**       | Fabricar módulos y componentes                  | Etapa 7     |
| **Astillero**    | Comprar naves y dejarlas en hangar              | Después     |
| **Contactos**    | Los agentes que reparten trabajo en la estación | Después     |
| **Tablón**       | Trabajos abiertos a cualquiera que pase         | Después     |

Cada uno tiene su **ficha** en el plano —nombre y qué se hace ahí—, y la pantalla
la muestra tal cual. En el mosaico se ve cuáles tiene instalados la estación y
cuáles no: eso solo ya dice qué clase de estación es. **No se anuncia en qué fase
llega cada uno**; se descubre a medida que se construye.

### El laboratorio, que todavía no existe

> **Decidido, sin implementar.** Sería el noveno módulo.

Hace dos cosas, y llegan en momentos distintos:

- **Inyectar habilidades.** Cada laboratorio surte una **lista reducida**, así que
  conseguir una habilidad rara es un viaje. Es lo que le da al mapa un motivo de
  progresión propio y no sólo de carga. Ver [habilidades](SKILLS.md).
- **Fabricar clones**, que es de lo que depende qué pasa cuando te matan. Sólo
  importa cuando exista el combate.

Que una estación lo tenga o no va a ser tan definitorio como que tenga astillero:
es la diferencia entre un puerto donde se puede crecer y uno donde sólo se pasa.

Los módulos son **datos de cada estación**, no una lista fija: una estación
minera del Cinturón puede tener refinería y no tener astillero, y una capital
puede tenerlo todo menos taller. En pantalla se ven como un **mosaico** con los
ocho, y los que la estación no tiene van apagados: así se lee de un vistazo qué
clase de estación es, y una baldosa apagada es —visualmente— la ranura vacía que
un jugador va a poder llenar.

Cada estación la **opera una corporación**, y esa corporación responde a una
facción o a ninguna. La facción de una estación se deriva de ahí y no se guarda
por separado. Ver [corporaciones](CORPORATIONS.md).

En las que tienen **Contactos** hay además **agentes**: NPC que reparten trabajo y
que pueden ser de otra corporación distinta a la que opera la estación. Cuántos
hay varía, y esa variación es contenido: un puerto con cuatro y un puesto
industrial con ninguno se distinguen antes de leer una línea. Ver
[agentes y misiones](MISSIONS.md).

## Qué está en las cartas

Cada cuerpo guarda si está **explorado**. Es el estado del **mundo**, no el de un
piloto: dice si el cuerpo figura en las cartas públicas, no si vos lo viste.

El sistema inicial está entero cartografiado —un piloto nuevo no tiene que salir a
descubrir dónde está parado— así que hoy la etiqueta dice siempre lo mismo. Se
muestra igual: cuando existan sistemas a medio levantar, la lista va a estar
leyéndose con esta misma etiqueta y nadie va a tener que aprender una nueva.

Que **cada piloto lleve su propio registro** de qué descubrió es otra cosa y otra
tabla, y llega con la cartografía.

## Gobierno y seguridad

Cada sistema tiene un **gobierno** y una **seguridad de 0 a 100**. El gobierno no
fija la seguridad: le fija la **banda** dentro de la cual puede moverse.

| Gobierno      | Banda  | Qué lo distingue                          |
| ------------- | ------ | ----------------------------------------- |
| Anarquía      | 0      | No hay a quién llamar                     |
| Feudal        | 10–35  | Manda alguien, no una ley                 |
| Colonia penal | 25–50  | **Vigilado, no protegido**                |
| Dictadura     | 30–60  | Orden por la fuerza, arbitrario           |
| Democracia    | 55–85  | Lento pero previsible                     |
| Corporativo   | 60–100 | Se paga la protección, y por eso funciona |

**Es un número y no cuatro cajones** porque este documento ya lo prometía más
abajo: «la seguridad es un gradiente, no un interruptor». Con cuatro niveles
derivados del gobierno, cincuenta sistemas caen en cuatro montones
indistinguibles, y dos de los seis gobiernos no significan nada por su cuenta —la
colonia penal y la dictadura eran el mismo sistema con otro nombre—.

La contradicción que había que evitar —«anarquía con seguridad alta»— la sigue
impidiendo la banda, que se valida antes de dejar entrar cualquier número.

Los cuatro cajones **siguen existiendo para leer**: `Sin ley` (0), `Baja` (1–34),
`Media` (35–64) y `Alta` (65–100). Una columna que dice «Media» se recorre de un
vistazo y una que dice `47` no. Las mecánicas usan el número. Las bandas cruzan
los cajones a propósito, y eso es justamente lo que hace que valga la pena
guardarlo.

### El techo del espacio sin dueño

Una facción controladora no es un rótulo: es **quién paga las patrullas**. Sin
ella, la seguridad no pasa de **50** por muy corporativo que sea el gobierno
local, y **el piso del gobierno no aplica**: un sistema sin dueño puede ser
cualquier cosa entre la nada y el techo, que es lo que uno espera de una
frontera. El piso es una garantía, y garantizarla es lo que hace una facción.

Es lo que le da por fin una consecuencia mecánica a la facción controladora.

### Lo que falta

La seguridad **todavía no la consume ninguna mecánica**: se guarda y se dibuja. El
consumidor más barato que ya tiene maquinaria es la horquilla del mercado —un
sistema peligroso paga más por el mineral y cobra más por los módulos— y el
siguiente son las patrullas y los piratas, cuando exista el combate. Hasta
entonces es un atributo dibujado, que es la clase de cosa que este proyecto
prefiere no tener.

## Quién controla qué

Un sistema puede tener una **facción controladora, o ninguna**, y ahí está lo
importante: como en EVE, las tres potencias van a controlar **un puñado de
sistemas**, y todo el resto es **espacio libre** para que lo reclamen las
corporaciones de jugadores.

El espacio de las facciones no se reclama nunca. La regla es una función pura
—`is_claimable`— y no un campo, para que no pueda quedar en un estado imposible.

Vaxav no tiene simulación de fondo como Elite: no hay facciones menores
disputándose sistemas por su cuenta. **El contenido lo mueven los jugadores**, así
que los estados intermedios —disputado, en guerra— llegan cuando existan las
mecánicas que los cambien.

Un sistema puede además ser la **capital** de la facción que lo controla, y una
facción tiene una sola: la base lo hace cumplir con un índice único parcial. Se
guarda de quién es capital y no un simple «sí/no», porque la pregunta que se le
hace no es «¿es capital?» sino «¿de quién?», y con un booleano nada impediría
escribir la capital de una facción que ni siquiera controla el sistema.

**Ánfora está bajo el Dominio, con gobierno corporativo y seguridad 78**: un
sistema de frontera administrado como una concesión comercial. Eso explica por qué las otras dos
potencias tienen estaciones ahí por acuerdo y no por conquista, y le da al sistema
inicial la seguridad alta que un piloto nuevo necesita.

## Las puertas estelares

Una puerta **es un cuerpo más** —`kind = 'gate'`— y no una tabla de cuerpos
aparte. Así aparece en el árbol del sistema, tiene distancia orbital y se le puede
viajar sin tocar una línea de lo que ya existe: es un lugar del sistema al que hay
que llegar antes de poder usarlo, que es exactamente lo que es.

Lo que sí es una tabla propia es **a dónde lleva**, porque es una relación entre
dos cuerpos y no un atributo de uno:

```
gate   id · body_id → body(kind='gate') · system_id → system
       bearing · destination_id? → body · jump_distance(décimas de a.l.)
       unique(body_id) · unique(system_id, bearing)
```

Apunta a **la puerta gemela y no al sistema**: llegar «a Vela» no alcanza, hay que
llegar a un lugar de Vela. Son dos filas, una por extremo, con la misma distancia,
y un test verifica que ninguna quede huérfana.

**El destino es anulable**, y ése es el orden en que uno construye: primero se
decide que de acá se sale hacia el norte, y después —a veces mucho después,
cuando el sistema del otro lado exista— se dice adónde va. Una puerta sin destino
es una obra en curso, no un error.

### La roseta, y la grilla de hexágonos

Cada puerta guarda por **qué lado del sistema sale**, de una roseta de seis: `n`,
`ne`, `se`, `s`, `sw`, `nw`. La base garantiza **un rumbo por sistema** con un
índice único, así que un sistema tiene seis salidas como mucho.

**Seis porque la galaxia es una grilla de hexágonos**, y un hexágono tiene seis
vecinos. Es la decisión de la que cuelga todo el mapa:

- En una cuadrícula con diagonales, cuatro de los ocho vecinos quedan a 1,41
  veces la distancia de los otros cuatro. Dos puertas iguales se dibujarían a
  distancias distintas, y el mapa mentiría sobre lo que cuesta un salto.
- En un hexágono, **los seis vecinos están exactamente a la misma distancia**, que
  es justo lo que un rumbo promete.

El hexágono es de **tapa plana**, así que los vecinos están arriba, abajo y en las
cuatro diagonales: no hay este ni oeste, porque a los costados de uno de ésos hay
un vértice y no una casilla.

Rumbos y no grados, además, porque lo que hace falta es que no se pisen: dos
puertas a 12° y 13° son un choque, dos en `n` y `ne` no lo son nunca.

### Dónde cae cada sistema

Las tres coordenadas de un sistema —`x`, `y`, `z`— son **coordenadas cúbicas de
hexágono**: tres enteros que suman cero. No es una casualidad afortunada que sean
tres; es la forma clásica de direccionar hexágonos, y la que hace que moverse,
medir distancias y buscar vecinos sean sumas y restas en vez de casos especiales
por fila par o impar. La tercera no sobra: es la que sostiene la invariante.

**No se escriben a mano.** El constructor ya no tiene campos para teclearlas,
porque una posición tecleada contradice los rumbos de sus propias puertas, que es
lo único que hace legible al mapa. La posición la decide el grafo.

**Y se decide al conectar, un salto por vez.** No hay un acomodado global que
recorra la galaxia: conectar dos puertas coloca al vecino en la casilla que dice
el rumbo, y con eso alcanza. Un acomodado global movería sistemas ya puestos —y el
mapa de todos los jugadores con ellos— cada vez que el constructor toca una
puerta, y ahí se pierde lo único que un mapa compartido tiene que dar: que «estoy
al norte de Ánfora» signifique lo mismo mañana.

Las reglas, en orden:

| Situación                                        | Qué pasa                                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| El vecino no está en el mapa                     | Se coloca en la casilla del rumbo                                                         |
| El vecino es un **ramal** que no está en el mapa | Se muda el ramal entero con el mismo desplazamiento, así su geometría interna se conserva |
| Los dos ya están puestos y cierran               | Nada que hacer: el mapa ya era coherente                                                  |
| Los dos ya están puestos y **no** cierran        | Es un **atajo**. Se conecta igual y el mapa lo dibuja torcido                             |
| La casilla de destino ya tiene dueño             | **Se rechaza.** Hay que elegir otro rumbo                                                 |

Estar en el mapa quiere decir **llegar caminando desde el primer sistema
sembrado**, que es el origen de la grilla. Tener una puerta conectada no alcanza:
un ramal armado aparte también las tiene y sigue sin estar en ningún lado.

**Lo que ya tiene casilla no se mueve nunca.** Es la regla que sostiene a todas
las demás.

**Y dos sistemas no pueden compartir casilla.** Se comprueba antes de mover, sobre
la isla entera y no sólo sobre el sistema que se conecta: un ramal se muda de una
pieza, así que cualquiera de sus miembros puede caer encima de algo.

Hace falta comprobarlo a mano porque **la base no lo impide**, ni podría: los
sistemas sin colocar comparten el origen a propósito, así que un índice único
sobre las coordenadas prohibiría justamente el estado normal de lo recién creado.
Sin la comprobación los dos quedan en la misma casilla, el mapa dibuja uno sobre el
otro y el de abajo desaparece sin que nada lo diga. Es el mismo error que el ramal
a la deriva —una posición que no significa lo que dice— sólo que más difícil de
ver.

### Los atajos

Al conectar dos puertas se propone el **rumbo opuesto** para la gemela —de Ánfora
se sale al norte, desde el otro lado se vuelve por el sur— pero es una sugerencia:
una galaxia donde todo cierra en espejo es una grilla, y un mapa interesante tiene
atajos torcidos.

Un atajo es una puerta cuyas dos puntas **no son vecinas en la grilla**. No es un
error ni algo que haya que arreglar: es un pasaje que se salta el camino largo, y
el mapa lo dibuja distinto justamente para que se vea. `isShortcut` los reconoce.

### El paso cerrado

Una puerta puede **cerrarse**: existe, sigue llevando adonde llevaba, y no se
cruza. No es lo mismo que no estar conectada —eso es obra a medio hacer— sino una
decisión: es lo que hace falta para **aislar un sistema** sin borrarle las salidas
ni moverle la casilla a nadie. Una cuarentena, un bloqueo de facción, un evento
del mundo.

Se guarda en **las dos puntas**, porque una puerta cerrada de un lado está cerrada
y punto: leer sólo la punta de acá dejaría entrar a quien viene de la otra, que es
el peor modo de fallar —parece que anda hasta que alguien lo prueba al revés—.

El motivo sale antes que el alcance y el combustible: una puerta cerrada no se
cruza con mejor nave ni con más tanque, y decir «te falta alcance» sería mandar al
jugador a gastar en algo que no lo va a dejar pasar igual.

### El mapa

La galaxia se dibuja sobre un lienzo y es **la figura de su pantalla**. Contesta
lo que ninguna tabla contesta: la forma del conjunto, dónde quedó el agujero, qué
ramal no llega a ninguna parte.

**Está en dos pantallas y se arma una sola vez.** El cuartel lo mira en
`/admin/universo` para construir; el piloto lo mira en `/navegacion/galaxia` para
navegar. La galaxia es la misma —los sistemas están donde están y las puertas unen
lo que unen—, así que `views/galaxy.ts` la arma para las dos. Lo que cambia es
**quién la mira**, y eso viaja aparte. Tenerla dos veces sería tener dos galaxias
que se van separando: un atajo que en una pantalla se dibuja y en la otra no.

Lo que el trazo codifica:

| Se ve                              | Quiere decir                                         |
| ---------------------------------- | ---------------------------------------------------- |
| Línea llena                        | Una puerta que sigue la grilla                       |
| Línea gruesa, naranja claro        | Una **salida del sistema elegido**                   |
| Línea punteada, en cian            | Un **atajo**: sus puntas no son vecinas              |
| Línea roja con un tajo al medio    | El **paso está cerrado**                             |
| Un brazo corto amarillo            | Una **puerta sin conectar**, saliendo hacia su rumbo |
| Un anillo rojo alrededor del punto | El sistema **no llega** hasta la semilla             |

Los tres últimos son trabajo a medio hacer que sólo se ve mirando el conjunto: el
contador de arriba dice **cuántos** hay, el mapa dice **dónde**.

La leyenda no es un adorno: un mapa que codifica cinco cosas en el trazo y ocho
en el color y no dice cuáles es un mapa que hay que adivinar. Cómo se ordena para
que trece entradas se lean está en [interfaz](INTERFACE.md#el-mapa-de-la-galaxia-y-su-marco).

**Elegir un sistema resalta sus salidas**, en las dos pantallas. Elegir es
preguntar «¿y desde acá adónde se va?», y sin resaltarlas hay que seguir la línea
con el dedo entre todas las demás. Se resaltan **las directas y nada más**: el
camino completo hasta el otro extremo de la galaxia es otra pregunta, y pintarlo
entero dejaría el mapa iluminado de punta a punta.

Y se dibujan **al final**. En un lienzo el orden de dibujo es la profundidad, así
que una línea resaltada pintada en su turno queda debajo de la maraña de las
normales, que es justo lo que se estaba tratando de leer. Cuando la salida es
además del sistema donde está el piloto, gana esa lectura: dice si la podés
cruzar, que es más de lo que dice estar elegida.

Se dibuja en Canvas 2D **sin biblioteca**, como todas las figuras del juego, y
**sin bucle de cuadros**: se redibuja cuando algo cambia. Ésta es una pestaña que
va a quedar abierta horas.

Los controles —encuadrar, dónde estoy, agrandar— flotan **en la esquina del mapa y
no en una barra al lado**. Son del mapa: agrandado no hay barra al lado, y un
control que desaparece justo cuando hace más falta no es un control. Apoyados
abajo, además, le comían una franja de galaxia entera para dos botones.

#### Los territorios

El mapa puede pintar por debajo la **región** o la **constelación** de cada
sistema, y es un interruptor porque no siempre se está mirando eso.

Se dibuja con relleno muy tenue y **borde sólo en la frontera**: un lado se traza
cuando la casilla vecina es de otro dueño, que es la definición de frontera.
Contornear cada casilla convierte el mapa en un panal y se pierde la forma del
territorio, que es justo lo que se vino a ver.

Por el mismo motivo, **con territorios encendidos se apaga la retícula de cada
sistema**. El relleno ya dice de quién es la casilla, y el hexágono tenue encima
le devuelve la textura de panal a lo que se quiere leer como un continente: así el
único contorno que queda es el que rodea la región entera.

El nombre del territorio va en su centro y **sólo de lejos**: los dos rótulos se
turnan, porque de lejos la pregunta es «dónde estoy en la galaxia» y de cerca «qué
sistema es cada punto». Y el que chocaría con otro no se dibuja —se ordenan de
mayor a menor, así que el que queda afuera es el más chico—.

Va **con su recuadro y dibujado al final**. Las dos cosas por el mismo motivo: en
un lienzo el orden de dibujo **es** la profundidad, y un rótulo pintado junto con
el relleno del territorio queda debajo de las puertas, los hexágonos y los nombres
de los sistemas. El recuadro opaco lo despega de todo eso de una vez, que un
contorno solo no lograba.

Para que esto sirva, **un territorio tiene que ser contiguo**: una región es un
continente, no un archipiélago. El sembrador de prueba lo garantiza haciendo que
cada constelación crezca colgándose de los suyos.

#### Qué sabe el mapa de quien lo mira

Todo lo que depende del piloto va **aparte del mapa y no adentro**, en
`PilotoEnElMapa`: dónde está parado, a cuántos saltos le queda cada sistema y por
qué no puede cruzar tal puerta. Dos pilotos abren la misma galaxia y ven cosas
distintas —uno cruza una puerta que al otro no le alcanza el tanque—, y meter eso
en el dato del mapa obligaría a rearmarlo entero por piloto.

Los saltos se cuentan con un recorrido a lo ancho sobre el grafo de puertas, y con
dos reglas que importan:

- **Un paso cerrado no es un camino.** Lo que se lee como «a dos saltos» tiene que
  ser una ruta que el piloto pueda hacer, no una que exista en el plano.
- **Lo que no está en la cuenta no se alcanza**, que no es lo mismo que estar
  lejos. Un número grande diría que hay camino; a veces no lo hay.

Y **saltos, no casillas**: dos sistemas que se ven lejísimos pueden estar a uno
solo si los une un atajo.

#### Los colores

Dos reglas distintas, a propósito:

- **La facción tiene su color en el catálogo** —rojo el Dominio, azul la
  Concordia, verde el Pacto— porque son tres y son identidad del juego. Ver
  [facciones](FACTIONS.md#el-color-de-cada-una).
- **La región y la constelación lo generan de su nombre, y se puede pisar.** Son
  muchas y las crea quien construye, así que el automático es lo que hace que
  ninguna quede sin color y nadie tenga que decidir nada: el tono sale de un hash
  multiplicado por el ángulo áureo, el mismo nombre da siempre el mismo color, hay
  trescientos sesenta disponibles y nombres parecidos no caen en tonos parecidos.

  Y se puede elegir uno, en el alta y en el modal de territorios. **Vacío no es un
  dato que falte: es «usá el automático»**, que es la opción de entrada y abre la
  rueda con el tono que le tocaría a ese nombre.

  El selector es **el del navegador**, envuelto para que parezca del HUD. No es una
  librería: es un control nativo, como el campo de texto que envuelve `TextField`,
  y trae gratis la rueda completa, el hexadecimal a mano y el cuentagotas del
  sistema. Escribir una rueda propia sería reimplementar peor algo que ya está en
  todas las máquinas.

  La cuenta vive en `src/lib/palette.ts`, que la comparten el mapa, el selector y
  la vista: tres copias serían tres colores para la misma región.

#### Agrandado

El mapa tiene un botón en su esquina que lo lleva a **pantalla completa**, y se
sale con él o con Escape.

**Ahí no queda nada más que la galaxia.** Sin el marco del panel, sin la tabla,
sin los filtros ocupando lugar: lo que hace falta —la ficha del sistema, las
leyendas, los filtros— flota encima del lienzo y se pliega. Agrandar el mapa es
para mirar el mapa, y un mapa rodeado de recuadros es el mapa chico con más
píxeles.

**Los filtros y la ficha se pliegan con su botón**, cada uno en su esquina, y con
estados de entrada opuestos a propósito: los filtros arrancan plegados porque no
hacen falta hasta que se los busca, y la ficha desplegada porque es lo que se lee
al tocar un sistema, que es lo que uno hace apenas agranda. El botón de la ficha
**dice de qué sistema habla**: plegada es lo único que queda, y si dijera sólo
«Sistema» habría que abrirla para saber de cuál.

Y la columna de la ficha **no atrapa el mouse** donde no hay nada: sólo el botón y
la ficha lo hacen. Un rectángulo invisible de veinte rem sobre el lienzo se comería
los arrastres de toda esa franja, y eso se siente como un mapa roto.

Se dibuja **una sola de las dos versiones**, nunca las dos a la vez: dejar la de
abajo escondida repetiría el identificador de cada campo del filtro, y dos
controles con el mismo `id` rompen las etiquetas de los dos.

Eso obliga a que **la cámara viva en la pantalla y no en el mapa**: cambiar de
versión lo vuelve a montar, y con la vista adentro del componente cada expansión
volvería al encuadre inicial. Al agrandar sí se reencuadra a propósito —un
encuadre hecho para un recuadro de veintiséis rem deja la galaxia corrida en una
pantalla entera— pero al volver se conserva lo que se estaba mirando.

#### El mapa del piloto

La pestaña Galaxia de Navegación es **el mismo mapa con otras piezas alrededor**.
Es el tercer acercamiento —el cuerpo, el sistema, la galaxia— y contesta lo que
los otros dos no pueden: dónde queda esto que estoy mirando.

Qué cambia, y por qué:

| En el cuartel                       | En la cabina                                       |
| ----------------------------------- | -------------------------------------------------- |
| Abre encuadrando toda la galaxia    | Abre **centrada en tu sistema**, con el zoom cerca |
| Dibuja la deuda de obra             | **No la dibuja**                                   |
| Todas las conexiones se ven igual   | Las tuyas se leen en **tres estados**              |
| Ficha con casilla, cuerpos y rumbos | Ficha con **servicios y salidas**                  |
| Filtra por gobierno y constelación  | Sin gobierno ni constelación                       |
| Tabla de sistemas debajo            | **Sin tabla**                                      |

- **Abre centrada en tu sistema.** La primera pregunta de un piloto es dónde está,
  no cómo es la galaxia; encuadrar sesenta sistemas para contestarla lo deja
  buscándose a sí mismo en un plano. El marcador de «estás acá» es un aro doble en
  cian y **no se apaga con los filtros**: un marcador que un recorte puede esconder
  falla justo cuando hace falta.

  Y la cámara tiene **dos botones, no uno**, porque son las dos preguntas del mapa
  y son opuestas: **«dónde estoy»** la lleva a tu sistema, se le acerca y lo deja
  elegido —es con el que se vuelve después de andar mirando lejos— y
  **«encuadrar»** se aleja hasta que entre la galaxia entera.

- **La deuda de obra no viaja.** Ni las puertas sin conectar ni los sistemas a la
  deriva. Un ramal a medio construir no es un lugar misterioso, es trabajo
  pendiente de otro, y para el piloto sencillamente no se puede llegar.
- **Las salidas de tu sistema se leen en tres estados**: la que podés cruzar va
  encendida y gruesa, la que sale de acá pero no alcanza va punteada y apagada, y
  el resto de la galaxia queda de fondo. La línea no dice sólo que hay un pasaje:
  dice si **vos** podés usarlo. El motivo sale de `jumpProblem`, la misma función
  pura que apaga el botón en Ubicación y que usa el servicio para rechazar la
  orden, así que el mapa, la ficha y el servidor dicen exactamente lo mismo.
- **La ficha muestra lo accionable**: a cuántos saltos queda, quién manda, cuánta
  ley hay y **qué servicios tiene** —juntando los de todas sus estaciones, porque
  desde el mapa la pregunta es «¿dónde refino?» y no «¿en cuál de sus tres
  estaciones está la refinería?»—. La casilla y el contenido crudo se quedan en el
  cuartel, que es donde significan algo.
- **Se filtra por servicio**, igual que en el cuartel: es el único filtro que
  contesta «¿me conviene ir?» en vez de «¿cómo es ese lugar?». No se filtra por
  constelación ni por gobierno: son vocabulario de quien arma la galaxia. Las constelaciones sí se
  **pintan**, y la diferencia no es un descuido —pintadas dibujan el terreno y se
  leen sin saber cómo se llaman; filtrar por ellas pide conocer el nombre de
  antemano—.
- **Sin tabla de sistemas.** Hoy sería una lista de nombres sin nada que decidir.
  Se gana el lugar el día que haya mercados por sistema o servicios que valgan un
  viaje, que es cuando va a haber algo que ordenar.

**Desde el mapa no se salta.** Cruzar una puerta exige estar parado en ella, así
que lo que el mapa ofrece es **viajar hasta la puerta** —una orden que ya existe—
y el salto sigue ocurriendo en Ubicación. Cada salida dice las dos mitades de lo
que cuesta: el viaje hasta la puerta y el salto de después, **aunque el salto no se
pueda dar**. Enterarse de que faltan doce de combustible al llegar a la puerta es
un viaje perdido.

## Cómo se agrega contenido

Hay **dos puertas de entrada**, y desde que existe el constructor la que manda es
la segunda:

1. **El plano**, en `src/lib/game/universe.ts`: datos puros, sin base de datos ni
   interfaz, que `npm run db:seed` escribe en la base.
2. **El constructor de sistemas**, en el cuartel general. Ver
   [administración](ADMIN.md).

### La base manda

La siembra **crea lo que falta y no toca una fila que ya exista**. Antes el plano
era la verdad y la siembra lo imponía: corregir el nombre de un planeta era editar
el archivo y volver a correrla. Eso dejó de ser correcto el día que se pudo editar
el universo desde una pantalla, porque cada `npm run db:seed` desharía en silencio
todo lo que alguien hubiera armado, que es la clase de error que no se nota hasta
que el trabajo ya se perdió.

Vale para todo: los módulos de una estación, sus agentes y los minerales de un
cinturón tampoco se sincronizan más. Un módulo que no está en el plano puede
haberlo instalado alguien, y borrárselo sería lo mismo.

**La contrapartida hay que decirla**: corregir el plano ya no corrige la base —se
corrige desde el constructor, o borrando la base y volviendo a sembrar—, y
`data/vaxav.db` dejó de ser desechable. Es la única copia del universo y está
fuera de git.

El plano queda como **la semilla del primer arranque**: lo que hace que una base
vacía tenga un lugar donde empezar. El día que exista un generador de galaxias, va
a producir estas mismas estructuras y entrar por la misma puerta.

## Reglas de diseño

- **Un sistema alcanza para empezar.** Mejor un lugar con cosas que hacer que un
  mapa vacío de cien.
- **Los recursos se agotan y se recuperan.** Un cinturón muy trabajado rinde
  menos por un tiempo: obliga a moverse y genera competencia real entre pilotos.
  La reserva es **una sola y la comparten todos**, y la recuperación se calcula al
  mirar el cinturón, sin ningún proceso recorriendo el universo.
- **Nada es seguro del todo.** La seguridad es un gradiente, no un interruptor:
  cerca de la estación hay vigilancia, en el Cinturón Exterior no hay nadie.
- **El universo vive en la base de datos**, no en constantes del código: región,
  constelación, sistema, cuerpo y estación son filas. Agregar un sistema no
  requiere un despliegue, sólo sembrar de nuevo.
- **El piloto está parado en un cuerpo**, no en un nombre: su ubicación es una
  clave foránea, así que no puede apuntar a un lugar que no existe.

### Un cinturón es un campo de rocas

Un cinturón **no es un tanque de mineral**: es un campo de rocas, y cada una tiene
lo suyo. La diferencia no es de vocabulario. Con el mineral a nivel del cuerpo,
extraer era elegir de una lista que ya venía escrita; con rocas hay que mirar cuál
es cuál, y una roca que se agota **desaparece** en vez de bajar un número.

El depósito del cinturón sigue existiendo, pero cambia de papel: pasa a ser **el
plano**. Dice qué minerales puede dar ese cinturón, cuánto aguanta y a qué ritmo
se repone. Las rocas son los ejemplares que ese plano genera. Así el agotamiento
sigue siendo compartido —las rocas son de todos y el que llega primero se las
lleva— y sigue recuperándose solo, pero a una escala que se puede señalar con el
dedo.

| Regla              | Valor | Por qué                                                                         |
| ------------------ | ----- | ------------------------------------------------------------------------------- |
| Rocas por cinturón | 8     | Las suficientes para tener que elegir; las pocas para que la lista quepa entera |
| Tamaño mínimo      | 40 %  | Del tamaño típico de ese mineral en ese cinturón                                |
| Tamaño máximo      | 160 % | Encontrar una grande tiene que ser un hallazgo, no un promedio                  |

El tamaño típico sale de repartir lo que el cinturón aguanta de ese mineral entre
sus rocas, así que **un cinturón rico da rocas grandes y uno pobre las da
chicas**, sin una segunda tabla de tamaños que mantener en pareja con la primera.

**Las rocas se generan de forma perezosa**, como todo lo demás acá: no hay ningún
proceso sembrando piedras. Al mirar un cinturón se repone lo que el tiempo
transcurrido permite, usando la marca del plano para que mirarlo dos veces
seguidas no genere dos veces. Un campo lleno no acumula tiempo parado: lo que
sobra se descarta, o el próximo hueco se llenaría de golpe.

**Sembrar no rellena.** Un cinturón virgen recibe su primera tanda —si no,
quedaría pelado hasta que pasara el tiempo, porque su marca es de recién—, pero
uno que ya tiene rocas no recibe ninguna. Un despliegue no le devuelve el campo a
nadie.

### El escáner: saber qué tiene esa piedra

Un cinturón se ve desde el árbol del sistema, y sus rocas se ven desde lejos —son
bultos en el radar—, pero **de qué son y cuánto tienen no se sabe sin apuntarles
el escáner**. Escanear es una acción con su tiempo, como minar o viajar, y lo que
deja escrito es una **lectura**.

Tres decisiones ordenan todo lo demás:

1. **El requisito duro es el módulo.** Sin un escáner montado no hay nada que
   hacer, por mucha habilidad que se tenga: es un instrumento, no una corazonada.
   El minero sale del astillero con uno puesto.
2. **La habilidad gobierna cuánto se ve, no si se ve.** Si la habilidad fuera el
   permiso, un minero nuevo no podría escanear nunca: Escaneo es de **Ciencias**,
   los pozos de experiencia son por rama, y **escanear es lo único que paga
   Ciencias**. Sería una puerta cerrada con la llave adentro.
3. **La lectura envejece.** La roca es de todos y se agota entre todos, así que lo
   que uno vio ayer puede no ser lo que hay hoy.

| Profundidad    | Qué revela                          | Qué hace falta                    |
| -------------- | ----------------------------------- | --------------------------------- |
| Superficial    | De qué es la roca                   | Nada: sólo el instrumento         |
| Con cantidades | Además, cuánto le queda             | **Escaneo** 1                     |
| Completa       | Además, a qué ritmo repone el campo | **Escaneo** 1 + **Prospección** 1 |

**La lectura es por piloto**, no una propiedad de la roca: es de quien la miró.
Dos pilotos en el mismo campo pueden tener identificadas rocas distintas, y el que
tenga una lectura vieja está mirando la foto de ayer de una piedra que cualquiera
pudo estar picando mientras tanto.

Una lectura vale **un día**. Pasado eso **no se borra**: se muestra con su
antigüedad y el piloto decide. Lo que sí hace es dejar de habilitar la extracción,
porque encenderle el láser a una roca con datos de la semana pasada es apostar.
Una roca que se termina **se lleva sus lecturas**: nadie tiene que quedar
recordando una piedra que ya no existe.

El tiempo de una lectura sale del **alcance de sensores** del escáner montado
—mejor instrumento, menos pasadas— y tiene **piso**, como toda actividad del
juego: por mucho que se monte, mirar lleva un rato.

Esto es lo que le da trabajo a dos habilidades que no movían ningún número, lo que
convierte al alcance de sensores en algo que se elige al equipar, y sobre todo lo
que convierte "ir al cinturón" en una actividad con decisiones propias en vez de
un botón que siempre devuelve lo mismo. Es además el mecanismo que va a servir
para explorar sistemas nuevos: lo que se aprende de una piedra desconocida es lo
mismo que se va a aprender de un sistema al que nadie fue.

## Cómo se llama la parte civilizada

**Sin decidir todavía, pero hay que decidirlo temprano**, porque es una palabra que
va a aparecer en cien textos del juego y cambiarla después es reescribirlos todos.

Es el centro del sector: donde están las tres facciones, sus estaciones, sus
corporaciones y la ley. Lo que hay más allá no tiene dueño ni patrullas. Todo juego
del género le puso nombre a eso —EVE tiene «el imperio», Elite «la burbuja»— y
sirve para lo mismo: que un piloto pueda decir en una frase dónde está y qué clase
de lugar es. La prueba de fuego es la frase opuesta, que se va a usar más que el
nombre: **«fuera de …»**.

| Nombre           | Qué sugiere                                                                                                  | Y la frase opuesta  |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ------------------- |
| **La Rada**      | El fondeadero resguardado. Sigue el vocabulario que el juego ya habla —puerto, muelle, amarre, casco, rumbo— | fuera de la rada    |
| **El Amparo**    | Lo protegido. No dice quién protege, y eso lo hace funcionar para las tres a la vez                          | fuera del amparo    |
| **El Perímetro** | Lo defendido y vigilado. Más militar y más frío, muy de HUD                                                  | fuera del perímetro |
| **La Cuenca**    | Geografía, como las regiones-continente: el lugar donde todo desemboca                                       | fuera de la cuenca  |

**A definir.** De las cuatro, la que más cerca estuvo es **El Perímetro**, y no
convence del todo: dice bien lo que hay que decir —adentro hay ley, afuera no— pero
suena más a operación militar que a un lugar donde vive gente. Ninguna de las
cuatro choca con una palabra ya ocupada; región, constelación, cinturón y borde
tienen dueño.

Queda abierto a propósito y no se usa ninguna mientras tanto: escribir textos con
un nombre provisorio es garantizar que quede la mitad sin cambiar el día que se
elija otro. Cuando se decida, la palabra entra en [la voz](../DESIGN.md) como
término fijo y se usa igual en toda la interfaz.

## Por decidir

- Si el mapa es fijo y curado, o generado por procedimiento a partir de semillas.
- Cuántos sistemas tendrá la primera región, y cómo se conectan.
- Si hay descubrimiento: sistemas que no existen en el mapa hasta que alguien los
  cartografía.
- Si las estaciones se pueden construir, o son siempre de una facción.
