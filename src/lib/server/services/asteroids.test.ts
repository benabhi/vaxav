/**
 * Las rocas contra una base real: aparecer, repartirse y agotarse.
 *
 * Lo que se prueba acá es lo que la regla pura no puede: que **el campo se
 * reponga solo al mirarlo** y no dos veces por mirarlo dos veces, que el tope sea
 * del cinturón entero, y que el descuento de una roca sea **condicional a que
 * quede**, que es la única defensa contra que dos pilotos se lleven la misma
 * piedra.
 */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { asteroid, beltDeposit } from '../db/schema';
import { seededDb } from '../db/testing';
import { asteroidsAt, getAsteroid, seedAsteroids, takeFromAsteroid } from './asteroids';
import { getBody } from './universe';
import { ASTEROIDS_PER_BELT } from '$lib/game/asteroids';
import type { Db } from '../db/types';

const UN_DIA = 86_400_000;

/** El cinturón de siempre, que es donde empieza todo el mundo. */
function anillos(db: Db): number {
	return getBody(db, 'anillos_anfora_iii')!.id;
}

/** Corre la marca de reposición hacia atrás, como si hubiera pasado el tiempo. */
function envejecer(db: Db, bodyId: number, dias: number): void {
	db.update(beltDeposit)
		.set({ restoredAt: new Date(Date.now() - dias * UN_DIA) })
		.where(eq(beltDeposit.bodyId, bodyId))
		.run();
}

describe('el campo de un cinturón', () => {
	it('un cinturón virgen nace con rocas y no vacío', () => {
		const db = seededDb();

		// Un campo recién creado no tiene de dónde reponer —su marca es de recién— y
		// quedaría pelado hasta que pasara el tiempo.
		expect(asteroidsAt(db, anillos(db)).length).toBeGreaterThan(0);
	});

	it('nunca pasa del tope del cinturón', () => {
		const db = seededDb();
		envejecer(db, anillos(db), 400);

		// Lo que sobra no se acumula: un campo lleno no genera más aunque haya
		// pasado un año.
		expect(asteroidsAt(db, anillos(db)).length).toBeLessThanOrEqual(ASTEROIDS_PER_BELT);
	});

	it('reparte las rocas entre los minerales del plano', () => {
		const db = seededDb();

		const minerales = new Set(asteroidsAt(db, anillos(db)).map((roca) => roca.oreCode));

		// Un cinturón con dos minerales da rocas de los dos: es lo que hace que
		// mirar cuál es cuál tenga sentido.
		expect(minerales.size).toBeGreaterThan(1);
	});

	it('las rocas no salen todas iguales', () => {
		const db = seededDb();

		const tamaños = new Set(asteroidsAt(db, anillos(db)).map((roca) => roca.units));

		expect(tamaños.size).toBeGreaterThan(1);
	});

	it('cada roca recuerda con cuánto apareció', () => {
		const db = seededDb();

		// Es contra eso que se mide cuán picada está, y por eso se guarda al nacer.
		for (const roca of asteroidsAt(db, anillos(db))) {
			expect(roca.initialUnits).toBe(roca.units);
		}
	});

	it('en un cuerpo que no es cinturón no hay nada', () => {
		const db = seededDb();

		expect(asteroidsAt(db, getBody(db, 'puerto_anfora')!.id)).toEqual([]);
	});
});

describe('reponer al mirar', () => {
	it('un campo trabajado vuelve a llenarse con el tiempo', () => {
		const db = seededDb();
		const bodyId = anillos(db);
		for (const roca of asteroidsAt(db, bodyId)) {
			takeFromAsteroid(db, roca.id, roca.units);
		}
		expect(asteroidsAt(db, bodyId)).toEqual([]);

		envejecer(db, bodyId, 30);

		expect(asteroidsAt(db, bodyId).length).toBeGreaterThan(0);
	});

	it('mirar dos veces seguidas no genera dos veces', () => {
		const db = seededDb();
		const bodyId = anillos(db);
		takeFromAsteroid(db, asteroidsAt(db, bodyId)[0].id, 999_999);
		envejecer(db, bodyId, 30);

		const primera = asteroidsAt(db, bodyId).length;
		const segunda = asteroidsAt(db, bodyId).length;

		// La marca es lo que hace que el mundo avance una sola vez por rato, aunque
		// lo miren diez pestañas.
		expect(segunda).toBe(primera);
	});

	it('el tiempo parado no se acumula para el próximo hueco', () => {
		const db = seededDb();
		const bodyId = anillos(db);
		// Campo lleno y un año de espera: la marca se corre igual.
		envejecer(db, bodyId, 365);
		asteroidsAt(db, bodyId);

		takeFromAsteroid(db, asteroidsAt(db, bodyId)[0].id, 999_999);

		// Si el tiempo se hubiera acumulado, el hueco se llenaría de golpe.
		expect(asteroidsAt(db, bodyId).length).toBeLessThan(ASTEROIDS_PER_BELT);
	});
});

describe('sembrar el campo', () => {
	it('no le agrega rocas a un cinturón que ya las tiene', () => {
		const db = seededDb();
		const bodyId = anillos(db);
		const antes = asteroidsAt(db, bodyId).length;

		seedAsteroids(db, bodyId);

		// Sembrar no rellena: un despliegue no le devuelve el campo a nadie.
		expect(asteroidsAt(db, bodyId).length).toBe(antes);
	});

	it('en un cuerpo sin plano no siembra nada', () => {
		const db = seededDb();
		const puerto = getBody(db, 'puerto_anfora')!.id;

		seedAsteroids(db, puerto);

		expect(db.select().from(asteroid).where(eq(asteroid.bodyId, puerto)).all()).toEqual([]);
	});
});

describe('sacar de una roca', () => {
	it('descuenta lo que sale y deja el resto', () => {
		const db = seededDb();
		const roca = asteroidsAt(db, anillos(db))[0];

		const sale = takeFromAsteroid(db, roca.id, 10);

		expect(sale).toBe(10);
		expect(getAsteroid(db, roca.id)!.units).toBe(roca.units - 10);
	});

	it('la roca vacía se borra: una roca vacía no es una roca', () => {
		const db = seededDb();
		const roca = asteroidsAt(db, anillos(db))[0];

		takeFromAsteroid(db, roca.id, roca.units);

		expect(getAsteroid(db, roca.id)).toBeNull();
	});

	it('el segundo se lleva lo que sobró y no una copia', () => {
		const db = seededDb();
		const roca = asteroidsAt(db, anillos(db))[0];

		const primero = takeFromAsteroid(db, roca.id, roca.units - 3);
		const segundo = takeFromAsteroid(db, roca.id, 1_000);

		expect(primero + segundo).toBe(roca.units);
	});

	it('de una roca que ya no está no sale nada', () => {
		const db = seededDb();
		const roca = asteroidsAt(db, anillos(db))[0];
		takeFromAsteroid(db, roca.id, roca.units);

		expect(takeFromAsteroid(db, roca.id, 10)).toBe(0);
	});

	it('pedir cero o menos no toca la roca', () => {
		const db = seededDb();
		const roca = asteroidsAt(db, anillos(db))[0];

		expect(takeFromAsteroid(db, roca.id, 0)).toBe(0);
		expect(takeFromAsteroid(db, roca.id, -50)).toBe(0);
		expect(getAsteroid(db, roca.id)!.units).toBe(roca.units);
	});
});
