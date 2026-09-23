# Estado y huecos

> Qué existe hoy en Vaxav, qué está colgando y con qué se engancha cada cosa.
> **Mira para atrás y no promete nada**: es un mapa, no un plan.
>
> Ver también: [arquitectura](systems/ARCHITECTURE.md) · «La cadena» en
> [DESIGN.md](DESIGN.md)

## Cómo se lee este mapa

Ninguna mecánica entra sola: toda característica arrastra **siete eslabones**
—verbo, insumo, fuente, aparato, llave, fábrica y lugar— y el eslabón que falta
deja un **huérfano**. Ver «La cadena» en [DESIGN.md](DESIGN.md).

La leyenda mide **una sola cosa: si el juego lo hace**.

| Marca | Qué quiere decir                                                             |
| ----- | ---------------------------------------------------------------------------- |
| ✅    | Existe y anda: hay código que lo ejecuta                                     |
| 🔨    | Decidido y escrito —en un documento de sistema o en el catálogo—, sin efecto |
| ❌    | Ni siquiera eso: falta la decisión, los números, o las dos cosas             |
| —     | No aplica a esta cadena                                                      |

Dos aclaraciones, que es donde un mapa como éste se vuelve mentira si se afloja:

- **Una llave es ✅ cuando la habilidad mueve un número o abre una puerta**, no
  cuando está en el catálogo. Las 111 habilidades existen; **dieciséis** mueven
  algún número y las otras 95 son 🔨. Y hay un escalón intermedio que la marca no
  distingue y conviene decir: **seis de esas dieciséis mueven un número que ningún
  verbo lee**, así que la cadena que las nombra sigue abierta igual.
- **Un eslabón con dos mitades en distinto estado va en dos filas.** No se
  promedia: una fuente a medias no es media fuente, es una que anda por un lado y
  no existe por el otro.

## El mapa de los huecos

Nueve actividades y 74 eslabones: **22 ✅, 32 🔨 y 11 ❌**, más nueve que no
aplican. **Ninguna cadena está entera.** La que más se acerca es comerciar, que
tiene todos sus eslabones andando y una sola llave muerta colgando.

Las nueve no son ocho más una nueva: **saltar se partió en dos** el día que
cruzar una puerta pasó a ser gratis. Lo que la puerta dejó de usar —el
combustible, el tanque, las dos habilidades— no desapareció del mapa, se mudó a
la actividad que lo va a gastar, que es la única forma de que un eslabón suelto
siga teniendo dueño.

### Minar mineral

| Eslabón    | Qué es                                             |     |
| ---------- | -------------------------------------------------- | --- |
| El verbo   | Extraer de una roca leída                          | ✅  |
| El insumo  | Ninguno: el láser común no gasta nada              | ✅  |
| La fuente  | Cinturones con rocas que se agotan y reponen       | ✅  |
| La fuente  | Ocho minerales por nivel de seguridad              | 🔨  |
| El aparato | Láser de extracción, recolectores                  | ✅  |
| La llave   | Minería, Prospección, Gestión de energía           | ✅  |
| La llave   | Estiba, Rendimiento de extracción                  | 🔨  |
| La fábrica | Lente focal + silicio                              | 🔨  |
| El lugar   | Los dos cinturones de Ánfora; la estación que paga | ✅  |

**Es la cadena más recorrida y no está cerrada.** El catálogo tiene **cuatro**
minerales de los ocho, y hay dos habilidades que el jugador razonablemente cree
que sirven y no tocan nada: **Estiba** sólo aparece como regalo de profesión, y
**Rendimiento de extracción** —que por nombre debería ser el bono general— no la
lee nadie, porque el bono de extracción lo mueve **Minería**. Una llave que se
llama igual que el número que no mueve es peor que una llave que falta.

Lo que sí cierra por adentro: la estabilidad del acumulador recorta el
rendimiento cuando el equipamiento no alcanza, y por eso **Gestión de energía**
es mecánica sin tener un verbo propio.

### Minar con láser de tira

| Eslabón    | Qué es                                               |     |
| ---------- | ---------------------------------------------------- | --- |
| El verbo   | Extraer en serie                                     | 🔨  |
| El insumo  | **Cristal de extracción, que se gasta**              | 🔨  |
| La fuente  | El mismo cinturón, más rápido                        | 🔨  |
| El aparato | Láser de tira, sólo en barcaza                       | 🔨  |
| La llave   | Láseres de tira, Cristales, Barcazas, Cristalografía | 🔨  |
| La fábrica | Cristalografía, en taller de estación                | 🔨  |
| El lugar   | Cinturón + taller que fabrique cristales             | 🔨  |

