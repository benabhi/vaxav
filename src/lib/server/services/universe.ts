/**
 * Siembra y consulta del universo.
 *
 * El universo es **dato de referencia**: lo escribe el guión de siembra y lo lee
 * todo el juego. Por eso la siembra es idempotente —se busca por código, se crea
 * lo que falta y se actualiza lo que cambió—: correrla diez veces deja lo mismo
 * que correrla una, y así el plano de `../game/universe` se puede corregir y
 * volver a aplicar sin borrar nada.
 */

import { seedAsteroids } from './asteroids';
import { eq, inArray } from 'drizzle-orm';
import {
	agent,
	beltDeposit,
	body,
	constellation,
	corporation,
	galaxy,
	region,
	station,
	stationService,
	system,
	type Agent,
	type Body,
	type Constellation,
	type Corporation,
	type Galaxy,
	type Region,
	type Station,
	type System
} from '../db/schema';
import type { Db } from '../db/types';
import type { AgentBlueprint } from '$lib/game/agents';
import {
	CORPORATIONS,
	GALAXY,
	securityLevel,
	type BodyBlueprint,
	type CorporationBlueprint,
	type DepositBlueprint,
	type GalaxyBlueprint,
	type SecurityLevel,
	type StationServiceKind
} from '$lib/game/universe';

/** El universo no está donde debería. El mensaje se le muestra a quien opera. */
export class UniverseError extends Error {}

/**
 * La ficha de un sistema: dónde está, quién lo controla y qué tiene.
 *
 * Se arma con una consulta por nivel de la jerarquía en vez de una por lectura:
 * son cuatro tablas y se suben todas juntas al abrir la pantalla.
 */
export interface SystemOverview {
	readonly system: System;
	readonly constellation: Constellation;
	readonly region: Region;
	readonly galaxy: Galaxy;
	/** El número guardado, de 0 a 100. */
	readonly security: number;
	/** En qué cajón cae ese número, que es como se lee. */
	readonly securityLevel: SecurityLevel;
	readonly claimable: boolean;
	readonly bodyCount: number;
	readonly stationCount: number;
	readonly exploredCount: number;
}

/**
 * Un agente con la corporación para la que trabaja, ya resuelta.
 *
 * La facción sale de la corporación, igual que en la estación: no se guarda dos
 * veces, así que no puede contradecirse.
 */
export interface AgentInfo {
	readonly agent: Agent;
	readonly corporation: Corporation;
}

/** Todo lo que se muestra de un cuerpo: el lugar exacto donde está el piloto. */
export interface BodyDetail {
	readonly body: Body;
	readonly parent: Body | null;
	readonly system: System;
	readonly station: Station | null;
	readonly corporation: Corporation | null;
	readonly services: readonly StationServiceKind[];
	readonly agents: readonly AgentInfo[];
}

/**
 * Un cuerpo del sistema, listo para dibujar.
 *
 * `depth` es cuán adentro del árbol está: 0 la estrella, 1 lo que la orbita, y
 * así. Es lo que la interfaz usa para sangrar.
 *
 * `isLast` y `hasChildren` salen de acá y no de la pantalla porque son **forma
 * del árbol**, y el árbol se conoce en este recorrido. Con la lista ya aplanada
 * habría que reconstruirlos mirando hacia adelante, que es más código y más
 * frágil.
 */
export interface SystemNode {
	readonly body: Body;
	readonly depth: number;
	readonly station: Station | null;
	readonly corporation: Corporation | null;
	readonly services: readonly StationServiceKind[];
	/** Último hijo de su padre: dibuja el codo del árbol en vez de la horquilla. */
	readonly isLast: boolean;
	/** Si algo lo orbita. Sólo estos nodos se pueden plegar. */
	readonly hasChildren: boolean;
}

// --- Siembra -----------------------------------------------------------------

/** Cuántas filas quedaron por nivel después de sembrar. */
/**
 * Cuánto **creó** la siembra, no cuánto hay.
 *
 * Cambió de significado junto con la regla: antes contaba todo lo que procesaba
 * y siempre daba lo mismo, así que no decía nada. Ahora un cero quiere decir «no
 * hacía falta nada», que es lo que uno quiere saber al correrla.
 */
export interface SeedCount {
	corporaciones: number;
	agentes: number;
	regiones: number;
	constelaciones: number;
	sistemas: number;
	cuerpos: number;
}

