/**
 * El libro de órdenes contra una base real.
 *
 * Lo que se prueba acá es lo que ninguna regla pura puede: que **la garantía
 * exista de verdad**. Una orden publicada tiene que haber sacado la mercadería de
 * la bodega o la plata de la billetera; si no, es una promesa que se descubre
 * vacía recién cuando alguien la acepta, después de haber viajado hasta el
 * mostrador.
 *
 * Y la regla que le da geografía al juego: **lo comprado aparece en la estación
 * de la orden**, no donde está parado quien compró.
 */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { marketOrder, pilotAction } from '../db/schema';
import { crearPiloto, moverPiloto, seededDb } from '../db/testing';
import { auditStacks, moveItem, quantityOf, shipContainer, stationContainer } from './containers';
import { deskFor } from './market';
import {
	OrderError,
	bookFor,
	buyFromOrder,
	cancelOrder,
	openOrderCount,
	ordersOf,
	placeBuyOrder,
	placeSellOrder,
	sellToOrder,
	sweepExpired,
	tradingContext
} from './orders';
import { currentAction, resolveIfDue, startPublish } from './actions';
import { activeShip } from './ships';
import { auditBalance, balance, credit } from './wallet';
import type { Db } from '../db/types';
import type { Pilot } from '../db/schema';

const PUERTO = 'puerto_anfora';
const ANILLO = 'muelle_de_los_anillos';

/** Un piloto atracado donde se diga, con plata y con carga si hace falta. */
async function piloto(
	db: Db,
	callsign: string,
	donde = PUERTO,
	opciones: { creditos?: number; carga?: readonly [string, number][] } = {}
) {
	const row = moverPiloto(db, await crearPiloto(db, callsign), donde);
	if (opciones.creditos) {
		credit(db, row.id, opciones.creditos, { kind: 'adjustment', memo: 'prueba' });
	}
	const bodega = shipContainer(db, activeShip(db, row.id)!.id);
	for (const [code, units] of opciones.carga ?? []) moveItem(db, bodega.id, code, units, 'mined');
	return { row, bodega };
}

/**
 * Simula que pasó el tiempo: corre hacia atrás el reloj de la acción **y el de la
 * orden que está acordando**.
 *
 * Los dos se fijan en el mismo instante al encargar, así que mover uno solo
 * rompería una invariante que en el juego no se puede romper: la orden abre
 * exactamente cuando el trato se cierra.
 */
function vencer(db: Db, pilotId: number): void {
	const accion = currentAction(db, pilotId)!;
	const atras = (accion.durationSeconds + 5) * 1000;

	db.update(pilotAction)
		.set({ startedAt: new Date(accion.startedAt.getTime() - atras) })
		.where(eq(pilotAction.id, accion.id))
		.run();

	if (accion.orderId !== null) {
		const orden = ordersOf(db, pilotId).find((fila) => fila.id === accion.orderId)!;
		db.update(marketOrder)
			.set({ opensAt: new Date(orden.opensAt.getTime() - atras) })
			.where(eq(marketOrder.id, orden.id))
			.run();
	}
}

/** El id de la estación donde está parado un piloto. */
function estacion(db: Db, row: Pilot): number {
	return deskFor(db, row)!.stationId;
}

