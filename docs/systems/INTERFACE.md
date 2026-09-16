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

| Módulo      | Pestañas                                       |
| ----------- | ---------------------------------------------- |
| Piloto      | Información · Habilidades · Bitácora           |
| Nave        | Ficha · Bodega                                 |
| Navegación  | Ubicación · Sistema                            |
| Mercado     | Mercado · Órdenes de venta · Órdenes de compra |
| Propiedades | Propiedades                                    |
| Billetera   | Billetera                                      |
| Opciones    | Cuenta                                         |

Un módulo de una sola pestaña no dibuja barra. La lista crece a medida que hay
pantallas: la galaxia llega con el segundo sistema.

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

### El anillo de equipamiento

La pantalla de nave es **la única circular de todo Vaxav**, y ésa es media razón
de que exista: el resto del juego son paneles rectangulares apilados, así que la
nave se distingue por su forma antes de que se lea una palabra. Es la figura de
la pantalla de _fitting_ de EVE cruzada con el esquema de nave del HUD de Elite.

La otra media razón es que la figura **dice algo**:

- Las tres capas de integridad son **anillos concéntricos** —escudo afuera, casco
  adentro—, que es exactamente el orden en que se las come el daño.
- El anillo de afuera va **punteado** cuando no hay generador montado: la nave se
  _ve_ sin escudo.
- Las ranuras se reparten parejo alrededor y agrupadas por tipo, así que ninguna
  se pisa tenga el casco nueve o quince.
- Al centro, un **esquema de alambre** dibujado por nosotros. No hay arte de
  naves, y el alambre es justamente el lenguaje del juego que se imita.

Al costado va la **hoja de rendimiento**, que es lo que la vuelve una herramienta
y no una ficha: presupuestos, aguante por tipo de daño, armamento, trabajo,
movilidad y capacidad. Cambiar un módulo la mueve entera al instante.

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

### La credencial, y el retrato del piloto

La pantalla de Información es **una credencial**, y es la figura de esa pantalla
igual que el anillo lo es de Nave. Lo que la hace reconocible antes de leer una
palabra son cuatro cosas: una banda de cabecera con el número de serie, una foto
de proporción de carnet pegada al borde que ocupa el alto entero de la fila,
escuadras de visor en sus esquinas, y el escudo de la facción como marca de agua
detrás de las lecturas —detrás de **las lecturas** y no de la tarjeta entera,
porque al fondo se le metía debajo al hexágono, y una figura que informa por su
forma no puede tener otra encima—.

El hexágono de ramas va **adentro**, al otro lado de los datos. Una credencial
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

**El retrato:**

| Qué           | Cómo                                 |
| ------------- | ------------------------------------ |
| Tamaño        | 480×640, proporción de carnet        |
| Formato       | WebP, siempre                        |
| Peso máximo   | 512 kB                               |
| Dónde vive    | `data/retratos/<id del piloto>.webp` |
| Cómo se sirve | `/retratos/<id>?v=<marca de tiempo>` |

Tres decisiones que lo ordenan:

1. **El recorte y la compresión pasan en el navegador.** Lo que llega al servidor
   ya tiene la forma y el peso definitivos, así que no hace falta una librería de
   imágenes del lado del servidor —que acá sería una dependencia nativa por una
   sola pantalla— y nadie espera a que se suban ocho megas para que le digan que
   no. El servidor **igual valida** tipo, peso y firma del archivo, porque el
   navegador es del jugador y un pedido se puede armar a mano.
2. **Se guarda ya recortado**, no entero. Si cada pantalla lo recortara al
   dibujarlo, sería una cara en la credencial y otra en una lista.
3. **Vive en `data/` y no en `static/`.** `static/` es contenido del proyecto:
   entra al repositorio y se rehace en cada despliegue. Esto es estado de la
   partida, como la base, y por eso va al lado. El precio es que SvelteKit no lo
   sirve solo; son unas pocas líneas de ruta y a cambio queda claro qué es
   contenido y qué es partida. Los retratos de los **agentes** son contenido y
   siguen en `static/portraits/`.

El nombre del archivo es el id y nada más: la carpeta ya es el espacio de
nombres. Que esté atado a la cuenta es lo que hace que subir uno nuevo reemplace
al anterior sin dejar basura, y que dar de baja una cuenta sea borrar un archivo.

Se cambia **desde la propia foto y en ningún otro lado**: ahí el resultado está a
la vista al tamaño exacto en que va a quedar. Una chapita de cámara siempre
visible dice que se puede tocar —un disparador que sólo aparece al pasar el mouse
es un disparador que nadie descubre—, el velo con Cambiar y Quitar aparece al
señalar o con el foco del teclado, y mientras sube se queda encendido con un aro
girando: una subida sin señal parece una que no pasó, y el jugador vuelve a
apretar.

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

## Por decidir

- Si el Neocom se pliega solo en pantallas chicas o queda a criterio del jugador.
- Si hay atajos de teclado.
- Cuánto se actualiza sola la pantalla mientras está abierta, y cada cuánto.
