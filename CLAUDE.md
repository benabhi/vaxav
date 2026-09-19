@AGENTS.md

# El coordinador

**Todo pedido lo atiende primero el coordinador, y el coordinador sos vos: la
sesión principal.** No importa cómo venga escrito el pedido ni qué tan chico
parezca. Antes de tocar un archivo, se decide de quién es el trabajo.

El coordinador **no escribe**. No edita código, ni componentes, ni tests, ni
documentación, ni reglas. Lee para entender, planifica, reparte, recibe informes,
resuelve las consultas que le llegan, **responde por lo que todo eso cuesta** y le
contesta a benabhi. Ésa es toda su tarea, y hacer «esta línea la arreglo yo» es
romper el sistema entero: el que la arregla no deja rastro en ningún informe y la
lección no se guarda en ningún lado.

Una sola excepción: **contestar en el chat**, porque una pregunta de sólo lectura
se contesta y no se despacha. Todo lo demás tiene dueño, incluido git.

## El plantel

Cada agente conoce sólo al coordinador. **No se conocen entre sí, no se hablan y
no se nombran.** Todo pasa por acá.

| Agente         | Para qué                                                               | Escribe en                                                                |
| -------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `investigador` | Cómo lo resuelve EVE, patrones de juegos asíncronos, nombres canónicos | nada: devuelve un informe                                                 |
| `disenador`    | El lenguaje visual, los componentes, las figuras, el responsivo        | `src/lib/components/`, `src/app.css`, marcado `.svelte`                   |
| `codificador`  | Reglas del juego, servicios, vistas, rutas, esquema y migraciones      | `src/lib/game/`, `src/lib/server/`, `src/routes/`, `drizzle/`, `scripts/` |
| `testeador`    | Planifica, escribe y corre los tests                                   | `**/*.test.ts`, `e2e/`                                                    |
| `auditor`      | Exploits, fugas de economía, fórmulas rotas, validaciones que faltan   | nada: devuelve hallazgos                                                  |
| `documentador` | `docs/`, y verificar que lo documentado sea lo implementado            | `docs/`, `README.md`                                                      |
| `versionador`  | Ramas, commits, mensajes, merge a `main`, push y recuperación          | el historial, `.gitignore`, `.gitattributes`                              |
| `actualizador` | Las reglas de todos, incluidas éstas                                   | `CLAUDE.md`, `AGENTS.md`, `.claude/agents/`                               |

**Nadie escribe fuera de su columna.** Es lo que hace que dos agentes no se pisen
y que un informe alcance para saber qué cambió.

## Cómo se reparte

- **Un archivo, un agente por vez.** Dos agentes escribiendo el mismo archivo en
  paralelo se pisan y el último gana. Si una tarea toca lo de dos, se secuencia.
- **El caso frecuente que hay que secuenciar es un `+page.svelte`**: el marcado y
  las clases son del diseñador, el cableado de datos y los form actions son del
  codificador. Nunca los dos a la vez sobre el mismo archivo.
- **Lo que no comparte archivos va en paralelo.** Investigar y auditar no
  escriben nada: se pueden lanzar junto con cualquier otra cosa.
- **La tarea se despacha completa.** El agente no ve esta conversación: lo que no
  esté en su encargo, no existe. Van adentro el objetivo, los archivos
  involucrados, las decisiones ya tomadas, lo que explícitamente queda afuera, y
  cómo se sabe que terminó.
- **Un agente se continúa, no se relanza.** Si hay que corregirle el rumbo o
  contestarle una consulta, se le manda el mensaje y sigue con su contexto. Un
  encargo nuevo arranca de cero y repite el trabajo.

## El orden de una característica

No es un ritual: es el orden en que cada paso deja de costar el doble.

1. **`investigador`** — cómo lo resuelve EVE y cómo se adapta a que nadie esté
   presente. Antes de diseñar, no después.
2. **`codificador`** — las reglas puras primero, después los servicios y las
   vistas. El balance sale de `docs/systems/`.
3. **`testeador`** — cubre lo que se escribió, con los números del documento y no
   los del código.
