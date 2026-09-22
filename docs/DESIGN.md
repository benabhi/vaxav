# Vaxav — diseño

> Documento vivo. Se va corrigiendo a medida que el juego se define; lo que está
> acá es intención de diseño, no una promesa.

## La premisa

> **EVE Online asíncrono, por acciones, en el navegador.**

Ésa es la frase que decide todo lo demás, y conviene leerla por partes:

- **EVE Online.** No «inspirado en»: el objetivo es **replicar sus sistemas** —el
  equipamiento por ranuras con presupuestos apretados, las clases de nave como
  requisito duro, la economía enteramente de los jugadores, las naves que se
  pierden, la seguridad del sistema graduando el peligro, los materiales en
  cadena— y adaptarlos. Cuando haya una duda de diseño, la primera pregunta es
  **cómo lo resuelve EVE**.
- **Asíncrono.** Nadie tiene que estar conectado al mismo tiempo que otro, ni
  estar presente mientras su nave trabaja. Lo que en EVE exige atención en vivo,
  acá se resuelve de una cuenta al dar la orden.
- **Por acciones.** La unidad de juego es **encargar una acción y esperar**: se
  elige, tarda, y al volver hay un informe. No hay tiempo real, no hay clicks que
  aceleren nada.
- **En el navegador.** Textual, sin instalación, y **utilizable en un teléfono**.

De eso sale un beneficio que vale nombrar: **un jugador de EVE entiende Vaxav en
cinco minutos**. Las bandejas de ranuras se llaman altos, medios y bajos; los
presupuestos, grilla, CPU y calibración. No es falta de personalidad: es no
hacerlo tropezar con sinónimos.

### Qué es nuestro

Dos cosas, y las dos son consecuencia de lo asíncrono:

1. **Los pozos de experiencia por familia.** En EVE se entrena con un reloj que
   corre solo; acá **se entrena haciendo**. Cada acción deposita experiencia en la
   familia que le corresponde, y el jugador después elige en qué habilidad de esa
   familia gastarla. Es la pieza que más se aleja de EVE y la que no se toca: es
   lo que hace que jugar y progresar sean la misma cosa en vez de dos relojes
   paralelos.
2. **Tres facciones, no cuatro.** Es una decisión de escala, no de gusto: con
   tres, cada una puede tener carácter propio y la política del sector se lee de
   un vistazo.

## Visión

Vaxav es un juego web multijugador de navegador, **textual** y de **ritmo lento**.
El jugador es un piloto independiente con una nave en un sector espacial que
ninguna facción termina de controlar. No hay campaña ni final: es un sandbox
donde cada uno decide a qué dedicarse (extraer, transportar, comerciar, explorar,
pelear) y el mundo lo comparten todos.

La piel es la de **Elite Dangerous**: el HUD naranja sobre casi negro, los paneles
translúcidos y las mayúsculas espaciadas. Es lo único que no viene de EVE, y es a
propósito — los sistemas son de uno y la cara es del otro.

La unidad de decisión es **una nave con capacidad limitada**, no una base que sólo
crece: por eso todo lo que se lleva obliga a dejar otra cosa.

## Pilares

1. **El tiempo es el recurso.** Toda acción tarda. No se acelera con clicks: se
   planifica. Una sesión típica es entrar, ver qué se resolvió, dar la próxima
   orden y salir.
2. **Texto, no gráficos.** La interfaz imita una terminal de a bordo. La riqueza
   está en los números y en la descripción, no en la animación.
3. **Todo cuesta algo.** Tiempo, espacio de bodega, masa encima, desgaste. Las
   decisiones duelen porque cierran otras puertas.
4. **El mundo es compartido.** Los precios, los recursos y los peligros dependen
   de lo que hagan los demás pilotos, no de un guion.
5. **Nunca hace falta estar.** Lo que en otro juego pide reflejos, acá se decide
   antes de salir. Es lo que hace que un idle pueda tener combate y pérdida de
   naves sin castigar al que cierra la pestaña.
6. **Simple de entrar, hondo de jugar.** Pocas mecánicas, pero que se combinen.

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
| [Estado y huecos](ROADMAP.md)                        | Qué existe, qué está colgando y con qué se engancha cada cosa                   |
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

