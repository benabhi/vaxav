# Interfaz del juego

> El marco está **implementado**: Neocom, barra de estado y pestañas.
>
> **El menú muestra sólo lo que funciona.** Una entrada que lleva a un cartel es
> una puerta cerrada con el nombre puesto, y prometer es peor que no ofrecer: el
> Neocom crece cuando hay algo detrás.
>
> Ver también: [identidad visual](VISUAL.md) · [acciones](ACTIONS.md) ·
> [administración](ADMIN.md)

El juego es textual, así que la interfaz **es** el juego. Tiene que ser densa en
información y liviana en adornos: números legibles, jerarquía clara, y siempre a
la vista lo que está pasando ahora. El lenguaje visual —naranja sobre negro,
paneles translúcidos, mayúsculas espaciadas— está en
[identidad visual](VISUAL.md).

## Estructura

```
┌────┬────────────────────────────────────────────────────┐
│    │  Puerto Ánfora · minando 00:41:12 · 12.480 cr      │  barra superior
│ N  ├────────────────────────────────────────────────────┤
│ e  │                                                    │
│ o  │                                                    │
│ c  │              área central                          │
│ o  │              (la sección elegida)                  │
│ m  │                                                    │
│    │                                                    │
└────┴────────────────────────────────────────────────────┘
```

### Dos niveles, y nunca un tercero

La navegación tiene exactamente dos escalones: el **Neocom** lleva a un módulo, y
una **fila de pestañas** lleva a una pantalla dentro de ese módulo. Si un módulo
necesitara más profundidad, se resuelve con el diseño de esa pantalla —una lista
con el detalle al lado, por ejemplo—, no con más navegación.

Todo el árbol vive en `src/lib/navigation.ts`, que es de donde salen el Neocom, las
barras de pestañas y el registro de rutas: una pantalla nueva se agrega en un solo
lugar y aparece en los tres.

| Módulo      | Pestañas                                              |
| ----------- | ----------------------------------------------------- |
| Piloto      | Información · Habilidades · Reputación · Bitácora     |
| Nave        | Ficha · Bodega                                        |
| Navegación  | Ubicación · Sistema · Galaxia                         |
| Corporación | Ficha · Reputación · Ubicaciones · Agentes · Miembros |
| Mensajes    | Recibidos · Enviados · Archivados                     |
| Mercado     | Mercado · Órdenes de venta · Órdenes de compra        |
| Propiedades | Propiedades                                           |
| Billetera   | Billetera                                             |
| Opciones    | Cuenta                                                |

Un módulo de una sola pestaña no dibuja barra. La lista crece a medida que hay
pantallas.

Las tres de Navegación son **tres acercamientos de lo mismo**, del más cerca al
más lejos: el cuerpo donde estás parado, el sistema que lo contiene y la galaxia
que contiene al sistema. Ése es el orden, y por eso Galaxia va última: nadie abre
el mapa de la galaxia para saber si puede atracar.

### Qué va al Neocom y qué es una sala

La pregunta se contesta con una sola distinción: **¿depende de dónde está el
piloto?**

- **Lo que se mira desde cualquier parte va al Neocom.** El
  [mercado](MARKET.md) es regional: parado en un cinturón con la bodega llena,
  saber a cuánto se paga el iridio es lo que decide adónde ir. Propiedades es
  igual —qué tenés y dónde, en toda la galaxia—. Esconderlas detrás de una
  estación no agregaría dificultad: agregaría viajes a ciegas.
- **Lo que sólo se puede hacer en un lugar es una sala.** El taller y el
  laboratorio, cuando existan, se entran desde la baldosa del módulo en Ubicación
  y se vuelve ahí: no hay nada que mirar de un taller donde uno no está.

Que el mercado esté en el Neocom **no lo vuelve global**: mirar es libre, operar
exige estar atracado en una estación con módulo de Mercado, y cuando no se puede
la pantalla lo dice en vez de esconder los botones.

Para las salas, el árbol ya tiene puesta la regla que van a necesitar: **una
pantalla colgada de una pestaña enciende esa pestaña**, de modo que el piloto
sigue viéndose en Navegación, en la ubicación donde atracó, con la vuelta a un
clic. Es lo que permite crecer en profundidad sin un tercer nivel de menú.

**Las distancias se miden desde el piloto.** En la lista de cuerpos de un
sistema, cuán lejos está algo _del cuerpo que orbita_ no sirve para decidir nada:
lo que hace falta saber es cuán lejos está **de uno**. Ese número es además el que
explica el tiempo de viaje que va al lado, así que los dos cuentan la misma
historia.

**Tener pestañas es opcional.** La billetera no las tiene porque saldo y
movimientos son una sola pantalla, y forzar una pestaña única sería ruido.

### Neocom

Barra lateral izquierda fija, tomada de Elite Dangerous y EVE, con el bloque
naranja del nombre del juego arriba de todo, **del mismo alto que la barra de
estado**: los dos terminan sobre la misma línea, así el trazo del HUD cruza la
pantalla entera sin un escalón entre la barra lateral y el contenido. El alto es
un token compartido (`TOPBAR_HEIGHT`) para que no se puedan separar. Lleva a los módulos que existen, **en una
lista plana**, y al pie —separada del resto— tiene la salida.

Se probó agruparlos en bloques con rótulo —Piloto, Operaciones, Social— y se
descartó: con pocas entradas, los rótulos ensucian más de lo que ordenan. Se
descartó también agruparlos en entradas, que habría dejado el mercado a dos clics
y detrás de un nombre que no lo nombra. **Una entrada por destino, todo a un
clic.**

**Se pliega a íconos.** Desplegada muestra ícono y nombre; plegada, sólo el ícono,
y de los rótulos de grupo quedan las líneas finas que los separan, que ahí es lo
único que conserva el orden. La preferencia se recuerda entre visitas; en
teléfonos y tabletas angostas queda siempre plegada, y eso lo decide el CSS
porque es cuestión de cuánto ancho hay.

El módulo abierto se llena de naranja con el texto casi negro, y su ícono pasa de
`light` a `fill`. Son dos señales para lo mismo, que es lo que hace que se note
incluso plegada. **Sigue encendido estando en cualquiera de sus pestañas.**

### Pestañas

Fila horizontal arriba del contenido, como el panel de Powerplay del juego. La
activa se llena de naranja con el texto casi negro; las demás son sólo texto.

**Cada pestaña es una ruta de verdad** —`/piloto/habilidades`—, no estado
interno: el enlace se puede compartir, el botón de atrás funciona y recargar deja
al jugador donde estaba. En un juego que se abre y se cierra varias veces por día,
eso importa. La ruta del módulo **es** su primera pestaña, así que no hay dos URLs
para la misma pantalla.

En pantallas angostas la fila **se desliza** con el dedo, con un degradado en el
borde que avisa que hay más, en vez de partirse en dos renglones: la pantalla se
ve igual en el teléfono y en el monitor.

### El recuadro del cuartel

