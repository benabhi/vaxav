/**
 * Comerciar con la estación donde está parado el piloto.
 *
 * Es el otro extremo del circuito: minar llena la bodega, esto la vacía y la
 * convierte en créditos. Y al revés —comprar un módulo— es **la única puerta**
 * para conseguir equipo, desde que el equipamiento dejó de regalarlo.
 *
 * Dos reglas gobiernan todo lo de acá:
 *
 * 1. **La plata y la carga se mueven juntas o no se mueven.** Cada operación es
 *    una sola transacción con su asiento en los dos libros; media venta es
 *    mineral que desapareció sin cobrarse, y eso no se arregla después.
 * 2. **El precio se calcula en el servidor, siempre.** Lo que la pantalla mostró
 *    es una lectura de hace unos segundos; lo que se cobra sale de volver a
 *    preguntar acá, con los niveles del piloto releídos.
 *
 * Lo comprado va a parar a **la bodega de la estación**, no a la de la nave: es
 * lo que hace que comprar nunca se rechace por falta de lugar, y desde ahí se
 * monta o se sube a bordo como cualquier otra cosa guardada.
 */

import { eq } from 'drizzle-orm';
import { body, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { moveItem, quantityOf, shipContainer, stationContainer } from './containers';
import { activeShip, pilotSkillLevels } from './ships';
import { situation } from './status';
import { bodyDetail } from './universe';
import { credit, debit } from './wallet';
import { getItem, type ContainerKind, type ItemKind } from '$lib/game/items';
import {
	HAGGLING_SKILL,
	askPrice,
	askTotal,
	bidPrice,
	bidTotal,
	marketServices,
	spreadFor,
	type MarketServices,
	type Spread
} from '$lib/game/market';
import type { CorporationKind } from '$lib/game/universe';

/** No se puede comerciar. El mensaje se le muestra al jugador. */
export class MarketError extends Error {}

/**
 * El mostrador de una estación, con todo lo que decide un precio.
 *
 * Se arma una sola vez por pedido y se pasa a todo lo demás: preguntar el rubro
 * de la corporación y el nivel de Regateo una vez por renglón del catálogo sería
 * cuarenta y siete consultas para dibujar una lista.
 */
export interface MarketDesk {
	readonly bodyId: number;
	readonly stationId: number;
	readonly stationName: string;
	readonly corporationName: string;
	readonly corporationKind: CorporationKind | null;
	readonly services: MarketServices;
	readonly hagglingLevel: number;
}

/** Lo que quedó de una operación, para poder contarla y para el recibo. */
export interface Receipt {
	readonly itemCode: string;
	readonly itemName: string;
	readonly quantity: number;
	/**
	 * Lo que salió cada unidad, **redondeado para mostrar**. El cobro sale de
	 * `total`, que se calcula sobre el lote entero: multiplicar esta cifra por la
	 * cantidad da un número parecido pero no el que se movió.
	 */
	readonly unitPrice: number;
	readonly total: number;
	/** El saldo con el que quedó el piloto. */
	readonly balance: number;
}

/**
 * El mostrador donde está parado el piloto, o `null` si no hay ninguno.
 *
 * Hace falta estar **atracado y quieto**: en viaje el piloto todavía figura en
 * el cuerpo de salida, y dejarlo comerciar desde ahí sería vender desde el
 * espacio profundo con el mostrador a cuatro horas de distancia.
 */
export function deskFor(db: Db, row: Pilot): MarketDesk | null {
	const ahora = situation(db, row);
	if (ahora.inTransit || ahora.stationId === null) return null;

	const place = db.select().from(body).where(eq(body.id, row.locationId)).get();
	const detail = place ? bodyDetail(db, place.code) : null;
	if (!detail?.station) return null;

	return {
		bodyId: detail.body.id,
		stationId: detail.station.id,
		stationName: detail.body.name,
		corporationName: detail.corporation?.name ?? '',
		corporationKind: (detail.corporation?.kind as CorporationKind) ?? null,
		services: marketServices(detail.services),
		hagglingLevel: pilotSkillLevels(db, row.id)[HAGGLING_SKILL] ?? 0
	};
}

/** La horquilla que le toca a esta clase de ítem en este mostrador. */
export function spreadOf(desk: MarketDesk, itemKind: ItemKind): Spread {
	return spreadFor({
		itemKind,
		corporation: desk.corporationKind,
		hagglingLevel: desk.hagglingLevel
	});
}

/** Los dos precios de un ítem acá, con la horquilla que los explica. */
export function quote(
	desk: MarketDesk,
	itemCode: string
): { ask: number; bid: number; spread: Spread } {
	const item = getItem(itemCode);
	const spread = spreadOf(desk, item.kind);
	return {
		ask: askPrice(item.basePrice, spread.percent),
		bid: bidPrice(item.basePrice, spread.percent),
		spread
	};
}

/** El mostrador, o el error que explica por qué no hay. */
function requireDesk(db: Db, row: Pilot): MarketDesk {
	const desk = deskFor(db, row);
	if (!desk) throw new MarketError('Hay que estar atracado en una estación para comerciar');
	return desk;
}

/** Si en este mostrador se puede vender esa clase de cosa. */
function requireSells(desk: MarketDesk, kind: ItemKind): void {
	const puede = kind === 'ore' ? desk.services.buysOre : desk.services.tradesModules;
	if (!puede) throw new MarketError(`${desk.stationName} no compra eso`);
}

/** Una cantidad que se pueda comerciar. */
function requireQuantity(quantity: number): void {
	if (!Number.isInteger(quantity)) throw new MarketError('Las unidades son enteras');
	if (quantity <= 0) throw new MarketError('Hay que mover al menos una unidad');
}

/** La bodega elegida, de las dos que el piloto tiene a mano en una estación. */
function holdId(db: Db, row: Pilot, desk: MarketDesk, where: ContainerKind): number {
	if (where === 'station') return stationContainer(db, row.id, desk.stationId).id;

	const nave = activeShip(db, row.id);
	if (!nave) throw new MarketError('No tenés nave donde llevar eso');
	return shipContainer(db, nave.id).id;
}

/**
 * Vende a la estación y cobra.
 *
 * `from` elige de cuál de las dos bodegas sale la carga, como en el
 * equipamiento: lo recién minado está a bordo, lo que se dejó guardado está en
 * tierra, y las dos se pueden vender sin tener que moverlas antes.
 */
export function sellToStation(
	db: Db,
	row: Pilot,
	itemCode: string,
	quantity: number,
	from: ContainerKind = 'ship'
): Receipt {
	const desk = requireDesk(db, row);
	const item = getItem(itemCode);
	requireSells(desk, item.kind);
	requireQuantity(quantity);

	// El precio se recalcula acá y no se acepta el que mandó la pantalla: entre
	// que se dibujó la lista y llegó este pedido pudo subir un nivel de Regateo.
	const cotizacion = quote(desk, itemCode);
	const total = bidTotal(item.basePrice, quantity, cotizacion.spread.percent);

	return db.transaction((tx) => {
		const containerId = holdId(tx, row, desk, from);
		const hay = quantityOf(tx, containerId, itemCode);
		if (hay < quantity) {
			throw new MarketError(`No tenés tanto: hay ${hay} y querés vender ${quantity}.`);
		}

		moveItem(tx, containerId, itemCode, -quantity, 'sold');
		const entry = credit(tx, row.id, total, {
			kind: item.kind === 'ore' ? 'ore_sale' : 'module_sale',
			bodyId: desk.bodyId,
			memo: `${quantity} × ${item.name}`
		});

		return {
			itemCode,
			itemName: item.name,
			quantity,
			unitPrice: cotizacion.bid,
			total,
			balance: entry.balanceAfter
		};
	});
}

/**
 * Compra a la estación y paga.
 *
 * **Sólo módulos.** La estación no revende mineral: lo compra para procesarlo, y
 * un mostrador que lo devolviera al catálogo convertiría el circuito minero en
 * un botón que se aprieta sin salir del hangar.
 */
export function buyFromStation(db: Db, row: Pilot, itemCode: string, quantity: number): Receipt {
	const desk = requireDesk(db, row);
	const item = getItem(itemCode);
	if (item.kind !== 'module') throw new MarketError(`${desk.stationName} no vende eso`);
	if (!desk.services.tradesModules) throw new MarketError(`${desk.stationName} no tiene mercado`);
	requireQuantity(quantity);

	const cotizacion = quote(desk, itemCode);
	const total = askTotal(item.basePrice, quantity, cotizacion.spread.percent);

	return db.transaction((tx) => {
		// El débito va primero: si no alcanza la plata, falla antes de haber tocado
		// la bodega y el mensaje que sale es el de la billetera, que es el que el
		// jugador necesita leer.
		const entry = debit(tx, row.id, total, {
			kind: 'module_purchase',
			bodyId: desk.bodyId,
			memo: `${quantity} × ${item.name}`
		});

		moveItem(tx, stationContainer(tx, row.id, desk.stationId).id, itemCode, quantity, 'bought');

		return {
			itemCode,
			itemName: item.name,
			quantity,
			unitPrice: cotizacion.ask,
			total,
			balance: entry.balanceAfter
		};
	});
}
