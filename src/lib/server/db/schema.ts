/**
 * Las entidades del juego que se guardan en la base.
 *
 * Sólo tablas y sus campos: las reglas viven en `../game` y las operaciones
 * sobre ellas en `../services`. Los catálogos —profesión, facción, habilidades,
 * cascos, módulos— se guardan por código y no como clave foránea: son contenido
 * del juego y viven en el código. La base no valida que el código exista; eso lo
 * hace la capa de servicios, que es la que conoce las reglas.
 *
 * **Todo instante se guarda en UTC**, como segundos desde la época. Los
 * temporizadores tienen que dar lo mismo sin importar dónde esté el jugador, y
 * un entero no tiene huso horario que se pueda perder por el camino.
 */

import { relations, sql } from 'drizzle-orm';
import {
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
	type AnySQLiteColumn
} from 'drizzle-orm/sqlite-core';
import { ACTION_KINDS } from '$lib/game/actions';
import { CONTAINER_KINDS } from '$lib/game/items';
import { APPEARANCES, MISSION_KINDS } from '$lib/game/agents';
import {
	BODY_KINDS,
	CORPORATION_KINDS,
	GATE_BEARINGS,
	GOVERNMENTS,
	STATION_SERVICES
} from '$lib/game/universe';
import { SANCTION_KINDS } from '$lib/sanctions';

/** Ahora, en segundos desde la época. */
const NOW = sql`(unixepoch())`;

// --- El piloto ---------------------------------------------------------------
//
// En Vaxav el piloto **es** la cuenta. No hay un usuario por un lado y un
// personaje por el otro: quien se registra se sienta en la cabina, y por eso el
// distintivo y la contraseña viven en la misma tabla que la facción y la
// estación.

export const pilot = sqliteTable(
	'pilot',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),

		/** El nombre con el que se lo conoce y con el que entra. */
		callsign: text('callsign').notNull(),
		/**
		 * No se muestra a nadie: sirve para recuperar el acceso y para avisos.
		 * Único, así una persona no junta cuentas sin querer.
		 */
		email: text('email').notNull(),
		/** Hash de argon2. La contraseña en claro no se guarda ni se registra nunca. */
		passwordHash: text('password_hash').notNull(),

		/** Códigos del catálogo: el oficio previo y el origen. */
		profession: text('profession').notNull(),
		faction: text('faction').notNull(),

		/**
		 * Dónde está ahora: un cuerpo del universo, que al crearse es la estación
		 * de partida de su facción.
		 */
		locationId: integer('location_id')
			.notNull()
			.references(() => body.id),

		credits: integer('credits').notNull().default(0),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(NOW)
	},
	(table) => [
		uniqueIndex('pilot_callsign_idx').on(table.callsign),
		uniqueIndex('pilot_email_idx').on(table.email),
		index('pilot_location_idx').on(table.locationId)
	]
);

/**
 * Experiencia acumulada de un piloto en una habilidad.
 *
 * Se guarda la experiencia y no el nivel: el nivel se calcula con `levelFromXp`.
 * Guardar los dos sería guardar la misma verdad dos veces, y tarde o temprano se
 * contradicen.
 */
export const pilotSkill = sqliteTable(
	'pilot_skill',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		pilotId: integer('pilot_id')
			.notNull()
			.references(() => pilot.id),
		skill: text('skill').notNull(),
		xp: integer('xp').notNull().default(0)
	},
	// Una fila por piloto y habilidad: el código ya lo da por sentado al sumar
	// experiencia, y sin la restricción un duplicado se descubre tarde y mal.
	(table) => [uniqueIndex('pilot_skill_unico').on(table.pilotId, table.skill)]
);

/**
 * Sesión abierta de un piloto.
 *
 * El token vive en una cookie del navegador y acá se guarda su contraparte, de
 * modo que cerrar sesión sea borrar una fila y no confiar en que el cliente se
 * olvide.
 */
export const authSession = sqliteTable(
	'auth_session',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		pilotId: integer('pilot_id')
			.notNull()
			.references(() => pilot.id),
		token: text('token').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(NOW),
		expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
	},
	(table) => [
		uniqueIndex('auth_session_token_idx').on(table.token),
		index('auth_session_pilot_idx').on(table.pilotId)
	]
);

// --- El universo -------------------------------------------------------------
//
// La jerarquía es la de EVE —galaxia, región, constelación, sistema— y por
// debajo del sistema los cuerpos forman un **árbol**: la estrella no tiene
// padre, los planetas cuelgan de ella, las lunas de los planetas y las
// estaciones de cualquiera de ellos.
//
// Un árbol y no una tabla por tipo: dibujar un sistema sería unir cinco tablas,
// y cada tipo nuevo obligaría a tocar el esquema.

/** El contenedor de todo. Por ahora hay una sola. */
export const galaxy = sqliteTable(
	'galaxy',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		code: text('code').notNull(),
		name: text('name').notNull()
	},
	(table) => [uniqueIndex('galaxy_code_idx').on(table.code)]
);

/** Una porción grande de la galaxia. Agrupa constelaciones. */
export const region = sqliteTable(
	'region',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		code: text('code').notNull(),
		name: text('name').notNull(),
		/**
		 * El color con que se la pinta en el mapa, o vacío para el automático.
		 *
		 * **Vacío no es un dato que falte: es «elegilo vos».** El mapa genera un tono
		 * a partir del nombre, así que una región nueva nunca queda sin color y nadie
		 * tiene que decidir nada para que el mapa se vea. Esto está para cuando sí
		 * importa: dos vecinas que salieron parecidas, o una que se quiere de un color
		 * concreto.
		 *
		 * Se guarda como `#rrggbb`. La facción es distinta —su color vive en el
		 * catálogo y no se edita— porque son tres y son identidad del juego.
		 */
		color: text('color').notNull().default(''),
		galaxyId: integer('galaxy_id')
			.notNull()
			.references(() => galaxy.id)
	},
	(table) => [
		uniqueIndex('region_code_idx').on(table.code),
		index('region_galaxy_idx').on(table.galaxyId)
	]
);

/** Un puñado de sistemas vecinos. */
export const constellation = sqliteTable(
	'constellation',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		code: text('code').notNull(),
		name: text('name').notNull(),
		regionId: integer('region_id')
			.notNull()
			.references(() => region.id),
		/**
		 * El color con que se la pinta en el mapa, o vacío para el automático.
		 *
		 * **Vacío no es un dato que falte: es «elegilo vos».** El mapa genera un tono
		 * a partir del nombre, así que una región nueva nunca queda sin color y nadie
		 * tiene que decidir nada para que el mapa se vea. Esto está para cuando sí
		 * importa: dos vecinas que salieron parecidas, o una que se quiere de un color
		 * concreto.
		 *
		 * Se guarda como `#rrggbb`. La facción es distinta —su color vive en el
		 * catálogo y no se edita— porque son tres y son identidad del juego.
		 */
		color: text('color').notNull().default('')
	},
	(table) => [
		uniqueIndex('constellation_code_idx').on(table.code),
		index('constellation_region_idx').on(table.regionId)
	]
);

