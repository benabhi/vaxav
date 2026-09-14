# Naves, módulos y equipamiento

> **Implementado**: el catálogo de cascos y módulos, la calculadora, la pantalla
> de equipamiento y el **hangar** —cada piloto tiene su nave guardada y viaja con
> ella—. Falta poder tener **más de una**, comprarlas, y todo lo que depende del
> **combate**, que todavía no existe.
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
  sumideros importan en una economía de jugadores. Ahora que los créditos existen
  se puede discutir; sigue afuera hasta que haya algo más en qué gastarlos.
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

### Clase y escalón

Dos ejes, y cada uno contesta una pregunta distinta.

La **clase**, de 1 a 8, es el tamaño: en una ranura de clase 4 entra un módulo de
clase 4 o menor, nunca uno mayor. Es lo único que decide si **entra**.

El **escalón** es la letra, de **E a A**, y es la **puerta de habilidad**. Un
módulo A rinde más que su E, cuesta más y pide habilidades entrenadas; también
aprieta más la potencia y el cómputo, así que en una nave chica o con el cómputo
al límite el E puede ser la elección correcta.

El piso y el techo son fijos: se llenan los escalones del medio sin mover nunca
los extremos ni renombrar lo que ya existe. Hoy sólo se usan los dos puntas, E y
A.

Un módulo se nombra por las dos cosas, clase y escalón: **2E**, **3A**.

> **Antes la letra era una "calificación"** que mezclaba dos cosas: el escalón
> tecnológico y el compromiso de diseño. Y el catálogo no la sostenía —de las cinco
> letras sólo dos se usaban como escalera, y en la mitad de los módulos la letra no
> significaba nada: existía un `armor_plate` D sin nada con qué compararlo, y
> `cargo_rack` iba 1D, 2C, 3C sin ninguna lógica—. Ahora la letra es sólo el
> escalón, el compromiso va en el adjetivo, y todos los módulos la usan igual.

### El compromiso va en el nombre

Dentro de un mismo escalón y una misma clase puede haber varias versiones, y lo
que las distingue es **qué recurso ahorra cada una**. Se nombran con un
vocabulario cerrado que se repite en todas las familias, así que se entiende sin
abrir la ficha y escala a cientos de módulos sin inventar cientos de nombres:

| Adjetivo        | Qué sacrifica y qué gana                              |
| --------------- | ----------------------------------------------------- |
| **Compacto**    | Rinde algo menos, pide mucho menos cómputo y potencia |
| **Sobrio**      | Rinde menos, consume mucho menos acumulador           |
| **Persistente** | Ciclo más largo, drenaje mucho menor                  |
| **Amplio**      | Más capacidad, ciclo más lento                        |
| **Focalizado**  | Más alcance, menos potencia bruta                     |

Es lo que hace que **no haya una configuración óptima, sino una para cada
oficio**: un módulo que parece peor por sus números es la elección correcta en la
nave donde el que parece mejor directamente no entra.

El catálogo de hoy todavía no tiene versiones alternativas —una sola por familia,
escalón y clase—, así que ningún módulo lleva adjetivo. Se suman cuando haya con
qué compararlos.

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
tabla, y llegan **con el combate**. Una nave sin ellos se comporta
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

Un módulo tiene que estar **en la bodega de tu nave** para poder montarlo. Sin esa
regla, la pantalla de equipamiento ofrece el catálogo entero como si las piezas no
fueran de nadie ni estuvieran en ningún lado.

**Comprar y equipar son dos verbos distintos, en dos pantallas distintas.**
Comprar es del **[mercado](MARKET.md)**, que es donde viven la búsqueda y el árbol
de categorías; equipar es mover lo que ya es tuyo de la bodega a una ranura, y al
revés. Mezclarlos —una estación que surte el catálogo entero
desde la ranura— convierte el equipamiento en una lista de compras sin precio y
deja al mercado sin razón de existir.

**Un módulo que se baja vuelve a la bodega**, y uno que se sube sale de ella. Si
lo que estás bajando no entra en el lugar que queda, la operación se niega con el
motivo: desmontar no puede ser una forma silenciosa de tirar una pieza. El cálculo
del lugar usa la capacidad que la nave va a tener **después**, porque bajar una
bodega adicional achica el espacio justo cuando esa misma bodega necesita entrar.

Lo que la estación sigue decidiendo es **si podés tocar la nave**: hace falta estar
atracado y que el lugar tenga el módulo de Equipamiento.

| Estación                                                             | ¿Se puede reconfigurar? |
| -------------------------------------------------------------------- | ----------------------- |
| Puerto Ánfora · Muelle de los Anillos · Hábitat Talo · Amarre Franco | Sí                      |
| **Planta Escarcha**                                                  | **No**                  |

Es una regla de una línea que hace que el mapa importe: quedarse sin escudo cerca
de la Planta Escarcha significa volver a otro lado a montarlo.

Si una ranura no tiene nada disponible, la pantalla lo dice y manda al mercado:
«no tenés nada» es una queja, «se compra en el mercado» es una instrucción.

## Cómo está construido

| Módulo                      | Qué tiene                                                 |
| --------------------------- | --------------------------------------------------------- |
| `src/lib/game/damage.ts`    | Los tres tipos, las tres capas y la tabla de resistencias |
| `src/lib/game/hulls.ts`     | Los cascos, sus atributos y sus ranuras                   |
| `src/lib/game/modules.ts`   | El catálogo de lo que se monta                            |
| `src/lib/game/fitting.ts`   | **La calculadora**                                        |
| `src/lib/game/inventory.ts` | Qué de la bodega entra en una ranura                      |

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
cada cosa, para que se vea de un vistazo qué es contenido vivo y qué todavía no
lo es:

| Lo que produce un módulo        | Quién lo lee                            | Estado  |
| ------------------------------- | --------------------------------------- | ------- |
| Masa y empuje                   | Viajar: la duración real                | **ya**  |
| Potencia y cómputo              | El propio equipamiento: si entra o no   | **ya**  |
| Bodega                          | Cuánto te traés de un cinturón          | Etapa 2 |
| Rendimiento de extracción       | Minar                                   | Etapa 2 |
| Acumulador y su recarga         | Si el trabajo se sostiene o rinde menos | Etapa 2 |
| Potencia de salto y combustible | Qué puertas podés usar, y cuántas veces | Etapa 6 |
| Escudo, blindaje, daño por tipo | Combate                                 | Combate |
| Alcance de sensores             | Explorar y prospectar                   | Después |
| Firma                           | Qué tan fácil te encuentran             | Combate |

**Lo que hoy no lee nadie se dice acá.** De los 25 números que devuelve la
calculadora, sólo la velocidad y el permiso de volar cambian el resultado de una
acción; el resto todavía se dibuja nada más. Eso es una deuda, no una
característica, y esta tabla es la lista de lo que hay que pagar. **El día que una
fila se quede sin nadie que la lea, el número sobra.**

Mientras tanto, un número que nada consume **no se le muestra al jugador**: la
ficha enseña lo que algo usa. Un panel de aguante que ninguna mecánica puede
gastar es una promesa escrita con cifras.

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
