/**
 * En qué situación está un piloto, resuelto contra la base.
 *
 * Junta las tres cosas que hacen falta para responder «¿qué puede hacer ahora?»
 * —dónde está, qué hay ahí y si tiene una orden en curso— y se las pasa a las
 * reglas puras de `../game/status`.
 *
 * Es **una sola consulta para toda la aplicación**: la pantalla de navegación,
 * la de la nave y el motor de acciones preguntan lo mismo acá, en vez de
 * deducirlo cada una por su cuenta. Dos lugares que deciden lo mismo terminan
 * decidiendo distinto.
 */

import { eq } from 'drizzle-orm';
import { body, pilotAction, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import {
	canGiveOrders,
	canRefit,
	orderBlockedReason,
	refitBlockedReason,
	statusFor,
	type PilotStatus
} from '../game/status';
import type { StationServiceKind } from '../game/universe';
import { bodyDetail } from './universe';

/**
 * Dónde está el piloto y qué le habilita eso.
 *
 * Lo derivado viene resuelto y no como funciones: esto viaja entero a la
 * pantalla, que tiene que poder dibujarse sin volver a razonar nada.
 */
export interface Situation {
	readonly status: PilotStatus;
	/** Cómo se llama el lugar donde está, para poder nombrarlo en los avisos. */
	readonly place: string;
	/** Los módulos de la estación, vacío si no está en una. */
	readonly services: readonly StationServiceKind[];

	/** ¿Puede empezar una acción nueva? */
	readonly canOrder: boolean;
	/** Por qué no puede, o cadena vacía. */
	readonly orderBlocked: string;
	/** ¿Puede cambiar los módulos de su nave? */
	readonly canRefit: boolean;
	/** Por qué no puede equipar, o cadena vacía. */
	readonly refitBlocked: string;
	readonly inTransit: boolean;
}

function describe(
	status: PilotStatus,
	place: string,
	services: readonly StationServiceKind[]
): Situation {
	return {
		status,
		place,
		services,
		canOrder: canGiveOrders(status),
		orderBlocked: orderBlockedReason(status),
		canRefit: canRefit(status, services),
		refitBlocked: refitBlockedReason(status, services, place),
		inTransit: status === 'in_transit'
	};
}

/**
 * La situación del piloto ahora mismo.
 *
 * **No resuelve la orden vencida**: sólo mira si hay una. Resolver es cosa de
 * `resolveIfDue`, que se llama antes de dibujar cualquier pantalla; mezclarlo
 * acá haría que una consulta de sólo lectura tuviera efectos.
 */
export function situation(db: Db, row: Pilot): Situation {
	// La consulta va suelta y no por el módulo de acciones a propósito: el motor
	// de acciones necesita preguntar por la situación antes de aceptar una orden,
	// así que si este módulo dependiera de aquél habría un ciclo.
	const busy =
		db.select().from(pilotAction).where(eq(pilotAction.pilotId, row.id)).get() !== undefined;

	const place = row.locationId
		? db.select().from(body).where(eq(body.id, row.locationId)).get()
		: undefined;
	if (!place) return describe(statusFor(false, busy), '', []);

	if (place.kind !== 'station') return describe(statusFor(false, busy), place.name, []);

	const detail = bodyDetail(db, place.code);
	return describe(statusFor(true, busy), place.name, detail?.services ?? []);
}
