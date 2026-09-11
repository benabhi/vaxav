# Arquitectura

> Las decisiones técnicas que son **caras de cambiar después**. Todo lo demás se
> puede reescribir un martes; esto no.
>
> Ver también: [MVP](../MVP.md) · [acciones](ACTIONS.md) · [hoja de ruta](../ROADMAP.md)

Vaxav apunta a ser un juego con muchos jugadores en un solo universo compartido y
una economía enteramente en manos de ellos. Eso no cambia lo que se construye
primero, pero sí **cómo** se construye: hay una docena de decisiones que, tomadas
al revés, obligan a migrar datos vivos con jugadores adentro.

## Las diez reglas

### 1. El servidor es la única autoridad

El navegador dibuja; no decide. Los temporizadores que se ven en pantalla son
decorativos: lo que vale es el instante guardado. Cualquier acción se valida del
lado del servidor aunque la interfaz ya la haya impedido.

### 2. Todo instante en UTC

Sin excepción, en la base y en la lógica. La hora local es cosa de la
presentación. Un juego de temporizadores que mezcla zonas horarias tiene errores
que aparecen dos veces por año y son imposibles de reproducir.

### 3. El dinero y las cantidades son enteros

Créditos, unidades de mineral, metros cúbicos: **enteros, siempre**. Ni un
`float` cerca de la economía. Los redondeos de coma flotante en un juego con
mercado terminan en dinero creado de la nada, y el agujero se descubre cuando ya
hay millones dando vueltas.

### 4. Todo movimiento de valor deja asiento

Créditos e ítems se mueven **sólo** escribiendo en un libro mayor de sólo
agregado: quién, qué, cuánto, de dónde a dónde y por qué. El saldo es la suma de
los asientos, no un número que se edita.

Es la decisión más incómoda de agregar tarde y la que salva el proyecto cuando
aparezca el primer duplicado de ítems, que va a aparecer. Sin asientos no hay
forma de saber qué pasó ni de revertirlo.

### 5. Una acción se resuelve exactamente una vez

La resolución es perezosa —se calcula cuando alguien la mira— y eso abre la puerta
a que dos consultas simultáneas la resuelvan dos veces y entreguen el botín
doble. La resolución va **dentro de una transacción, con la fila del piloto
bloqueada, y verificando que siga sin resolver**.

Es el mismo patrón para todo lo que entrega algo: cobrar, minar, completar, recibir.

### 6. Se escribe la concurrencia aunque SQLite no la necesite

Hoy la base es SQLite, que serializa todo y perdona cualquier descuido. Mañana es
PostgreSQL y no perdona ninguno. Los bloqueos explícitos, las restricciones
únicas y las transacciones se escriben **desde ahora**, aunque en desarrollo no
cambien nada: son lo único que va a impedir que dos pilotos compren la misma
orden de mercado.

Corolario: **nada específico de SQLite**. Todo pasa por Drizzle y sus
migraciones, y la migración a PostgreSQL tiene que ser cambiar `DATABASE_URL` y
el conector.

### 7. Lo que no puede ser perezoso, va en trabajos periódicos

La resolución perezosa cubre lo que le pasa a **un** piloto. No cubre lo que le
pasa al mundo: cinturones que se recuperan, producción de estaciones, órdenes de
mercado que vencen, entregas programadas.

Eso necesita un proceso aparte del que atiende la web, con trabajos idempotentes
y que puedan correr tarde sin romper nada. Se diseña desde el principio pensando
que puede haber **varios procesos web** y **un solo planificador**.

### 8. Fungibles contra instancias, decidido de entrada

- **Fungible** (mineral, combustible, munición): una fila por piloto y tipo, con
  una cantidad. Se suman y se restan.
- **Instancia** (módulos, naves): una fila por objeto, con su propia historia,
  desgaste y modificaciones.

Cambiar un fungible a instancia con inventarios llenos es migrar todo el juego.
La regla: **si dos ejemplares nunca se van a poder distinguir, es fungible**.

### 9. El chat no vive en la memoria del proceso

Un chat global que recorra las conexiones abiertas para avisarles no escala más
allá de un puñado de jugadores y no sobrevive a tener dos procesos web: lo que
está en la memoria de uno no existe para el otro.

El chat se diseña detrás de una interfaz propia —publicar y suscribirse— para que
la implementación de hoy (simple, en base) se pueda reemplazar por un pub/sub
real sin tocar las pantallas.

### 10. Los números de balance son datos, no código

Duraciones base, rendimientos, precios de referencia, costos: en tablas de
configuración. Ajustar el balance de un juego vivo no puede requerir un
despliegue, porque el balance se ajusta todas las semanas.

## Escalar

No se optimiza lo que todavía no duele, pero sí se evita lo que después no se
puede deshacer:

- **Sesiones y chat fuera del proceso** cuando haga falta más de uno. Las
  sesiones ya viven en la base y no en memoria, así que es sumar procesos; el
  chat necesita su pub/sub, que por eso está detrás de una interfaz propia.
- **Índices desde el día uno** en lo que se consulta siempre: acciones sin
  resolver, inventario por piloto, mensajes sin leer.
- **Consultas acotadas**: nada que crezca con la cantidad total de jugadores.
  Listados paginados, historiales con tope.
- **Nada de N+1** en las pantallas densas, que en este juego son todas.
- La partición por región del universo es la salida natural si un día hace falta,
  y por eso el mapa se modela jerárquico desde el principio.

## Seguridad y abuso

- Contraseñas con argon2, sesiones como filas que se pueden invalidar. _(hecho)_
- **Roles y permisos antes de tener usuarios**: jugador, moderador,
  administrador. Agregarlos después obliga a revisar cada pantalla.
- Límite de frecuencia en lo que se puede repetir: chat, mensajes, alta de
  cuentas.
- Todo lo que entrega valor se valida en el servidor, incluso lo que la interfaz
  ya bloqueó.
- El chat y los mensajes son contenido de jugadores: se guardan como texto plano
  y se muestran escapados, nunca como HTML.

## Lo que ya está decidido y por qué

| Decisión                                       | Motivo                                                                                                                                    |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| SvelteKit y TypeScript                         | El juego es textual y denso en datos; un solo lenguaje de punta a punta y el estado de pantalla en el navegador, donde no cuesta un viaje |
| Drizzle con sus migraciones                    | El esquema se escribe una vez y el tipo sale de ahí; nada de una capa que adivine                                                         |
| SQLite en desarrollo, PostgreSQL en producción | Simplicidad ahora sin atarse; la portabilidad se sostiene con disciplina                                                                  |
| Reglas puras en `src/lib/game/`                | Se prueban sin levantar nada, y el balance se verifica con tests                                                                          |
| Capas en un solo sentido                       | `game/` ← `services/` ← `views/` ← `load` y form actions ← componentes                                                                    |
