/**
 * Comerciar contra una base real.
 *
 * Lo que se prueba acá y las reglas puras no pueden: que **la plata y la carga
 * se muevan juntas o no se muevan**, que los dos libros queden cuadrados después
 * de cada operación, y que un pedido que falla no deje nada a medio hacer.
 *
 * Y una promesa de diseño: **dónde se vende importa**. Si la minera del cinturón
 * pagara lo mismo que el puerto del Dominio, elegir estación sería una cuestión
 * de qué queda más cerca y el mapa daría igual.
 */

import { describe, expect, it } from 'vitest';
import { pilotSkill } from '../db/schema';
import { crearPiloto, moverPiloto, seededDb } from '../db/testing';
import { auditStacks, moveItem, quantityOf, shipContainer, stationContainer } from './containers';
import { MarketError, buyFromStation, deskFor, quote, sellToStation } from './market';
import { activeShip } from './ships';
import { auditBalance, balance, credit } from './wallet';
import { FUEL_ITEM } from '$lib/game/items';
import { SKILLS } from '$lib/game/skills';
import { xpForLevel } from '$lib/game/progression';
import type { Db } from '../db/types';
import type { Pilot } from '../db/schema';

/** Dónde está cada mostrador del sistema, y de qué rubro es quien lo opera. */
const PUERTO = 'puerto_anfora'; // Casa Verlan, comercial
const ANILLO = 'muelle_de_los_anillos'; // Extractora Anillo, minera
const ESCARCHA = 'planta_escarcha'; // Hidros Escarcha: refinería, sin mercado

/** Un minero atracado en el puerto, con mineral a bordo. */
async function conMineral(db: Db, donde = PUERTO, unidades = 100) {
	const piloto = moverPiloto(db, await crearPiloto(db), donde);
	const bodega = shipContainer(db, activeShip(db, piloto.id)!.id);
	moveItem(db, bodega.id, 'ferrous_silicate', unidades, 'mined');
	return { piloto, bodega };
}

/** Le pone a una habilidad la experiencia justa para ese nivel. */
function entrenar(db: Db, row: Pilot, code: keyof typeof SKILLS, level: number): void {
	const xp = xpForLevel(level, SKILLS[code].difficulty);
	db.insert(pilotSkill)
		.values({ pilotId: row.id, skill: code, xp })
		.onConflictDoUpdate({ target: [pilotSkill.pilotId, pilotSkill.skill], set: { xp } })
		.run();
}

describe('dónde hay mostrador', () => {
	it('una estación con mercado compra y vende', async () => {
		const db = seededDb();
		const { piloto } = await conMineral(db);

		const desk = deskFor(db, piloto)!;

		expect(desk.stationName).toBe('Puerto Ánfora');
		expect(desk.services.trades).toBe(true);
	});

	it('una refinería sin mostrador no comercia', async () => {
		const db = seededDb();
		const { piloto } = await conMineral(db, ESCARCHA);

		// Comerciar pide el módulo Mercado, sin excepciones: sin mostrador no hay
		// con quién tratar.
		expect(deskFor(db, piloto)!.services.trades).toBe(false);
	});

	it('en un cinturón no hay con quién comerciar', async () => {
		const db = seededDb();
		const { piloto } = await conMineral(db, 'anillos_anfora_iii');

		expect(deskFor(db, piloto)).toBeNull();
		expect(() => sellToStation(db, piloto, 'ferrous_silicate', 10)).toThrow(MarketError);
	});
});

