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
import type { ShipModule } from '$lib/game/modules';
import { levelFromXp } from '$lib/game/progression';
import { SKILLS, type SkillCode } from '$lib/game/skills';
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

	return created;
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
 * Cambia la configuración de la nave del piloto, si es que puede.
 *
 * Es la puerta con llave; `saveFit` es la escritura cruda, que usan la siembra y
 * las pruebas. La interfaz ya apaga el banco de trabajo cuando no se puede, pero
 * **el servicio no confía sólo en eso**: nadie más que él escribe en la base.
 */
export function refit(db: Db, row: Pilot, codes: readonly string[]): void {
	const now = situation(db, row);
	if (!now.canRefit) throw new ShipError(now.refitBlocked);

	const found = activeShip(db, row.id);
	if (!found) throw new ShipError('No tenés ninguna nave.');

	saveFit(db, found, codes);
}