Propuesta entera y **cierra sola**: es la más completa de las cadenas que no
existen, y por eso sigue siendo la mejor candidata a construirse de una vez. Las
cuatro habilidades **ya están en el catálogo** y ninguna gatea nada; además
**Cristalografía es de Industria**, que hoy no tiene de dónde sacar experiencia,
así que entraría como una llave que no se puede fabricar. Ver el cristal de
extracción como cadena de ejemplo en [materiales](systems/MATERIALS.md).

### Refinar

| Eslabón    | Qué es                         |     |
| ---------- | ------------------------------ | --- |
| El verbo   | Convertir mineral en material  | ❌  |
| El insumo  | El mineral, que se consume     | ✅  |
| La fuente  | La minería                     | ✅  |
| El aparato | La refinería de la estación    | 🔨  |
| La llave   | Refinado, Tasación de mena     | 🔨  |
| La fábrica | No aplica                      | —   |
| El lugar   | Cuatro de las cinco estaciones | ✅  |

**El verbo no existe y es el hueco más barato de todos.** El insumo, la fuente y
el lugar están: la baldosa «Refinería» está sembrada en Puerto Ánfora, el Muelle
de los Anillos, la Planta Escarcha y el Hábitat Talo, y no abre nada. Los doce
refinados están escritos en [materiales](systems/MATERIALS.md) y **sólo uno es un
ítem del catálogo**: el helio-3, que entró por la puerta de al lado y que el
mercado no muestra. Refinar no tiene todavía adónde dejar lo que saque. Va ❌ y no
🔨 por una
razón concreta: **la merma no tiene número en ningún documento**, y sin merma
refinar es una conversión sin decisión adentro.

Y hay un aparato que promete el verbo antes de que exista: el módulo **Refinería
de a bordo** dice «convierte en el sitio y te ahorra el viaje», y lo único que
hace es quitar 30 de bodega.

### Saltar a otro sistema

| Eslabón    | Qué es                                         |     |
| ---------- | ---------------------------------------------- | --- |
| El verbo   | Cruzar una puerta                              | ✅  |
| El insumo  | Ninguno: la puerta hace el trabajo             | —   |
| La fuente  | No aplica: no hay insumo que reponer           | —   |
| El aparato | Ninguno: cualquier nave cruza cualquier puerta | —   |
| La llave   | Ninguna: ninguna habilidad cambia el cruce     | —   |
| La fábrica | No aplica                                      | —   |
| El lugar   | La puerta como cuerpo; el cuartel las conecta  | ✅  |
| El lugar   | Un segundo sistema al que llegar               | ❌  |

