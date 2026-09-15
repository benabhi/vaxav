/**
 * El libro de órdenes: comerciar con otros pilotos y no con la estación.
 *
 * Una orden es **una promesa respaldada**. Publicar una de compra reserva los
 * créditos y publicar una de venta reserva la mercadería; sin eso, aceptar una
 * orden sería descubrir recién ahí que del otro lado no había nada. La garantía
 * se toma en el momento de publicar y se devuelve entera al cancelar.
 *
 * Tres reglas gobiernan todo lo de acá:
 *
 * 1. **La carga aparece en la estación de la orden.** Comprar no teletransporta
 *    nada: lo que se compra queda donde estaba y hay que ir a buscarlo. Es lo que
 *    hace que el mapa tenga consecuencias económicas y no sea sólo decorado.
 * 2. **Se publica donde estás parado.** Una orden es un puesto en un mostrador
 *    concreto, y poner uno a distancia es una mecánica aparte —y más cara— que
 *    todavía no existe.
 * 3. **La casa siempre cobra.** La comisión al publicar y el impuesto al vender
 *    bajan con habilidad hasta un piso, nunca a cero.
 *
 * Corresponde a docs/systems/MARKET.md.
 */

import { and, desc, eq, gt, lte, sql } from 'drizzle-orm';
import {
	body,
	constellation,
	marketOrder,
	pilotAction,
	station,
	system,
	type MarketOrder,
	type Pilot
} from '../db/schema';
import type { Db } from '../db/types';
import { moveItem, quantityOf, shipContainer, stationContainer } from './containers';
import { activeShip, pilotSkillLevels } from './ships';
import { recordTrade } from './trades';
import { balance, credit, debit } from './wallet';
import { getItem, type ContainerKind } from '$lib/game/items';
import {
	BROKER_SKILL,
	DURATION_SKILL,
	MARKET_RANGE_SKILL,
	ORDER_DURATIONS,
	TAX_SKILL,
	allowsDuration,
	maxOrderDays,
	brokerFeePermille,
	cut,
	maxOrderRange,
	openOrderLimit,
	regionsInRange,
	salesTaxPermille,
	type OrderKind
} from '$lib/game/market';

/** No se puede operar con una orden. El mensaje se le muestra al jugador. */
export class OrderError extends Error {}

/**
 * Lo que un piloto puede hacer en el mercado, resuelto de una sola vez.
 *
 * Se arma por pedido y se pasa a todo lo demás: preguntar el nivel de tres
 * habilidades y contar las órdenes abiertas una vez por renglón del libro sería
 * una consulta por fila para dibujar una lista.
 */
export interface TradingContext {
	/** Cuántas tiene abiertas de cada lado, y cuántas puede tener. */
	readonly openBuys: number;
	readonly openSells: number;
	readonly orderLimit: number;
	/** Cuántas regiones ve, contando la propia. */
	readonly regionsInRange: number;
	/** Hasta dónde puede llegar una orden de compra suya. */
	readonly maxRange: number;
	readonly brokerPermille: number;
	readonly taxPermille: number;
	/** Lo máximo que puede durar una orden suya, en días. */
	readonly maxDays: number;
	/** El nivel de Contactos, que es lo que decide las duraciones que puede elegir. */
	readonly durationLevel: number;
}

/** Cuánto dura un día, en milisegundos. */
export const MILLISECONDS_PER_DAY = 86_400_000;

/**
 * La condición de que una orden esté **viva**: ya abrió y todavía no venció.
 *
 * Vive acá y no repartida por cada consulta porque es la definición de qué es una
 * orden visible, y con la definición repartida basta que una consulta se olvide
 * para que aparezcan tratos que no existen.
 */
export function aliveNow() {
	const ahora = new Date();
	return and(lte(marketOrder.opensAt, ahora), gt(marketOrder.expiresAt, ahora));
}

