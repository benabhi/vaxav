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

Antes cada nivel costaba **el triple** que el anterior, y eso tenía dos problemas
que sólo se ven al mirarlos con números.

El primero: una acción reparte `10 × minutos × dificultad`, que con dificultad 1
son **600 XP por hora**. Con la curva vieja, llevar una habilidad de rango x1 al
nivel 5 costaba 12.100 XP, o veinte horas. Los rangos de todo el catálogo suman
48, así que **el catálogo entero al máximo eran unas 970 horas**: alguien que
juegue dos horas por día lo terminaba en poco más de un año, y a partir de ahí no
tenía nada que entrenar. Para un juego pensado en años, eso no es progresión: es
una lista de pendientes con fecha de vencimiento.

El segundo es más sutil: **el nivel 5 costaba apenas el doble que los cuatro
anteriores juntos**, cuando debería costar mucho más. Con ×3 especializarse casi
no dolía, así que el que juntaba experiencia terminaba llevando todo al 5 porque
el último tramo no lo frenaba.

Lo que **no** se tocó fue la experiencia por minuto, y conviene decir por qué:
bajarla no hace el juego más largo, hace **cada sesión más aburrida**. El problema
era la forma de la escalera, no el caudal, y se arregla donde está.

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

**Es la pieza más nuestra de todo el juego**, y la única que no sale de EVE. La
premisa dice que los sistemas se replican; éste es el que no, porque lo asíncrono
lo obliga: allá se entrena con un reloj que corre aunque nadie juegue, y acá
jugar y progresar tienen que ser la misma cosa.

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
- **`/piloto/habilidades`** tiene los ocho pozos arriba, con cuántas habilidades
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
  siempre tiene ocho puertas abiertas, una por familia.
- **Las cadenas son cortas**: como mucho dos saltos desde una habilidad de
  entrada hasta la más profunda de su rama.
- **El requisito se mide en niveles, no en habilidades sueltas**: pedir
  Navegación III es distinto de pedir Navegación I, y es ahí donde se regula
  cuánto cuesta entrar a una rama.
- Un requisito **no se pierde nunca**, porque los niveles tampoco se pierden.

Las habilidades quedan en tres escalones: las de entrada, las que piden una de
entrada, y las profundas que piden dos ramas a la vez. Esas últimas —Contactos,
Guerra electrónica, Cartografía— son justamente las que definen a un especialista.

## El catálogo

**Ciento once habilidades en ocho familias.** Parece mucho y es el punto: un
catálogo que se termina es un catálogo chico, y este juego se piensa en años. Lo
que hace que no sea inabarcable no es el tamaño sino la forma — cada familia tiene
una habilidad de entrada que cualquiera puede empezar, y de ahí sale una rama por
oficio.

**No todas mueven un número todavía.** Las de Combate, Industria y buena parte de
Mando esperan a que exista la mecánica que gobiernan, y lo que las mantiene
honestas es `TRAINABLE_FAMILIES`: una familia que ninguna acción paga no tiene
pozo, así que **no se puede comprar nada en ella**. Si el número que una habilidad
gobierna todavía no existe, la habilidad está en el árbol pero fuera de alcance.

Las tablas salen de `game/skills.ts`. **Rango** es el multiplicador de costo,
**Gobierna** es qué número mueve y **Pide** son los prerrequisitos.

### Pilotaje

La familia de las **clases de nave**. Volar una clase que no se sabe volar es imposible, no penalizado: es el requisito duro más importante del juego.

