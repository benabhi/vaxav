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

import { and, asc, eq, inArray, isNull, ne } from 'drizzle-orm';
import {
	asteroid,
	asteroidSurvey,
	beltDeposit,
	body,
	constellation,
	corporation,
	creditEntry,
	galaxy,
	gate,
	pilot,
	pilotAction,
	pilotLog,
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
	type Atmosphere,
	type BodyClass,
	type BodyKind,
	type GateBearing,
	type Government,
	type StarClass,
	type StationServiceKind
} from '$lib/game/universe';
import { neighbourOf, sameHex, type Hex } from '$lib/game/galaxy';
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
	// Por región y después por nombre: el desplegable las agrupa por región, y con
	// el orden alfabético puro las regiones salían intercaladas.
	return [...filas].sort((a, b) => a.regionId - b.regionId || a.name.localeCompare(b.name, 'es'));
}

/**
 * Un color de categoría, validado.
 *
 * **Vacío es legítimo**: quiere decir «usá el automático», que es lo que el mapa
 * genera a partir del nombre. Lo que no entra es cualquier otra cosa: un valor a
 * medio escribir llegaría hasta el lienzo y ahí un color inválido no falla, sólo
 * pinta de negro.
 */
function checkColor(color: string): string {
	const limpio = color.trim().toLowerCase();
	if (!limpio) return '';
	if (!/^#[0-9a-f]{6}$/.test(limpio)) {
		throw new BuilderError('Ese color no es un hexadecimal de seis dígitos.');
	}
	return limpio;
}

