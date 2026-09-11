@AGENTS.md

# Principios del proyecto

**Estas reglas tienen prioridad sobre cualquier criterio por defecto.** Si una
solución rápida las viola, no es la solución: se hace bien o se plantea antes de
escribirla.

## 1. Componentes reutilizables primero

- Antes de escribir interfaz nueva, buscar en `src/lib/components/` si ya existe
  algo que sirva. **Reutilizar o extender antes que duplicar.**
- Si un bloque visual aparece por segunda vez, deja de ser código de página: se
  extrae a `src/lib/components/` con un nombre claro y props explícitas.
- Las páginas de `src/routes/` componen, no maquetan: arman la pantalla a partir
  de componentes, sin resolver detalles de estilo por su cuenta.
- **Los componentes de interfaz son siempre propios.** Nada de librerías de
  terceros: ni bits-ui, ni Melt, ni un paquete de íconos con su propio CSS. Un
  componente ajeno trae sus decisiones visuales, y acá el lenguaje visual es el
  producto. Lo que haga falta se escribe, y por eso existen `Popover` y
  `HoverCard` propios sobre la API del navegador.
- Lo mismo aplica fuera de la interfaz: reglas del juego en `src/lib/game/`,
  acceso a datos en `src/lib/server/services/`. Nada de lógica de juego copiada
  dentro de un `load` o de un form action.

## 2. Homogeneidad visual