/** Lo que quedó de una operación contra una orden. */
export interface Fill {
	readonly orderId: number;
	readonly itemCode: string;
	readonly itemName: string;
	readonly quantity: number;
	readonly price: number;
	/** Lo que se movió de plata, ya con el impuesto descontado si corresponde. */
	readonly total: number;
	readonly tax: number;
	/** Dónde quedó la carga, que casi nunca es donde está el piloto. */
	readonly stationId: number;
	readonly balance: number;
}

/**
 * Cuántas órdenes tiene abiertas un piloto, de un lado o de los dos.
 *
 * Cuentan también las que todavía se están acordando: la garantía ya está tomada,
 * así que el cupo ya está ocupado.
 */
export function openOrderCount(db: Db, pilotId: number, kind?: OrderKind): number {
	const fila = db
		.select({ total: sql<number>`count(*)` })
		.from(marketOrder)
		.where(
			kind
				? and(eq(marketOrder.pilotId, pilotId), eq(marketOrder.kind, kind))
				: eq(marketOrder.pilotId, pilotId)
		)
		.get();
	return fila?.total ?? 0;
}

/** Lo que el piloto puede hacer en el mercado, según sus habilidades. */
export function tradingContext(db: Db, row: Pilot): TradingContext {
	const levels = pilotSkillLevels(db, row.id);
	const analysis = levels[MARKET_RANGE_SKILL] ?? 0;
	const accounting = levels[TAX_SKILL] ?? 0;

	return {
		openBuys: openOrderCount(db, row.id, 'buy'),
		openSells: openOrderCount(db, row.id, 'sell'),
		orderLimit: openOrderLimit(accounting),
		regionsInRange: regionsInRange(analysis),
		maxRange: maxOrderRange(analysis),
		brokerPermille: brokerFeePermille(levels[BROKER_SKILL] ?? 0),
		taxPermille: salesTaxPermille(accounting),
		maxDays: maxOrderDays(levels[DURATION_SKILL] ?? 0),
		durationLevel: levels[DURATION_SKILL] ?? 0
	};
}

/**
 * La región de una estación, subiendo por el árbol del universo.
 *
 * Son cuatro saltos —estación, cuerpo, sistema, constelación— y se hacen en una
 * sola consulta: preguntar uno por uno sería cuatro viajes a la base por cada
 * renglón del libro.
 */
export function regionOfStation(db: Db, stationId: number): number | null {
	const fila = db
		.select({ regionId: constellation.regionId })
		.from(station)
		.innerJoin(body, eq(body.id, station.bodyId))
		.innerJoin(system, eq(system.id, body.systemId))
		.innerJoin(constellation, eq(constellation.id, system.constellationId))
		.where(eq(station.id, stationId))
		.get();
	return fila?.regionId ?? null;
}

/**
 * Si una estación queda dentro del alcance de una orden de compra.
 *
 * Hoy la galaxia tiene **una sola región**, así que el alcance sólo distingue dos
 * casos: cero es "vení hasta este mostrador" y uno o más es "cualquier lugar de
 * la región". Cuando haya varias y un mapa que las una, la cuenta de saltos entre
 * regiones entra acá y nada más se entera.
 */
export function withinRange(db: Db, order: MarketOrder, fromStationId: number): boolean {
	if (order.stationId === fromStationId) return true;
	if (order.rangeRegions < 1) return false;

	const alla = regionOfStation(db, order.stationId);
	const aca = regionOfStation(db, fromStationId);
	return alla !== null && alla === aca;
}

/** La orden, o el error que explica que ya no está. */
function requireOrder(db: Db, orderId: number): MarketOrder {
	const orden = db.select().from(marketOrder).where(eq(marketOrder.id, orderId)).get();
	if (!orden) throw new OrderError('Esa orden ya no existe: alguien se adelantó.');
	return orden;
}

/** La orden, o el error si todavía no abrió o ya venció. */
function requireLiveOrder(db: Db, orderId: number): MarketOrder {
	const orden = requireOrder(db, orderId);
	const ahora = new Date();
	if (orden.opensAt > ahora) throw new OrderError('Esa orden todavía se está acordando.');
	if (orden.expiresAt <= ahora) throw new OrderError('Esa orden ya venció.');
	return orden;
}

