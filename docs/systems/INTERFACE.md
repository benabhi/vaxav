# Interfaz del juego

> El marco está **implementado**: Neocom, barra de estado y las siete secciones.
> Lo que falta es el contenido de cada una, que llega con su fase.
>
> Ver también: [identidad visual](VISUAL.md) · [acciones](ACTIONS.md)

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

| Módulo      | Pestañas                             |
| ----------- | ------------------------------------ |
| Piloto      | Información · Habilidades · Bitácora |
| Nave        | Ficha · Equipamiento · Bodega        |
| Navegación  | Ubicación · Sistema · Galaxia        |
| Mercado     | Comprar · Vender · Mis órdenes       |
| Billetera   | _(sin pestañas)_                     |
| Propiedades | Bodegas · Naves                      |
| Mensajes    | Recibidos · Enviados                 |
| Corporación | Resumen · Miembros                   |

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
un token compartido (`TOPBAR_HEIGHT`) para que no se puedan separar. Lleva a los ocho módulos, **en una
lista plana**, y al pie —separada del resto— tiene la salida.

Se probó agruparlos en bloques con rótulo —Piloto, Operaciones, Social— y se
descartó: con ocho entradas, los rótulos ensucian más de lo que ordenan. Se
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

### El chat

> **La ventana está**, con contenido de maqueta. Lo que falta es que las líneas
> sean de verdad, que es el trabajo de F9.

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
  [arquitectura](ARCHITECTURE.md). Hoy sí, porque es una maqueta y no hay nada
  que sostener entre jugadores.

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

Vive en `src/lib/components/` y es reutilizable: en F15, cuando un jugador
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
