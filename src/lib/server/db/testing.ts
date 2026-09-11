/**
 * Andamiaje para los tests.
 *
 * La base va en memoria y con el esquema aplicado desde las mismas migraciones
 * que usa el servidor: si una migración no corre, los tests se enteran antes que
 * el despliegue. Cada test pide la suya, así que ninguno hereda lo que dejó
 * otro.
 */

import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { createPilot } from '../services/pilots';
import { getBody, seedUniverse } from '../services/universe';
import * as schema from './schema';
import { container, fittedModule, itemEntry, itemStack, pilot, ship, type Pilot } from './schema';
import type { Db } from './types';

/** Una base vacía, con el esquema al día. */
export function freshDb(): Db {
	const sqlite = new Database(':memory:');
	// La misma regla que en producción: una referencia a una fila que no existe
	// tiene que fallar acá y no descubrirse jugando.
	sqlite.pragma('foreign_keys = ON');
	const db = drizzle(sqlite, { schema });
	migrate(db, { migrationsFolder: 'drizzle' });
	return db;
}

/**
 * Una base con el universo ya sembrado.
 *
 * Es lo que necesita casi todo test de servicios: sin universo no hay dónde
 * poner un piloto, así que sembrar es parte de tener una base utilizable. De
 * paso, cada test ejercita la siembra.
 */
export function seededDb(): Db {
	const db = freshDb();
	seedUniverse(db);
	return db;
}

/** Un piloto de prueba, con todo lo que el alta le da. */
export function crearPiloto(db: Db, callsign = 'Halcon'): Promise<Pilot> {
	return createPilot(
		db,
		callsign,
		`${callsign.toLowerCase()}@ejemplo.com`,
		'contrasena-larga',
		'miner',
		'dominion'
	);
}

/** Pone al piloto en un cuerpo, sin viajar. */
export function moverPiloto(db: Db, row: Pilot, code: string): Pilot {
	const destino = getBody(db, code)!;
	return db
		.update(pilot)
		.set({ locationId: destino.id })
		.where(eq(pilot.id, row.id))
		.returning()
		.get();
}

/**
 * Deja al piloto sin nave, respetando las claves foráneas.
 *
 * Vive acá y no en un test porque lo necesitan varios, y porque el orden en que
 * hay que borrar es conocimiento del esquema y no de quien prueba: con las
 * foráneas activas, una nave no se borra dejando huérfanos ni sus módulos
 * montados ni su bodega.
 *
 * Que desguazar se lleve la carga no es un atajo: **la bodega vive en la nave**,
 * así que perder la nave es perder lo que llevaba.
 */
export function desguazar(db: Db, row: Pilot): void {
	const nave = db.select().from(ship).where(eq(ship.pilotId, row.id)).get();
	if (!nave) return;

	db.delete(fittedModule).where(eq(fittedModule.shipId, nave.id)).run();

	const bodega = db.select().from(container).where(eq(container.shipId, nave.id)).get();
	if (bodega) {
		db.delete(itemEntry).where(eq(itemEntry.containerId, bodega.id)).run();
		db.delete(itemStack).where(eq(itemStack.containerId, bodega.id)).run();
		db.delete(container).where(eq(container.id, bodega.id)).run();
	}

	db.delete(ship).where(eq(ship.id, nave.id)).run();
}