/** Siembra las corporaciones del mundo. Van antes que las estaciones. */
function seedCorporations(db: Db, blueprints: readonly CorporationBlueprint[]): number {
	let creadas = 0;

	for (const blueprint of blueprints) {
		const existente = db
			.select()
			.from(corporation)
			.where(eq(corporation.code, blueprint.code))
			.get();
		if (existente) continue;

		db.insert(corporation)
			.values({
				code: blueprint.code,
				name: blueprint.name,
				kind: blueprint.kind,
				faction: blueprint.faction,
				isNpc: true,
				description: blueprint.description
			})
			.run();
		creadas++;
	}

	return creadas;
}

/**
 * Instala los módulos de una estación recién creada.
 *
 * **Ya no quita los que sobran.** Quitar era lo correcto cuando el plano era la
 * verdad; ahora un módulo que no está en el plano puede haberlo instalado
 * alguien desde el constructor, y borrárselo en la próxima siembra sería el
 * peor de los errores silenciosos.
 */
function seedServices(db: Db, stationId: number, services: readonly StationServiceKind[]): void {
	for (const service of services) {
		db.insert(stationService)
			.values({ stationId, service })
			.onConflictDoNothing({ target: [stationService.stationId, stationService.service] })
			.run();
	}
}

/**
 * Sienta a los agentes de una estación recién creada.
 *
 * **Ya no sincroniza.** Antes borraba de la base los que no estuvieran en el
 * plano, y eso dejó de ser correcto el día que el constructor pasó a mandar: un
 * agente puesto desde el panel no está en el plano y no por eso sobra.
 */
function seedAgents(db: Db, stationId: number, agents: readonly AgentBlueprint[]): void {
	for (const blueprint of agents) {
		const corp = db
			.select()
			.from(corporation)
			.where(eq(corporation.code, blueprint.corporation))
			.get();
		if (!corp) {
			throw new UniverseError(
				`El agente '${blueprint.code}' trabaja para la corporación ` +
					`'${blueprint.corporation}', que no existe en el plano.`
			);
		}
		const values = {
			code: blueprint.code,
			name: blueprint.name,
			stationId,
			corporationId: corp.id,
			level: blueprint.level,
			missionKind: blueprint.missionKind,
			description: blueprint.description ?? ''
		};
		db.insert(agent).values(values).onConflictDoNothing({ target: agent.code }).run();
	}
}

/** Siembra un cuerpo y todo lo que cuelga de él. Devuelve cuántos escribió. */
/**
 * Los depósitos de un cinturón: el contenido, no el estado.
 *
 * **Sembrar no rellena los cinturones.** Un depósito que ya existe no se toca en
 * absoluto: ni su tope, ni su ritmo, ni lo que le queda. Sin esa regla, cada
 * `npm run db:seed` devolvería todos los cinturones del juego a capacidad llena y
 * borraría el trabajo de todos.
 *
 * Tampoco borra un mineral que no esté en el plano: puede haberlo puesto el
 * constructor.
 */
function seedDeposits(db: Db, bodyId: number, deposits: readonly DepositBlueprint[]): void {
	for (const spec of deposits) {
		db.insert(beltDeposit)
			.values({
				bodyId,
				oreCode: spec.ore,
				capacity: spec.capacity,
				regenPerHour: spec.regenPerHour,
				// Un cinturón nuevo nace lleno.
				remaining: spec.capacity
			})
			.onConflictDoNothing({ target: [beltDeposit.bodyId, beltDeposit.oreCode] })
			.run();
	}

	// Un cinturón virgen no tiene de dónde reponer —su marca es de recién— y
	// quedaría pelado hasta que pasara el tiempo. Esto le da su primera tanda de
	// rocas, y no toca las de un cinturón que ya las tiene: sembrar no rellena.
	seedAsteroids(db, bodyId);
}