describe('publicar una orden de venta', () => {
	it('saca la mercadería de la bodega y cobra la comisión', async () => {
		const db = seededDb();
		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			creditos: 10_000,
			carga: [['ferrous_silicate', 500]]
		});
		const antes = balance(db, vendedor.row.id);

		const orden = placeSellOrder(db, vendedor.row, {
			itemCode: 'ferrous_silicate',
			quantity: 500,
			price: 14,
			stationId: estacion(db, vendedor.row)
		});

		expect(orden.quantity).toBe(500);
		// Ya no están en la bodega: mientras la orden viva, no se pueden vender dos
		// veces ni llevar a ningún lado.
		expect(quantityOf(db, vendedor.bodega.id, 'ferrous_silicate')).toBe(0);
		// 3 % de 7.000 son 210.
		expect(balance(db, vendedor.row.id)).toBe(antes - 210);
	});

	it('no se puede publicar más de lo que hay', async () => {
		const db = seededDb();
		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			creditos: 10_000,
			carga: [['ferrous_silicate', 10]]
		});

		expect(() =>
			placeSellOrder(db, vendedor.row, {
				itemCode: 'ferrous_silicate',
				quantity: 11,
				price: 14,
				stationId: estacion(db, vendedor.row)
			})
		).toThrow(OrderError);
		expect(openOrderCount(db, vendedor.row.id)).toBe(0);
	});

	it('cancelar devuelve la mercadería pero no la comisión', async () => {
		const db = seededDb();
		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			creditos: 10_000,
			carga: [['ferrous_silicate', 500]]
		});
		const antes = balance(db, vendedor.row.id);
		const orden = placeSellOrder(db, vendedor.row, {
			itemCode: 'ferrous_silicate',
			quantity: 500,
			price: 14,
			stationId: estacion(db, vendedor.row)
		});

		cancelOrder(db, vendedor.row, orden.id);

		// Vuelve a la estación donde estaba publicada, que es donde estaba de verdad.
		const hangar = stationContainer(db, vendedor.row.id, estacion(db, vendedor.row));
		expect(quantityOf(db, hangar.id, 'ferrous_silicate')).toBe(500);
		// Y la comisión quedó pagada: publicar para tantear tiene costo.
		expect(balance(db, vendedor.row.id)).toBe(antes - 210);
		expect(openOrderCount(db, vendedor.row.id)).toBe(0);
	});
});

describe('publicar una orden de compra', () => {
	it('reserva la plata por adelantado', async () => {
		const db = seededDb();
		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 10_000 });

		placeBuyOrder(db, comprador.row, {
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 11,
			stationId: estacion(db, comprador.row)
		});

		// 1.100 reservados más 33 de comisión.
		expect(balance(db, comprador.row.id)).toBe(10_000 - 1100 - 33);
	});

	it('sin plata para la reserva no se publica', async () => {
		const db = seededDb();
		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 100 });

		expect(() =>
			placeBuyOrder(db, comprador.row, {
				itemCode: 'ferrous_silicate',
				quantity: 100,
				price: 11,
				stationId: estacion(db, comprador.row)
			})
		).toThrow();
		expect(openOrderCount(db, comprador.row.id)).toBe(0);
	});

	it('cancelar devuelve la reserva entera', async () => {
		const db = seededDb();
		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 10_000 });
		const orden = placeBuyOrder(db, comprador.row, {
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 11,
			stationId: estacion(db, comprador.row)
		});

		cancelOrder(db, comprador.row, orden.id);

		// Vuelven los 1.100; los 33 de comisión no.
		expect(balance(db, comprador.row.id)).toBe(10_000 - 33);
	});

	it('no se puede pedir más alcance del que da la habilidad', async () => {
		const db = seededDb();
		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 10_000 });

		// Sin Análisis de mercado, una orden vale sólo en su propio mostrador.
		expect(() =>
			placeBuyOrder(db, comprador.row, {
				itemCode: 'ferrous_silicate',
				quantity: 10,
				price: 11,
				stationId: estacion(db, comprador.row),
				rangeRegions: 3
			})
		).toThrow(OrderError);
	});

	it('el tope de órdenes abiertas se hace cumplir', async () => {
		const db = seededDb();
		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 100_000 });
		const stationId = estacion(db, comprador.row);
		const poner = () =>
			placeBuyOrder(db, comprador.row, {
				itemCode: 'ferrous_silicate',
				quantity: 10,
				price: 11,
				stationId
			});

		poner();
		poner();

		// Sin Contabilidad son dos, y la tercera tiene que rebotar.
		expect(tradingContext(db, comprador.row).orderLimit).toBe(2);
		expect(poner).toThrow(OrderError);
	});
});

