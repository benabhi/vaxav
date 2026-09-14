/**
 * Minar contra una base real: el cinturón, la orden y el botín.
 *
 * Dos cosas se prueban acá que las reglas puras no pueden: que **sembrar no
 * rellene los cinturones** —o cada despliegue borraría el trabajo de todos— y que
 * una orden se cobre **una sola vez** aunque dos pestañas la resuelvan juntas.
 */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { beltDeposit, pilotAction, pilotLog } from '../db/schema';
import { crearPiloto, moverPiloto, seededDb } from '../db/testing';
import { ActionError, resolveIfDue, startMining } from './actions';
import { quantityOf, shipContainer } from './containers';
import { beltDeposits, depositFor, miningPlan, takeFromBelt } from './mining';
import { activeShip } from './ships';
import { getBody, seedUniverse } from './universe';
import type { Db } from '../db/types';

/** Un minero parado en los Anillos, que es donde empieza todo el mundo. */
async function enLosAnillos(db: Db) {
	const piloto = await crearPiloto(db);
	const enElCinturon = moverPiloto(db, piloto, 'anillos_anfora_iii');
	return { piloto: enElCinturon, bodega: shipContainer(db, activeShip(db, piloto.id)!.id) };
}

/** Hace vencer la orden en curso corriéndole el arranque hacia atrás. */
function vencer(db: Db, pilotId: number): void {
	const orden = db.select().from(pilotAction).where(eq(pilotAction.pilotId, pilotId)).get()!;
	db.update(pilotAction)
		.set({ startedAt: new Date(Date.now() - (orden.durationSeconds + 5) * 1000) })
		.where(eq(pilotAction.id, orden.id))
		.run();
}

describe('lo que hay en un cinturón', () => {
	it('los Anillos tienen lo común y el Exterior lo que el otro no tiene', () => {
		const db = seededDb();

		const anillos = beltDeposits(db, getBody(db, 'anillos_anfora_iii')!.id);
		const exterior = beltDeposits(db, getBody(db, 'cinturon_exterior')!.id);

		// Es toda la razón para irse tan lejos.
		expect(anillos.map((d) => d.oreCode)).toEqual(['carbon_chondrite', 'ferrous_silicate']);
		expect(exterior.map((d) => d.oreCode)).toEqual(['iridium_vein', 'pyroxene']);
	});

	it('un planeta no tiene nada que sacar, y eso no es un error', () => {
		const db = seededDb();

		expect(beltDeposits(db, getBody(db, 'anfora_i')!.id)).toEqual([]);
	});

	it('se recupera solo con el paso del tiempo', () => {
		const db = seededDb();
		const anillos = getBody(db, 'anillos_anfora_iii')!;
		db.update(beltDeposit)
			.set({ remaining: 0, restoredAt: new Date(Date.now() - 3600 * 1000) })
			.where(eq(beltDeposit.bodyId, anillos.id))
			.run();

		const [condrita] = beltDeposits(db, anillos.id);

		// Una hora al ritmo declarado. Sin proceso de fondo: se aplica al mirarlo.
		expect(condrita.remaining).toBe(condrita.regenPerHour);
	});

	it('mirarlo diez veces no regala mineral', () => {
		const db = seededDb();
		const anillos = getBody(db, 'anillos_anfora_iii')!;
		db.update(beltDeposit)
			.set({ remaining: 0, restoredAt: new Date(Date.now() - 3600 * 1000) })
			.where(eq(beltDeposit.bodyId, anillos.id))
			.run();

		const una = beltDeposits(db, anillos.id)[0].remaining;
		for (let i = 0; i < 9; i++) beltDeposits(db, anillos.id);

		// `restoredAt` es lo que hace idempotente a la recuperación perezosa.
		expect(beltDeposits(db, anillos.id)[0].remaining).toBe(una);
	});
});

describe('sembrar de nuevo', () => {
	it('**no rellena los cinturones**', () => {
		const db = seededDb();
		const anillos = getBody(db, 'anillos_anfora_iii')!;
		db.update(beltDeposit)
			.set({ remaining: 7, restoredAt: new Date() })
			.where(eq(beltDeposit.bodyId, anillos.id))
			.run();

		seedUniverse(db);

		// El tope y el ritmo son contenido y pueden cambiar; lo que queda es estado
		// de la partida. Sin esta distinción, cada despliegue devolvería todos los
		// cinturones del juego a capacidad llena.
		expect(depositFor(db, anillos.id, 'ferrous_silicate')!.remaining).toBe(7);
	});

	it('pero sí actualiza el tope y el ritmo', () => {
		const db = seededDb();
		const anillos = getBody(db, 'anillos_anfora_iii')!;
		db.update(beltDeposit)
			.set({ capacity: 1, regenPerHour: 1 })
			.where(eq(beltDeposit.bodyId, anillos.id))
			.run();

		seedUniverse(db);

		expect(depositFor(db, anillos.id, 'ferrous_silicate')!.capacity).toBeGreaterThan(1);
	});
});

