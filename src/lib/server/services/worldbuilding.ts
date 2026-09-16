/**
 * Construir el universo: crear y editar sistemas, cuerpos, estaciones y puertas.
 *
 * Es la contraparte de escritura de `universe.ts`, que sólo lee. Van separados
 * porque son dos oficios distintos: uno lo consulta todo el juego en cada carga
 * de pantalla, y el otro lo usa un puñado de administradores. Mezclarlos
 * convertiría el módulo que más se importa en el que más superficie tiene.
 *
 * **Tres reglas gobiernan todo lo de acá:**
 *
 * 1. **Los códigos no se escriben a mano.** `body.code` es único en toda la
 *    galaxia, así que se deriva del nombre con el del sistema por delante. Un
 *    código a mano es un choque esperando la próxima siembra.
 * 2. **Nada se borra si algo lo está usando.** Un sistema con pilotos adentro o
 *    una puerta apuntándole no se borra: se avisa qué lo retiene.
 * 3. **Todo deja constancia.** Cada creación, cambio y borrado escribe en el
 *    registro dentro de su propia transacción. Una herramienta que crea
 *    entidades sin anotarlo es una que nadie puede revisar.
 *
 * Corresponde a docs/systems/ADMIN.md y docs/systems/UNIVERSE.md.
 */

import { and, eq, isNull, ne } from 'drizzle-orm';
import {
	beltDeposit,
	body,
	constellation,
	corporation,
	galaxy,
	gate,
	pilot,
	region,
	station,
	stationService,
	system,
	type Body,
	type Constellation,
	type Gate,
	type Region,
	type System
} from '../db/schema';
import type { Db } from '../db/types';
import { record } from './events';
import { seedAsteroids } from './asteroids';
import {
	GATE_BEARINGS,
	bodyCodeFrom,
	canOrbit,
	codeFrom,
	oppositeBearing,
	securityProblem,
	suggestedSecurity,
	type BodyKind,
	type GateBearing,
	type Government,
	type StationServiceKind
} from '$lib/game/universe';
import { getFaction } from '$lib/game/factions';

/** No se pudo construir. El mensaje se le muestra a quien lo intentó. */
export class BuilderError extends Error {}

// --- Región y constelación ---------------------------------------------------
//
// Van juntas y sin pantalla propia a propósito. La constelación es **taxonomía**:
// hoy no cambia ninguna mecánica, sólo agrupa. Obligar a pasar por un alta aparte
// para crear un contenedor vacío es fricción sin nada a cambio, así que se crean
// desde el formulario del sistema, que es donde uno se acuerda de que hacen
// falta. El día que una constelación signifique algo, tendrá su pantalla.

/** La galaxia, que es una sola y siempre está. */
function theGalaxy(db: Db) {
	const fila = db.select().from(galaxy).all()[0];
	if (!fila) throw new BuilderError('Todavía no hay galaxia: sembrá el universo primero.');
	return fila;
}

/** Todas las regiones, en orden alfabético. */
export function allRegions(db: Db): readonly Region[] {
	return db.select().from(region).orderBy(region.name).all();
}

/** Las constelaciones de una región, o todas si no se pide una. */
export function constellationsIn(db: Db, regionId?: number): readonly Constellation[] {
	const consulta = db.select().from(constellation);
	const filas = regionId
		? consulta.where(eq(constellation.regionId, regionId)).all()
		: consulta.all();
	return [...filas].sort((a, b) => a.name.localeCompare(b.name));
}

/** Crea una región. El código sale del nombre. */
export function createRegion(db: Db, name: string, actorId: number | null): Region {
	const limpio = name.trim();
	if (!limpio) throw new BuilderError('La región necesita un nombre.');

	const code = codeFrom(limpio);
	if (!code) throw new BuilderError('Ese nombre no da un código utilizable.');
	if (db.select().from(region).where(eq(region.code, code)).get()) {
		throw new BuilderError(`Ya hay una región que se llama ${limpio}.`);
	}

	const galaxia = theGalaxy(db);

	return db.transaction((tx) => {
		const creada = tx
			.insert(region)
			.values({ code, name: limpio, galaxyId: galaxia.id })
			.returning()
			.get();

		record(tx, {
			kind: 'region.created',
			actorId,
			subject: { kind: 'region', id: creada.id },
			payload: { name: creada.name, code: creada.code }
		});

		return creada;
	});
}