describe('vender mineral', () => {
	it('cobra y vacía la bodega en una sola operación', async () => {
		const db = seededDb();
		const { piloto, bodega } = await conMineral(db, PUERTO, 100);
		const antes = balance(db, piloto.id);

		const recibo = sellToStation(db, piloto, 'ferrous_silicate', 100);

		expect(recibo.quantity).toBe(100);
		// 12 de referencia, 17 % de horquilla en el puerto: 1.200 × 0,83.
		expect(recibo.total).toBe(996);
		expect(balance(db, piloto.id)).toBe(antes + recibo.total);
		expect(quantityOf(db, bodega.id, 'ferrous_silicate')).toBe(0);
	});

	it('deja los dos libros cuadrados', async () => {
		const db = seededDb();
		const { piloto, bodega } = await conMineral(db, PUERTO, 60);

		sellToStation(db, piloto, 'ferrous_silicate', 25);
		sellToStation(db, piloto, 'ferrous_silicate', 35);

		expect(auditBalance(db, piloto.id)).toBeNull();
		expect(auditStacks(db, bodega.id)).toEqual([]);
	});

	it('paga por debajo del precio de referencia: la estación se queda con lo suyo', async () => {
		const db = seededDb();
		const { piloto } = await conMineral(db);

		// El silicato vale 12 de referencia. Nadie paga eso.
		expect(quote(deskFor(db, piloto)!, 'ferrous_silicate').bid).toBeLessThan(12);
	});

	it('la minera del cinturón paga mejor que el puerto del Dominio', async () => {
		const db = seededDb();
		const enElPuerto = await conMineral(db, PUERTO, 100);
		const db2 = seededDb();
		const enElAnillo = await conMineral(db2, ANILLO, 100);

		const puerto = sellToStation(db, enElPuerto.piloto, 'ferrous_silicate', 100);
		const anillo = sellToStation(db2, enElAnillo.piloto, 'ferrous_silicate', 100);

		// Es toda la razón para pensar dónde descargar.
		expect(anillo.total).toBeGreaterThan(puerto.total);
	});

	it('Regateo mejora lo que se cobra', async () => {
		const db = seededDb();
		const { piloto } = await conMineral(db, PUERTO, 200);

		const sinRegateo = sellToStation(db, piloto, 'ferrous_silicate', 100).unitPrice;
		entrenar(db, piloto, 'haggling', 4);
		const conRegateo = sellToStation(db, piloto, 'ferrous_silicate', 100).unitPrice;

		expect(conRegateo).toBeGreaterThan(sinRegateo);
	});

	it('no se puede vender lo que no se tiene', async () => {
		const db = seededDb();
		const { piloto } = await conMineral(db, PUERTO, 10);
		const antes = balance(db, piloto.id);

		expect(() => sellToStation(db, piloto, 'ferrous_silicate', 11)).toThrow(MarketError);
		// Y no cobró nada por el intento.
		expect(balance(db, piloto.id)).toBe(antes);
	});

	it('también vende lo que está guardado en la estación', async () => {
		const db = seededDb();
		const { piloto } = await conMineral(db, PUERTO, 0);
		const hangar = stationContainer(db, piloto.id, deskFor(db, piloto)!.stationId);
		moveItem(db, hangar.id, 'carbon_chondrite', 40, 'granted');

		const recibo = sellToStation(db, piloto, 'carbon_chondrite', 40, 'station');

		expect(recibo.quantity).toBe(40);
		expect(quantityOf(db, hangar.id, 'carbon_chondrite')).toBe(0);
	});
});

