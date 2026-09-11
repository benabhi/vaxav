# Migración de Vaxav: de Reflex a SvelteKit

> Documento de trabajo. Dice qué se hizo, qué falta y qué hay que saber antes de
> seguir. Se borra el día que la migración termine.

## Por qué

Vaxav estaba escrito en **Reflex 0.9.10** (Python full-stack) y el framework se
volvió el cuello de botella: cada interacción viajaba por WebSocket al servidor,
el indicador de órdenes necesitaba una _tarea de fondo del servidor_ tickeando
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

| Capa             | Dónde                                     | Estado                                    |
| ---------------- | ----------------------------------------- | ----------------------------------------- |
| Reglas del juego | `src/lib/game/` — 16 módulos              | Verificado contra el original             |
| Esquema          | `src/lib/server/db/schema.ts` — 15 tablas | Migración inicial aplicada                |
| Servicios        | `src/lib/server/services/` — 7 módulos    |                                           |
| Siembra          | `scripts/sembrar.ts`                      | Idempotente, mismo conteo que el original |
| Tests            | 313, en `*.test.ts` junto al código       | `npm run test:unit -- --run`              |

**Las reglas del juego se verificaron numéricamente**, no a ojo: los 47 módulos,
los 5 cascos y el plano completo del sistema Ánfora se **generaron** importando
el Python original, y las hojas de rendimiento de `buildReadout` se compararon
campo por campo para los cinco cascos, con y sin habilidades. Dan idéntico.

### La interfaz

59 componentes en `src/lib/components/`: juego (13), tipografía (9), marco del
juego (7), paneles (7), formularios (6), medidores (4), disposición (4), marca
(3), botones (2), flotantes (2), íconos (2).

Pantallas terminadas y **verificadas midiendo los dos navegadores**:

| Pantalla                 | Verificación                                                                                                                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/` portada              | Logo 736×246 en top 137, botones 132×44 y 170×44 en top 587, lema 18,4 px con interletrado 4,048 px, pie en top 732                                                                                   |
| `/entrar`                | Campo 672×40 en (176, 224) con sangría de 11 px, título 24 px/3,36 px, botón 116×44 en top 376                                                                                                        |
| `/piloto`                | Pestañas en 208/344/476 con 132×36, 129×36 y 104×36; Neocom de 208 px; marca 207×52                                                                                                                   |
| `/piloto/habilidades`    |                                                                                                                                                                                                       |
| `/registro`              | Solapas de 36×92 solapadas 0,7 rem, tarjeta elegida con borde de 3 px en `#FF7A1A` sobre `rgba(255,122,26,.16)` y halo de 24 px                                                                       |
| `/opciones`              | Panel de 28 rem, campos de 40 px, y el cambio de contraseña probado de verdad: la vieja deja de entrar y la nueva entra                                                                               |
| `/navegacion` Ubicación  | Baldosa de 120 px en grilla de 1/2/3 columnas, proporción 2:1 entre las dos columnas, y a 320 px de ancho no se excede un solo elemento                                                               |
| `/navegacion/sistema`    | El brazo del codo cae en 422 y el centro de la casilla del ícono también; el tallo de un padre termina justo donde arranca el codo de su hijo, en la misma columna                                    |
| `/nave` Ficha            | Montar sube la potencia de 20 a 25 MW y baja la velocidad de 200 a 193; el interruptor de habilidades pasa el alcance de 2,7 a 3,2 al sin ir al servidor; el anillo queda cuadrado (295×295) a 380 px |
| Las 14 "en construcción" | Una por cada pestaña anunciada y sin construir                                                                                                                                                        |

**`/opciones` no dibuja barra de pestañas, y el original sí.** Es la única
diferencia deliberada de toda la migración. El original se contradice ahí:
`game_shell` documenta que un módulo de una sola pantalla no dibuja barra y
`pending.py` lo respeta —por eso Billetera no la tiene—, pero `options.py` le
pasa las pestañas sin preguntar y termina dibujando una barra con una sola
pestaña. Se eligió la regla, que es la que `hasTabs` ya codifica en
`navigation.ts`, y no el descuido. Si algún día se quiere la barra, es cambiar
`tabs.length > 1` en `GameShell`.

**`/registro` es la excepción al método**: `../vaxav-old/` ya no tiene su entorno
de Python, así que no se lo pudo levantar para comparar lado a lado. Se portó
leyendo la fuente y se midieron en el navegador nuevo los valores contra los
literales de `theme.py`, que es lo más cerca que se puede estar sin los dos
corriendo. Lo mismo va a pasar con lo que falta, salvo que se rearme el entorno:
`cd ../vaxav-old && python -m venv .venv && .venv/Scripts/pip install -r requirements.txt`.

El marco del juego está entero: Neocom con sus tres zonas, barra de estado con el
reloj UTC y el indicador de órdenes, barra de pestañas, chat y salida.

## Lo que falta

**Nada.** Las pantallas están todas, los tests también y la documentación ya no
menciona el framework anterior.