/** Crea una constelación dentro de una región. */
export function createConstellation(
	db: Db,
	regionId: number,
	name: string,
	actorId: number | null
): Constellation {
	const limpio = name.trim();
	if (!limpio) throw new BuilderError('La constelación necesita un nombre.');

	const suRegion = db.select().from(region).where(eq(region.id, regionId)).get();
	if (!suRegion) throw new BuilderError('Esa región no existe.');

	const code = codeFrom(limpio);
	if (!code) throw new BuilderError('Ese nombre no da un código utilizable.');
	if (db.select().from(constellation).where(eq(constellation.code, code)).get()) {
		throw new BuilderError(`Ya hay una constelación que se llama ${limpio}.`);
	}

	return db.transaction((tx) => {
		const creada = tx
			.insert(constellation)
			.values({ code, name: limpio, regionId })
			.returning()
			.get();

		record(tx, {
			kind: 'constellation.created',
			actorId,
			subject: { kind: 'constellation', id: creada.id },
			payload: { name: creada.name, code: creada.code, region: suRegion.name }
		});

		return creada;
	});
}

// --- Sistemas ----------------------------------------------------------------

/** Lo que define a un sistema. */
export interface SystemDraft {
	readonly name: string;
	readonly constellationId: number;
	readonly government: Government;
	readonly security: number;
	/** Código de facción, o vacío si es espacio libre. */
	readonly controllingFaction: string;
	/** Código de la facción de la que es capital, o vacío. */
	readonly capitalOf: string;
	readonly description: string;
	readonly x: number;
	readonly y: number;
	readonly z: number;
}

/** Que la facción exista, si se declaró alguna. */
function checkFaction(code: string, campo: string): void {
	if (!code) return;
	try {
		getFaction(code);
	} catch {
		throw new BuilderError(`${campo}: no existe ninguna facción con el código ${code}.`);
	}
}

/**
 * Lo que tiene que cumplir un sistema para poder guardarse.
 *
 * Junta las tres validaciones que se repiten en el alta y en la edición: que las
 * facciones existan, que la capital sea de quien controla, y que la seguridad
 * entre en la banda del gobierno.
 */
function checkSystem(draft: SystemDraft): void {
	if (!draft.name.trim()) throw new BuilderError('El sistema necesita un nombre.');

	checkFaction(draft.controllingFaction, 'Facción controladora');
	checkFaction(draft.capitalOf, 'Capital');

	// Una capital de quien no controla el sistema es un estado imposible: la
	// capital de una potencia está, por definición, en su propio espacio.
	if (draft.capitalOf && draft.capitalOf !== draft.controllingFaction) {
		throw new BuilderError('La capital tiene que ser de la facción que controla el sistema.');
	}

	const problema = securityProblem(
		draft.security,
		draft.government,
		Boolean(draft.controllingFaction)
	);
	if (problema) throw new BuilderError(problema);
}

/** Que no haya ya otra capital de esa facción. */
function checkCapital(db: Db, capitalOf: string, exceptId: number | null): void {
	if (!capitalOf) return;

	const condicion =
		exceptId === null
			? eq(system.capitalOf, capitalOf)
			: and(eq(system.capitalOf, capitalOf), ne(system.id, exceptId));

	const otra = db.select().from(system).where(condicion).get();
	if (otra) {
		throw new BuilderError(
			`${otra.name} ya es la capital de esa facción: una facción tiene una sola.`
		);
	}
}

/**
 * Crea un sistema **con su estrella**.
 *
 * La estrella no es opcional y por eso se crea acá y no en un segundo paso: un
 * sistema sin nada en la raíz no se puede dibujar, no se puede visitar y no es
 * un sistema. Se llama como él, que es la convención.
 */
