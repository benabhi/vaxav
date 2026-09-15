/**
 * La historia de precios.
 *
 * Lo que importa probar acá es el promedio: va **ponderado por cantidad**, y si
 * se promediaran los renglones a secas, una venta de tres unidades movería la
 * curva tanto como una de mil. Un gráfico que miente es peor que no tener
 * gráfico, porque encima se le cree.
 */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { marketTrade } from '../db/schema';
import { crearPiloto, moverPiloto, seededDb } from '../db/testing';
import { moveItem, shipContainer } from './containers';
import { deskFor, sellToStation } from './market';
import { activeShip } from './ships';
import { priceHistory, recentTrades, recordTrade } from './trades';
import type { Db } from '../db/types';

const DIA = 86_400_000;

/** Un mostrador donde anotar operaciones. */
async function mostrador(db: Db) {
	const piloto = moverPiloto(db, await crearPiloto(db), 'puerto_anfora');
	return { piloto, stationId: deskFor(db, piloto)!.stationId };
}

/** Anota una operación corriéndola hacia atrás en el tiempo. */
function anotar(db: Db, stationId: number, price: number, quantity: number, diasAtras = 0): void {
	recordTrade(db, { itemCode: 'ferrous_silicate', stationId, price, quantity });
	if (diasAtras > 0) {
		const ultima = db.select().from(marketTrade).orderBy(marketTrade.id).all().at(-1)!;
		db.update(marketTrade)
			.set({ createdAt: new Date(Date.now() - diasAtras * DIA) })
			.where(eq(marketTrade.id, ultima.id))
			.run();
	}
}

describe('anotar lo que se comercia', () => {
	it('una venta a la estación deja su punto', async () => {
		const db = seededDb();
		const { piloto } = await mostrador(db);
		const bodega = shipContainer(db, activeShip(db, piloto.id)!.id);
		moveItem(db, bodega.id, 'ferrous_silicate', 100, 'mined');

		sellToStation(db, piloto, 'ferrous_silicate', 100);

		// Sin esto, un mercado recién abierto no tendría un solo punto que dibujar
		// justo cuando más falta hace saber cuánto vale lo que uno trae.
		const historia = recentTrades(db, 'ferrous_silicate');
		expect(historia).toHaveLength(1);
		expect(historia[0].quantity).toBe(100);
		expect(historia[0].fromStation).toBe(true);
	});
});

describe('la curva', () => {
	it('promedia ponderando por cantidad y no por operación', async () => {
		const db = seededDb();
		const { stationId } = await mostrador(db);

		anotar(db, stationId, 10, 1000);
		anotar(db, stationId, 40, 10);

		// Promediando renglones daría 25, que no fue el precio de nada.
		const [dia] = priceHistory(db, 'ferrous_silicate');
		expect(dia.average).toBe(10);
		expect(dia.low).toBe(10);
		expect(dia.high).toBe(40);
		expect(dia.volume).toBe(1010);
		expect(dia.trades).toBe(2);
	});

	it('agrupa por día y devuelve del más viejo al más nuevo', async () => {
		const db = seededDb();
		const { stationId } = await mostrador(db);

		anotar(db, stationId, 30, 10, 3);
		anotar(db, stationId, 20, 10, 1);
		anotar(db, stationId, 25, 10);

		const dias = priceHistory(db, 'ferrous_silicate');
		expect(dias).toHaveLength(3);
		expect(dias.map((dia) => dia.average)).toEqual([30, 20, 25]);
	});

	it('no inventa días sin operaciones', async () => {
		const db = seededDb();
		const { stationId } = await mostrador(db);

		anotar(db, stationId, 30, 10, 10);
		anotar(db, stationId, 30, 10);

		// Rellenar con ceros haría que la curva se desplome cada vez que nadie
		// comerció, que es lo contrario de lo que pasó.
		expect(priceHistory(db, 'ferrous_silicate')).toHaveLength(2);
	});

	it('no mira más atrás de lo que se le pide', async () => {
		const db = seededDb();
		const { stationId } = await mostrador(db);

		anotar(db, stationId, 30, 10, 40);
		anotar(db, stationId, 25, 10);

		expect(priceHistory(db, 'ferrous_silicate', 30)).toHaveLength(1);
	});

	it('sin historia devuelve vacío, y eso no es un error', () => {
		const db = seededDb();

		expect(priceHistory(db, 'iridium_vein')).toEqual([]);
	});
});