Extraer mineral sirve de ejemplo porque es **la cadena que el juego recorre todos
los días** y se le ven los siete eslabones:

| Eslabón        | En la extracción                                        |
| -------------- | ------------------------------------------------------- |
| **El verbo**   | Extraer de una roca leída                               |
| **El insumo**  | Ninguno: el láser común no gasta nada                   |
| **La fuente**  | Los cinturones, con rocas que se agotan y se reponen    |
| **El aparato** | El láser de extracción, que se monta y ocupa una ranura |
| **La llave**   | Minería, Prospección y Gestión de energía               |
| **La fábrica** | La lente focal y el silicio con que se construye        |
| **El lugar**   | El cinturón donde se hace y la estación que paga        |

**El insumo en blanco no es un eslabón que falta**: un láser común no quema nada,
y ésa es la decisión. El día que se quiera un consumible ahí, la respuesta no es
cobrarle munición al láser que ya existe sino otro verbo con otro aparato —el
láser de tira y sus cristales—, que es otra cadena y está escrita entera en
[materiales](systems/MATERIALS.md#consumibles). Cuál de los siete eslabones anda
hoy y cuál está escrito nada más se lleva en
[estado y huecos](ROADMAP.md#minar-mineral), que es donde viven las marcas.

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
**saber dónde están los huecos y que cada uno tenga fecha**, no olvido. Los ocho
minerales pueden entrar cuatro por vez y el láser puede comprarse hecho antes de
que exista con qué fabricarlo; lo que no puede es que nadie sepa que esa fábrica
falta.

Y hay una consecuencia de orden: **el insumo entra con el verbo que lo gasta, no
antes**. El caso testigo es el helio-3: está en el catálogo de ítems, tiene
volumen y precio, y **el mercado no lo muestra**, porque hoy no hay ningún verbo
que lo queme. Ponerlo a la venta sería cobrarle a alguien por algo que no puede
usar, que es fabricar un huérfano a propósito.

### Un eslabón se puede ir, y hay que decir adónde

El salto entre sistemas fue el ejemplo de esta sección durante todo el proyecto:
cruzar una puerta quemaba helio-3 por masa y distancia, pedía que el alcance del
motor llegara, y tenía los siete eslabones puestos. **Ya no.** Cruzar una puerta
es gratis, no pide nada y la misma puerta tarda lo mismo para cualquier nave; el
porqué —que es el argumento entero y no una nota— está en
[acciones](systems/ACTIONS.md#cruzar-es-gratis).

Lo que importa acá es qué le pasó a la cadena, porque es la parte que se repite:
el insumo, el aparato y la llave **no se borraron, se mudaron**. Van a ser del
motor de salto de las capitales, el que cruza entre sistemas no vecinos y sin
puerta. Hasta que ese verbo exista, **el combustible no tiene consumidor** y
quedan cinco piezas sin verbo: el tanque, el depósito auxiliar, el calibrador de
salto, Astrogación y Eficiencia de combustible.

De ahí salen dos reglas que valen para cualquier mecánica que se dé vuelta:

- **Un eslabón que se va dice a qué verbo se fue y qué lo despierta.** «Dormido»
  es una decisión con fecha; «sin uso» es un olvido con otro nombre.
- **Un número que ya no consume nadie se deja de mostrar.** El alcance y la
  autonomía salieron de la ficha de la nave, y el tanque y los saltos que
  quedaban, de la credencial: el mismo día que dejaron de decidir algo, porque
  una cifra en pantalla es una promesa de que sirve para algo. Vuelven con el
  verbo, y **sólo en las naves que lo tengan**.

### La cadena se muestra, o no existe

Escribir la cadena es la mitad del trabajo. La otra mitad es que **el jugador la
vea**, porque una cadena que sólo conoce el código se siente exactamente igual que
el azar: aprietas un botón, a veces se puede y a veces no, y nadie sabe por qué.

Tres reglas, y ninguna es opcional:

1. **Toda acción que pida habilidades dice cuáles, ahí mismo.** No en una ficha
   aparte ni en una ayuda: junto al botón, con el nivel que hace falta y el que se
   tiene. Si falta, el motivo se lee sin buscarlo; si sobra, también, porque saber
   que estás sobrado es parte de decidir qué mejorar después.
2. **Toda acción que exista gracias a una pieza la nombra, y dice de dónde
   sale.** Minar aparece porque hay un láser montado y prospectar porque hay un
   escáner; viajar, en cambio, corre con los propulsores que **trae el casco**, y
   un auxiliar montado suma encima en vez de reemplazarlos. Son tres cosas
   distintas —del casco, de un módulo, o falta— y el aviso las distingue: decir
   «falta» de algo que ninguna nave puede montar manda a comprar lo que no
   existe. El verbo tiene que llevar encima **de qué aparato salió**, o el
   jugador no puede razonar al revés —«quiero hacer esto, ¿qué me falta?»— que es
   justamente como se compra el próximo módulo.
3. **Y al revés: lo que no se puede hacer dice por qué no se puede.** Un verbo que
   directamente no aparece enseña menos que uno apagado con su motivo al lado. La
   ficha de un módulo que no está montado también es información: es la lista de
   lo que se abre si lo comprás.

**Y la llave no es lo mismo que la palanca.** Son dos relaciones distintas, y
mostrarlas iguales fue lo que confundió desde el principio:

|                | Qué es                                       | Qué pasa sin ella             |
| -------------- | -------------------------------------------- | ----------------------------- |
| **La llave**   | Habilita. El escáner, el láser de extracción | El verbo **no existe**        |
| **La palanca** | Mejora. Escaneo, Navegación, Minería         | El verbo existe y rinde menos |

Una es un requisito y la otra una recompensa. Un aviso que las mezcla deja al
jugador sin saber si le falta comprar algo o le falta entrenar, que son dos días
de juego distintos.

El caso testigo de lo primero es extraer: el aviso del botón dice con qué láser
se hace, qué habilidades mueven el rendimiento, cuánto rinde hoy y cuánto daría
el nivel siguiente, **antes** de apretar.

El caso testigo de lo segundo es el salto: el panel de la puerta dice adónde
lleva y cuánto tarda, y cuando no se puede, el motivo sale de la misma función
pura que usa el servidor para rechazarlo. El botón apagado y el rechazo del
servidor dicen lo mismo, y el jugador nunca aprieta algo que va a rebotar. Es
también el testigo de la mitad contraria: **un verbo que no pide nada no inventa
requisitos para tener algo que mostrar**. Cruzar no nombra ningún módulo ni
ninguna habilidad, porque ninguna de las dos cosas cambia el cruce, y un aviso
que las nombrara mandaría a gastar en lo que no sirve.

Cómo se dibuja —dónde va, qué lleva y qué hacer al agregar un verbo nuevo— está
en [la procedencia de una acción](systems/INTERFACE.md#la-procedencia-de-una-acción).

Dicho corto: **la cadena es la explicación de por qué el juego te deja o no te
deja, y esa explicación es interfaz, no documentación.**

### Cada eslabón reusa lo que ya existe

La cadena se alarga rápido, así que cada eslabón tiene que apoyarse en maquinaria
que ya esté: el combustible **es un ítem como cualquier otro**, y por eso el día
que un verbo lo queme se va a comprar por el mercado que ya existe, se va a
llevar en la bodega que ya existe y se va a cargar con la misma cuenta con la que
la ficha de la nave calculaba la autonomía. La alternativa —un botón de repostar
con su propia economía al costado— habría que volver a atarla el día que el
helio-3 salga del hielo y lo venda un jugador. Un eslabón que inventa su propio
sistema paralelo multiplica el costo de todos los que vengan después.

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
| **Rótulo**            | La interfaz          | Un sustantivo. Ni una frase, ni una pregunta, ni un verbo conjugado                | «Bodega», «Distancia», «Duración»                                         |
| **Ambientación**      | El mundo             | Acá sí hay prosa: describe cosas, no le habla al jugador                           | «Roca gris con vetas de hierro. El pan de todos los días en los Anillos.» |
| **Informe**           | La bitácora          | Casi no es prosa: un sustantivo y filas de dato y cifra, con su unidad             | «Salto · Llegada: Puerta Sur · Distancia: 1,4 al»                         |

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

La premisa —**EVE asíncrono, por acciones, en el navegador**— dice que los
sistemas se replican. Esta sección dice **hasta dónde**, porque es la pregunta que
vuelve cada vez que se agrega algo.

El público natural del juego es **el que jugó EVE y no puede sostenerlo**. Para
ése, que las cosas estén donde espera no es una copia: es que no tiene que
aprender de nuevo lo que ya sabe. De ahí sale la regla del vocabulario:

> **Donde EVE ya tiene un nombre para algo, se usa ese nombre, en castellano.**

Vale para los presupuestos —grilla, CPU, capacitor, calibración—, para las
bandejas —altos, medios, bajos—, y también para **los módulos y las habilidades**.
Inventar un sinónimo no hace al juego más nuestro: lo hace más lento de aprender,
y le cobra el peaje justamente al que más rápido lo entendería.

Se traduce, no se calca: _Small Shield Extender II_ es «Extensor de escudo
chico II». Y donde no haya equivalente porque la mecánica es nuestra —los pozos,
las tres facciones— el nombre se inventa con la voz del juego.

Dos excepciones, y son las que le dan nombre propio al juego:

- **Los cascos.** Pioner, Mula, Percal, Vencejo, Alabarda: los nombres de nave se
  inventan acá y no se traducen de ningún lado. Un módulo es una pieza y su nombre
  es una etiqueta; **una nave es un personaje**, es lo que el jugador dice cuando
  cuenta qué le pasó, y es lo único del catálogo que se recuerda. Cómo se nombra
  una está en [naves](systems/SHIPS.md#cómo-se-nombra-una-nave).
- **La moneda.** Son **créditos**, abreviados **CR**. No ISK: es la palabra que
  más veces se lee en una sesión, así que es de las pocas que conviene que sean
  nuestras.

**Lo nuestro no es el vocabulario: es qué decidimos que entre y qué no**, y eso es
lo que sigue.

### Lo que sí

| De EVE                                | Cómo entra acá                                         |
| ------------------------------------- | ------------------------------------------------------ |
| Bandejas de ranuras y la terna        | Altos · medios · bajos, más refuerzos                  |
| Presupuestos apretados a propósito    | Grilla, CPU, capacitor y calibración                   |
| Escalones I/II y variantes con oficio | La nomenclatura de los módulos                         |
| Radio de firma contra sensores        | Una sola cuenta para escanear, analizar y encontrar    |
| La seguridad del sistema gradúa todo  | Qué mineral hay, y cuánto se arriesga en ir a buscarlo |
| Las naves se pierden                  | Es lo que impide que la economía se sature             |
| Clases de nave como requisito duro    | No se sabe «volar naves»: se sabe volar barcazas       |
| Entrenar lleva tiempo real            | Pero se entrena **haciendo**, no con un reloj          |
| Refuerzos con su propio presupuesto   | Se sueldan al casco y sacarlos los destruye            |
| Materiales en cadena                  | Mineral, refinado, componente, producto                |
| Las corporaciones como el eje social  | Con roles y permisos, no un chat con nombre            |

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
| Las cuatro facciones                   | Acá son **tres**: con menos, cada una puede tener carácter        |
| Standing de −10 a +10                  | Sin decidir. Ver «Por decidir»                                    |

### La pregunta

Cada vez que haya que decidir si algo de EVE entra:

> **¿Esto es profundidad, o es peaje de tiempo?**

Profundidad es una decisión que se puede tomar mal. Peaje es tiempo que hay que
pagar para llegar a la decisión. Lo primero entra siempre; lo segundo, nunca.

Y una segunda, que es la de lo asíncrono:

> **¿Esto se puede decidir antes de salir?**

Si la respuesta es no —si exige mirar la pantalla mientras pasa— no entra como
está: entra convertido en una decisión que se toma **al dar la orden**. Así entró
el combate, que es una tirada sembrada al salir y un informe al volver; y así va a
entrar todo lo demás que en EVE se juega en vivo.

## Dónde está el juego

En su propio documento: [ROADMAP.md](ROADMAP.md). **No es un plan y no promete un
orden**, porque acá se construye sobre la marcha: es el mapa de las cadenas por
actividad, con cada eslabón marcado según el juego lo haga, lo tenga escrito o no
lo tenga. Se consulta para dos cosas —qué existe hoy y qué se cierra de arrastre
si se agarra tal cosa— y se corrige leyendo el código, no leyéndose a sí mismo.

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