/**
 * Cuándo abre y cuándo vence una orden que se publica ahora.
 *
 * Abre **más tarde** porque acordarla es una acción que lleva tiempo, y la fecha
 * es lo que hace que abra sola con el reloj sin depender de que alguien resuelva
 * nada.
 */
function window(
	context: TradingContext,
	days: number | undefined,
	delaySeconds: number | undefined
): { opensAt: Date; expiresAt: Date } {
	const dias = days ?? ORDER_DURATIONS[0].days;
	if (!allowsDuration(context.durationLevel, dias)) {
		throw new OrderError(
			`Tus órdenes duran hasta ${context.maxDays} ${context.maxDays === 1 ? 'día' : 'días'}. ` +
				'Subí Contactos para dejarlas más tiempo.'
		);
	}

	const abre = new Date(Date.now() + (delaySeconds ?? 0) * 1000);
	return { opensAt: abre, expiresAt: new Date(abre.getTime() + dias * MILLISECONDS_PER_DAY) };
}

/** Una cantidad que se pueda comerciar. */
function requireQuantity(quantity: number): void {
	if (!Number.isInteger(quantity)) throw new OrderError('Las unidades son enteras');
	if (quantity <= 0) throw new OrderError('Hay que mover al menos una unidad');
}

/** Un precio que se pueda publicar. */
function requirePrice(price: number): void {
	if (!Number.isInteger(price)) throw new OrderError('Los créditos son enteros');
	if (price <= 0) throw new OrderError('El precio tiene que ser de al menos un crédito');
}

/**
 * Que le quede lugar en el libro, **de ese lado**.
 *
 * El cupo es por lado: tener una venta publicada no puede impedir poner una
 * compra, que es justamente el par que hace falta para entender el oficio.
 */
function requireRoom(context: TradingContext, kind: OrderKind): void {
	const puestas = kind === 'buy' ? context.openBuys : context.openSells;
	if (puestas >= context.orderLimit) {
		const lado = kind === 'buy' ? 'compra' : 'venta';
		throw new OrderError(
			`Ya tenés ${puestas} ${puestas === 1 ? `orden de ${lado}` : `órdenes de ${lado}`} y podés ` +
				`llevar ${context.orderLimit} de cada lado. Cancelá una o subí Contabilidad.`
		);
	}
}

/** La bodega elegida de las dos que el piloto tiene a mano en una estación. */
function holdId(db: Db, row: Pilot, stationId: number, where: ContainerKind): number {
	if (where === 'station') return stationContainer(db, row.id, stationId).id;

	const nave = activeShip(db, row.id);
	if (!nave) throw new OrderError('No tenés nave de dónde sacar eso');
	return shipContainer(db, nave.id).id;
}

/**
 * Publica una orden de venta: la mercadería sale de la bodega y queda en garantía.
 *
 * Sale de la bodega **de verdad**: mientras la orden esté publicada, esas
 * unidades no se pueden montar, ni llevar, ni vender dos veces. Es lo que hace
 * que una orden valga algo para quien la mira del otro lado.
 */
export function placeSellOrder(
	db: Db,
	row: Pilot,
	spec: {
		itemCode: string;
		quantity: number;
		price: number;
		stationId: number;
		from?: ContainerKind;
		/** Cuántos días queda en el libro. El tope lo da Contactos. */
		days?: number;
		/** Cuánto tarda en abrir. Lo pone la acción de acordarla. */
		delaySeconds?: number;
	}
): MarketOrder {
	const item = getItem(spec.itemCode);
	requireQuantity(spec.quantity);
	requirePrice(spec.price);

	const context = tradingContext(db, row);
	requireRoom(context, 'sell');

	const fee = cut(spec.price * spec.quantity, context.brokerPermille);
	const vida = window(context, spec.days, spec.delaySeconds);

	return db.transaction((tx) => {
		const desde = holdId(tx, row, spec.stationId, spec.from ?? 'ship');
		const hay = quantityOf(tx, desde, spec.itemCode);
		if (hay < spec.quantity) {
			throw new OrderError(`No tenés tanto: hay ${hay} y querés publicar ${spec.quantity}.`);
		}

		// La comisión primero: si no alcanza para publicar, la mercadería no se
		// toca y el mensaje que sale es el de la billetera.
		debit(tx, row.id, fee, {
			kind: 'broker_fee',
			memo: `Comisión por publicar ${spec.quantity} × ${item.name}`
		});
		moveItem(tx, desde, spec.itemCode, -spec.quantity, 'listed');

		return tx
			.insert(marketOrder)
			.values({
				kind: 'sell' satisfies OrderKind,
				itemCode: spec.itemCode,
				stationId: spec.stationId,
				pilotId: row.id,
				price: spec.price,
				quantity: spec.quantity,
				initialQuantity: spec.quantity,
				rangeRegions: 0,
				escrow: 0,
				...vida
			})
			.returning()
			.get();
	});
}

