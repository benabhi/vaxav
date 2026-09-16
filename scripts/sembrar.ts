/**
 * Carga el universo en la base.
 *
 *     npm run db:seed
 *
 * Es idempotente: se puede correr las veces que haga falta. Crea lo que falta,
 * actualiza lo que cambió en el plano y no duplica nada, así que corregir un
 * dato es editar `src/lib/server/game/universe.ts` y volver a correrlo.
 *
 * El esquema es cosa de las migraciones; esto sólo pone contenido.
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/lib/server/db/schema';
import { SEED_PILOTS, ensureSeedPilots, findByCallsign } from '../src/lib/server/services/pilots';
import { ensureAdminRole, grantRole } from '../src/lib/server/services/roles';
import { ensureEveryPilotHasAShip } from '../src/lib/server/services/ships';
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
