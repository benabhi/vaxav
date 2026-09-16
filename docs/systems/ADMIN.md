# Roles, permisos y el cuartel general

> **Implementado en parte.** Existen los roles, el catálogo de permisos, el
> guardia del área, el registro de eventos con su pantalla, y el **constructor de
> sistemas**. **Todavía no hay pantalla para administrar roles**: el rol de
> administrador lo reparte la siembra.
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
/admin/universo             Los sistemas que hay, y el alta de uno nuevo
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

## El constructor de sistemas

`/admin/universo` lista lo que hay; `/admin/universo/<sistema>` es donde se
construye. Pide `universe.read` para mirar y `universe.edit` para tocar —el
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

- La pantalla para **administrar roles**: crearlos, cambiarles los permisos y
  asignárselos a un piloto. Hoy el rol de administrador lo reparte sólo la
  siembra.
- La **ficha de piloto** desde administración, y las estadísticas.