export function createSystem(
	db: Db,
	draft: SystemDraft,
	actorId: number | null
): { system: System; star: Body } {
	checkSystem(draft);

	const suConstelacion = db
		.select()
		.from(constellation)
		.where(eq(constellation.id, draft.constellationId))
		.get();
	if (!suConstelacion) throw new BuilderError('Esa constelación no existe.');

	const name = draft.name.trim();
	const code = codeFrom(name);
	if (!code) throw new BuilderError('Ese nombre no da un código utilizable.');
	if (db.select().from(system).where(eq(system.code, code)).get()) {
		throw new BuilderError(`Ya hay un sistema que se llama ${name}.`);
	}

	checkCapital(db, draft.capitalOf, null);

	return db.transaction((tx) => {
		const creado = tx
			.insert(system)
			.values({
				code,
				name,
				constellationId: draft.constellationId,
				government: draft.government,
				security: draft.security,
				controllingFaction: draft.controllingFaction,
				capitalOf: draft.capitalOf,
				description: draft.description.trim(),
				x: draft.x,
				y: draft.y,
				z: draft.z
			})
			.returning()
			.get();

		const star = tx
			.insert(body)
			.values({
				code: bodyCodeFrom(code, name + ' estrella'),
				name,
				systemId: creado.id,
				parentId: null,
				kind: 'star',
				orbitDistance: 0,
				description: ''
			})
			.returning()
			.get();

		record(tx, {
			kind: 'system.created',
			actorId,
			subject: { kind: 'system', id: creado.id },
			payload: {
				name: creado.name,
				code: creado.code,
				constellation: suConstelacion.name,
				government: creado.government,
				security: creado.security
			}
		});

		return { system: creado, star };
	});
}

/** Cambia los datos de un sistema. El código no se toca nunca. */
export function updateSystem(
	db: Db,
	systemId: number,
	draft: SystemDraft,
	actorId: number | null
): void {
	const actual = db.select().from(system).where(eq(system.id, systemId)).get();
	if (!actual) throw new BuilderError('Ese sistema no existe.');

	checkSystem(draft);
	checkCapital(db, draft.capitalOf, systemId);

	if (!db.select().from(constellation).where(eq(constellation.id, draft.constellationId)).get()) {
		throw new BuilderError('Esa constelación no existe.');
	}

	db.transaction((tx) => {
		tx.update(system)
			.set({
				name: draft.name.trim(),
				constellationId: draft.constellationId,
				government: draft.government,
				security: draft.security,
				controllingFaction: draft.controllingFaction,
				capitalOf: draft.capitalOf,
				description: draft.description.trim(),
				x: draft.x,
				y: draft.y,
				z: draft.z
			})
			.where(eq(system.id, systemId))
			.run();

		record(tx, {
			kind: 'system.updated',
			actorId,
			subject: { kind: 'system', id: systemId },
			payload: { name: draft.name.trim(), code: actual.code }
		});
	});
}

/**
 * Qué retiene a un sistema, o vacío si se puede borrar.
 *
 * Se pregunta aparte de borrar para que la pantalla pueda avisar **antes** de
 * ofrecer el botón: descubrir que algo no se puede borrar recién al apretar es
 * la peor forma de enterarse.
 */
export function systemBlockers(db: Db, systemId: number): readonly string[] {
	const motivos: string[] = [];

	const cuerpos = db.select().from(body).where(eq(body.systemId, systemId)).all();
	const ids = cuerpos.map((fila) => fila.id);

	const dentro = ids.length
		? db
				.select()
				.from(pilot)
				.all()
				.filter((fila) => ids.includes(fila.locationId)).length
		: 0;
	if (dentro > 0) {
		motivos.push(dentro === 1 ? 'Hay un piloto adentro.' : `Hay ${dentro} pilotos adentro.`);
	}

	const apuntan = db
		.select()
		.from(gate)
		.all()
		.filter((fila) => fila.destinationId !== null && ids.includes(fila.destinationId)).length;
	if (apuntan > 0) {
		motivos.push(
			apuntan === 1
				? 'Hay una puerta de otro sistema que le apunta.'
				: `Hay ${apuntan} puertas de otros sistemas que le apuntan.`
		);
	}

	return motivos;
}

/**
 * Borra un sistema y todo lo que colgaba de él.
 *
 * El orden es **de las hojas a la raíz**, porque las claves foráneas están
 * activas y al revés falla. Ese orden es conocimiento del esquema, así que vive
 * acá y no en la pantalla que aprieta el botón.
 */
