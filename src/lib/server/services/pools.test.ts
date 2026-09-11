/**
 * Los pozos contra la base: depositar, gastar, y no poder gastar de más.
 *
 * Lo que importa probar acá es lo que la regla pura no puede: que el pozo se
 * descuente y la habilidad suba **en la misma transacción**, y que la validación
 * la haga el servicio con lo que hay en la base y no con lo que trajo el
 * formulario. Entre que la pantalla dibujó el botón y el jugador lo apretó, el
 * pozo pudo gastarse en otra pestaña.
 */

import { describe, expect, it } from 'vitest';
import { crearPiloto, seededDb } from '../db/testing';
import { PoolError, deposit, investment, invest, pools } from './pools';
import { skillXp } from './pilots';
import { SKILL_FAMILIES } from '$lib/game/skills';

describe('el pozo de una rama', () => {
	it('arranca en cero en las seis, no ausente', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const pozos = pools(db, piloto.id);

		// Quien lee esto no tiene por qué acordarse de que "sin fila" es "cero".
		expect(Object.keys(pozos).sort()).toEqual([...SKILL_FAMILIES].sort());
		expect(Object.values(pozos).every((xp) => xp === 0)).toBe(true);
	});

	it('acumula depósito sobre depósito y cuenta el antes y el después', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const primero = deposit(db, piloto.id, 'piloting', 40);
		const segundo = deposit(db, piloto.id, 'piloting', 60);

		expect(primero).toEqual({ before: 0, after: 40 });
		expect(segundo).toEqual({ before: 40, after: 100 });
		expect(pools(db, piloto.id).piloting).toBe(100);
	});

	it('cada rama es su propia bolsa', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		deposit(db, piloto.id, 'piloting', 500);

		expect(pools(db, piloto.id).extraction).toBe(0);
	});
});

describe('comprar un nivel', () => {
	it('descuenta del pozo exactamente lo que cuesta y sube la habilidad', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		// El alta ya le dejó algo de Navegación, así que el costo y el punto de
		// partida se preguntan en vez de suponerse: un test que hardcodea 100 se
		// rompe el día que cambie lo que da la profesión.
		const antes = investment(db, piloto.id, 'navigation');
		const xpAntes = skillXp(db, piloto.id).navigation ?? 0;
		// Se deposita de más a propósito: así el vuelto también se verifica.
		deposit(db, piloto.id, 'piloting', antes.cost + 50);

		const despues = invest(db, piloto.id, 'navigation');

		expect(despues.level).toBe(antes.level + 1);
		// Lo que salió del pozo es exactamente lo que entró a la habilidad: la
		// experiencia se mueve de lugar, no se crea ni se pierde en el camino.
		expect(pools(db, piloto.id).piloting).toBe(50);
		expect(skillXp(db, piloto.id).navigation).toBe(xpAntes + antes.cost);
	});

	it('no deja comprar si el pozo no llega', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const falta = investment(db, piloto.id, 'navigation');
		deposit(db, piloto.id, 'piloting', falta.cost - 1);

		expect(() => invest(db, piloto.id, 'navigation')).toThrow(PoolError);
		// Y no se quedó con nada a medio hacer: el pozo sigue entero.
		expect(pools(db, piloto.id).piloting).toBe(falta.cost - 1);
	});

	it('no deja comprar lo que tiene requisitos sin cumplir', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		deposit(db, piloto.id, 'piloting', 999999);

		// Astrogación pide Navegación 3. Sobra experiencia y sigue sin poder.
		expect(() => invest(db, piloto.id, 'astrogation')).toThrow(/Navegación 3/);
		expect(pools(db, piloto.id).piloting).toBe(999999);
	});

	it('una habilidad que no existe falla antes de tocar nada', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		deposit(db, piloto.id, 'piloting', 999999);

		expect(() => invest(db, piloto.id, 'no_existe')).toThrow();
		expect(pools(db, piloto.id).piloting).toBe(999999);
	});

	it('gastar de una rama no toca las otras', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		deposit(db, piloto.id, 'piloting', 9999);
		deposit(db, piloto.id, 'extraction', 1234);

		invest(db, piloto.id, 'navigation');

		expect(pools(db, piloto.id).extraction).toBe(1234);
	});
});