describe('comprarle a una orden de venta', () => {
	it('la carga queda en la estación de la orden, no donde está el comprador', async () => {
		const db = seededDb();
		const vendedor = await piloto(db, 'Vendedora', ANILLO, {
			creditos: 10_000,
			carga: [['ferrous_silicate', 500]]
		});
		const enElAnillo = estacion(db, vendedor.row);
		const orden = placeSellOrder(db, vendedor.row, {
			itemCode: 'ferrous_silicate',
			quantity: 500,
			price: 14,
			stationId: enElAnillo
		});

		// El comprador está en el otro extremo del sistema.
		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 20_000 });
		buyFromOrder(db, comprador.row, orden.id, 500);

		const allá = stationContainer(db, comprador.row.id, enElAnillo);
		const acá = stationContainer(db, comprador.row.id, estacion(db, comprador.row));
		expect(quantityOf(db, allá.id, 'ferrous_silicate')).toBe(500);
		// Comprar no teletransporta nada: hay que ir a buscarlo.
		expect(quantityOf(db, acá.id, 'ferrous_silicate')).toBe(0);
	});

	it('el vendedor cobra menos el impuesto', async () => {
		const db = seededDb();
		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			creditos: 10_000,
			carga: [['ferrous_silicate', 100]]
		});
		const orden = placeSellOrder(db, vendedor.row, {
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 20,
			stationId: estacion(db, vendedor.row)
		});
		const antesDelVendedor = balance(db, vendedor.row.id);

		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 20_000 });
		buyFromOrder(db, comprador.row, orden.id, 100);

		// 2.000 de venta, 5 % de impuesto: entran 1.900.
		expect(balance(db, vendedor.row.id)).toBe(antesDelVendedor + 1900);
		expect(balance(db, comprador.row.id)).toBe(20_000 - 2000);
	});

	it('una compra parcial deja el resto publicado', async () => {
		const db = seededDb();
		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			creditos: 10_000,
			carga: [['ferrous_silicate', 100]]
		});
		const orden = placeSellOrder(db, vendedor.row, {
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 20,
			stationId: estacion(db, vendedor.row)
		});

		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 20_000 });
		buyFromOrder(db, comprador.row, orden.id, 40);

		expect(ordersOf(db, vendedor.row.id)[0].quantity).toBe(60);
	});

	it('la orden se borra al agotarse', async () => {
		const db = seededDb();
		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			creditos: 10_000,
			carga: [['ferrous_silicate', 100]]
		});
		const orden = placeSellOrder(db, vendedor.row, {
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 20,
			stationId: estacion(db, vendedor.row)
		});

		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 20_000 });
		buyFromOrder(db, comprador.row, orden.id, 100);

		// Una orden agotada no es una orden, y un libro lleno de ceros ensucia toda
		// consulta que lo recorra.
		expect(ordersOf(db, vendedor.row.id)).toEqual([]);
	});

	it('no se le compra a la orden propia', async () => {
		const db = seededDb();
		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			creditos: 10_000,
			carga: [['ferrous_silicate', 100]]
		});
		const orden = placeSellOrder(db, vendedor.row, {
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 20,
			stationId: estacion(db, vendedor.row)
		});

		expect(() => buyFromOrder(db, vendedor.row, orden.id, 10)).toThrow(OrderError);
	});

	it('no se puede comprar más de lo que la orden tiene', async () => {
		const db = seededDb();
		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			creditos: 10_000,
			carga: [['ferrous_silicate', 10]]
		});
		const orden = placeSellOrder(db, vendedor.row, {
			itemCode: 'ferrous_silicate',
			quantity: 10,
			price: 20,
			stationId: estacion(db, vendedor.row)
		});

		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 20_000 });
		expect(() => buyFromOrder(db, comprador.row, orden.id, 11)).toThrow(OrderError);
	});
});

