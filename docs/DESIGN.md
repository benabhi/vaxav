# Vaxav — diseño

> Documento vivo. Se va corrigiendo a medida que el juego se define; lo que está
> acá es intención de diseño, no una promesa.

## Visión

Vaxav es un juego web multijugador de navegador, **textual** y de **ritmo lento**.
El jugador es un piloto independiente con una nave en un sector espacial que
ninguna facción termina de controlar. No hay campaña ni final: es un sandbox
donde cada uno decide a qué dedicarse (extraer, transportar, comerciar,
explorar, pelear) y el mundo lo comparten todos.

Se lo puede definir como una mezcla de tres juegos: el **ritmo de OGame** —dar una
orden y esperar un contador—, la **profundidad de EVE Online** —habilidades que
tardan meses, economía en manos de los jugadores, un solo universo compartido— y
la **piel y las naves de Elite Dangerous** —el HUD naranja y una nave que se arma
ranura por ranura—.

La unidad de decisión es **una nave con capacidad limitada**, no una base que sólo
crece: por eso todo lo que se lleva obliga a dejar otra cosa.

## Pilares

1. **El tiempo es el recurso.** Toda acción tarda. No se acelera con clicks: se
   planifica. Una sesión típica es entrar, ver qué se resolvió, dar la próxima
   orden y salir.
2. **Texto, no gráficos.** La interfaz imita una terminal de a bordo. La riqueza
   está en los números y en la descripción, no en la animación.
3. **Todo cuesta algo.** Combustible, espacio de bodega, desgaste. Las decisiones
   duelen porque cierran otras puertas.
4. **El mundo es compartido.** Los precios, los recursos y los peligros dependen
   de lo que hagan los demás pilotos, no de un guion.
5. **Simple de entrar, hondo de jugar.** Pocas mecánicas, pero que se combinen.

## Bucle de juego

```
elegir acción → se agenda con un tiempo de resolución → esperar
             → al vencer, se aplica el resultado (recursos, daño, posición)
             → cambia el estado del piloto → elegir la próxima acción
```

Decisión técnica central: las acciones **no** se resuelven con un proceso que
corre en segundo plano tickeando cada segundo. Se guardan con su instante de
inicio y su duración, y se resuelven de forma **perezosa**: cuando el jugador (o
cualquier consulta que las necesite) las mira, se calcula lo que ya venció. Así
el servidor no trabaja mientras nadie juega y el resultado es el mismo esté el
jugador conectado o no.

## Sistemas

El detalle de cada sistema vive en su propio documento. Todos son **propuestas**:
la mecánica es la intención de diseño y los números están para corregirse.

| Documento                                            | De qué trata                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| [El MVP](MVP.md)                                     | Qué es lo mínimo que ya es Vaxav, y qué queda afuera                            |
| [Hoja de ruta](ROADMAP.md)                           | El orden en que se construye, y por qué ese orden                               |
| [Arquitectura](systems/ARCHITECTURE.md)              | Las decisiones técnicas caras de cambiar después                                |
| [Habilidades](systems/SKILLS.md)                     | Niveles 0–5, multiplicadores, curva de XP, prerrequisitos y catálogo            |
| [Acciones, tiempo y experiencia](systems/ACTIONS.md) | Cómo se calcula la duración, cómo se resuelve y cómo se reparte la XP           |
| [El universo](systems/UNIVERSE.md)                   | Jerarquía del mapa, tipos de cuerpo y el sistema inicial                        |
| [Naves y módulos](systems/SHIPS.md)                  | Atributos del casco, los tres presupuestos, los tipos de daño y el equipamiento |
| [El mercado](systems/MARKET.md)                      | La horquilla de la estación, qué comercia cada una y dónde queda lo comprado    |
| [Profesiones](systems/PROFESSIONS.md)                | El oficio previo del piloto y las habilidades con las que arranca               |
| [Facciones](systems/FACTIONS.md)                     | De dónde viene el piloto y en qué estación empieza                              |
| [Corporaciones](systems/CORPORATIONS.md)             | Quién opera las estaciones, y la capa entre estación y facción                  |
| [Agentes y misiones](systems/MISSIONS.md)            | Los NPC de las estaciones, la reputación y los cinco niveles                    |
| [Identidad visual](systems/VISUAL.md)                | La paleta naranja, la tipografía, los medidores y la portada                    |
| [Interfaz del juego](systems/INTERFACE.md)           | El Neocom lateral, la barra superior y el área central                          |
| [Administración](systems/ADMIN.md)                   | Roles, permisos, el registro de eventos y el cuartel general                    |