function seedBody(
	db: Db,
	blueprint: BodyBlueprint,
	systemId: number,
	parentId: number | null = null
): number {
	const existente = db.select().from(body).where(eq(body.code, blueprint.code)).get();

	// El que ya está **no se toca en nada**: ni su nombre, ni su órbita, ni su
	// estación, ni sus minerales. Puede haberlo editado alguien desde el
	// constructor, y la siembra no tiene forma de saber si lo que dice el plano es
	// más nuevo o más viejo que lo que hay.
	//
	// Los hijos sí se recorren igual: agregarle una luna a un planeta que ya
	// existe es contenido nuevo, y eso sí hay que crearlo.
	if (existente) {
		let bajo = 0;
		for (const child of blueprint.children) {
			bajo += seedBody(db, child, systemId, existente.id);
		}
		return bajo;
	}

	const row = db
		.insert(body)
		.values({
			code: blueprint.code,
			name: blueprint.name,
			systemId,
			parentId,
			kind: blueprint.kind,
			orbitDistance: blueprint.orbitDistance,
			explored: blueprint.explored,
			description: blueprint.description
		})
		.returning()
		.get();

	let total = 1;

	if (blueprint.station) {
		const corp = db
			.select()
			.from(corporation)
			.where(eq(corporation.code, blueprint.station.corporation))
			.get();
		if (!corp) {
			throw new UniverseError(
				`La estación '${blueprint.code}' pertenece a la corporación ` +
					`'${blueprint.station.corporation}', que no existe en el plano.`
			);
		}

		const saved = db
			.insert(station)
			.values({ bodyId: row.id, corporationId: corp.id })
			.returning()
			.get();

		seedServices(db, saved.id, blueprint.station.services);
		seedAgents(db, saved.id, blueprint.station.agents);
	}

	seedDeposits(db, row.id, blueprint.deposits);

	for (const child of blueprint.children) {
		total += seedBody(db, child, systemId, row.id);
	}
	return total;
}

/**
 * Escribe en la base lo que falte del plano, y **nada más**.
 *
 * Cambió la regla que la gobierna. Antes el plano de `game/universe.ts` era la
 * verdad y la siembra lo imponía con `onConflictDoUpdate`: corregir el nombre de
 * un planeta era editar el archivo y volver a correrla.
 *
 * Desde que existe el constructor de sistemas, **la base manda**. El plano pasó a
 * ser la semilla del primer arranque: crea lo que no está y no toca una fila que
 * ya exista. Si no fuera así, cada `npm run db:seed` desharía en silencio todo lo
 * que alguien hubiera armado desde el panel, que es exactamente la clase de error
 * que no se nota hasta que el trabajo ya se perdió.
 *
 * La contrapartida, y hay que decirla: **corregir el plano ya no corrige la
 * base**. Un nombre mal escrito en Ánfora se arregla desde el constructor, o
 * borrando la base y volviendo a sembrar. Y como la base pasó a ser la única
 * copia del universo, deja de ser desechable.
 */
export function seedUniverse(db: Db, blueprint: GalaxyBlueprint = GALAXY): SeedCount {
	const savedGalaxy =
		db.select().from(galaxy).where(eq(galaxy.code, blueprint.code)).get() ??
		db.insert(galaxy).values({ code: blueprint.code, name: blueprint.name }).returning().get();

	const count: SeedCount = {
		corporaciones: seedCorporations(db, CORPORATIONS),
		agentes: 0,
		regiones: 0,
		constelaciones: 0,
		sistemas: 0,
		cuerpos: 0
	};

	for (const regionBp of blueprint.regions) {
		const existeRegion = db.select().from(region).where(eq(region.code, regionBp.code)).get();
		const savedRegion =
			existeRegion ??
			db
				.insert(region)
				.values({ code: regionBp.code, name: regionBp.name, galaxyId: savedGalaxy.id })
				.returning()
				.get();
		if (!existeRegion) count.regiones += 1;

		for (const constellationBp of regionBp.constellations) {
			const existeConstelacion = db
				.select()
				.from(constellation)
				.where(eq(constellation.code, constellationBp.code))
				.get();
			const savedConstellation =
				existeConstelacion ??
				db
					.insert(constellation)
					.values({
						code: constellationBp.code,
						name: constellationBp.name,
						regionId: savedRegion.id
					})
					.returning()
					.get();
			if (!existeConstelacion) count.constelaciones += 1;

			for (const systemBp of constellationBp.systems) {
				const existeSistema = db.select().from(system).where(eq(system.code, systemBp.code)).get();
				const savedSystem =
					existeSistema ??
					db
						.insert(system)
						.values({
							code: systemBp.code,
							name: systemBp.name,
							constellationId: savedConstellation.id,
							x: systemBp.x,
							y: systemBp.y,
							z: systemBp.z,
							description: systemBp.description,
							government: systemBp.government,
							security: systemBp.security,
							controllingFaction: systemBp.controllingFaction,
							capitalOf: systemBp.capitalOf
						})
						.returning()
						.get();
				if (!existeSistema) count.sistemas += 1;

				count.cuerpos += seedBody(db, systemBp.root, savedSystem.id);
			}
		}
	}

	count.agentes = db.select().from(agent).all().length;
	return count;
}