/**
 * Publica una orden de compra: los créditos quedan reservados.
 *
 * Se reservan enteros y por adelantado. Una orden de compra sin plata detrás es
 * una oferta que se evapora cuando alguien la acepta, y el vendedor se entera
 * después de haber viajado hasta el mostrador.
 */
export function placeBuyOrder(
	db: Db,
	row: Pilot,
	spec: {
		itemCode: string;
		quantity: number;
		price: number;
		stationId: number;
		rangeRegions?: number;
		days?: number;
		delaySeconds?: number;
	}
): MarketOrder {
	const item = getItem(spec.itemCode);
	requireQuantity(spec.quantity);
	requirePrice(spec.price);

	const context = tradingContext(db, row);
	requireRoom(context, 'buy');

	const alcance = Math.max(0, Math.trunc(spec.rangeRegions ?? 0));
	if (alcance > context.maxRange) {
		throw new OrderError(
			`Tu alcance llega a ${context.maxRange} ${context.maxRange === 1 ? 'región' : 'regiones'}. ` +
				'Subí Análisis de mercado para llegar más lejos.'
		);
	}

	const reserva = spec.price * spec.quantity;
	const fee = cut(reserva, context.brokerPermille);
	const vida = window(context, spec.days, spec.delaySeconds);

	return db.transaction((tx) => {
		debit(tx, row.id, fee, {
			kind: 'broker_fee',
			memo: `Comisión por publicar compra de ${spec.quantity} × ${item.name}`
		});
		debit(tx, row.id, reserva, {
			kind: 'order_escrow',
			memo: `Reserva de ${spec.quantity} × ${item.name} a ${spec.price} CR`
		});

		return tx
			.insert(marketOrder)
			.values({
				kind: 'buy' satisfies OrderKind,
				itemCode: spec.itemCode,
				stationId: spec.stationId,
				pilotId: row.id,
				price: spec.price,
				quantity: spec.quantity,
				initialQuantity: spec.quantity,
				rangeRegions: alcance,
				escrow: reserva,
				...vida
			})
			.returning()
			.get();
	});
}

/**
 * Cancela una orden propia y devuelve lo que quedaba en garantía.
 *
 * **La comisión no vuelve.** Es justamente lo que hace que publicar tenga costo:
 * si cancelar devolviera todo, poner y sacar órdenes para tantear el mercado
 * saldría gratis y el libro se llenaría de ruido.
 */
export function cancelOrder(db: Db, row: Pilot, orderId: number): void {
	const orden = requireOrder(db, orderId);
	if (orden.pilotId !== row.id) throw new OrderError('Esa orden no es tuya');
	// Cancelar es **instantáneo**, aunque publicar lleve tiempo: retirarse de un
	// trato no es una negociación, es decir que no.
	refund(db, orden);
}

/** Descuenta lo comerciado de una orden, y la borra si se agotó. */
function consume(db: Db, order: MarketOrder, quantity: number, escrowSpent: number): void {
	const quedan = order.quantity - quantity;
	if (quedan <= 0) {
		db.delete(marketOrder).where(eq(marketOrder.id, order.id)).run();
		return;
	}
	db.update(marketOrder)
		.set({ quantity: quedan, escrow: order.escrow - escrowSpent })
		.where(eq(marketOrder.id, order.id))
		.run();
}

