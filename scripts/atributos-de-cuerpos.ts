/**
 * Le pone a cada cuerpo ya sembrado los atributos que antes eran una frase.
 *
 * **Se corre una sola vez**, al pasar de la descripción escrita a mano a la
 * derivada. Los cuerpos que ya están en la base quedaron con `body_class`,
 * `atmosphere` y `star_class` en blanco, porque la migración sólo agrega columnas
 * y `seedUniverse` —a propósito— **no toca lo que ya existe**: puede haberlo
 * editado alguien desde el constructor y la siembra no tiene forma de saber si el
 * plano es más nuevo o más viejo que la base.
 *
 * Así que los valores se copian del plano, que es de donde salieron: son los
 * mismos datos que hasta ayer estaban adentro de la descripción —«gigante
 * gaseoso», «sin atmósfera», «enana amarilla de clase G»— sólo que ahora en su
 * columna. Una base nueva no lo necesita: nace bien de `npm run db:seed`.
 *
 * ```bash
 * npx tsx --env-file=.env scripts/atributos-de-cuerpos.ts
 * ```
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema';
import { body } from '../src/lib/server/db/schema';
import { GALAXY, type BodyBlueprint } from '../src/lib/game/universe';
import type { Db } from '../src/lib/server/db/types';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Falta DATABASE_URL.');

const db = drizzle(new Database(url), { schema }) as unknown as Db;

/** Recorre el plano entero y devuelve cada cuerpo con sus atributos. */
function* todosLosCuerpos(nodo: BodyBlueprint): Generator<BodyBlueprint> {
	yield nodo;
	for (const hijo of nodo.children) yield* todosLosCuerpos(hijo);
}

let tocados = 0;
let ausentes = 0;

for (const region of GALAXY.regions) {
	for (const constelacion of region.constellations) {
		for (const sistema of constelacion.systems) {
			for (const plano of todosLosCuerpos(sistema.root)) {
				// Nada que copiar: la mayoría de los cuerpos no tienen ninguno de los
				// tres, y escribir vacío sobre vacío sería ruido en el registro.
				if (!plano.bodyClass && !plano.atmosphere && !plano.starClass) continue;

				const fila = db.select().from(body).where(eq(body.code, plano.code)).get();
				if (!fila) {
					ausentes += 1;
					continue;
				}

				db.update(body)
					.set({
						bodyClass: plano.bodyClass,
						atmosphere: plano.atmosphere,
						starClass: plano.starClass
					})
					.where(eq(body.id, fila.id))
					.run();
				tocados += 1;
				console.log(
					`  ${plano.name.padEnd(22)} ${[plano.starClass, plano.bodyClass, plano.atmosphere]
						.filter(Boolean)
						.join(' · ')}`
				);
			}
		}
	}
}

console.log(`\n${tocados} cuerpos actualizados.`);
if (ausentes > 0) console.log(`${ausentes} del plano no están en esta base.`);