## Progresión

Un piloto **es lo que sabe hacer**: no hay niveles de personaje ni clases, sólo
habilidades del 0 al 5 que se entrenan _haciendo_. Cada acción resuelta reparte
experiencia entre la habilidad principal que la gobierna y las secundarias que
intervienen, y esa experiencia es lo único que separa a un recién llegado de un
veterano. Las habilidades complejas exigen otras entrenadas antes, así que el
catálogo es un árbol y elegir una rama significa algo. El detalle está en
[habilidades](systems/SKILLS.md).

Al crear el piloto se eligen **dos cosas independientes**, y conviene no
confundirlas:

- La **[profesión](systems/PROFESSIONS.md)** es el oficio previo: define con qué
  habilidades ya entrenadas arranca. Todas reparten el mismo presupuesto de
  experiencia, así que ninguna empieza mejor, sino distinto.
- La **[facción](systems/FACTIONS.md)** es el origen: de dónde viene y a quién
  responde. Por ahora sólo determina en qué estación aparece.

Separarlas evita el vicio de las facciones temáticas, donde elegir "los mineros"
es a la vez elegir una historia y una planilla de bonos.

## La cadena

**Ninguna mecánica entra sola.** Toda característica nueva arrastra una cadena, y
pensarla entera antes de empezar es lo que separa un sistema de un atributo
suelto.

El salto entre sistemas sirve de ejemplo porque tiene todos los eslabones:

| Eslabón        | En el salto                                  |
| -------------- | -------------------------------------------- |
| **El verbo**   | Cruzar una puerta                            |
| **El insumo**  | Helio-3, que se consume                      |
| **La fuente**  | Hielo lunar, que hay que minar y refinar     |
| **El aparato** | Motor de salto y tanque, que se montan       |
| **La llave**   | Astrogación y Eficiencia de combustible      |
| **La fábrica** | Los materiales con que se construye el motor |
| **El lugar**   | La estación que refina, vende y repara       |

Un eslabón que falta no rompe nada de entrada: deja un **huérfano**, y los
huérfanos son exactamente el diagnóstico con el que arrancó este proyecto. Un
insumo sin fuente es una cifra que se compra y nada más. Un aparato sin llave es
un módulo que no pide nada, como los cuarenta y siete del catálogo original. Una
llave sin aparato es una habilidad que no mueve ningún número, como trece de las
veintitrés. Un verbo sin insumo es un atributo que sólo se dibuja, como diecinueve
de los veinticinco de la nave.

Dicho al revés, que es como se usa: **antes de agregar algo, escribir su cadena y
mirar dónde están los huecos.**

### No hace falta cerrarla de una vez

La regla no es «no entra hasta estar completa», que sería no entregar nunca. Es
**saber dónde están los huecos y que cada uno tenga fecha**, no olvido. El
combustible puede empezar comprándose en la estación y recién después salir del
hielo; lo que no puede es que nadie sepa que esa fuente falta.

Y hay una consecuencia de orden: **el insumo entra con el verbo que lo gasta, no
antes**. Agregar helio-3 sin la puerta que lo consume es fabricar un huérfano a
propósito.

### La cadena se muestra, o no existe

Escribir la cadena es la mitad del trabajo. La otra mitad es que **el jugador la
vea**, porque una cadena que sólo conoce el código se siente exactamente igual que
el azar: aprietas un botón, a veces se puede y a veces no, y nadie sabe por qué.

Tres reglas, y ninguna es opcional:

1. **Toda acción que pida habilidades dice cuáles, ahí mismo.** No en una ficha
   aparte ni en una ayuda: junto al botón, con el nivel que hace falta y el que se
   tiene. Si falta, el motivo se lee sin buscarlo; si sobra, también, porque saber
   que estás sobrado es parte de decidir qué mejorar después.
