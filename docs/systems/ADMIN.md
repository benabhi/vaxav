# Roles, permisos y el cuartel general

> **Implementado en parte.** Existen los roles, el catálogo de permisos, el
> guardia del área, el registro de eventos con su pantalla, el **constructor de
> sistemas** y la **administración de cuentas** con sus sanciones. Los roles se
> reparten desde la ficha de un piloto; **todavía no hay pantalla para crearlos ni
> para cambiarles los permisos**.
>
> Ver también: [arquitectura](ARCHITECTURE.md) · [interfaz](INTERFACE.md) ·
> [el universo](UNIVERSE.md)

El cuartel general es el área de administración del juego: donde se mira lo que
pasó, y —a medida que se construyan— donde se crean entidades, se editan cuentas
y se arma el universo. Vive fuera del juego, en `/admin`, con su propia barra
lateral y su propio guardia.

Dos decisiones lo ordenan todo:

1. **Los roles son filas de la base; los permisos, código.** Un rol es una manera
   de agrupar llaves y tiene todo el sentido armar uno nuevo sin desplegar. Un
   permiso, en cambio, es la llave que algún `if` del servidor consulta: uno
   inventado desde un panel no lo mira nadie, así que sería una casilla que
   miente.
2. **Todo lo que reparte poder o borra algo deja constancia.** El registro no se
   edita ni se borra, y sobrevive a lo que describe.

## Los permisos

El catálogo vive en `src/lib/permissions.ts`, fuera de `server/` porque lo
necesitan los dos lados: el servidor para decidir y la pantalla para no ofrecer
un botón que va a rebotar. **Ofrecer menos no es proteger**: quien decide es
siempre el servidor.

| Área                 | Permiso             | Qué abre                                               |
| -------------------- | ------------------- | ------------------------------------------------------ |
| **Pilotos**          | `pilots.read`       | Buscar cuentas y abrir su ficha                        |
|                      | `pilots.edit`       | Cambiar los datos de una cuenta y lo que tiene         |
|                      | `pilots.delete` ⚠   | Borrar una cuenta y todo lo que colgaba de ella        |
| **Universo**         | `universe.read`     | Abrir sistemas, cuerpos y estaciones                   |
|                      | `universe.edit`     | Crear y editar sistemas, cuerpos, estaciones y puertas |
|                      | `universe.delete` ⚠ | Eliminar sistemas o cuerpos, con lo que tengan encima  |
| **Roles y permisos** | `roles.read`        | Consultar qué roles hay y qué lleva cada uno           |
|                      | `roles.edit` ⚠      | Crear roles, cambiar permisos y asignarlos             |
| **Vigilancia**       | `events.read`       | Leer el registro                                       |
|                      | `stats.read`        | Mirar los números agregados del juego                  |

Las reglas del catálogo:

- **Cada permiso se lee por separado**: no hay permisos que impliquen otros. Que
  editar no implique leer parece redundante y es lo que hace que la comprobación
  sea siempre una sola pregunta.
- **No hay permisos implícitos.** Un conjunto vacío no abre nada, ni siquiera
  lectura. Un piloto común no tiene ninguno.
- Los marcados con ⚠ son **peligrosos**: dejan borrar cosas que no vuelven o
  repartir poder. No cambian la comprobación —un permiso es un permiso— pero el
  panel los pinta distinto, porque marcar una casilla de más no debería ser igual
  de barato que marcar cualquier otra.
- Un permiso que se saca del código **no rompe los roles viejos**: la pantalla
  muestra el código a secas para que alguien lo quite.

## Los roles

Cuatro tablas, en `src/lib/server/db/schema.ts`:

```
role             id · code(único) · name · description · builtin · created_at
role_permission  id · role_id → role · permission      unique(role_id, permission)
pilot_role       id · pilot_id → pilot · role_id → role · granted_by? · granted_at
                                                         unique(pilot_id, role_id)
audit_event      id · kind · actor_id · subject_kind · subject_id · payload · created_at
```

- **Un piloto puede tener varios roles y sus permisos se suman.** Los oficios de
  administración se acumulan —quien modera también suele mirar estadísticas— y
  con un rol por cuenta habría que inventar un rol combinado por cada mezcla.
