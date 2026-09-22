/**
 * La nave de un piloto: crearla, leerla, guardarla y calcular lo que rinde.
 *
 * Mismo patrón que el resto de los servicios: la base va como primer argumento,
 * y acá se juntan las reglas puras de `../game/fitting` con las tablas.
 *
 * La regla que ordena este módulo: **de la base sale sólo el casco y qué hay en
 * cada ranura**. Cualquier número que describa a la nave —masa, velocidad,
 * alcance, aguante, rendimiento— se le pide a la calculadora, que es la misma
 * que usa la pantalla y la que resuelve las acciones. No hay una segunda
 * matemática que pueda desfasarse.
 */

import { unmetFrom } from '$lib/game/skills';
import { requirementsLabel } from '$lib/format';
import { and, eq } from 'drizzle-orm';
import { fittedModule, pilot, pilotSkill, ship, type Pilot, type Ship } from '../db/schema';
import type { Db } from '../db/types';
import {
	buildReadout,
	defaultFit,
	fitFromCodes,
	type Readout,
	type SkillLevels
} from '$lib/game/fitting';
import { STARTING_HULL, getHull, type Hull } from '$lib/game/hulls';
import { capacityTenths, type ContainerKind } from '$lib/game/items';
import { getModule, type ShipModule } from '$lib/game/modules';
import { levelFromXp } from '$lib/game/progression';
import { SKILLS, type SkillCode } from '$lib/game/skills';
import { moveItem, quantityOf, shipContainer, stationContainer, usedVolume } from './containers';
import { situation } from './status';

/** La nave no está donde debería. El mensaje se le muestra al jugador. */
export class ShipError extends Error {}

/** La nave que el piloto está usando, o `null` si no tiene ninguna. */
export function activeShip(db: Db, pilotId: number): Ship | null {
	return (
		db
			.select()
			.from(ship)
			.where(and(eq(ship.pilotId, pilotId), eq(ship.isActive, true)))
			.get() ?? null
	);
}

/**
 * Le da al piloto su primera nave, salida del astillero.
 *
 * Sale con los internos esenciales puestos y el resto de las ranuras vacías:
 * viene completa, no viene buena. Lo que la define lo elige el piloto.
 */
export function createStarterShip(db: Db, pilotId: number, hullCode = STARTING_HULL): Ship {
	const hull = getHull(hullCode);
	const created = db
		.insert(ship)
		.values({ pilotId, hull: hull.code, isActive: true })
		.returning()
		.get();

	const rows = defaultFit(hull)
		.map((module, index) => ({ shipId: created.id, slotIndex: index, moduleCode: module.code }))
		.filter((row) => row.moduleCode !== '');
	if (rows.length) db.insert(fittedModule).values(rows).run();

	// **Sale del astillero con el tanque lleno.** Una nave nueva vacía sería un
	// piloto que no puede saltar y no sabe por qué: el combustible no se ve hasta
	// que se abre la ficha, y nadie abre la ficha antes del primer viaje.
	return fill(db, created);
}

/**
 * La capacidad del tanque de una nave.
 *
 * Sale del **equipamiento**, no del casco: un tanque montado la sube. Por eso hay
 * que leer la configuración para saberla, y por eso no se guarda.
 *
 * Se calcula sin niveles de habilidad porque hoy **ninguna toca la capacidad**:
 * los bonos llegan al alcance, a la bodega y a la velocidad, no al tanque. El día
 * que alguno lo haga, hay que pasarle los del piloto acá.
 */
export function fuelCapacity(db: Db, row: Ship): number {
	return buildReadout(shipHull(row), shipFit(db, row), {}).fuel;
}

/** Le llena el tanque hasta donde le da la capacidad. */
export function fill(db: Db, row: Ship): Ship {
	return setFuel(db, row, fuelCapacity(db, row));
}

/**
 * Le deja el tanque en esa cantidad, acotada entre cero y su capacidad.
 *
 * Acota en vez de fallar porque los dos extremos pasan solos: desmontar un tanque
 * deja la nave con más combustible del que puede llevar, y un consumo mal
 * calculado la dejaría en negativo. Ninguna de las dos cosas tiene por qué tumbar
 * lo que el piloto estaba haciendo.
 */
export function setFuel(db: Db, row: Ship, units: number): Ship {
	const capacidad = fuelCapacity(db, row);
	const puesto = Math.min(Math.max(0, Math.trunc(units)), capacidad);

	return db.update(ship).set({ fuel: puesto }).where(eq(ship.id, row.id)).returning().get();
}

/** Le saca combustible del tanque. Nunca lo deja en negativo. */
export function burnFuel(db: Db, row: Ship, units: number): Ship {
	return setFuel(db, row, row.fuel - Math.max(0, Math.trunc(units)));
}