// --- Consulta ----------------------------------------------------------------

/** Busca un cuerpo por su código. */
export function getBody(db: Db, code: string): Body | null {
	return db.select().from(body).where(eq(body.code, code)).get() ?? null;
}

/**
 * Busca un cuerpo por su id.
 *
 * Existe además de `getBody` porque lo guardado en una orden en curso son ids,
 * no códigos: el origen y el destino de un viaje se leen así.
 */
export function getBodyById(db: Db, id: number): Body | null {
	return db.select().from(body).where(eq(body.id, id)).get() ?? null;
}

/**
 * El cuerpo de esa estación, o un error que dice qué hacer.
 *
 * Lo usa el alta de pilotos: sin universo sembrado no hay dónde ponerlos, y es
 * mejor decirlo que fallar por una clave foránea.
 */
export function requireStation(db: Db, code: string): Body {
	const found = getBody(db, code);
	if (!found) {
		throw new UniverseError(`No existe la estación '${code}'. ¿Corriste \`npm run db:seed\`?`);
	}
	if (found.kind !== 'station') {
		throw new UniverseError(`El cuerpo '${code}' no es una estación.`);
	}
	return found;
}

/** Busca un sistema por su código. */
export function getSystem(db: Db, code: string): System | null {
	return db.select().from(system).where(eq(system.code, code)).get() ?? null;
}

/** Todo lo que se muestra de un sistema salvo la lista de cuerpos. */
export function systemOverview(db: Db, code: string): SystemOverview | null {
	const found = getSystem(db, code);
	if (!found) return null;

	const foundConstellation = db
		.select()
		.from(constellation)
		.where(eq(constellation.id, found.constellationId))
		.get()!;
	const foundRegion = db
		.select()
		.from(region)
		.where(eq(region.id, foundConstellation.regionId))
		.get()!;
	const foundGalaxy = db.select().from(galaxy).where(eq(galaxy.id, foundRegion.galaxyId)).get()!;

	const bodies = db.select().from(body).where(eq(body.systemId, found.id)).all();

	return {
		system: found,
		constellation: foundConstellation,
		region: foundRegion,
		galaxy: foundGalaxy,
		// La seguridad **sí** está en la base: es un número que el constructor
		// elige dentro de la banda que le deja el gobierno. El cajón se calcula al
		// leerlo, porque es presentación y no dato.
		security: found.security,
		securityLevel: securityLevel(found.security),
		claimable: !found.controllingFaction,
		bodyCount: bodies.length,
		stationCount: bodies.filter((row) => row.kind === 'station').length,
		exploredCount: bodies.filter((row) => row.explored).length
	};
}

/**
 * Los agentes de una estación, con su corporación resuelta y ordenados.
 *
 * Por nivel y después por nombre: el orden en que un piloto los va a ir
 * abriendo, que es más útil que el orden en que se sembraron.
 */
function stationAgents(db: Db, stationId: number | null): readonly AgentInfo[] {
	if (stationId === null) return [];

	const agents = db.select().from(agent).where(eq(agent.stationId, stationId)).all();
	if (agents.length === 0) return [];

	const corporations = new Map(
		db
			.select()
			.from(corporation)
			.where(
				inArray(
					corporation.id,
					agents.map((row) => row.corporationId)
				)
			)
			.all()
			.map((row) => [row.id, row])
	);

	return agents
		.map((row) => ({ agent: row, corporation: corporations.get(row.corporationId)! }))
		.sort((a, b) => a.agent.level - b.agent.level || a.agent.name.localeCompare(b.agent.name));
}

/** La ficha completa de un cuerpo, con su estación si la tiene. */
export function bodyDetail(db: Db, code: string): BodyDetail | null {
	const found = getBody(db, code);
	if (!found) return null;

	const foundStation = db.select().from(station).where(eq(station.bodyId, found.id)).get() ?? null;
	const foundCorporation = foundStation
		? (db.select().from(corporation).where(eq(corporation.id, foundStation.corporationId)).get() ??
			null)
		: null;
	const services = foundStation
		? db
				.select()
				.from(stationService)
				.where(eq(stationService.stationId, foundStation.id))
				.all()
				.map((row) => row.service)
		: [];

	return {
		body: found,
		parent: found.parentId
			? (db.select().from(body).where(eq(body.id, found.parentId)).get() ?? null)
			: null,
		system: db.select().from(system).where(eq(system.id, found.systemId)).get()!,
		station: foundStation,
		corporation: foundCorporation,
		services,
		agents: stationAgents(db, foundStation?.id ?? null)
	};
}