export function deleteSystem(db: Db, systemId: number, actorId: number | null): void {
	const actual = db.select().from(system).where(eq(system.id, systemId)).get();
	if (!actual) throw new BuilderError('Ese sistema no existe.');

	const retienen = systemBlockers(db, systemId);
	if (retienen.length > 0) {
		throw new BuilderError(`No se puede borrar ${actual.name}. ${retienen.join(' ')}`);
	}

	const cuerpos = db.select().from(body).where(eq(body.systemId, systemId)).all();

	db.transaction((tx) => {
		for (const fila of cuerpos) borrarCuerpo(tx, fila);
		tx.delete(system).where(eq(system.id, systemId)).run();

		record(tx, {
			kind: 'system.deleted',
			actorId,
			subject: { kind: 'system', id: systemId },
			payload: { name: actual.name, code: actual.code, bodies: cuerpos.length }
		});
	});
}

// --- Cuerpos -----------------------------------------------------------------

/** Lo que define a un cuerpo. */
export interface BodyDraft {
	readonly name: string;
	readonly kind: BodyKind;
	/** De qué cuelga. Nulo sólo para una estrella, que es raíz. */
	readonly parentId: number | null;
	readonly orbitDistance: number;
	readonly description: string;
	readonly explored: boolean;
}

/** Los cuerpos de un sistema, con el padre ya resuelto. */
export function bodiesOf(db: Db, systemId: number): readonly Body[] {
	return db.select().from(body).where(eq(body.systemId, systemId)).all();
}

/** Que el cuerpo pueda existir ahí: tipo, padre y órbita. */
function checkBody(db: Db, systemId: number, draft: BodyDraft): Body | null {
	if (!draft.name.trim()) throw new BuilderError('El cuerpo necesita un nombre.');
	if (draft.orbitDistance < 0)
		throw new BuilderError('La distancia orbital no puede ser negativa.');

	if (draft.kind === 'star') {
		if (draft.parentId !== null) throw new BuilderError('Una estrella no orbita nada.');
		return null;
	}

	if (draft.parentId === null) {
		throw new BuilderError(`Un cuerpo de tipo ${draft.kind} tiene que orbitar algo.`);
	}

	const padre = db.select().from(body).where(eq(body.id, draft.parentId)).get();
	if (!padre) throw new BuilderError('Ese cuerpo padre no existe.');
	if (padre.systemId !== systemId) throw new BuilderError('El padre es de otro sistema.');

	if (!canOrbit(draft.kind, padre.kind)) {
		throw new BuilderError(`Un cuerpo de tipo ${draft.kind} no puede orbitar ${padre.name}.`);
	}

	return padre;
}

/** Agrega un cuerpo a un sistema. */
export function createBody(
	db: Db,
	systemId: number,
	draft: BodyDraft,
	actorId: number | null
): Body {
	const suSistema = db.select().from(system).where(eq(system.id, systemId)).get();
	if (!suSistema) throw new BuilderError('Ese sistema no existe.');

	checkBody(db, systemId, draft);

	const name = draft.name.trim();
	const code = bodyCodeFrom(suSistema.code, name);
	if (!code) throw new BuilderError('Ese nombre no da un código utilizable.');
	if (db.select().from(body).where(eq(body.code, code)).get()) {
		throw new BuilderError(`Ya hay un cuerpo con el código ${code}. Cambiale el nombre.`);
	}

	return db.transaction((tx) => {
		const creado = tx
			.insert(body)
			.values({
				code,
				name,
				systemId,
				parentId: draft.parentId,
				kind: draft.kind,
				orbitDistance: draft.orbitDistance,
				explored: draft.explored,
				description: draft.description.trim()
			})
			.returning()
			.get();

		// Un cinturón nace con rocas: sin esto habría que esperar a que alguien lo
		// mire para que la reposición perezosa las ponga, y el constructor quiere
		// ver lo que acaba de crear.
		if (creado.kind === 'belt') seedAsteroids(tx, creado.id);

		record(tx, {
			kind: 'body.created',
			actorId,
			subject: { kind: 'body', id: creado.id },
			payload: {
				name: creado.name,
				code: creado.code,
				bodyKind: creado.kind,
				system: suSistema.name
			}
		});

		return creado;
	});
}

/**
 * Cambia los datos de un cuerpo.
 *
 * **El código no se recalcula al renombrar.** Se lo referencia desde el plano,
 * desde las órdenes en curso y desde la bitácora de todo el mundo, así que
 * cambiarlo rompería más de lo que arregla. El nombre es lo que se ve; el código
 * es la identidad.
 */