describe('comprar módulos', () => {
	it('cobra y deja lo comprado en la bodega de la estación', async () => {
		const db = seededDb();
		const { piloto } = await conMineral(db, PUERTO, 0);
		credit(db, piloto.id, 100_000, { kind: 'adjustment', memo: 'prueba' });
		const antes = balance(db, piloto.id);

		const recibo = buyFromStation(db, piloto, 'mining_laser_i1', 1);

		const hangar = stationContainer(db, piloto.id, deskFor(db, piloto)!.stationId);
		expect(quantityOf(db, hangar.id, 'mining_laser_i1')).toBe(1);
		expect(balance(db, piloto.id)).toBe(antes - recibo.total);
		expect(auditBalance(db, piloto.id)).toBeNull();
	});

	it('cobra por encima del precio de referencia', async () => {
		const db = seededDb();
		const { piloto } = await conMineral(db, PUERTO, 0);
		const cotizacion = quote(deskFor(db, piloto)!, 'mining_laser_i1');

		expect(cotizacion.ask).toBeGreaterThan(cotizacion.bid);
	});

	it('sin plata no se compra, y la bodega queda como estaba', async () => {
		const db = seededDb();
		const { piloto } = await conMineral(db, PUERTO, 0);
		const hangar = stationContainer(db, piloto.id, deskFor(db, piloto)!.stationId);

		expect(() => buyFromStation(db, piloto, 'plant_ii3', 1)).toThrow();

		// Lo que importa del rechazo: no quedó medio comprado.
		expect(quantityOf(db, hangar.id, 'plant_ii3')).toBe(0);
		expect(auditBalance(db, piloto.id)).toBeNull();
		expect(auditStacks(db, hangar.id)).toEqual([]);
	});

	it('la estación no revende mineral', async () => {
		const db = seededDb();
		const { piloto } = await conMineral(db, PUERTO, 0);
		credit(db, piloto.id, 100_000, { kind: 'adjustment', memo: 'prueba' });

		// Si lo hiciera, el circuito minero sería un botón que se aprieta sin
		// salir del hangar.
		expect(() => buyFromStation(db, piloto, 'ferrous_silicate', 1)).toThrow(MarketError);
	});

	it('una refinería sin mostrador no vende módulos', async () => {
		const db = seededDb();
		const { piloto } = await conMineral(db, ESCARCHA, 0);
		credit(db, piloto.id, 100_000, { kind: 'adjustment', memo: 'prueba' });

		expect(() => buyFromStation(db, piloto, 'mining_laser_i1', 1)).toThrow(MarketError);
	});

	it('comprar y vender de inmediato siempre deja perdiendo', async () => {
		const db = seededDb();
		const { piloto } = await conMineral(db, PUERTO, 0);
		credit(db, piloto.id, 100_000, { kind: 'adjustment', memo: 'prueba' });
		const antes = balance(db, piloto.id);

		buyFromStation(db, piloto, 'cargo_rack_i1', 1);
		sellToStation(db, piloto, 'cargo_rack_i1', 1, 'station');

		expect(balance(db, piloto.id)).toBeLessThan(antes);
	});
});

/*
 * El combustible quedó **fuera del mostrador** cuando cruzar una puerta pasó a
 * ser gratis: nada lo consume, así que no se vende ni se recompra. Lo decide una
 * sola línea pura —`isTraded`—, y estos tests son los que avisan si el servicio
 * deja de consultarla: vender combustible sería cobrarle a alguien por algo que
 * no puede usar, y comprarlo de vuelta sería ponerle precio a lo que no se
 * consigue, que es una punta de arbitraje esperando.
 */
describe('el combustible, que hoy no se comercia', () => {
	it('la estación no lo vende', async () => {
		const db = seededDb();
		const { piloto } = await conMineral(db, PUERTO, 0);
		credit(db, piloto.id, 100_000, { kind: 'adjustment', memo: 'prueba' });
		const antes = balance(db, piloto.id);

		// Se pide con plata suficiente y en un mostrador que funciona: el rechazo
		// tiene que ser por la regla y no por otra cosa.
		expect(() => buyFromStation(db, piloto, FUEL_ITEM, 10)).toThrow(/no vende/);

		// Y el rechazo no deja nada a medio hacer: ni plata movida ni carga puesta.
		expect(balance(db, piloto.id)).toBe(antes);
		expect(auditBalance(db, piloto.id)).toBeNull();
	});

	it('y tampoco lo recompra, por mucho que se lo lleven a la puerta', async () => {
		const db = seededDb();
		const { piloto, bodega } = await conMineral(db, PUERTO, 0);
		moveItem(db, bodega.id, FUEL_ITEM, 50, 'bought');
		const antes = balance(db, piloto.id);

		expect(() => sellToStation(db, piloto, FUEL_ITEM, 50)).toThrow(/no comercia/);

		expect(quantityOf(db, bodega.id, FUEL_ITEM)).toBe(50);
		expect(balance(db, piloto.id)).toBe(antes);
		expect(auditStacks(db, bodega.id)).toEqual([]);
	});
});