/** Una estrella y todo lo que la orbita. */
export const system = sqliteTable(
	'system',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		code: text('code').notNull(),
		name: text('name').notNull(),
		constellationId: integer('constellation_id')
			.notNull()
			.references(() => constellation.id),

		/**
		 * Cómo se gobierna.
		 *
		 * Ya no *fija* la seguridad: le fija la **banda** dentro de la cual puede
		 * moverse. Así el gobierno significa algo por sí mismo —una colonia penal
		 * está vigilada pero no protegida— en vez de ser otro nombre para el mismo
		 * número.
		 */
		government: text('government', { enum: GOVERNMENTS }).notNull().default('corporate'),

		/**
		 * Cuánta protección hay, de 0 a 100.
		 *
		 * **Se guarda**, al revés que antes. Con cuatro niveles derivados del
		 * gobierno, cincuenta sistemas caían en cuatro montones indistinguibles; la
		 * doc ya prometía un gradiente y esto lo cumple. Lo que impide la
		 * contradicción que preocupaba —«anarquía con seguridad alta»— no es que el
		 * número no exista, es `securityProblem`, que lo valida contra la banda del
		 * gobierno antes de dejarlo entrar.
		 */
		security: integer('security').notNull().default(0),

		/**
		 * Qué facción lo controla, **o vacío**. Vacío es espacio libre: como en
		 * EVE, las potencias controlan un puñado de sistemas y el resto queda para
		 * que lo reclamen las corporaciones de jugadores.
		 */
		controllingFaction: text('controlling_faction').notNull().default(''),

		/**
		 * Coordenadas en la galaxia, en enteros: son la base del mapa y de la
		 * distancia entre sistemas, y con enteros no hay dos jugadores que calculen
		 * un salto distinto por un redondeo.
		 */
		x: integer('x').notNull().default(0),
		y: integer('y').notNull().default(0),
		z: integer('z').notNull().default(0),

		/**
		 * De qué facción es éste el sistema **principal**, o vacío.
		 *
		 * Es un código de facción y no un booleano porque la pregunta que se le hace
		 * no es «¿es capital?» sino «¿de quién?». Con un booleano habría que cruzarlo
		 * siempre con `controlling_faction` para contestar, y nada impediría escribir
		 * una capital de una facción que ni siquiera controla el sistema.
		 *
		 * El índice único lo hace cumplir: **una capital por facción**, y ninguna
		 * restricción sobre los que no lo son.
		 */
		capitalOf: text('capital_of').notNull().default(''),

		description: text('description').notNull().default('')
	},
	(table) => [
		uniqueIndex('system_code_idx').on(table.code),
		index('system_constellation_idx').on(table.constellationId),
		// Parcial: sin el filtro, todos los sistemas que no son capital chocarían
		// entre sí por compartir la cadena vacía.
		uniqueIndex('system_capital_idx')
			.on(table.capitalOf)
			.where(sql`${table.capitalOf} != ''`)
	]
);

/**
 * Un cuerpo del sistema: estrella, planeta, luna, cinturón o estación.
 *
 * `parentId` apunta a otro cuerpo **del mismo sistema**. La estrella es la única
 * sin padre.
 */
export const body = sqliteTable(
	'body',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		code: text('code').notNull(),
		name: text('name').notNull(),
		systemId: integer('system_id')
			.notNull()
			.references(() => system.id),
		parentId: integer('parent_id').references((): AnySQLiteColumn => body.id),
		kind: text('kind', { enum: BODY_KINDS }).notNull(),

		/**
		 * Distancia al cuerpo que orbita, en unidades de distancia del juego. De
		 * acá sale el tiempo de viaje.
		 */
		orbitDistance: integer('orbit_distance').notNull().default(0),

		/**
		 * Si está en las cartas. Es el estado del **mundo** y no el de un piloto:
		 * que cada uno lleve su propio registro de qué descubrió es otra tabla, y
		 * llega con la cartografía en F13.
		 */
		explored: integer('explored', { mode: 'boolean' }).notNull().default(true),

		description: text('description').notNull().default('')
	},
	(table) => [
		uniqueIndex('body_code_idx').on(table.code),
		index('body_system_idx').on(table.systemId),
		index('body_parent_idx').on(table.parentId)
	]
);

/**
 * Una corporación: la que opera estaciones, comercia y, más adelante, agrupa
 * jugadores.
 *
 * **Una sola tabla para las del mundo y las de jugadores.** El día que un
 * jugador construya una estación, el dueño tiene que poder ser su corporación;
 * con dos tablas, el dueño de una estación sería polimórfico, que es el peor
 * final posible.
 */
export const corporation = sqliteTable(
	'corporation',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		code: text('code').notNull(),
		name: text('name').notNull(),
		kind: text('kind', { enum: CORPORATION_KINDS }).notNull(),
		/** A qué facción responde, o vacío si a ninguna. */
		faction: text('faction').notNull().default(''),
		/** Las del mundo se siembran; las de jugadores las crean ellos. */
		isNpc: integer('is_npc', { mode: 'boolean' }).notNull().default(true),
		description: text('description').notNull().default('')
	},
	(table) => [uniqueIndex('corporation_code_idx').on(table.code)]
);

/**
 * Lo que una estación tiene además de ser un lugar.
 *
 * Uno a uno con su cuerpo: el cuerpo es geografía, la estación es comportamiento
 * —quién la opera, sus tasas y sus servicios—. La facción **se deriva** por la
 * corporación, así que no se guarda dos veces y no puede contradecirse.
 */
export const station = sqliteTable(
	'station',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		bodyId: integer('body_id')
			.notNull()
			.references(() => body.id),
		corporationId: integer('corporation_id')
			.notNull()
			.references(() => corporation.id)
	},
	(table) => [
		uniqueIndex('station_body_idx').on(table.bodyId),
		index('station_corporation_idx').on(table.corporationId)
	]
);

/** Un servicio disponible en una estación. */
/**
 * A dónde lleva una puerta estelar.
 *
 * La puerta **es un cuerpo** —`body.kind = 'gate'`— y esto es sólo su destino.
 * Se separa porque es una relación entre dos cuerpos, no un atributo de uno: un
 * cuerpo tiene nombre y órbita, una puerta además tiene la otra punta.
 *
 * Apunta a **la puerta gemela y no al sistema**, porque lo que el salto necesita
 * saber es dónde aparecés: llegar «a Vela» no alcanza, hay que llegar a un lugar
 * de Vela. Son dos filas, una por extremo, y un test verifica que ninguna quede
 * huérfana.
 */
