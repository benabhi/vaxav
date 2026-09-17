/**
 * Entrar y salir de una corporación.
 *
 * Hoy es una sola columna del piloto, pero vive en su propio módulo porque es
 * donde van a crecer las de jugadores: roles, permisos, billetera compartida y
 * bienes. Meter eso en `pilots.ts` sería cargarle al alta media mecánica que no
 * tiene nada que ver con crear una cuenta.
 *
 * **La reputación no se toca acá.** El número es del par piloto × corporación y
 * existe con o sin membresía —se puede tener treinta con una en la que nunca se
 * estuvo—, que es lo que va a permitir que una de jugadores pida «Confiable para
 * entrar» sin inventar nada nuevo.
 *
 * Corresponde a docs/systems/CORPORATIONS.md.
 */

import { eq } from 'drizzle-orm';
import { corporation, pilot, type Corporation, type Pilot } from '../db/schema';
import type { Db } from '../db/types';

/** No se puede entrar ni salir. El mensaje se le muestra al jugador. */
export class CorporationError extends Error {}

/** La fila de la corporación con ese código, o el error que lo explica. */
function requireCorporation(db: Db, code: string): Corporation {
	const fila = db.select().from(corporation).where(eq(corporation.code, code)).get();
	if (!fila) throw new CorporationError('Esa corporación no existe.');
	return fila;
}

/**
 * Alista al piloto en una corporación.
 *
 * Tres condiciones, y las tres dicen lo mismo desde distintos lados: que la
 * elección signifique algo.
 *
 * - **Tiene que estar libre.** Renunciar es una decisión aparte, y hacerla sola
 *   evita el paso en falso de aparecer en otra corporación sin haber salido de la
 *   anterior.
 * - **Tiene que ser de su facción.** Es la misma regla que ya valida el alta, con
 *   el mismo motivo: alistarse en una del Dominio habiendo nacido en el Pacto no
 *   es una elección interesante, es una contradicción. Las cuatro sin bandera
 *   quedan afuera por la misma cuenta, igual que en el alta: operan estaciones,
 *   no reciben pilotos.
 * - **Las del mundo aceptan siempre.** El día que existan las de jugadores va a
 *   haber un campo que diga si reciben aspirantes; ponerlo hoy sería una columna
 *   en `true` para todas.
 */
export function joinCorporation(db: Db, row: Pilot, code: string): Pilot {
	if (row.corporationId !== null) {
		throw new CorporationError('Ya respondés a una corporación. Renunciá antes de alistarte.');
	}

	const suya = requireCorporation(db, code);
	if (suya.faction !== row.faction) {
		throw new CorporationError('Esa corporación no recibe pilotos de tu origen.');
	}

	return db
		.update(pilot)
		.set({ corporationId: suya.id })
		.where(eq(pilot.id, row.id))
		.returning()
		.get();
}

/**
 * El piloto renuncia y vuelve a volar por su cuenta.
 *
 * **Independiente es un estado legítimo y no un dato que falte**, así que salir
 * no deja nada a medias: la pantalla lo dice con esa palabra y sigue habiendo
 * juego del otro lado.
 */
export function leaveCorporation(db: Db, row: Pilot): Pilot {
	if (row.corporationId === null) {
		throw new CorporationError('No respondés a ninguna corporación.');
	}

	return db
		.update(pilot)
		.set({ corporationId: null })
		.where(eq(pilot.id, row.id))
		.returning()
		.get();
}