2. **Toda acción que exista gracias a un módulo lo nombra.** Minar aparece porque
   hay un láser montado, prospectar porque hay un escáner, saltar porque hay un
   motor de salto y un tanque. El verbo tiene que llevar encima **de qué aparato
   salió**, o el jugador no puede razonar al revés —«quiero hacer esto, ¿qué me
   falta?»— que es justamente como se compra el próximo módulo.
3. **Y al revés: lo que no se puede hacer dice por qué no se puede.** Un verbo que
   directamente no aparece enseña menos que uno apagado con su motivo al lado. La
   ficha de un módulo que no está montado también es información: es la lista de
   lo que se abre si lo comprás.

**Y la llave no es lo mismo que la palanca.** Son dos relaciones distintas, y
mostrarlas iguales fue lo que confundió desde el principio:

|                | Qué es                                  | Qué pasa sin ella             |
| -------------- | --------------------------------------- | ----------------------------- |
| **La llave**   | Habilita. El escáner, el motor de salto | El verbo **no existe**        |
| **La palanca** | Mejora. Escaneo, Astrogación, Minería   | El verbo existe y rinde menos |

Una es un requisito y la otra una recompensa. Un aviso que las mezcla deja al
jugador sin saber si le falta comprar algo o le falta entrenar, que son dos días
de juego distintos.

El caso testigo es el salto: el panel de la puerta dice la distancia, el alcance
de la nave, cuánto tarda y cuánto quema **antes** de apretar, y cuando no se
puede, el motivo sale de la misma función pura que usa el servidor para
rechazarlo. El botón apagado y el rechazo del servidor dicen lo mismo, y el
jugador nunca aprieta algo que va a rebotar.