Quien tenga alguna llave de administración ve, abajo del todo y **antes de
"Plegar"**, un recuadro dorado que lleva al [cuartel general](ADMIN.md). Va
aparte y no como una entrada más de la lista por dos razones: lo que se hace ahí
adentro no le pasa a un piloto sino a todos, y **el naranja es el color de
jugar**. La distinción tiene que leerse antes de leer la palabra.

Adentro del cuartel, la barra lateral es **el mismo Neocom con otra lista**: el
mismo plegado, el mismo aspecto y el mismo comportamiento en teléfono, con el
bloque de marca cambiado y la vuelta al juego abajo de todo. Que no parezca otra
aplicación es parte de lo que dice que seguís en Vaxav.

### Cuando no entran

Los dos niveles están preparados para desbordar, porque van a hacerlo: el juego
tiene diez fases por delante y cada una suma pantallas.

- **El Neocom** tiene tres zonas: la marca arriba y las acciones abajo quedan
  fijas, y sólo la lista de módulos se desplaza, con los bordes desvanecidos para
  avisar que sigue. En una pantalla baja —un portátil, un teléfono acostado—
  "plegar" y "salir" siguen a la vista, que son las dos que siempre tienen que
  estar a mano.
- **Las pestañas** se deslizan en horizontal, con los dos bordes desvanecidos y
  sin barra de desplazamiento a la vista.

Y hay un límite de diseño antes que de espacio: **si un módulo necesita más de
cinco o seis pestañas, está mal partido**. Esa pantalla pide una lista con el
detalle al lado, no otra hilera. Lo mismo del lado del Neocom: pasadas las diez o
doce entradas, lo que hay que revisar es el reparto de módulos, no el
desplazamiento.

### Lo que todavía no existe

Casi todas las pestañas están anunciadas y sin construir, así que esa pantalla se
ve más que ninguna. Por eso **se diseña como una pantalla más y no como un cartel
de disculpa**: el panel del HUD, el ícono del módulo grande y fino, qué va a
mostrar esa pestaña y en qué fase llega. Recorrida entera, la navegación funciona
como índice de lo que falta.

### El indicador de acción

**Lo más importante de la pantalla.** Vaxav es un juego de esperar, así que "qué
estoy haciendo y cuánto falta" no puede estar a un clic de distancia: va en la
barra superior, visible desde cualquier sección.

**Dice cuatro cosas, y ninguna sobra**: qué se está haciendo, **de dónde a
dónde**, cuánto va y cuánto falta. Una barra sola es bonita y no informa; un
porcentaje solo no dice qué se está haciendo.

```
⟢ VIAJANDO  Puerto Ánfora ▸ Muelle de los Anillos      49 %   29 s
  ▐█████████████░░░░░░░░░░░░░░
```

- El **ícono** es lo que va a distinguir una orden de otra de un vistazo cuando
  existan minar, refinar y las demás.
- Sin nada en curso, invita a dar una orden en vez de quedar vacío.
- Al vencer, deja de ser una barra y pasa a ser un **aviso encendido** que lleva
  al informe. No se resuelve solo en pantalla: el jugador lo ve y lo abre.

Detalles que definen si se siente bien:

- **El avance se calcula en el servidor**, contra el instante guardado. El reloj
  del navegador es decorativo; si está mal, la barra miente y el servidor no.
- **La cuenta la lleva el navegador.** El servidor manda el instante en que la
  orden arrancó y cuánto dura; el cliente cuenta y al vencer pide que se
  resuelva. No hay ninguna tarea de fondo por jugador, que era lo que peor
  escalaba.
- El reloj vive mientras hay algo que contar y se apaga solo al resolverse la
  orden. Con nada en curso no cuenta nada.
- Tiene que entrar en un teléfono: ahí el origen y el destino se esconden y quedan
  el ícono, la barra, el porcentaje y el tiempo.

### La pantalla mientras se vuela

El indicador de arriba dice cuánto falta. La pestaña **Ubicación**, mientras
tanto, tiene un problema propio: el piloto **no está en ningún lado**.

La respuesta es no fingir que sí. Mientras la nave está en camino:

- **La ficha del lugar se apaga.** Sus cinco lecturas —tipo, sistema, órbita,
  distancia, estado— salen en blanco o, peor, describen el lugar que se dejó
  atrás. Un panel que miente es peor que un panel que no está.
- **En su lugar va el tramo**, que es lo único verdadero ahí: de dónde a dónde,
  qué se quema, cuánto tarda.
- **Cada punta lleva su sistema**, con bandera, gobierno y nivel de ley. En un
  salto los dos sistemas son distintos y ésa es toda la gracia del salto; y como
  la ficha del lugar está apagada, **no hay ninguna otra pantalla** donde mirar a
  qué se está entrando justo cuando uno quiere saberlo.
- La distancia y el combustible **sólo aparecen si hubo un salto detrás**. Un
  viaje dentro del sistema no quema nada, y una fila en blanco miente más que una
  fila que no está.

Es la misma idea que el indicador, un nivel más abajo: el título de la pantalla
deja de ser dónde estás y pasa a ser **adónde vas**.

### Mensajes

**El módulo volvió al Neocom después de haber estado afuera.** Estuvo declarado
como pantalla cartel hasta que se sacaron las trece que anunciaban una fase
futura, con un motivo que sigue vigente: una entrada de menú que lleva a una
puerta cerrada con el nombre puesto es peor que no ofrecer nada. Vuelve ahora
porque ahora hay algo detrás, que es la condición que aquel commit dejó escrita.

No es un chat. Vaxav es un juego de esperar: el otro no va a estar mirando la
pantalla cuando vos escribís, así que lo que hace falta es algo que quede
guardado hasta que lo abra. Un mensaje **no pide estar cerca**: llega a donde
esté el otro. Lo que sí pide estar en el mismo lugar es enterarse de que el otro
existe, y de eso se ocupa la lista de pilotos de una estación.

Tres pestañas —Recibidos, Enviados y Archivados— sobre **una sola fila en la
base**: un mensaje enviado y uno recibido son el mismo hecho mirado desde dos
lados, y guardarlo dos veces es la manera segura de que un día digan cosas
distintas.

**Archivar no borra.** Un mensaje es la prueba de un trato, y un juego donde el
otro puede hacer desaparecer lo que escribió es un juego donde la palabra no vale
nada. Lo archivado sale de la bandeja, queda entero y vuelve con el mismo botón.
Cada lado decide el suyo: que el que lo mandó lo guarde no lo saca de la bandeja
del otro. Y el archivo es **uno solo para los dos lados**, porque quien busca algo
viejo no se acuerda de si lo escribió o se lo escribieron: se acuerda de con
quién fue. Por eso ahí la columna no dice «De» ni «Para» sino «Con».

El que está abierto va **al lado de la lista y no en otra ruta**: el proyecto
tiene dos niveles de navegación y nunca un tercero, y cuando un módulo necesita
más profundidad se resuelve con el diseño de la pantalla. Cuál está abierto viaja
en la URL, como todo recorte del juego. En pantalla chica el abierto va arriba:
el jugador acaba de tocar una fila para leerlo, y hacerlo aparecer debajo de una
tabla de quince es pedirle que busque lo que pidió.