export function updateBody(db: Db, bodyId: number, draft: BodyDraft, actorId: number | null): void {
	const actual = db.select().from(body).where(eq(body.id, bodyId)).get();
	if (!actual) throw new BuilderError('Ese cuerpo no existe.');
	if (draft.kind !== actual.kind) {
		throw new BuilderError('Un cuerpo no cambia de tipo: borralo y creá el que corresponda.');
	}

	checkBody(db, actual.systemId, draft);

	// Colgarse de sí mismo o de un descendiente rompería el árbol en un ciclo, y
	// el recorrido que dibuja el sistema no volvería nunca.
	if (draft.parentId !== null && isDescendant(db, bodyId, draft.parentId)) {
		throw new BuilderError('Un cuerpo no puede orbitar algo que cuelga de él.');
	}

	db.transaction((tx) => {
		tx.update(body)
			.set({
				name: draft.name.trim(),
				parentId: draft.parentId,
				orbitDistance: draft.orbitDistance,
				explored: draft.explored,
				description: draft.description.trim()
			})
			.where(eq(body.id, bodyId))
			.run();

		record(tx, {
			kind: 'body.updated',
			actorId,
			subject: { kind: 'body', id: bodyId },
			payload: { name: draft.name.trim(), code: actual.code }
		});
	});
}

/** Si `candidato` es el cuerpo mismo o cuelga de él. */
function isDescendant(db: Db, bodyId: number, candidato: number): boolean {
	let actual: number | null = candidato;
	// La cota es por las dudas: un ciclo que ya existiera colgaría el recorrido.
	for (let paso = 0; actual !== null && paso < 100; paso++) {
		if (actual === bodyId) return true;
		const fila: Body | undefined = db.select().from(body).where(eq(body.id, actual)).get();
		actual = fila?.parentId ?? null;
	}
	return false;
}

/** Qué retiene a un cuerpo, o vacío si se puede borrar. */
export function bodyBlockers(db: Db, bodyId: number): readonly string[] {
	const motivos: string[] = [];

	const hijos = db.select().from(body).where(eq(body.parentId, bodyId)).all();
	if (hijos.length > 0) {
		motivos.push(
			hijos.length === 1
				? `${hijos[0].name} lo orbita.`
				: `Lo orbitan ${hijos.length} cuerpos: borralos primero.`
		);
	}

	const dentro = db.select().from(pilot).where(eq(pilot.locationId, bodyId)).all().length;
	if (dentro > 0) {
		motivos.push(dentro === 1 ? 'Hay un piloto ahí.' : `Hay ${dentro} pilotos ahí.`);
	}

	const apuntan = db.select().from(gate).where(eq(gate.destinationId, bodyId)).all().length;
	if (apuntan > 0) motivos.push('Hay una puerta que le apunta.');

	return motivos;
}

/** Borra un cuerpo con lo que cuelga de él **en la base**, no en el árbol. */
function borrarCuerpo(db: Db, fila: Body): void {
	db.delete(beltDeposit).where(eq(beltDeposit.bodyId, fila.id)).run();
	db.delete(gate).where(eq(gate.bodyId, fila.id)).run();

	const suEstacion = db.select().from(station).where(eq(station.bodyId, fila.id)).get();
	if (suEstacion) {
		db.delete(stationService).where(eq(stationService.stationId, suEstacion.id)).run();
		db.delete(station).where(eq(station.id, suEstacion.id)).run();
	}

	db.delete(body).where(eq(body.id, fila.id)).run();
}

/** Borra un cuerpo, si no hay nada que lo retenga. */
export function deleteBody(db: Db, bodyId: number, actorId: number | null): void {
	const actual = db.select().from(body).where(eq(body.id, bodyId)).get();
	if (!actual) throw new BuilderError('Ese cuerpo no existe.');

	const retienen = bodyBlockers(db, bodyId);
	if (retienen.length > 0) {
		throw new BuilderError(`No se puede borrar ${actual.name}. ${retienen.join(' ')}`);
	}

	const suSistema = db.select().from(system).where(eq(system.id, actual.systemId)).get();

	db.transaction((tx) => {
		borrarCuerpo(tx, actual);

		record(tx, {
			kind: 'body.deleted',
			actorId,
			subject: { kind: 'body', id: bodyId },
			payload: { name: actual.name, code: actual.code, system: suSistema?.name ?? '' }
		});
	});
}

