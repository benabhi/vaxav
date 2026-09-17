/**
 * Los miembros de la corporación del piloto.
 *
 * Vive aparte de `corporation.ts` porque es **otra consulta y otra pantalla**: la
 * ficha describe a la corporación y esto lista gente, que crece por su cuenta y va
 * a necesitar orden y paginado el día que una tenga dos mil pilotos.
 *
 * **Lo que se muestra de cada uno es lo público**: cómo se llama, a qué se dedica y
 * desde cuándo vuela. Dónde está parado ahora no: eso es información operativa, y
 * un listado de miembros no es un radar.
 *
 * Corresponde a docs/systems/CORPORATIONS.md.
 */

import { asc, eq } from 'drizzle-orm';
import { pilot, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { getProfession } from '$lib/game/professions';
import { FACTIONS } from '$lib/game/factions';
import type { MiembroCorporacion, Miembros } from '$lib/tipos';

/** Lo que muestra la pestaña cuando el piloto no pertenece a ninguna. */
const SIN_CORPORACION: Miembros = { belongs: false, name: '', count: '', members: [] };

/**
 * Quiénes son los otros.
 *
 * Una sola consulta: los pilotos de esa corporación, ordenados por antigüedad, que
 * es el orden con el que una corporación se cuenta a sí misma —quién estaba antes—
 * y no el alfabético, que no dice nada.
 */
export function buildMiembros(db: Db, row: Pilot): Miembros {
	if (row.corporationId === null) return SIN_CORPORACION;

	const filas = db
		.select()
		.from(pilot)
		.where(eq(pilot.corporationId, row.corporationId))
		.orderBy(asc(pilot.createdAt), asc(pilot.id))
		.all();

	const members: MiembroCorporacion[] = filas.map((uno) => ({
		callsign: uno.callsign,
		profession: professionName(uno.profession),
		faction: FACTIONS[uno.faction as keyof typeof FACTIONS]?.name ?? 'Sin bandera',
		since: uno.createdAt.getTime(),
		isYou: uno.id === row.id
	}));

	return {
		belongs: true,
		name: '',
		count: members.length === 1 ? '1 piloto' : `${members.length} pilotos`,
		members
	};
}

/** El oficio, en palabras. Un código desconocido se muestra tal cual y no revienta. */
function professionName(code: string): string {
	try {
		return getProfession(code).name;
	} catch {
		return code;
	}
}