/**
 * Le compra a una orden de venta de otro piloto.
 *
 * La carga queda en **la estación de la orden**, que es donde estaba. Comprar no
 * la mueve: si está a tres sistemas, hay que ir.
 */
export function buyFromOrder(db: Db, row: Pilot, orderId: number, quantity: number): Fill {
	const orden = requireLiveOrder(db, orderId);
	if (orden.kind !== 'sell') throw new OrderError('Esa orden no vende nada');
	if (orden.pilotId === row.id) throw new OrderError('Esa orden es tuya');
	requireQuantity(quantity);
	if (quantity > orden.quantity) {
		throw new OrderError(`Esa orden tiene ${orden.quantity} y pediste ${quantity}.`);
	}

	const item = getItem(orden.itemCode);
	const total = orden.price * quantity;
	// El impuesto lo paga quien vende, con **su** Contabilidad y no la de quien
	// compra: es su venta.
	const tax = cut(total, salesTaxPermille(pilotSkillLevels(db, orden.pilotId)[TAX_SKILL] ?? 0));

	return db.transaction((tx) => {
		const entry = debit(tx, row.id, total, {
			kind: 'order_purchase',
			memo: `${quantity} × ${item.name} a ${orden.price} CR`
		});

		// Entra la venta entera y sale el impuesto por separado: en el libro tienen
		// que verse los dos renglones, o el vendedor no sabe cuánto le sacaron.
		credit(tx, orden.pilotId, total, {
			kind: 'order_sale',
			memo: `${quantity} × ${item.name} a ${orden.price} CR`
		});
		if (tax > 0) {
			debit(tx, orden.pilotId, tax, {
				kind: 'sales_tax',
				memo: `Impuesto sobre ${quantity} × ${item.name}`
			});
		}

		// La mercadería ya estaba fuera de toda bodega, en garantía: entra a la del
		// comprador en la estación de la orden.
		moveItem(
			tx,
			stationContainer(tx, row.id, orden.stationId).id,
			orden.itemCode,
			quantity,
			'bought'
		);
		consume(tx, orden, quantity, 0);
		recordTrade(tx, {
			itemCode: orden.itemCode,
			stationId: orden.stationId,
			price: orden.price,
			quantity
		});

		return {
			orderId: orden.id,
			itemCode: orden.itemCode,
			itemName: item.name,
			quantity,
			price: orden.price,
			total,
			tax: 0,
			stationId: orden.stationId,
			balance: entry.balanceAfter
		};
	});
}

/**
 * Le vende a una orden de compra de otro piloto.
 *
 * La mercadería sale de donde está el piloto y aparece en la bodega del
 * comprador **en la estación de su orden**. El vendedor cobra ahí mismo, menos su
 * impuesto.
 */
export function sellToOrder(
	db: Db,
	row: Pilot,
	orderId: number,
	quantity: number,
	fromStationId: number,
	from: ContainerKind = 'ship'
): Fill {
	const orden = requireLiveOrder(db, orderId);
	if (orden.kind !== 'buy') throw new OrderError('Esa orden no compra nada');
	if (orden.pilotId === row.id) throw new OrderError('Esa orden es tuya');
	requireQuantity(quantity);
	if (quantity > orden.quantity) {
		throw new OrderError(`Esa orden pide ${orden.quantity} y ofreciste ${quantity}.`);
	}
	if (!withinRange(db, orden, fromStationId)) {
		throw new OrderError('Esa orden no llega hasta acá: hay que ir hasta su estación.');
	}

	const item = getItem(orden.itemCode);
	const total = orden.price * quantity;
	const tax = cut(total, tradingContext(db, row).taxPermille);

	return db.transaction((tx) => {
		const desde = holdId(tx, row, fromStationId, from);
		const hay = quantityOf(tx, desde, orden.itemCode);
		if (hay < quantity) {
			throw new OrderError(`No tenés tanto: hay ${hay} y querés vender ${quantity}.`);
		}

		moveItem(tx, desde, orden.itemCode, -quantity, 'sold');
		// Lo comprado aparece donde el comprador puso su orden, no donde estaba el
		// vendedor: por eso pagó por un alcance.
		moveItem(
			tx,
			stationContainer(tx, orden.pilotId, orden.stationId).id,
			orden.itemCode,
			quantity,
			'bought'
		);

		// Entra la venta entera y sale el impuesto por separado, para que los dos
		// renglones queden escritos y se pueda ver cuánto se llevó la casa.
		credit(tx, row.id, total, {
			kind: 'order_sale',
			memo: `${quantity} × ${item.name} a ${orden.price} CR`
		});
		const entry =
			tax > 0
				? debit(tx, row.id, tax, {
						kind: 'sales_tax',
						memo: `Impuesto sobre ${quantity} × ${item.name}`
					})
				: { balanceAfter: balance(tx, row.id) };

		// La plata del comprador ya estaba reservada: se libera contra esta venta en
		// vez de pedírsela otra vez.
		consume(tx, orden, quantity, total);
		recordTrade(tx, {
			itemCode: orden.itemCode,
			stationId: orden.stationId,
			price: orden.price,
			quantity
		});

		return {
			orderId: orden.id,
			itemCode: orden.itemCode,
			itemName: item.name,
			quantity,
			price: orden.price,
			total: total - tax,
			tax,
			stationId: orden.stationId,
			balance: entry.balanceAfter
		};
	});
}

