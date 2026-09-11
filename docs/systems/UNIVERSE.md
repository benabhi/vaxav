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

El piloto siempre está **en un cuerpo concreto** de un sistema concreto: atracado
en una estación, en órbita de un planeta, dentro de un cinturón. Moverse entre
cuerpos del mismo sistema es una acción de viaje corta; entre sistemas, un salto,
que es más caro y pide Astrogación.

## Tipos de cuerpo

| Tipo                   | Qué lo caracteriza                         | Para qué sirve                                       |
| ---------------------- | ------------------------------------------ | ---------------------------------------------------- |
| Estrella               | Clase espectral, actividad                 | Referencia del sistema; algunas dañan si te acercás  |
| Planeta rocoso         | Temperatura, atmósfera, gravedad           | Minería de superficie, futuras instalaciones         |
| Gigante gaseoso        | Composición, anillos                       | Extracción de gases; sus anillos son campos minables |
| Luna                   | Tamaño, hielo                              | Agua y combustible                                   |
| Cinturón de asteroides | Densidad, riqueza, agotamiento             | Extracción de mineral                                |
| Estación               | Corporación que la opera, servicios, tasas | Atracar, reparar, refinar, comerciar                 |

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

Se llaman módulos y no servicios a propósito: **en F15 son lo que un jugador
instala en su propia estación**, y conviene que el nombre lo diga desde ahora.

| Módulo           | Para qué                                        | Llega en  |
| ---------------- | ----------------------------------------------- | --------- |
| **Astillero**    | Comprar naves y dejarlas en hangar              | F6        |
| **Equipamiento** | Montar y desmontar los módulos de la nave       | F6        |
| **Bodega**       | Dejar carga guardada en tierra firme            | F8        |
| **Mercado**      | Órdenes de compra y venta de la estación        | F10       |
| **Refinería**    | Convertir el mineral en material aprovechable   | F11       |
| **Taller**       | Fabricar módulos y componentes                  | F11       |
| **Contactos**    | Los agentes que reparten trabajo en la estación | sin fecha |
| **Tablón**       | Trabajos abiertos a cualquiera que pase         | sin fecha |

Cada uno tiene su **ficha** en el plano —nombre, qué se hace ahí y en qué fase
empieza a funcionar—, y la pantalla la muestra tal cual: es más honesto que un
botón que no hace nada.

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
tabla, y llega con la cartografía en F13.

## Gobierno y seguridad

Cada sistema tiene un **gobierno**, y de él sale su **seguridad**. Son seis
tomados de Elite, que cubren todo el arco:

| Gobierno      | Seguridad |
| ------------- | --------- |
| Anarquía      | Sin ley   |
| Feudal        | Baja      |
| Colonia penal | Media     |
| Dictadura     | Media     |
| Democracia    | Alta      |
| Corporativo   | Alta      |

**La seguridad no se guarda: se calcula.** Con las dos cosas en la base, tarde o
temprano se contradicen, y "anarquía con seguridad alta" es el error que nadie
nota hasta que un jugador lo explota. De esta tabla van a salir después las
defensas del sistema y qué NPC aparecen: cerca de lo corporativo, patrullas y
comerciantes; cerca de la anarquía, piratas y contrabandistas.

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

**Ánfora está bajo el Dominio, con gobierno corporativo**: un sistema de frontera
administrado como una concesión comercial. Eso explica por qué las otras dos
potencias tienen estaciones ahí por acuerdo y no por conquista, y le da al sistema
inicial la seguridad alta que un piloto nuevo necesita.

## Cómo se agrega contenido

El plano vive en `src/lib/game/universe.ts` como datos puros —sin base de datos ni
interfaz— y se escribe en la base con:

```bash
npm run db:seed
```

Es **idempotente**: busca por código, crea lo que falta y actualiza lo que
cambió. Corregir el nombre de un planeta es editar el archivo y volver a correrlo;
correrlo diez veces deja lo mismo que correrlo una. Las migraciones quedan sólo
para el esquema.

El día que exista un generador de galaxias, va a producir estas mismas
estructuras y entrar por la misma puerta.

## Reglas de diseño

- **Un sistema alcanza para empezar.** Mejor un lugar con cosas que hacer que un
  mapa vacío de cien.
- **Los recursos se agotan y se recuperan.** Un cinturón muy trabajado rinde
  menos por un tiempo: obliga a moverse y genera competencia real entre pilotos.
- **Nada es seguro del todo.** La seguridad es un gradiente, no un interruptor:
  cerca de la estación hay vigilancia, en el Cinturón Exterior no hay nadie.
- **El universo vive en la base de datos**, no en constantes del código: región,
  constelación, sistema, cuerpo y estación son filas. Agregar un sistema no
  requiere un despliegue, sólo sembrar de nuevo.
- **El piloto está parado en un cuerpo**, no en un nombre: su ubicación es una
  clave foránea, así que no puede apuntar a un lugar que no existe.

## Por decidir

- Si el mapa es fijo y curado, o generado por procedimiento a partir de semillas.
- Cuántos sistemas tendrá la primera región, y cómo se conectan.
- Si hay descubrimiento: sistemas que no existen en el mapa hasta que alguien los
  cartografía.
- Si las estaciones se pueden construir, o son siempre de una facción.
