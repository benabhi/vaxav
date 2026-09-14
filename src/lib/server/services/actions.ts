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
 *
 * **Resolver es un despachador, no un procedimiento.** Lo que toda acción
 * comparte —quedarse con la fila, depositar en un pozo, escribir el informe—
 * vive una sola vez acá; lo que cada una hace de propio vive en su resolvedor.
 * Antes esto estaba cableado a viajar, y una acción que no se mueve de lugar
 * habría teletransportado al piloto sin que nada fallara.
 */

import { and, eq } from 'drizzle-orm';
import { body, pilot, pilotAction, type Body, type Pilot, type PilotAction } from '../db/schema';
import type { Db } from '../db/types';
import {
	MINE_KIND,
	TRAVEL_FAMILY,
	TRAVEL_KIND,
	travelDurationSeconds,
	type ActionKind
} from '$lib/game/actions';
import { getOre } from '$lib/game/items';
import { floorDiv } from '$lib/game/math';
import { MINING_FAMILY, cycleSeconds, yieldPerCycleTenths } from '$lib/game/mining';
import { actionXpPool } from '$lib/game/progression';
import type { SkillFamily } from '$lib/game/skills';
import { skillFamilyLabel } from '$lib/format';
import { cargoHold, fitsUnits, moveItem, shipContainer } from './containers';
import { isBelt, miningPlan, takeFromBelt } from './mining';
import { deposit } from './pools';
import { recordEntry, type PoolDeposit } from './log';
import { activeShip, shipReadout } from './ships';
import { situation } from './status';
import { bodyDistance, getBodyById } from './universe';

export { MINE_KIND, TRAVEL_KIND };

/** La acción no se puede iniciar. El mensaje se le muestra al jugador. */
export class ActionError extends Error {}

/**
 * Lo que pasó al resolverse una acción.
 *
 * Es a la vez lo que se le muestra al jugador en el acto y lo que queda escrito
 * en la bitácora: el mismo informe en dos lugares, porque es el mismo hecho. El
 * `id` es el de la fila del registro, para poder enlazarla.
 */
export interface ActionReport {
	readonly id: number;
	readonly kind: string;
	readonly originName: string;
	readonly destinationName: string;
	readonly durationSeconds: number;
	/** Lo que la acción depositó en el pozo de su rama. */
	readonly deposit: PoolDeposit;
}

/**
 * Lo que un resolvedor decide, y lo único que decide.
 *
 * Todo lo demás —reclamar la fila, escribir el informe, no cobrar dos veces— lo
 * hace el despachador, así que una acción nueva no puede olvidarse de ninguna de
 * esas tres cosas.
 */
interface Resolution {
	/** A qué rama le paga esta acción. */
	readonly family: SkillFamily;
	/** Cuánta experiencia deja. */
	readonly xp: number;
	/**
	 * Dónde termina el piloto, o `null` si **no se mueve**. Minar y refinar
	 * ocurren donde estás parado, y la diferencia tiene que poder decirse.
	 */
	readonly movesTo: number | null;
	/**
	 * Lo que la acción produjo, para que el informe pueda contarlo.
	 *
	 * Viajar no produce nada y lo deja vacío; minar deja lo que trajo. Va como
	 * dato y no como texto armado: el informe lo dibuja la capa de vista, que es
	 * la que sabe cómo se escriben las cosas en pantalla.
	 */
	readonly result?: ActionResult;
}

/** Lo que una acción produjo, tal como se guarda en el informe. */
export interface ActionResult {
	readonly mined?: { readonly ore: string; readonly units: number; readonly cycles: number };
}

/** Cómo se resuelve una clase de acción, una vez que la fila ya es nuestra. */
type Resolver = (tx: Db, row: Pilot, claimed: PilotAction) => Resolution;