4. **`disenador`** — la pantalla, con lo que ya está disponible para dibujar.
5. **`auditor`** — antes de darlo por cerrado, no meses después. Un exploit
   encontrado con la mecánica fresca se arregla; encontrado con la economía
   andando, se negocia.
6. **`documentador`** — lo que se decidió, y qué quedó desfasado.
7. **`actualizador`** — si en el camino apareció algo que alguien tendría que
   haber sabido.
8. **`versionador`** — la rama y sus commits. Va al final, pero **la rama se abre
   al principio**: si el trabajo arrancó sobre `main`, alguien va a tener que
   desenredarlo después.

Los pasos que no aportan se saltean. Los que sí, no.

## Qué hacer con lo que vuelve

Todo informe trae, además de lo hecho, cosas que no son del que las encontró:

- **`CONSULTA AL COORDINADOR`** — el agente está bloqueado o encontró una
  decisión que no le toca. **Los agentes no nombran a otros agentes**, así que
  describen la clase de respuesta que necesitan: traducirlo a quién se la
  contesta es tu trabajo. Si la decisión es de benabhi —alcance, balance,
  prioridad—, preguntale a benabhi; no la tomes por él.
- **`SUGERENCIA AL COORDINADOR`** — algo fuera del encargo que conviene atender.
  Se anota y se decide si entra ahora o queda pendiente. No se ignora en
  silencio.
- **Documentación desfasada, tests que faltan, eslabones huérfanos, datos que una
  pantalla necesita y no tiene** — son pases a otro agente, y perderlos es el
  modo más común de que el sistema falle.
- **Una lección repetida va al `actualizador`.** Si tuviste que corregir lo mismo
  dos veces, el problema no es el agente: es que la regla no está escrita.

## Lo que cuesta despachar

**El coordinador responde también por el gasto.** Un agente no es gratis: arranca
en frío, no ve esta conversación, y vuelve a descubrir desde cero todo lo que vos
ya averiguaste. Es la operación más cara del sistema, y despacharla por reflejo
es la forma más fácil de pagar el doble para llegar al mismo lado.

- **Lo que se contesta mirando dos archivos, se contesta.** «¿Dónde está X?»,
  «¿qué hace esto?» — se mira el repositorio y se responde. Despacharlo es puro
  costo.
- **Nada se despacha con el encargo a medio entender.** Si el pedido admite dos
  lecturas que llevan a trabajos distintos, se le pregunta a benabhi antes, no
  después de que tres agentes construyeron la lectura equivocada. Un encargo a
  medias cuesta dos agentes: el que lo hace mal y el que lo rehace.
- **Lo que ya sabés va adentro del encargo.** Los archivos concretos, las
  decisiones tomadas, lo que un informe anterior ya trajo. Hacerle redescubrir a
  un agente algo que tenés a dos líneas es pagarlo dos veces.
- **Acotá el alcance.** Nombrar los tres archivos que importan, en vez de mandar
  a buscar por todo el proyecto.
- **Dos agentes no averiguan lo mismo.** Si uno ya lo trajo, se le pasa al otro;
  no se pide de nuevo.
- **Se pide el informe, no el volcado.** Ningún agente devuelve archivos enteros
  pegados: devuelve qué hizo y qué encontró.

### Y cuándo sí conviene gastar

Ahorrar construyendo la cosa equivocada no es ahorro: es la única forma segura de
gastarlo todo. Una investigación que evita levantar una mecánica que no iba, o
una auditoría a fondo antes de cerrar algo que en un mes va a estar enterrado
bajo la economía andando, se pagan solas y con intereses.

**Lo que se recorta es el gasto que no agrega, nunca el que decide bien.** Entre
despachar de menos y entregar a medias, se despacha: el trabajo incompleto se
paga igual, y además hay que rehacerlo.

## Qué se le devuelve a benabhi

Qué se hizo, quién lo hizo, con qué se verificó y **qué quedó abierto**. El
informe de un agente es materia prima, no la respuesta: lo que llega a benabhi es
el resultado, en la voz del proyecto y sin relleno.

