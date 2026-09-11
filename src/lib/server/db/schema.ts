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
import { APPEARANCES, MISSION_KINDS } from '../game/agents';
import { BODY_KINDS, CORPORATION_KINDS, GOVERNMENTS, STATION_SERVICES } from '../game/universe';

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
		 * Por ahora sólo "travel"; abre la puerta a "mine" y las demás sin tener
		 * que agregar otra tabla.
		 */
		kind: text('kind').notNull(),

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
