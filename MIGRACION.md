# Migración de Vaxav: de Reflex a SvelteKit

> Documento de trabajo. Dice qué se hizo, qué falta y qué hay que saber antes de
> seguir. Se borra el día que la migración termine.

## Por qué

Vaxav estaba escrito en **Reflex 0.9.10** (Python full-stack) y el framework se
volvió el cuello de botella: cada interacción viajaba por WebSocket al servidor,
el indicador de órdenes necesitaba una *tarea de fondo del servidor* tickeando
una vez por segundo **por jugador**, y los props responsivos de Radix obligaban a
trampas documentadas en el propio `CLAUDE.md`. Para un juego pensado para mucha
gente en un universo compartido, eso no escala.

La migración lo pasa a **SvelteKit + TypeScript + TailwindCSS v4**, manteniendo
el estado funcional exactamente como estaba y la interfaz **idéntica píxel a
píxel**. No se agregan mecánicas ni pantallas: lo que existía existe igual, y lo
que estaba "en construcción" sigue en construcción.

El original vive al lado, en `../vaxav-old/`. Es la referencia contra la que se
compara todo. **Su entorno de Python ya no está**: quedó el código, no el
`.venv`.

## Arranque rápido

Hace falta **Node 22.12+, 24 o 26**. La línea 25 no sirve: vitest la excluye a
propósito y el `.npmrc` del proyecto tiene `engine-strict=true`, así que
`npm install` se planta antes de bajar nada.

```bash
npm install
npm run db:migrate && npm run db:seed
npm run dev
```

Queda en `http://localhost:5173`. La base es SQLite y vive en `data/`, fuera de
git.

Para comparar contra el original hay que rearmarle el entorno primero:

```bash
cd ../vaxav-old && python -m venv .venv && .venv/Scripts/pip install -r requirements.txt
.venv/Scripts/python.exe -m reflex run
```

Queda en `http://localhost:3000`. Los dos pueden correr a la vez. Aviso: al
original se le pierde la sesión si se escribe la URL a mano, hay que entrar y
moverse con el Neocom.

Un piloto de prueba se crea con el alta, o a mano:

```bash
npx tsx --env-file=.env -e "…createPilot(db, 'Halcon_7', 'halcon@ejemplo.com', 'contrasena-larga', 'miner', 'dominion')"
```

## Lo que está hecho

### El servidor, completo

| Capa | Dónde | Estado |
|---|---|---|
| Reglas del juego | `src/lib/game/` — 16 módulos | Verificado contra el original |
| Esquema | `src/lib/server/db/schema.ts` — 15 tablas | Migración inicial aplicada |
| Servicios | `src/lib/server/services/` — 7 módulos | |
| Siembra | `scripts/sembrar.ts` | Idempotente, mismo conteo que el original |
| Tests | 285, en `*.test.ts` junto al código | `npm run test:unit -- --run` |

**Las reglas del juego se verificaron numéricamente**, no a ojo: los 47 módulos,
los 5 cascos y el plano completo del sistema Ánfora se **generaron** importando
el Python original, y las hojas de rendimiento de `buildReadout` se compararon
campo por campo para los cinco cascos, con y sin habilidades. Dan idéntico.

### La interfaz

48 componentes en `src/lib/components/`: tipografía (9), paneles (7), marco del
juego (7), formularios (6), medidores (4), disposición (4), juego (3), marca (3),
botones (2), íconos (2), popover (1).

Pantallas terminadas y **verificadas midiendo los dos navegadores**:

| Pantalla | Verificación |
|---|---|
| `/` portada | Logo 736×246 en top 137, botones 132×44 y 170×44 en top 587, lema 18,4 px con interletrado 4,048 px, pie en top 732 |
| `/entrar` | Campo 672×40 en (176, 224) con sangría de 11 px, título 24 px/3,36 px, botón 116×44 en top 376 |
| `/piloto` | Pestañas en 208/344/476 con 132×36, 129×36 y 104×36; Neocom de 208 px; marca 207×52 |
| `/piloto/habilidades` | |
| `/registro` | Solapas de 36×92 solapadas 0,7 rem, tarjeta elegida con borde de 3 px en `#FF7A1A` sobre `rgba(255,122,26,.16)` y halo de 24 px |
| Las 14 "en construcción" | Una por cada pestaña anunciada y sin construir |

**`/registro` es la excepción al método**: `../vaxav-old/` ya no tiene su entorno
de Python, así que no se lo pudo levantar para comparar lado a lado. Se portó
leyendo la fuente y se midieron en el navegador nuevo los valores contra los
literales de `theme.py`, que es lo más cerca que se puede estar sin los dos
corriendo. Lo mismo va a pasar con lo que falta, salvo que se rearme el entorno:
`cd ../vaxav-old && python -m venv .venv && .venv/Scripts/pip install -r requirements.txt`.

