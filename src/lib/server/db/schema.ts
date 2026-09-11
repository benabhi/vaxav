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
import { BODY_KINDS, CORPORATION_KINDS, GOVERNMENTS, STATION_SERVICES } from '$lib/game/universe';

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
			.references(() => region.id)
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
		 * Cómo se gobierna. De acá sale la seguridad, que no se guarda: se calcula
		 * con `securityFor`.
		 */
		government: text('government', { enum: GOVERNMENTS }).notNull().default('corporate'),

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

		description: text('description').notNull().default('')
	},
	(table) => [
		uniqueIndex('system_code_idx').on(table.code),
		index('system_constellation_idx').on(table.constellationId)
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
		 * Sólo tienen sentido para un viaje; otras acciones —minar, por ejemplo— no
		 * los van a usar, pero no vale la pena una tabla por tipo de acción todavía
		 * para uno solo.
		 */
		originBodyId: integer('origin_body_id')
			.notNull()
			.references(() => body.id),
		destinationBodyId: integer('destination_body_id')
			.notNull()
			.references(() => body.id)
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
		xpAwarded: text('xp_awarded').notNull().default('{}')
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