- `role_permission` es **una fila por permiso** y no una lista guardada en una
  columna: así se puede preguntar quién tiene tal permiso sin leer todos los
  roles y desarmar textos. Es la consulta que va a hacer falta el día que alguien
  pregunte quién puede borrar cuentas.
- `pilot_role` guarda **quién lo dio y cuándo**. El registro guarda el hecho, pero
  esto guarda el estado: con sólo el registro, saber quién le dio el rol a alguien
  obligaría a recorrer el historial entero.
- `builtin` marca los que trae la siembra. **No se borran** —quedarse sin el rol
  de administrador es quedarse afuera sin forma de volver a entrar— pero sí se les
  cambian los permisos, porque el catálogo crece con el código y un administrador
  al que le faltara la llave nueva no podría abrir la herramienta recién
  construida.

### Roles a medida

El objetivo del reparto granular es poder darle a alguien **exactamente** lo que
hace falta y nada más. Dos ejemplos que el sistema ya sostiene:

| Rol            | Llaves                           | Qué le abre                                             |
| -------------- | -------------------------------- | ------------------------------------------------------- |
| **Vigía**      | `events.read`                    | Entra al cuartel y ve el registro. Nada más             |
| **Cartógrafo** | `universe.read`, `universe.edit` | Arma sistemas, pero no borra ninguno ni lee el registro |

Lo que lo hace posible es que **cualquier permiso abre la puerta del área** y que
cada sección pide el suyo. Así no hace falta inventar un permiso de "entrar" que
no protegería nada, y una sección nueva sólo tiene que declarar qué llave pide.

Lo que falta para usarlo es **la pantalla**: hoy los roles a medida se crean desde
el servicio, no desde el panel.

### El último administrador

Dos guardas impiden cerrar la puerta desde afuera con la llave adentro:

- No se le puede **retirar** el rol al único piloto que lo tiene.
- No se puede **dar de baja** esa cuenta. Hay que pasarle el rol a otro primero.

Sin esto no queda ninguna pantalla desde donde volver a crear un administrador, y
la única salida sería escribir la fila a mano en la base.

### Cómo se pregunta

Siempre igual, y la comprobación es idéntica en el servidor y en la pantalla:

```ts
permissionsOf(db, pilotId); // ReadonlySet<string>, del servicio
can(permisos, 'events.read'); // función pura de $lib/permissions.ts
```

`hooks.server.ts` las resuelve **una vez por pedido** y las deja en
`locals.permissions`, porque las mira el guardia del área y también cada pantalla
que decide si dibuja un botón.

## El registro de eventos

Es **append-only**: no hay función para editar ni para borrar una fila. Un
registro que se puede retocar no sirve para lo único para lo que sirve un
registro, que es creerle cuando algo no cierra. Si algo quedó mal escrito, se
escribe otro evento que lo diga.

Guarda **un código y un JSON, no la frase ya escrita**. Es la misma decisión que
toma la bitácora del piloto y por la misma razón: cambiar cómo se redacta un hecho
no debería obligar a reescribir el pasado, y un historial con dos redacciones del
mismo hecho se lee como si fueran dos hechos distintos. La frase se arma al
mostrarla, desde el catálogo de `src/lib/events.ts`.

**Ni `actor_id` ni `subject_id` tienen clave foránea**, y es lo que hace que la
tabla sirva: el registro tiene que sobrevivir a lo que describe. Un evento que
dice «se borró la cuenta 7» apunta a una fila que ya no existe, y con una foránea
o no se podría escribir o se borraría con ella. El nombre del actor se **congela
dentro del JSON** al escribir, así que la fila se lee completa aunque el piloto ya
no exista.

El actor es **anulable**: hay cosas que no las hace nadie —la siembra que crea el
universo, una orden que caduca— y forzar un responsable inventaría un culpable.
Se muestran como «el sistema».

### Qué se registra

**No se registra todo lo que pasa.** Un registro que anota cada carga de pantalla
se vuelve ilegible, y lo ilegible no se audita. Entran los hechos que alguien
podría necesitar reconstruir después.