export const gate = sqliteTable(
	'gate',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		bodyId: integer('body_id')
			.notNull()
			.references(() => body.id),

		/**
		 * El sistema al que pertenece, repetido acá a propósito.
		 *
		 * Ya sale de `body.system_id`, y se guarda igual porque es la única forma de
		 * que la base garantice **un rumbo por sistema**: un índice único no puede
		 * cruzar dos tablas. Una puerta no se muda de sistema, así que la copia no
		 * puede desfasarse.
		 */
		systemId: integer('system_id')
			.notNull()
			.references(() => system.id),

		/**
		 * Por qué lado se sale, de la roseta de ocho.
		 *
		 * Es para el mapa de la galaxia, que va a dibujarse como el de X4: cada
		 * sistema una casilla y sus salidas apuntando hacia afuera. Sin rumbo, dos
		 * puertas del mismo sistema no tienen dónde ponerse.
		 */
		bearing: text('bearing', { enum: GATE_BEARINGS }).notNull(),

		/**
		 * La puerta de la otra punta, **o nulo mientras no esté conectada**.
		 *
		 * Anulable porque el constructor trabaja por pasos: primero se planta la
		 * puerta en el sistema y después se la enlaza, y a veces el sistema del otro
		 * lado todavía no existe. Una puerta sin destino es una puerta que no lleva
		 * a ninguna parte, que es un estado legítimo de una obra en curso.
		 */
		destinationId: integer('destination_id').references((): AnySQLiteColumn => body.id),

		/** Cuánto hay que saltar, en décimas de año luz. Entero, como todo. */
		jumpDistance: integer('jump_distance').notNull().default(0),

		/**
		 * Si está cerrada: existe, lleva a algún lado, y **no se puede cruzar**.
		 *
		 * Es distinto de no estar conectada. Una puerta sin destino es obra a medio
		 * hacer; una cerrada es una decisión: sirve para **aislar un sistema** sin
		 * borrarle las salidas ni tocar el mapa, que es lo que haría falta para una
		 * cuarentena, un bloqueo de facción o un evento del mundo.
		 *
		 * Se guarda en las dos puntas porque una puerta cerrada de un lado está
		 * cerrada, y punto: leer sólo la punta de acá dejaría entrar a quien viene
		 * de la otra.
		 */
		closed: integer('closed', { mode: 'boolean' }).notNull().default(false)
	},
	(table) => [
		uniqueIndex('gate_body_idx').on(table.bodyId),
		uniqueIndex('gate_rumbo_idx').on(table.systemId, table.bearing),
		index('gate_destination_idx').on(table.destinationId)
	]
);

export const stationService = sqliteTable(
	'station_service',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		stationId: integer('station_id')
			.notNull()
			.references(() => station.id),
		service: text('service', { enum: STATION_SERVICES }).notNull()
	},
	(table) => [uniqueIndex('station_service_unico').on(table.stationId, table.service)]
);

/**
 * Un NPC sentado en una estación, que reparte trabajo.
 *
 * Cuelga de la estación —es donde se lo encuentra— pero trabaja para una
 * **corporación**, que puede no ser la que opera esa estación. De ahí sale que
 * un mismo puerto ofrezca trabajo de varias corporaciones y de facciones
 * distintas.
 */
export const agent = sqliteTable(
	'agent',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		code: text('code').notNull(),
		name: text('name').notNull(),
		stationId: integer('station_id')
			.notNull()
			.references(() => station.id),
		corporationId: integer('corporation_id')
			.notNull()
			.references(() => corporation.id),
		/**
		 * Nivel de las misiones que reparte, del 1 al 5. Qué hace falta para que
		 * atienda lo decide la reputación, que se calcula y no se guarda acá.
		 */
		level: integer('level').notNull().default(1),
		missionKind: text('mission_kind', { enum: MISSION_KINDS }).notNull(),
		description: text('description').notNull().default(''),
		/** Con qué fondo de retratos se lo dibuja. Ver static/portraits/LEEME.md. */
		appearance: text('appearance', { enum: APPEARANCES }).notNull().default('x')
	},
	(table) => [
		uniqueIndex('agent_code_idx').on(table.code),
		index('agent_station_idx').on(table.stationId),
		index('agent_corporation_idx').on(table.corporationId)
	]
);

// --- La nave -----------------------------------------------------------------
//
// Se guarda **lo mínimo**: qué casco es y qué módulo hay en cada ranura. Todo lo
// demás —masa total, velocidad, alcance, puntos efectivos, rendimiento— se
// calcula con `buildReadout` cada vez que hace falta.

/**
 * Una nave, de un piloto.
 *
 * `hull` es el código de un casco del catálogo, no una clave foránea: los cascos
 * son contenido del juego y viven en el código, igual que las profesiones.
 */
export const ship = sqliteTable(
	'ship',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		pilotId: integer('pilot_id')
			.notNull()
			.references(() => pilot.id),
		hull: text('hull').notNull(),

		/**
		 * El nombre que le puso el piloto. Vacío quiere decir "la llamamos por su
		 * casco", que es lo que hace todo el mundo con su primera nave.
		 */
		name: text('name').notNull().default(''),

		/**
		 * Lo que le queda en el tanque.
		 *
		 * **Es el contenido, no la capacidad.** La capacidad la calcula el
		 * equipamiento —sale del casco más los módulos— y vive en la ficha; esto es
		 * cuánto hay ahora, que es estado de la partida y por eso está en la base.
		 *
		 * Sólo se gasta **saltando**. Moverse dentro de un sistema no consume nada,
		 * y eso es a propósito: un piloto sin combustible se queda sin poder salir
		 * del sistema, no tirado en el vacío. La peor situación posible es estar en
		 * un lugar donde todavía se puede minar, vender y comprar.
		 */
		fuel: integer('fuel').notNull().default(0),

		/**
		 * Cuál está usando. Una bandera y no una nave única por piloto: tener
		 * varias es "por decidir" en docs/systems/SHIPS.md, y así la puerta queda
		 * abierta sin costar nada hoy.
		 */
		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
	},
	(table) => [index('ship_pilot_idx').on(table.pilotId)]
);

/**
 * Un módulo montado en una ranura de una nave.
 *
 * Se llama `fittedModule` y no `shipModule` porque ese nombre ya es el del
 * módulo del catálogo. Dos cosas distintas con el mismo nombre en dos capas es
 * exactamente cómo se pierde una tarde.
 *
 * `slotIndex` es la posición en `hull.slots`, así que una fila sólo tiene
 * sentido junto al casco de su nave. Es lo que permite guardar la configuración
 * entera sin una tabla de ranuras: el casco ya sabe cuáles tiene.
 */
export const fittedModule = sqliteTable(
	'fitted_module',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		shipId: integer('ship_id')
			.notNull()
			.references(() => ship.id),
		slotIndex: integer('slot_index').notNull(),
		moduleCode: text('module_code').notNull()
	},
	// Una ranura no puede tener dos módulos. El código ya lo asume al reescribir
	// la configuración entera; la base lo hace cumplir.
	(table) => [uniqueIndex('fitted_module_unico').on(table.shipId, table.slotIndex)]
);

// --- La acción en curso ------------------------------------------------------

/**
 * La orden que un piloto tiene en curso.
 *
 * Una sola fila por piloto: no hay cola ("una acción por vez, sin cola, al menos
 * por ahora", docs/systems/ACTIONS.md), así que `pilotId` es único. Cuando la
 * acción se resuelve, la fila se borra — no hay bitácora todavía, sólo la orden
 * viva.
 */