describe('dar la orden de minar', () => {
	it('promete lo que la nave, la bodega y el cinturón permiten', async () => {
		const db = seededDb();
		const { piloto } = await enLosAnillos(db);

		const plan = miningPlan(db, piloto, 'ferrous_silicate');

		expect(plan.blocked).toBe('');
		expect(plan.units).toBeGreaterThan(0);
		expect(plan.durationSeconds).toBeGreaterThan(0);
	});

	it('la orden tarda exactamente lo que el plan prometió', async () => {
		const db = seededDb();
		const { piloto } = await enLosAnillos(db);
		const plan = miningPlan(db, piloto, 'ferrous_silicate');

		const orden = startMining(db, piloto, 'ferrous_silicate');

		expect(orden.durationSeconds).toBe(plan.durationSeconds);
		expect(orden.targetCode).toBe('ferrous_silicate');
		// Minar no se mueve de lugar, y por eso el destino queda nulo.
		expect(orden.destinationBodyId).toBeNull();
	});

	it('se niega donde no hay nada que sacar', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		expect(() => startMining(db, piloto, 'ferrous_silicate')).toThrow(ActionError);
	});

	it('se niega con un mineral que ese cinturón no tiene', async () => {
		const db = seededDb();
		const { piloto } = await enLosAnillos(db);

		// La veta iridiada sale del Cinturón Exterior, no de los Anillos.
		expect(() => startMining(db, piloto, 'iridium_vein')).toThrow(/agotado/);
	});

	it('se niega con una orden ya en curso', async () => {
		const db = seededDb();
		const { piloto } = await enLosAnillos(db);
		startMining(db, piloto, 'ferrous_silicate');

		expect(() => startMining(db, piloto, 'carbon_chondrite')).toThrow(ActionError);
	});
});

describe('resolver la extracción', () => {
	it('mete el mineral en la bodega y lo saca del cinturón', async () => {
		const db = seededDb();
		const { piloto, bodega } = await enLosAnillos(db);
		const anillos = getBody(db, 'anillos_anfora_iii')!;
		const antes = depositFor(db, anillos.id, 'ferrous_silicate')!.remaining;

		startMining(db, piloto, 'ferrous_silicate');
		vencer(db, piloto.id);
		const informe = resolveIfDue(db, piloto);

		const traido = quantityOf(db, bodega.id, 'ferrous_silicate');
		expect(informe).not.toBeNull();
		expect(traido).toBeGreaterThan(0);
		// Lo que entró a la bodega salió del cinturón: la reserva es una sola y la
		// comparten todos.
		expect(depositFor(db, anillos.id, 'ferrous_silicate')!.remaining).toBeLessThanOrEqual(
			antes - traido
		);
	});

	it('no mueve al piloto', async () => {
		const db = seededDb();
		const { piloto } = await enLosAnillos(db);

		startMining(db, piloto, 'ferrous_silicate');
		vencer(db, piloto.id);
		resolveIfDue(db, piloto);

		// El bug que el despachador por clase existe para evitar.
		expect(db.select().from(pilotAction).all()).toEqual([]);
		expect(piloto.locationId).toBe(getBody(db, 'anillos_anfora_iii')!.id);
	});

	it('deja el botín escrito en el informe', async () => {
		const db = seededDb();
		const { piloto } = await enLosAnillos(db);

		startMining(db, piloto, 'ferrous_silicate');
		vencer(db, piloto.id);
		resolveIfDue(db, piloto);

		const fila = db.select().from(pilotLog).where(eq(pilotLog.pilotId, piloto.id)).get()!;
		const result = JSON.parse(fila.result);
		expect(result.mined.ore).toBe('ferrous_silicate');
		expect(result.mined.units).toBeGreaterThan(0);
	});

	it('paga la experiencia a Extracción y no a Pilotaje', async () => {
		const db = seededDb();
		const { piloto } = await enLosAnillos(db);

		startMining(db, piloto, 'ferrous_silicate');
		vencer(db, piloto.id);
		const informe = resolveIfDue(db, piloto)!;

		expect(informe.deposit.family).toBe('extraction');
	});

	it('sólo se cobra una vez', async () => {
		const db = seededDb();
		const { piloto, bodega } = await enLosAnillos(db);

		startMining(db, piloto, 'ferrous_silicate');
		vencer(db, piloto.id);
		resolveIfDue(db, piloto);
		const traido = quantityOf(db, bodega.id, 'ferrous_silicate');

		// Dos pestañas abiertas no pueden cobrar el botín dos veces.
		expect(resolveIfDue(db, piloto)).toBeNull();
		expect(quantityOf(db, bodega.id, 'ferrous_silicate')).toBe(traido);
	});

	it('si otro se llevó lo que quedaba, trae lo que haya', async () => {
		const db = seededDb();
		const { piloto, bodega } = await enLosAnillos(db);
		const anillos = getBody(db, 'anillos_anfora_iii')!;

		startMining(db, piloto, 'ferrous_silicate');
		// Entre que la orden se dio y venció, el cinturón se vació.
		db.update(beltDeposit)
			.set({ remaining: 3, restoredAt: new Date() })
			.where(eq(beltDeposit.bodyId, anillos.id))
			.run();
		vencer(db, piloto.id);
		resolveIfDue(db, piloto);

		// Prometer al encargar lo que el mundo no puede cumplir al entregar es peor
		// que traer menos.
		expect(quantityOf(db, bodega.id, 'ferrous_silicate')).toBe(3);
	});
});

describe('sacar del cinturón', () => {
	it('nunca deja la reserva en negativo', () => {
		const db = seededDb();
		const anillos = getBody(db, 'anillos_anfora_iii')!;
		db.update(beltDeposit)
			.set({ remaining: 5, restoredAt: new Date() })
			.where(eq(beltDeposit.bodyId, anillos.id))
			.run();

		expect(takeFromBelt(db, anillos.id, 'ferrous_silicate', 999)).toBe(5);
		expect(depositFor(db, anillos.id, 'ferrous_silicate')!.remaining).toBe(0);
	});
});