/** Las órdenes abiertas de un piloto, de la más nueva a la más vieja. */
export function ordersOf(db: Db, pilotId: number): readonly MarketOrder[] {
	return db
		.select()
		.from(marketOrder)
		.where(eq(marketOrder.pilotId, pilotId))
		.orderBy(desc(marketOrder.createdAt), desc(marketOrder.id))
		.all();
}

/** El libro de un ítem: las órdenes vivas de un lado, ordenadas por conveniencia. */
export function bookFor(db: Db, itemCode: string, kind: OrderKind): readonly MarketOrder[] {
	return db
		.select()
		.from(marketOrder)
		.where(and(eq(marketOrder.itemCode, itemCode), eq(marketOrder.kind, kind), aliveNow()))
		.all()
		.sort((a, b) => (kind === 'sell' ? a.price - b.price : b.price - a.price));
}

/**
 * Devuelve lo que quedaba de una orden y la borra.
 *
 * Lo usan cancelar y caducar, que son lo mismo desde el punto de vista de la
 * garantía: la mercadería vuelve a la estación donde estaba publicada y los
 * créditos a la billetera. **Caducar no es perder.**
 */
function refund(db: Db, order: MarketOrder): void {
	const item = getItem(order.itemCode);
	db.transaction((tx) => {
		if (order.kind === 'sell') {
			const hangar = stationContainer(tx, order.pilotId, order.stationId).id;
			moveItem(tx, hangar, order.itemCode, order.quantity, 'unlisted');
		} else if (order.escrow > 0) {
			credit(tx, order.pilotId, order.escrow, {
				kind: 'order_refund',
				memo: `${order.quantity} × ${item.name}`
			});
		}
		// La acción de acordarla, si todavía estaba en curso: cancelar el trato
		// cancela la negociación, y no queda una orden fantasma esperando abrir.
		tx.delete(pilotAction).where(eq(pilotAction.orderId, order.id)).run();
		tx.delete(marketOrder).where(eq(marketOrder.id, order.id)).run();
	});
}

/**
 * Devuelve la garantía de las órdenes vencidas del piloto y las borra.
 *
 * Es perezoso, como todo en este juego: no hay ningún proceso de fondo mirando
 * relojes. Las vencidas ya son invisibles para todos —el libro filtra por
 * fecha—, así que lo único que falta es devolverle lo suyo a su dueño, y eso
 * puede esperar a que vuelva.
 */
export function sweepExpired(db: Db, pilotId: number): number {
	const vencidas = db
		.select()
		.from(marketOrder)
		.where(and(eq(marketOrder.pilotId, pilotId), lte(marketOrder.expiresAt, new Date())))
		.all();

	for (const orden of vencidas) refund(db, orden);
	return vencidas.length;
}