export const pilotAction = sqliteTable(
	'pilot_action',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		pilotId: integer('pilot_id')
			.notNull()
			.references(() => pilot.id),

		/**
		 * Qué clase de orden es. Tipado contra el catálogo de `game/actions`: el
		 * `kind` viaja hasta dos tablas, y un error de tipeo llegaría a la base sin
		 * que nada lo frene. Abre la puerta a "mine" y las demás sin otra tabla.
		 */
		kind: text('kind', { enum: ACTION_KINDS }).notNull(),

		startedAt: integer('started_at', { mode: 'timestamp' }).notNull().default(NOW),
		durationSeconds: integer('duration_seconds').notNull(),

		/**
		 * Dónde ocurre la acción, y adónde va si es que va a algún lado.
		 *
		 * El destino es **anulable a propósito**: minar y refinar ocurren donde
		 * estás parado, y una acción que no se mueve tiene que poder decirlo. Es la
		 * misma forma que ya tiene `pilot_log`, que nació así.
		 */
		originBodyId: integer('origin_body_id')
			.notNull()
			.references(() => body.id),
		destinationBodyId: integer('destination_body_id').references(() => body.id),

		/**
		 * La orden que se está acordando, si la acción es publicar.
		 *
		 * La orden se escribe al **encargar** —con su garantía tomada y su fecha de
		 * apertura— y la acción sólo apunta a ella. Guardar acá precio, cantidad y
		 * alcance sería tener los mismos datos en dos lugares, y el día que no
		 * coincidan gana el que alguien recuerde leer.
		 */
		orderId: integer('order_id').references(() => marketOrder.id),

		/**
		 * La roca que se está picando o leyendo, si la acción es de cinturón.
		 *
		 * Queda **nula si la roca desaparece** mientras la orden corre: otro piloto
		 * pudo terminarla, y eso no es un error sino el mundo siguiendo su curso. La
		 * resolución lo trata como lo que es —no había nada que sacar— igual que ya
		 * hacía cuando el depósito se vaciaba.
		 */
		asteroidId: integer('asteroid_id').references(() => asteroid.id, { onDelete: 'set null' }),

		/**
		 * Sobre qué trabaja la acción, si trabaja sobre algo.
		 *
		 * Minar necesita saber **qué mineral**; refinar y fabricar van a necesitar
		 * saber qué. Es un código de catálogo y no una clave foránea, igual que el
		 * casco de una nave: los catálogos son contenido del juego y no filas.
		 *
		 * Una columna y no una por acción: son todas la misma pregunta —sobre qué—,
		 * y una por cada una serían tres columnas vacías en cada fila.
		 */
		targetCode: text('target_code')
	},
	(table) => [uniqueIndex('pilot_action_pilot_idx').on(table.pilotId)]
);

/**
 * El pozo de experiencia de una rama del árbol.
 *
 * Una acción no le paga a una habilidad: le paga a la **familia** de la
 * actividad. Minar deposita en Extracción, y el piloto decide en qué habilidad
 * de esa rama gastarlo. Ver docs/systems/SKILLS.md.
 *
 * Es lo que convierte especializarse en una decisión. Con la experiencia yendo
 * derecha a la habilidad usada, el que mina se vuelve minero gratis y sin
 * renunciar a nada; con el pozo, cuatro horas de minería alcanzan para subir
 * Minería un nivel **o** para abrir dos habilidades nuevas, no para las tres.
 *
 * Una fila por piloto y rama, y sólo de las ramas que alguna vez recibieron
 * algo: una rama sin fila es una rama en cero.
 */
export const pilotPool = sqliteTable(
	'pilot_pool',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		pilotId: integer('pilot_id')
			.notNull()
			.references(() => pilot.id),
		/** El código de la familia: `piloting`, `extraction`, y las demás. */
		family: text('family').notNull(),
		/** Lo que queda por gastar. Lo depositado menos lo ya invertido. */
		xp: integer('xp').notNull().default(0)
	},
	// Una fila por piloto y rama: el código lo da por sentado al depositar, y sin
	// la restricción un duplicado partiría el pozo en dos y se descubriría tarde.
	(table) => [uniqueIndex('pilot_pool_unico').on(table.pilotId, table.family)]
);

/**
 * El informe de una acción ya resuelta: la bitácora del piloto.
 *
 * En un juego donde las cosas pasan mientras no estás, la bitácora no es un
 * adorno: es el relato de tu partida, y lo primero que se lee al volver. Por eso
 * cada acción que vence deja su fila acá, **en la misma transacción que la
 * resuelve**: un informe que se pierde es una acción que el jugador no sabe que
 * ocurrió.
 *
 * `readAt` es lo que apaga la notificación del Neocom. Nulo quiere decir que el
 * piloto todavía no lo vio.
 */
export const pilotLog = sqliteTable(
	'pilot_log',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		pilotId: integer('pilot_id')
			.notNull()
			.references(() => pilot.id),

		/**
		 * El mismo vocabulario que `pilot_action`, y por la misma razón. Sin `enum`
		 * acá, una acción vieja y una nueva podrían nombrarse distinto en el
		 * informe que en la orden.
		 */
		kind: text('kind', { enum: ACTION_KINDS }).notNull(),

		createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(NOW),
		/** Cuándo lo vio el piloto. Nulo mientras siga sin leer. */
		readAt: integer('read_at', { mode: 'timestamp' }),

		/** Cuánto duró la acción que se informa. */
		durationSeconds: integer('duration_seconds').notNull().default(0),

		/**
		 * Dónde pasó. Igual que en `pilot_action`, hoy sólo los llena un viaje;
		 * una acción que no se mueva de lugar los deja nulos.
		 */
		originBodyId: integer('origin_body_id').references(() => body.id),
		destinationBodyId: integer('destination_body_id').references(() => body.id),

		/**
		 * La experiencia repartida, como objeto JSON de código a puntos.
		 *
		 * Va serializado y no en filas aparte porque **es parte del informe, no un
		 * dato consultable**: nadie va a preguntar "cuántos informes dieron XP de
		 * Navegación", y una tabla hija obligaría a una consulta por fila para
		 * dibujar una lista paginada.
		 */
		xpAwarded: text('xp_awarded').notNull().default('{}'),

		/**
		 * Lo que la acción produjo, como JSON.
		 *
		 * Va en su propia columna y no adentro de `xp_awarded`: ese campo ya
		 * arrastra dos formas históricas, y meterle una tercera obligaría a
		 * desambiguar por olfato. La bitácora es el relato de la partida; un relato
		 * que hay que adivinar no sirve.
		 */
		result: text('result').notNull().default('{}')
	},
	// La bitácora se lee siempre igual: la de este piloto, de lo más nuevo a lo
	// más viejo. El índice es el que sostiene la paginación.
	(table) => [
		index('pilot_log_pilot_idx').on(table.pilotId, table.createdAt),
		index('pilot_log_sin_leer_idx').on(table.pilotId, table.readAt)
	]
);

// --- Relaciones --------------------------------------------------------------
//
// Declaradas para poder pedir un cuerpo con su estación y su corporación en una
// sola consulta: las pantallas del juego son densas y un N+1 ahí se nota.

export const bodyRelations = relations(body, ({ one, many }) => ({
	system: one(system, { fields: [body.systemId], references: [system.id] }),
	parent: one(body, { fields: [body.parentId], references: [body.id], relationName: 'orbita' }),
	children: many(body, { relationName: 'orbita' }),
	station: one(station)
}));