/** El casco de una nave, o un error que dice cuál falta del catálogo. */
export function shipHull(row: Ship): Hull {
	try {
		return getHull(row.hull);
	} catch {
		throw new ShipError(
			`La nave ${row.id} dice ser un '${row.hull}', que no está en el catálogo de cascos.`
		);
	}
}

/**
 * Qué tiene montado, resuelto contra el catálogo.
 *
 * Una ranura sin fila sale vacía, no falta: es la forma normal de guardar una
 * nave a la que le sobran ranuras.
 */
export function shipFit(db: Db, row: Ship): readonly ShipModule[] {
	const hull = shipHull(row);
	const codes: string[] = Array(hull.slots.length).fill('');
	for (const fitted of db
		.select()
		.from(fittedModule)
		.where(eq(fittedModule.shipId, row.id))
		.all()) {
		if (fitted.slotIndex >= 0 && fitted.slotIndex < codes.length) {
			codes[fitted.slotIndex] = fitted.moduleCode;
		}
	}
	return fitFromCodes(hull, codes);
}

/**
 * Deja la nave con exactamente esta configuración.
 *
 * Se borran las filas y se escriben las nuevas en vez de ir buscando cuál
 * cambió: son once filas, y comparar cuesta más código que reescribir.
 */
export function saveFit(db: Db, row: Ship, codes: readonly string[]): void {
	const hull = shipHull(row);
	if (codes.length !== hull.slots.length) {
		throw new ShipError(
			`${hull.name} tiene ${hull.slots.length} ranuras y llegaron ${codes.length}`
		);
	}
	// Valida contra el catálogo antes de tocar la base: una configuración
	// imposible no debería llegar a escribirse a medias.
	fitFromCodes(hull, codes);

	db.transaction((tx) => {
		tx.delete(fittedModule).where(eq(fittedModule.shipId, row.id)).run();
		const rows = codes
			.map((code, index) => ({ shipId: row.id, slotIndex: index, moduleCode: code }))
			.filter((entry) => entry.moduleCode !== '');
		if (rows.length) tx.insert(fittedModule).values(rows).run();
	});
}

/**
 * Los niveles del piloto, listos para la calculadora.
 *
 * Se traen todos de una consulta y se traducen acá: preguntar habilidad por
 * habilidad sería una consulta por bono, que es el error que no se nota con un
 * piloto y sí con cien.
 */
export function pilotSkillLevels(db: Db, pilotId: number): Record<string, number> {
	const levels: Record<string, number> = {};
	for (const row of db.select().from(pilotSkill).where(eq(pilotSkill.pilotId, pilotId)).all()) {
		const skill = SKILLS[row.skill as SkillCode];
		if (skill) levels[row.skill] = levelFromXp(row.xp, skill.difficulty);
	}
	return levels;
}

/**
 * La hoja de rendimiento de la nave del piloto, o `null` si no tiene.
 *
 * `skills` permite pisar los niveles para el modo "con todo entrenado" de la
 * pantalla; sin él se usan los del piloto, que es lo que rinde de verdad.
 */
export function shipReadout(db: Db, row: Pilot, skills?: SkillLevels): Readout | null {
	const found = activeShip(db, row.id);
	if (!found) return null;
	return buildReadout(shipHull(found), shipFit(db, found), skills ?? pilotSkillLevels(db, row.id));
}

/**
 * Le da una nave inicial a todo piloto que no tenga, y devuelve cuántas creó.
 *
 * Es idempotente, como la siembra del universo: correrla diez veces deja lo
 * mismo que correrla una. Existe para los pilotos creados antes de que existiera
 * el hangar.
 */
export function ensureEveryPilotHasAShip(db: Db): number {
	let created = 0;
	for (const row of db.select().from(pilot).all()) {
		if (activeShip(db, row.id) === null) {
			createStarterShip(db, row.id);
			created += 1;
		}
	}
	return created;
}

/**
 * Le llena el tanque a toda nave que lo tenga vacío, y devuelve cuántas tocó.
 *
 * Existe por la misma razón que el reparto de naves: las que se crearon antes de
 * que el tanque existiera quedaron en cero, y un piloto que no puede saltar
 * porque su nave nació sin combustible no tiene forma de enterarse de por qué.
 *
 * **Sólo toca las que están en cero.** Una nave a medio tanque es el resultado de
 * haber saltado, y rellenarla sería regalar combustible en cada siembra.
 */
export function ensureEveryShipHasFuel(db: Db): number {
	let filled = 0;
	for (const row of db.select().from(ship).all()) {
		if (row.fuel > 0) continue;
		fill(db, row);
		filled += 1;
	}
	return filled;
}