// --- Estaciones --------------------------------------------------------------

/**
 * Deja la estación de un cuerpo con esta corporación y estos módulos.
 *
 * Crea la estación si el cuerpo todavía no la tiene. Los módulos se reescriben
 * enteros en vez de comparar cuál cambió: son ocho, y comparar cuesta más código
 * que reescribir.
 */
export function setStation(
	db: Db,
	bodyId: number,
	corporationCode: string,
	services: readonly StationServiceKind[],
	actorId: number | null
): void {
	const cuerpo = db.select().from(body).where(eq(body.id, bodyId)).get();
	if (!cuerpo) throw new BuilderError('Ese cuerpo no existe.');
	if (cuerpo.kind !== 'station') throw new BuilderError(`${cuerpo.name} no es una estación.`);

	const corp = db.select().from(corporation).where(eq(corporation.code, corporationCode)).get();
	if (!corp) throw new BuilderError('Esa corporación no existe.');

	db.transaction((tx) => {
		const existente = tx.select().from(station).where(eq(station.bodyId, bodyId)).get();
		const suya =
			existente ?? tx.insert(station).values({ bodyId, corporationId: corp.id }).returning().get();

		if (existente && existente.corporationId !== corp.id) {
			tx.update(station).set({ corporationId: corp.id }).where(eq(station.id, suya.id)).run();
		}

		tx.delete(stationService).where(eq(stationService.stationId, suya.id)).run();
		for (const service of new Set(services)) {
			tx.insert(stationService).values({ stationId: suya.id, service }).run();
		}

		record(tx, {
			kind: 'body.updated',
			actorId,
			subject: { kind: 'body', id: bodyId },
			payload: { name: cuerpo.name, code: cuerpo.code, corporation: corp.name }
		});
	});
}

// --- Puertas -----------------------------------------------------------------

/** Los rumbos que ya tiene ocupados un sistema. */
export function takenBearings(db: Db, systemId: number): readonly GateBearing[] {
	return db
		.select()
		.from(gate)
		.where(eq(gate.systemId, systemId))
		.all()
		.map((fila) => fila.bearing);
}

/**
 * Planta una puerta en un sistema, **sin conectarla todavía**.
 *
 * Es el orden en que uno construye: primero se decide que de acá se sale hacia
 * el norte, y después —a veces mucho después, cuando el sistema del otro lado
 * exista— se dice adónde va. Una puerta sin destino es una obra en curso, no un
 * error.
 */
export function createGate(
	db: Db,
	systemId: number,
	draft: BodyDraft,
	bearing: GateBearing,
	actorId: number | null
): { body: Body; gate: Gate } {
	if (draft.kind !== 'gate') throw new BuilderError('Eso no es una puerta.');
	if (!GATE_BEARINGS.includes(bearing)) throw new BuilderError('Ese rumbo no existe.');

	if (takenBearings(db, systemId).includes(bearing)) {
		throw new BuilderError('Ya hay una puerta hacia ese lado. Elegí otro rumbo.');
	}

	// El cuerpo y su fila de puerta van juntos: un cuerpo de tipo `gate` sin fila
	// en `gate` es una puerta que el juego no sabe usar, y no hay pantalla desde
	// donde arreglarlo.
	return db.transaction((tx) => {
		const creado = createBody(tx, systemId, draft, actorId);
		const fila = tx
			.insert(gate)
			.values({ bodyId: creado.id, systemId, bearing, destinationId: null })
			.returning()
			.get();

		return { body: creado, gate: fila };
	});
}

/** Las puertas de un sistema, con su cuerpo. */
export function gatesOf(db: Db, systemId: number): readonly { gate: Gate; body: Body }[] {
	return db
		.select({ gate, body })
		.from(gate)
		.innerJoin(body, eq(body.id, gate.bodyId))
		.where(eq(gate.systemId, systemId))
		.all();
}

/** Las puertas que todavía no llevan a ninguna parte, en toda la galaxia. */
export function looseGates(db: Db): readonly { gate: Gate; body: Body; system: System }[] {
	return db
		.select({ gate, body, system })
		.from(gate)
		.innerJoin(body, eq(body.id, gate.bodyId))
		.innerJoin(system, eq(system.id, gate.systemId))
		.where(isNull(gate.destinationId))
		.all();
}