| Categoría | Código                     | Peso    |
| --------- | -------------------------- | ------- |
| Cuentas   | `account.registered`       | neutral |
|           | `account.password_changed` | notable |
|           | `account.deleted`          | grave   |
| Roles     | `role.created`             | notable |
|           | `role.updated`             | notable |
|           | `role.deleted`             | grave   |
|           | `role.granted`             | grave   |
|           | `role.revoked`             | grave   |

El **peso** no cambia nada de lo que se guarda: es para que la pantalla pinte
distinto lo que no vuelve. Grave quiere decir que algo dejó de existir o que
alguien recibió poder, que son las dos filas que uno busca cuando abre un registro
porque algo no cierra.

Un código que **no está en el catálogo igual se guarda**, y se muestra con su
código a la vista: perder un hecho es peor que mostrarlo sin nombre.

### Dónde se escribe

Desde el servicio que hace el hecho, **dentro de su transacción**. Es la única
forma de que un hecho y su registro no puedan separarse. Hoy escriben
`services/pilots.ts` (alta, baja, cambio de contraseña) y `services/roles.ts`
(las cinco de roles).

## La pantalla

```
/admin                      Cuartel general — tus roles, tus llaves y lo último que pasó
/admin/pilotos              Las cuentas, con búsqueda y filtro por estado
/admin/pilotos/<id>         La ficha: identidad, créditos, sanciones y roles
/admin/universo             El mapa de la galaxia, el listado con filtros, y el alta
/admin/universo/<sistema>   El constructor: árbol, formulario y salidas
/admin/eventos              Registro — la traza de actividad y la tabla con filtros
```

El guardia vive en el `+layout.server.ts` del grupo `(admin)` y comprueba **dos
cosas**: que se pueda cruzar la puerta —cualquier llave alcanza— y que se pueda
abrir la sección concreta que se pidió. Responde **404 y no 403**: un 403 confirma
que la página existe, y a quien está probando URL no hay por qué contestarle esa
pregunta.

La barra lateral es **el mismo Neocom del juego con otra lista**, con el bloque de
marca cambiado a "CUARTEL" y la vuelta al juego abajo de todo. Desde el juego, el
cuartel se ve como **un recuadro dorado aparte** sobre "Plegar", y sólo si el
piloto tiene alguna llave: el naranja es el color de jugar, y esto no es jugar.

**La figura de la pantalla del registro es la traza de actividad**: una barra por
día del último mes. Un registro es una lista larguísima de cosas iguales, y la
pregunta con la que uno lo abre casi nunca es «¿qué pasó?» sino «¿cuándo pasó
algo?». La traza contesta eso por su forma —un mes tranquilo es una línea baja,
una tarde de trabajo es un pico— y además **es el filtro**: se toca la barra y la
tabla salta a ese día. Los días van en **UTC**, como todo instante del juego: uno
que agrupara según el huso de quien mira contaría el mismo hecho en dos días
distintos según desde dónde se lo lea.

### Filtros y paginación

Como toda lista larga, el registro se pagina —**25 por página**— y se filtra. Hay
cuatro filtros y cada uno se elige desde donde tiene sentido:

| Filtro        | Dónde se elige                        | En la URL    |
| ------------- | ------------------------------------- | ------------ |
| **Categoría** | Los chips de arriba                   | `categoria=` |
| **Tipo**      | Los chips de la categoría abierta     | `tipo=`      |
| **Día**       | Tocando una barra de la traza         | `dia=`       |
| **Quién**     | Tocando un nombre de la columna QUIÉN | `quien=`     |

Los tipos **sólo se ofrecen con una categoría abierta**: una lista con los
cuarenta tipos del juego no es un filtro, es otro problema. Primero se elige de
qué se está hablando.

El de actor está porque la pregunta que sigue a «¿quién hizo esto?» es casi
siempre «¿y qué más hizo?». Funciona también con cuentas dadas de baja: el nombre
sale del propio registro.

Los filtros **viven en la URL y no en el estado del navegador**. Un registro que
se consulta es un registro que se cita, y para citarlo hay que poder pasar el
enlace; de paso, el botón de atrás hace lo que se espera. Son enlaces y no un
formulario, así que funcionan sin JavaScript. **Cambiar cualquier filtro vuelve a
la página 1**: quedarse en la siete de un resultado que ahora tiene dos es la
forma más rápida de que una pantalla parezca vacía sin estarlo.