describe('venderle a una orden de compra', () => {
	it('la carga va a la estación del comprador y el vendedor cobra ahí mismo', async () => {
		const db = seededDb();
		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 20_000 });
		const enElPuerto = estacion(db, comprador.row);
		const orden = placeBuyOrder(db, comprador.row, {
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 20,
			stationId: enElPuerto
		});

		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			carga: [['ferrous_silicate', 100]]
		});
		const recibo = sellToOrder(db, vendedor.row, orden.id, 100, enElPuerto);

		// 2.000 menos el 5 %.
		expect(recibo.total).toBe(1900);
		expect(balance(db, vendedor.row.id)).toBe(1900);
		const hangar = stationContainer(db, comprador.row.id, enElPuerto);
		expect(quantityOf(db, hangar.id, 'ferrous_silicate')).toBe(100);
	});

	it('el comprador no paga de nuevo: sale de lo reservado', async () => {
		const db = seededDb();
		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 20_000 });
		const enElPuerto = estacion(db, comprador.row);
		const orden = placeBuyOrder(db, comprador.row, {
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 20,
			stationId: enElPuerto
		});
		const trasPublicar = balance(db, comprador.row.id);

		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			carga: [['ferrous_silicate', 100]]
		});
		sellToOrder(db, vendedor.row, orden.id, 100, enElPuerto);

		expect(balance(db, comprador.row.id)).toBe(trasPublicar);
	});

	it('una orden sin alcance no se puede tomar desde otra estación', async () => {
		const db = seededDb();
		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 20_000 });
		const orden = placeBuyOrder(db, comprador.row, {
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 20,
			stationId: estacion(db, comprador.row)
		});

		const vendedor = await piloto(db, 'Vendedora', ANILLO, {
			carga: [['ferrous_silicate', 100]]
		});
		expect(() => sellToOrder(db, vendedor.row, orden.id, 100, estacion(db, vendedor.row))).toThrow(
			OrderError
		);
	});

	it('con alcance de una región sí se puede, desde cualquier mostrador', async () => {
		const db = seededDb();
		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 20_000 });
		const enElPuerto = estacion(db, comprador.row);
		const orden = placeBuyOrder(db, comprador.row, {
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 20,
			stationId: enElPuerto
		});
		// Se le abre el alcance a mano: el tope depende de Análisis de mercado, y lo
		// que se prueba acá es la regla de alcance, no la del requisito.
		db.update(marketOrder).set({ rangeRegions: 1 }).where(eq(marketOrder.id, orden.id)).run();

		const vendedor = await piloto(db, 'Vendedora', ANILLO, {
			carga: [['ferrous_silicate', 100]]
		});
		const recibo = sellToOrder(db, vendedor.row, orden.id, 100, estacion(db, vendedor.row));

		// Ánfora entera es una sola región, así que el Muelle está dentro.
		expect(recibo.quantity).toBe(100);
	});
});

describe('los dos libros después de todo', () => {
	it('quedan cuadrados con órdenes puestas, canceladas y cumplidas', async () => {
		const db = seededDb();
		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 50_000 });
		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			creditos: 50_000,
			carga: [
				['ferrous_silicate', 300],
				['carbon_chondrite', 200]
			]
		});
		const enElPuerto = estacion(db, comprador.row);

		const cancelada = placeSellOrder(db, vendedor.row, {
			itemCode: 'carbon_chondrite',
			quantity: 200,
			price: 18,
			stationId: enElPuerto
		});
		cancelOrder(db, vendedor.row, cancelada.id);

		const venta = placeSellOrder(db, vendedor.row, {
			itemCode: 'ferrous_silicate',
			quantity: 300,
			price: 15,
			stationId: enElPuerto
		});
		buyFromOrder(db, comprador.row, venta.id, 120);

		const compra = placeBuyOrder(db, comprador.row, {
			itemCode: 'carbon_chondrite',
			quantity: 50,
			price: 17,
			stationId: enElPuerto
		});
		const hangar = stationContainer(db, vendedor.row.id, enElPuerto);
		sellToOrder(db, vendedor.row, compra.id, 50, enElPuerto, 'station');

		expect(auditBalance(db, comprador.row.id)).toBeNull();
		expect(auditBalance(db, vendedor.row.id)).toBeNull();
		expect(auditStacks(db, hangar.id)).toEqual([]);
		expect(auditStacks(db, stationContainer(db, comprador.row.id, enElPuerto).id)).toEqual([]);
		expect(auditStacks(db, vendedor.bodega.id)).toEqual([]);
	});
});

