/**
 * Qué puede hacer un piloto, resuelto contra la base.
 *
 * Las reglas se prueban puras en `../game/status.test.ts`; acá se prueba que los
 * datos que se les pasan salgan bien de la base, que es donde se rompen las
 * cosas: un cuerpo que no es estación, una estación sin taller, un viaje en
 * curso.
 */

import { describe, expect, it } from 'vitest';
import { crearPiloto, moverPiloto, seededDb } from '../db/testing';
import { startTravel } from './actions';
import { ShipError, activeShip, refit, shipFit } from './ships';
import { situation } from './status';
import { getBody } from './universe';

describe('la situación del piloto', () => {
	it('arranca atracado', async () => {
		// Empieza en la estación de su facción, que es lo que promete el alta.
		const db = seededDb();
		const ahora = situation(db, await crearPiloto(db));
		expect(ahora.status).toBe('docked');
		expect(ahora.place).toBe('Puerto Ánfora');
	});

	it('atracado deja dar órdenes y equipar', async () => {
		const db = seededDb();
		const ahora = situation(db, await crearPiloto(db));
		expect(ahora.canOrder).toBe(true);
		expect(ahora.canRefit).toBe(true);
		expect(ahora.orderBlocked).toBe('');
		expect(ahora.refitBlocked).toBe('');
	});

	it('en un planeta no deja equipar', async () => {
		// Estar quieto no alcanza: hace falta un lugar con con qué.
		const db = seededDb();
		const piloto = moverPiloto(db, await crearPiloto(db), 'anfora_i');

		const ahora = situation(db, piloto);
		expect(ahora.status).toBe('in_space');
		expect(ahora.canOrder).toBe(true);
		expect(ahora.canRefit).toBe(false);
		expect(ahora.refitBlocked).toContain('Ánfora I');
	});

	it('en una estación sin taller tampoco', async () => {
		// La Planta Escarcha es el caso testigo: se atraca, pero no se reconfigura.
		const db = seededDb();
		const piloto = moverPiloto(db, await crearPiloto(db), 'planta_escarcha');

		const ahora = situation(db, piloto);
		expect(ahora.status).toBe('docked');
		expect(ahora.canRefit).toBe(false);
		expect(ahora.refitBlocked).toContain('Planta Escarcha');
	});

	it('en viaje no deja hacer nada', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		startTravel(db, piloto, getBody(db, 'anfora_i')!);

		const ahora = situation(db, piloto);
		expect(ahora.status).toBe('in_transit');
		expect(ahora.inTransit).toBe(true);
		expect(ahora.canOrder).toBe(false);
		expect(ahora.canRefit).toBe(false);
	});

	it('hace que el viaje gane sobre estar en una estación', async () => {
		// Se salió de Puerto Ánfora, así que ya no se está en Puerto Ánfora.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		startTravel(db, piloto, getBody(db, 'anfora_i')!);
		expect(situation(db, piloto).status).toBe('in_transit');
	});
});

describe('la puerta con llave del equipamiento', () => {
	it('deja equipar atracado y con taller', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const codigos = shipFit(db, nave).map((module) => module.code);
		codigos[0] = 'mining_laser_1e';

		refit(db, piloto, codigos);
		expect(shipFit(db, nave)[0].code).toBe('mining_laser_1e');
	});

	it('se niega en viaje y dice por qué', async () => {
		// El servicio no confía en que la interfaz haya apagado el banco.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const codigos = shipFit(db, nave).map((module) => module.code);
		startTravel(db, piloto, getBody(db, 'anfora_i')!);

		expect(() => refit(db, piloto, codigos)).toThrow(/viaje/);
	});

	it('se niega en una estación sin taller', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const codigos = shipFit(db, nave).map((module) => module.code);
		const movido = moverPiloto(db, piloto, 'planta_escarcha');

		expect(() => refit(db, movido, codigos)).toThrow(/Equipamiento/);
	});

	it('se niega lejos de toda estación', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const codigos = shipFit(db, nave).map((module) => module.code);
		const movido = moverPiloto(db, piloto, 'anfora_i');

		expect(() => refit(db, movido, codigos)).toThrow(/atracado/);
	});

	it('no toca la base cuando rechaza', async () => {
		// Negarse tiene que ser negarse del todo, no a medias.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const antes = shipFit(db, nave).map((module) => module.code);

		const codigos = [...antes];
		codigos[0] = 'mining_laser_1e';
		const movido = moverPiloto(db, piloto, 'anfora_i');

		expect(() => refit(db, movido, codigos)).toThrow(ShipError);
		expect(shipFit(db, nave).map((module) => module.code)).toEqual(antes);
	});
});