export const stationRelations = relations(station, ({ one, many }) => ({
	body: one(body, { fields: [station.bodyId], references: [body.id] }),
	corporation: one(corporation, {
		fields: [station.corporationId],
		references: [corporation.id]
	}),
	services: many(stationService),
	agents: many(agent)
}));

export const stationServiceRelations = relations(stationService, ({ one }) => ({
	station: one(station, { fields: [stationService.stationId], references: [station.id] })
}));

export const agentRelations = relations(agent, ({ one }) => ({
	station: one(station, { fields: [agent.stationId], references: [station.id] }),
	corporation: one(corporation, { fields: [agent.corporationId], references: [corporation.id] })
}));

export const systemRelations = relations(system, ({ one, many }) => ({
	constellation: one(constellation, {
		fields: [system.constellationId],
		references: [constellation.id]
	}),
	bodies: many(body)
}));

export const constellationRelations = relations(constellation, ({ one, many }) => ({
	region: one(region, { fields: [constellation.regionId], references: [region.id] }),
	systems: many(system)
}));

export const regionRelations = relations(region, ({ one, many }) => ({
	galaxy: one(galaxy, { fields: [region.galaxyId], references: [galaxy.id] }),
	constellations: many(constellation)
}));

export const pilotRelations = relations(pilot, ({ one, many }) => ({
	location: one(body, { fields: [pilot.locationId], references: [body.id] }),
	skills: many(pilotSkill),
	ships: many(ship)
}));

export const shipRelations = relations(ship, ({ one, many }) => ({
	pilot: one(pilot, { fields: [ship.pilotId], references: [pilot.id] }),
	fitted: many(fittedModule)
}));

export const fittedModuleRelations = relations(fittedModule, ({ one }) => ({
	ship: one(ship, { fields: [fittedModule.shipId], references: [ship.id] })
}));

export const pilotSkillRelations = relations(pilotSkill, ({ one }) => ({
	pilot: one(pilot, { fields: [pilotSkill.pilotId], references: [pilot.id] })
}));

/**
 * Lo que hay en un cinturón y cuánto queda.
 *
 * **La reserva es una sola y la comparten todos**: si muchos minan el mismo
 * cinturón, rinde menos para todos. Eso es lo que convierte al mapa en un lugar
 * disputado en vez de una lista de destinos, y lo que le da un motivo real a ir
 * más lejos.
 *
 * Se recupera sola con el paso del tiempo, y **la cuenta es perezosa**: se aplica
 * al mirar el cinturón, no con un proceso recorriendo el universo. Un cinturón
 * sólo le importa a alguien cuando alguien lo mira. Por eso hace falta
 * `restoredAt`: dice hasta cuándo se aplicó la recuperación, así llamar dos veces
 * seguidas no regala mineral.
 */
export const beltDeposit = sqliteTable(
	'belt_deposit',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		/** Un cuerpo de tipo `belt`. */
		bodyId: integer('body_id')
			.notNull()
			.references(() => body.id),
		/** El código del mineral, del catálogo de `game/items`. */
		oreCode: text('ore_code').notNull(),

		/** Unidades disponibles ahora mismo. */
		remaining: integer('remaining').notNull().default(0),
		/** El tope al que se recupera. */
		capacity: integer('capacity').notNull().default(0),
		/** Unidades que se rehacen por hora. */
		regenPerHour: integer('regen_per_hour').notNull().default(0),
		/** Hasta cuándo se aplicó la recuperación. */
		restoredAt: integer('restored_at', { mode: 'timestamp' }).notNull().default(NOW)
	},
	(table) => [
		uniqueIndex('belt_deposit_unico').on(table.bodyId, table.oreCode),
		index('belt_deposit_body_idx').on(table.bodyId)
	]
);

// --- Lo que se tiene: bodegas, montones y los dos libros ---------------------

/**
 * Una bodega: el lugar donde viven las cosas.
 *
 * Es una tabla propia y no dos columnas anulables en el inventario, y ésa es la
 * decisión importante. Con `shipId` y `stationId` anulables en cada montón, la
 * restricción "un solo montón por ítem y por lugar" necesitaría un índice único
 * sobre columnas nulas —y tanto SQLite como PostgreSQL tratan los nulos como
 * distintos entre sí, así que la restricción no restringiría nada y el mineral se
 * duplicaría sin que nada lo frene—. Con un `containerId`, el índice único es
 * trivial.
 *
 * De paso compra barato lo que viene: la bodega de una corporación es una fila
 * con otra columna, y un hangar de naves guardadas es otra `kind`. Ninguna de las
 * dos obliga a tocar `item_stack`.
 */
export const container = sqliteTable(
	'container',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),

		/** De qué es esta bodega. Define cuál de las referencias de abajo va llena. */
		kind: text('kind', { enum: CONTAINER_KINDS }).notNull(),

		/** La bodega de una nave: viaja con ella. */
		shipId: integer('ship_id').references(() => ship.id),

		/**
		 * La bodega que un piloto tiene alquilada en una estación: se queda ahí.
		 * Las dos columnas van juntas, porque cada piloto tiene la suya en cada
		 * estación.
		 */
		pilotId: integer('pilot_id').references(() => pilot.id),
		stationId: integer('station_id').references(() => station.id),

		createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(NOW)
	},
	(table) => [
		uniqueIndex('container_ship_unico').on(table.shipId),
		uniqueIndex('container_station_unico').on(table.pilotId, table.stationId),
		index('container_pilot_idx').on(table.pilotId)
	]
);

/**
 * Un montón de un ítem dentro de una bodega.
 *
 * Todo es **fungible**: dos ejemplares del mismo módulo son hoy indistinguibles,
 * así que guardar uno por fila sería pagar por una diferencia que no existe. El
 * día que haya desgaste o ingeniería, `module_instance` cuelga del **mismo
 * contenedor** y migra unas pocas filas de módulos —no los millones de unidades
 * de mineral, que van a seguir siendo fungibles para siempre—.
 *
 * `quantity` es un **caché del libro de ítems**: la verdad es la suma de los
 * asientos, y hay con qué recalcularla. Cero no es una fila en cero: es una fila
 * que se borra, porque un inventario lleno de ceros crece para siempre.
 */
export const itemStack = sqliteTable(
	'item_stack',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		containerId: integer('container_id')
			.notNull()
			.references(() => container.id),
		/** El código del catálogo de `game/items`. */
		itemCode: text('item_code').notNull(),
		/** Unidades. Nunca negativo. */
		quantity: integer('quantity').notNull().default(0)
	},
	(table) => [
		uniqueIndex('item_stack_unico').on(table.containerId, table.itemCode),
		// Para poder preguntar cuánto de un ítem hay en todo el juego, que es la
		// consulta con la que se audita una economía.
		index('item_stack_item_idx').on(table.itemCode)
	]
);

