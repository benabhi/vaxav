/**
 * Los pozos de experiencia del piloto: depositar y gastar.
 *
 * Una acción deposita en la rama de su actividad; el piloto gasta comprando el
 * nivel siguiente de una habilidad de esa rama. Ver docs/systems/SKILLS.md.
 *
 * Mismo patrón que el resto de los servicios: la base entra como primer
 * argumento, así que depositar puede ir dentro de la transacción que resuelve la
 * acción —y tiene que ir, o un pozo se pierde.
 */

import { and, eq, sql } from 'drizzle-orm';
import { pilotPool, pilotSkill } from '../db/schema';
import type { Db } from '../db/types';
import { investmentFor, type Investment, type Pools } from '$lib/game/pools';
import { SKILL_FAMILIES, getSkill, type SkillFamily } from '$lib/game/skills';
import { levelFromXp } from '$lib/game/progression';
import { skillXp } from './pilots';

/** No se puede invertir. El mensaje se le muestra al jugador. */
export class PoolError extends Error {}

/** Lo que el piloto tiene en cada rama. Las que nunca recibieron nada van en cero. */
export function pools(db: Db, pilotId: number): Pools {
	const filas = db.select().from(pilotPool).where(eq(pilotPool.pilotId, pilotId)).all();
	const encontrado = new Map(filas.map((fila) => [fila.family, fila.xp]));

	// Se completan las seis: una rama sin fila es una rama en cero, y quien lee
	// esto no tiene por qué acordarse de esa equivalencia.
	return Object.fromEntries(
		SKILL_FAMILIES.map((family) => [family, encontrado.get(family) ?? 0])
	) as Pools;
}

/**
 * Suma experiencia al pozo de una rama y devuelve cómo quedó.
 *
 * Una sola sentencia: con el índice único de la tabla, el conflicto es la señal
 * de que la fila ya existía y hay que sumarle.
 */
export function deposit(
	db: Db,
	pilotId: number,
	family: SkillFamily,
	xp: number
): { before: number; after: number } {
	const previo =
		db
			.select()
			.from(pilotPool)
			.where(and(eq(pilotPool.pilotId, pilotId), eq(pilotPool.family, family)))
			.get()?.xp ?? 0;

	db.insert(pilotPool)
		.values({ pilotId, family, xp })
		.onConflictDoUpdate({
			target: [pilotPool.pilotId, pilotPool.family],
			set: { xp: sql`${pilotPool.xp} + ${xp}` }
		})
		.run();

	return { before: previo, after: previo + xp };
}

/** El panorama de inversión de una habilidad: costo, pozo y qué la traba. */
export function investment(db: Db, pilotId: number, code: string): Investment {
	const xp = skillXp(db, pilotId);
	return investmentFor(code, xp, levelsFrom(xp), pools(db, pilotId));
}

/** Los niveles del piloto, que es lo que miran los prerrequisitos. */
export function levelsFrom(xpBySkill: Readonly<Record<string, number>>): Record<string, number> {
	return Object.fromEntries(
		Object.entries(xpBySkill).map(([code, xp]) => [
			code,
			levelFromXp(xp, getSkill(code).difficulty)
		])
	);
}

/**
 * Compra el nivel siguiente de una habilidad con el pozo de su rama.
 *
 * Todo en una transacción y **revalidando adentro**: entre que la pantalla
 * dibujó el botón y el jugador lo apretó, el pozo pudo gastarse en otra pestaña.
 * Lo que decide es lo que hay en la base en el momento de escribir, no lo que
 * decía el formulario.
 */
export function invest(db: Db, pilotId: number, code: string): Investment {
	// Falla temprano y con un mensaje claro si el catálogo no la conoce.
	const skill = getSkill(code);

	return db.transaction((tx) => {
		const actual = investment(tx, pilotId, code);

		if (actual.blocker === 'maxed') {
			throw new PoolError(`${skill.name} ya está al máximo.`);
		}
		if (actual.blocker === 'requirements') {
			const faltan = actual.missing
				.map((req) => `${getSkill(req.skill).name} ${req.level}`)
				.join(', ');
			throw new PoolError(`Te falta ${faltan} para entrenar ${skill.name}.`);
		}
		if (actual.blocker === 'pool') {
			throw new PoolError(
				`No te alcanza: ${skill.name} pide ${actual.cost} y en el pozo hay ${actual.pool}.`
			);
		}

		tx.update(pilotPool)
			.set({ xp: sql`${pilotPool.xp} - ${actual.cost}` })
			.where(and(eq(pilotPool.pilotId, pilotId), eq(pilotPool.family, skill.family)))
			.run();

		tx.insert(pilotSkill)
			.values({ pilotId, skill: code, xp: actual.cost })
			.onConflictDoUpdate({
				target: [pilotSkill.pilotId, pilotSkill.skill],
				set: { xp: sql`${pilotSkill.xp} + ${actual.cost}` }
			})
			.run();

		return investment(tx, pilotId, code);
	});
}
