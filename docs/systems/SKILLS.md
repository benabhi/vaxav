# Habilidades

> **Implementado en parte.** La curva, los niveles, los prerrequisitos y el pozo
> por familia funcionan, y se ven en `/piloto/habilidades`. Falta el laboratorio:
> hoy toda habilidad del catálogo está disponible desde el primer día. Los números
> están para discutirse y corregirse.
>
> Ver también: [acciones y XP](ACTIONS.md) · [naves](SHIPS.md) ·
> [facciones](FACTIONS.md) · [diseño general](../DESIGN.md)

Las habilidades son el eje de progresión del piloto. No hay niveles de personaje
ni clases: un piloto **es** lo que sabe hacer.

## Cómo funcionan

- Cada habilidad va del **nivel 0 al 5**. El 0 es no entrenada.
- Cada habilidad tiene un **rango, de x1 a x16**, que multiplica lo que cuesta.
  Una x2 pide el doble de experiencia que una x1 para el mismo nivel; una x16,
  dieciséis veces. El rango no se elige por gusto: sale de una escalera fija.
- **La experiencia se gana resolviendo acciones**, no esperando. Acá está la
  diferencia con EVE Online, de donde viene la idea de los multiplicadores: allá
  se entrena con el reloj; en Vaxav se entrena **haciendo**. El que mina, mejora
  minando.