**Escribir es una acción y no un lugar**, así que vive en una ventana y no en una
tercera pestaña que sólo se visita para eso. La ventana se abre sola cuando la
URL trae destinatario —es como llega el jugador desde la lista de una estación— y
cuando el envío vuelve con un motivo, o el motivo aparecería sobre un formulario
cerrado y el jugador perdería lo que escribió sin saber por qué.

El aviso del Neocom tiene una vuelta propia: **abrir la bandeja no marca nada**,
marca abrir un mensaje. Así que la pestaña sigue avisando mientras quede uno sin
abrir, aunque el jugador ya esté parado ahí.

### El panorama de reputación del piloto

`Piloto · Reputación` contesta la pregunta que las pantallas de Corporación no
pueden: **quién me conoce en el sector, y cuánto**. Va en Piloto porque es del
piloto —sobrevive a renunciar— y porque la mitad de lo que muestra no es de
ninguna corporación.

La figura es **la rosa de banderas**: el largo de cada brazo es lo que esa facción
piensa de vos, en su color, y los anillos caen donde caen los escalones de verdad
—diez, veinticinco, cincuenta, ochenta—, así que se ve que el último tramo es el
más largo de todos. Lo que dibuja no son tres cifras: es **qué clase de piloto
sos**. Un brazo largo con dos muñones es una lealtad; tres iguales, un
oportunista. Arranca vacía y no es un defecto: con todo en cero quedan los ejes y
un punto en el medio, que es exactamente lo que pasa.

Quién entra en las listas:

| Quién             | Cuándo aparece                                                               |
| ----------------- | ---------------------------------------------------------------------------- |
| Las banderas      | **Siempre**, tengas número o no: son el marco del sector                     |
| Las corporaciones | **Todas**, te conozcan o no                                                  |
| Los agentes       | **Todos**, con el nivel que te abren —no con un número propio, que no tienen |

**Van todos y no sólo los conocidos**, y es la decisión que vuelve útil la
pantalla. La reputación se gana con cualquiera, así que uno en cero no es ruido:
es el que todavía no trabajaste. Saber que existe, de qué bandera es y en qué
sistema está es la mitad de la decisión de a dónde ir, y una lista recortada a
los que ya te conocen contesta bien sólo cuando ya no hace falta preguntarlo.

Que los agentes estén **sin número propio** es lo primero que uno nota, así que la
pantalla lo contesta en vez de callarlo. Te atiende el que esté a la altura del
**mayor** entre lo que tiene su corporación y lo que tiene su bandera, y por eso
cada fila dice hasta qué nivel te abre. Ahí se vuelve visible la regla de las dos
escaleras: una corporación en el primer escalón puede abrir el tercero porque su
bandera llegó ahí.

Las dos listas largas van **una por vez**, con un selector arriba que lleva su
cuenta. Apiladas la página era inmensa —dos tablas paginadas con sus dos barras de
recorte— y para llegar a la segunda había que pasar por toda la primera. De paso
resuelve que las dos quieran los mismos parámetros: como se dibuja una por vez,
el selector decide quién los interpreta.

### La ficha que se abre desde cualquier nombre

Un nombre que aparece en una lista **lleva a lo que ese nombre es**. Es lo que
hace que un directorio de cuarenta corporaciones sea navegable en vez de ser
cuarenta cadenas de texto: se aprieta una y se ve qué es, quién la opera, dónde
tiene puestos, quién reparte trabajo ahí y qué piensa de vos.

**Es una ventana y no una pantalla.** Llevar a alguien al módulo Corporación para
mostrarle una ajena —con el Neocom marcando «Corporación» y las pestañas de uno al
lado— la hace leer como si fuera la suya; y sacar cada ficha a su propia ruta
agregaría el tercer nivel de navegación que este proyecto no tiene. La ventana se
abre encima, se mira y se cierra.

**Muestra lo mismo que el módulo**, con las mismas secciones y las mismas piezas:
la tabla de agentes y la de miembros son literalmente las de las pestañas, con su
buscador y su paginado. Una ficha ajena que muestre menos que la propia obliga a
preguntarse qué falta. Lo único que cambia es lo que es del que mira: **«Alistarse»
no se dibuja si ya respondés a otra**, porque no es que no se pueda apretar, es
que primero hay que renunciar.

Se dibuja **una sola vez, en el armazón del juego**, y no en cada pantalla que
quiera ofrecerla: una ventana que sólo se puede abrir desde algunas pantallas es
media función. El servidor la arma en el `load` del layout, y **sólo la sección
que se esté mirando**: traer las cinco para mostrar una sería cinco consultas por
cada nombre que alguien aprieta.

Su estado vive **en la URL**, como todo recorte de este juego: cuál está abierta,
qué sección y por dónde va su listado. Así una ficha se manda por mensaje, se abre
en otra pestaña, se cierra con el botón de atrás y se recarga sin perderla; una
ventana que sólo existe en la memoria del navegador no se puede compartir con
nadie. Y por eso sus parámetros llevan el prefijo `f_`: **abajo de la ventana hay
una pantalla** con sus propios `buscar`, `orden` y `pagina`, y sin prefijo el
buscador de la ficha filtraría la tabla de atrás. La URL queda más larga; a
cambio, las dos cosas funcionan a la vez.

**Y una ficha lleva a otra.** Desde la de un piloto se abre la de su corporación,
y desde la de ésta la de cualquiera de sus agentes o de sus miembros, sin cerrar
la ventana ni perder la pantalla de abajo. Es lo que vuelve navegable un sector de
cuarenta corporaciones, y es de donde sale la idea: en EVE uno termina tres saltos
adentro de una cadena de nombres que empezó en una lista.

**El marco no se mueve.** La ventana grande es de ancho fijo, y de alto fijo
cuando tiene secciones: una que se estira al cambiar de pestaña —cuatro datos en
una, una tabla de veinticinco filas en otra— no se siente como una ventana con
pestañas sino como cinco ventanas distintas. Lo que sobra se desplaza adentro. La
ficha de una sola sección no tiene entre qué saltar, así que le alcanza con un
piso que la salve de salir como una ranura.

Las tres clases, y qué contesta cada una:

| Ficha           | Qué muestra                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------- |
| **Corporación** | Las mismas cinco secciones del módulo, con las mismas tablas                                   |
| **Piloto**      | La credencial pública: quién es, a quién le responde, desde cuándo vuela, su IPP y su hexágono |
| **Agente**      | Qué reparte, dónde para, y **cuál de las dos escaleras** le falta para recibirte               |

#### La ficha de un piloto es una credencial

No una tabla de cuatro renglones. El que aprieta un distintivo quiere saber **con
quién está hablando**, así que arriba va la banda de su bandera —su color al filo,
su escudo de fondo, como en la credencial propia— con el sello, el distintivo, el
oficio y a quién le responde; y abajo **el hexágono de sus ramas con sus cifras al
lado**, que es la figura del piloto y dice por su silueta lo que el IPP dice por su
tamaño.

