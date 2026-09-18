/**
 * Devuelve al pozo toda la experiencia invertida en habilidades.
 *
 * **Se corre una sola vez, cuando cambia la curva.** Un piloto que tenía una
 * habilidad al 4 con la curva vieja la tendría al 2 con la nueva: lo que compró se
 * le encarece retroactivamente, y eso no se le puede hacer a nadie. La reparación
 * honesta es devolverle lo gastado al pozo de su rama y dejar que vuelva a
 * repartirlo con los precios nuevos.
 *
 * Es una reparación de desarrollo y por eso vive en `scripts/` y no en una
 * migración: **el día que haya jugadores de verdad esto ya no se puede hacer así**,
 * porque devolver experiencia es reescribir la historia de alguien. A partir de
 * entonces, cambiar la curva pide una conversión que respete los niveles, o no
 * cambiarla.
 *
 * ```bash
 * npx tsx --env-file=.env scripts/devolver-experiencia.ts
 * ```
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq, sql } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema';
import { pilot, pilotPool, pilotSkill } from '../src/lib/server/db/schema';
import type { Db } from '../src/lib/server/db/types';
import { getSkill } from '../src/lib/game/skills';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Falta DATABASE_URL');

const sqlite = new Database(url);
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema }) as unknown as Db;

const pilotos = db.select().from(pilot).all();
console.log(`${pilotos.length} pilotos`);

for (const uno of pilotos) {
	const suyas = db.select().from(pilotSkill).where(eq(pilotSkill.pilotId, uno.id)).all();
	if (suyas.length === 0) {
		console.log(`  ${uno.callsign}: nada que devolver`);
		continue;
	}

	// Lo invertido se agrupa por la rama a la que pertenece cada habilidad: el
	// pozo es por familia, así que devolverlo a otra sería regalarle al piloto una
	// especialización que no eligió.
	const porRama = new Map<string, number>();
	for (const fila of suyas) {
		const rama = getSkill(fila.skill).family;
		porRama.set(rama, (porRama.get(rama) ?? 0) + fila.xp);
	}

	db.transaction((tx) => {
		for (const [family, xp] of porRama) {
			tx.insert(pilotPool)
				.values({ pilotId: uno.id, family, xp })
				.onConflictDoUpdate({
					target: [pilotPool.pilotId, pilotPool.family],
					set: { xp: sql`${pilotPool.xp} + ${xp}` }
				})
				.run();
		}
		tx.delete(pilotSkill).where(eq(pilotSkill.pilotId, uno.id)).run();
	});

	const total = [...porRama.values()].reduce((suma, xp) => suma + xp, 0);
	const detalle = [...porRama].map(([rama, xp]) => `${rama} ${xp}`).join(', ');
	console.log(`  ${uno.callsign}: ${total} devueltos (${detalle})`);
}

console.log('listo');
