/**
 * Las rocas de un cinturón: aparecer, mirarse y agotarse.
 *
 * El depósito del cinturón dejó de ser un tanque de mineral y pasó a ser **el
 * plano**: dice qué minerales puede dar ese cinturón, cuánto aguanta y a qué
 * ritmo se repone. Las rocas son los ejemplares que ese plano genera, y son ellas
 * las que se escanean y se minan.
 *
 * **Se generan de forma perezosa**, como todo lo demás en este juego: no hay
 * ningún proceso sembrando piedras. Al mirar un cinturón se repone lo que el
 * tiempo transcurrido permite, usando `restoredAt` como marca para que mirar dos
 * veces seguidas no genere dos veces.
 */

import { and, eq, sql } from 'drizzle-orm';
import { asteroid, asteroidSurvey, beltDeposit, pilotAction, type Asteroid } from '../db/schema';
import type { Db } from '../db/types';
import { ASTEROIDS_PER_BELT, rolledUnits, spawnsIn } from '$lib/game/asteroids';

/** No se puede tocar esa roca. El mensaje se le muestra al jugador. */
export class AsteroidError extends Error {}

/**
 * Las rocas que hay ahora en un cinturón, reponiendo lo que corresponda.
 *
 * Reponer al consultar es lo mismo que hace el depósito con su mineral y que la
 * acción con su temporizador: **lo que hace que el mundo avance es que alguien lo
 * mire**. Sin esto haría falta un reloj del lado del servidor para algo que se
 * puede calcular.
 */
export function asteroidsAt(db: Db, bodyId: number): readonly Asteroid[] {
	refill(db, bodyId);
	return db.select().from(asteroid).where(eq(asteroid.bodyId, bodyId)).all();
}

/** Una roca concreta, o `null` si ya no está. */
export function getAsteroid(db: Db, id: number): Asteroid | null {
	return db.select().from(asteroid).where(eq(asteroid.id, id)).get() ?? null;
}

/**
 * Repone las rocas que el cinturón pudo generar desde la última vez.
 *
 * El ritmo sale del plano y se cuenta **por depósito**: un cinturón con dos
 * minerales repone los dos, cada uno al suyo. El tope de rocas es del cinturón
 * entero, así que un campo lleno no genera más aunque haya pasado un año — lo que
 * sobra no se acumula, igual que un cinturón lleno no acumula mineral de más.
 */
function refill(db: Db, bodyId: number): void {
	const planos = db.select().from(beltDeposit).where(eq(beltDeposit.bodyId, bodyId)).all();
	if (planos.length === 0) return;

	const ahora = new Date();

	db.transaction((tx) => {
		const cuantas =
			tx
				.select({ total: sql<number>`count(*)` })
				.from(asteroid)
				.where(eq(asteroid.bodyId, bodyId))
				.get()?.total ?? 0;

		let lugar = ASTEROIDS_PER_BELT - cuantas;
		if (lugar <= 0) {
			// Campo lleno: se corre la marca igual, o el tiempo parado se acumularía
			// y el próximo hueco se llenaría de golpe.
			tx.update(beltDeposit).set({ restoredAt: ahora }).where(eq(beltDeposit.bodyId, bodyId)).run();
			return;
		}

		for (const plano of planos) {
			if (lugar <= 0) break;

			const segundos = Math.max(0, (ahora.getTime() - plano.restoredAt.getTime()) / 1000);
			const nuevas = Math.min(lugar, spawnsIn(plano.regenPerHour, plano.capacity, segundos));
			if (nuevas <= 0) continue;

			for (let i = 0; i < nuevas; i++) {
				// El sorteo se hace acá y se le pasa a la regla pura, que así se puede
				// probar con un número fijo.
				const units = rolledUnits(plano.capacity, Math.floor(Math.random() * 100));
				tx.insert(asteroid)
					.values({ bodyId, oreCode: plano.oreCode, units, initialUnits: units })
					.run();
			}
			lugar -= nuevas;

			tx.update(beltDeposit)
				.set({ restoredAt: ahora })
				.where(and(eq(beltDeposit.bodyId, bodyId), eq(beltDeposit.oreCode, plano.oreCode)))
				.run();
		}
	});
}

/**
 * Siembra un cinturón que nunca tuvo rocas.
 *
 * Un cinturón recién creado no tiene de dónde reponer —su marca es de hace un
 * instante— y quedaría vacío hasta que pasara el tiempo. Esto le da su primera
 * tanda, que es lo que un cinturón virgen debería tener.
 */
export function seedAsteroids(db: Db, bodyId: number): void {
	const planos = db.select().from(beltDeposit).where(eq(beltDeposit.bodyId, bodyId)).all();
	if (planos.length === 0) return;

	const cuantas =
		db
			.select({ total: sql<number>`count(*)` })
			.from(asteroid)
			.where(eq(asteroid.bodyId, bodyId))
			.get()?.total ?? 0;
	if (cuantas > 0) return;

	// Se reparten las rocas entre los minerales del plano, dándole más al que más
	// aguanta: es lo que hace que un cinturón de hierro se sienta de hierro.
	const total = planos.reduce((suma, plano) => suma + plano.capacity, 0);
	for (const plano of planos) {
		const cuota = total > 0 ? Math.round((ASTEROIDS_PER_BELT * plano.capacity) / total) : 0;
		for (let i = 0; i < cuota; i++) {
			const units = rolledUnits(plano.capacity, Math.floor(Math.random() * 100));
			db.insert(asteroid)
				.values({ bodyId, oreCode: plano.oreCode, units, initialUnits: units })
				.run();
		}
	}
}

/**
 * Saca unidades de una roca y devuelve lo que de verdad salió.
 *
 * **Nunca saca más de lo que hay**, y ésa es la defensa contra que dos pilotos se
 * lleven la misma piedra: el descuento es condicional a que quede, así que el
 * segundo se lleva lo que sobró y no una copia de lo mismo. Una roca que llega a
 * cero se borra: una roca vacía no es una roca.
 */
export function takeFromAsteroid(db: Db, asteroidId: number, units: number): number {
	if (units <= 0) return 0;

	return db.transaction((tx) => {
		const roca = tx.select().from(asteroid).where(eq(asteroid.id, asteroidId)).get();
		if (!roca) return 0;

		const sale = Math.min(units, roca.units);
		if (sale <= 0) return 0;

		const quedan = roca.units - sale;
		if (quedan <= 0) {
			// Las lecturas de esa roca se van con ella: nadie tiene que quedar
			// recordando una piedra que ya no existe.
			tx.delete(asteroidSurvey).where(eq(asteroidSurvey.asteroidId, asteroidId)).run();
			// Y las órdenes que la apuntaban quedan sin objetivo. Se suelta a mano y
			// no con un `on delete` del esquema porque SQLite no acepta agregar esa
			// cláusula a una columna que se suma después; el resolvedor ya sabe qué
			// hacer con una orden que apunta a la nada.
			tx.update(pilotAction)
				.set({ asteroidId: null })
				.where(eq(pilotAction.asteroidId, asteroidId))
				.run();
			tx.delete(asteroid).where(eq(asteroid.id, asteroidId)).run();
		} else {
			tx.update(asteroid).set({ units: quedan }).where(eq(asteroid.id, asteroidId)).run();
		}

		return sale;
	});
}