Es la credencial propia recortada a lo público: **sin créditos, sin dónde está
parado y sin los pozos sin gastar**. Dónde está sería un radar, y el juego ya
decidió que un listado de compañeros no lo es.

#### Y se puede cerrar

Desde `Opciones · Cuenta`, con el enlace a la propia ficha al lado: una preferencia
sobre cómo te ven se decide mirando cómo te ven. Cerrada, de un piloto queda
**sólo el distintivo** —que sigue apareciendo donde aparecía, en los miembros de su
corporación o al pie de un mensaje— y el servidor no manda nada más: negarla en la
pantalla pero mandar los datos igual sería no cerrarla.

Y tiene **vista propia y no un cartel**: el sello apagado detrás de un ojo tachado,
el distintivo y una línea que explica qué pasó. «No se puede» dicho con un renglón
gris se lee como un error del juego; así se lee como lo que es —hay alguien, y
eligió no mostrarse—. Es de la cuenta y vale para todos por igual: no hay listas
de permitidos, porque el juego todavía no tiene amistades que declarar.

### La columna angosta de una estación

**Una estación contesta tres preguntas y no una**, y las tres son listas largas
que no entran juntas en una columna fina: qué es este lugar, quién atiende acá y
quién más está parado acá. Apiladas, la ficha quedaba arriba de todo y a los
pilotos había que buscarlos scrolleando. Así que la columna lleva **solapas**:
Información, Agentes, Pilotos.

Los agentes se mudaron ahí desde la columna ancha por lo mismo: son una lista de
gente, igual que los pilotos, y estaban del otro lado de la pantalla que sus
pares.

Las solapas de un panel **no son las pestañas del módulo**, aunque hablen el
mismo idioma: aquéllas navegan —cada una es una URL y el servidor decide qué
carga— y éstas reparten lo que la pantalla ya tiene en la mano. Dos
comportamientos distintos, dos piezas: `PanelTabs` y `TabBar`. Y cambiar de
solapa no cambia la partida, así que el estado vive en el navegador.

#### Quién más está acá

**En un idle no hay conectado y desconectado.** El piloto está en el sector
aunque el jugador no esté mirando la pantalla, así que la presencia no es una
sesión abierta: es dónde está parado. El que salió de viaje no cuenta —sigue
teniendo guardado el cuerpo del que salió, y sin ese filtro aparecería atracado
en un lugar del que ya se fue—, que es la misma verdad que dice la pantalla:
**en tránsito no estás en ningún lado**.

**Y sólo en estaciones.** Una estación es un puerto: es pública, no se puede
atacar, y quien atraca acepta que lo vean. En espacio abierto —un cinturón, una
órbita, una puerta— la lista no existe: va a haber que escanear, y eso pedirá
módulo y tiempo, que es lo que hace que esconderse signifique algo. Esa mecánica
no está construida y la pantalla no la anuncia.

Lo único que se puede hacer hoy con alguien que está al lado es **escribirle**.
Agregarlo a contactos y comerciar llegan cuando existan: un botón que no hace
nada es peor que no ofrecerlo.

### La pantalla parado en una puerta

Una puerta era, hasta acá, un panel de texto con cuatro cifras: lo único que la
distinguía de una luna era lo que decían las palabras. **Un lugar al que se viaja
tiene que verse distinto de los demás**, o el módulo entero se siente como una
sola pantalla con el contenido cambiado.

La figura es **el aro de salto**, y lo que dibuja no es adorno:

| Se ve                                    | Quiere decir                                     |
| ---------------------------------------- | ------------------------------------------------ |
| El radio encendido sale por un lado      | El **rumbo**: seis lados, seis dibujos distintos |
| Adentro, un túnel que se aclara al fondo | Lleva a alguna parte, y se puede cruzar          |
| Todo el aro apagado                      | Lleva, pero **esta nave no llega**               |
| El radio se corta antes del borde        | Un **muñón**: nadie la conectó del otro lado     |
| Un tajo rojo al medio                    | El **paso está cerrado**                         |

La casilla es un hexágono y el aro es un círculo, y no al revés. El hexágono es
literal —la galaxia es una grilla de tapa plana y los seis rumbos son sus seis
lados—, así que lo que se ve ahí es el mismo reparto que el mapa. Es la pregunta
de al lado de la que contesta la roseta del cuartel, que mira un sistema **desde
afuera**: cuántas salidas tiene. Ésta mira **una salida desde adentro**.

Y se dibuja **radial**, de frente, mientras que la del viaje se dibuja lateral, de
izquierda a derecha. Es a propósito: viajando hay un trayecto y parado hay una
cosa enfrente. Dos pantallas del mismo módulo que se dibujan igual son dos
pantallas que el jugador no distingue.

**El dibujo no lleva ni una palabra**, ni siquiera el nombre del rumbo: se probó
con el rótulo puesto sobre su propio radio y tapaba justo el muñón que tenía que
dejar ver. La palabra va en la lista de al lado, que es donde va siempre.

### La pantalla parado en un planeta, una luna o una estrella

Eran las tres que no tenían nada, y el problema no era que les faltara un dibujo:
**no tenían nada del lado ancho**. Una estación tiene su mosaico de módulos, una
puerta su salto y un cinturón sus rocas; parado en un planeta la pantalla era una
ficha angosta con dos tercios de pantalla en negro al lado.

Lo que un cuerpo tiene para decir de sí mismo es **el lugar que ocupa**. Dicho con
palabras son tres renglones iguales a los de cualquier otro —«orbita a Ánfora, a
842 ud»—; dibujado, un planeta interior con tres lunas no se parece en nada a una
luna pelada del borde.

| Se ve                             | Quiere decir                               |
| --------------------------------- | ------------------------------------------ |
| Lo que está en el centro          | De quién colgás: tu estrella, o tu planeta |
| Tu anillo entre todos los que hay | Qué tan afuera estás                       |
| Los íconos de los otros puntos    | Qué clase de vecinos tenés, y cuántos      |
| El anillito alrededor tuyo        | Lo que te cuelga: lunas y estaciones       |

**Una sola figura para los tres casos**, porque son el mismo mirado desde otra
altura: el centro es el padre y el anillo son sus hijos. Una estrella no tiene
padre, así que el centro es ella misma y el anillo son sus planetas —parado en
una estrella estás en el centro, y eso sale solo, sin caso especial—.

**Y gira.** Los de afuera tardan más, con el exponente de la tercera ley de
Kepler, así que la velocidad **también dice** qué tan lejos está cada uno. No es
una simulación: la cuenta real reparte las velocidades mejor que cualquier número
elegido a ojo. Despacio en serio —la vuelta más corta ronda el minuto— porque
esta pantalla queda abierta mientras se espera, y algo que se mueve rápido al
lado de un texto es algo que no deja leer. Quien pidió menos movimiento en su
sistema ve el plano quieto.

Los satélites **viajan con el cuerpo y no dan su propia vuelta**: dos giros
encimados a escalas muy distintas convierten ese rincón en un remolino, y lo que
hay que ver ahí es cuántos te cuelgan.

