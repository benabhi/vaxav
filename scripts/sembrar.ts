/**
 * Carga el universo en la base.
 *
 *     npm run db:seed
 *
 * Es idempotente: se puede correr las veces que haga falta y no duplica nada.
 * Pero **sólo crea lo que falta; lo que ya está no lo toca en nada**, ni un
 * nombre, ni una órbita, ni una columna vacía. Puede haberlo editado alguien
 * desde el constructor, y la siembra no tiene forma de saber si el plano es más
 * nuevo o más viejo que la base.
 *
 * De ahí se sigue lo que cuesta caro olvidarse: **corregir un dato del plano y
 * volver a sembrar no lo corrige en la base**, y una columna recién agregada por
 * una migración se queda vacía en todos los cuerpos que ya existían. Para eso va
 * un guión de una sola vez, como `scripts/atributos-de-cuerpos.ts`. Lo que sí
 * nace bien del plano es una base vacía.
 *
 * El plano está en `src/lib/game/universe.ts`. El esquema es cosa de las
 * migraciones; esto sólo pone contenido.
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/lib/server/db/schema';
import { SEED_PILOTS, ensureSeedPilots, findByCallsign } from '../src/lib/server/services/pilots';
import { ensureAdminRole, grantRole } from '../src/lib/server/services/roles';
import { ensureEveryPilotHasAShip, ensureEveryShipHasFuel } from '../src/lib/server/services/ships';
import { seedUniverse } from '../src/lib/server/services/universe';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Falta DATABASE_URL');

const sqlite = new Database(url);
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

const conteo: Record<string, number> = { ...seedUniverse(db) };

// Y los pilotos con los que se mira todo esto. Van acá y no en una migración
// porque son contenido, no esquema, y porque tienen que sobrevivir a borrar la
// base.
conteo['pilotos de prueba'] = await ensureSeedPilots(db);

// Los pilotos creados antes de que existiera el hangar se quedaron sin nave.
// Arreglarlos desde una migración sería escribir datos desde donde sólo va el
// esquema.
conteo['naves repartidas'] = ensureEveryPilotHasAShip(db);

// Y las que quedaron con el tanque en cero porque nacieron antes de que el
// tanque existiera. Sólo las vacías: una a medio tanque saltó, y rellenarla
// sería regalar combustible en cada siembra.
conteo['tanques llenados'] = ensureEveryShipHasFuel(db);

// El rol de administrador y su dueño. Se rehace en cada corrida porque el
// catálogo de permisos crece con el código: un administrador al que le faltara
// la llave de la herramienta recién construida no podría abrirla.
const administrador = ensureAdminRole(db);
conteo['rol de administrador'] = 1;

// Y se lo llevan los pilotos de prueba, que son con los que se mira el juego.
// **Siempre tiene que quedar alguno con el rol**: sin esto, el cuartel general
// quedaría cerrado desde el primer arranque y la única forma de entrar sería
// escribir la fila a mano.
//
// Se vuelve a otorgar en cada corrida por si a alguno se lo sacaron probando, y
// otorgarlo dos veces no hace nada: la fila es única por piloto y rol.
conteo['administradores'] = 0;
for (const spec of SEED_PILOTS) {
	const fila = findByCallsign(db, spec.callsign);
	if (!fila) continue;
	grantRole(db, fila.id, administrador.id, null);
	conteo['administradores']++;
}

console.log('Universo sembrado:');
for (const [nivel, cantidad] of Object.entries(conteo)) {
	console.log(`  ${String(cantidad).padStart(4)}  ${nivel}`);
}
