# Vaxav

Juego web multijugador de corte **idle**: se da una orden, corre un temporizador
y la acción se resuelve sola. Sin gráficos ni animaciones — todo es texto, al
estilo de los juegos de navegador de la vieja escuela (OGame, Travian), pero en
lugar de imperios manejás **un piloto espacial y su nave** en un sector abierto.

Construido con [SvelteKit](https://svelte.dev/docs/kit) y TypeScript de punta a
punta, sobre SQLite.

> Estado: **F2**. Se puede crear un piloto, entrar, ver su ficha y sus
> habilidades, recorrer el sistema, viajar entre cuerpos y armar la nave. Lo
> demás está anunciado y sin construir, y cada pantalla dice en qué fase llega.
> La hoja de ruta está en [`docs/DESIGN.md`](docs/DESIGN.md).

## Cómo levantarlo

Hace falta **Node 22.12+, 24 o 26**. La línea 25 no sirve: vitest la excluye a
propósito y el `.npmrc` del proyecto tiene `engine-strict=true`, así que
`npm install` se planta antes de bajar nada.

```bash
npm install
cp .env.example .env
npm run db:migrate && npm run db:seed
npm run dev
```

Queda en <http://localhost:5173>.

La siembra carga el universo —galaxia, sistemas y cuerpos— desde
`src/lib/game/universe.ts`. Es idempotente: se puede correr las veces que haga
falta. **Sin ella no se pueden crear pilotos**, porque no habría dónde ubicarlos.

## Base de datos

SQLite en `data/vaxav.db`, con [Drizzle](https://orm.drizzle.team). Nada
específico de SQLite: la portabilidad a PostgreSQL se sostiene con disciplina, no
con una capa de compatibilidad.

Después de cambiar el esquema en `src/lib/server/db/schema.ts`:

```bash
npm run db:generate
npm run db:migrate
```

## Comprobaciones

```bash
npm run test:unit -- --run   # los tests de unidad
npm run check                # tipos
npm run lint                 # formato y reglas
npm run test:e2e             # el humo de rutas, con su propia base
```

El humo levanta la aplicación compilada y recorre las 23 rutas: es el que atrapa
una pestaña declarada en el árbol de navegación y sin archivo de ruta.

## Estructura

```
├── drizzle/                 Migraciones del esquema
├── data/                    Base SQLite local (ignorada por git)
├── docs/DESIGN.md           Visión del juego, identidad visual y hoja de ruta
├── e2e/                     El humo de rutas
├── scripts/sembrar.ts       Carga el universo en la base
├── static/                  Fuentes, íconos y escudos, servidos tal cual
└── src/
    ├── app.css              El sistema de diseño entero: tokens, escala, global
    ├── hooks.server.ts      Resuelve la sesión una vez por pedido
    ├── lib/
    │   ├── game/            Reglas del juego. Sin base, sin SvelteKit
    │   ├── format.ts        De dato a texto: rótulos, íconos, romanos, miles
    │   ├── navigation.ts    El árbol de módulos y pestañas
    │   ├── rig.ts           El anillo de equipamiento, para los dos lados
    │   ├── routes.ts        Las URL, en español
    │   ├── tipos.ts         Lo que viaja del servidor a la pantalla
    │   ├── components/      Piezas de interfaz, todas propias
    │   └── server/
    │       ├── db/          Esquema, conexión y la base de los tests
    │       ├── services/    Operaciones sobre la base
    │       └── views/       Constructores de vista, puros y testeables
    └── routes/
        ├── (auth)/          Ingreso y alta. Guard inverso en su layout
        └── (game)/          Todo lo de adentro. Guard en su layout
```

Las fuentes y los íconos se sirven desde `static/`: la página no depende de
ningún servicio externo para dibujarse.

`src/lib/game/` **no está bajo `server/` a propósito**: son reglas puras y las
necesitan los dos lados —los rótulos, los catálogos de la pantalla de alta, la
hoja de rendimiento de la nave—, y bajo `$lib/server` SvelteKit prohíbe
importarlas desde el cliente.

## Convenciones

- **Código en inglés** (nombres de módulos, funciones y variables).
- **URL en español**: son parte de lo que ve el jugador.
- **Comentarios, documentación y textos del juego en español.**
- Los componentes de interfaz son **siempre propios**, sin librerías de terceros.

El resto de las reglas está en [`CLAUDE.md`](CLAUDE.md) y las trampas conocidas
en [`AGENTS.md`](AGENTS.md).