Una trampa que ya mordió: pedir **una lista vacía de tipos** —lo que pasa al
abrir una categoría que todavía no registra nada— quiere decir «ninguno», no
«todos». Confundirlas mostraba el registro entero justo cuando se esperaba verlo
vacío.

## Administración de cuentas

`/admin/pilotos` lista y busca; `/admin/pilotos/<id>` es la ficha. Pide
`pilots.read` para mirar, `pilots.edit` para tocar, `pilots.delete` para dar de
baja y `roles.edit` para repartir roles — cuatro llaves distintas porque son
cuatro cosas distintas, y cada acción comprueba la suya.

La búsqueda mira **distintivo y correo**: es lo que uno tiene a mano cuando llega
un reclamo, y no siempre viene con el mismo de los dos.

### Lo que se puede tocar, y qué cambia

| Qué        | Efecto adicional                                          |
| ---------- | --------------------------------------------------------- |
| Distintivo | Le cierra las sesiones: se entera al volver a entrar      |
| Correo     | —                                                         |
| Contraseña | **Sin pedir la anterior**, y le cierra todas las sesiones |
| Ubicación  | No le cancela la orden en curso                           |
| Créditos   | Un **asiento del libro mayor**, con su motivo             |
| Roles      | Ver «Los roles», más arriba                               |

La diferencia de fondo con lo que hace el propio piloto en Opciones: allá cada
operación pide la contraseña, porque es lo único que separa un clic mal dado de
perder años de juego. Acá el que opera no es el dueño y no puede demostrarlo, así
que lo que autoriza es el permiso y lo que lo hace revisable es el registro:
**no hay forma de tocar una cuenta ajena sin que quede escrito quién fue**.

Los créditos merecen su nota: **no se escribe el saldo**. Un ajuste llama a
`wallet.ts` como cualquier movimiento del juego, así que la auditoría del libro
sigue cuadrando. Tocar `pilot.credits` a mano rompería la única garantía que tiene
la economía.

## Sanciones

Son tres y se distinguen por **lo que hacen**, no por lo graves que suenan:

| Sanción    | Cierra la puerta | Vence | Para qué                                   |
| ---------- | ---------------- | ----- | ------------------------------------------ |
| Aviso      | no               | no    | Queda escrito. El piloto lo ve             |
| Suspensión | sí               | sí    | No puede entrar hasta la fecha. Vence sola |
| Baneo      | sí               | no    | No puede entrar. Hay que levantarlo a mano |

Una suspensión sin fecha sería un baneo con otro nombre, y un baneo con fecha
sería una suspensión: por eso la fecha es obligatoria en una y está prohibida en
el otro.

**Es una tabla con historial y no dos columnas en el piloto.** La pregunta que se
hace siempre al moderar es «¿ya lo habíamos suspendido antes?», y con dos columnas
el estado actual pisa al anterior. El registro de eventos guarda **el hecho**;
esta tabla guarda **el estado**, que es el mismo reparto que con los roles.

Las reglas:

- **Toda sanción lleva motivo**, y no se edita ni se borra. Se **levanta**, y el
  levantamiento queda escrito con su fecha y su firma. Una cuenta que parece
  limpia es una cuenta cuya historia nadie va a encontrar.
- **Sancionar cierra la puerta en el acto**: las sesiones abiertas se cierran. Un
  baneo que recién surte efecto en el próximo ingreso es un baneo que el baneado
  decide cuándo empieza.
- **Nadie se sanciona a sí mismo, ni al último administrador.** Lo primero es un
  accidente caro; lo segundo deja el juego sin cuartel.
- Con varias vigentes gana **la que termina más tarde**, y un baneo gana siempre.
  Es lo que evita que levantar una suspensión vieja abra la puerta que un baneo
  nuevo había cerrado.

El piloto sancionado no va a una pantalla de error: va a `/suspendido`, que le
dice **qué tiene, por qué y hasta cuándo**. Lo que no le dice es quién se la puso
—eso queda en el registro— porque nombrarlo sólo abre una discusión que esa
pantalla no puede resolver.

## El mapa y el listado

`/admin/universo` tiene **las dos vistas de la galaxia, y conviven**: el mapa
arriba y la tabla abajo. Para «llevame a Omega» una lista ordenable es más rápida
que buscar un punto; para «¿dónde quedó el agujero de mi galaxia?» sólo sirve el
mapa. Ninguna reemplaza a la otra.

