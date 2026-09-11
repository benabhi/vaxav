# Naves, módulos y equipamiento

> **Implementado**: el catálogo de cascos y módulos, la calculadora, la pantalla
> de equipamiento y el **hangar** —cada piloto tiene su nave guardada y viaja con
> ella—. Falta poder tener **más de una**, comprarlas, y todo lo que depende del
> **combate** (F14).
>
> Ver también: [habilidades](SKILLS.md) · [acciones](ACTIONS.md) ·
> [universo](UNIVERSE.md) · [interfaz](INTERFACE.md)

La nave es la herramienta y el límite del piloto. Tiene una activa por vez, y lo
que puede hacer depende tanto de ella como de lo que sabe.

## El filtro: qué atributo se gana el lugar

Un atributo entra si **cambia una decisión antes de dar una orden**. Muchos
atributos de un juego 3D existen porque se sienten volando —maniobrabilidad,
cabeceo, convergencia de armas, calor—; acá se lee un número, se da una orden y
se vuelve en dos horas. Ésos no entran.

Y la regla que ordena todo lo demás: **la moneda de Vaxav es el tiempo**. Los
atributos que más valen son los que se convierten en tiempo —masa, velocidad,
bodega, ciclos sostenidos—, porque el tiempo es lo que el jugador está gastando.
Los que no se convierten en tiempo, en riesgo o en plata, son decoración.

## Los tres presupuestos

Tres preguntas distintas en tres momentos distintos. Es lo que EVE hace bien y
conviene robar entero:

| Presupuesto                         | La pregunta                     | Sale de              |
| ----------------------------------- | ------------------------------- | -------------------- |
| **Ranura** (clase 1-8)              | ¿Entra físicamente?             | El casco             |
| **Potencia** (MW) · **Cómputo** (u) | ¿La nave lo sostiene instalado? | La planta · el casco |
| **Acumulador** (carga + recarga)    | ¿Lo puedo mantener encendido?   | El distribuidor      |

**Dos ejes de montaje y no uno.** Potencia castiga lo grande y lo bruto; Cómputo
castiga lo electrónico —escáneres, generador de escudo, refinería—. Una bodega
enorme casi no gasta cómputo; un escudo bueno se lo come. Con un solo
presupuesto, siempre gana el módulo más grande que entre en la ranura, y armar
una nave deja de ser un rompecabezas.

### El acumulador, reinterpretado

En EVE el acumulador es un juego de manejo en vivo: apagás cosas, esperás, tirás
una batería. Eso acá no existe.

En Vaxav se resuelve en **una cuenta al dar la orden**: recarga por segundo
contra consumo por ciclo. Si la recarga cubre el consumo, la acción se sostiene;
si no, **el rendimiento cae en proporción a lo que la recarga alcanza a pagar**.
Mismo dilema —capacidad contra consumo—, sin pedirle a nadie que mire la
pantalla.

Es lo que convierte al distribuidor en una decisión real: dos láseres grandes en
un distribuidor modesto rinden al 80 %, y subirlo vale más que cambiar de láser.

## Los atributos

### Identidad

| Atributo                     | Qué decide                                              |
| ---------------------------- | ------------------------------------------------------- |
| **Rol**                      | El bono de casco, que **escala con una habilidad**      |
| **Tamaño de amarre** (S/M/L) | A qué estaciones podés entrar. Hace que el mapa importe |

### Supervivencia: tres capas

| Capa         | Carácter                                                                 |
| ------------ | ------------------------------------------------------------------------ |
| **Escudo**   | Sólo existe si montás generador. Se recarga solo                         |
| **Blindaje** | Viene con el casco. **No se recupera solo**: se repara en estación. Pesa |
| **Casco**    | La última. En cero, se pierde la nave                                    |

### Movimiento: los que se vuelven tiempo

| Atributo                 | Qué decide                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Masa** (t)             | Casco + módulos + carga. **Divide la velocidad y el alcance**, así que toda decisión de equipamiento cuesta tiempo |
| **Velocidad de crucero** | Cuánto tarda ir de un cuerpo a otro. Sale del empuje ÷ masa                                                        |
| **Alcance de salto**     | Cuán lejos llega un salto. Sale de la potencia de salto ÷ masa                                                     |
| **Combustible**          | Cuántos saltos antes de repostar                                                                                   |