| Habilidad                 | Rango | Gobierna                                      | Pide                                |
| ------------------------- | ----: | --------------------------------------------- | ----------------------------------- |
| Manejo de lanzaderas      |    x1 | Requisito de la clase lanzadera               | —                                   |
| Navegación                |    x1 | Velocidad sub-warp y acceso al equipo de warp | —                                   |
| Maniobra                  |    x2 | Tiempo de alineación antes de salir           | Navegación 2                        |
| Eficiencia de combustible |    x2 | Consumo del salto sin puerta                  | Navegación 2                        |
| Naves ligeras             |    x2 | Requisito de la clase corbeta                 | Manejo de lanzaderas 3              |
| Astrogación               |    x3 | Alcance del salto sin puerta                  | Navegación 3                        |
| Naves industriales        |    x3 | Requisito de la clase industrial              | Naves ligeras 3                     |
| Destructores              |    x3 | Requisito de la clase destructor              | Naves ligeras 3                     |
| Cálculo de saltos         |    x4 | Alcance de salto                              | Astrogación 3                       |
| Barcazas mineras          |    x4 | Requisito de la clase barcaza                 | Naves industriales 3 · Minería 4    |
| Pilotaje evasivo          |    x4 | Firma mientras se está en movimiento          | Maniobra 3                          |
| Cruceros                  |    x5 | Requisito de la clase crucero                 | Destructores 3                      |
| Transportes rápidos       |    x6 | Requisito de la clase transporte              | Naves industriales 4 · Maniobra 4   |
| Cargueros                 |    x6 | Requisito de la clase carguero                | Naves industriales 5                |
| Naves de reconocimiento   |    x6 | Requisito de la clase explorador pesado       | Naves ligeras 5 · Escaneo 4         |
| Exhumadoras               |    x6 | Requisito de la clase exhumadora              | Barcazas mineras 5                  |
| Acorazados                |    x8 | Requisito de la clase acorazado               | Cruceros 5                          |
| Naves capitales           |   x12 | Requisito de la clase capital                 | Acorazados 5 · Vuelo en formación 4 |

