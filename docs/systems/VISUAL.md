# Identidad visual

> Decidido e implementado. Los valores concretos viven en `src/app.css` y en
> `src/app.css`; este documento explica **por qué** son esos.
>
> Ver también: [interfaz del juego](INTERFACE.md) · [diseño general](../DESIGN.md)

## La referencia

**La interfaz de Vaxav imita la de Elite Dangerous lo más fielmente posible.**
Esto no es una inspiración suelta ni un punto de partida del que después se puede
derivar: es el objetivo declarado del proyecto. Naranja sobre casi negro, paneles
translúcidos con borde fino, esquinas rectas, mayúsculas espaciadas y un halo
suave en el texto encendido.

No es una cita decorativa. Ese HUD resuelve exactamente el problema que tiene
Vaxav: **mostrar mucha información numérica en pantalla sin que canse ni se
vuelva ilegible**. Un solo color de acento con tres intensidades alcanza para
jerarquizar veinte datos, y el fondo casi negro deja que el contenido sea lo
único que brilla.

Esto reemplaza a la identidad anterior (azul-noche con acento azul). El cambio se
tomó al ver que el juego iba a ser mucho más denso en datos de lo previsto.

## Cómo se diseña algo nuevo

Ante cualquier duda —un componente que no existe, un estado que no está previsto,
una pantalla nueva— **la respuesta es cómo lo resuelve Elite Dangerous**, no lo
que parezca razonable en abstracto. El método es siempre el mismo:

1. Buscar el equivalente en el juego. Las pantallas más útiles como referencia
   son los **servicios de estación** (paneles y mosaicos), el **outfitting**
   (solapas en punta de flecha, fichas de datos, tarjetas seleccionables), el
   **tablero de misiones** (filas densas, barras segmentadas, estados de color) y
   el **panel de la nave** (lecturas etiqueta-valor sobre fondo translúcido).
2. Copiar la solución, no la captura: traducirla a los tokens de `src/app.css`
   y a un componente reutilizable.
3. Si el juego no tiene ese caso, resolverlo con las reglas de abajo, que son las
   que se destilaron de él.

**Lo que se imita es el lenguaje visual, no los archivos.** En el repositorio no
hay ni va a haber assets de Frontier: las fuentes son alternativas libres a la
Eurostile del juego, los íconos son de Phosphor y el logotipo es propio.

## Reglas

1. **Un solo acento.** Naranja. Todo lo que importa es naranja en alguna de sus
   tres intensidades; lo que no, es gris cálido.
2. **El fondo no compite.** Casi negro con un rescoldo naranja arriba y un resto
   de azul abajo, fijo, sin texturas.
3. **Esquinas rectas.** Radio cero en todo el sistema. En el HUD del juego no hay
   una sola curva y es media personalidad de la interfaz.
4. **Seleccionado se llena.** Un elemento elegido pasa a naranja sólido con el
   texto casi negro. Esa inversión es lo que da la sensación de apretar algo.
5. **Mayúsculas para las etiquetas**, con el interletrado abierto. El texto
   corrido va en caja normal: en mayúsculas no se leen párrafos.
6. **El halo es sutil.** Si se nota como efecto, está de más.
7. **Sin modo claro.** La estética es de una sola pieza: en claro no queda otra
   versión, queda rota. El conmutador de tema se eliminó.

## Color

| Token                                      | Valor                   | Para qué                                                 |
| ------------------------------------------ | ----------------------- | -------------------------------------------------------- |
| `BACKGROUND`                               | `#05070A`               | El vacío                                                 |
| `ACCENT`                                   | `#FF7A1A`               | El naranja del HUD: acciones, bordes encendidos, títulos |
| `ACCENT_BRIGHT`                            | `#FFA45C`               | Valores y estados activos                                |
| `ACCENT_DIM`                               | `#B4550F`               | Etiquetas: presentes pero calladas                       |
| `ON_ACCENT`                                | `#0A0704`               | Texto sobre naranja sólido. Nunca blanco                 |
| `TEXT_STRONG` / `TEXT_BODY` / `TEXT_MUTED` | huesos y grises cálidos | Jerarquía del texto                                      |
| `SURFACE` → `SURFACE_STRONG`               | naranja al 5–16 %       | Paneles: dejan ver el fondo, como el HUD del juego       |
| `DATA_ACCENT`                              | `#4FD2EE`               | **Cian**: cifras y lecturas                              |
| `SUCCESS` · `WARNING` · `DANGER`           | verde · ámbar · rojo    | Estados, y sólo estados                                  |