Que velocidad y alcance salgan los dos de dividir por la masa no es casualidad:
es lo que hace que un módulo que sólo pesa —una placa de blindaje, que no
consume nada— igual te cueste algo.

_Cuántos_ saltos podés dar **no es un atributo**: es combustible sobre consumo, y
el consumo es proporcional a la masa. Se calcula.

### Capacidad e información

| Atributo                | Qué decide                                                           |
| ----------------------- | -------------------------------------------------------------------- |
| **Bodega** (m³)         | Cuántos viajes hacen falta. En un juego idle, eso **es** el tiempo   |
| **Alcance de sensores** | Qué ves del sistema sin moverte; le da sentido a explorar            |
| **Firma**               | Cuán fácil te encuentran. La decisión del carguero: lleno o discreto |

### Lo que queda afuera, y por qué

- **Tripulación**: sería un buen sumidero de plata —sueldos por día—, y los
  sumideros importan en una economía de jugadores. Pero sin economía es un número
  que no hace nada. Vuelve con el mercado.
- **Calor**: en Elite es divertido porque se maneja en vivo. Acá sería un segundo
  acumulador con otro nombre.
- **Maniobrabilidad, cabeceo, convergencia**: no hay vuelo.

## Las ranuras

Cuatro tipos, tomados de Elite Dangerous porque separan bien las decisiones:

| Tipo                    | Qué acepta                                                       | Ejemplos                                                                           |
| ----------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Anclajes**            | Lo que apunta hacia afuera                                       | Láser de extracción, cañón, emisor                                                 |
| **Utilitarios**         | Externos, siempre activos                                        | Escáner, refuerzo de escudo, placa                                                 |
| **Internos esenciales** | Lo que la nave necesita para volar. **Se mejoran, no se quitan** | Planta, propulsores, motor de salto, distribuidor, sensores, soporte vital, tanque |
| **Internos opcionales** | Lo que define a qué se dedica la nave                            | Bodega, generador de escudo, refinería                                             |

### Clase y calificación

Cada ranura tiene una **clase**, de 1 a 8, que es su tamaño: en una de clase 4
entra un módulo de clase 4 o menor, nunca uno mayor.

Cada módulo tiene además una **calificación**, de A a E, que no es "mejor a peor"
sino un compromiso distinto:

|       | Carácter                                               |
| ----- | ------------------------------------------------------ |
| **A** | El más capaz, el más caro y el que más energía consume |
| **B** | El más resistente y el más pesado                      |
| **C** | El equilibrado                                         |
| **D** | El más liviano: menos capacidad, más alcance de salto  |
| **E** | El más barato y el más modesto                         |

Un módulo se nombra por las dos cosas: **3A**, **5D**, **1E**. Que la D sea la
liviana y la A la potente es lo que hace que **no haya una configuración óptima,
sino una para cada oficio**.

## Los tres tipos de daño

**Cinético** (balas, metralla, misiles), **Iónico** (atraviesa campos) y
**Térmico** (pega en todo, un poco menos).

Tres y no cuatro: en un navegador, el cuarto tipo es el que nadie termina de
entender. Y tres y no uno: con un solo tipo, el equipamiento queda en un único
eje —más tanque o más daño— y elegir arma deja de ser una decisión.

### Las resistencias no son un atributo de la nave

Salen de **qué es cada capa**. Un escudo es un campo, así que lo atraviesa lo
iónico y le rebota lo cinético; el blindaje es materia y le pasa al revés; el
casco desnudo no frena nada. Son nueve números, una sola vez, en las reglas:

|              | Cinético | Iónico | Térmico |
| ------------ | -------- | ------ | ------- |
| **Escudo**   | 50 %     | 0 %    | 25 %    |
| **Blindaje** | 10 %     | 50 %   | 25 %    |
| **Casco**    | 0 %      | 0 %    | 0 %     |

Con eso alcanza para calcular **puntos efectivos por tipo de daño**, que es el
número que un piloto mira antes de salir: no "cuánto escudo tengo" sino "por
dónde me van a romper".

**No es un atajo que haya que rehacer.** Las resistencias por casco y por módulo
—módulos de resistencia, perfiles por nave— son un modificador _encima_ de esta
tabla, y llegan con el combate en **F14**. Una nave sin ellos se comporta
exactamente como hoy, así que no hay migración pendiente.

### La regla de balance del híbrido

El térmico pega menos pero nunca lo resisten bien, así que corre el riesgo de ser
siempre la respuesta correcta. La regla que lo evita:

> **El híbrido gana cuando no sabés a qué te enfrentás, y pierde cuando sí.**

Eso convierte al **alcance de sensores** en su contrapeso —saber contra qué vas
es lo que habilita traer el arma especializada— y le da trabajo a un atributo que
si no quedaría de adorno.

## Los cinco cascos

| Casco        | Rol               | Bono de rol                      | Carácter                           |
| ------------ | ----------------- | -------------------------------- | ---------------------------------- |
| **Pioner**   | Lanzadera inicial | Velocidad, por Navegación        | Mediocre en todo a propósito       |
| **Mula**     | Carguera          | Bodega, por Ingeniería de bodega | Una bodega con motores             |
| **Percal**   | Minera            | Extracción, por Minería          | Dos anclajes y casco reforzado     |
| **Vencejo**  | Exploradora       | Sensores, por Escaneo            | Liviana, callada, de largo alcance |
| **Alabarda** | Combate           | Daño, por Puntería               | Tres anclajes y blindaje de sobra  |

Cada uno es bueno en **una cosa distinta**: dos cascos con el mismo bono serían el
mismo casco con otro nombre, y hay una prueba que lo impide.

> En el MVP, las de exploración y combate se pueden armar pero su ventaja queda
> latente: todavía no existen esas actividades.

## El hangar

Cada piloto tiene **una nave**, y la tiene desde el alta: `create_pilot` la crea
junto con sus habilidades iniciales, porque un piloto sin nave no puede hacer
nada y sería un piloto a medias.

De la base sale **sólo el casco y qué hay en cada ranura** (`Ship` y
`FittedModule`). Todo número que describa a la nave se le pide a la calculadora,
que es la misma que usa la pantalla y la que resuelve las acciones.

La bandera `is_active` en vez de una nave única por piloto: tener varias sigue
siendo "por decidir", y una bandera deja la puerta abierta sin costar nada hoy.

### Viajar usa la velocidad de la nave

```
duración = distancia × segundos_por_unidad × (velocidad_de_referencia ÷ velocidad)
```

Y nada más. **Navegación no entra en esta cuenta**: ya está adentro de la
velocidad, junto con el bono de rol del casco y los propulsores que tenga puestos.
Aplicarla otra vez sería contar el mismo bono dos veces para el mismo efecto, que
es exactamente lo que la regla de "una sola bolsa" quiere evitar.

Con la velocidad de referencia igual a la de una lanzadera de astillero, los
tiempos calibrados del sistema inicial no se movieron. Lo que cambió es que ahora
**la masa cuesta tiempo de verdad**: montarle una placa de blindaje a la Pioner la
frena de 200 a 192 u/s, y ese trayecto pasa a tardar más.

## De dónde sale un módulo

Un módulo tiene que estar **en la bodega de la nave o en la estación donde estás
atracado** para poder montarlo. Sin esa regla, la pantalla de equipamiento ofrece
el catálogo entero como si las piezas no fueran de nadie ni estuvieran en ningún
lado.

**Qué surte una estación sale de sus propios módulos**, no de una tabla nueva:
una estación ofrece equipamiento **si y sólo si tiene el módulo Equipamiento**.
El astillero vende cascos; el equipamiento monta piezas, que es la misma división
que hacen los dos juegos que se imitan.

| Estación                                                             | ¿Se puede reconfigurar? |
| -------------------------------------------------------------------- | ----------------------- |
| Puerto Ánfora · Muelle de los Anillos · Hábitat Talo · Amarre Franco | Sí                      |
| **Planta Escarcha**                                                  | **No**                  |

Es una regla de una línea que hace que el mapa importe: quedarse sin escudo cerca
de la Planta Escarcha significa volver a otro lado a montarlo.

**Lo que traés en la bodega sirve en cualquier parte**, y ésa es la gracia de
traerlo. La lista de opciones dice de dónde sale cada módulo, y **lo que no está
en ninguno de los dos lugares no aparece**: si una ranura no tiene nada
disponible, la pantalla nombra el lugar —«Nada para esta ranura en Planta
Escarcha»—, porque «acá no hay nada» es una queja y con el nombre es una
instrucción para ir a otro lado.

La bodega arranca vacía: qué lleva un piloto es parte del hangar, que es F6.

## Cómo está construido