/**
 * Une dos puertas, **en los dos sentidos**.
 *
 * Una puerta que lleva a otra que no vuelve es un pasillo de ida, y ninguna de
 * las dos mecánicas que van a usarlas —viajar y dibujar el mapa— tiene sentido
 * así. Por eso se escriben las dos filas juntas y con la misma distancia de
 * salto: un test verifica que no quede ninguna gemela suelta.
 */
export function connectGates(
	db: Db,
	gateId: number,
	otherGateId: number,
	jumpDistance: number,
	actorId: number | null
): void {
	if (gateId === otherGateId) throw new BuilderError('Una puerta no se conecta consigo misma.');
	if (jumpDistance < 0) throw new BuilderError('La distancia de salto no puede ser negativa.');

	const una = db.select().from(gate).where(eq(gate.id, gateId)).get();
	const otra = db.select().from(gate).where(eq(gate.id, otherGateId)).get();
	if (!una || !otra) throw new BuilderError('Esa puerta no existe.');

	if (una.systemId === otra.systemId) {
		throw new BuilderError('Las dos puertas están en el mismo sistema.');
	}

	const ocupadas = [una, otra].filter((fila) => fila.destinationId !== null);
	if (ocupadas.length > 0) {
		throw new BuilderError('Alguna de las dos ya está conectada. Desconectala primero.');
	}

	const cuerpoUna = db.select().from(body).where(eq(body.id, una.bodyId)).get()!;
	const cuerpoOtra = db.select().from(body).where(eq(body.id, otra.bodyId)).get()!;

	db.transaction((tx) => {
		tx.update(gate)
			.set({ destinationId: otra.bodyId, jumpDistance })
			.where(eq(gate.id, una.id))
			.run();
		tx.update(gate)
			.set({ destinationId: una.bodyId, jumpDistance })
			.where(eq(gate.id, otra.id))
			.run();

		record(tx, {
			kind: 'gate.connected',
			actorId,
			subject: { kind: 'gate', id: una.id },
			payload: { name: cuerpoUna.name, destination: cuerpoOtra.name, jumpDistance }
		});
	});
}

/** Las separa, también en los dos sentidos. */
export function disconnectGate(db: Db, gateId: number, actorId: number | null): void {
	const una = db.select().from(gate).where(eq(gate.id, gateId)).get();
	if (!una) throw new BuilderError('Esa puerta no existe.');
	if (una.destinationId === null) throw new BuilderError('Esa puerta no lleva a ninguna parte.');

	const otra = db.select().from(gate).where(eq(gate.bodyId, una.destinationId)).get();
	const cuerpoUna = db.select().from(body).where(eq(body.id, una.bodyId)).get()!;
	const cuerpoOtra = db.select().from(body).where(eq(body.id, una.destinationId)).get();

	db.transaction((tx) => {
		tx.update(gate).set({ destinationId: null }).where(eq(gate.id, una.id)).run();
		if (otra) tx.update(gate).set({ destinationId: null }).where(eq(gate.id, otra.id)).run();

		record(tx, {
			kind: 'gate.disconnected',
			actorId,
			subject: { kind: 'gate', id: una.id },
			payload: { name: cuerpoUna.name, destination: cuerpoOtra?.name ?? '—' }
		});
	});
}

/**
 * Crea el sistema del otro lado de una puerta suelta y las une.
 *
 * Es el gesto que uno quiere hacer al construir una galaxia: se planta una
 * salida hacia el norte, y desde esa salida se crea lo que hay del otro lado sin
 * ir a otra pantalla ni acordarse de volver a conectar. La puerta gemela sale en
 * el **rumbo opuesto**, que es lo que hace que el mapa cierre.
 */
export function growFromGate(
	db: Db,
	gateId: number,
	draft: SystemDraft,
	jumpDistance: number,
	actorId: number | null
): System {
	const suelta = db.select().from(gate).where(eq(gate.id, gateId)).get();
	if (!suelta) throw new BuilderError('Esa puerta no existe.');
	if (suelta.destinationId !== null) throw new BuilderError('Esa puerta ya está conectada.');

	const origen = db.select().from(system).where(eq(system.id, suelta.systemId)).get()!;
	const { system: creado } = createSystem(db, draft, actorId);

	const vuelta = createGate(
		db,
		creado.id,
		{
			name: `Puerta a ${origen.name}`,
			kind: 'gate',
			parentId: starOf(db, creado.id).id,
			orbitDistance: 0,
			description: '',
			explored: true
		},
		oppositeBearing(suelta.bearing),
		actorId
	);

	connectGates(db, suelta.id, vuelta.gate.id, jumpDistance, actorId);
	return creado;
}