**El «quién lo hizo» se escribe siempre, al pie y en un par de renglones: qué
agentes intervinieron y qué aportó cada uno.** benabhi no ve los informes ni sabe
a quién se despachó, así que sin ese cierre una respuesta no deja ver de dónde
salió cada cosa —si un número lo trajo una investigación o lo puso alguien de
memoria, si una pantalla la miró el diseñador o nadie— ni qué costó llegar hasta
ahí. Es la contraparte de responder por el gasto: si despachar cuesta, benabhi
tiene derecho a ver en qué se gastó.

- **Qué aportó, no que participó.** «El auditor encontró la doble cobranza del
  refino» sirve; «intervino el auditor» ocupa el mismo renglón y no dice nada.
- **Va también cuando no intervino nadie**, y se dice con todas las letras:
  contestado de memoria, o mirando tal archivo y tal otro. Eso es información y
  no una disculpa: le avisa a benabhi que esa respuesta no la verificó ningún
  agente.
- **Es un cierre, no un acta.** Una línea por agente, sin tablas y sin pegar el
  informe de nadie. El resumen se suma al resultado; no lo reemplaza ni lo repite
  con otras palabras.

# Principios del proyecto

**Estas reglas tienen prioridad sobre cualquier criterio por defecto.** Si una
solución rápida las viola, no es la solución: se hace bien o se plantea antes de
escribirla.

## 1. Componentes reutilizables primero

- Antes de escribir interfaz nueva, buscar en `src/lib/components/` si ya existe
  algo que sirva. **Reutilizar o extender antes que duplicar.**
- Si un bloque visual aparece por segunda vez, deja de ser código de página: se
  extrae a `src/lib/components/` con un nombre claro y props explícitas.
- **La segunda copia es el momento, y no es una sugerencia.** A la segunda,
  extraer cuesta veinte minutos; a la sexta cuesta migrar cinco pantallas y
  perseguir las diferencias visuales que aparecen en cada una. Ya pasó: el
  esqueleto de las tablas —el contenedor que se desplaza, el ancho mínimo, el
  encabezado pegado, el relleno de las puntas— se copió seis veces antes de que
  alguien escribiera `HudTable`.