El marco del juego está entero: Neocom con sus tres zonas, barra de estado con el
reloj UTC y el indicador de órdenes, barra de pestañas, chat y salida.

## Lo que falta

En este orden, que es el de menor a mayor riesgo.

### 1. `/opciones` — cambiar la contraseña

El más corto. `changePassword` ya existe y exige la contraseña actual.

- **Fuente**: `../vaxav-old/vaxav/pages/options.py`
- Falta cablear `SuccessCallout`, que ya está escrito

### 2. `/navegacion` — Ubicación

- **Fuente**: `../vaxav-old/vaxav/pages/navigation.py` (`navigation_location`) y
  `state/navigation.py`
- **Componentes que faltan**: `ModuleGrid`, `ModuleTile`, `ActionTile`
  (`components/mosaic.py`), `AgentCard` y `AgentPortrait` (`components/agents.py`)
- Falta portar `portraits.py` a `src/lib/portraits.ts`: recorre
  `static/portraits/` sólo por nombre de archivo y reparte con `blake2b` para que
  el reparto sea estable entre arranques
- El mosaico tiene **tres estados** por baldosa y hay que respetarlos: disponible,
  elegida (rellena de naranja) y no disponible (apagada, sin responder al clic)
- En tránsito la pestaña no describe la estación que ya se dejó atrás:
  `situation(...).inTransit` manda

### 3. `/navegacion/sistema` — el árbol del sistema

**La pantalla más frágil de todas.** El árbol se dibuja con cajas de 1 px y
columnas de ancho fijo; un píxel de más desalinea todo.

- **Fuente**: `../vaxav-old/vaxav/pages/navigation.py` (`navigation_system`), unas
  mil líneas
- `systemTree` ya devuelve los nodos aplanados con `depth`, `isLast` y
  `hasChildren`, que es la forma del árbol: la pantalla sólo dibuja
- Constantes que hay que copiar tal cual: `RAIL_WIDTH 1rem`,
  `CONNECTOR_CENTER 1.725rem`, `HEAD_HEIGHT 2.85rem`,
  `EXPLORATION_COL_WIDTH 5.25rem`, `KIND_COL_WIDTH 4.25rem`,
  `DISTANCE_COL_WIDTH 2.75rem`, `ACTION_BUTTON_WIDTH 4.5rem`
- Falta un `HoverCard` propio, hermano del `Popover` que ya está: lo usan los
  avisos del botón de viajar ("Ya hay una orden en curso", "Necesitás una nave")
- El popover de "ESTÁS AQUÍ" es **uno solo** para toda la pantalla, no uno por
  fila: con trece filas el posicionamiento se volvía errático
- "Mostrar ubicación" despliega los ancestros, lleva la vista a `#vaxav-aqui` y le
  pone la clase `vaxav-flash` por 1800 ms. La animación ya está en `app.css`
- Viajar es un form action que llama `startTravel`

### 4. `/nave` — el equipamiento

- **Fuente**: `../vaxav-old/vaxav/pages/ship.py` y `state/ship.py`
- **Componentes que faltan**: `FittingRig`, `SlotNode`, `ShipSchematic`,
  `IntegrityReadings` (`components/fitting_rig.py`), `SlotList`
  (`components/slot_list.py`)
- Las posiciones de las ranuras del anillo se calculan en el servidor con
  `math.radians(-90 + puesto * 360 / total)` y `RING_RADIUS = 39` (% del lado).
  Conviene una función pura en `src/lib/server/views/ship.ts`, así se puede probar
  como el resto
- Los tres anillos concéntricos: escudo 66 % **punteado** —gris si no hay
  generador—, blindaje 54 %, casco 42 %
- El esquema de la nave es un SVG propio de alambre, `viewBox="0 0 100 100"`, con
  el path del casco, las nervaduras y las toberas
- **Se guarda en cada cambio, no hay botón de aplicar**: `refit` ya es la puerta
  con llave y revierte si el servicio se niega
- El anillo y la lista comparten la ranura seleccionada

### 5. Los tests que faltan

- Los constructores de vistas (`src/lib/server/views/`), que es donde va a vivir
  la lógica de las filas del árbol y del anillo
- El humo de rutas con Playwright: visitar las 23 y comprobar que ninguna entrada
  del Neocom lleva a un 404

### 6. La documentación

Todavía **no se portó nada de `docs/`**, y es lo último que queda para que no haya
rastro de Reflex:

- `CLAUDE.md` — conservar los 8 principios, reescribir las rutas
  (`vaxav/components/` → `src/lib/components/`, `vaxav/theme.py` → `src/app.css`,
  `vaxav/game/` → `src/lib/game/`), cambiar la escala de Radix por la de Tailwind
  y PyPI por npm. **Agregar a §1 la regla de componentes propios.** §8, la de
  autoría, se conserva tal cual
- `AGENTS.md` — el original arranca con un bloque `<!-- reflex managed -->` que
  instala las skills de Reflex. Se borra entero y se reescribe
- `README.md` — instalación y puesta en marcha, todo nuevo
- `docs/systems/ARCHITECTURE.md` — la regla 9 y la sección "Escalar" hablan del
  estado de Reflex y de Redis; la tabla "Lo que ya está decidido" cambia sus dos
  primeras filas
- `docs/systems/VISUAL.md` e `INTERFACE.md` — referencias a props de Radix y a
  `theme.py`
- Los otros nueve `docs/systems/*.md` más `DESIGN.md`, `MVP.md` y `ROADMAP.md` son
  de diseño de juego: revisar con
  `grep -ri "reflex\|python\|sqlmodel\|alembic\|radix"` y corregir lo que aparezca

**Verificación final**: ese mismo grep sobre todo el repo, sin `node_modules`,
tiene que dar cero.

## Cómo está organizado

Las capas del original se conservan, que es la regla dura de `CLAUDE.md` y lo que
hace verificable la migración:

```
game/ (reglas puras) ← services/ (base de datos) ← load y actions ← componentes
```

```
src/
├── app.css                  El sistema de diseño entero: tokens, escala, global
├── app.html                 Precarga de las seis fuentes
├── hooks.server.ts          Resuelve la sesión una vez por pedido
├── lib/
│   ├── game/                Reglas puras. Sin base, sin SvelteKit
│   ├── format.ts            De dato a texto: rótulos, íconos, romanos, miles
│   ├── navigation.ts        El árbol de módulos y pestañas
│   ├── routes.ts            Las URL, en español
│   ├── chat.ts              La maqueta del chat
│   ├── tipos.ts             Lo que viaja del servidor a la pantalla
│   ├── components/          Los 45 componentes
│   └── server/
│       ├── db/              Esquema, conexión y la base de los tests
│       ├── services/        Operaciones sobre la base
│       └── views/           Constructores de filas, puros y testeables
└── routes/
    ├── (auth)/              Ingreso y alta. Guard inverso en su layout
    └── (game)/              Todo lo de adentro. Guard en su layout
```

**`game/` no está bajo `server/` a propósito.** Son reglas puras y las necesitan
los dos lados —los rótulos, los catálogos de la pantalla de alta—, y bajo
`$lib/server` SvelteKit prohíbe importarlas desde el cliente.

### Convenciones

- **Código en inglés**, comentarios y documentación **en español**
- **URL en español**: son parte de lo que ve el jugador
- Los grupos de rutas entre paréntesis van en inglés: no son URL
- Docstring en todo módulo y función pública, explicando el *porqué*
- Los componentes de interfaz son **siempre propios**, sin librerías de terceros
- Commits en español, imperativo, sin co-autores ni menciones a asistentes

## Trampas que costaron caro

Las cuatro que hay que tener presentes antes de escribir una línea de interfaz.

### 1. Los breakpoints de Reflex no son los de Radix ni los de Tailwind

`reflex_base/breakpoints.py` define `["30em", "48em", "62em", "80em", "96em"]`
con los nombres `xs, sm, md, lg, xl`. O sea **480, 768, 992, 1280 y 1536 px**. El
`md` es **992**, no 1024, aunque los componentes sean de Radix: `factorize()`
reemplaza el nombre por el valor de Reflex antes de pasárselo.

Y hay dos formas de escribirlos, que se traducen distinto:

- Una **lista** en un prop de estilo (`padding=["1rem", "1.25rem", "2rem"]`) mapea
  a `base, xs(480), sm(768), md(992), lg(1280)`. Una lista de tres valores es
  **base / xs / sm**, no base / sm / md
- **`rx.breakpoints(initial=..., md=...)`** usa los nombres directamente

Los de `app.css` ya están puestos con los valores de Reflex.

### 2. La escala de espaciado deja de ser lineal en el 5

Se alineó con la de Radix para que `spacing="5"` se traduzca a `gap-5`. Eso hace
que **`p-5` sean 1,5 rem y `p-6` sean 2**, no 1,25 y 1,5. Una medida de 1,25 rem
no está en la escala y se escribe `p-[1.25rem]`.