El cian merece su párrafo: es el segundo color del juego —el del logotipo— y
queda reservado para **datos**. En un HUD naranja, un número en cian se encuentra
solo, sin subrayarlo ni agrandarlo.

## Tipografía

Elite Dangerous usa **Eurostile**, que es comercial. Las dos familias elegidas
son lo más cercano que hay libre, y se sirven desde el proyecto:

| Familia                      | Rol                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| **Rajdhani** (500/600/700)   | Títulos, etiquetas, botones y datos del HUD. Cuadrada, condensada, hecha para mayúsculas espaciadas |
| **Titillium Web** (400/600)  | Texto corrido. Es la que usaba la propia web de Frontier y aguanta párrafos                         |
| **JetBrains Mono** (400/500) | Cifras que tienen que alinearse en columna                                                          |

Tres interletrados, y son los que hacen que un texto "suene" a HUD:
`DISPLAY_TRACKING` 0.08em para títulos de tarjeta, `TITLE_TRACKING` 0.14em para
títulos de pantalla y `LABEL_TRACKING` 0.22em para etiquetas y botones.

## Íconos

[Phosphor](https://phosphoricons.com), descargados al proyecto, en sus seis
pesos. El peso da jerarquía sin cambiar de color: `duotone` para lo destacado,
`light` para lo mismo en reposo, `bold`/`fill` para los íconos chicos, `thin`
para lo decorativo grande.

## Medidores

El HUD del juego no dibuja porcentajes: dibuja **segmentos**.

- **Habilidades: cinco estrellas.** Llena por cada nivel alcanzado, media si hay
  avance hacia el siguiente, vacías las que faltan. Se lee de un vistazo lo que
  un número obliga a calcular. La regla es pura y está en `src/lib/format.ts`; la
  interfaz sólo dibuja.
- **Barras segmentadas** para lo que se cuenta en bloques (reputación, rangos).
- **Barras continuas** sólo para lo que sí es un porcentaje: un temporizador
  corriendo, una bodega llenándose.

Los niveles se escriben en **romanos** cuando hay que nombrarlos en una línea de
texto (`Minería II · Estiba II`), y en **estrellas** cuando tienen su propio
lugar en pantalla. Son dos representaciones del mismo dato para dos usos
distintos.

## Responsivo

**El juego tiene que poder jugarse desde un teléfono.** Es un juego de sesiones
cortas y frecuentes —entrar, ver qué se resolvió, dar la próxima orden— y eso
pasa en el bolsillo tanto como en el escritorio.

- Se diseña **primero para la pantalla chica**. Los puntos de corte son móvil
  primero: lo que se escribe sin prefijo es lo del teléfono, y `xs:`, `sm:` y los
  demás sólo agregan a medida que hay ancho.
- **Nada se desborda en horizontal.** Las grillas caen a una columna, los nombres
  largos cortan con elipsis, y lo que no entra se desplaza dentro de su propio
  contenedor.
- **Lo que depende del ancho lo decide el CSS**, no el estado. El Neocom es el
  caso testigo: que quede plegado en un teléfono es cuestión de ancho y vive en
  `src/app.css`; que el jugador lo prefiera plegado es una preferencia y
  vive en su navegador. Mezclarlas obliga a preguntarle al servidor por el tamaño
  de la pantalla, que es una pregunta que el servidor no puede responder.
- En pantallas chicas se esconde lo prescindible antes que apretarlo: en la barra
  de estado, primero se va el reloj y quedan la ubicación y los créditos.

## La portada

No es una página de producto: es la **intro del juego**. Logotipo grabado sobre
un campo de estrellas, las cuatro actividades como rótulo, una línea de
descripción y dos botones. Nada más; lo que hay que explicar se explica adentro.

El campo de estrellas son tres capas de puntos hechas con degradados repetidos
—ni una imagen ni un canvas— desplazándose muy despacio, y se detiene si el
sistema pide menos movimiento. El logotipo es un PNG con fondo transparente y se
apoya directamente sobre las estrellas; el halo cian no está en la imagen sino
que es una sombra proyectada, para que acompañe al destello del propio logotipo
sin quemarlo.

## Dónde vive cada cosa

- `src/app.css` — los tokens. Única fuente de verdad; ninguna página escribe
  un color a mano.
- `src/app.css` — sólo lo que no se puede expresar como prop: las fuentes,
  el fondo del documento, el foco, la selección y el campo de estrellas.
- `static/fonts/` y `static/icons/` — tipografía e íconos servidos por el propio
  proyecto: la página no depende de ningún servicio externo para dibujarse.
- `src/lib/components/` — los roles concretos. Una pantalla nueva elige rol, no
  tamaño ni color.
