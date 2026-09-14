/**
 * La vista del mercado.
 *
 * Lo que se prueba acá son las tres formas que puede tomar la pantalla —mostrador
 * abierto, estación sin mostrador, y ninguna estación— y que el árbol de
 * categorías cuente lo que hay debajo de cada rama. Un contador que miente es de
 * las cosas que nadie revisa hasta que ya está mal desde hace meses.
 */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { station, stationService } from '../db/schema';
import { crearPiloto, moverPiloto, seededDb } from '../db/testing';
import { moveItem, shipContainer } from '../services/containers';
import { activeShip } from '../services/ships';
import { getBody } from '../services/universe';
import { buildMarketView } from './market';
import type { Db } from '../db/types';

/** Un piloto parado donde se diga, con lo que se diga en la bodega. */
async function parado(db: Db, donde: string, carga: readonly [string, number][] = []) {
	const piloto = moverPiloto(db, await crearPiloto(db), donde);
	const bodega = shipContainer(db, activeShip(db, piloto.id)!.id);
	for (const [code, units] of carga) moveItem(db, bodega.id, code, units, 'mined');
	return piloto;
}

describe('el mostrador cerrado', () => {
	it('en un cinturón dice que hay que atracar', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'anillos_anfora_iii');

		const vista = buildMarketView(db, piloto);

		expect(vista.open).toBe(false);
		expect(vista.closedReason).toContain('atracado');
		expect(vista.items).toEqual([]);
	});

	it('en una estación sin mercado ni refinería lo dice con su nombre', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'planta_escarcha');
		// Hoy no hay ninguna estación así en Ánfora, y por eso se la fabrica: es el
		// camino que va a tomar la primera que alguien siembre sin mostrador, y sin
		// esto se descubriría jugando.
		const cerrada = getBody(db, 'planta_escarcha')!;
		const suya = db.select().from(station).where(eq(station.bodyId, cerrada.id)).get()!;
		db.delete(stationService).where(eq(stationService.stationId, suya.id)).run();

		const vista = buildMarketView(db, piloto);

		expect(vista.open).toBe(false);
		expect(vista.closedReason).toContain('Planta Escarcha');
		expect(vista.stationName).toBe('Planta Escarcha');
	});
});

describe('el mostrador abierto', () => {
	it('trae el catálogo entero y quién lo opera', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'puerto_anfora');

		const vista = buildMarketView(db, piloto);

		expect(vista.open).toBe(true);
		expect(vista.stationName).toBe('Puerto Ánfora');
		expect(vista.corporationName).toBe('Casa Verlan');
		// Los cuatro minerales más los cuarenta y siete módulos.
		expect(vista.items).toHaveLength(51);
	});

	it('la refinería sin mercado no lista módulos que no vende', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'planta_escarcha');

		const vista = buildMarketView(db, piloto);

		// Los cuatro minerales, y de módulos sólo lo que el piloto trae puesto.
		expect(vista.items.filter((item) => item.group === 'ore')).toHaveLength(4);
		expect(vista.groups.map((rama) => rama.code)).not.toContain('module');
	});

	it('cada rama cuenta lo que tiene debajo', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'puerto_anfora');

		const vista = buildMarketView(db, piloto);
		const rama = (code: string) => vista.groups.find((grupo) => grupo.code === code)!;

		expect(rama('ore').count).toBe(4);
		expect(rama('module').count).toBe(47);
		// Las cuatro ranuras tienen que sumar exactamente los módulos.
		const ranuras = ['hardpoint', 'utility', 'core', 'optional'].map((code) => rama(code).count);
		expect(ranuras.reduce((total, cuantos) => total + cuantos, 0)).toBe(47);
	});

	it('la rama de la bodega cuenta lo que el piloto trae', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'puerto_anfora', [['ferrous_silicate', 40]]);

		const vista = buildMarketView(db, piloto);

		// El mineral recién cargado y el láser de repuesto del kit minero.
		expect(vista.groups.find((rama) => rama.code === 'held')!.count).toBe(2);
		const silicato = vista.items.find((item) => item.itemCode === 'ferrous_silicate')!;
		expect(silicato.inShip).toBe(40);
		expect(silicato.held).toBe(40);
	});

	it('dice de cada ítem si la estación lo vende y si lo compra', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'puerto_anfora');

		const vista = buildMarketView(db, piloto);
		const silicato = vista.items.find((item) => item.itemCode === 'ferrous_silicate')!;
		const laser = vista.items.find((item) => item.itemCode === 'mining_laser_e1')!;

		// El mineral se compra pero no se revende; el módulo va en las dos.
		expect(silicato.buys).toBe(true);
		expect(silicato.sells).toBe(false);
		expect(laser.buys).toBe(true);
		expect(laser.sells).toBe(true);
	});

	it('manda el precio de referencia para que la pantalla rehaga el lote', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'puerto_anfora');

		const silicato = buildMarketView(db, piloto).items.find(
			(item) => item.itemCode === 'ferrous_silicate'
		)!;

		// Sin esto, la pantalla sólo podría multiplicar el precio de vitrina, que
		// da un número distinto del que se cobra.
		expect(silicato.basePrice).toBe(12);
	});

	it('la horquilla viaja desarmada, para poder explicarla', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'puerto_anfora');

		const vista = buildMarketView(db, piloto);

		// Casa Verlan es comercial: 20 de base menos 3 por el rubro.
		expect(vista.oreSpread.base).toBe(20);
		expect(vista.oreSpread.corporationEdge).toBe(3);
		expect(vista.oreSpread.percent).toBe(17);
	});
});