/** La estrella de un sistema: el cuerpo raíz. */
export function starOf(db: Db, systemId: number): Body {
	const fila = db
		.select()
		.from(body)
		.where(and(eq(body.systemId, systemId), isNull(body.parentId)))
		.get();
	if (!fila) throw new BuilderError('Ese sistema no tiene estrella.');
	return fila;
}

// --- Cinturones --------------------------------------------------------------

/** Un mineral de un cinturón, como lo declara el constructor. */
export interface DepositDraft {
	readonly ore: string;
	readonly capacity: number;
	readonly regenPerHour: number;
}

/**
 * Deja el cinturón con exactamente estos minerales.
 *
 * **Lo que ya estaba conserva lo que le queda.** Cambiar el tope de un depósito
 * es una decisión de balance; devolverlo a lleno sería borrar el trabajo de todos
 * los que lo estuvieron minando.
 */
export function setDeposits(
	db: Db,
	bodyId: number,
	deposits: readonly DepositDraft[],
	actorId: number | null
): void {
	const cuerpo = db.select().from(body).where(eq(body.id, bodyId)).get();
	if (!cuerpo) throw new BuilderError('Ese cuerpo no existe.');
	if (cuerpo.kind !== 'belt') throw new BuilderError(`${cuerpo.name} no es un cinturón.`);

	for (const spec of deposits) {
		if (spec.capacity <= 0) throw new BuilderError('El tope de un mineral tiene que ser positivo.');
		if (spec.regenPerHour < 0) throw new BuilderError('La reposición no puede ser negativa.');
	}

	db.transaction((tx) => {
		const actuales = tx.select().from(beltDeposit).where(eq(beltDeposit.bodyId, bodyId)).all();
		const pedidos = new Set(deposits.map((spec) => spec.ore));

		for (const fila of actuales) {
			if (!pedidos.has(fila.oreCode)) {
				tx.delete(beltDeposit).where(eq(beltDeposit.id, fila.id)).run();
			}
		}

		for (const spec of deposits) {
			const fila = actuales.find((una) => una.oreCode === spec.ore);
			if (fila) {
				tx.update(beltDeposit)
					.set({
						capacity: spec.capacity,
						regenPerHour: spec.regenPerHour,
						// Lo que queda no se toca, salvo que ahora exceda el tope nuevo.
						remaining: Math.min(fila.remaining, spec.capacity)
					})
					.where(eq(beltDeposit.id, fila.id))
					.run();
				continue;
			}

			tx.insert(beltDeposit)
				.values({
					bodyId,
					oreCode: spec.ore,
					capacity: spec.capacity,
					regenPerHour: spec.regenPerHour,
					remaining: spec.capacity
				})
				.run();
		}

		record(tx, {
			kind: 'body.updated',
			actorId,
			subject: { kind: 'body', id: bodyId },
			payload: { name: cuerpo.name, code: cuerpo.code, ores: deposits.length }
		});
	});
}

/** Lo que propone el constructor para un sistema nuevo. */
export function blankSystem(constellationId: number): SystemDraft {
	return {
		name: '',
		constellationId,
		government: 'corporate',
		security: suggestedSecurity('corporate', true),
		controllingFaction: '',
		capitalOf: '',
		description: '',
		x: 0,
		y: 0,
		z: 0
	};
}

/** Las puertas huérfanas: apuntan a algo que dejó de apuntarles. Para un test. */
export function orphanGates(db: Db): readonly Gate[] {
	const todas = db.select().from(gate).all();
	const porCuerpo = new Map(todas.map((fila) => [fila.bodyId, fila]));

	return todas.filter((fila) => {
		if (fila.destinationId === null) return false;
		const gemela = porCuerpo.get(fila.destinationId);
		return !gemela || gemela.destinationId !== fila.bodyId;
	});
}
