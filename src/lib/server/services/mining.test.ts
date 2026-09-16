/**
 * Minar contra una base real: las rocas, la orden y el botín.
 *
 * Tres cosas se prueban acá que las reglas puras no pueden: que **sembrar no
 * rellene los cinturones** —o cada despliegue borraría el trabajo de todos—, que
 * una orden se cobre **una sola vez** aunque dos pestañas la resuelvan juntas, y
 * que **no se pueda picar a ciegas**: sin lectura vigente no hay extracción.
 */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { asteroid, beltDeposit, pilotAction, pilotLog } from '../db/schema';
import { crearPiloto, moverPiloto, seededDb } from '../db/testing';
import { ActionError, resolveIfDue, startMining } from './actions';
import { asteroidsAt, takeFromAsteroid } from './asteroids';
import { quantityOf, shipContainer } from './containers';
import { beltDeposits, depositFor, miningPlan } from './mining';
import { recordSurvey } from './prospecting';
import { activeShip } from './ships';
import { getBody, seedUniverse } from './universe';
import type { Db } from '../db/types';

/**
 * Un minero parado en los Anillos con una roca ya identificada.
 *
 * La lectura se escribe a mano y no encargando la acción de escanear: lo que este
 * archivo prueba es minar, y hacerle dar dos órdenes seguidas al piloto mezclaría
 * el fallo de una con el de la otra.
 */
async function enLosAnillos(db: Db) {
	const piloto = await crearPiloto(db);
	const enElCinturon = moverPiloto(db, piloto, 'anillos_anfora_iii');
	const rocas = asteroidsAt(db, enElCinturon.locationId);
	recordSurvey(db, enElCinturon.id, rocas[0].id, 2);

	return {
		piloto: enElCinturon,
		roca: rocas[0],
		rocas,
		bodega: shipContainer(db, activeShip(db, piloto.id)!.id)
	};
}

/** Hace vencer la orden en curso corriéndole el arranque hacia atrás. */
function vencer(db: Db, pilotId: number): void {
	const orden = db.select().from(pilotAction).where(eq(pilotAction.pilotId, pilotId)).get()!;
	db.update(pilotAction)
		.set({ startedAt: new Date(Date.now() - (orden.durationSeconds + 5) * 1000) })
		.where(eq(pilotAction.id, orden.id))
		.run();
}

/** Lo que queda en una roca, o cero si alguien ya la terminó. */
function unidadesDe(db: Db, id: number): number {
	return db.select().from(asteroid).where(eq(asteroid.id, id)).get()?.units ?? 0;
}

describe('lo que hay en un cinturón', () => {
	it('los Anillos tienen lo común y el Exterior lo que el otro no tiene', () => {
		const db = seededDb();

		const anillos = beltDeposits(db, getBody(db, 'anillos_anfora_iii')!.id);
		const exterior = beltDeposits(db, getBody(db, 'cinturon_exterior')!.id);

		expect(anillos.map((fila) => fila.oreCode)).toContain('ferrous_silicate');
		expect(exterior.map((fila) => fila.oreCode)).toContain('iridium_vein');
		expect(anillos.map((fila) => fila.oreCode)).not.toContain('iridium_vein');
	});

	it('un cinturón sembrado nace con rocas', () => {
		const db = seededDb();

		const rocas = asteroidsAt(db, getBody(db, 'anillos_anfora_iii')!.id);

		expect(rocas.length).toBeGreaterThan(0);
		// Cada una trae lo suyo: si todas fueran iguales, mirar cuál es cuál no
		// aportaría nada y el escáner sería un trámite.
		expect(rocas.every((roca) => roca.units > 0)).toBe(true);
	});
});

