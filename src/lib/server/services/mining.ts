/**
 * Los cinturones: qué tienen, cuánto queda y cómo se saca.
 *
 * Mismo patrón que el resto de los servicios: la base entra como primer
 * argumento, así que descontar el cinturón puede ir dentro de la transacción que
 * resuelve la orden —y tiene que ir, o dos pestañas abiertas sacan el mismo
 * mineral dos veces—.
 *
 * **La reserva es una sola y la comparten todos.** Si muchos trabajan el mismo
 * cinturón rinde menos para todos, y eso es lo que convierte al mapa en un lugar
 * disputado en vez de una lista de destinos.
 *
 * Ver docs/systems/UNIVERSE.md.
 */

import { and, asc, eq } from 'drizzle-orm';
import { beltDeposit as beltDepositTable, body, type BeltDeposit, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { cargoHold, shipContainer } from './containers';
import { activeShip, shipReadout } from './ships';
import { planMining, restored, type MiningPlan } from '$lib/game/mining';
import { getAsteroid } from './asteroids';
import { getOre } from '$lib/game/items';

/** No se puede minar. El mensaje se le muestra al jugador. */
export class MiningError extends Error {}

/**
 * Un depósito con la recuperación ya aplicada y guardada.
 *
 * Se persiste al leerlo y no sólo se calcula al vuelo porque la recuperación
 * tiene que ser **idempotente**: si el tiempo transcurrido se midiera siempre
 * contra la última extracción, mirar el cinturón diez veces sumaría diez veces.
 * `restoredAt` es la marca que dice hasta cuándo ya se aplicó.
 */
function refresh(db: Db, row: BeltDeposit, now: Date): BeltDeposit {
	const elapsed = Math.max(0, Math.floor((now.getTime() - row.restoredAt.getTime()) / 1000));
	if (elapsed === 0) return row;

	const remaining = restored({
		remaining: row.remaining,
		capacity: row.capacity,
		regenPerHour: row.regenPerHour,
		secondsElapsed: elapsed
	});

	return (
		db
			.update(beltDepositTable)
			.set({ remaining, restoredAt: now })
			.where(eq(beltDepositTable.id, row.id))
			.returning()
			.get() ?? row
	);
}

/**
 * Lo que hay en un cinturón, al día.
 *
 * Devuelve vacío si el cuerpo no es un cinturón, que es información y no un
 * error: preguntar qué se mina en un planeta es una pregunta razonable con una
 * respuesta corta.
 */
export function beltDeposits(db: Db, bodyId: number, now = new Date()): readonly BeltDeposit[] {
	const filas = db
		.select()
		.from(beltDepositTable)
		.where(eq(beltDepositTable.bodyId, bodyId))
		.orderBy(asc(beltDepositTable.oreCode))
		.all();

	return filas.map((fila) => refresh(db, fila, now));
}

/** Un depósito puntual, al día, o `null` si ese cinturón no lo tiene. */
export function depositFor(
	db: Db,
	bodyId: number,
	oreCode: string,
	now = new Date()
): BeltDeposit | null {
	const fila = db
		.select()
		.from(beltDepositTable)
		.where(and(eq(beltDepositTable.bodyId, bodyId), eq(beltDepositTable.oreCode, oreCode)))
		.get();
	return fila ? refresh(db, fila, now) : null;
}

/**
 * La orden que saldría de picar **esta roca** acá y ahora.
 *
 * Se calcula con la nave, la bodega y la roca de verdad, así que es exactamente
 * lo que la pantalla puede prometer: cuánto va a traer y cuánto va a tardar.
 * Devuelve el plan aunque esté bloqueado, porque el motivo es lo que hay que
 * mostrar.
 *
 * Que apunte a una roca y no a un mineral del cinturón es lo que cambió con el
 * escáner: no se extrae «silicato de los Anillos», se pica **esa piedra**, y
 * cuando se acaba hay que buscar otra.
 */
export function miningPlan(db: Db, row: Pilot, asteroidId: number): MiningPlan {
	const roca = getAsteroid(db, asteroidId);
	const readout = shipReadout(db, row);
	const nave = activeShip(db, row.id);

	if (!roca) {
		return {
			ore: '',
			cycles: 0,
			cycleSeconds: 0,
			durationSeconds: 0,
			units: 0,
			blocked: 'Esa roca ya no está: alguien la terminó.'
		};
	}
	// Falla temprano y con un mensaje claro si el catálogo no lo conoce.
	getOre(roca.oreCode);

	if (!readout || !nave) {
		return {
			ore: roca.oreCode,
			cycles: 0,
			cycleSeconds: 0,
			durationSeconds: 0,
			units: 0,
			blocked: 'Necesitás una nave para extraer.'
		};
	}

	const hold = cargoHold(db, shipContainer(db, nave.id).id, readout.cargo);

	return planMining({
		oreCode: roca.oreCode,
		miningPerHour: readout.miningPerHour,
		freeTenths: hold.freeTenths,
		remainingUnits: roca.units
	});
}

/** Si ese cuerpo es un cinturón con algo para sacar. */
export function isBelt(db: Db, bodyId: number): boolean {
	const fila = db.select({ kind: body.kind }).from(body).where(eq(body.id, bodyId)).get();
	return fila?.kind === 'belt';
}
