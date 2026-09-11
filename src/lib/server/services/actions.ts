/**
 * Arrancar y resolver la acción en curso de un piloto.
 *
 * Mismo patrón que el resto de los servicios: cada función recibe la base como
 * primer argumento, y junta las reglas puras de `../game/actions` y
 * `../game/progression` con las tablas.
 *
 * La resolución es perezosa: no hay ningún proceso corriendo en segundo plano.
 * `resolveIfDue` se llama al consultar —típicamente al cargar una pantalla— y
 * sólo entonces se aplica lo que ya venció.
 */

import { and, eq, sql } from 'drizzle-orm';
import {
	body,
	pilot,
	pilotAction,
	pilotSkill,
	type Body,
	type Pilot,
	type PilotAction
} from '../db/schema';
import type { Db } from '../db/types';
import {
	TRAVEL_PRIMARY_SKILL,
	TRAVEL_SECONDARY_SKILLS,
	travelDurationSeconds
} from '../game/actions';
import { actionXpPool, distributeXp } from '../game/progression';
import { shipReadout } from './ships';
import { situation } from './status';
import { bodyDistance } from './universe';

export const TRAVEL_KIND = 'travel';

/** La acción no se puede iniciar. El mensaje se le muestra al jugador. */
export class ActionError extends Error {}

/** Lo que pasó al resolverse una acción, para informar en la interfaz. */
export interface ActionReport {
	readonly kind: string;
	readonly destinationName: string;
	readonly xpAwarded: Record<string, number>;
}

/** La acción en curso del piloto, o `null` si no tiene ninguna. */
export function currentAction(db: Db, pilotId: number): PilotAction | null {
	return db.select().from(pilotAction).where(eq(pilotAction.pilotId, pilotId)).get() ?? null;
}

/**
 * Ordena viajar a `destination`. Falla si ya hay una orden en curso.
 *
 * Defensa en profundidad: la interfaz ya bloquea el botón sin nave, pero el
 * servicio no confía sólo en eso — nadie más que él escribe en la base.
 */
export function startTravel(db: Db, row: Pilot, destination: Body): PilotAction {
	// Quién puede dar una orden lo decide un solo lugar, y no cada pantalla por
	// su cuenta: ver ../game/status.
	const now = situation(db, row);
	if (!now.canOrder) throw new ActionError(now.orderBlocked);

	// La hoja de rendimiento de su nave: de ahí sale la velocidad, y de paso dice
	// si tiene nave. Es la misma calculadora que muestra la pantalla, así que el
	// viaje tarda exactamente lo que la ficha promete.
	const readout = shipReadout(db, row);
	if (readout === null) throw new ActionError('Necesitás una nave para viajar.');
	if (!readout.flyable) throw new ActionError('Tu nave no está en condiciones de volar.');
	if (destination.id === row.locationId) throw new ActionError('Ya estás ahí.');

	const distance = bodyDistance(db, row.locationId, destination.id);
	const duration = travelDurationSeconds(distance, readout.speed);

	return db
		.insert(pilotAction)
		.values({
			pilotId: row.id,
			kind: TRAVEL_KIND,
			durationSeconds: duration,
			originBodyId: row.locationId,
			destinationBodyId: destination.id
		})
		.returning()
		.get();
}

/**
 * Si la orden en curso ya venció, la aplica y la borra.
 *
 * Mover al piloto, repartir la experiencia y borrar la fila pasa en la misma
 * transacción: a mitad de camino dejaría un viaje fantasma o un piloto que llegó
 * sin haber cobrado nada.
 *
 * **Se resuelve exactamente una vez.** La transacción empieza por quedarse con
 * la fila —un borrado condicional que devuelve lo que borró— y sólo el que se la
 * lleva reparte el botín. Dos consultas simultáneas entregarían el premio dos
 * veces si primero leyeran y después borraran.
 */
export function resolveIfDue(db: Db, row: Pilot): ActionReport | null {
	const pending = currentAction(db, row.id);
	if (pending === null) return null;

	const due = new Date(pending.startedAt.getTime() + pending.durationSeconds * 1000);
	if (new Date() < due) return null;

	return db.transaction((tx) => {
		// Quedarse con la fila es lo primero: si otro llegó antes, no hay nada que
		// aplicar y la respuesta correcta es que ya estaba resuelta.
		const claimed = tx
			.delete(pilotAction)
			.where(and(eq(pilotAction.id, pending.id), eq(pilotAction.pilotId, row.id)))
			.returning()
			.get();
		if (!claimed) return null;

		const destination = tx.select().from(body).where(eq(body.id, claimed.destinationBodyId)).get();

		const pool = actionXpPool(claimed.durationSeconds / 60);
		const awarded = distributeXp(pool, TRAVEL_PRIMARY_SKILL, TRAVEL_SECONDARY_SKILLS);

		tx.update(pilot)
			.set({ locationId: claimed.destinationBodyId })
			.where(eq(pilot.id, row.id))
			.run();

		for (const [skill, xp] of Object.entries(awarded)) {
			// Una sola sentencia por habilidad: con el índice único de la tabla, el
			// conflicto es la señal de que la fila ya existía y hay que sumarle.
			tx.insert(pilotSkill)
				.values({ pilotId: row.id, skill, xp })
				.onConflictDoUpdate({
					target: [pilotSkill.pilotId, pilotSkill.skill],
					set: { xp: sql`${pilotSkill.xp} + ${xp}` }
				})
				.run();
		}

		return {
			kind: claimed.kind,
			destinationName: destination?.name ?? '',
			xpAwarded: awarded
		};
	});
}