describe('sembrar de nuevo', () => {
	it('no rellena lo que los pilotos vaciaron', () => {
		const db = seededDb();
		const anillos = getBody(db, 'anillos_anfora_iii')!;
		db.update(beltDeposit).set({ remaining: 7 }).where(eq(beltDeposit.bodyId, anillos.id)).run();

		seedUniverse(db);

		expect(depositFor(db, anillos.id, 'ferrous_silicate')!.remaining).toBe(7);
	});

	it('tampoco vuelve a llenar el campo de rocas', () => {
		const db = seededDb();
		const anillos = getBody(db, 'anillos_anfora_iii')!;
		for (const roca of asteroidsAt(db, anillos.id).slice(1)) {
			takeFromAsteroid(db, roca.id, roca.units);
		}

		seedUniverse(db);

		// Un campo trabajado se repone con el tiempo, no con un despliegue.
		expect(asteroidsAt(db, anillos.id).length).toBe(1);
	});

	/*
	 * Antes sí los actualizaba, y dejó de hacerlo el día que el constructor pasó a
	 * mandar sobre el plano: un tope cambiado desde el panel es una decisión de
	 * quien lo cambió, y la siembra no tiene forma de saber si el plano es más
	 * nuevo o más viejo. Ver `seedUniverse`.
	 */
	it('y tampoco pisa el tope ni el ritmo de un depósito que ya existe', () => {
		const db = seededDb();
		const anillos = getBody(db, 'anillos_anfora_iii')!;
		db.update(beltDeposit)
			.set({ capacity: 1, regenPerHour: 1 })
			.where(eq(beltDeposit.bodyId, anillos.id))
			.run();

		seedUniverse(db);

		expect(depositFor(db, anillos.id, 'ferrous_silicate')!.capacity).toBe(1);
	});
});

describe('dar la orden de minar', () => {
	it('promete lo que la nave, la bodega y la roca permiten', async () => {
		const db = seededDb();
		const { piloto, roca } = await enLosAnillos(db);

		const plan = miningPlan(db, piloto, roca.id);

		expect(plan.blocked).toBe('');
		expect(plan.units).toBeGreaterThan(0);
		expect(plan.durationSeconds).toBeGreaterThan(0);
	});

	it('la orden tarda exactamente lo que el plan prometió', async () => {
		const db = seededDb();
		const { piloto, roca } = await enLosAnillos(db);
		const plan = miningPlan(db, piloto, roca.id);

		const orden = startMining(db, piloto, roca.id);

		expect(orden.durationSeconds).toBe(plan.durationSeconds);
		expect(orden.targetCode).toBe(roca.oreCode);
		expect(orden.asteroidId).toBe(roca.id);
		// Minar no se mueve de lugar, y por eso el destino queda nulo.
		expect(orden.destinationBodyId).toBeNull();
	});

	it('se niega sin haber escaneado la roca', async () => {
		const db = seededDb();
		const { piloto, rocas } = await enLosAnillos(db);

		// La primera está leída; cualquier otra es un bulto en el radar.
		expect(() => startMining(db, piloto, rocas[1].id)).toThrow(ActionError);
	});

	it('se niega con una roca que ya no está', async () => {
		const db = seededDb();
		const { piloto, roca } = await enLosAnillos(db);
		takeFromAsteroid(db, roca.id, roca.units);

		expect(() => startMining(db, piloto, roca.id)).toThrow(ActionError);
	});

	it('se niega con una roca de otro lado', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const lejos = asteroidsAt(db, getBody(db, 'anillos_anfora_iii')!.id)[0];
		recordSurvey(db, piloto.id, lejos.id, 2);

		// Escanear de lejos no acerca la roca: minar se hace donde estás parado.
		expect(() => startMining(db, piloto, lejos.id)).toThrow(ActionError);
	});

	it('se niega con una orden ya en curso', async () => {
		const db = seededDb();
		const { piloto, roca } = await enLosAnillos(db);
		startMining(db, piloto, roca.id);

		expect(() => startMining(db, piloto, roca.id)).toThrow(ActionError);
	});
});