### La pantalla parado en un cinturón

La lista dice qué tiene cada piedra. La figura dice **cómo es el campo**, que es
otra pregunta y la que uno se hace al llegar: si vale la pena quedarse.

| Se ve                  | Quiere decir                                       |
| ---------------------- | -------------------------------------------------- |
| Cuántos bultos hay     | Cuántas rocas tiene el campo                       |
| El tamaño de cada uno  | Lo que le **queda** de lo que traía al aparecer    |
| Encendido, con silueta | Tiene lectura vigente: sabés qué es y cuánto tiene |
| Contorno apagado       | **Un bulto y nada más**: le falta el escáner       |
| Contorno punteado      | La lectura venció                                  |

Así que **un campo trabajado se ve trabajado**: las piedras exprimidas quedan de
guijarro al lado de una entera, y se lee de un vistazo si alguien pasó antes.

Cada roca tiene su propia silueta, sacada de su número. No es azar de dibujo —el
mismo número da siempre la misma piedra—, así que la que estabas mirando sigue
estando donde estaba después de escanearla. Es el mismo criterio que el sello de
un piloto: el dibujo sale del dato.

Y lo que no tiene lectura se dibuja **entero**, no vacío: suponerlo agotado sería
contar algo que el piloto no sabe.

### El destino, marcado en el árbol

Mientras la nave va en camino, el árbol del sistema muestra **las dos puntas del
viaje**: naranja donde estás parado y cian adónde venís. Conviven porque el
piloto en tránsito sigue teniendo guardado el cuerpo del que salió, y verlas
juntas es justamente lo que uno quiere mientras espera.

El cian no es una elección suelta: es el mismo que el mapa usa para el tramo en
curso, y por la misma regla —en este juego el cian quiere decir **vos**, dónde
estás y adónde vas—.

### El chat

> **Sin construir.** Hubo una ventana con líneas inventadas y se sacó: una maqueta
> que parece funcionar promete algo que no existe, igual que un cartel de fase. El
> diseño de abajo queda en pie para cuando se haga de verdad.

Siempre a mano, como el indicador. Es lo que convierte una simulación en un lugar
con gente.

- **Un botón abajo a la derecha** abre la ventana flotante de siempre. Cerrada
  no ocupa nada; abierta no tapa la pantalla, porque es una ventana y no una
  sección.
- Dos salas para empezar: **global** y la del **sistema** donde está el piloto,
  que se llama como el sistema.
- Al costado, **quiénes están conectados** a esa sala. En una ventana angosta la
  lista se esconde y queda el número en la cabecera.
- Va **del lado opuesto al Neocom**: son las dos cosas que están siempre
  encendidas, y en esquinas distintas ninguna tapa a la otra.
- Es lo único del juego que ocurre **en tiempo real**; todo lo demás tarda.
- Por dentro no va a vivir en el estado de la aplicación, por lo que explica
  [arquitectura](ARCHITECTURE.md).

### Área central

El contenido de la sección. Tablas densas, cifras en monoespaciada, y las
acciones disponibles como botones al lado de aquello sobre lo que actúan.

**No toda pantalla se dibuja igual.** El marco es común —Neocom, barra de estado,
pestañas—, pero de ahí para adentro la forma la decide el contenido. Si todas las
secciones son un título y paneles apilados en una columna, el juego se aplana: la
estación donde estás parado termina leyéndose igual que la ficha del piloto.

### El mosaico de módulos

La pantalla de servicios de estación de Elite Dangerous no es una lista: es una
**grilla de baldosas grandes** con su ícono, y la elegida se rellena de naranja.
Es la pantalla más reconocible del juego, y es la que usa la pestaña Ubicación
cuando el piloto está atracado.

- Están **los ocho módulos siempre**; los que la estación no tiene van apagados.
  Así se lee de un vistazo qué clase de estación es, sin contar lo que hay.
- Elegir una baldosa **abre su detalle debajo**: qué se hace ahí y en qué fase
  llega. Un mosaico de botones muertos sería peor que no tenerlo.
- Al lado, en columna angosta, la ficha del lugar. Es la única pantalla del juego
  a dos columnas, y ésa es exactamente la idea.

Vive en `src/lib/components/` y es reutilizable: el día que un jugador
instale módulos en su estación, la baldosa apagada **es** la ranura vacía.

### La ficha de la nave: una herramienta de equipamiento

**Tres columnas**, y el reparto es la mitad del diseño: las ranuras, qué entra en
la que está abierta, y en qué queda la nave. Arriba, cruzando las tres, la banda
de los cuatro presupuestos.

Es la ventana de _fitting_ de EVE en el HUD de Elite, y se llegó ahí sacando un
anillo. Durante meses la pantalla tuvo las ranuras repartidas alrededor de un
círculo, que era lindo y decía la terna por su forma, pero **un círculo tiene sus
elementos en trescientos sesenta grados y por lo tanto no tiene ningún costado
donde abrir el panel de una ranura** —abajo obliga a bajar, al lado lo achica,
flotando tapa algo—. La consecuencia era una lista al lado diciendo las mismas
ranuras otra vez: la figura le estaba cobrando una columna entera a la
herramienta.

Lo que el anillo hacía bien lo siguen haciendo las filas:

- **El largo de cada bandeja es la terna del casco.** La Mula tiene la fila de
  bajos larguísima y el Vencejo la de medios, así que dos naves se distinguen por
  la forma del bloque sin dibujar nada.
- **El nombre del módulo se lee sin pasar el mouse**, que en el anillo era
  imposible: ahí sólo entraba un ícono y una cifra.
- **Escala.** Un acorazado con ocho ranuras altas alarga una fila; en un círculo
  se amontona.

Y lo que gana es el resto:

- **Abrir una ranura no mueve un píxel.** El catálogo tiene columna propia, así
  que elegir un módulo no empuja la hoja justo cuando se están comparando cifras.
- **Las dos columnas de la derecha se pliegan**, cada una por su lado. No se usan
  al mismo tiempo —mientras se elige un módulo manda el catálogo; para leer en qué
  quedó la nave, la hoja—, así que cualquiera le cede su ancho a la otra y queda
  un riel que dice qué hay adentro. Con el catálogo plegado, las lecturas pasan a
  dos columnas y se leen como un tablero.
- **El teléfono sale gratis.** Las tres columnas se apilan en el orden en que se
  usan: ranuras, catálogo, hoja. El anillo, en cambio, era un cuadrado que se
  comía media pantalla.

La banda de presupuestos —**grilla, CPU, capacitor y calibración**— va arriba y
siempre a la vista, porque ahí está el micro-juego: están apretados a propósito,
así que la barra crece **mientras se mira la ranura que se está llenando** y un
cinco por ciento más de grilla es lo que hace entrar el módulo mejor. Señalando un
módulo de la lista, las barras y la hoja ya muestran cómo quedaría la nave.

Dos detalles que valen para cualquier pantalla del juego:

- **Se puede armar algo imposible.** Un módulo que no entra se monta igual y la
  pantalla dice por qué no cierra —«faltan 9 MW»— en vez de impedirlo sin
  explicación.
- Un interruptor **«con mis habilidades / con todo entrenado»** compara las dos
  hojas. Es la forma más directa de explicar la progresión sin un tutorial: el
  jugador ve, en números, qué le compraría entrenar.

**Cada círculo se explica solo.** Lleva el ícono del módulo que tiene montado
—no el de su categoría— y debajo su clase y calificación: sin eso, los siete
internos esenciales eran siete engranajes idénticos y había que pasar el mouse
por cada uno para saber cuál era cuál. Una ranura vacía va punteada y muestra su
clase.

Al lado del anillo hay una **lista de las mismas ranuras**, agrupada por
categoría. No es una segunda interfaz: comparte la ranura elegida, así que
señalar en cualquiera de las dos prende las dos. Un anillo dice bien _dónde_ está
cada cosa y mal _qué_ es cada una; una lista con encabezados se lee de arriba
abajo. Y en un teléfono, donde apuntarle a un círculo de cuarenta píxeles es
incómodo, la lista es lo que termina usándose.

En teléfono el anillo no entra y la pantalla cae a una columna, con la lista
debajo. Vive en `src/lib/components/` y
`src/lib/components/`.

## Piezas que se repiten

Cosas que nacieron en una pantalla y terminaron siendo del juego entero. Van acá
porque la próxima pantalla que las necesite tiene que encontrarlas, no
reinventarlas.

### El inventario

Con ochenta componentes, «fijarse si ya existe» no pasa solo: hay que preguntarlo
pieza por pieza, y para eso hace falta saber qué hay. Esta tabla es el mapa, por
carpeta; los archivos están en `src/lib/components/`.

| Carpeta       | Para qué                                          | Lo que más se usa                                                                                        |
| ------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `ui/`         | Lo estructural, sin saber de qué habla el juego   | `HudTable`, `Modal`, `Popover`, `HoverCard`, `Paginator`, `TreeBranch`                                   |
| `cards/`      | Paneles y recuadros                               | `Panel`, `TitledPanel`, `FloatingPanel`, `StatRow`                                                       |
| `buttons/`    | Lo que se aprieta                                 | `HudButton`, `HudLink`                                                                                   |
| `forms/`      | Campos y avisos de formulario                     | `TextField`, `SelectField`, `ColorField`, `ErrorCallout`, `SuccessCallout`, `ChoiceCard`                 |
| `typography/` | Los seis tamaños de texto del HUD                 | `Label`, `CardTitle`, `BodyText`, `HudValue`, `DisplayTitle`, `Eyebrow`                                  |
| `game/`       | Piezas que sí saben del juego                     | `ConfirmAction`, `ActionSource`, `GalaxyMap`, `GalaxyStage`, `Identicon`, `PilotCredential`, `InfoSheet` |
| `admin/`      | Sólo del cuartel                                  | `GateRose`, `EventTrace`, `EventLine`                                                                    |
| `meters/`     | Barras y medidores                                | `ProgressBar`, `SegmentBar`, `ChargeBar`, `SkillMeter`                                                   |
| `layout/`     | El marco de las pantallas públicas                | `PageShell`, `Section`, `Bounded`                                                                        |
| `shell/`      | El marco del juego: Neocom, barra de estado, chat | `GameShell`, `AdminShell`, `Neocom`, `ChatDock`                                                          |
| `brand/`      | Logotipo y marca                                  | `Wordmark`, `LogoImage`                                                                                  |

Tres que conviene conocer antes de escribir una pantalla nueva, porque son las
que más se reinventan sin querer:

- **`HudTable`** — toda lista del juego. Las columnas son un dato: de una sola
  declaración salen los anchos, los encabezados y cuáles ordenan.
- **`ConfirmAction`** — toda acción que compromete tiempo o gasta algo. Trae el
  cartel con sus lecturas y la procedencia del verbo.
- **`Panel` y `TitledPanel`** — el recuadro del HUD. Una pantalla que dibuja su
  propio borde naranja está reimplementando uno de estos dos.

**Y una advertencia sobre `admin/`:** que algo haya nacido en el cuartel no lo
vuelve del cuartel. `SelectField` era un campo de formulario con otra dirección, y
`GalaxyMap` terminó siendo la pestaña Galaxia del juego. Cuando una pieza de esa
carpeta le sirve a una pantalla del juego, **se muda**; envolverla o copiarla es
quedarse con dos.

### El sello, que le da cara a lo que no tiene

`Identicon` dibuja un emblema calculado a partir de un nombre. Existe porque hay
cosas que necesitan cara y nadie va a dibujarles una: cuarenta corporaciones
hoy, cientos mañana, y un piloto que todavía no subió foto.