/**
 * El libro mayor de créditos: un asiento por cada movimiento de plata.
 *
 * Regla del proyecto: **todo movimiento de valor deja asiento**, y el saldo es la
 * suma de los asientos y no un número que se edita. Sumar seis años de asientos
 * en cada carga de pantalla no es viable, así que `pilot.credits` se conserva
 * como caché —y lo escribe **un solo módulo**, el servicio de billetera, en la
 * misma transacción que el asiento—.
 *
 * `balanceAfter` es lo que hace que una desviación se detecte sin recorrer todo:
 * el último asiento y `pilot.credits` tienen que coincidir siempre.
 */
export const creditEntry = sqliteTable(
	'credit_entry',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		pilotId: integer('pilot_id')
			.notNull()
			.references(() => pilot.id),
		/** Con signo: positivo lo que entra, negativo lo que sale. */
		amount: integer('amount').notNull(),
		/** El saldo que dejó este asiento. */
		balanceAfter: integer('balance_after').notNull(),
		/** Por qué se movió: `ore_sale`, `module_purchase`, y las que vengan. */
		kind: text('kind').notNull(),
		/** Dónde pasó, si pasó en algún lado. */
		bodyId: integer('body_id').references(() => body.id),
		/** El informe que lo explica, si nació de una acción. */
		logId: integer('log_id').references(() => pilotLog.id),
		memo: text('memo').notNull().default(''),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(NOW)
	},
	(table) => [index('credit_entry_pilot_idx').on(table.pilotId, table.createdAt)]
);

/**
 * El libro mayor de ítems: un asiento por cada cosa que entra o sale.
 *
 * Son dos libros y no uno porque las preguntas son dos y distintas: "qué
 * movimientos tuvo mi billetera" y "de dónde salió esta unidad de iridio". En una
 * sola tabla, la mitad de las columnas estaría vacía en cada fila y las dos
 * consultas saldrían peor. Cuando una operación mueve plata y carga, los dos
 * asientos se escriben en la misma transacción.
 */
export const itemEntry = sqliteTable(
	'item_entry',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		containerId: integer('container_id')
			.notNull()
			.references(() => container.id),
		itemCode: text('item_code').notNull(),
		/** Con signo: positivo lo que entra, negativo lo que sale. */
		quantity: integer('quantity').notNull(),
		/** Cómo quedó el montón después de este asiento. */
		quantityAfter: integer('quantity_after').notNull(),
		/** Por qué se movió: `mined`, `sold`, `bought`, `granted`, `transferred`. */
		kind: text('kind').notNull(),
		/** El otro lado de un traslado, cuando lo hay. */
		counterpartId: integer('counterpart_id').references((): AnySQLiteColumn => container.id),
		logId: integer('log_id').references(() => pilotLog.id),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(NOW)
	},
	(table) => [
		index('item_entry_container_idx').on(table.containerId, table.createdAt),
		index('item_entry_item_idx').on(table.itemCode, table.createdAt)
	]
);

/**
 * Una orden del mercado: alguien que quiere comprar o vender algo, a un precio.
 *
 * **Sólo las de los jugadores viven acá.** Las de la estación no se guardan: se
 * calculan a partir del precio de referencia y del rubro de la corporación. Si se
 * guardaran serían doscientas filas que habría que resembrar cada vez que se
 * mueva una fórmula, y además su precio no es el mismo para todos —Regateo lo
 * cambia— así que no hay un número que escribir.
 *
 * `quantity` es lo que **queda**, y cuando llega a cero la fila se borra: una
 * orden agotada no es una orden, y un libro lleno de ceros ensucia toda consulta
 * que lo recorra. Lo que pasó queda en los dos libros mayores, que es donde se
 * mira la historia.
 *
 * **La garantía es el corazón de esto.** Una orden de compra reserva los créditos
 * en el momento de publicarse y una de venta reserva la mercadería; sin eso, una
 * orden es una promesa que puede no valer nada cuando alguien la acepte. La
 * columna `escrow` guarda lo reservado en créditos para poder devolverlo exacto
 * al cancelar, sin recalcular un precio que puede haber cambiado.
 */
export const marketOrder = sqliteTable(
	'market_order',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		/** `buy` o `sell`, mirado desde quien la publicó. */
		kind: text('kind').notNull(),
		itemCode: text('item_code').notNull(),
		/** Dónde está la orden: acá se entrega y acá se retira. */
		stationId: integer('station_id')
			.notNull()
			.references(() => station.id),
		pilotId: integer('pilot_id')
			.notNull()
			.references(() => pilot.id),
		/** Créditos por unidad. */
		price: integer('price').notNull(),
		/** Lo que queda por comerciar. */
		quantity: integer('quantity').notNull(),
		/** Con cuánto salió, para poder contar cuánto lleva cumplido. */
		initialQuantity: integer('initial_quantity').notNull(),
		/**
		 * Cuántas regiones alcanza, contando la propia. Cero es "sólo en esta
		 * estación". Sólo lo usan las de compra: la mercadería de una venta está en
		 * un lugar concreto y de ahí se retira.
		 */
		rangeRegions: integer('range_regions').notNull().default(0),
		/** Créditos reservados. Cero en las de venta, que reservan mercadería. */
		escrow: integer('escrow').notNull().default(0),
		/**
		 * Cuándo entra al libro.
		 *
		 * Publicar es una acción que lleva tiempo —se está acordando el trato— y la
		 * orden recién se ve cuando ese tiempo pasó. Es **una fecha y no un
		 * interruptor** por la misma razón que todo lo demás en este juego: así la
		 * orden abre sola con el reloj y no puede quedar desincronizada de la acción
		 * que la trajo, ni siquiera si el piloto no vuelve a entrar nunca.
		 *
		 * El valor por defecto es **cero y no `unixepoch()`** porque SQLite no acepta
		 * agregar una columna con un default que no sea constante, y porque un
		 * `Date` de JavaScript ahí sale escrito como texto. Cero es la época: una
		 * orden sin fecha explícita queda abierta desde siempre, que es lo correcto
		 * para las que ya existían.
		 */
		opensAt: integer('opens_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`0`),
		/**
		 * Cuándo se cae del libro.
		 *
		 * **Ninguna orden es eterna.** Sin vencimiento, el libro se llena de precios
		 * viejos de pilotos que dejaron de jugar, y un mercado que muestra ofertas
		 * que nadie va a honrar es peor que uno vacío. Cuánto se puede estirar sale
		 * de Contactos: un comerciante con agenda deja tratos parados más tiempo.
		 *
		 * Al vencer, la garantía vuelve entera —la mercadería a la bodega de la
		 * estación, los créditos a la billetera—: caducar no es perder.
		 *
		 * El valor por defecto existe sólo para poder agregar la columna a una tabla
		 * que ya tiene filas. **Nadie debería apoyarse en él** —toda orden fija su
		 * vencimiento al publicarse, y hay un test que lo exige—; que sea la época
		 * es a propósito, porque una orden sin vencimiento explícito conviene que se
		 * caiga sola y no que viva para siempre.
		 */
		expiresAt: integer('expires_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`0`),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(NOW)
	},
	(table) => [
		// El libro se lee siempre igual: qué hay de este ítem, ordenado por precio.
		index('market_order_book_idx').on(table.itemCode, table.kind, table.price),
		index('market_order_station_idx').on(table.stationId),
		index('market_order_pilot_idx').on(table.pilotId)
	]
);

/**
 * Una operación cerrada del mercado. **El precio de algo es su historia.**
 *
 * Es una tabla aparte de los dos libros mayores a propósito: aquéllos contestan
 * "qué le pasó a mi billetera" y "de dónde salió esta unidad", y ésta contesta
 * una pregunta de mercado y no de contabilidad —"¿a cuánto se estuvo vendiendo el
 * iridio en esta región?"—. Meterla en `credit_entry` obligaría a filtrar por
 * tipo de asiento y a sacar el precio de una división, y la consulta que dibuja
 * un gráfico recorrería asientos de sueldos y de combustible para nada.
 *
 * Se escribe **también cuando la contraparte es la estación**: si sólo contara lo
 * de los jugadores, un mercado recién abierto no tendría ni un punto que dibujar
 * justo cuando más falta hace saber cuánto vale lo que uno trae.
 */
export const marketTrade = sqliteTable(
	'market_trade',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		itemCode: text('item_code').notNull(),
		stationId: integer('station_id')
			.notNull()
			.references(() => station.id),
		/** Créditos por unidad, que es lo que se grafica. */
		price: integer('price').notNull(),
		quantity: integer('quantity').notNull(),
		/** Si del otro lado estaba la estación y no otro piloto. */
		fromStation: integer('from_station', { mode: 'boolean' }).notNull().default(false),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(NOW)
	},
	(table) => [
		// Así se lee siempre: la historia de un ítem, del más nuevo al más viejo.
		index('market_trade_item_idx').on(table.itemCode, table.createdAt),
		index('market_trade_station_idx').on(table.stationId)
	]
);

