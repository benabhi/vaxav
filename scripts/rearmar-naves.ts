/**
 * Rearma las naves ya guardadas contra las bandejas nuevas.
 *
 * **Se corre una sola vez**, al pasar de los internos esenciales a las cuatro
 * bandejas. Las naves de la base tienen una configuración de la forma vieja —once
 * ranuras en la Pioner, con códigos como `plant_e2` que ya no existen— y contra el
 * casco nuevo eso no es una nave equipada: es una fila que no se puede leer.
 *
 * Lo que hace es dejar cada nave **como sale del astillero** —vacía, porque ahora
 * el casco trae sus propios propulsores— y volver a montarle el equipo de su
 * oficio. Lo que no entre queda en la bodega, que es lo que ya hace el alta.
 *
 * Una base nueva no lo necesita: nace bien.
 *
 * ```bash
 * npx tsx --env-file=.env scripts/rearmar-naves.ts
 * ```
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema';
import { fittedModule, itemStack, pilot, ship } from '../src/lib/server/db/schema';
import { placeInFreeSlot } from '../src/lib/game/fitting';
import { getModule } from '../src/lib/game/modules';
import { isItem } from '../src/lib/game/items';
import { startingKit } from '../src/lib/game/professions';
import { getHull } from '../src/lib/game/hulls';
import type { Db } from '../src/lib/server/db/types';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Falta DATABASE_URL.');

const db = drizzle(new Database(url), { schema }) as unknown as Db;

for (const nave of db.select().from(ship).all()) {
	const suPiloto = db.select().from(pilot).where(eq(pilot.id, nave.pilotId)).get();
	if (!suPiloto) continue;

	const hull = getHull(nave.hull);
	// De cero: la configuración vieja no se puede traducir ranura por ranura,
	// porque las ranuras no son las mismas ni son la misma cantidad.
	db.delete(fittedModule).where(eq(fittedModule.shipId, nave.id)).run();

	let codes: string[] = hull.slots.map(() => '');
	const afuera: string[] = [];

	for (const entrada of startingKit(suPiloto.profession)) {
		if (!entrada.fitted) continue;
		for (let puestos = 0; puestos < entrada.quantity; puestos++) {
			const conEso = placeInFreeSlot(hull, codes, getModule(entrada.item));
			if (conEso === null) afuera.push(entrada.item);
			else codes = conEso;
		}
	}

	codes.forEach((code, index) => {
		if (!code) return;
		db.insert(fittedModule).values({ shipId: nave.id, slotIndex: index, moduleCode: code }).run();
	});

	const puestos = codes.filter((code) => code !== '').length;
	console.log(
		`  ${suPiloto.callsign.padEnd(10)} ${hull.name.padEnd(9)} ` +
			`${puestos} de ${hull.slots.length} ranuras` +
			(afuera.length ? `  (no entraron: ${afuera.join(', ')})` : '')
	);
}

// Y lo que quedó en las bodegas, que guarda los mismos códigos.
//
// Los módulos corrieron de escalón —`_e1` pasó a ser `_i1`— y los internos
// esenciales dejaron de existir. Lo que ya no está en el catálogo se tira: no es
// que el piloto lo perdió, es que esa pieza nunca más va a existir.
for (const fila of db.select().from(itemStack).all()) {
	const corrido = fila.itemCode.replace(/_e(\d)$/, '_i$1');
	if (corrido !== fila.itemCode && isItem(corrido)) {
		db.update(itemStack).set({ itemCode: corrido }).where(eq(itemStack.id, fila.id)).run();
		console.log(`  bodega ${fila.containerId}: ${fila.itemCode} -> ${corrido}`);
		continue;
	}
	if (!isItem(fila.itemCode)) {
		db.delete(itemStack).where(eq(itemStack.id, fila.id)).run();
		console.log(`  bodega ${fila.containerId}: ${fila.itemCode} ya no existe, se tira`);
	}
}

console.log('\nListo.');
