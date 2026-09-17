/** Entrar y salir de una corporación, con las tres condiciones que lo gobiernan. */

import { describe, expect, it } from 'vitest';
import { crearPiloto, seededDb } from '../db/testing';
import { CorporationError, joinCorporation, leaveCorporation } from './corporations';
import { award, standingOf } from './reputation';

/** Del Dominio, que es la facción con la que nace el piloto de prueba. */
const CASA = 'casa_verlan';
/** De la Concordia: la de la facción de enfrente. */
const AJENA = 'extractora_anillo';
/** Sin bandera: opera estaciones pero no recibe pilotos. */
const FRANCA = 'libre_amarre';

describe('alistarse', () => {
	it('deja al piloto respondiendo a esa corporación', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		expect(piloto.corporationId).toBeNull();

		const alistado = joinCorporation(db, piloto, CASA);

		expect(alistado.corporationId).not.toBeNull();
	});

	it('no acepta una de otra facción', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		// La misma regla del alta: no es una elección interesante, es una
		// contradicción.
		expect(() => joinCorporation(db, piloto, AJENA)).toThrow(CorporationError);
	});

	it('tampoco una sin bandera: operan estaciones, no reciben pilotos', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		expect(() => joinCorporation(db, piloto, FRANCA)).toThrow(CorporationError);
	});

	it('no acepta una que no existe', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		expect(() => joinCorporation(db, piloto, 'los_lunares')).toThrow(CorporationError);
	});

	it('pide renunciar antes de cambiarse', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const alistado = joinCorporation(db, piloto, CASA);

		// Sin esto se podría aparecer en otra sin haber salido de la anterior.
		expect(() => joinCorporation(db, alistado, 'casa_oriol')).toThrow(CorporationError);
	});
});

describe('renunciar', () => {
	it('lo devuelve a independiente, que es un estado legítimo', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const alistado = joinCorporation(db, piloto, CASA);

		expect(leaveCorporation(db, alistado).corporationId).toBeNull();
	});

	it('no se puede renunciar a nada', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		expect(() => leaveCorporation(db, piloto)).toThrow(CorporationError);
	});
});

/*
 * El número es del par piloto × corporación y no de la membresía. Es lo que va a
 * permitir que una de jugadores pida «Confiable para entrar» sin inventar nada:
 * la reputación ya está ahí antes de que nadie entre.
 */
describe('la reputación y la membresía son cosas distintas', () => {
	it('renunciar no borra lo que se había ganado', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const sujeto = { kind: 'corporation', code: CASA } as const;

		const alistado = joinCorporation(db, piloto, CASA);
		award(db, alistado.id, sujeto, 12_000, { kind: 'mission' });
		leaveCorporation(db, alistado);

		expect(standingOf(db, alistado.id, sujeto)).toBe(12_000);
	});

	it('se puede tener reputación con una en la que nunca se estuvo', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const sujeto = { kind: 'corporation', code: AJENA } as const;

		award(db, piloto.id, sujeto, 5_000, { kind: 'mission' });

		expect(standingOf(db, piloto.id, sujeto)).toBe(5_000);
		expect(piloto.corporationId).toBeNull();
	});
});