describe('resolver la extracción', () => {
	it('mete el mineral en la bodega y lo saca de la roca', async () => {
		const db = seededDb();
		const { piloto, roca, bodega } = await enLosAnillos(db);
		const antes = roca.units;

		startMining(db, piloto, roca.id);
		vencer(db, piloto.id);
		const informe = resolveIfDue(db, piloto);

		const traido = quantityOf(db, bodega.id, roca.oreCode);
		expect(informe).not.toBeNull();
		expect(traido).toBeGreaterThan(0);
		// Lo que entró a la bodega salió de la piedra: la roca es una sola y la
		// comparten todos.
		expect(unidadesDe(db, roca.id)).toBe(antes - traido);
	});

	it('la roca que se acaba desaparece', async () => {
		const db = seededDb();
		const { piloto, roca } = await enLosAnillos(db);
		// Queda menos de lo que una orden se lleva.
		db.update(asteroid).set({ units: 2 }).where(eq(asteroid.id, roca.id)).run();

		startMining(db, piloto, roca.id);
		vencer(db, piloto.id);
		resolveIfDue(db, piloto);

		// Una roca vacía no es una roca: se va del campo y hay que buscar otra.
		expect(db.select().from(asteroid).where(eq(asteroid.id, roca.id)).get()).toBeUndefined();
	});

	it('no mueve al piloto', async () => {
		const db = seededDb();
		const { piloto, roca } = await enLosAnillos(db);

		startMining(db, piloto, roca.id);
		vencer(db, piloto.id);
		resolveIfDue(db, piloto);

		// El bug que el despachador por clase existe para evitar.
		expect(db.select().from(pilotAction).all()).toEqual([]);
		expect(piloto.locationId).toBe(getBody(db, 'anillos_anfora_iii')!.id);
	});

	it('deja el botín escrito en el informe', async () => {
		const db = seededDb();
		const { piloto, roca } = await enLosAnillos(db);

		startMining(db, piloto, roca.id);
		vencer(db, piloto.id);
		resolveIfDue(db, piloto);

		const fila = db.select().from(pilotLog).where(eq(pilotLog.pilotId, piloto.id)).get()!;
		const result = JSON.parse(fila.result);
		expect(result.mined.ore).toBe(roca.oreCode);
		expect(result.mined.units).toBeGreaterThan(0);
	});

	it('paga la experiencia a Extracción y no a Pilotaje', async () => {
		const db = seededDb();
		const { piloto, roca } = await enLosAnillos(db);

		startMining(db, piloto, roca.id);
		vencer(db, piloto.id);
		const informe = resolveIfDue(db, piloto)!;

		expect(informe.deposit.family).toBe('extraction');
	});

	it('sólo se cobra una vez', async () => {
		const db = seededDb();
		const { piloto, roca, bodega } = await enLosAnillos(db);

		startMining(db, piloto, roca.id);
		vencer(db, piloto.id);
		resolveIfDue(db, piloto);
		const traido = quantityOf(db, bodega.id, roca.oreCode);

		// Dos pestañas abiertas no pueden cobrar el botín dos veces.
		expect(resolveIfDue(db, piloto)).toBeNull();
		expect(quantityOf(db, bodega.id, roca.oreCode)).toBe(traido);
	});

	it('si otro se llevó lo que quedaba, trae lo que haya', async () => {
		const db = seededDb();
		const { piloto, roca, bodega } = await enLosAnillos(db);

		startMining(db, piloto, roca.id);
		// Entre que la orden se dio y venció, otro picó la misma piedra.
		db.update(asteroid).set({ units: 3 }).where(eq(asteroid.id, roca.id)).run();
		vencer(db, piloto.id);
		resolveIfDue(db, piloto);

		// Prometer al encargar lo que el mundo no puede cumplir al entregar es peor
		// que traer menos.
		expect(quantityOf(db, bodega.id, roca.oreCode)).toBe(3);
	});

	it('si la roca desapareció, la orden se cierra sin botín', async () => {
		const db = seededDb();
		const { piloto, roca, bodega } = await enLosAnillos(db);

		startMining(db, piloto, roca.id);
		// Alguien la terminó mientras el láser estaba encendido.
		takeFromAsteroid(db, roca.id, roca.units);
		vencer(db, piloto.id);

		expect(() => resolveIfDue(db, piloto)).not.toThrow();
		expect(quantityOf(db, bodega.id, roca.oreCode)).toBe(0);
		// La orden no queda colgada: el piloto tiene que poder dar otra.
		expect(db.select().from(pilotAction).all()).toEqual([]);
	});
});

describe('sacar de una roca', () => {
	it('nunca deja unidades en negativo', async () => {
		const db = seededDb();
		const { roca } = await enLosAnillos(db);

		const sale = takeFromAsteroid(db, roca.id, roca.units + 1_000);

		expect(sale).toBe(roca.units);
		expect(unidadesDe(db, roca.id)).toBe(0);
	});

	it('el segundo se lleva lo que sobró y no una copia', async () => {
		const db = seededDb();
		const { roca } = await enLosAnillos(db);

		const primero = takeFromAsteroid(db, roca.id, roca.units - 5);
		const segundo = takeFromAsteroid(db, roca.id, roca.units);

		expect(primero + segundo).toBe(roca.units);
	});
});