/**
 * Distancia entre dos cuerpos del mismo sistema, sumando el árbol.
 *
 * No hay distancia par-a-par en la base: cada cuerpo sólo conoce la suya al
 * padre (`orbitDistance`). Se sube desde cada extremo acumulando esa distancia
 * hasta encontrar un ancestro en común, y se suman los dos tramos — el camino
 * más corto en un árbol es siempre a través de ese ancestro.
 */
export function bodyDistance(db: Db, originId: number, destinationId: number): number {
	if (originId === destinationId) return 0;

	/** [id, distancia acumulada hasta acá] desde el cuerpo hasta la raíz. */
	function pathToRoot(bodyId: number): [number, number][] {
		const path: [number, number][] = [];
		let distance = 0;
		let current = db.select().from(body).where(eq(body.id, bodyId)).get();
		while (current) {
			path.push([current.id, distance]);
			if (current.parentId === null) break;
			distance += current.orbitDistance;
			current = db.select().from(body).where(eq(body.id, current.parentId)).get();
		}
		return path;
	}

	const originPath = new Map(pathToRoot(originId));
	for (const [ancestorId, destinationDistance] of pathToRoot(destinationId)) {
		const originDistance = originPath.get(ancestorId);
		if (originDistance !== undefined) return originDistance + destinationDistance;
	}

	// No comparten raíz: no debería pasar dentro de un mismo sistema, pero si
	// pasa, mejor decirlo con un número que decir cero por accidente.
	throw new UniverseError(
		`Los cuerpos ${originId} y ${destinationId} no comparten un ancestro en el árbol del sistema.`
	);
}

/**
 * El sistema entero, en el orden en que se dibuja.
 *
 * Se traen todos los cuerpos, las estaciones y los servicios de una vez y se
 * arma el árbol en memoria: son pocas filas y evita una consulta por cuerpo, que
 * es el error que no se nota con un sistema y sí con doscientos.
 */
export function systemTree(db: Db, code: string): SystemNode[] {
	const found = getSystem(db, code);
	if (!found) return [];

	const bodies = db.select().from(body).where(eq(body.systemId, found.id)).all();
	if (bodies.length === 0) return [];

	const stations = new Map(
		db
			.select()
			.from(station)
			.where(
				inArray(
					station.bodyId,
					bodies.map((row) => row.id)
				)
			)
			.all()
			.map((row) => [row.bodyId, row])
	);

	const stationIds = [...stations.values()].map((row) => row.id);
	const corporations = new Map(
		stationIds.length
			? db
					.select()
					.from(corporation)
					.where(
						inArray(
							corporation.id,
							[...stations.values()].map((row) => row.corporationId)
						)
					)
					.all()
					.map((row) => [row.id, row])
			: []
	);

	const services = new Map<number, StationServiceKind[]>();
	if (stationIds.length) {
		for (const row of db
			.select()
			.from(stationService)
			.where(inArray(stationService.stationId, stationIds))
			.all()) {
			const list = services.get(row.stationId) ?? [];
			list.push(row.service);
			services.set(row.stationId, list);
		}
	}

	const children = new Map<number | null, Body[]>();
	for (const row of bodies) {
		const list = children.get(row.parentId) ?? [];
		list.push(row);
		children.set(row.parentId, list);
	}
	for (const list of children.values()) {
		list.sort((a, b) => a.orbitDistance - b.orbitDistance || a.name.localeCompare(b.name));
	}

	const nodes: SystemNode[] = [];

	function descend(parentId: number | null, depth: number): void {
		const siblings = children.get(parentId) ?? [];
		siblings.forEach((row, index) => {
			const foundStation = stations.get(row.id) ?? null;
			nodes.push({
				body: row,
				depth,
				station: foundStation,
				corporation: foundStation ? (corporations.get(foundStation.corporationId) ?? null) : null,
				services: foundStation ? (services.get(foundStation.id) ?? []) : [],
				isLast: index === siblings.length - 1,
				hasChildren: (children.get(row.id) ?? []).length > 0
			});
			descend(row.id, depth + 1);
		});
	}

	descend(null, 0);
	return nodes;
}
