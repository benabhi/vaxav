# Vaxav

Juego web multijugador idle y textual: un piloto espacial y su nave. La visión y
la hoja de ruta están en `docs/DESIGN.md`; leerlo antes de agregar mecánicas.

## Entorno

Proyecto SvelteKit plano, **sin Docker**. Hace falta **Node 22.12+, 24 o 26**: la
línea 25 no sirve —vitest la excluye a propósito y el `.npmrc` tiene
`engine-strict=true`, así que `npm install` se planta antes de bajar nada.

```bash
npm install
cp .env.example .env
npm run db:migrate && npm run db:seed
npm run dev
```

Queda en `http://localhost:5173`. La base es SQLite, vive en `data/` y está fuera
de git.

|                              |                                          |
| ---------------------------- | ---------------------------------------- |
| `npm run dev`                | El servidor de desarrollo                |
| `npm run check`              | Tipos, con `svelte-check`                |
| `npm run lint`               | Formato y reglas                         |
| `npm run format`             | Arregla el formato                       |
| `npm run test:unit -- --run` | Los tests de unidad                      |
| `npm run test:e2e`           | El humo de rutas, con su propia base     |
| `npm run db:generate`        | Una migración nueva a partir del esquema |
| `npm run db:migrate`         | Aplica las migraciones pendientes        |
| `npm run db:seed`            | Carga el universo. Idempotente           |

## Flujo de trabajo

Rama local por feature, con commits chicos. Las ramas **no se pushean**: se
mergean a `main` con `--no-ff` cuando el trabajo está aprobado, se pushea `main` y
la rama se borra. En GitHub existe solamente `main`.

## Convenciones

- **Código en inglés**: módulos, funciones y variables. **Las URL en español**:
  son parte de lo que ve el jugador. Los grupos de rutas entre paréntesis van en
  inglés, porque no son URL.
- **Comentarios, documentación y textos del juego en español.**
- `src/lib/game/` no importa SvelteKit ni la base de datos: son reglas puras y
  testeables. La interfaz y los servicios la consumen, nunca al revés. **No está
  bajo `server/` a propósito**: la necesitan los dos lados, y bajo `$lib/server`
  SvelteKit prohíbe importarla desde el cliente.
- Las capas van en un solo sentido: `game/` (reglas puras) ← `services/`
  (operaciones sobre la base) ← `views/` (constructores de vista) ← `load` y form
  actions ← componentes. `services/` recibe la conexión como primer argumento,
  para poder probarse contra una base en memoria.
- **El estado de interfaz vive en el navegador.** Plegar una rama del árbol,
  elegir una ranura del anillo o cambiar de sala del chat no son escrituras. Lo
  que cambia la partida va por un form action.
- Las acciones con temporizador se resuelven de forma perezosa: se guarda el
  inicio y la duración, y se calcula al consultar. No hay ningún bucle de tick ni
  tarea de fondo por jugador; la cuenta regresiva la lleva el navegador.
- El esquema se cambia con Drizzle (`npm run db:generate` y `npm run db:migrate`),
  nunca a mano.
- Los íconos son de [Phosphor](https://phosphoricons.com), descargados en
  `static/icons/<peso>/`, y se usan con el componente `Icon`. No sumar otra
  familia de íconos ni tirar de un CDN.
- **Los componentes de interfaz son siempre propios**, sin librerías de terceros.
- **Toda pantalla importante tiene su figura**: un dibujo propio que informa por
  su forma —el anillo de la nave, el árbol del sistema, el hexágono del piloto—,
  hecho a mano en SVG o en cajas y sin librerías de gráficos. Una por pantalla,
  siempre con su lista al lado. Ver CLAUDE.md §2.
- **La interfaz imita el HUD de Elite Dangerous lo más fielmente posible.** Ante
  cualquier duda de diseño, la respuesta es cómo lo resuelve ese juego, no lo que
  parezca razonable. No tiene modo claro. Los tokens están en `src/app.css` y el
  porqué en `docs/systems/VISUAL.md`.

## Trampas conocidas

- **La escala de espaciado no es lineal a partir del 5.** `p-5` son 1,5 rem y
  `p-6` son 2, no 1,25 y 1,5. Una medida que no esté en la escala se escribe
  literal: `h-[2.25rem]`. Escribir `h-9` esperando 2,25 rem da 4, y no se nota
  hasta que algo queda corrido.
- **Los puntos de corte son los de Vaxav, no los de Tailwind**: `xs` 480, `sm`
  768, `md` 992, `lg` 1280, `xl` 1536. El `md` es 992, no 1024.
- **Tailwind no ve un archivo nuevo hasta que se reinicia el servidor.** Un
  componente recién creado se dibuja con las clases que ya existían en otra parte
  y sin las suyas propias: parece a medio estilar y no da ningún error. Antes de
  salir a buscar por qué una clase no aplica, reiniciar `npm run dev`.
- **Nada de `Math.round` en el balance.** Python redondea al par y trunca
  distinto; `src/lib/game/math.ts` tiene `roundHalfEven`, `floorDiv` y `truncate`,
  y toda regla del juego usa el que corresponde.
- Los instantes se guardan como enteros en UTC. No hay husos horarios dando
  vueltas por la base.
- El `color` de `ProgressBar` es un color CSS —`var(--color-danger)`—, no una
  clase de Tailwind.
- Para medir una pantalla en el navegador, el panel tiene que estar **visible**:
  con el panel oculto la página no se redibuja y `getComputedStyle` devuelve
  valores viejos.