- **La interfaz de Vaxav imita la de [Elite Dangerous](https://www.elitedangerous.com)
  lo más fielmente posible.** No es una inspiración suelta ni un punto de
  partida: es el objetivo. Naranja sobre casi negro, paneles translúcidos,
  esquinas rectas, mayúsculas espaciadas y halo suave. Toda pantalla nueva tiene
  que parecer sacada de ese juego.
- **Ante una duda de diseño, la respuesta es cómo lo resuelve Elite Dangerous**,
  no lo que parezca razonable en abstracto. Antes de inventar un componente,
  buscar cómo se ve el equivalente en el juego —sus pantallas de estación,
  outfitting, tablero de misiones y mapa galáctico— y copiar esa solución.
- Lo que se imita es el **lenguaje visual**, no los archivos: nada de assets de
  Frontier en el repositorio. Fuentes, íconos y logotipo son propios o libres.
- **No hay modo claro.** La estética es de una sola pieza; no agregar uno.
- Los valores compartidos (fuente, espaciados, escalas de tamaño, colores) se
  definen en un único lugar y se referencian; **nunca** se hardcodean sueltos en
  una página. Viven en `src/app.css`, dentro de `@theme`.
- Usar la escala del sistema de diseño (`text-1` a `text-9`, `gap-3`,
  `tracking-label`) en lugar de píxeles arbitrarios. **Ojo con el espaciado: del
  5 en adelante deja de ser lineal**, así que `p-5` son 1,5 rem y `p-6` son 2. Una
  medida que no esté en la escala se escribe literal: `h-[2.25rem]`.
- **Seleccionado se llena**: lo elegido pasa a naranja sólido con texto casi
  negro. Es la inversión que da la sensación de apretar algo.
- Toda pantalla pública se envuelve con `PageShell` y toda pantalla del juego con
  el layout de `(game)`, salvo que haya una razón explícita para no hacerlo.
- **Los íconos son de [Phosphor](https://phosphoricons.com), siempre.** No se
  mezclan familias de íconos: un set distinto en una pantalla se nota aunque el
  jugador no sepa por qué. Se sirven desde `static/icons/` —descargados, nada de
  CDN— y se usan con el componente `Icon`, nunca como `<img>`, para que tomen el
  color del texto.
- **Los seis pesos de Phosphor son parte del vocabulario**, no un adorno:
  `duotone` para lo destacado, `light` para lo mismo en reposo, `bold` o `fill`
  para los íconos chicos de interfaz, `thin` para lo decorativo grande. El peso
  da jerarquía sin agregar un color.

## 3. Responsivo, siempre

- **El contenido tiene que verse bien en teléfono y en tableta**, no sólo en
  escritorio. No es un extra que se acomoda al final: una pantalla que sólo
  funciona en monitor está a medio hacer.
- **Se piensa primero en la pantalla chica.** Los puntos de corte son móvil
  primero: lo que se escribe sin prefijo es lo del teléfono, y `xs:`, `sm:`,
  `md:` y `lg:` sólo agregan a medida que hay ancho.
- **Nada se desborda en horizontal.** Las grillas caen a una columna, los textos
  largos cortan con elipsis y las tablas anchas se desplazan dentro de su propio
  contenedor, nunca arrastrando la página entera.
- **Lo que depende del ancho de pantalla lo decide el CSS, no el estado.** Que el
  Neocom quede plegado en un teléfono es una cuestión de cuánto ancho hay; que el
  jugador lo prefiera plegado es una preferencia. Son dos cosas distintas y se
  resuelven en dos lugares distintos.
- **Los objetivos táctiles se pueden tocar con el dedo**: nada de botones de
  doce píxeles ni acciones que dependan de pasar el mouse por encima, porque en
  un teléfono no hay mouse.
- Antes de dar algo por terminado, mirarlo a **375 px de ancho**.

## 4. Código limpio, profesional, escalable y mantenible

- Nombres descriptivos en inglés; nada de abreviaturas crípticas ni `data`,
  `info`, `tmp` como nombre de algo importante. **Las URL sí van en español**:
  son parte de lo que ve el jugador.
- Funciones cortas, con una responsabilidad. Si hace falta un comentario para
  explicar qué hace un bloque, probablemente ese bloque sea una función.
- **Comentario en español en todo módulo, función pública y componente**,
  explicando el _por qué_ además del _qué_.
- Tipado estático en firmas públicas. `any` no es una respuesta.
- Nada de números mágicos: constantes con nombre, arriba del módulo.
- El código tiene que soportar crecer: pensar dónde va a vivir la sexta pantalla
  o la vigésima acción del juego antes de acomodar la segunda.

## 5. Buenas prácticas y patrones

- **KISS**: la solución más simple que resuelva el problema real. Nada de
  abstracciones "por si acaso".
- **DRY**: una regla del juego, un solo lugar donde vive. Duplicar conocimiento
  es un bug esperando.
- **YAGNI**: no se construye lo que todavía no hace falta; se deja el camino
  abierto, no la carretera hecha.
- **Separación de capas**, en un solo sentido:

  ```
  game/ (reglas puras) ← services/ (base) ← views/ ← load y form actions ← componentes
  ```

  `src/lib/game/` no conoce SvelteKit ni la base de datos. **No está bajo
  `server/` a propósito**: son reglas puras y las necesitan los dos lados, y bajo
  `$lib/server` SvelteKit prohíbe importarlas desde el cliente.

- **El estado de interfaz vive en el navegador.** Plegar una rama, elegir una
  ranura o cambiar de sala del chat no son escrituras y no tienen por qué costar
  una ida y vuelta. Lo que cambia la partida sí va al servidor, por un form
  action.
- **Fail fast**: validar en el borde y fallar con un mensaje claro, en vez de
  arrastrar estado inconsistente.
- Preferir funciones puras y testeables donde haya reglas de negocio.

## 6. Tecnologías al día

- Usar siempre la **última versión estable disponible** de cada tecnología
  (SvelteKit, Svelte, TypeScript, Tailwind, Drizzle, Node) al momento de
  incorporarla, y mantenerlas actualizadas después. Nada de fijar una versión
  vieja "porque funciona".
- Antes de agregar o actualizar una dependencia, **verificar cuál es la última
  versión real** (npm, changelog del proyecto) en vez de asumirla de memoria.
- **Antes de escribir código contra una API, consultar la documentación oficial
  vigente**, no la memoria: los frameworks cambian rápido y una firma
  desactualizada cuesta más que el minuto que lleva verificarla.
- Si la documentación publicada contradice un aviso de deprecación de la versión
  instalada, **manda el aviso del framework**: la doc suele ir atrás.
- Las versiones se fijan en `package.json` y el candado se versiona, para que el
  entorno sea reproducible. Se suben de versión a propósito, revisando el
  changelog — no se dejan flotando.
- Atender los avisos de deprecación en cuanto aparecen: si el framework dice que
  algo se va en la próxima mayor, se migra ahora, no cuando rompa.

## 7. Flujo de trabajo con git

- Cada feature va en una **rama local**, con commits chicos y temáticos: uno por
  bloque de cambio, y cada uno cuenta una sola cosa.
- **Las ramas de trabajo no se pushean.** Se quedan en local hasta que benabhi
  revisa el resultado y está de acuerdo.
- Recién entonces: **merge local a `main` con `--no-ff`**, push de `main`, y la
  rama se borra.
- **En GitHub existe solamente `main`.** El remoto no junta ramas viejas.
- Antes de mergear, verificar que la rama esté contenida en `main` y borrarla con
  `git branch -d`, que es el que se niega si algo quedó afuera.

## 8. Autoría del repositorio

El proyecto es de benabhi y **sólo** de benabhi.

- **Nunca** agregar `Co-Authored-By: Claude` ni ningún otro co-autor en los
  commits.
- **Nunca** incluir "Generated with Claude Code", firmas, emojis de bot ni
  menciones a Claude o a asistentes de IA en mensajes de commit, descripciones
  de PR, README ni ningún archivo versionado.
- Los mensajes de commit se escriben en español, en modo imperativo, explicando
  el porqué del cambio.