/** Crea una región. El código sale del nombre. */
export function createRegion(db: Db, name: string, actorId: number | null, color = ''): Region {
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
			.values({ code, name: limpio, galaxyId: galaxia.id, color: checkColor(color) })
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

/**
 * Cambia el nombre y el color de una región.
 *
 * **El código no se toca.** Sale del nombre al crearla y desde ahí es su identidad:
 * cambiarlo al renombrar rompería cualquier cosa que lo hubiera guardado, y una
 * región se renombra porque no gustó cómo quedó escrita, no porque sea otra.
 */
export function updateRegion(
	db: Db,
	regionId: number,
	name: string,
	color: string,
	actorId: number | null
): void {
	const actual = db.select().from(region).where(eq(region.id, regionId)).get();
	if (!actual) throw new BuilderError('Esa región no existe.');

	const limpio = name.trim();
	if (!limpio) throw new BuilderError('La región necesita un nombre.');

	const repetida = db
		.select()
		.from(region)
		.all()
		.find((una) => una.id !== regionId && una.name === limpio);
	if (repetida) throw new BuilderError(`Ya hay una región que se llama ${limpio}.`);

	db.transaction((tx) => {
		tx.update(region)
			.set({ name: limpio, color: checkColor(color) })
			.where(eq(region.id, regionId))
			.run();

		record(tx, {
			kind: 'region.updated',
			actorId,
			subject: { kind: 'region', id: regionId },
			payload: { name: limpio, before: actual.name }
		});
	});
}

/** Lo mismo para una constelación, que además puede cambiar de región. */
export function updateConstellation(
	db: Db,
	constellationId: number,
	name: string,
	color: string,
	actorId: number | null
): void {
	const actual = db.select().from(constellation).where(eq(constellation.id, constellationId)).get();
	if (!actual) throw new BuilderError('Esa constelación no existe.');

	const limpio = name.trim();
	if (!limpio) throw new BuilderError('La constelación necesita un nombre.');

	const repetida = db
		.select()
		.from(constellation)
		.all()
		.find((una) => una.id !== constellationId && una.name === limpio);
	if (repetida) throw new BuilderError(`Ya hay una constelación que se llama ${limpio}.`);

	db.transaction((tx) => {
		tx.update(constellation)
			.set({ name: limpio, color: checkColor(color) })
			.where(eq(constellation.id, constellationId))
			.run();

		record(tx, {
			kind: 'constellation.updated',
			actorId,
			subject: { kind: 'constellation', id: constellationId },
			payload: { name: limpio, before: actual.name }
		});
	});
}

/** Crea una constelación dentro de una región. */
export function createConstellation(
	db: Db,
	regionId: number,
	name: string,
	actorId: number | null,
	color = ''
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
			.values({ code, name: limpio, regionId, color: checkColor(color) })
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
				capitalOf: draft.capitalOf
				// Sin coordenadas: nace en el origen, que es como se reconoce a un
				// sistema que todavía no tiene lugar en la grilla. Se lo gana al
				// conectarle una puerta, no tecleándolo.
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
				// Una amarilla, que es la que menos compromete: de la clase de la
				// estrella sale el clima de todo el sistema, y una G deja las órbitas
				// habituales en bandas razonables. Se cambia editando la estrella, que
				// es donde vive el dato.
				starClass: 'G'
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
				capitalOf: draft.capitalOf
				// La posición no se edita acá: es del mapa, no de la ficha. Moverla a
				// mano rompería la coherencia con los rumbos de sus puertas, que es lo
				// único que hace legible al mapa.
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

	// Lo mismo que retiene a un cuerpo retiene al sistema entero: un piloto puede
	// estar viajando hacia acá desde afuera, y entonces no está «adentro» pero le
	// borraríamos el destino igual.
	const enCamino = ids.length
		? db
				.select()
				.from(pilotAction)
				.all()
				.filter(
					(una) =>
						ids.includes(una.originBodyId) ||
						(una.destinationBodyId !== null && ids.includes(una.destinationBodyId))
				).length
		: 0;
	if (enCamino > 0) {
		motivos.push(
			enCamino === 1
				? 'Hay una orden en curso hacia adentro.'
				: `Hay ${enCamino} órdenes en curso hacia adentro.`
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
		// **De las hojas a la raíz.** Las claves foráneas están activas y
		// `body.parent_id` apunta a otro cuerpo: borrar un planeta antes que su luna
		// revienta la restricción a mitad de la transacción. El orden en que salen
		// de la consulta no es el orden del árbol, así que hay que imponerlo.
		for (const fila of deepestFirst(cuerpos)) borrarCuerpo(tx, fila);
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
	readonly explored: boolean;
	/**
	 * De qué está hecho, si es planeta o luna. Vacío en todo lo demás.
	 *
	 * Estos tres campos son lo que el constructor escribe **en lugar de una
	 * descripción**: la frase que ve el jugador se arma sola con `describeBody`.
	 * Un campo de texto libre acá significaba escribir mil descripciones a mano y
	 * que cada una quedara vieja en cuanto alguien tocara un número.
	 */
	readonly bodyClass: BodyClass | '';
	/** Qué se respira, si es planeta o luna. Vacío en todo lo demás. */
	readonly atmosphere: Atmosphere | '';
	/** La clase espectral, si es una estrella. Vacío en todo lo demás. */
	readonly starClass: StarClass | '';
}

/** Los cuerpos de un sistema, con el padre ya resuelto. */
export function bodiesOf(db: Db, systemId: number): readonly Body[] {
	return db.select().from(body).where(eq(body.systemId, systemId)).all();
}

/**
 * Que los atributos correspondan al tipo de cuerpo.
 *
 * Un cinturón con atmósfera o una estación de hielo no son datos raros: son
 * datos **imposibles**, y si entran a la base la descripción derivada empieza a
 * decir disparates sin que nadie sepa de dónde salieron.
 */
function checkAttributes(draft: BodyDraft): void {
	const esMundo = draft.kind === 'planet' || draft.kind === 'moon';
	if (!esMundo && (draft.bodyClass !== '' || draft.atmosphere !== '')) {
		throw new BuilderError('Sólo un planeta o una luna tienen composición y atmósfera.');
	}
	if (draft.kind !== 'star' && draft.starClass !== '') {
		throw new BuilderError('Sólo una estrella tiene clase espectral.');
	}
}

/** Que el cuerpo pueda existir ahí: tipo, padre y órbita. */
function checkBody(db: Db, systemId: number, draft: BodyDraft): Body | null {
	if (!draft.name.trim()) throw new BuilderError('El cuerpo necesita un nombre.');
	if (draft.orbitDistance < 0)
		throw new BuilderError('La distancia orbital no puede ser negativa.');

	checkAttributes(draft);

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
				bodyClass: draft.bodyClass,
				atmosphere: draft.atmosphere,
				starClass: draft.starClass
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
				bodyClass: draft.bodyClass,
				atmosphere: draft.atmosphere,
				starClass: draft.starClass
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

	// Una orden en curso hacia ahí retiene igual que un piloto parado: el piloto
	// está en camino y borrarle el destino lo dejaría volando hacia una fila que
	// ya no existe. Se avisa en vez de estrellarse contra la clave foránea, que es
	// lo que pasaba.
	const enCamino = db
		.select()
		.from(pilotAction)
		.all()
		.filter((una) => una.originBodyId === bodyId || una.destinationBodyId === bodyId).length;
	if (enCamino > 0) {
		motivos.push(
			enCamino === 1
				? 'Hay una orden en curso hacia ahí.'
				: `Hay ${enCamino} órdenes en curso hacia ahí.`
		);
	}

	return motivos;
}

/**
 * Los cuerpos ordenados de los más profundos a los más superficiales.
 *
 * Es el orden en que hay que borrarlos: un hijo antes que su padre. Se calcula
 * contando ancestros y no recorriendo el árbol, que es más corto y aguanta un
 * plano incompleto —un cuerpo cuyo padre ya no está cuenta como raíz y sale
 * primero, en vez de colgar el recorrido—.
 */
function deepestFirst(cuerpos: readonly Body[]): readonly Body[] {
	const porId = new Map(cuerpos.map((fila) => [fila.id, fila]));

	function profundidad(fila: Body): number {
		let nivel = 0;
		let actual: Body | undefined = fila;
		// La cota es por las dudas: un ciclo que ya existiera colgaría el conteo.
		while (actual?.parentId != null && nivel < 100) {
			actual = porId.get(actual.parentId);
			nivel++;
		}
		return nivel;
	}

	return [...cuerpos].sort((a, b) => profundidad(b) - profundidad(a));
}

/** Borra un cuerpo con lo que cuelga de él **en la base**, no en el árbol. */
function borrarCuerpo(db: Db, fila: Body): void {
	// Las rocas y sus lecturas **se van con el cinturón**, igual que el depósito:
	// no son cosas que lo retengan sino cosas que son suyas. Y hay que soltarlas a
	// mano porque las dos apuntan con clave foránea —la lectura a la roca, la roca
	// al cuerpo— y borrar el cinturón con rocas adentro se estrellaba contra la
	// base. No se notaba porque el único cinturón con rocas era el del plano
	// oficial, que nadie borra.
	const rocas = db
		.select({ id: asteroid.id })
		.from(asteroid)
		.where(eq(asteroid.bodyId, fila.id))
		.all()
		.map((una) => una.id);
	if (rocas.length > 0) {
		db.delete(asteroidSurvey).where(inArray(asteroidSurvey.asteroidId, rocas)).run();
		db.delete(asteroid).where(eq(asteroid.bodyId, fila.id)).run();
	}

	// **La historia se suelta, no se borra.** La bitácora de un piloto y el libro
	// mayor apuntan a dónde pasó cada cosa, y un informe que dice «viajaste a
	// Bastión II» tiene que sobrevivir a que alguien borre Bastión II: el viaje
	// ocurrió. Se les saca el puntero y se quedan con todo lo demás —el tipo, la
	// duración, la experiencia, el monto—, que es lo que el jugador va a leer. Las
	// vistas ya dibujan un informe sin lugar, así que no queda nada colgando.
	db.update(pilotLog).set({ originBodyId: null }).where(eq(pilotLog.originBodyId, fila.id)).run();
	db.update(pilotLog)
		.set({ destinationBodyId: null })
		.where(eq(pilotLog.destinationBodyId, fila.id))
		.run();
	db.update(creditEntry).set({ bodyId: null }).where(eq(creditEntry.bodyId, fila.id)).run();

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
/**
 * Qué sistema quedaría encimado si se hiciera esa mudanza, o `null` si ninguno.
 *
 * **Dos sistemas en la misma casilla es un mapa roto**, y roto de la peor manera:
 * no falla nada, los dos se dibujan uno sobre el otro y el de abajo desaparece sin
 * que nada lo diga. Es el mismo error que el ramal a la deriva —una posición que
 * no significa lo que dice— sólo que más difícil de ver.
 *
 * Se comprueba **la isla entera**, no sólo el sistema que se conecta: un ramal se
 * muda de una pieza, así que cualquiera de sus miembros puede caer encima de algo.
 */
function collisionAfterMove(
	db: Db,
	members: readonly System[],
	from: Hex,
	to: Hex
): { member: System; ocupante: System } | null {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const dz = to.z - from.z;
	if (dx === 0 && dy === 0 && dz === 0) return null;

	const seMudan = new Set(members.map((uno) => uno.id));
	const ocupadas = new Map<string, System>();
	for (const uno of db.select().from(system).all()) {
		if (seMudan.has(uno.id)) continue;
		ocupadas.set(`${uno.x},${uno.y},${uno.z}`, uno);
	}

	for (const miembro of members) {
		const ocupante = ocupadas.get(`${miembro.x + dx},${miembro.y + dy},${miembro.z + dz}`);
		if (ocupante) return { member: miembro, ocupante };
	}
	return null;
}

/** Dónde está un sistema en la grilla de la galaxia. */
function hexOf(row: System): Hex {
	return { x: row.x, y: row.y, z: row.z };
}

/**
 * Los sistemas atados a éste por puertas conectadas, él incluido.
 *
 * Es la **isla**: el pedazo de galaxia al que se llega caminando puertas. Se usa
 * para mudar de una pieza un ramal recién construido cuando se lo engancha al
 * mapa, en vez de dejarlo suelto en el origen.
 *
 * El recorrido es acotado por construcción —una isla tiene los sistemas que
 * tiene— y nunca cruza al otro lado, porque las dos puertas que se están por unir
 * todavía no están conectadas cuando esto corre.
 */
function islandOf(db: Db, systemId: number): number[] {
	const vistos = new Set<number>([systemId]);
	const pendientes = [systemId];

	while (pendientes.length > 0) {
		const actual = pendientes.pop()!;
		const salidas = db.select().from(gate).where(eq(gate.systemId, actual)).all();

		for (const salida of salidas) {
			if (salida.destinationId === null) continue;
			const gemela = db.select().from(gate).where(eq(gate.bodyId, salida.destinationId)).get();
			if (!gemela || vistos.has(gemela.systemId)) continue;
			vistos.add(gemela.systemId);
			pendientes.push(gemela.systemId);
		}
	}

	return [...vistos];
}

/**
 * Los sistemas que ya tienen lugar en el mapa: la isla de la semilla.
 *
 * **El primero sembrado es el origen de la grilla**, y alguien tiene que serlo.
 * Los demás se ganan su casilla al quedar atados a él por puertas.
 *
 * Tener una puerta conectada **no alcanza**: un ramal armado aparte también las
 * tiene y sigue sin estar en ningún lado. Lo que define estar puesto es llegar
 * caminando desde la semilla, y por eso esto es una consulta de alcance y no una
 * de la fila. Confundir las dos cosas deja ramales flotando en la casilla cero,
 * encimados con el sistema inicial.
 */
function placedSystems(db: Db, seedId: number): Set<number> {
	return new Set(seedId === 0 ? [] : islandOf(db, seedId));
}

/**
 * Muda una isla entera para que uno de sus sistemas caiga en una casilla.
 *
 * Se mueve **todo el ramal con el mismo desplazamiento**, así que las posiciones
 * relativas de adentro se conservan: si dentro del ramal un sistema estaba al
 * norte de otro, sigue estándolo. Es la diferencia entre enganchar un pedazo de
 * galaxia ya armado y tener que rehacerlo.
 */
function moveIsland(tx: Db, members: readonly System[], from: Hex, to: Hex): void {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const dz = to.z - from.z;
	if (dx === 0 && dy === 0 && dz === 0) return;

	for (const miembro of members) {
		tx.update(system)
			.set({ x: miembro.x + dx, y: miembro.y + dy, z: miembro.z + dz })
			.where(eq(system.id, miembro.id))
			.run();
	}
}

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

	// **La galaxia se acomoda sola, un salto por vez**, y nunca se mueve lo que ya
	// estaba: la casilla de un sistema puesto es el lenguaje común de todos los que
	// ya la vieron. Un acomodado global que recorriera el grafo movería medio mapa
	// cada vez que el constructor toca una puerta.
	//
	// Se mira en los dos sentidos porque cualquiera puede ser el que todavía no
	// tiene lugar: se conecta tanto una puerta nueva a un sistema viejo como al
	// revés. Si los dos están puestos y no cierran, la puerta se conecta igual y
	// queda como atajo, que es deseable: una galaxia donde todo cierra en espejo es
	// una grilla y nada más.
	const sistemaUna = db.select().from(system).where(eq(system.id, una.systemId)).get()!;
	const sistemaOtra = db.select().from(system).where(eq(system.id, otra.systemId)).get()!;
	const semilla = db.select({ id: system.id }).from(system).orderBy(asc(system.id)).get()?.id ?? 0;

	const enElMapa = placedSystems(db, semilla);
	const puestaUna = enElMapa.has(sistemaUna.id);
	const puestaOtra = enElMapa.has(sistemaOtra.id);

	/** Trae la isla de un sistema con sus filas, para mudarla de una pieza. */
	const islaDe = (id: number): System[] =>
		islandOf(db, id).map((uno) => db.select().from(system).where(eq(system.id, uno)).get()!);

	let mudanza: { members: System[]; from: Hex; to: Hex } | null = null;
	if (puestaOtra && !puestaUna) {
		mudanza = {
			members: islaDe(sistemaUna.id),
			from: hexOf(sistemaUna),
			to: neighbourOf(hexOf(sistemaOtra), otra.bearing)
		};
	} else if (!puestaOtra) {
		// Cubre dos casos con la misma cuenta: engancharle un ramal al mapa, y unir
		// dos sistemas que todavía están los dos afuera.
		//
		// El segundo importa más de lo que parece. Su posición absoluta no significa
		// nada hasta que la isla se enganche, pero **su geometría interna sí**: si no
		// se arma acá, el ramal entero queda apilado en una sola casilla y la mudanza
		// que lo engancha traslada el amontonamiento tal cual.
		mudanza = {
			members: islaDe(sistemaOtra.id),
			from: hexOf(sistemaOtra),
			to: neighbourOf(hexOf(sistemaUna), una.bearing)
		};
	}

	// **Antes de tocar nada.** Que la mudanza encime dos sistemas no rompe ninguna
	// restricción de la base: los dos quedan en la misma casilla y el mapa dibuja
	// uno encima del otro sin que nada avise. Se comprueba acá, que es el único
	// lugar donde se mueve un sistema.
	if (mudanza) {
		const choque = collisionAfterMove(db, mudanza.members, mudanza.from, mudanza.to);
		if (choque) {
			throw new BuilderError(
				`Esa conexión pondría ${choque.member.name} encima de ${choque.ocupante.name}. ` +
					'Elegí otro rumbo.'
			);
		}
	}

	db.transaction((tx) => {
		if (mudanza) moveIsland(tx, mudanza.members, mudanza.from, mudanza.to);

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

/**
 * Si las dos puntas de una puerta son vecinas en la grilla.
 *
 * Falso es un **atajo**, no un error: una galaxia donde todo cierra en espejo es
 * una grilla y nada más. El mapa los dibuja distinto para que se vean, que es
 * justamente la gracia.
 */
export function isShortcut(db: Db, gateId: number): boolean {
	const fila = db.select().from(gate).where(eq(gate.id, gateId)).get();
	if (!fila || fila.destinationId === null) return false;

	const gemela = db.select().from(gate).where(eq(gate.bodyId, fila.destinationId)).get();
	if (!gemela) return false;

	const aqui = db.select().from(system).where(eq(system.id, fila.systemId)).get();
	const alla = db.select().from(system).where(eq(system.id, gemela.systemId)).get();
	if (!aqui || !alla) return false;

	return !sameHex(neighbourOf(hexOf(aqui), fila.bearing), hexOf(alla));
}

/**
 * Cierra o reabre el paso por una puerta, en las dos puntas.
 *
 * **Cerrar no es desconectar.** Una puerta desconectada es obra a medio hacer y
 * el mapa la dibuja como un muñón; una cerrada existe, sigue llevando adonde
 * llevaba y no se puede cruzar. Es lo que hace falta para **aislar un sistema**
 * sin borrarle las salidas ni moverle la casilla a nadie: una cuarentena, un
 * bloqueo de facción, un evento del mundo.
 *
 * Se escribe en las dos puntas porque una puerta cerrada de un lado está cerrada
 * y punto. Guardarlo en una sola dejaría entrar a quien viene de la otra, que es
 * el peor modo de fallar: parece que funciona hasta que alguien lo prueba al
 * revés.
 */
export function setGateClosed(
	db: Db,
	gateId: number,
	closed: boolean,
	actorId: number | null
): void {
	const una = db.select().from(gate).where(eq(gate.id, gateId)).get();
	if (!una) throw new BuilderError('Esa puerta no existe.');
	if (una.destinationId === null) {
		throw new BuilderError('Esa puerta no lleva a ninguna parte: no hay paso que cerrar.');
	}
	if (una.closed === closed) return;

	const gemela = db.select().from(gate).where(eq(gate.bodyId, una.destinationId)).get();
	const cuerpoUna = db.select().from(body).where(eq(body.id, una.bodyId)).get()!;
	const cuerpoOtra = db.select().from(body).where(eq(body.id, una.destinationId)).get();

	db.transaction((tx) => {
		tx.update(gate).set({ closed }).where(eq(gate.id, una.id)).run();
		if (gemela) tx.update(gate).set({ closed }).where(eq(gate.id, gemela.id)).run();

		record(tx, {
			kind: closed ? 'gate.closed' : 'gate.opened',
			actorId,
			subject: { kind: 'gate', id: una.id },
			payload: { name: cuerpoUna.name, destination: cuerpoOtra?.name ?? '' }
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
			explored: true,
			bodyClass: '',
			atmosphere: '',
			starClass: ''
		},
		oppositeBearing(suelta.bearing),
		actorId
	);

	connectGates(db, suelta.id, vuelta.gate.id, jumpDistance, actorId);
	return creado;
}

/**
 * La estrella **principal** de un sistema: la primera de sus raíces.
 *
 * Un sistema puede tener varias —un binario tiene dos soles y ninguno cuelga del
 * otro—, así que hay que decir cuál se devuelve o se devuelve una al azar. Es la
 * de identificador más bajo, que es la que se creó con el sistema: de ella
 * cuelga lo que el constructor planta solo, como la puerta de vuelta de
 * `growFromGate`. Quien necesite las dos, que las pida por separado.
 */
export function starOf(db: Db, systemId: number): Body {
	const fila = db
		.select()
		.from(body)
		.where(and(eq(body.systemId, systemId), isNull(body.parentId)))
		.orderBy(asc(body.id))
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
		capitalOf: ''
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