Cómo se dibuja —dónde va, qué lleva y qué hacer al agregar un verbo nuevo— está
en [la procedencia de una acción](systems/INTERFACE.md#la-procedencia-de-una-acción).

Dicho corto: **la cadena es la explicación de por qué el juego te deja o no te
deja, y esa explicación es interfaz, no documentación.**

### Cada eslabón reusa lo que ya existe

La cadena se alarga rápido, así que cada eslabón tiene que apoyarse en maquinaria
que ya esté: el combustible es un ítem como cualquier otro, se compra por el
mercado que ya existe, se refina en la refinería que ya existe y se gasta con la
misma constante con la que la ficha de la nave calcula la autonomía. Un eslabón
que inventa su propio sistema paralelo multiplica el costo de todos los que
vengan después.

## Identidad visual

**La interfaz imita la de Elite Dangerous lo más fielmente posible**: naranja
sobre casi negro, paneles translúcidos con borde fino, esquinas rectas,
mayúsculas espaciadas y un halo suave en el texto encendido. Es el objetivo
declarado, no una inspiración suelta, y ante cualquier duda de diseño la
respuesta es cómo lo resuelve ese juego.

No es una cita decorativa: ese HUD resuelve el problema que tiene Vaxav, que es
mostrar mucha información numérica sin cansar.

El detalle —paleta, tipografía, medidores, la portada— está en
[identidad visual](systems/VISUAL.md).

El juego es de estilo viejo; **la página no**. Lo retro es la mecánica —texto,
números, esperar—, no la ejecución: espaciado generoso, jerarquía clara, grilla
responsiva, foco visible y contraste accesible.

## La voz

Vaxav es un juego **textual**: casi todo lo que el jugador recibe es una frase.
La identidad visual está resuelta y escrita; la verbal no lo estaba, y eso deja
que cada pantalla se escriba con el tono del día en que se hizo.

**El castellano es rioplatense, y se trata de vos.** «Necesitás una nave»,
«Ya estás ahí», «Escribí el motivo del ajuste». No es una licencia: es de dónde salió el
juego, y mezclarlo con tuteo o con un neutro de doblaje suena a traducción.

**El tono es seco.** El juego informa, no conversa ni hace chistes. No tiene
personalidad propia ni le habla al jugador como si fueran amigos: es el panel de
una nave, y un panel no bromea. Dos frases, misma información:

| ✗                                                 | ✓                                                                           |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| «Escaneala antes de picarla: no sabés qué tiene.» | «Hay que escanearla antes de extraer: sin lectura no se sabe qué contiene.» |

Lo que sobra en la primera no es el voseo, es el codazo: la jerga de oficio
(«picarla») y el tono de charla («no sabés qué tiene») fingen una complicidad que
el juego no tiene con nadie.

### Cada clase de texto tiene su registro

| Clase                 | Quién habla          | Cómo suena                                                                         | Ejemplo                                                                   |
| --------------------- | -------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Aviso del sistema** | La nave, el servidor | Seco, presente, sin adorno. Dice qué pasa o qué falta, nunca por qué te lo merecés | «Acá no hay nada que extraer.»                                            |
| **Rótulo**            | La interfaz          | Un sustantivo. Ni una frase, ni una pregunta, ni un verbo conjugado                | «Combustible», «Alcance», «Duración»                                      |
| **Ambientación**      | El mundo             | Acá sí hay prosa: describe cosas, no le habla al jugador                           | «Roca gris con vetas de hierro. El pan de todos los días en los Anillos.» |
| **Informe**           | La bitácora          | Casi no es prosa: un sustantivo y filas de dato y cifra, con su unidad             | «Salto · Llegada: Puerta Sur · Combustible: −7 u»                         |

La confusión más fácil es meter ambientación en un aviso. La descripción de un
mineral puede tener imagen y ritmo porque describe **una cosa**; un aviso que se
pone literario está adornando **un problema que el jugador tiene que resolver
ahora**, y estorba.

### El texto generado es técnico, y se calla

Vaxav **arma frases solo** —la descripción de un cuerpo, la de un sistema— y ése
es el texto que más fácil se va de registro, porque el que lo escribe no está
mirando la pantalla donde va a caer. Cuatro reglas, y las cuatro son la misma:

1. **Describe, no evalúa.** «Campo denso de asteroides» es lo que el lugar es;
   «de mineral común» es una opinión sobre lo que vale, y además envejece: el día
   que se le toque un precio, la frase queda mintiendo. Lo que rinde algo se
   averigua yendo, no leyendo.
2. **No repite lo que ya está en un rótulo.** Si al lado dice «520 ud», la prosa
   no dice la distancia. Si una frase no agrega nada que el jugador no pueda ver,
   **no se escribe**.
3. **No esconde advertencias.** Nada de «donde las patrullas llegan tarde» metido
   en un párrafo de ambientación: a la tercera pantalla el párrafo se saltea
   entero. Lo que hay que avisar va **en su propio renglón**, con su color y con
   todas las letras.
4. **Callar es una respuesta.** Una estación no tiene descripción: su pantalla ya
   muestra servicios, dueño y agentes. Un sistema tampoco. Que la mayoría no diga
   nada es lo que hace que la que habla signifique algo.

La ambientación con imagen y ritmo —la de un mineral, la de una corporación, la
de un agente— **se sigue escribiendo a mano**, porque describe algo que tiene
carácter y no atributos. Lo que se genera no compite con eso: informa.

### Un rótulo nombra, no explica

Es la regla que más se viola, porque una frase descriptiva siempre parece más
amable. No lo es: en una grilla de veinte rótulos, el que explica obliga a leerlo
entero para llegar al dato que está al lado. El rótulo **nombra**; lo que hay que
explicar lo dice el contenido de la fila, o no hace falta decirlo.

| ✗                           | ✓             |
| --------------------------- | ------------- |
| «Estaciones que opera»      | «Estaciones»  |
| «Gente repartiendo trabajo» | «Agentes»     |
| «Quién es»                  | «Información» |
| «Dónde se la encuentra»     | «Ubicaciones» |
| «Cómo llegaste»             | «Historial»   |
| «Extraés»                   | «Extracción»  |
| «Te atienden hasta»         | «Agentes»     |

Vale igual para los **títulos de panel y de pestaña**, que son rótulos grandes.

Tres pruebas, en orden:

1. **¿Es una pregunta?** Entonces no es un rótulo. «Quién es», «dónde está» y
   «cómo llegaste» conversan, y la interfaz informa.
2. **¿Tiene un verbo conjugado?** Pasalo a sustantivo: «Repone» → «Reposición»,
   «Dura» → «Duración», «Controla» → «Control».
3. **¿Le habla al jugador?** «Te atienden hasta», «Para volarla» y «Firmás como»
   meten una segunda persona que el resto de la grilla no tiene.

**Neutro antes que pintoresco.** «Gente repartiendo trabajo» tiene color, y el
color va en la ambientación —en la descripción de la corporación, que para eso
está—, no en el rótulo de la lista que hay que recorrer con el ojo. Un rótulo con
personalidad se lee la primera vez y estorba las otras cincuenta.

### Reglas que se aplican al escribir una frase

- **Corto.** Un aviso es una oración. Si necesita dos, la segunda dice qué hacer.
- **Decir qué falta, no qué salió mal.** «Necesitás una nave para saltar» sirve;
  «Error: nave no encontrada» no le dice a nadie qué hacer después.
- **Sin jerga de oficio ni guiños.** Si una palabra sólo la entiende quien ya
  juega, no va en un aviso. En una descripción de ambientación, sí.
- **Y sin el vocabulario del diseño.** «Verbo», «insumo», «aparato», «llave»,
  «palanca» son las palabras con que este documento piensa, y no las de nadie
  más: en pantalla van «módulo» y «habilidad». Ya se filtraron una vez.
- **Sin signos de exclamación, sin emoji, sin mayúsculas para gritar.** El énfasis
  lo pone la tipografía, que para eso está diseñada.
- **Sin disculpas ni cortesías de formulario.** Nada de «lo sentimos», «por
  favor», «¡ups!». El juego no se disculpa: informa.
- **El mismo hecho se dice con las mismas palabras en todos lados.** Si el botón
  apagado y el rechazo del servidor explican lo mismo, explican lo mismo con la
  misma frase, que es la otra cara de
  [«la cadena se muestra»](#la-cadena-se-muestra-o-no-existe).
- **Nada de jerga de programación en pantalla.** Ni códigos, ni nombres de
  tablas, ni «null». Eso vive en el registro, no en la cara del jugador.

**Y nada de anunciar el futuro.** Un texto que dice «próximamente» o «en
desarrollo» es el mismo cartel de fase que ya sacamos de la interfaz, escrito con
palabras en vez de con un panel.

## Glosario inicial

- **Piloto** — la cuenta del jugador. Tiene nombre, facción, créditos,
  reputación y habilidades.
- **Nave** — el vehículo del piloto: bodega, combustible, integridad, slots.
- **Bodega** — capacidad limitada de carga; obliga a elegir qué llevar.
- **Slot** — hueco de la nave donde se monta un módulo. Alto, medio o bajo.
- **Módulo** — equipamiento montado en un slot; aporta bonos.
- **Habilidad** — destreza del piloto, de nivel 0 a 5, con un multiplicador de
  dificultad de x1 a x5.
- **Acción** — una orden con instante de inicio y duración (extraer, viajar,
  reparar, comerciar).
- **Informe** — el resultado de una acción resuelta: qué pasó y cuánta XP dio.
- **Bitácora** — el registro de todos los informes; lo primero que se lee al
  volver.
- **Profesión** — el oficio previo del piloto; define sus habilidades iniciales.
- **Facción** — de dónde viene el piloto; determina su estación de partida.
- **Sistema** — una estrella y los cuerpos que la orbitan. La unidad del mapa.
- **Cuerpo** — planeta, luna, cinturón, anillo o estación dentro de un sistema.
- **Créditos** — moneda del juego.

## Qué tomamos de EVE, y qué no

Vaxav se parece a **EVE Online** a propósito, y conviene decir por qué y hasta
dónde, porque es la pregunta que vuelve cada vez que se agrega algo.

El público natural del juego es **el que jugó EVE y no puede sostenerlo**. Para
ése, que las cosas estén donde espera no es una copia: es que no tiene que
aprender de nuevo lo que ya sabe. De ahí sale la regla:

> **La estructura es la que lo hace reconocible. Las palabras son las que lo hacen
> nuestro.**

Un piloto que ve tres bandejas y una terna de ranuras se orienta en cinco
segundos, venga de donde venga. Los rótulos, en cambio, son nuestros: se llaman
anclaje, consola y bastidor, no alto, medio y bajo.

### Lo que sí

| De EVE                                | Cómo entra acá                                         |
| ------------------------------------- | ------------------------------------------------------ |
| Bandejas de ranuras y la terna        | Anclajes · consolas · bastidor, más refuerzos          |
| Presupuestos apretados a propósito    | Potencia, cómputo y calibración                        |
| Escalones I/II y variantes con oficio | La nomenclatura de los módulos                         |
| Radio de firma contra sensores        | Una sola cuenta para escanear, analizar y encontrar    |
| La seguridad del sistema gradúa todo  | Qué mineral hay, y cuánto se arriesga en ir a buscarlo |
| Las naves se pierden                  | Es lo que impide que la economía se sature             |
| Clases de nave como requisito duro    | No se sabe «volar naves»: se sabe volar barcazas       |
| Entrenar lleva tiempo real            | Pero se entrena **haciendo**, no con un reloj          |

### Lo que no

Es la mitad que define el producto: **lo que hace de EVE un segundo trabajo no
entra.**

| De EVE                                 | Por qué no                                                        |
| -------------------------------------- | ----------------------------------------------------------------- |
| Entrenar con el reloj                  | Vaxav entrena **haciendo**. Es la decisión de identidad del juego |
| Atributos neurales e implantes         | Optimización invisible que castiga al que no lee una wiki         |
| Invención con probabilidad             | Fabricar y que salga mal no es una decisión: es un impuesto       |
| Planos como objeto comerciable         | Una economía entera para sostener; más adelante, si hace falta    |
| Cientos de variantes por módulo        | El catálogo tiene que caber en una cabeza                         |
| Planes de habilidades de meses         | Ninguna nave tiene que esperar medio año para volarse             |
| Cadenas de puertas de cuarenta minutos | El viaje es una decisión, no un peaje                             |
| Tener que estar presente               | Para eso está el comportamiento de la nave                        |

### La pregunta

Cada vez que haya que decidir si algo de EVE entra:

> **¿Esto es profundidad, o es peaje de tiempo?**

Profundidad es una decisión que se puede tomar mal. Peaje es tiempo que hay que
pagar para llegar a la decisión. Lo primero entra siempre; lo segundo, nunca.

## Hoja de ruta

Está en su propio documento: [ROADMAP.md](ROADMAP.md). El resumen es que el
camino al MVP pasa por los cimientos que no se ven (roles, libro mayor,
resolución idempotente), el universo en la base, las naves, el motor de acciones,
la minería y, por último, la gente: chat y mensajes.

Lo que define al MVP y lo que queda deliberadamente afuera está en
[MVP.md](MVP.md).

## Decisiones técnicas

- **SvelteKit + TypeScript**: pantalla y servidor en el mismo proyecto y en el
  mismo lenguaje. Encaja con un juego sin gráficos.
- **SQLite** mientras el proyecto sea chico. El acceso va detrás de Drizzle y no
  usa nada propio de SQLite, así que migrar a PostgreSQL más adelante es cambiar
  `DATABASE_URL` y el conector.
- **Reglas separadas de la interfaz**: `src/lib/game/` no importa SvelteKit ni la
  base de datos, para poder probar las reglas sin levantar la app.
- **El servidor manda**: los temporizadores que ve el jugador son decorativos; lo
  que vale es el instante guardado en la base.

## Por decidir

Lo transversal. Cada documento de sistema tiene además su propia lista.

- Si hay muerte/pérdida de nave permanente o sólo pérdida de carga.
- Cuánto PvP directo y cuánto conflicto indirecto (economía, bloqueos).
- Si el mapa es fijo o generado, y de qué tamaño.
- Ritmo real de las acciones (minutos, horas) y cuántas se pueden encolar.