/**
 * Una roca de un cinturón: lo que se escanea y lo que se mina.
 *
 * Es el ejemplar de lo que el depósito describe. El depósito dice qué puede dar
 * ese cinturón y a qué ritmo se repone; **esta tabla son las rocas que hay ahora
 * mismo**, cada una con su mineral y con lo que le queda.
 *
 * Una roca agotada **se borra**. No queda en cero: una roca vacía no es una roca,
 * y un campo lleno de ceros ensucia toda consulta que lo recorra. El cinturón
 * repone otras a su propio ritmo, así que el agotamiento sigue siendo compartido
 * —el que llega primero se la lleva— pero a una escala que se puede señalar.
 *
 * `identified` no vive acá sino en la lectura del piloto: qué roca es, es algo
 * que **cada uno averigua**, no una propiedad de la roca.
 */
export const asteroid = sqliteTable(
	'asteroid',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		bodyId: integer('body_id')
			.notNull()
			.references(() => body.id),
		oreCode: text('ore_code').notNull(),
		/** Lo que le queda. Cuando llega a cero, la fila se borra. */
		units: integer('units').notNull(),
		/** Con cuánto apareció, para poder decir cuán trabajada está. */
		initialUnits: integer('initial_units').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(NOW)
	},
	(table) => [index('asteroid_body_idx').on(table.bodyId)]
);

/**
 * Lo que un piloto sabe de **una roca**: su última lectura.
 *
 * Las rocas de un cinturón se ven desde lejos —son bultos en el radar— pero de
 * qué son y cuánto tienen no se sabe sin apuntarles el escáner. Eso lo escribe
 * esta tabla, y por eso es por piloto: **no es una propiedad de la roca sino de
 * quién la miró**. Dos pilotos en el mismo campo pueden tener identificadas rocas
 * distintas.
 *
 * Una fila por piloto y roca. Volver a escanear **reemplaza** la lectura: lo que
 * importa es lo último que se vio, y un historial de lecturas viejas sería
 * guardar el error de ayer.
 *
 * La fila se va con la roca —tiene su clave foránea—, así que cuando alguien la
 * agota la lectura desaparece sola y no queda nadie recordando una piedra que ya
 * no existe.
 */
export const asteroidSurvey = sqliteTable(
	'asteroid_survey',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		pilotId: integer('pilot_id')
			.notNull()
			.references(() => pilot.id),
		asteroidId: integer('asteroid_id')
			.notNull()
			.references(() => asteroid.id),
		/**
		 * Qué tan fina salió: 0 dice de qué es, 1 agrega cuánto tiene. Se guarda **la
		 * profundidad con la que se leyó** y no se recalcula al mostrarla: subir la
		 * habilidad después no mejora una lectura vieja, hay que volver a mirar.
		 */
		depth: integer('depth').notNull().default(0),
		takenAt: integer('taken_at', { mode: 'timestamp' }).notNull().default(NOW)
	},
	(table) => [uniqueIndex('asteroid_survey_unico').on(table.pilotId, table.asteroidId)]
);

/**
 * Un rol: un manojo de permisos con nombre.
 *
 * **Los roles son filas y los permisos no.** Un permiso es la llave que algún
 * `if` del servidor consulta, así que inventarlo desde un panel sería una
 * casilla que no abre nada; un rol, en cambio, es una manera de agrupar llaves y
 * tiene todo el sentido armarlo sin desplegar código.
 *
 * `builtin` marca los que trae la siembra. No se pueden borrar ni renombrar
 * —quedarse sin el rol de administrador es quedarse afuera del cuartel— pero sí
 * se les pueden cambiar los permisos: el día que el catálogo crezca, el
 * administrador tiene que poder recibir las llaves nuevas.
 */
/**
 * Una sanción sobre una cuenta: un aviso, una suspensión o un baneo.
 *
 * **Es una tabla y no dos columnas en el piloto**, y la razón es la pregunta que
 * se hace siempre al moderar: «¿ya lo habíamos suspendido antes?». Con dos
 * columnas, el estado actual pisa al anterior y esa pregunta sólo se puede
 * contestar recorriendo el registro de eventos a mano.
 *
 * El registro guarda **el hecho** —quién sancionó a quién y cuándo— y esto guarda
 * **el estado**: cuáles siguen puestas, cuál vence cuándo, cuál se levantó. Es el
 * mismo reparto que con los roles de un piloto, y por la misma razón.
 *
 * Una cuenta puede tener varias vigentes a la vez y eso es correcto: un aviso no
 * impide nada, así que convive con una suspensión. Cuál le cierra la puerta lo
 * decide `blockingSanction`, que es una función pura.
 */
export const sanction = sqliteTable(
	'sanction',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		pilotId: integer('pilot_id')
			.notNull()
			.references(() => pilot.id),

		kind: text('kind', { enum: SANCTION_KINDS }).notNull(),

		/**
		 * Por qué.
		 *
		 * Obligatorio, y no por burocracia: es lo primero que reclama quien la
		 * recibe, y lo primero que busca quien la revisa seis meses después.
		 */
		reason: text('reason').notNull(),

		/**
		 * Hasta cuándo, o nulo si no vence.
		 *
		 * Sólo la suspensión lo lleva. Una suspensión sin fecha sería un baneo con
		 * otro nombre, y un baneo con fecha sería una suspensión; la regla la hace
		 * cumplir `sanctionProblem`.
		 */
		until: integer('until', { mode: 'timestamp' }),

		/**
		 * Quién la puso, **sin clave foránea**.
		 *
		 * Igual que en el registro de eventos: el administrador que sancionó puede
		 * darse de baja después, y su firma tiene que seguir ahí. El nombre se
		 * guarda al lado por lo mismo.
		 */
		issuedBy: integer('issued_by'),
		issuedByName: text('issued_by_name').notNull().default(''),

		createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(NOW),

		/** Cuándo se la levantó a mano, y quién. Nulo mientras siga puesta. */
		liftedAt: integer('lifted_at', { mode: 'timestamp' }),
		liftedBy: integer('lifted_by'),
		liftedByName: text('lifted_by_name').notNull().default('')
	},
	(table) => [index('sanction_pilot_idx').on(table.pilotId)]
);

