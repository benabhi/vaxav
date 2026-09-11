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
import { ensureEveryPilotHasAShip } from '../src/lib/server/services/ships';
import { seedUniverse } from '../src/lib/server/services/universe';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Falta DATABASE_URL');

const sqlite = new Database(url);
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

const conteo: Record<string, number> = { ...seedUniverse(db) };

// Los pilotos creados antes de que existiera el hangar se quedaron sin nave.
// Arreglarlos desde una migración sería escribir datos desde donde sólo va el
// esquema.
conteo['naves repartidas'] = ensureEveryPilotHasAShip(db);

console.log('Universo sembrado:');
for (const [nivel, cantidad] of Object.entries(conteo)) {
	console.log(`  ${String(cantidad).padStart(4)}  ${nivel}`);
}
