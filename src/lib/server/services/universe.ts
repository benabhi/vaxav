/**
 * Siembra y consulta del universo.
 *
 * El universo es **dato de referencia**: lo escribe el guión de siembra y lo lee
 * todo el juego. Por eso la siembra es idempotente —se busca por código, se crea
 * lo que falta y se actualiza lo que cambió—: correrla diez veces deja lo mismo
 * que correrla una, y así el plano de `../game/universe` se puede corregir y
 * volver a aplicar sin borrar nada.
 */

import { eq, inArray } from 'drizzle-orm';
import {
	agent,
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
import type { AgentBlueprint } from '../game/agents';
import {
	CORPORATIONS,
	GALAXY,
	allAgents,
	securityFor,
	type BodyBlueprint,
	type CorporationBlueprint,
	type GalaxyBlueprint,
	type SecurityLevel,
	type StationServiceKind
} from '../game/universe';

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
	readonly security: SecurityLevel;
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
	for (const blueprint of blueprints) {
		const values = {
			code: blueprint.code,
			name: blueprint.name,
			kind: blueprint.kind,
			faction: blueprint.faction,
			isNpc: true,
			description: blueprint.description
		};
		db.insert(corporation)
			.values(values)
			.onConflictDoUpdate({ target: corporation.code, set: values })
			.run();
	}
	return blueprints.length;
}

/** Deja la estación con exactamente estos servicios: agrega y quita. */
function syncServices(db: Db, stationId: number, services: readonly StationServiceKind[]): void {
	const current = db
		.select()
		.from(stationService)
		.where(eq(stationService.stationId, stationId))
		.all();
	const wanted = new Set(services);

	for (const row of current) {
		if (!wanted.has(row.service)) {
			db.delete(stationService).where(eq(stationService.id, row.id)).run();
		}
	}
	const has = new Set(current.map((row) => row.service));
	for (const service of wanted) {
		if (!has.has(service)) db.insert(stationService).values({ stationId, service }).run();
	}
}

/**
 * Deja la estación con exactamente estos agentes: agrega, corrige y quita.
 *
 * Un agente que sale del plano tiene que desaparecer de la base: si no, queda
 * repartiendo trabajo un NPC que ya no existe en ninguna parte.
 */
function syncAgents(db: Db, stationId: number, agents: readonly AgentBlueprint[]): void {
	const current = db.select().from(agent).where(eq(agent.stationId, stationId)).all();
	const wanted = new Set(agents.map((blueprint) => blueprint.code));

	for (const row of current) {
		if (!wanted.has(row.code)) db.delete(agent).where(eq(agent.id, row.id)).run();
	}

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
			description: blueprint.description ?? '',
			appearance: blueprint.appearance ?? ('x' as const)
		};
		db.insert(agent).values(values).onConflictDoUpdate({ target: agent.code, set: values }).run();
	}
}

/** Siembra un cuerpo y todo lo que cuelga de él. Devuelve cuántos escribió. */
function seedBody(
	db: Db,
	blueprint: BodyBlueprint,
	systemId: number,
	parentId: number | null = null
): number {
	const values = {
		code: blueprint.code,
		name: blueprint.name,
		systemId,
		parentId,
		kind: blueprint.kind,
		orbitDistance: blueprint.orbitDistance,
		explored: blueprint.explored,
		description: blueprint.description
	};
	const row = db
		.insert(body)
		.values(values)
		.onConflictDoUpdate({ target: body.code, set: values })
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
			.onConflictDoUpdate({ target: station.bodyId, set: { corporationId: corp.id } })
			.returning()
			.get();

		syncServices(db, saved.id, blueprint.station.services);
		syncAgents(db, saved.id, blueprint.station.agents);
	}

	for (const child of blueprint.children) {
		total += seedBody(db, child, systemId, row.id);
	}
	return total;
}

/** Escribe el plano en la base y devuelve cuántas filas quedaron por nivel. */
export function seedUniverse(db: Db, blueprint: GalaxyBlueprint = GALAXY): SeedCount {
	const savedGalaxy = db
		.insert(galaxy)
		.values({ code: blueprint.code, name: blueprint.name })
		.onConflictDoUpdate({ target: galaxy.code, set: { name: blueprint.name } })
		.returning()
		.get();

	const count: SeedCount = {
		corporaciones: seedCorporations(db, CORPORATIONS),
		agentes: allAgents().length,
		regiones: 0,
		constelaciones: 0,
		sistemas: 0,
		cuerpos: 0
	};

	for (const regionBp of blueprint.regions) {
		const savedRegion = db
			.insert(region)
			.values({ code: regionBp.code, name: regionBp.name, galaxyId: savedGalaxy.id })
			.onConflictDoUpdate({
				target: region.code,
				set: { name: regionBp.name, galaxyId: savedGalaxy.id }
			})
			.returning()
			.get();
		count.regiones += 1;

		for (const constellationBp of regionBp.constellations) {
			const savedConstellation = db
				.insert(constellation)
				.values({
					code: constellationBp.code,
					name: constellationBp.name,
					regionId: savedRegion.id
				})
				.onConflictDoUpdate({
					target: constellation.code,
					set: { name: constellationBp.name, regionId: savedRegion.id }
				})
				.returning()
				.get();
			count.constelaciones += 1;

			for (const systemBp of constellationBp.systems) {
				const values = {
					code: systemBp.code,
					name: systemBp.name,
					constellationId: savedConstellation.id,
					x: systemBp.x,
					y: systemBp.y,
					z: systemBp.z,
					description: systemBp.description,
					government: systemBp.government,
					controllingFaction: systemBp.controllingFaction
				};
				const savedSystem = db
					.insert(system)
					.values(values)
					.onConflictDoUpdate({ target: system.code, set: values })
					.returning()
					.get();
				count.sistemas += 1;
				count.cuerpos += seedBody(db, systemBp.root, savedSystem.id);
			}
		}
	}

	return count;
}

// --- Consulta ----------------------------------------------------------------

/** Busca un cuerpo por su código. */
export function getBody(db: Db, code: string): Body | null {
	return db.select().from(body).where(eq(body.code, code)).get() ?? null;
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
		// La seguridad no está en la base: sale del gobierno.
		security: securityFor(found.government),
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