/**
 * Qué ranuras cambiaron entre dos configuraciones.
 *
 * Devuelve por separado lo que se baja y lo que se sube, que es lo que hace
 * falta para mover la carga. Un módulo que se queda donde estaba no aparece: no
 * pasó por la bodega, así que no tiene por qué dejar asiento.
 */
function fitChanges(
	before: readonly string[],
	after: readonly string[]
): { removed: string[]; added: string[] } {
	const removed: string[] = [];
	const added: string[] = [];

	for (let index = 0; index < after.length; index++) {
		const antes = before[index] ?? '';
		const despues = after[index];
		if (antes === despues) continue;
		if (antes !== '') removed.push(antes);
		if (despues !== '') added.push(despues);
	}

	return { removed, added };
}

/**
 * Cambia la configuración de la nave del piloto, si es que puede.
 *
 * Es la puerta con llave; `saveFit` es la escritura cruda, que usan la siembra y
 * las pruebas. La interfaz ya apaga el equipamiento cuando no se puede, pero
 * **el servicio no confía sólo en eso**: nadie más que él escribe en la base.
 *
 * **Lo que se baja queda en la estación**, como el hangar de EVE. Es la única
 * regla que se explica sola: equipar sólo se puede estando atracado, así que lo
 * que sale de una ranura sale ahí y no hay que preguntarse si entra en la nave.
 * Para llevárselo, se sube a la bodega desde la pantalla de carga.
 *
 * Lo que se monta sale de donde diga `from`, porque la pantalla muestra las dos
 * bodegas por separado y el jugador eligió una. Tomar de la otra sería hacerle
 * algo distinto de lo que pidió.
 *
 * Todo pasa en una transacción con la escritura del equipamiento: una bodega que
 * recibe un módulo que la nave todavía tiene puesto es un módulo duplicado.
 */
export function refit(
	db: Db,
	row: Pilot,
	codes: readonly string[],
	from: ContainerKind = 'ship'
): void {
	const now = situation(db, row);
	if (!now.canRefit) throw new ShipError(now.refitBlocked);
	if (now.stationId === null) throw new ShipError('Hay que estar atracado para equipar.');

	const found = activeShip(db, row.id);
	if (!found) throw new ShipError('No tenés ninguna nave.');

	const hull = shipHull(found);
	const stationId = now.stationId;

	db.transaction((tx) => {
		const before = shipFit(tx, found).map((module) => module.code);
		const { removed, added } = fitChanges(before, codes);

		const bodega = shipContainer(tx, found.id);
		const hangar = stationContainer(tx, row.id, stationId);
		const origen = from === 'ship' ? bodega : hangar;

		for (const code of added) {
			if (quantityOf(tx, origen.id, code) < 1) {
				throw new ShipError(`No tenés ${getModule(code).name} en esa bodega.`);
			}
			moveItem(tx, origen.id, code, -1, 'fitted');
		}
		for (const code of removed) {
			moveItem(tx, hangar.id, code, 1, 'unfitted');
		}

		// La capacidad que va a tener **después**: bajar una bodega adicional
		// achica el lugar sin sacar nada de adentro, así que la carga que ya
		// llevabas podría dejar de entrar.
		const skills = pilotSkillLevels(tx, row.id);

		// **Los requisitos también se validan acá.** La pantalla ya no ofrece lo que
		// el piloto no sabe usar, pero el servicio no confía en la pantalla: un
		// pedido armado a mano no puede dejar una nave con un módulo que la clava en
		// tierra. Es la regla de fallar en el borde, y el mensaje dice qué falta.
		for (const code of added) {
			const faltan = unmetFrom(getModule(code).requirements, skills);
			if (faltan.length > 0) {
				throw new ShipError(
					`No sabés usar ${getModule(code).name}: te falta ${requirementsLabel(faltan)}.`
				);
			}
		}

		const despues = buildReadout(hull, fitFromCodes(hull, codes), skills);
		if (usedVolume(tx, bodega.id) > capacityTenths(despues.cargo)) {
			throw new ShipError('Con eso desmontado no te entra la carga que llevás.');
		}

		saveFit(tx, found, codes);

		// **El tanque se recorta acá y no al mirarlo.** Desmontar un depósito
		// auxiliar deja la nave con más combustible del que ahora le entra, y eso
		// venía sobreviviendo hasta el próximo salto con dos vistas tapándolo con un
		// `Math.min`. Lo que no entra se derrama: la bodega puede negarse porque la
		// carga se puede dejar en tierra, y el combustible ya está adentro del
		// tanque, así que no hay dónde ponerlo.
		setFuel(tx, found, found.fuel);
	});
}