**El mapa es la figura de la pantalla.** Cómo se dibuja y qué codifica cada trazo
está en [universo](UNIVERSE.md#el-mapa); lo que hace falta saber acá es que
contesta preguntas de conjunto —ramales sueltos, puertas sin terminar, pasos
cerrados— que sistema por sistema no se ven.

**El mapa y su marco son compartidos con la cabina.** `views/galaxy.ts` arma la
galaxia para las dos pantallas y `GalaxyStage` pone alrededor lo mismo en las dos
—los filtros, la ficha, la leyenda, y el mismo botón de agrandar—, así que lo que
cambia es qué piezas entran, no dónde va cada una. Lo que el cuartel ve de más es
la deuda de obra: las puertas sin conectar y los sistemas a la deriva, que al
piloto no se le muestran porque no son contenido sino trabajo pendiente.

**Los filtros valen para los dos.** El mismo recorte apaga sistemas en el mapa y
quita filas de la lista: buscador, facción, región y gobierno, más un criterio
para pintar el mapa. Viajan en la URL, como en todo listado del proyecto, así que
un recorte se comparte y sobrevive al botón de atrás. Y **el mapa recibe la
galaxia entera igual**: uno que sólo dibuja lo filtrado pierde la forma del
conjunto, que es justamente lo que la tabla no da.

La tabla ordena por columna y pagina de a veinticinco, con `HudTable`. La mira de
cada fila lleva la cámara hasta ese sistema y se le acerca: es el puente que hace
que las dos vistas sean una.

Agregar un filtro nuevo es agregar una entrada a la tabla de filtros de
`views/worldbuilding.ts` y un control en la pantalla. Agregar una columna
ordenable es agregar una fila a `SYSTEM_SORTS`; una columna que no esté ahí no se
ofrece como ordenable, así que es imposible prometer un orden que el servidor no
sabe hacer.

### Una galaxia de prueba

Con dos sistemas no se puede contestar si el mapa se lee, si los filtros sirven
de algo o si la grilla de hexágonos parece una galaxia o un panal. Para eso está
`npm run db:seed:demo`: siembra **sesenta sistemas**, veinte por facción, en seis
regiones y quince constelaciones, con su capital declarada, unas cuantas estrellas
dobles, atajos, pasos cerrados y puertas sin terminar.

Tres cosas que la hacen servir para lo que sirve:

- **Es contenido de prueba, no el universo.** Es aditiva e idempotente por
  nombre: no toca Ánfora, ni los pilotos, ni lo que ya estaba. Para sacarla,
  `npm run db:seed:demo -- --limpiar`, que borra sólo lo suyo y se niega si hay
  un piloto parado adentro.
- **Sale siempre igual.** El azar tiene semilla fija, porque una galaxia distinta
  en cada corrida no sirve para comparar un cambio de dibujo con el de ayer.
- **No sale cuadrada.** Cada sistema se cuelga siete de cada diez veces de lo
  último plantado y tres de cualquiera: siempre de lo último da una víbora,
  siempre al azar da una mancha redonda, y mezclando salen ramas largas con
  brotes. Cuando la casilla elegida no tiene lugar se prueba con otro sistema
  hasta encontrarlo, que es lo que impide que un racimo entero quede flotando.

### Regiones y constelaciones

**Se crean desde el alta de sistema**, que es donde uno se acuerda de que hacen
falta: llenando el formulario aparece «¿no existe la constelación?» y desde ahí
«¿tampoco la región?». Obligar a pasar por una pantalla aparte para crear un
contenedor vacío sería fricción sin nada a cambio.

**Se editan desde el botón «Territorios»**, que abre un modal con las dos: ahí se
les cambia el nombre y el color. Existe porque hasta que estuvo, una región creada
quedaba con el nombre que salió y el color que decidió el generador, sin
apelación.

**En un modal y no en la pantalla**: la vista del universo es el mapa y la tabla
de sistemas, que es lo que se mira todos los días, y la taxonomía se toca una vez
cada tanto. Es el mismo criterio que el alta de sistema.

El botón dice «Territorios» y no «Regiones» porque adentro están las dos, y un
botón que nombra la mitad de lo que hace deja a quien no conoce la aplicación sin
saber dónde está lo otro. Es además la palabra que el mapa ya usa para ese par.

Se dibuja como un árbol de dos niveles y no como dos tablas: una constelación sin
su región al lado es un nombre suelto, y lo que uno quiere ver al elegir un color
es qué tiene alrededor. Cada fila lleva **cuántos sistemas tiene**, que no es un
adorno: una constelación en cero es trabajo a medio hacer y verlo en la lista es
la única forma de acordarse de terminarla.

El código **no cambia al renombrar**. Sale del nombre al crearla y desde ahí es su
identidad: una región se renombra porque no gustó cómo quedó escrita, no porque
sea otra.

## El constructor de sistemas

`/admin/universo/<sistema>` es donde se construye. Pide `universe.read` para mirar y `universe.edit` para tocar —el
guardia del área sólo comprueba la primera, así que la segunda se comprueba en
cada acción—, y borrar pide además `universe.delete`.

La pantalla son **dos columnas de alto fijo y una fila abajo**: el árbol a la
izquierda, el formulario de lo elegido a la derecha, las salidas abajo. El alto
fijo no es capricho: sin él, elegir una estación con siete módulos estira la
columna derecha al doble que la izquierda y el árbol —que es lo que se estaba
mirando— se va de la pantalla.

El árbol es **el mismo dibujo que ve el piloto**: `TreeBranch` se extrajo del
cuerpo del sistema justamente para esto, y `railsFor` calcula las guías una sola
vez para las dos pantallas. La primera vez que ese cálculo existió dos veces, la
copia dejó la vertical de la raíz cortada en las filas de profundidad dos.

### Las reglas que hace cumplir

- **Los códigos no se escriben a mano.** `body.code` es único en toda la galaxia,
  así que se deriva del nombre con el del sistema por delante. Un código a mano es
  un choque esperando la próxima siembra.
- **Un sistema nace con su estrella.** Sin nada en la raíz no se puede dibujar, no
  se puede visitar y no es un sistema.
- **Sólo cuelga lo que puede colgar**: de un planeta cuelgan lunas, cinturones y
  estaciones; de una estación no cuelga nada. Un cuerpo tampoco puede orbitar algo
  que cuelga de él, que dejaría el árbol en un ciclo.
- **Nada se borra si algo lo está usando.** Un sistema con pilotos adentro o con
  una puerta apuntándole no se borra, y la pantalla lo dice **antes** de ofrecer el
  botón: descubrirlo al apretar es la peor forma de enterarse.
- **Todo deja constancia**, dentro de la transacción del hecho.

### Los nombres se proponen solos

La nomenclatura del sistema se ofrece escrita: `Ánfora V` para el quinto planeta,
`Ánfora III-c` para la tercera luna, `Anillos de Ánfora III` para sus anillos,
`Puerta Norte` para una salida que todavía no sabe adónde va. **Es una sugerencia
y se pisa escribiendo encima.** Una estación no recibe ninguna: lleva nombre
propio, porque la construyó alguien y la bautizó.

### Crecer desde una puerta

El gesto que uno quiere al armar una galaxia: se planta una salida con su rumbo y,
desde ella, se crea el sistema del otro lado —con su estrella, su puerta de vuelta
en el rumbo opuesto y las dos ya unidas— sin ir a otra pantalla ni acordarse de
volver a conectar.

## La siembra

`npm run db:seed` deja siempre:

- el rol **`admin`** con todas las llaves del catálogo, rehecho en cada corrida
  para que reciba las nuevas;
- dos pilotos de prueba —`benabhi` y `Prueba`, uno por par de ojos— **los dos con
  el rol de administrador**, porque sin ninguno el cuartel quedaría cerrado desde
  el primer arranque.

Es idempotente: a un piloto que ya existe **no se le cambia la contraseña** ni se
le devuelven los créditos. Si hace falta la contraseña de la lista, hay que dar de
baja la cuenta y volver a sembrar.

## Lo que falta

- La pantalla para **crear roles** y cambiarles los permisos. Asignárselos a un
  piloto ya se puede, desde su ficha.
- Las **estadísticas** del juego.