La regla práctica: un `spacing="N"` de Radix va como `gap-N`; un valor en rem
sacado del original va como valor literal salvo que coincida con la escala.
Escribir `h-7` esperando 1,75 rem da 2,5, y no se nota hasta que algo queda
corrido.

### 3. Python y JavaScript no redondean igual

`round()` de Python redondea **al par** (`round(2.5) == 2`), `//` divide con piso
e `int()` trunca. Están en las duraciones de viaje, los bonos, los puntos
efectivos y los presupuestos: o sea, en el balance.

`src/lib/game/math.ts` tiene `roundHalfEven`, `floorDiv` y `truncate`, y **toda**
regla del juego los usa donde el original usaba el operador equivalente. No usar
`Math.round` en nada que sea balance.

### 4. La escala de Radix está embebida en todo el original

`size="2"`, `spacing="3"`, `weight="medium"` no son valores literales. Las
equivalencias ya están resueltas en `app.css` (`--text-1` a `--text-9` con su
interlineado e interletrado, `--spacing-5` a `--spacing-9`). Un `rx.text(size="2")`
es `text-2`; un `rx.heading(size="5")` es `text-5` pero con el interlineado de
título, que es más corto.

## Cómo se verifica que quedó igual

No alcanza con mirar. El método que funcionó:

1. Levantar los dos, el original en 3000 y el nuevo en 5173
2. Abrir la misma pantalla en los dos
3. Medir en el navegador con `getBoundingClientRect` y `getComputedStyle` los
   elementos que importan: posición, tamaño, medida de letra, interletrado, color
4. Comparar los números

Así aparecieron el `bottom-5` que eran 1,5 rem en vez de 1,25 y los
`h-7` / `h-9` que estaban en la escala redefinida. A ojo, ninguno de los dos se
veía mal.

Además:

```bash
npm run test:unit -- --run   # los 285
npm run check                # tipos
npm run lint                 # formato y reglas
```

Y revisar toda pantalla nueva a **375 px de ancho** antes de darla por terminada.

## Decisiones tomadas

| | |
|---|---|
| Arquitectura | Monolito SvelteKit: `+page.server.ts` y form actions, Drizzle + better-sqlite3, `adapter-node` |
| Base | SQLite en desarrollo, en `data/`. Nada específico de SQLite: la portabilidad se sostiene con disciplina |
| Componentes | Siempre propios. Sin bits-ui ni ninguna librería de terceros |
| Tests | La suite completa portada a Vitest |
| TypeScript | 6.0, no 7: `svelte-check` y `typescript-eslint` la rechazan. Cuando la soporten es cambiar un número |
| Autoría | Commits sin co-autores ni menciones a asistentes, como manda la regla 8 |

## Lo que mejoró con el cambio

Nada de esto toca el juego: las reglas, los números y las pantallas quedan
idénticos.

- **El reloj de órdenes es del navegador.** El servidor manda el instante en que
  arrancó y cuánto dura; el cliente cuenta y al vencer pide que se resuelva. Se
  fue la tarea de fondo por jugador, que era lo que peor escalaba
- **El estado de interfaz vive en el cliente.** Plegar una rama o cambiar de sala
  del chat ya no es una ida y vuelta al servidor
- **La cookie de sesión es `httpOnly` y `secure`.** Antes el token era legible por
  cualquier script
- **Una orden se resuelve exactamente una vez.** `resolveIfDue` se queda con la
  fila antes de repartir nada, con un borrado condicional que devuelve lo que
  borró. Es lo que pide la regla 5 de `ARCHITECTURE.md` y el código anterior no
  cumplía
- **Las claves foráneas están activas**, más los índices únicos en
  `(pilot_id, skill)`, `(ship_id, slot_index)` y `(station_id, service)`. El
  código ya los trataba como invariantes; ahora la base los hace cumplir
- **Los instantes se guardan como enteros en UTC**, así que desaparece el parche
  de reponerle el huso horario a lo que sale de la base

### Lo que expresamente no se tocó

No se agregaron pantallas ni mecánicas, no se completó nada de lo que está en
construcción y no se movió el balance. El azul del fondo del documento sigue sin
coincidir con `DATA_ACCENT`, porque así estaba. Lo que sí se sacó fue el código
muerto: `vaxav-pulse`, `RADIUS_PILL`, `reset_fit`, `has_ship`, `pilots_in`,
`choice_section` y `FACTION_ICONS` estaban declarados y sin un solo uso. Los dos
últimos los daba por pendientes este mismo documento, hasta que se fue a buscar
quién los llamaba y la respuesta fue nadie.