export const role = sqliteTable(
	'role',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		/** Corto y estable: es lo que el código nombra cuando necesita uno. */
		code: text('code').notNull(),
		name: text('name').notNull(),
		description: text('description').notNull().default(''),
		builtin: integer('builtin', { mode: 'boolean' }).notNull().default(false),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(NOW)
	},
	(table) => [uniqueIndex('role_code_idx').on(table.code)]
);

/**
 * Una llave que lleva un rol.
 *
 * Una fila por permiso en vez de una lista guardada en una columna: así se puede
 * preguntar quién tiene tal permiso sin leer todos los roles y desarmar textos,
 * que es la consulta que va a hacer falta el día que alguien pregunte quién
 * puede borrar cuentas.
 */
export const rolePermission = sqliteTable(
	'role_permission',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		roleId: integer('role_id')
			.notNull()
			.references(() => role.id),
		/** Un código del catálogo de `$lib/permissions.ts`. */
		permission: text('permission').notNull()
	},
	(table) => [uniqueIndex('role_permission_unico').on(table.roleId, table.permission)]
);

/**
 * Qué roles tiene un piloto.
 *
 * Varios por piloto a propósito: los oficios de administración se acumulan —el
 * que modera también puede mirar estadísticas— y un solo rol por cuenta obligaría
 * a inventar un rol combinado por cada mezcla que haga falta.
 *
 * Queda escrito **quién lo dio y cuándo**. Repartir poder es de las cosas que hay
 * que poder auditar, y el registro de eventos guarda el hecho pero esto guarda el
 * estado: con sólo el registro, saber quién le dio el rol a alguien obligaría a
 * recorrer el historial entero.
 */
export const pilotRole = sqliteTable(
	'pilot_role',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		pilotId: integer('pilot_id')
			.notNull()
			.references(() => pilot.id),
		roleId: integer('role_id')
			.notNull()
			.references(() => role.id),
		/** Quién se lo dio, o nulo si lo puso la siembra. */
		grantedBy: integer('granted_by').references(() => pilot.id),
		grantedAt: integer('granted_at', { mode: 'timestamp' }).notNull().default(NOW)
	},
	(table) => [
		uniqueIndex('pilot_role_unico').on(table.pilotId, table.roleId),
		index('pilot_role_pilot_idx').on(table.pilotId)
	]
);

/**
 * El registro de lo que pasó: quién hizo qué, cuándo y sobre qué.
 *
 * Es **append-only**: no se edita ni se borra una fila. Un registro que se puede
 * retocar no sirve para lo único que sirve un registro, que es creerle cuando
 * algo no cierra.
 *
 * Guarda `kind` y un JSON, y **no la frase ya escrita**. Es la misma decisión que
 * toma la bitácora del piloto y por la misma razón: cambiar cómo se redacta un
 * evento no debería obligar a reescribir el pasado, y un historial con dos
 * redacciones distintas del mismo hecho se lee como si fueran dos hechos.
 *
 * El actor es **anulable**: hay cosas que no las hace nadie —una orden que
 * caduca, la siembra que crea el universo— y forzar un responsable inventaría
 * uno.
 */
export const auditEvent = sqliteTable(
	'audit_event',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		/** Un código del catálogo de eventos. */
		kind: text('kind').notNull(),
		/**
		 * Quién lo hizo, o nulo si no lo hizo nadie.
		 *
		 * **Sin clave foránea**, igual que el sujeto y por lo mismo: el día que una
		 * cuenta se da de baja, todo lo que esa cuenta hizo tiene que seguir
		 * constando. Con una foránea habría que elegir entre borrar su historial o
		 * dejarlo anónimo, y las dos cosas son lo contrario de un registro. El
		 * nombre se guarda además en el JSON, así que la fila se lee completa
		 * aunque el piloto ya no exista.
		 */
		actorId: integer('actor_id'),
		/**
		 * Sobre qué fue, en dos campos sueltos y sin clave foránea.
		 *
		 * Sin foránea a propósito: el registro tiene que sobrevivir a lo que
		 * describe. Un evento que dice "se borró la cuenta 7" apunta a una fila que
		 * ya no existe, y con una foránea o no se podría escribir o se borraría con
		 * ella, que es exactamente lo contrario de para qué está.
		 */
		subjectKind: text('subject_kind').notNull().default(''),
		subjectId: integer('subject_id'),
		/** Los datos del hecho, para poder redactarlo después. */
		payload: text('payload').notNull().default('{}'),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(NOW)
	},
	(table) => [
		index('audit_event_fecha_idx').on(table.createdAt),
		index('audit_event_kind_idx').on(table.kind),
		index('audit_event_actor_idx').on(table.actorId)
	]
);

// --- Tipos que usa el resto de la aplicación ---------------------------------

export type Pilot = typeof pilot.$inferSelect;
export type PilotSkill = typeof pilotSkill.$inferSelect;
export type AuthSession = typeof authSession.$inferSelect;
export type Galaxy = typeof galaxy.$inferSelect;
export type Region = typeof region.$inferSelect;
export type Constellation = typeof constellation.$inferSelect;
export type System = typeof system.$inferSelect;
export type Body = typeof body.$inferSelect;
export type Corporation = typeof corporation.$inferSelect;
export type Station = typeof station.$inferSelect;
export type StationService = typeof stationService.$inferSelect;
export type Gate = typeof gate.$inferSelect;
export type Sanction = typeof sanction.$inferSelect;
export type Agent = typeof agent.$inferSelect;
export type Ship = typeof ship.$inferSelect;
export type FittedModule = typeof fittedModule.$inferSelect;
export type PilotAction = typeof pilotAction.$inferSelect;
export type PilotLog = typeof pilotLog.$inferSelect;
export type PilotPool = typeof pilotPool.$inferSelect;
export type Container = typeof container.$inferSelect;
export type ItemStack = typeof itemStack.$inferSelect;
export type CreditEntry = typeof creditEntry.$inferSelect;
export type ItemEntry = typeof itemEntry.$inferSelect;
export type BeltDeposit = typeof beltDeposit.$inferSelect;
export type MarketOrder = typeof marketOrder.$inferSelect;
export type MarketTrade = typeof marketTrade.$inferSelect;
export type Asteroid = typeof asteroid.$inferSelect;
export type AsteroidSurvey = typeof asteroidSurvey.$inferSelect;
export type Role = typeof role.$inferSelect;
export type RolePermission = typeof rolePermission.$inferSelect;
export type PilotRole = typeof pilotRole.$inferSelect;
export type AuditEvent = typeof auditEvent.$inferSelect;