Lo que hay que saber para usarlo: **la familia decide la silueta entera**
—`corporacion` es un panal hexagonal, `piloto` un disco de casillas cuadradas y
`agente` un triángulo— y
el tamaño es una medida de CSS que vale para el ancho y el alto, así que nunca se
deforma. El porqué de cada decisión está en
[corporaciones](CORPORATIONS.md#el-sello-la-cara-de-cada-una).

**Sin foto, la credencial del piloto lleva su sello** en vez de una silueta gris.
La silueta decía «acá falta algo» y nada más: todas iguales, la del piloto y la de
los otros mil. El sello sale del distintivo, así que desde el primer segundo la
credencial muestra algo que es suyo y de nadie más.

### El mapa de la galaxia y su marco

Son tres piezas y conviene no confundirlas:

- **`GalaxyMap`** es el lienzo: la grilla, las líneas, la cámara y el clic. No sabe
  qué hay alrededor.
- **`GalaxyStage`** es el marco: acomoda el lienzo, los filtros, la ficha del
  costado y la leyenda, y resuelve el botón de agrandar —panel arriba, pantalla
  completa encima de todo—. A pantalla completa **pliega los dos bloques que
  flotan**, filtros y ficha, cada uno con su botón en su esquina; el de la ficha
  lleva el nombre de lo que describe, porque plegada es lo único que queda.
- **`GalaxyLegend`** —sin botones: los controles de la cámara son del mapa y viven
  en su esquina— dice qué significa lo que se ve, y ordena dos preguntas
  distintas: qué dice el color —que cambia con el filtro— y qué dice la línea —que
  es siempre la misma—. Cada fila lleva su rótulo a la izquierda, de ancho fijo,
  porque esa alineación en columna es la mitad de lo que hace que trece entradas
  dejen de parecer un amontonamiento. Los nombres propios van en caja normal y sólo
  las etiquetas fijas en versalitas: «Marca de Ávila» espaciada en mayúsculas
  cuesta el doble leerla. Y la lista de colores **se corta**: con veinte regiones
  sería más alta que el mapa, así que se muestran unas pocas y el resto se pide —lo
  que se esconde ahí ya está escrito sobre el propio mapa—.

Las piezas de adentro entran como snippets, así que el marco no sabe qué son: el
constructor filtra por gobierno y ofrece abrir el sistema, el piloto filtra por
servicios y ofrece viajar. Lo que **no** cambia es dónde va cada una, y ésa es
justo la parte que no conviene escribir dos veces: dos marcos se separan solos, y
un botón de agrandar que en una pantalla deja la ficha adentro y en la otra afuera
es una interfaz que hay que volver a aprender.

La cámara vive en **la pantalla** y no en el marco ni en el mapa: agrandar dibuja
la otra versión y eso vuelve a montar el lienzo, así que con la vista adentro cada
expansión volvería al encuadre inicial.

**Y el mapa se puede enlazar.** `?sistema=<código>` lo abre con ese sistema elegido
—y mirando hacia él—, y `?corporacion=<código>` lo abre con el filtro puesto. Son
dos cosas distintas y se ven distinto a propósito: un filtro **pinta un conjunto**
—todas las casillas donde esa corporación tiene algo, que es la pregunta «¿dónde
está metida?»— y una elección **marca una** con su aro y su ficha al costado. Un
filtro de un solo elemento sería pintar un panal para señalar un punto.

Lo que sí comparten es que el mapa **abre mirando lo que el enlace pidió**. Sin eso,
la cámara se quedaba donde está parado el piloto y el sistema enlazado quedaba
marcado fuera de cuadro: la pantalla contestaba, pero en un renglón del costado. El
encuadre ocurre una sola vez, así que elegir después en el mapa no le mueve la
cámara a quien la esté moviendo con la mano.

Por eso **casi todo nombre de sistema del juego es un enlace al mapa**: el de un
agente, el de un puesto de una corporación, el de la ficha del lugar donde estás
parado. Saber que algo está en Ánfora sólo ayuda si desde ahí se puede ver dónde
queda Ánfora.

### La credencial, y el sello del piloto

La pantalla de Información es **una credencial**, y es la figura de esa pantalla
igual que el anillo lo es de Nave. Lo que la hace reconocible antes de leer una
palabra son cuatro cosas: una banda de cabecera con el número de serie, el sello
del piloto en un marco cuadrado con escuadras de visor en las esquinas, el índice
debajo, y el escudo de la facción como marca de agua detrás de las lecturas
—detrás de **las lecturas** y no de la tarjeta entera, porque al fondo se le metía
debajo al hexágono, y una figura que informa por su forma no puede tener otra
encima—.

La rueda de ramas va **adentro**, al otro lado de los datos. Una credencial
dice quién sos, y en un juego de progresión eso no es el nombre: es la silueta de
aquello a lo que le dedicaste el tiempo. La tarjeta contesta las dos preguntas de
un vistazo, y un botón la abre en grande junto a las cifras exactas de cada rama.

Abajo del todo, **la franja de la nave**: el casco, su rol, el tanque y las tres
capas en el orden en que se las come el daño. El detalle entero está a una pestaña
de distancia y no se repite acá —salvo el combustible, que viene igual porque es
el único de esos números que **se gasta**, y el que decide si el próximo salto se
puede dar—. Un dato así no puede costar dos pestañas mirarlo.

Es una regla, no una excepción: **lo que se agota se muestra donde se lo va a
extrañar**, no sólo en su ficha. El combustible aparece en la nave, en la
credencial, junto al botón de saltar y en el informe del viaje.

#### No hay foto, hay sello

El piloto **no sube una imagen**. La tuvo, y resolvía menos de lo que costaba: el
que no subía ninguna quedaba con una silueta gris igual a las otras mil, el que
subía una traía una imagen de afuera al medio de un HUD que es todo trazo fino, y
el proyecto cargaba con una ruta, un servicio, un recortador en el navegador y
archivos de estado en `data/`.

El sello sale del distintivo, así que **desde el primer segundo la credencial
muestra algo que es suyo y de nadie más**, y se ve igual acá, en el listado de
miembros y en cualquier lista donde el piloto aparezca. No se guarda en ninguna
parte: se recalcula.

El marco es **cuadrado y no de carnet**. La proporción alta venía de la foto; con
un sello cuadrado dejaba dos franjas muertas arriba y abajo, y en un teléfono
—donde la columna va arriba de todo y a lo ancho— eso era media pantalla de nada.
El alto que sobra lo ocupa el índice, que es lo que corresponde: el sello dice
quién sos y el índice qué tan lejos llegaste.

Y lleva **su «?»**. Un dibujo que aparece solo y no se puede tocar necesita
explicar de dónde salió; sin eso el jugador se queda buscando dónde cambiarlo.

### La ayuda que dice qué habilidad mueve un número

Un juego de progresión que muestra "alcance: 1 región" sin decir qué lo sube
esconde justamente lo que hay que decidir. Al lado de cada número que depende de
una habilidad va un signo de pregunta que la nombra, dice **de qué rama es** —la
experiencia se deposita por rama, así que saber que Contabilidad es de Comercio es
saber que hay que comerciar para subirla— y qué gobierna.

El texto sale del catálogo de habilidades y no de un texto escrito a mano, así que
ponerla en una pantalla nueva no cuesta escribir nada. Va en un `Popover` y no en
un `HoverCard`: en un teléfono no hay mouse.

### Las tablas

Un libro contable, un catálogo y un libro de órdenes son tablas, y lo que uno hace
con ellos es **recorrer una columna**. De ahí tres reglas:

- **Los anchos van declarados** (`table-fixed` y un `colgroup`), no medidos por el
  navegador. Con anchos automáticos las cifras se corren según qué diga el renglón
  más largo, y dos tablas apiladas que son la misma partida en dos dejan de estar
  en registro.
- **Lo que tiene dos lados va en dos columnas**, no en una con signo. En la
  billetera, ingreso y egreso separados contestan "¿en qué se me fue la plata?"
  sin leer el signo de cada fila.
- **En pantalla angosta la tabla se desplaza dentro de su contenedor** y las
  columnas accesorias se esconden. La página nunca se desplaza en horizontal.

**Lo que falta: en el teléfono una tabla no es una tabla.** Desplazarse a lo ancho
para leer una fila es lo que hace una tabla cuando nadie decidió nada, no lo que
uno quiere hacer con el pulgar. Lo que corresponde ahí es que **cada fila se
dibuje como una tarjeta** —el dato principal grande arriba y los demás rotulados
debajo— y que eso lo resuelva `HudTable` y no cada pantalla: son ocho listados
largos y ocho maquetas paralelas serían ocho que se separan. Las columnas ya son
un dato declarado —su rótulo, su ancho, si se esconde—, así que la pieza tiene
con qué armar la tarjeta sin que nadie le explique nada. Queda pendiente.

### La zona de peligro

Lo que no se puede deshacer va **al fondo de su pantalla, enmarcado en rojo y con
su propia cabecera**. Se llega bajando a propósito, no de paso.

Dice **qué se pierde antes de pedir nada**, y la confirmación son dos cosas que
frenan cosas distintas: escribir un dato a mano frena al dedo apurado, y la
contraseña frena a quien se sentó en una sesión ajena. El botón usa la variante
`danger`, que arranca en contorno y se llena al señalarla: un botón rojo sólido en
una pantalla naranja se lleva el ojo antes que el aviso que hay que leer.

## Cómo encaja con lo que ya existe

- `page_shell` (en `src/lib/components/`) es el marco **público** de las
  pantallas de acceso; la portada usa `bare_shell`, sin cabecera ni pie, porque
  una intro de juego no lleva barra de navegación encima.
- `game_shell` (en `src/lib/components/`) es el marco **de adentro**,
  con Neocom y barra de estado. No hereda del público: son dos marcos distintos
  para dos momentos distintos.
- **Los dos comparten todo lo demás**: los tokens de `src/app.css` y los roles
  de `src/lib/components/`. Esa es la razón de haber hecho el sistema de estilos
  antes que el juego.

### La procedencia de una acción

La regla es de diseño y está escrita entera en
[«La cadena»](../DESIGN.md#la-cadena-se-muestra-o-no-existe). Acá está **cómo se
dibuja**, que es lo que hay que copiar cuando se agrega un verbo nuevo.

**Toda acción del juego lleva su procedencia**: qué módulos necesita montados,
qué habilidades cambian su resultado, qué rinde hoy, qué daría el escalón
siguiente y por qué no se puede ahora mismo. Vive en un solo tipo, `Procedencia`
(`src/lib/tipos.ts`), y se dibuja con un solo componente.

**Dónde aparece, y por qué en dos lugares:**

| Dónde                              | Cómo                                                | Para quién                                          |
| ---------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| Señalando el botón                 | `ActionSource` envuelve al botón con un `HoverCard` | Mouse y teclado —el aviso también abre con el foco— |
| Adentro del cartel de confirmación | `ConfirmAction` recibe `source`                     | **Teléfono**, donde no hay con qué señalar          |

Entre los dos no queda nadie afuera. Un ícono de ayuda al lado del botón se
probó y se descartó: es otra cosa que tocar, y con dos botones seguidos no se
sabe de cuál habla.

**Cuatro decisiones de forma que no son negociables:**

1. **El motivo del bloqueo va arriba de todo.** Es lo primero que alguien busca
   cuando el botón está apagado. Acá ya pasó una vez lo contrario —el aviso
   contaba de dónde salía el verbo mientras callaba el único dato que se estaba
   buscando— y es el peor modo de fallar de esta pieza.
2. **Los que faltan se muestran igual**, en rojo y nombrando la pieza. Módulos y
   habilidades. Lo que falta es lo que hay que comprar o entrenar, y es el único
   motivo por el que alguien abre el aviso con el botón apagado.
3. **Es una grilla de dos columnas, no filas con un ancho a ojo.** Con un ancho
   fijo, un rótulo largo empuja su valor y rompe la columna, y lo que envuelve cae
   contra el margen. La grilla alinea sola.
4. **Techo de alto y scroll propio.** Hoy son tres filas; un verbo puede pedir
   cuatro módulos y mover cinco habilidades. Por eso el `HoverCard` que lo
   envuelve va con `interactive`: sin eso el panel no recibe el mouse, y un
   scroll al que no se puede entrar es un recorte.

**Todo lo que puede ser varios, es una lista.** No hay ni un campo singular en
`Procedencia`, y es a propósito: saltar ya necesita **dos** módulos —motor y
tanque—, viajar tiene dos habilidades que lo mueven, y un verbo puede estar
bloqueado por más de una razón. Un campo que empieza en singular obliga a
reescribir el tipo, las vistas y la pantalla el día que aparezca el segundo, que
es siempre antes de lo que parece.

**Los rótulos son palabras del juego, no del diseño.** «Módulo», «Habilidades»,
«Mejora». Acá decía «Aparato» y «Llaves», que es el vocabulario con que
[la cadena](../DESIGN.md#la-cadena) se piensa: sirve para razonar y no lo
entiende nadie que no haya leído el documento.

#### Al agregar un verbo nuevo

1. El servicio que lo resuelve devuelve **qué módulo lo habilita y qué
   habilidades lo mueven**, no sólo si se puede. El módulo sale de
   `grantingModules` y las habilidades de `leversFor` (`src/lib/game/sourcing.ts`),
   que leen la misma tabla que usa la calculadora: una lista escrita a mano al
   lado se desfasa el día que nadie mira.
2. La vista arma la `Procedencia`. Si el verbo se mueve por porcentajes, alcanza
   con `fuenteDeVerbo`; si tiene efectos que no son un porcentaje —como la lectura
   del escáner— se arma a mano.
3. La pantalla envuelve el botón con `ActionSource` y le pasa `source` al
   `ConfirmAction`.
4. **El motivo del bloqueo sale de una función pura que comparten pantalla y
   servicio**, así el botón apagado y el rechazo del servidor dicen exactamente lo
   mismo y nadie aprieta algo que va a rebotar. `jumpProblem` es el caso testigo.

#### Dónde está puesto

| Verbo    | Módulos                     | Habilidades                                |
| -------- | --------------------------- | ------------------------------------------ |
| Viajar   | Propulsores                 | Navegación, y la del bono de rol del casco |
| Saltar   | Motor de salto **y** tanque | Astrogación                                |
| Escanear | Escáner                     | Escaneo, Prospección                       |
| Extraer  | Láser de extracción         | Minería, y la del bono de rol del casco    |

Los verbos del mercado —comprar, vender, acordar— todavía no la llevan: no
dependen de un módulo de la nave, pero sí de habilidades como Regateo, que hoy no
mueve ningún número. Entran cuando esa habilidad sea mecánica.

Y hay un hueco anotado: **Eficiencia de combustible no mueve nada todavía**. El
salto la nombra en la hoja de ruta pero `jumpFuel` recibe su bono en cero, así que
no aparece entre las habilidades de saltar. Aparece el día que lo mueva, no antes:
prometer una habilidad que no hace nada es el huérfano que la cadena existe para
evitar.

## Reglas de diseño

- **El estado en curso nunca se esconde.** Se ve desde cualquier sección.
- **Los números en monoespaciada y en cian**, para encontrarlos de un vistazo
  (ver `data_value` en `src/lib/components/`).
- **Los niveles de habilidad, en estrellas**; los romanos quedan para nombrarlos
  dentro de una línea de texto.
- **Nada de modales para lo cotidiano.** Interrumpen y no dejan comparar.
- **La forma la decide el contenido**, no una plantilla: una estación se dibuja
  como un mosaico y un sistema como un árbol, porque son cosas distintas.
- **Que funcione en un teléfono.** El Neocom plegado a íconos es justamente eso.
- **Las frases se escriben con la voz del juego**: voseo rioplatense, seco, sin
  jerga ni chistes, y cada clase de texto en su registro. Está entera en
  [«La voz»](../DESIGN.md#la-voz).

## Por decidir

- Si el Neocom se pliega solo en pantallas chicas o queda a criterio del jugador.
- Si hay atajos de teclado.
- Cuánto se actualiza sola la pantalla mientras está abierta, y cada cuánto.