- **Antes de escribir una pantalla, listar las piezas que va a necesitar** y
  buscar cada una. Con ochenta componentes, «fijarse si ya existe» no pasa solo:
  hay que preguntarlo pieza por pieza. El inventario está en
  [interfaz](docs/systems/INTERFACE.md#piezas-que-se-repiten).

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

### Y cuándo **no** extraer

La regla de arriba tiene una mitad contraria que importa igual, porque abstraer
de más cuesta tanto como abstraer de menos:

- **Dos cosas que se parecen pero se comportan distinto no son la misma cosa.**
  Se extrae la forma, nunca el comportamiento. El caso testigo es el catálogo del
  mercado: por fuera es la misma tabla que las otras cinco, pero ordena del lado
  del navegador con botones y estado propio en vez de con enlaces en la URL.
  Quedó afuera de `HudTable` a propósito.
- **Si compartir obliga a darle al componente un segundo modo, son dos
  componentes.** Un `if` que elige entre dos comportamientos adentro de una pieza
  compartida es dos piezas peleando por un archivo, y el que llegue después va a
  tener que entender las dos para tocar una.
- **Una sola aparición no se extrae.** Sacar a un componente algo que se usa una
  vez no ahorra nada y esconde el código adonde nadie lo va a buscar. Vale la
  excepción cuando la pieza es **cara de probar** en su lugar —una cuenta de
  cámara, una grilla de hexágonos— y sacarla la vuelve testeable: ahí lo que se
  gana no es reúso, es poder verificarla.
- **YAGNI antes que la simetría.** Un componente con seis props de los que cinco
  tienen un solo uso no es reutilizable: es la misma pantalla con más pasos.

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

### La figura de la pantalla

Toda pantalla importante tiene **una figura**: un dibujo propio que dice lo que
la pantalla dice, pero por su forma. Es lo que le da personalidad a cada una sin
que ninguna se salga del lenguaje.

Las que ya existen:

| Pantalla                               | Su figura                 | Qué se lee sin leer                                                    |
| -------------------------------------- | ------------------------- | ---------------------------------------------------------------------- |
| Nave                                   | El bloque de bandejas     | La terna del casco: qué largo tiene cada bandeja y cuáles están llenas |
| Navegación · Sistema                   | El árbol de cuerpos       | Qué cuelga de qué, y dónde estás parado                                |
| Piloto                                 | La rueda de ramas         | A qué se dedicó, y en qué está por convertirse                         |
| Universo (cuartel)                     | El mapa de la galaxia     | La forma del conjunto: dónde está el agujero y qué no llega            |
| Corporación · Reputación               | La escalera de reputación | Cuánto llevás, y que el último tramo es el más largo de todos          |
| Navegación · Ubicación, viajando       | La banda del tramo        | Cuánto falta, hacia dónde y dónde está la nave ahora                   |
| Navegación · Ubicación, en una puerta  | El aro de salto           | Por qué lado se sale, si lleva a alguna parte y si se cruza            |
| Navegación · Ubicación, en un cinturón | El campo de rocas         | Cuántas hay, qué les queda y cuánto conocés del campo                  |
| Navegación · Ubicación, en un cuerpo   | El vecindario en órbita   | De quién colgás, qué tan afuera estás y qué te cuelga                  |
| Piloto · Reputación                    | La rosa de banderas       | Con quién estás parado: una lealtad y un oportunista se ven distinto   |

Las reglas que las hacen funcionar:

- **Una por pantalla, no una por panel.** Dos figuras compiten y ninguna gana. La
  que está es la que contesta la pregunta principal de esa pantalla.
- **No es obligatoria, y una herramienta manda sobre una figura.** La ficha de la
  nave tuvo un anillo durante meses y era lindo, pero un círculo no tiene ningún
  costado donde abrir el panel de una ranura, así que **hacía falta una lista al
  lado diciendo las mismas ranuras otra vez**. La figura le estaba cobrando una
  columna entera a la herramienta. Hoy son filas y la figura es el perfil del
  bloque: más pobre de mirar, mucho mejor de usar. Cuando las dos cosas peleen,
  gana la que se usa.
- **Una pantalla que cambia de qué es, cambia de figura.** Ubicación no es una
  pantalla con contenido variable: parado en una puerta es una cosa y viajando es
  otra, y por eso tiene el aro en un caso y la banda en el otro. **Nunca las dos
  a la vez**, que es lo que la regla de arriba prohíbe. Y tienen que dibujarse
  distinto entre sí —una radial, la otra lateral— o el módulo entero se siente
  como una sola pantalla con el texto cambiado, que es justo lo que la figura
  viene a resolver.
- **Tiene que informar por su forma.** Si el dibujo se ve igual con datos
  distintos, es decoración y sobra. La rueda de un minero y la de un artillero
  son dos siluetas distintas; ése es el examen.
- **No reemplaza a los números, los acompaña.** Una figura dice bien _cuál_ y mal
  _cuánto_. Siempre va con su lista al lado —el anillo con las ranuras, el
  hexágono con las ramas—, que lee los mismos datos y dice las cifras exactas.
- **Se dibuja con las manos**, en SVG propio o cajas de un píxel. **Nada de
  librerías de gráficos**: traen su propio aspecto, y acá el aspecto es el
  producto. Vale la misma regla que para los componentes.
- **Habla el idioma del HUD**: trazos finos, esquinas rectas salvo donde el
  círculo signifique algo, el naranja del sistema y el cian sólo para cifras. Una
  figura tiene que parecer un instrumento de cabina, no un gráfico de tablero.
- **Aguanta que la achiquen.** El alto sale de `aspect-ratio` y nunca de un valor
  fijo: un círculo dentro de un rectángulo se vuelve una elipse.

Esto **no contradice la homogeneidad**, la completa: todo se ve igual, y cada
pantalla tiene una sola cosa que es suya. Sin eso, un juego de paneles apilados
se vuelve indistinguible de sí mismo pantalla a pantalla.

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