La verificación final que este documento pedía —el grep de `reflex`, `python`,
`sqlmodel`, `alembic` y `radix` sobre todo el repo— deja sólo cuatro aciertos, y
los cuatro son a propósito: dos en `src/lib/game/math.ts` y uno en `AGENTS.md`
explican por qué el balance no usa `Math.round`, y uno en
`src/lib/server/portraits.ts` explica por qué el reparto de caras no da lo mismo
que el original. No son rastros del framework: son el motivo de que el código sea
como es.

Este archivo ya cumplió y se puede borrar. Antes de hacerlo, mudar a algún lado
la sección "Pendiente de diseño": es lo único que queda vivo acá adentro.

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
│   ├── rig.ts               El anillo de equipamiento, para los dos lados
│   ├── routes.ts            Las URL, en español
│   ├── chat.ts              La maqueta del chat
│   ├── tipos.ts             Lo que viaja del servidor a la pantalla
│   ├── components/          Los 45 componentes
│   └── server/
│       ├── db/              Esquema, conexión y la base de los tests
│       ├── services/        Operaciones sobre la base
│       ├── portraits.ts     Recorre static/portraits/ y reparte caras
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
- Docstring en todo módulo y función pública, explicando el _porqué_
- Los componentes de interfaz son **siempre propios**, sin librerías de terceros
- Commits en español, imperativo, sin co-autores ni menciones a asistentes

## Pendiente de diseño, para cuando la migración termine

**El árbol del sistema en un teléfono.** Sus cuatro columnas de la derecha son de
ancho fijo y suman 16,75 rem; con el árbol, la casilla del ícono y el nombre, la
fila necesita 34 rem para no desalinearse. En 375 px eso no entra de ninguna
forma sin cambiar la forma de la fila.

Hoy **se desliza**, como la barra de pestañas: la geometría queda idéntica en
cualquier ancho y en teléfono se arrastra para llegar al botón de viajar. Es un
paliativo deliberado, no una vista de teléfono. El original ni siquiera hace eso
—desborda la página entera—, así que acá no hay nada que copiar: lo que venga es
diseño nuevo y se decide con la migración terminada.

**El marco del juego tampoco entra en un teléfono.** Abajo de unos 400 px, la
barra de estado y el chat se salen del ancho y hacen que la página entera se
desplace de costado. Es de antes de todo esto y le pasa a **todas** las pantallas
del juego, no a una: ninguna de las portadas nuevas aporta un solo píxel de
desborde. Se arregla junto con lo del árbol, que es el mismo problema.

Las dos salidas que quedaron sobre la mesa: **apilar** las cuatro columnas como
una fila de etiquetas debajo de la descripción, o **esconder** "Explorado" y
"Tipo" en angosto, que hoy dicen lo mismo en las trece filas.

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

### 5. Tailwind no ve un archivo nuevo hasta que se reinicia el servidor

Un componente recién creado se dibuja con las clases que ya existían en otra
parte y **sin las suyas propias**: las que sólo aparecen en ese archivo no están
en el CSS todavía. Se ve como un componente a medio estilar —altos que no son,
colores que faltan— y no como un error.

`npm run dev` de nuevo y listo. Antes de salir a buscar por qué una clase no
aplica, reiniciar.

Del mismo orden: **medir con el panel del navegador oculto devuelve valores
viejos**. La página no se redibuja mientras no se ve, así que `getComputedStyle`
contesta lo de antes del último cambio. Más de un "bug" de esta migración fue
eso.

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
npm run test:unit -- --run   # los 313
npm run check                # tipos
npm run lint                 # formato y reglas
```

Y revisar toda pantalla nueva a **375 px de ancho** antes de darla por terminada.

## Decisiones tomadas

|              |                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| Arquitectura | Monolito SvelteKit: `+page.server.ts` y form actions, Drizzle + better-sqlite3, `adapter-node`          |
| Base         | SQLite en desarrollo, en `data/`. Nada específico de SQLite: la portabilidad se sostiene con disciplina |
| Componentes  | Siempre propios. Sin bits-ui ni ninguna librería de terceros                                            |
| Tests        | La suite completa portada a Vitest                                                                      |
| TypeScript   | 6.0, no 7: `svelte-check` y `typescript-eslint` la rechazan. Cuando la soporten es cambiar un número    |
| Autoría      | Commits sin co-autores ni menciones a asistentes, como manda la regla 8                                 |

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
`choice_section`, `FACTION_ICONS` y `location_services` estaban declarados y sin
un solo uso. Varios los daba por pendientes este mismo documento, hasta que se
fue a buscar quién los llamaba y la respuesta fue nadie.

Dos correcciones más al propio documento, por si vuelven a confundir: `ActionTile`
no es de Ubicación sino de la pestaña Sistema, que lo usa para "Mostrar
ubicación"; y los retratos no podían ir en `src/lib/portraits.ts` porque recorren
el disco, así que viven en `src/lib/server/portraits.ts`. Su reparto es estable
pero **no da la misma cara que el original**: `blake2b` con `digest_size=8` no se
puede reproducir con lo que expone Node, y se usó sha-256 recortado.