**Era el huérfano más viejo del juego y dejó de serlo por un cambio de regla, no
por haberse construido.** Cruzar una puerta pasó a ser gratis: no cuesta
combustible, no pide alcance y la misma puerta tarda lo mismo para cualquier
nave. El argumento entero está en
[cruzar es gratis](systems/ACTIONS.md#cruzar-es-gratis); en una línea, **la
puerta es el único camino entre sistemas**, así que un tanque vacío no dejaría a
nadie lento sino varado.

Lo que queda es una cadena de tres eslabones —un verbo, un lugar y nada más— y un
solo hueco, que es el de siempre: **el universo oficial es un solo sistema y
ninguna puerta**. La puerta existe como cuerpo y el constructor del cuartel las
conecta a mano; la siembra de prueba arma sesenta sistemas con las suyas. La
galaxia que reparte `npm run db:seed` es Ánfora y nada más, así que el verbo no
tiene adónde llevarte.

Los eslabones que se fueron **no se borraron: se mudaron** a la actividad que
sigue.

### Saltar sin puerta

| Eslabón    | Qué es                                                     |     |
| ---------- | ---------------------------------------------------------- | --- |
| El verbo   | El motor de salto: cruzar entre sistemas no vecinos        | ❌  |
| El insumo  | **Combustible**: ítem del catálogo, fuera del mercado      | 🔨  |
| La fuente  | **Hielo → helio-3**, escrito y sin construir               | 🔨  |
| La fuente  | Comprarlo hecho: tiene precio y el repostaje está escrito  | 🔨  |
| El aparato | El motor de salto de una capital                           | ❌  |
| El aparato | Tanque, depósito auxiliar y calibrador de salto, montables | 🔨  |
| La llave   | Astrogación y Eficiencia de combustible                    | 🔨  |
| La fábrica | Tubo de contención + uranio                                | 🔨  |
| El lugar   | Un sistema no vecino al que saltar                         | ❌  |

**No existe una línea de esto, y aun así tiene seis eslabones escritos**: es la
cadena que heredó todo lo que el salto por puerta dejó de usar. El helio-3 es un
ítem del catálogo con volumen y precio que **el mercado no muestra**, el consumo
por masa y su eficiencia están calculados y probados, el repostaje está escrito y
sin llamadores, y tres piezas se montan sin gobernar nada.

Son **huérfanos declarados y con fecha**, que es lo que
[la cadena](DESIGN.md#no-hace-falta-cerrarla-de-una-vez) permite, y la fecha es
la misma para los seis: el día que exista el motor de salto de las capitales. Ver
[las capitales](systems/SHIPS.md#la-cadena) para lo que arrastra ese verbo, que
es bastante más que un salto.

Dos anotaciones que valen para elegir:

- **Eficiencia de combustible ya resuelve su porcentaje** —es una fila más de la
  tabla de bonos— y no lo lee nadie. Antes ni eso: la fórmula lo aceptaba y todos
  los que la llamaban le pasaban cero.
- **Astrogación mueve el alcance de salto y ningún verbo lee ese número.** Sigue
  abriendo una puerta —es requisito del calibrador de salto de escalón II—, pero
  es un requisito para montar una pieza que tampoco gobierna nada. Y hay un
  cruce que conviene resolver cuando el verbo entre: por nombre el alcance
  debería moverlo **Cálculo de saltos**, que no lo lee nadie, igual que pasa con
  Minería y Rendimiento de extracción.

### Fabricar un módulo

| Eslabón    | Qué es                                          |     |
| ---------- | ----------------------------------------------- | --- |
| El verbo   | Fabricar                                        | ❌  |
| El insumo  | Componentes y refinados                         | 🔨  |
| La fuente  | Refinado y fabricación de componentes           | 🔨  |
| El aparato | El taller de la estación                        | 🔨  |
| La llave   | Fabricación, Componentes, Ingeniería de módulos | 🔨  |
| La fábrica | No aplica: es la fábrica                        | —   |
| El lugar   | Hábitat Talo, la única con taller               | ✅  |

Los ocho componentes están escritos y ninguno existe como ítem. Las tres
habilidades están en el catálogo y son **de Industria**, la familia sin pozo: no
se podrían entrenar aunque el verbo apareciera mañana.

### Escanear y explorar

| Eslabón    | Qué es                                          |     |
| ---------- | ----------------------------------------------- | --- |
| El verbo   | Escanear una roca                               | ✅  |
| El verbo   | Escanear un sistema, un cuerpo o a alguien      | ❌  |
| El insumo  | **Sondas**, que se gastan                       | 🔨  |
| La fuente  | Circuito impreso + silicio                      | 🔨  |
| El aparato | Escáner de superficie, amplificador de sensores | ✅  |
| El aparato | Lanzador de sondas                              | ❌  |
| La llave   | Escaneo, Prospección                            | ✅  |
| La llave   | Sondas, Astrometría, Análisis de firmas         | 🔨  |
| La fábrica | Taller: circuito impreso + silicio              | 🔨  |
| El lugar   | Cualquier sistema; lo que se encuentra está ahí | 🔨  |

**Escanear una roca cierra de punta a punta** —el verbo, el escáner, las dos
habilidades y el cinturón donde se hace— y el instrumento para explorar es el
mismo: leer una piedra desconocida y leer un sistema al que nadie fue son la
misma operación. Lo que falta no es el instrumento sino el lugar adonde llevarlo,
y eso llega con la puerta.

**Y su reverso, que es la misma cadena:** el **Amortiguador de firma** ya está
montable y baja catorce puntos de una firma **que no lee ningún verbo**, y
**Perfil de firma** sigue sin efecto. Y la deuda ya cobró una vez: el optimizador
de warp de escalón I nació cobrando doce puntos de firma, o sea **dando velocidad
a cambio de nada**, y hubo que cambiarle la divisa a bodega antes de que el
precio quedara escrito en el balance. **Mientras la firma no la lea ningún verbo,
cobrar en firma es regalar el módulo.** Es un aparato construido antes que la
mecánica que lo justifica; diseñar los dos lados juntos es lo que evita terminar
con dos sistemas parecidos que no se hablan.

### Comerciar

| Eslabón    | Qué es                                                |     |
| ---------- | ----------------------------------------------------- | --- |
| El verbo   | Comprar y vender, contra la estación y entre pilotos  | ✅  |
| El insumo  | Créditos                                              | ✅  |
| La fuente  | Todo lo demás                                         | ✅  |
| El aparato | Ninguno                                               | —   |
| La llave   | Regateo, Contabilidad, Análisis de mercado, Contactos | ✅  |
| La llave   | Corretaje                                             | 🔨  |
| La fábrica | No aplica                                             | —   |
| El lugar   | Cuatro de las cinco estaciones tienen mercado         | ✅  |

**La cadena más cerrada del juego**: no le falta ningún eslabón y lo único que
cuelga es una llave que no hace nada. Regateo mueve la horquilla y la comisión,
Contabilidad el impuesto y cuántas órdenes se pueden llevar, Análisis de mercado
hasta dónde se ve y Contactos cuánto dura lo publicado. **Corretaje** está en el
catálogo y no hace nada: la comisión del corredor la mueve Regateo. Ver
[el mercado](systems/MARKET.md).

### Combatir

| Eslabón    | Qué es                                      |     |
| ---------- | ------------------------------------------- | --- |
| El verbo   | Disparar                                    | ❌  |
| El insumo  | Cargas cinéticas, iónicas y térmicas        | 🔨  |
| La fuente  | Fabricación                                 | 🔨  |
| El aparato | Cañón de masa, emisor iónico, lanza térmica | ✅  |
| El aparato | Los tres propulsores auxiliares, sub-warp   | ✅  |
| La llave   | Las trece habilidades de Combate            | 🔨  |
| La llave   | Un pozo del que sacarles la experiencia     | ❌  |
| La fábrica | Taller                                      | 🔨  |
| El lugar   | Ninguno                                     | ❌  |

**Los aparatos entraron antes que el verbo.** Las tres armas se montan, el daño
por tipo se calcula, los puntos de vida efectivos también, y **ningún servicio
lee esos números**: viven en la ficha de la nave y ahí se quedan. Puntería,
Escudos y Blindaje son las tres únicas de la familia que mueven algo, y lo que
mueven no lo consume nadie —el mismo huérfano del Amortiguador de firma—.

Y hay un ❌ que no es del combate sino de más arriba: **la familia no tiene pozo
de experiencia**, así que sus trece habilidades no se pueden entrenar ni aunque
el verbo apareciera mañana.

**Y acá se mudó el movimiento sub-warp**, el día que viajar dentro de un sistema
dejó de salir del empuje y pasó a ser alineación más warp. Lo que se durmió son
cuatro cosas con el mismo dueño: el **empuje** del casco, los **tres propulsores
auxiliares** —que se montan y suman, y por eso van ✅ como las armas—, el bono de
**Navegación** sobre la velocidad y la habilidad **Ingeniería de propulsión**.
Ninguna mueve un reloj hoy, y el verbo que las despierta es éste: maniobrar cerca
de otra nave —acercarse, abrir distancia, orbitar— es todo sub-warp. Es el mismo
reparto que hizo el salto cuando cruzar pasó a ser gratis: el eslabón no se borra,
se muda a la actividad que lo va a usar. Ver
[viajar es alinearse y cruzar](systems/SHIPS.md#viajar-es-alinearse-y-cruzar).

### Los huérfanos más grandes

Ordenados por lo que cuesta dejarlos abiertos, no por lo que cuesta cerrarlos:

1. **Cuatro de las ocho familias no tienen de dónde sacar experiencia.**
   Ingeniería, Industria, Combate y Mando suman **52 de las 111 habilidades**, y
   hoy ninguna se puede entrenar: la experiencia se deposita por rama y sólo
   Pilotaje, Extracción, Ciencias y Comercio reciben depósitos. De ahí sale la
   regla que condiciona todo lo que venga: **sólo se gatea con habilidades que se
   puedan entrenar**, porque pedir una de una rama sin fuente es cerrar la puerta
   con la llave adentro.
2. **De las 111 habilidades, dieciséis mueven algo**, y seis de ésas —Puntería,
   Escudos, Blindaje, Astrogación, Eficiencia de combustible y ahora **Navegación**—
   mueven números que ningún verbo lee. La que se sumó a la cuenta es **Maniobra**,
   que estrenó efecto: divide la agilidad y con eso acorta la alineación, que es la
   mitad fija del reloj de un viaje. La que salió es **Manejo de lanzaderas**, que
   perdió el bono de rol de la Pioner cuando se decidió que la nave de alta no
   lleva ninguno: vuelve a ser sólo llave, y la despierta la segunda lanzadera del
   catálogo.
3. **Veintinueve de los 36 módulos no piden ninguna habilidad.** La regla dice
   que todo módulo pide algo —[el escalón](systems/SHIPS.md#el-escalón-i-y-ii)—
   y hoy sólo **7** la cumplen: los cinco de escalón II, el láser de extracción
   de escalón II y el optimizador de warp chico. Los otros 29 heredan la lista
   vacía de la base. **Es una tanda de catálogo, no un olvido**: hay que elegirle
   habilidad y nivel a cada uno, y cuidar que lo que entra en el kit de partida
   siga siendo gratis, porque nadie empieza el juego con habilidades.
4. **La bandeja de refuerzos está vacía.** Los cinco cascos tienen sus ranuras de
   refuerzo y su presupuesto de calibración, y el catálogo no tiene **un solo
   refuerzo**: es la única bandeja que no se puede llenar.
5. **La reputación no tiene fuente.** Está guardada como libro, se dibuja en la
   escalera, decide hasta qué nivel de agente se llega, y **nada la escribe**: la
   fuente declarada son las misiones y las misiones no existen. Todo piloto está
   en cero para siempre.
6. **El universo oficial es un sistema sin puertas.**
7. **Cuatro aparatos prometen verbos que no existen**: la Refinería de a bordo,
   el Amortiguador de firma, el calibrador de salto y el depósito auxiliar.
8. **El empuje se quedó sin verbo, y con él cuatro piezas.** Movía la duración de
   los viajes dentro del sistema hasta que ésa pasó a ser alineación más warp.
   Duermen el empuje del casco, los tres propulsores auxiliares, el bono de
   Navegación e Ingeniería de propulsión. **Es un huérfano declarado y con fecha**
   —lo despierta el combate, porque maniobrar de cerca es sub-warp— y lo que lo
   mantiene honesto es que las descripciones de los tres propulsores se cambiaron
   el mismo día: ninguno promete ya un viaje más corto.
9. **El combustible no tiene consumidor.** Bajó del primer puesto al último y no
   por haberse arreglado: cruzar una puerta dejó de gastarlo, así que ya no deja
   a nadie varado y pasó a ser un huérfano tranquilo, con su verbo anotado —el
   motor de salto de las capitales— y sin nada que se rompa mientras tanto. Sigue
   en la lista porque **un insumo sin consumidor no se arregla solo**: o llega el
   verbo, o algún día hay que sacarlo.

## Lo que existe

Registro de lo que está construido y andando. No es una promesa cumplida: es
inventario.

| Qué                   | Qué dejó                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| Cuenta y piloto       | Alta en cuatro pasos, ingreso, sesión, suspensión                                                           |
| Interfaz              | El HUD de Elite Dangerous, el Neocom, las pestañas y 97 componentes propios                                 |
| El universo           | Región, constelación, sistema, cuerpo, cinturón, puerta y estación como filas; Ánfora sembrado              |
| El mapa de la galaxia | Grilla de hexágonos en lienzo, con arrastre, zoom y filtros, en el cuartel y en la cabina                   |
| Naves                 | Cinco cascos, 36 módulos, cuatro bandejas y cuatro presupuestos                                             |
| Equipamiento          | La ficha de la nave como herramienta: tres columnas y los presupuestos siempre a la vista                   |
| Bodega                | Bahías con la barra partida por contenido, búsqueda, filtro, orden, paginado y créditos por m³              |
| Motor de acciones     | Encolar, resolver perezoso e idempotente, informar. Cinco clases: viajar, saltar, minar, acordar y escanear |
| Habilidades           | 111 en ocho familias, la curva, los prerrequisitos, el pozo por rama, el árbol y el IPP                     |
| Profesiones           | Ocho, una por familia, **sin ninguna consecuencia mecánica**                                                |
| Minería               | Cinturones con rocas que se agotan y se reponen solas                                                       |
| El escáner            | La lectura por piloto, con profundidad según habilidad, que vence al día                                    |
| Mercado               | Contra la estación y entre pilotos: comisión, impuesto, alcance por regiones, historial de precios          |
| Billetera             | Créditos, el libro de asientos y el de ítems                                                                |
| Propiedades           | Qué tenés y dónde, en toda la galaxia                                                                       |
| Mensajes              | Dos bandejas sobre una fila, enviados, archivados y el aviso de lo que no abriste                           |
| Corporaciones         | Alistarse y renunciar, miembros, ubicaciones, agentes y la escalera de reputación                           |
| Fichas                | Corporación, piloto y agente en una ventana, desde cualquier nombre, con su estado en la URL                |
| Presencia             | Quién más está parado en la misma estación                                                                  |
| Bitácora              | El registro paginado de cada acción resuelta, con su aviso al volver                                        |
| El cuartel            | Roles y permisos, registro de eventos, moderación, ficha de piloto y constructor de sistemas                |

### Los catálogos, en cifras

| Catálogo           | Hoy                                                                     |
| ------------------ | ----------------------------------------------------------------------- |
| Habilidades        | 111 en ocho familias; **dieciséis** mueven algo                         |
| Familias con pozo  | Cuatro de ocho                                                          |
| Cascos             | 5, ninguno con clase declarada                                          |
| Módulos            | 36 —28 de escalón I y 8 de II—; **7 piden habilidad**, ningún refuerzo  |
| Bandejas           | Altos, medios, bajos y refuerzos                                        |
| Ítems              | Minerales, módulos y un refinado: el helio-3, que el mercado no muestra |
| Minerales          | 4 de los 8 previstos                                                    |
| Profesiones        | 8                                                                       |
| Clases de acción   | 5                                                                       |
| Sistemas sembrados | 1, con 2 cinturones, 5 estaciones y 0 puertas                           |

## Por qué un mapa y no una hoja de ruta

Este documento fue mucho tiempo una lista de etapas numeradas con dependencias, y
**quedó dieciséis commits atrasado**. No por olvido: una etapa numerada es una
promesa sobre cómo se va a trabajar, y acá se trabaja sobre la marcha, eligiendo
qué construir cuando conviene. Un orden que nadie pensaba seguir se desactualiza
al primer desvío, y a partir de ahí el documento miente dos veces: sobre lo que
está hecho y sobre lo que viene.

Un mapa de huecos no tiene ese problema porque **no promete nada**. Mira para
atrás, se corrige leyendo el código, y **hace mejor el trabajo sobre la marcha en
vez de pelearlo**: cuando hay ganas de construir algo, dice con qué se engancha y
qué se cierra de arrastre. Es lo que `AGENTS.md` ya pide como regla central —«no
hace falta cerrarla de una vez, pero sí saber dónde están los huecos»— puesto por
escrito.

**Las marcas se verifican contra el código, no contra lo que este documento decía
antes.** Un mapa de huecos con marcas viejas es peor que no tenerlo, porque se le
cree.

## Ideas sin orden

Cosas decididas o propuestas que no entraron. **No hay orden y la lista no es una
cola**: se agarra la que convenga el día que convenga. Lo que se conserva es el
razonamiento de qué se engancha con qué, que es lo único que ahorra trabajo a la
hora de elegir.

| Idea                          | Qué cierra                                                                                             | Conviene tener antes    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------- |
| **Refinar**                   | El verbo que falta, los doce refinados y la merma                                                      | Nada                    |
| **El salto sin puerta**       | El consumidor que le falta al combustible: el tanque, el depósito, el calibrador y sus dos habilidades | Las capitales           |
| **El hielo**                  | La fuente del combustible: cosechador, cuatro hielos, helio-3                                          | Refinar y un consumidor |
| **Los refuerzos**             | La bandeja vacía: catálogo, calibración que se gasta, siete habilidades de Ingeniería                  | Nada                    |
| **Las llaves del catálogo**   | Los 29 módulos que no piden ninguna habilidad, con su kit de partida a salvo                           | Nada                    |
| **Las clases de nave**        | `Hull.class` y las habilidades de clase como requisito duro                                            | Nada                    |
| **Componentes y fabricar**    | El verbo, los ocho componentes y las recetas por módulo                                                | Refinar                 |
| **El generador de módulos**   | Familias más fórmula de clase y escalón, para no escribirlos a mano                                    | Fabricar                |
| **Barcazas y cristales**      | La cadena del láser de tira, entera                                                                    | Fabricar                |
| **Sondas y firmas**           | Explorar y su reverso: encontrar y esconderse                                                          | Fabricar                |
| **El gas**                    | Aspirador, tres gases y nubes que hay que escanear                                                     | Escanear                |
| **El segundo sistema**        | Que la puerta lleve a un lugar y no a un pasillo: mineral propio y precios propios                     | Puertas sembradas       |
| **Inyecciones y laboratorio** | Que desbloquear una habilidad cueste plata                                                             | Vender                  |
| **Misiones**                  | La fuente de la reputación, que hoy no tiene ninguna                                                   | Agentes, que ya están   |

Los enganches que importan más que la lista:

- **Refinar antes que fabricar, y fabricar antes que generar módulos.** Fabricar
  sin refinar no tiene insumo, y generar módulos sin saber con qué se fabrican es
  generar la mitad de cada uno.
- **Los refuerzos no dependen de nada y cierran una bandeja entera.** La ranura y
  el presupuesto ya están en los cinco cascos; falta el catálogo. Se pueden
  fabricar con material refinado hasta que existan los restos. Los dos
  optimizadores de warp **no cuentan**: entraron como módulos bajos a propósito,
  para no estrenar la bandeja de refuerzos de costado y con dos piezas sueltas.
- **El hielo ya no cierra nada solo.** Era la que más impacto tenía mientras el
  combustible se gastaba; ahora sería darle una fuente a un insumo que nadie
  consume, que es el mismo huérfano con un eslabón más. Primero el verbo que
  gasta, después la fuente. Si hay que elegir una sola por costo, sigue siendo
  refinar.
- **La inyección va después de vender**, porque un inyector cuesta plata: al
  revés sería una reja sin llave. Y el laboratorio no es hoy uno de los ocho
  servicios de estación, así que entra con su baldosa o entra en otro lado.

### Las cargas del láser, y por qué el árbol tiene que crecer

Un láser de extracción va a pedir **una carga específica para cada mineral**,
como en EVE: no se pica iridio con la carga del silicato. La carga es un
consumible que se compra, se lleva en la bodega y se gasta, y **cada tipo de
carga tiene su habilidad**.

Eso hace tres cosas a la vez. Le da al mineral escaso una segunda barrera que no
es el viaje —hay que tener la carga y saber usarla—; convierte la bodega en una
decisión antes de salir, porque el espacio que ocupa la carga no lo ocupa el
mineral; y **alarga el árbol de habilidades**, que es el punto.

Porque el catálogo de habilidades **se quiere grande a propósito**. Un juego idle
se mide en meses, y un árbol que se termina es un juego que se termina. Las
ciento once de hoy son el esqueleto, no el destino: cada sistema que se agregue
—cargas, drones, fabricación, combate— trae las suyas, y ésa es la forma en que
el juego se hace largo sin inventar números más grandes. Lo que hace falta antes
que más habilidades es que las que hay tengan de dónde entrenarse: **cincuenta y
dos están en ramas sin pozo**.

El detalle fino se decide **cuando haya economía que balancear**. Afinarlo antes
sería balancear una que todavía no existe.

### El cuartel general

Va aparte porque **no agrega un verbo al juego**: agrega herramientas para
operarlo, y por eso nunca empuja para atrás a nada del mapa.

- ~~Roles, permisos y el guardia del área.~~
- ~~El registro de eventos, escribiendo desde los servicios que ya existen.~~
- ~~La pantalla que lo lista, con su traza de actividad, sus filtros y su
  paginado.~~
- ~~El constructor de sistemas: estrellas, planetas, estaciones y las puertas
  conectadas a mano.~~
- ~~La ficha de piloto: identidad, contraseña, créditos, mudarlo de lugar,
  sancionar, levantar la sanción y darle roles.~~
- ~~El mapa de la galaxia, en lienzo, con arrastre, zoom y filtros, primero en el
  cuartel y después en la cabina.~~
- La pantalla para administrar roles: crearlos, cambiarles los permisos y
  borrarlos. **El servicio ya lo hace todo** —crear, editar, borrar, otorgar y
  revocar—; lo único que falta es la pantalla, porque asignar roles se hace desde
  la ficha del piloto y lo demás no se hace desde ningún lado.
- Las estadísticas del sector.

El registro de eventos fue **primero** y no por casualidad: es lo que hace
auditables a todas las herramientas que vengan después. Una que crea entidades
sin dejar constancia es una que nadie puede revisar, y agregarle el registro más
tarde significa que lo que pasó hasta entonces se perdió. Ver
[administración](systems/ADMIN.md).

### Anotado y sin hacer

Cosas decididas que no entraron todavía, para que no se pierdan:

- **La ficha de tránsito tiene que variar según a dónde se va.** Hoy cuenta igual
  un salto a otro sistema, un viaje a un cinturón y uno a una estación, y no son
  el mismo viaje.
- **En el teléfono, una tabla tiene que dibujarse como tarjetas.** Desplazarse a
  lo ancho para leer una fila no es lo que uno hace con el pulgar. Lo resuelve
  `HudTable` —que ya tiene las columnas declaradas como dato— y no cada pantalla:
  ocho listados largos con ocho maquetas paralelas son ocho que se separan.
- **Un contenedor tiene que decir de qué bahía es.** La pantalla de la bodega ya
  dibuja las bahías como lista aunque hoy haya una sola, porque las barcazas van
  a tener bodega de mineral aparte y las cargueras su bahía de flota. Del lado de
  los datos todavía no hay con qué distinguirlas.

### Lo lejano

En orden de valor y no de dificultad: corporaciones de jugadores, exploración de
sistemas nuevos, drones, combate y estaciones de jugador. Cada uno espera a que
el circuito de abajo aguante su peso.

De ésos el más cercano es **explorar**, porque el mecanismo ya está construido:
leer una piedra desconocida es lo mismo que leer un sistema al que nadie fue.
Falta el lugar adonde llevarlo. Ver [universo](systems/UNIVERSE.md).

## Lo que se decide en el camino

Preguntas cuya respuesta **cambia el diseño y no sólo los números**. No están acá
por olvido: están porque construir lo que depende de ellas antes de contestarlas
es trabajo que después hay que deshacer.

| Pregunta                                                    | Hace falta para                        | Por qué importa                                                                                                                             |
| ----------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| ¿Se puede encolar más de una acción?                        | Cualquier cadena larga                 | Con una sola, una cadena larga es una fila de espera; con varias, el pozo por familia se llena mucho más rápido y la curva pide otro número |
| ¿El mineral se agota por sistema o por cinturón?            | Minería                                | Decide si a una corporación le conviene instalarse en un lugar                                                                              |
| ¿El mapa es fijo o generado?                                | El segundo sistema                     | Un generador obliga a que toda descripción y todo balance sea derivado                                                                      |
| ¿La fabricación tarda tiempo real?                          | El taller                              | Si tarda, compite con minar y es otra acción; si no, el técnico no tiene qué hacer mientras                                                 |
| ¿Los planos son objeto comerciable?                         | El taller                              | Comerciables abren una economía entera; fijos por habilidad quitan una capa                                                                 |
| ¿Cuánto rinde el escalón II sobre el I?                     | Módulos                                | Si es mucho, el equipo decide más que el piloto; si es poco, subir de escalón no es una meta                                                |
| ¿Las variantes de calidad del mineral son ítems?            | Materiales                             | Ítems distintos es más simple de mercado y multiplica el catálogo por cuatro                                                                |
| ¿De dónde sale la experiencia de las cuatro ramas sin pozo? | Ingeniería, Industria, Combate y Mando | Sin respuesta, 52 habilidades son inalcanzables y ninguna puede usarse como requisito                                                       |
| ¿Qué le pasa al piloto cuando pierde la nave?               | Combate                                | Está decidido que vuelve; falta dónde, con qué y cuánto tarda                                                                               |
| ¿Cuánto PvP directo y cuánto conflicto indirecto?           | Combate                                | Decide si el mapa se disputa con naves o con precios                                                                                        |