/**
 * Viajar: el piloto queda en el destino y la experiencia va a Pilotaje.
 *
 * La experiencia va al **pozo de la rama** y no a la habilidad que se usó. Es lo
 * que convierte especializarse en una decisión: el que viaja junta Pilotaje y
 * después elige si lo gasta en Navegación o en abrir otra cosa. Ver
 * docs/systems/SKILLS.md.
 */
const resolveTravel: Resolver = (_tx, _row, claimed) => ({
	family: TRAVEL_FAMILY,
	xp: actionXpPool(claimed.durationSeconds / 60),
	movesTo: claimed.destinationBodyId
});

/**
 * Minar: el piloto no se mueve, la carga entra a la bodega y la experiencia va a
 * Extracción.
 *
 * **Lo que sale se recalcula al resolver**, no se guarda al encargar. Entre que
 * la orden se dio y venció, otro piloto pudo llevarse lo que quedaba y la bodega
 * pudo cambiar de tamaño: el botín es lo que el cinturón puede dar hoy, acotado
 * por lo que los ciclos trabajados alcanzan a sacar. Prometer al encargar lo que
 * el mundo no puede cumplir al entregar es peor que traer menos.
 */
const resolveMine: Resolver = (tx, row, claimed) => {
	const readout = shipReadout(tx, row);
	const nave = activeShip(tx, row.id);
	const vacio = { family: MINING_FAMILY, xp: 0, movesTo: null };
	if (!readout || !nave) return vacio;

	const ore = getOre(claimed.targetCode ?? '');
	const bodega = shipContainer(tx, nave.id);
	const hold = cargoHold(tx, bodega.id, readout.cargo);

	// Lo que los ciclos trabajados alcanzan a sacar, contra lo que entra y lo que
	// queda: el mínimo de los tres es lo que el piloto se lleva de verdad.
	const seconds = Math.max(1, cycleSeconds(ore));
	const cycles = Math.max(1, floorDiv(claimed.durationSeconds, seconds));
	const porCiclo = Math.max(
		1,
		floorDiv(yieldPerCycleTenths(readout.miningPerHour), ore.volumeTenths)
	);

	const posible = Math.min(cycles * porCiclo, fitsUnits(hold.freeTenths, ore.code));
	const units = takeFromBelt(tx, claimed.originBodyId, ore.code, posible);
	if (units > 0) moveItem(tx, bodega.id, ore.code, units, 'mined');

	return {
		family: MINING_FAMILY,
		xp: actionXpPool(claimed.durationSeconds / 60),
		movesTo: null,
		result: { mined: { ore: ore.code, units, cycles } }
	};
};

/**
 * El registro de resolvedores, uno por clase de acción.
 *
 * Está tipado contra `ActionKind`, así que agregar una clase sin su resolvedor
 * no compila. Es la única forma de que el despachador no se olvide de nada.
 */
const RESOLVERS: Readonly<Record<ActionKind, Resolver>> = {
	travel: resolveTravel,
	mine: resolveMine
};

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

	// Viajar es dentro del sistema; entre sistemas se salta por una puerta. Sin
	// esta guarda, un pedido armado a mano con un cuerpo de otro sistema hace
	// estallar `bodyDistance` con un error que el form action no atrapa, y al
	// jugador le sale un 500 en vez de un motivo.
	const origin = getBodyById(db, row.locationId);
	if (origin && destination.systemId !== origin.systemId) {
		throw new ActionError('Ese cuerpo está en otro sistema.');
	}

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
 * Ordena extraer un mineral en el cinturón donde está el piloto.
 *
 * La duración sale del plan, que mira la nave, la bodega y lo que queda en el
 * cinturón. Así la orden tarda exactamente lo que la pantalla prometió, que es la
 * misma regla que ya cumple viajar.
 */