| Módulo                      | Qué tiene                                                 |
| --------------------------- | --------------------------------------------------------- |
| `src/lib/game/damage.ts`    | Los tres tipos, las tres capas y la tabla de resistencias |
| `src/lib/game/hulls.ts`     | Los cascos, sus atributos y sus ranuras                   |
| `src/lib/game/modules.ts`   | El catálogo de lo que se monta                            |
| `src/lib/game/fitting.ts`   | **La calculadora**                                        |
| `src/lib/game/inventory.ts` | De dónde sale cada módulo                                 |

### Nada derivado se guarda

Se guarda el casco, qué módulo hay en cada ranura y el daño actual de cada capa.
Masa total, velocidad, alcance, puntos efectivos, rendimiento, estabilidad del
acumulador: **todo se calcula**.

Es el mismo criterio con el que la seguridad de un sistema sale de su gobierno
(ver [universo](UNIVERSE.md)). Con las dos cosas guardadas terminan
contradiciéndose, y una nave que dice tener 400 de escudo y aguanta 250 es de los
errores que el jugador descubre justo cuando lo perjudica.

### Una sola calculadora para la pantalla y para el juego

`fitting.ts` es la **misma** función que va a usar el motor de acciones cuando
exista el hangar. En EVE las herramientas de equipamiento son de terceros,
reimplementan la matemática y se desfasan del juego; acá tenemos las dos puntas,
así que **la pantalla no puede mentir por construcción**: si dice 340 m³ por
hora, el motor va a extraer 340.

### Los bonos se suman

Habilidad más casco, en una sola bolsa, como fija [acciones](ACTIONS.md). Es más
fácil de explicar, más fácil de balancear, y evita que apilar seis fuentes chicas
rompa el juego. La tabla de qué habilidad mejora qué está en `fitting.ts` y es
**dato**: sumar una habilidad que mejore algo es agregar una fila.

### Todo entero

No hay un solo decimal en las reglas. Lo que necesita fracción se lleva en
**décimas** —alcance de salto, daño por segundo—, igual que el dinero se lleva en
la unidad más chica, y la coma aparece recién al escribirlo en pantalla.

## Qué consume cada número: la auditoría

Un módulo se gana su lugar si algo lee lo que produce. Esta tabla dice qué lee
cada cosa y cuándo, para que se vea de un vistazo qué es contenido vivo y qué
está esperando su fase:

| Lo que produce un módulo        | Quién lo lee                            | Cuándo |
| ------------------------------- | --------------------------------------- | ------ |
| Masa, empuje, potencia de salto | Viajar: duración y autonomía            | **ya** |
| Bodega                          | Cuántos viajes hacen falta              | **ya** |
| Potencia, cómputo               | El propio equipamiento: si entra o no   | **ya** |
| Acumulador y su recarga         | Si el trabajo se sostiene o rinde menos | **ya** |
| Rendimiento de extracción       | Minar                                   | F8     |
| Escudo, blindaje, daño por tipo | Combate                                 | F14    |
| Alcance de sensores             | Explorar y cartografiar                 | F13    |
| Firma                           | Qué tan fácil te encuentran             | F14    |

**Lo que hoy no lo lee nadie se dice acá:** el alcance de sensores y la firma
cambian números en la hoja de rendimiento, pero **ninguna acción los consume
todavía**. Están porque el fitting sin ellos sería un rompecabezas de una sola
dimensión, y porque su fase ya tiene nombre. El día que una de esas filas quede
sin fase, el módulo sobra.

## Reglas de diseño

- **La nave no reemplaza al piloto.** Los bonos escalan con habilidades: una nave
  buena en manos sin entrenar rinde poco.
- **Especializar duele.** Una nave con tres láseres mina rapidísimo y no
  sobrevive a un mal encuentro.
- **Nada es gratis**: potencia, cómputo, masa y espacio son cuatro presupuestos
  que compiten entre sí.
- **Armar algo imposible tiene que poder hacerse.** La pantalla deja montar un
  módulo que no entra y **dice por qué** no cierra, en vez de impedirlo sin
  explicación.

## Por decidir

- Si las naves se pierden al ser destruidas o se reparan, y con qué seguro.
- Si el equipamiento se daña con el uso.
- Cómo se consiguen: sólo compra en astillero, o también fabricación.
- Cuántas naves puede tener un piloto a la vez, y dónde quedan las demás.
- Si existe la ingeniería de módulos, y con qué costo.
- Qué gasta el combustible además de los saltos.