**Las tres habilidades del salto están dormidas, y no es un descuido.** Cruzar
una puerta es gratis y no pide nada —ver
[cruzar es gratis](ACTIONS.md#cruzar-es-gratis)—, así que Astrogación, Eficiencia
de combustible y Cálculo de saltos gobiernan el **motor de salto sin puerta**, el
de las capitales, que todavía no existe. Astrogación mueve hoy el alcance en la
calculadora y ningún verbo lee ese número; Cálculo de saltos, que por nombre
debería ser la que lo mueve, no la lee nadie. Es el mismo cruce de nombres que
tienen Minería y Rendimiento de extracción, y se resuelve cuando entre el verbo,
no antes.

**Maniobra estrenó verbo y Navegación perdió el suyo, el mismo día.** Viajar
dentro de un sistema dejó de salir del empuje y pasó a ser alineación más warp:
la alineación la baja **Maniobra** —5 % por nivel, dividiendo la agilidad, que es
el único objetivo donde menos es mejor— y la velocidad de warp es de la clase del
casco, que **ninguna habilidad sube**, igual que en EVE. A Navegación le quedan la
velocidad sub-warp, dormida hasta que exista el combate, y **el acceso**: es la
llave del optimizador de warp de escalón II. Ver
[viajar es alinearse y cruzar](SHIPS.md#viajar-es-alinearse-y-cruzar).

Con eso **la cadena de viajar cierra sobre sí misma**: viajar paga experiencia al
pozo de Pilotaje, Pilotaje entrena Maniobra, Maniobra acorta el arranque y viajar
tarda menos. Maniobra prometía ese efecto desde que existe el catálogo y no movía
ningún número, porque no había alineación que acortar. **Y es la única palanca**:
ningún casco tiene bono de rol sobre la agilidad.

**Manejo de lanzaderas hizo el camino contrario y volvió a no gobernar nada.**
Tuvo el bono de rol de la Pioner —primero sobre la velocidad, después sobre la
agilidad— y se lo sacaron: la nave de alta no lleva bono de rol, porque empujaría
al piloto hacia una especialidad antes de que la elija. Ver
[la regla del bono de rol](SHIPS.md#la-regla-del-bono-de-rol). Lo que le queda es
ser **llave**: el escalón hacia Naves ligeras, y el requisito que va a pedir la
segunda lanzadera del catálogo, que sí puede pedirlo sin dejar a nadie en tierra.
Es un huérfano declarado y con fecha, y la fecha es ese segundo casco.

### Ingeniería

Todo lo que hace que un casco vuele y aguante. **Es la familia que ningún oficio puede saltear**: el minero necesita bodega y acumulador, el mercader blindaje para no perder la carga, el explorador energía.

| Habilidad                | Rango | Gobierna                                           | Pide                              |
| ------------------------ | ----: | -------------------------------------------------- | --------------------------------- |
| Mecánica                 |    x1 | Estructura del casco y tiempo de reparación        | —                                 |
| Gestión de energía       |    x2 | Potencia disponible de la planta                   | Mecánica 2                        |
| Ingeniería de bodega     |    x2 | Capacidad efectiva de carga                        | Mecánica 2                        |
| Blindaje                 |    x2 | Puntos de blindaje                                 | Mecánica 2                        |
| Escudos                  |    x2 | Capacidad de escudo                                | Gestión de energía 2              |
| Ajuste de módulos        |    x3 | Cómputo disponible; requisito de módulos avanzados | Mecánica 3 · Gestión de energía 2 |
| Acumulador               |    x3 | Capacidad del acumulador                           | Gestión de energía 3              |
| Recarga de escudos       |    x3 | Velocidad de recarga del escudo                    | Escudos 3                         |
| Reparación de casco      |    x3 | Rendimiento de los módulos de reparación           | Mecánica 3                        |
| Ingeniería de propulsión |    x4 | Empuje de los propulsores                          | Gestión de energía 3              |
| Compensación de blindaje |    x4 | Resistencias del blindaje                          | Blindaje 4                        |
| Compensación de escudos  |    x4 | Resistencias del escudo                            | Escudos 4                         |
| Montaje de refuerzos     |    x4 | Requisito y penalización de los refuerzos de casco | Ajuste de módulos 3               |
| Sistemas de emergencia   |    x4 | Qué queda encendido cuando falta potencia          | Gestión de energía 4              |
| Termodinámica            |    x5 | Sobrecargar un módulo sin quemarlo                 | Ajuste de módulos 4               |
| Ingeniería avanzada      |    x8 | Requisito de los módulos de escalón A              | Ajuste de módulos 5               |

**Ingeniería de propulsión no mueve nada, y es de las más dormidas que hay**: lo
que gobierna es el empuje, que es velocidad sub-warp, y ningún verbo la lee desde
que viajar pasó a ser alineación más warp. La despierta el combate, junto con los
tres propulsores auxiliares. Se queda en el árbol porque el catálogo también
sirve para decirle al jugador en qué se puede convertir.

### Extracción

Sacarlo de donde está: mineral, hielo y gas.

| Habilidad                 | Rango | Gobierna                                          | Pide                                        |
| ------------------------- | ----: | ------------------------------------------------- | ------------------------------------------- |
| Minería                   |    x1 | Rendimiento por ciclo de láser                    | —                                           |
| Estiba                    |    x1 | Cuánto compacta el mineral en bodega              | —                                           |
| Supervisión de cinturón   |    x2 | Qué se ve de un cinturón sin escanear cada roca   | Minería 2                                   |
| Prospección               |    x3 | Profundidad de la lectura de una roca             | Minería 3 · Escaneo 2                       |
| Extracción de hielo       |    x3 | Rendimiento y ciclo de los cosechadores de hielo  | Minería 3                                   |
| Explotación de anillos    |    x3 | Rendimiento en anillos planetarios                | Minería 3                                   |
| Láseres de tira           |    x4 | Requisito y rendimiento de los láseres de tira    | Minería 4 · Barcazas mineras 1              |
| Cristales de extracción   |    x4 | Cuánto dura un cristal y cuánto suma              | Láseres de tira 2                           |
| Extracción de gas         |    x4 | Rendimiento de los aspiradores de nube            | Minería 4 · Escaneo 3                       |
| Extracción planetaria     |    x4 | Qué se puede sacar de la superficie de un planeta | Minería 3 · Escaneo 3                       |
| Recuperación de pecios    |    x4 | Qué se saca de una nave destruida                 | Mecánica 3 · Escaneo 3                      |
| Rendimiento de extracción |    x5 | Bono general sobre todo lo que se extrae          | Minería 5                                   |
| Extracción profunda       |    x5 | Acceso a los minerales que sólo hay sin ley       | Láseres de tira 4 · Prospección 4           |
| Drones de extracción      |    x5 | Cuántos drones mineros se controlan               | Minería 4 · Drones 3                        |
| Explotación industrial    |    x8 | Bono de rendimiento de las clases pesadas         | Exhumadoras 3 · Rendimiento de extracción 4 |

### Industria

Convertirlo en otra cosa. Es la familia más larga porque es la que más escalones tiene: refinar, fabricar componentes, fabricar productos.

| Habilidad              | Rango | Gobierna                                       | Pide                                      |
| ---------------------- | ----: | ---------------------------------------------- | ----------------------------------------- |
| Refinado               |    x1 | Rendimiento del refinado en estación           | —                                         |
| Fabricación            |    x1 | Requisito para fabricar; tiempo de trabajo     | —                                         |
| Munición y cargas      |    x2 | Fabricar munición, cristales y cargas          | Fabricación 2                             |
| Reciclaje              |    x2 | Qué se recupera al desarmar un módulo          | Refinado 2                                |
| Componentes            |    x2 | Fabricar los componentes intermedios           | Fabricación 2                             |
| Tasación de mena       |    x2 | Estimar el rinde de un lote antes de refinarlo | Refinado 2 · Análisis de materiales 2     |
| Química industrial     |    x3 | Procesar gas y hielo en insumos utilizables    | Refinado 3                                |
| Eficiencia de tiempo   |    x3 | Cuánto tarda un trabajo de fabricación         | Fabricación 3                             |
| Planos y licencias     |    x3 | Cuántos planos se pueden tener en uso          | Fabricación 3                             |
| Producción en serie    |    x3 | Cuántos trabajos simultáneos                   | Fabricación 4                             |
| Eficiencia de material |    x4 | Cuánto material se ahorra por trabajo          | Fabricación 4                             |
| Ingeniería de módulos  |    x4 | Fabricar módulos de escalón intermedio         | Componentes 3 · Ajuste de módulos 3       |
| Cristalografía         |    x4 | Fabricar cristales de extracción               | Componentes 3 · Cristales de extracción 2 |
| Fabricación avanzada   |    x5 | Fabricar módulos de escalón A                  | Ingeniería de módulos 4                   |
| Construcción de cascos |    x6 | Fabricar cascos                                | Componentes 4 · Producción en serie 3     |
| Industria de capital   |   x12 | Fabricar cascos y estructuras de clase capital | Construcción de cascos 5                  |

### Comercio

Moverlo y venderlo. La única familia que gobierna números que no son de la nave.

| Habilidad           | Rango | Gobierna                                         | Pide                                |
| ------------------- | ----: | ------------------------------------------------ | ----------------------------------- |
| Regateo             |    x1 | Margen con la estación y comisión del corredor   | —                                   |
| Tasación            |    x2 | Ver el valor real de lo que se compra o se vende | Regateo 2                           |
| Contabilidad        |    x2 | Impuesto de venta y cuántas órdenes podés llevar | Regateo 2                           |
| Aranceles           |    x3 | Qué se paga al operar fuera de la propia bandera | Contabilidad 3                      |
| Análisis de mercado |    x3 | Cuántas regiones del mercado ves                 | Regateo 3                           |
| Corretaje           |    x4 | Comisión al publicar una orden                   | Contabilidad 4                      |
| Contactos           |    x4 | Cuánto tiempo puede quedar publicada una orden   | Regateo 4 · Contabilidad 3          |
| Contratos           |    x4 | Cuántos contratos propios se sostienen           | Corretaje 3                         |
| Logística comercial |    x4 | Costo de mover carga por encargo                 | Contabilidad 3                      |
| Especulación        |    x5 | Ver el histórico de precios y su tendencia       | Análisis de mercado 4               |
| Redes comerciales   |    x6 | Alcance de las órdenes a distancia               | Análisis de mercado 5 · Contactos 4 |

### Combate

Y, sobre todo, no perder la carga.

| Habilidad                | Rango | Gobierna                                      | Pide                                 |
| ------------------------ | ----: | --------------------------------------------- | ------------------------------------ |
| Puntería                 |    x1 | Daño base de las armas montadas               | —                                    |
| Enganche                 |    x2 | A cuántos blancos se apunta y a qué distancia | Puntería 2                           |
| Cañones de masa          |    x2 | Daño cinético                                 | Puntería 3                           |
| Emisores iónicos         |    x2 | Daño iónico                                   | Puntería 3 · Gestión de energía 2    |
| Lanzas térmicas          |    x2 | Daño térmico                                  | Puntería 3                           |
| Municiones               |    x2 | Qué cargas se pueden usar y cuánto rinden     | Puntería 2                           |
| Cadencia                 |    x3 | Tiempo de ciclo de las armas                  | Puntería 4                           |
| Precisión                |    x3 | Cuánto pega a blanco chico o rápido           | Enganche 3                           |
| Drones                   |    x3 | Cuántos drones se controlan                   | Ajuste de módulos 2                  |
| Guerra electrónica       |    x4 | Interferir, trabar o escapar de un enganche   | Gestión de energía 3 · Escaneo 2     |
| Perturbación de sensores |    x4 | Bajar los sensores del otro                   | Guerra electrónica 3                 |
| Inhibición de salto      |    x5 | Impedir que el otro salte                     | Guerra electrónica 4 · Astrogación 3 |
| Artillería pesada        |    x6 | Armas de clase 5 en adelante                  | Cadencia 4 · Cruceros 3              |

### Ciencias

Encontrar, entender y esconderse.

| Habilidad              | Rango | Gobierna                                            | Pide                                |
| ---------------------- | ----: | --------------------------------------------------- | ----------------------------------- |
| Sensores               |    x1 | Alcance de los sensores pasivos                     | —                                   |
| Escaneo                |    x2 | Alcance y calidad del escáner activo                | —                                   |
| Análisis de materiales |    x2 | Identificar lo que se extrae o se encuentra         | Escaneo 2                           |
| Sondas de exploración  |    x3 | Cuántas sondas se lanzan y cómo se ubican           | Escaneo 3                           |
| Análisis de firmas     |    x3 | Distinguir qué es una señal antes de ir             | Sondas de exploración 2             |
| Cartografía            |    x3 | Registrar rutas y sistemas no cartografiados        | Escaneo 3 · Astrogación 2           |
| Perfil de firma        |    x4 | Bajar la propia firma: no ser encontrado            | Sensores 3                          |
| Astrometría            |    x4 | Fuerza de escaneo: qué tan débil puede ser la señal | Sondas de exploración 3             |
| Arqueología            |    x4 | Abrir yacimientos y restos                          | Análisis de firmas 3                |
| Criptografía           |    x4 | Abrir depósitos de datos                            | Análisis de firmas 3                |
| Contravigilancia       |    x5 | Detectar que a uno lo están escaneando              | Perfil de firma 4                   |
| Rastreo                |    x5 | Encontrar una nave concreta y no una señal          | Astrometría 4                       |
| Investigación          |    x5 | Mejorar planos: material y tiempo                   | Análisis de materiales 4            |
| Física de salto        |    x6 | Entender y usar pasajes no cartografiados           | Cartografía 4 · Cálculo de saltos 3 |
| Xenoarqueología        |    x8 | Los restos que nadie sabe leer todavía              | Arqueología 5 · Criptografía 4      |

### Mando

Lo que un piloto hace por otros. Casi todo espera a que existan las flotas.

| Habilidad              | Rango | Gobierna                                     | Pide                     |
| ---------------------- | ----: | -------------------------------------------- | ------------------------ |
| Liderazgo              |    x1 | Cuánto se reparte de los bonos de mando      | —                        |
| Negociación            |    x3 | Recompensa de los contratos de agente        | Liderazgo 2 · Regateo 3  |
| Vuelo en formación     |    x4 | Cuántas naves coordina una flota             | Liderazgo 3              |
| Tácticas de escolta    |    x4 | Bono a lo que se protege, no a uno mismo     | Liderazgo 3 · Enganche 3 |
| Mando de flota         |    x6 | Bono que se reparte a toda la flota          | Vuelo en formación 3     |
| Diplomacia corporativa |    x6 | Reputación ganada por operar con una bandera | Negociación 4            |
| Doctrina de flota      |    x8 | Cuántos bonos de mando se sostienen a la vez | Mando de flota 4         |

### Cómo crece sin desbordarse

Tres reglas para cuando haya que agregar la habilidad ciento doce:

1. **Una habilidad nueva mueve un número que ya existe, o entra con la mecánica
   que lo crea.** Nunca antes. Es la regla de la cadena aplicada a este catálogo.
2. **Cada familia tiene una sola habilidad de entrada de rango x1** —dos como
   mucho—. Es la puerta, y una familia con cinco puertas no se siente como una
   rama sino como una bolsa.
3. **El rango sale de la escalera**, no del gusto. Si una habilidad parece merecer
   un rango que la escalera no le da, lo que está mal es dónde se la puso en el
   árbol.

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