export function startMining(db: Db, row: Pilot, oreCode: string): PilotAction {
	const now = situation(db, row);
	if (!now.canOrder) throw new ActionError(now.orderBlocked);
	if (!isBelt(db, row.locationId)) throw new ActionError('Acá no hay nada que extraer.');

	const readout = shipReadout(db, row);
	if (readout === null) throw new ActionError('Necesitás una nave para extraer.');
	if (!readout.flyable) throw new ActionError('Tu nave no está en condiciones de trabajar.');

	const plan = miningPlan(db, row, oreCode);
	if (plan.blocked) throw new ActionError(plan.blocked);

	return db
		.insert(pilotAction)
		.values({
			pilotId: row.id,
			kind: MINE_KIND,
			durationSeconds: plan.durationSeconds,
			originBodyId: row.locationId,
			// Minar no se mueve de lugar: por eso el destino queda nulo.
			destinationBodyId: null,
			targetCode: plan.ore
		})
		.returning()
		.get();
}

/**
 * Si la orden en curso ya venció, la aplica y la borra.
 *
 * Aplicar el resultado, depositar la experiencia, escribir el informe y borrar la
 * fila pasa en la misma transacción: a mitad de camino dejaría una orden fantasma
 * o un piloto que terminó sin haber cobrado nada.
 *
 * **Se resuelve exactamente una vez.** La transacción empieza por quedarse con la
 * fila —un borrado condicional que devuelve lo que borró— y sólo el que se la
 * lleva reparte el botín. Dos consultas simultáneas entregarían el premio dos
 * veces si primero leyeran y después borraran.
 */
export function resolveIfDue(db: Db, row: Pilot): ActionReport | null {
	const pending = currentAction(db, row.id);
	if (pending === null) return null;

	const due = new Date(pending.startedAt.getTime() + pending.durationSeconds * 1000);
	if (new Date() < due) return null;

	// Se busca el resolvedor **antes** de reclamar la fila. Un `kind` que este
	// código no conoce es una orden de una versión más nueva, y perderla sería
	// peor que dejarla esperando: el piloto queda trabado hasta que el juego sepa
	// resolverla, pero no se le borra nada.
	const resolve = RESOLVERS[pending.kind as ActionKind];
	if (!resolve) return null;

	return db.transaction((tx) => {
		// Quedarse con la fila es lo primero: si otro llegó antes, no hay nada que
		// aplicar y la respuesta correcta es que ya estaba resuelta.
		const claimed = tx
			.delete(pilotAction)
			.where(and(eq(pilotAction.id, pending.id), eq(pilotAction.pilotId, row.id)))
			.returning()
			.get();
		if (!claimed) return null;

		const outcome = resolve(tx, row, claimed);

		// Sólo se mueve el que se mueve. Minar ocurre donde estás parado.
		if (outcome.movesTo !== null) {
			tx.update(pilot).set({ locationId: outcome.movesTo }).where(eq(pilot.id, row.id)).run();
		}

		const { before, after } = deposit(tx, row.id, outcome.family, outcome.xp);
		const depositado: PoolDeposit = {
			family: outcome.family,
			familyName: skillFamilyLabel(outcome.family),
			xp: outcome.xp,
			before,
			after
		};

		const origin = tx.select().from(body).where(eq(body.id, claimed.originBodyId)).get();
		// Puede no haberlo: minar y refinar ocurren donde estás parado.
		const destination =
			claimed.destinationBodyId === null
				? undefined
				: tx.select().from(body).where(eq(body.id, claimed.destinationBodyId)).get();

		// El informe va en la misma transacción que el resultado: si se aplicó la
		// acción y se depositó la experiencia, la bitácora tiene que decirlo. Un
		// informe perdido es una acción que el jugador no sabe que ocurrió.
		const recorded = recordEntry(tx, row.id, {
			kind: claimed.kind,
			durationSeconds: claimed.durationSeconds,
			originBodyId: claimed.originBodyId,
			destinationBodyId: claimed.destinationBodyId,
			deposit: depositado,
			result: outcome.result ?? {}
		});

		return {
			id: recorded.id,
			kind: claimed.kind,
			originName: origin?.name ?? '',
			destinationName: destination?.name ?? '',
			durationSeconds: claimed.durationSeconds,
			deposit: depositado
		};
	});
}
