/**
 * La base que usan las pruebas de punta a punta.
 *
 * Va aparte de la de desarrollo a propósito: el humo entra, crea un piloto y
 * recorre el juego, y nada de eso tiene por qué aparecer en la partida de quien
 * esté programando. Se borra y se rehace en cada corrida, así que dos
 * ejecuciones seguidas ven exactamente lo mismo.
 *
 * Corre como paso aparte, antes de Playwright, y **no** como su `globalSetup`:
 * para entonces el servidor ya abrió el archivo y en Windows no se puede borrar
 * algo que otro proceso tiene tomado.
 */

import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../src/lib/server/db/schema';
import { createPilot } from '../src/lib/server/services/pilots';
import { seedUniverse } from '../src/lib/server/services/universe';

/** Dónde vive. Fuera de git, como la de desarrollo. */
export const E2E_DATABASE = 'data/vaxav-e2e.db';

/** El piloto con el que el humo recorre el juego. */
export const PILOTO = {
	callsign: 'Humo',
	email: 'humo@ejemplo.com',
	password: 'contrasena-larga'
};

export default async function preparar(): Promise<void> {
	// Los tres archivos: la base y los dos del diario de escritura.
	for (const sufijo of ['', '-wal', '-shm']) {
		rmSync(`${E2E_DATABASE}${sufijo}`, { force: true });
	}

	const sqlite = new Database(E2E_DATABASE);
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON');

	const db = drizzle(sqlite, { schema });
	// Las mismas migraciones que usa el servidor: si una no corre, el humo se
	// entera antes que el despliegue.
	migrate(db, { migrationsFolder: 'drizzle' });
	seedUniverse(db);
	await createPilot(db, PILOTO.callsign, PILOTO.email, PILOTO.password, 'miner', 'dominion');

	sqlite.close();
}

// Se corre solo: `npx tsx e2e/preparar.ts`, que es lo que hace `npm run test:e2e`.
if (process.argv[1] === fileURLToPath(import.meta.url)) await preparar();