- No hay cola de entrenamiento ni reasignación. Lo que aprendiste, aprendiste.
- Para poder subir una habilidad hay que **haberla aprendido primero**, y eso se
  hace en el laboratorio de una estación. Ver [Cómo se consigue una
  habilidad](#cómo-se-consigue-una-habilidad-el-laboratorio).

## Curva de experiencia

XP necesaria para alcanzar cada nivel, **antes** del multiplicador. Cada nivel
cuesta **la raíz de 32 —5,66 veces— el anterior**, que es la proporción de EVE.

| Nivel | XP del nivel | Acumulada |
| ----: | -----------: | --------: |
|     1 |          100 |       100 |
|     2 |          566 |       666 |
|     3 |        3.200 |     3.866 |
|     4 |       18.102 |    21.968 |
|     5 |      102.400 |   124.368 |

Con el multiplicador aplicado, llegar al nivel 5 cuesta:

| Rango | XP acumulada a nivel 5 | Horas de acción |
| ----- | ---------------------: | --------------: |
| x1    |                124.368 |             207 |
| x2    |                248.736 |             415 |
| x3    |                373.104 |             622 |
| x5    |                621.840 |           1.036 |
| x8    |                994.944 |           1.658 |
| x16   |              1.989.888 |           3.316 |

(Las horas son a seiscientos de experiencia por hora, que es lo que da una acción
de dificultad 1.)

La forma de la curva importa más que los números, y tiene tres propiedades que son
las que se buscaron:

- **Los primeros niveles siguen siendo inmediatos.** El 1 son diez minutos de
  juego y el 3 una tarde larga: empinar la curva no podía volver lento el empezar.
- **El 4 es una inversión y el 5 es una identidad.** El último nivel cuesta
  **cinco veces y media lo que los cuatro anteriores juntos**. Nadie lleva veinte
  habilidades al cinco; se llevan tres, y ésas dicen quién sos.
- **El rango estira sin deformar.** Un x16 al cinco son más de tres mil horas: es
  el techo de una carrera, no un objetivo de temporada.

### De dónde salen estos números

**La curva se calcula, no se escribe.** `game/progression.ts` tiene el costo del
primer nivel y el crecimiento; las dos tablas salen de ahí. Dos listas escritas a
mano son dos listas que se desfasan.

Antes cada nivel costaba el triple que el anterior, y eso tenía un problema que
sólo se ve al mirarlo con números: el nivel 5 costaba **apenas el doble** que los
cuatro anteriores juntos, así que especializarse no dolía y el catálogo entero se
terminaba en unas novecientas horas. El detalle del diagnóstico y de la decisión
está en [la investigación](../RESEARCH.md).

### El rango de cada habilidad

Va de **x1 a x16**, y no se elige por gusto: sale de una escalera fija.

| Rango | Para qué                                                        |
| ----: | --------------------------------------------------------------- |
|    x1 | Habilidad de entrada de una familia. Cualquiera la empieza      |
|    x2 | El segundo escalón de una rama; lo que se usa todos los días    |
|    x3 | Especialización clara dentro de un oficio                       |
|    x4 | Lo que abre una clase de nave intermedia o un módulo avanzado   |
|    x5 | La punta de una rama de oficio                                  |
|    x6 | Clases de nave pesadas, técnicas caras                          |
|    x8 | Lo que define a un veterano de un oficio                        |
|   x12 | Capacidades de flota o de capital                               |
|   x16 | El tope del juego. Una o dos por familia, y ninguna obligatoria |

Si una habilidad parece merecer un rango que la escalera no le da, lo que está mal
es dónde se la puso en el árbol.

## Qué da un nivel

Dos efectos posibles, según la habilidad:

- **Bono acumulativo**: +5 % por nivel sobre lo que la habilidad gobierna, hasta
  +25 % en el nivel 5. Se suma con los bonos de nave, módulos y facción en una
  sola bolsa (ver [ACTIONS.md](ACTIONS.md)).
- **Requisito**: cierto equipamiento o cierta acción pide un nivel mínimo. Es lo
  que hace que una habilidad barata pero obligatoria sea la puerta de entrada a
  toda una rama.

## Reparto de experiencia

> **Superado por el pozo por familia**, más abajo. Una acción ya no reparte entre
> habilidades: deposita en la rama. Lo que sigue vale para el reparto del
> presupuesto de la creación de piloto, que sí se reparte así.

Cada acción define una **habilidad principal** y una lista de **secundarias**,
para representar que casi nada se hace con una sola destreza.

- El **pozo de XP** de la acción es `10 × minutos de duración × dificultad de la
acción`, donde la dificultad va de 0,5 a 3.
- La **habilidad principal se lleva el pozo completo**.
- **Cada secundaria recibe el 15 % del pozo.** No se reparte entre ellas: se le
  da ese 15 % a cada una. Así una acción con muchas secundarias no castiga a
  ninguna, y la principal siempre es claramente el camino rápido.

Ejemplo: minar 40 minutos con dificultad 1,5 → pozo de 600 XP.
Minería (principal) recibe 600; Estiba y Prospección (secundarias), 90 cada una.

## Dónde está la escasez: el pozo por familia

> **Implementado.** Las reglas puras están en `src/lib/game/pools.ts`, el gasto
> contra la base en `src/lib/server/services/pools.ts`, y se ve y se usa en
> `/piloto/habilidades`. Lo que sigue sin implementar es el laboratorio de más
> abajo: hoy toda habilidad del catálogo está disponible desde el primer día.

Una acción no le paga experiencia a una habilidad: se la paga a la **familia** de
la actividad. Minar deposita en el pozo de Extracción, y el jugador decide en qué
habilidad de esa familia gastarlo.

El problema que resuelve es el siguiente. Con la experiencia yendo derecha a la
habilidad usada, **especializarse no es una decisión: es automático**. El que
mina se vuelve minero gratis, sin renunciar a nada. En EVE especializarse duele
porque el tiempo de entrenamiento es un recurso escaso y compartido —entrenar una
cosa es no entrenar otra—, y ésa es exactamente la tensión que faltaba acá.

Con pozo por familia:

- **Doing sigue siendo learning**: no te volvés artillero minando, porque el pozo
  de Combate sólo lo llenan las acciones de combate.
- **Dentro de la familia hay que elegir.** Cuatro horas de minería dan para subir
  Minería un nivel _o_ para abrir Prospección y Refinado. No para las tres.
- La escasez es visible y se explica en una línea, que es lo que un presupuesto
  tiene que ser.

Ya hay precedente en el juego: la creación de piloto reparte un presupuesto de
experiencia entre las habilidades de partida. Es la misma idea, para siempre.

### Cómo se gasta

**Se compra el nivel siguiente, entero.** No se vierte experiencia de a poco en
una habilidad: el botón dice "Subir a nivel 3" y cuesta exactamente lo que falta
para ese umbral, que sale de la misma curva de arriba. Es una decisión y no un
grifo —media inversión no existe—, y de paso evita el estado incómodo de tener
una habilidad a la que le faltan doce puntos sin poder hacer nada al respecto.

Tres cosas pueden trabar una compra, y la pantalla dice **cuál**, en este orden:

1. **Al máximo**: no hay nivel siguiente. Juntar más no cambia nada.
2. **Requisitos**: le faltan niveles de otra habilidad. Juntar más tampoco.
3. **Pozo**: le falta experiencia en esa rama. Ésta sí se destraba jugando.

El orden importa porque el motivo es lo que el jugador lee: mandarlo a juntar
experiencia para algo que está trabado por requisitos es mandarlo a perder el
tiempo.

La validación se rehace **dentro de la transacción** que descuenta el pozo. Entre
que la pantalla dibujó el botón y el jugador lo apretó, el pozo pudo gastarse en
otra pestaña; lo que decide es lo que hay en la base al escribir.

### Dónde se ve

- El **hexágono de Piloto** dibuja las dos métricas superpuestas: lo invertido en
  naranja lleno, lo que espera en los pozos en cian punteado. La distancia entre
  las dos líneas es la decisión pendiente.
- El **informe de cada acción** —el aviso y la bitácora— dice a qué pozo fue,
  cuánto había y cuánto quedó para gastar.
- **`/piloto/habilidades`** tiene los seis pozos arriba, con cuántas habilidades
  de la rama se pueden subir ahora mismo, y el catálogo entero abajo.

## Cómo se consigue una habilidad: el laboratorio

El pozo por familia es el **combustible** de la progresión, pero no dice de dónde
sale la habilidad en sí. En EVE son libros que se compran en el mercado. En Vaxav
son **inyecciones**, y se hacen en el módulo de **laboratorio** de una estación.

Las dos piezas son distintas y no conviene confundirlas:

|                     | Qué es                                            | Qué cuesta                       |
| ------------------- | ------------------------------------------------- | -------------------------------- |
| **Inyección**       | Habilita que puedas **invertir** en esa habilidad | Plata, según lo compleja que sea |
| **Pozo de familia** | La sube del nivel 1 al 5                          | Horas de acción                  |

**Inyectar no da nivel ni experiencia.** Da permiso: sin la inyección, la
habilidad ni siquiera aparece como destino posible del pozo de su familia. La
puerta la abre la plata; los niveles los pagan las horas. Si inyectar diera
niveles, el que tiene plata compraría progreso y las horas de juego dejarían de
valer, que es justo lo contrario de lo que se busca.

**Cada laboratorio tiene una lista reducida.** Conseguir una habilidad rara es un
viaje: hay que averiguar dónde se consigue e ir. Eso le da al mapa un motivo de
progresión propio —no sólo de carga— y engancha con las corporaciones, que son
las que deciden qué surte cada estación, sin inventar ningún sistema nuevo.

Con una salvaguarda que no se puede negociar: **las habilidades de entrada de
cada familia están en cualquier laboratorio.** Lo que se sale a buscar son las
profundas. Si no, un piloto nuevo puede quedar encerrado sin poder empezar nada.

El laboratorio es además donde se fabrican los **clones**, que es la otra mitad
del módulo. Eso sólo importa cuando se pueda morir, así que va con el combate;
la inyección va con la lista grande de habilidades.

## Prerrequisitos

Las habilidades complejas **exigen otras entrenadas antes**. No es burocracia: es
lo que convierte al catálogo en un árbol y hace que elegir una rama signifique
algo. Nadie prospecta un cinturón sin saber minar.

Reglas para que el árbol no se vuelva un muro:

- **Las habilidades de entrada (x1) nunca tienen requisitos.** Un piloto nuevo
  siempre tiene seis puertas abiertas, una por familia.
- **Las cadenas son cortas**: como mucho dos saltos desde una habilidad de
  entrada hasta la más profunda de su rama.
- **El requisito se mide en niveles, no en habilidades sueltas**: pedir
  Navegación III es distinto de pedir Navegación I, y es ahí donde se regula
  cuánto cuesta entrar a una rama.
- Un requisito **no se pierde nunca**, porque los niveles tampoco se pierden.

Las habilidades quedan en tres escalones: las de entrada, las que piden una de
entrada, y las profundas que piden dos ramas a la vez. Esas últimas —Contactos,
Guerra electrónica, Cartografía— son justamente las que definen a un especialista.

## Catálogo inicial propuesto

Seis familias. El multiplicador está entre paréntesis.

### Pilotaje

| Habilidad                 | Dif. | Requiere       | Gobierna                                  |
| ------------------------- | :--: | -------------- | ----------------------------------------- |
| Manejo de lanzaderas      |  x1  | —              | Requisito y bonos de las naves más chicas |
| Navegación                |  x1  | —              | Velocidad de viaje dentro del sistema     |
| Eficiencia de combustible |  x2  | Navegación II  | Consumo por salto y por maniobra          |
| Astrogación               |  x3  | Navegación III | Saltos entre sistemas: tiempo y precisión |

### Ingeniería

| Habilidad            | Dif. | Requiere                             | Gobierna                                        |
| -------------------- | :--: | ------------------------------------ | ----------------------------------------------- |
| Mecánica             |  x1  | —                                    | Reparaciones de casco y tiempo de mantenimiento |
| Gestión de energía   |  x2  | Mecánica II                          | Cuántos módulos se pueden sostener encendidos   |
| Ingeniería de bodega |  x2  | Estiba III                           | Capacidad efectiva de carga                     |
| Ajuste de módulos    |  x3  | Mecánica III · Gestión de energía II | Requisito para módulos avanzados                |

### Extracción

| Habilidad   | Dif. | Requiere    | Gobierna                                      |
| ----------- | :--: | ----------- | --------------------------------------------- |
| Minería     |  x1  | —           | Rendimiento por ciclo de extracción           |
| Estiba      |  x1  | —           | Aprovechamiento del espacio de bodega         |
| Refinado    |  x2  | Minería II  | Mineral en bruto convertido en material útil  |
| Prospección |  x3  | Minería III | Afina la lectura: a qué ritmo repone el campo |

### Comercio

| Habilidad           | Dif. | Requiere                      | Gobierna                               |
| ------------------- | :--: | ----------------------------- | -------------------------------------- |
| Regateo             |  x1  | —                             | Margen con la estación y comisión      |
| Contabilidad        |  x2  | Regateo II                    | Impuesto de venta y tope de órdenes    |
| Análisis de mercado |  x3  | Regateo III                   | Regiones del mercado que ves           |
| Contactos           |  x4  | Regateo IV · Contabilidad III | Cuánto puede durar una orden publicada |

### Combate

| Habilidad          | Dif. | Requiere                            | Gobierna                                    |
| ------------------ | :--: | ----------------------------------- | ------------------------------------------- |
| Puntería           |  x1  | —                                   | Daño de las armas montadas                  |
| Blindaje           |  x2  | Mecánica II                         | Resistencia del casco                       |
| Escudos            |  x2  | Gestión de energía II               | Capacidad y recarga de escudos              |
| Guerra electrónica |  x4  | Gestión de energía III · Escaneo II | Interferir, trabar o escapar de un enganche |

### Ciencias

| Habilidad              | Dif. | Requiere                     | Gobierna                                       |
| ---------------------- | :--: | ---------------------------- | ---------------------------------------------- |
| Escaneo                |  x2  | —                            | Cuánto revela una lectura: de qué es, y cuánto |
| Análisis de materiales |  x2  | Escaneo II                   | Identificar lo que se extrae o se encuentra    |
| Cartografía            |  x3  | Escaneo III · Astrogación II | Registrar rutas y sistemas no cartografiados   |

> Escaneo es x2 y no tiene requisitos: es la puerta de Ciencias, la única familia
> sin habilidad x1, porque su escalón de entrada ya pide oficio.

## De dónde salen los primeros niveles

Un piloto no arranca en cero: la **profesión** que elige al crearse le da un
puñado de habilidades ya entrenadas, que es lo que le permite hacer algo desde el
primer minuto. Ver [profesiones](PROFESSIONS.md).

### Qué capas se dibujan

La figura tiene **dos**: lo invertido en naranja y lo que espera en el pozo,
punteado en cian. Juntas son la razón de que la figura valga la pena —la distancia
entre las dos líneas **es** la decisión pendiente—, pero no en todos lados se está
haciendo esa pregunta.

- **En la credencial va una sola: lo invertido.** Chica y al lado de otros datos,
  dos figuras encimadas piden una leyenda y un segundo de lectura para contestar
  algo que ahí nadie preguntó. Ahí alcanza con quién es el piloto hoy.
- **Agrandada van las dos, con un interruptor** para ver una, la otra o ambas.
  Los botones van arriba del dibujo: un control se lee antes que lo que cambia.

La leyenda **muestra sólo la capa dibujada, pero su renglón queda siempre**.
Sacarla entera al quedar una sola hacía que el dibujo saltara al cambiar de
vista, y con el interruptor al lado sigue teniendo qué decir: cuál de las dos
estás mirando.

## El IPP

El **Índice de Pericia del Piloto**: un solo número para saber qué tan lejos llegó
un piloto, que es **la experiencia invertida en habilidades, sumada**.

Se lo nombra por la sigla, como el TSI de Hattrick, y ése es medio el punto: un
índice se vuelve una cosa del juego recién cuando los jugadores lo dicen en voz
alta. En pantalla va «IPP» y el nombre entero aparece donde haya lugar. Contesta «¿qué tan armado está este piloto?» sin tener que
leerle el árbol entero, como el TSI de Hattrick, y el día que existan las
corporaciones de jugadores va a servir para pedir un mínimo para entrar.

**Se extiende solo.** No hay nada que registrar cuando se agrega una habilidad al
catálogo: si tiene experiencia adentro, entra en la cuenta. Ésa es la razón de que
sea la XP y no una fórmula con pesos por rama, que habría que revisar cada vez que
el árbol crece —y el árbol se quiere grande a propósito—.

**Cuenta lo invertido y no el pozo.** Lo que está sin gastar es potencial, no
poder: dos pilotos con el mismo pozo y distinto árbol no vuelan igual.

**Y es público.** Sale en la ficha de cualquier piloto, junto al hexágono de sus
ramas: un índice que existe para compararse y para que una corporación pida un
mínimo no sirve para ninguna de las dos cosas si nadie puede verlo. Lo que **no**
sale de un piloto ajeno es el pozo —lo que puede ser mañana no se le cuenta a un
desconocido—, así que la lista de ramas de una ficha ajena muestra sólo lo
invertido y ni siquiera dice cuánto hay guardado: decir «0 XP» de algo que no se
mandó sería afirmar una cosa falsa. El que prefiera no ser mirado **cierra su
ficha** desde Opciones y entonces de él sólo queda el distintivo.

### Los rangos

Un número suelto que sube no se siente como progreso; cruzar un umbral y pasar de
Veterano a Experto, sí. Por eso el índice lleva **rango con nombre**, como los de
Elite Dangerous, y la pantalla **lo enciende cada vez más**: los primeros se leen
como cualquier dato y los últimos se despegan. La cifra se queda en cian, que es
el color de toda lectura del juego; lo que cambia es el nombre.

| Rango      | IPP     |
| ---------- | ------- |
| Recluta    | 0       |
| Novato     | 1.000   |
| Competente | 5.000   |
| Veterano   | 20.000  |
| Experto    | 60.000  |
| Maestro    | 180.000 |
| Élite      | 420.000 |

Los saltos triplican, que es la forma de la curva de experiencia: cada nivel de
una habilidad cuesta el triple que el anterior, así que un IPP que avanzara
parejo mentiría sobre lo que costó llegar. Con las veintitrés habilidades de hoy,
tenerlas todas al máximo da 580.800: Élite es una meta lejana y no un trámite.

Son **datos de balance**, como los escalones de la reputación. Los umbrales se van
a mover cuando el catálogo crezca, y moverlos tiene que ser cambiar esa tabla y
nada más.

## Por decidir

- Si el multiplicador llega a x5 o conviene estirarlo (EVE llega a x16).
- Si existe algún techo por facción o por reputación.
- Cómo se muestran los avances: notificación por nivel, o sólo en la bitácora.