describe('acordar una orden lleva tiempo', () => {
	it('la orden no entra al libro hasta que el trato se cierra', async () => {
		const db = seededDb();
		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			creditos: 10_000,
			carga: [['ferrous_silicate', 100]]
		});

		startPublish(db, vendedor.row, {
			kind: 'sell',
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 14,
			stationId: estacion(db, vendedor.row)
		});

		// Publicada pero todavía no visible: se está negociando.
		expect(ordersOf(db, vendedor.row.id)).toHaveLength(1);
		expect(bookFor(db, 'ferrous_silicate', 'sell')).toEqual([]);
	});

	it('la garantía se toma al encargar y no al cerrar', async () => {
		const db = seededDb();
		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			creditos: 10_000,
			carga: [['ferrous_silicate', 100]]
		});

		startPublish(db, vendedor.row, {
			kind: 'sell',
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 14,
			stationId: estacion(db, vendedor.row)
		});

		// Si la mercadería quedara libre mientras se negocia, el piloto podría
		// comprometerla dos veces.
		expect(quantityOf(db, vendedor.bodega.id, 'ferrous_silicate')).toBe(0);
	});

	it('cerrado el trato, la orden abre sola y deja experiencia de Comercio', async () => {
		const db = seededDb();
		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			creditos: 10_000,
			carga: [['ferrous_silicate', 100]]
		});
		startPublish(db, vendedor.row, {
			kind: 'sell',
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 14,
			stationId: estacion(db, vendedor.row)
		});
		vencer(db, vendedor.row.id);

		const informe = resolveIfDue(db, vendedor.row)!;

		expect(informe.deposit.family).toBe('trade');
		expect(informe.deposit.xp).toBeGreaterThan(0);
		expect(bookFor(db, 'ferrous_silicate', 'sell')).toHaveLength(1);
	});

	it('cancelar mientras se acuerda cancela también la negociación', async () => {
		const db = seededDb();
		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			creditos: 10_000,
			carga: [['ferrous_silicate', 100]]
		});
		startPublish(db, vendedor.row, {
			kind: 'sell',
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 14,
			stationId: estacion(db, vendedor.row)
		});

		cancelOrder(db, vendedor.row, ordersOf(db, vendedor.row.id)[0].id);

		// Retirarse de un trato no es una negociación: es decir que no.
		expect(ordersOf(db, vendedor.row.id)).toEqual([]);
		expect(currentAction(db, vendedor.row.id)).toBeNull();
		const hangar = stationContainer(db, vendedor.row.id, estacion(db, vendedor.row));
		expect(quantityOf(db, hangar.id, 'ferrous_silicate')).toBe(100);
	});
});

describe('las órdenes vencen', () => {
	it('una vencida sale del libro y devuelve la garantía', async () => {
		const db = seededDb();
		const vendedor = await piloto(db, 'Vendedora', PUERTO, {
			creditos: 10_000,
			carga: [['ferrous_silicate', 100]]
		});
		const orden = placeSellOrder(db, vendedor.row, {
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 14,
			stationId: estacion(db, vendedor.row)
		});
		db.update(marketOrder)
			.set({ expiresAt: new Date(Date.now() - 1000) })
			.where(eq(marketOrder.id, orden.id))
			.run();

		// Para los demás ya era invisible desde que venció.
		expect(bookFor(db, 'ferrous_silicate', 'sell')).toEqual([]);

		expect(sweepExpired(db, vendedor.row.id)).toBe(1);

		// Y caducar no es perder: la mercadería vuelve a la estación.
		const hangar = stationContainer(db, vendedor.row.id, estacion(db, vendedor.row));
		expect(quantityOf(db, hangar.id, 'ferrous_silicate')).toBe(100);
		expect(ordersOf(db, vendedor.row.id)).toEqual([]);
	});

	it('una compra vencida devuelve la plata reservada', async () => {
		const db = seededDb();
		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 10_000 });
		const orden = placeBuyOrder(db, comprador.row, {
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 11,
			stationId: estacion(db, comprador.row)
		});
		db.update(marketOrder)
			.set({ expiresAt: new Date(Date.now() - 1000) })
			.where(eq(marketOrder.id, orden.id))
			.run();

		sweepExpired(db, comprador.row.id);

		// Vuelven los 1.100; los 33 de comisión no, que para eso se pagaron.
		expect(balance(db, comprador.row.id)).toBe(10_000 - 33);
		expect(auditBalance(db, comprador.row.id)).toBeNull();
	});

	it('toda orden nace con un vencimiento en el futuro', async () => {
		const db = seededDb();
		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 10_000 });

		const orden = placeBuyOrder(db, comprador.row, {
			itemCode: 'ferrous_silicate',
			quantity: 10,
			price: 11,
			stationId: estacion(db, comprador.row)
		});

		// El valor por defecto de la columna es la época, y nadie debería apoyarse
		// en él: toda orden fija su vencimiento al publicarse.
		expect(orden.expiresAt.getTime()).toBeGreaterThan(Date.now());
	});

	it('no se puede publicar por más tiempo del que da Contactos', async () => {
		const db = seededDb();
		const comprador = await piloto(db, 'Compradora', PUERTO, { creditos: 100_000 });

		expect(() =>
			placeBuyOrder(db, comprador.row, {
				itemCode: 'ferrous_silicate',
				quantity: 10,
				price: 11,
				stationId: estacion(db, comprador.row),
				days: 90
			})
		).toThrow(OrderError);
	});
});
