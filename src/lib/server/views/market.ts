/**
 * El mercado de la región, listo para dibujar.
 *
 * La forma es la del mercado de EVE: un **árbol de categorías** para examinar y,
 * al elegir un ítem, **sus dos libros de órdenes** —quién vende y quién compra—
 * con el historial de precios al lado. Es la única forma que aguanta un catálogo
 * de cientos de módulos y un libro de miles de órdenes.
 *
 * Esta vista arma **la lista**: un renglón por ítem con lo mínimo para decidir si
 * vale abrirlo —el mejor precio de cada lado y cuántas órdenes hay—. El libro
 * entero de un ítem se pide aparte, al abrirlo: traer las órdenes de los
 * cincuenta y un ítems para dibujar una lista sería pedir miles de filas de las
 * que se miran dos.
 *
 * **El mercado se ve desde cualquier parte, pero operar exige un mostrador.** El
 * catálogo y los precios son información y viajan siempre; comprar, vender o
 * publicar necesitan estar atracado en una estación con el módulo Mercado. Por
 * eso la vista trae `canTradeHere` y, cuando no se puede, la razón escrita.
 *
 * **Y es regional.** Se ve lo que hay en las regiones al alcance, y cuántas son
 * depende de Análisis de mercado. Que no sea global es lo que le da geografía
 * económica a la galaxia: si el hierro valiera lo mismo en todas partes, moverlo
 * no sería un oficio.
 */

import { alias } from 'drizzle-orm/sqlite-core';
import { and, eq, inArray, sql } from 'drizzle-orm';
import {
	body,
	constellation,
	container,
	corporation,
	marketOrder,
	region,
	station,
	stationService,
	system,
	type Pilot
} from '../db/schema';
import type { Db } from '../db/types';
import { cargoHold, shipContainer, stacks } from '../services/containers';
import { deskFor, spreadOf, type MarketDesk } from '../services/market';
import { aliveNow, ordersOf, tradingContext } from '../services/orders';
import { activeShip, pilotSkillLevels, shipReadout } from '../services/ships';
import { situation } from '../services/status';
import { balance } from '../services/wallet';
import { MODULES, type ShipModule } from '$lib/game/modules';
import { ORE_LIST, getItem, type Item } from '$lib/game/items';
import { SLOT_KINDS, type SlotKind } from '$lib/game/hulls';
import { HAGGLING_SKILL, askPrice, bidPrice, durationsFor, spreadFor } from '$lib/game/market';
import {
	cubicMeters,
	itemIcon,
	itemKindLabel,
	moduleIcon,
	slotKindIcon,
	slotKindLabel,
	thousands
} from '$lib/format';
import type { OrderKind } from '$lib/game/market';
import type { CorporationKind } from '$lib/game/universe';
import type {
	FilaMercado,
	GrupoMercado,
	Horquilla,
	LugarOrden,
	Mercado,
	MisOrdenes,
	OrdenPropia
} from '$lib/tipos';

/** Las tres ramas de primer nivel del árbol. */
export const GROUP_HELD = 'held';
export const GROUP_ORE = 'ore';
export const GROUP_MODULE = 'module';

/** Una horquilla apagada, para cuando no hay mostrador a mano. */
const SIN_HORQUILLA: Horquilla = {
	percent: 0,
	base: 0,
	corporationEdge: 0,
	haggling: 0,
	atFloor: false
};

/** Una estación con mostrador, dentro del alcance del piloto. */
export interface MarketStation {
	readonly stationId: number;
	readonly bodyId: number;
	readonly name: string;
	/** El cuerpo que orbita: el planeta, la luna o el cinturón donde está amarrada. */
	readonly parentName: string;
	readonly systemName: string;
	readonly regionName: string;
	/** A qué se dedica quien atiende: es lo que le da su ventaja a la horquilla. */
	readonly corporationKind: CorporationKind | null;
}

/**
 * Las estaciones con mercado que el piloto alcanza a ver.
 *
 * **Hace falta el módulo Mercado**: una estación sin mostrador no aparece en
 * ningún libro y nadie puede publicar ahí.
 *
 * Hoy la galaxia tiene una sola región, así que el alcance todavía no recorta
 * nada. La consulta ya está escrita para filtrar por región, de modo que cuando
 * haya varias sólo hay que agregarle el `where` y nada más se entera.
 */
export function marketStations(db: Db): readonly MarketStation[] {
	// El cuerpo que la estación orbita sale de una segunda vuelta sobre la misma
	// tabla: los cuerpos son un árbol, y el padre de una estación es el planeta,
	// la luna o el cinturón donde está amarrada.
	const orbita = alias(body, 'orbita');

	return db
		.select({
			stationId: station.id,
			bodyId: body.id,
			name: body.name,
			parentName: orbita.name,
			systemName: system.name,
			regionName: region.name,
			corporationKind: corporation.kind
		})
		.from(stationService)
		.innerJoin(station, eq(station.id, stationService.stationId))
		.innerJoin(corporation, eq(corporation.id, station.corporationId))
		.innerJoin(body, eq(body.id, station.bodyId))
		.leftJoin(orbita, eq(orbita.id, body.parentId))
		.innerJoin(system, eq(system.id, body.systemId))
		.innerJoin(constellation, eq(constellation.id, system.constellationId))
		.innerJoin(region, eq(region.id, constellation.regionId))
		.where(eq(stationService.service, 'market'))
		.all()
		.map((fila) => ({
			stationId: fila.stationId,
			bodyId: fila.bodyId,
			name: fila.name,
			parentName: fila.parentName ?? '',
			systemName: fila.systemName,
			regionName: fila.regionName,
			corporationKind: fila.corporationKind
		}));
}

/** El mejor precio de cada lado, **dónde está** y cuántas órdenes hay. */
interface BookSummary {
	bestAsk: number | null;
	bestAskStation: number | null;
	bestBid: number | null;
	bestBidStation: number | null;
	sellOrders: number;
	buyOrders: number;
}

/** Un resumen vacío, para el ítem que todavía no tiene libro. */
function emptySummary(): BookSummary {
	return {
		bestAsk: null,
		bestAskStation: null,
		bestBid: null,
		bestBidStation: null,
		sellOrders: 0,
		buyOrders: 0
	};
}

/**
 * Resume el libro de todos los ítems de una vez.
 *
 * Dos consultas agrupadas y no una por renglón: con cincuenta y un ítems ya
 * serían cincuenta y una consultas para dibujar una lista, y con seiscientos
 * módulos la pantalla dejaría de abrir.
 *
 * Son **dos y no una** porque cada lado busca un extremo distinto —el más barato
 * del que vende, el que más paga del que compra— y hace falta saber de qué fila
 * salió cada uno para poder decir dónde está. SQLite devuelve las columnas sueltas
 * de la fila que ganó el `min`/`max` cuando es el único agregado de ese tipo, que
 * es exactamente lo que se necesita acá.
 */
function summarize(db: Db, stationIds: readonly number[]): Map<string, BookSummary> {
	const resumen = new Map<string, BookSummary>();
	if (stationIds.length === 0) return resumen;

	const lado = (kind: OrderKind, extremo: 'min' | 'max') =>
		db
			.select({
				itemCode: marketOrder.itemCode,
				price:
					extremo === 'min'
						? sql<number>`min(${marketOrder.price})`
						: sql<number>`max(${marketOrder.price})`,
				stationId: marketOrder.stationId,
				orders: sql<number>`count(*)`
			})
			.from(marketOrder)
			.where(
				and(inArray(marketOrder.stationId, [...stationIds]), eq(marketOrder.kind, kind), aliveNow())
			)
			.groupBy(marketOrder.itemCode)
			.all();

	for (const fila of lado('sell', 'min')) {
		const actual = resumen.get(fila.itemCode) ?? emptySummary();
		actual.bestAsk = fila.price;
		actual.bestAskStation = fila.stationId;
		actual.sellOrders = fila.orders;
		resumen.set(fila.itemCode, actual);
	}

	for (const fila of lado('buy', 'max')) {
		const actual = resumen.get(fila.itemCode) ?? emptySummary();
		actual.bestBid = fila.price;
		actual.bestBidStation = fila.stationId;
		actual.buyOrders = fila.orders;
		resumen.set(fila.itemCode, actual);
	}

	return resumen;
}

/** Cuánto tiene el piloto de cada cosa, sumando todas sus bodegas. */
function holdings(db: Db, row: Pilot): Map<string, number> {
	const total = new Map<string, number>();

	const bodegas = db
		.select({ id: container.id })
		.from(container)
		.where(eq(container.pilotId, row.id))
		.all();
	const nave = activeShip(db, row.id);
	if (nave) bodegas.push({ id: shipContainer(db, nave.id).id });

	for (const bodega of bodegas) {
		for (const stack of stacks(db, bodega.id)) {
			total.set(stack.itemCode, (total.get(stack.itemCode) ?? 0) + stack.quantity);
		}
	}

	return total;
}

/** La horquilla desarmada, como la dibuja la figura de la ventana del ítem. */
function horquilla(desk: MarketDesk | null, kind: 'ore' | 'module'): Horquilla {
	if (!desk?.services.trades) return SIN_HORQUILLA;
	const spread = spreadOf(desk, kind);
	return {
		percent: spread.percent,
		base: spread.base,
		corporationEdge: spread.corporationEdge,
		haggling: spread.haggling,
		atFloor: spread.atFloor
	};
}

/** El menor de unos precios, salteando los que no existen. */
function best(prices: readonly (number | null | undefined)[], pick: 'min' | 'max'): number | null {
	const hay = prices.filter((price): price is number => typeof price === 'number');
	if (hay.length === 0) return null;
	return pick === 'min' ? Math.min(...hay) : Math.max(...hay);
}

/**
 * Cuántos saltos hay hasta una estación, escrito para leer.
 *
 * Hoy la galaxia tiene **un solo sistema**, así que nunca hay saltos: lo único
 * que distingue una estación de otra es si es la que uno tiene debajo de los
 * pies. La columna existe igual, reservada, porque el día que haya puertas el
 * número entra acá y ninguna otra cosa se entera —que es justamente por qué
 * conviene que exista antes de hacer falta—.
 */
function jumpsLabel(stationId: number | null, dockedAt: number | null): string {
	if (stationId === null) return '';
	if (stationId === dockedAt) return 'Acá';
	return '0';
}

/**
 * Dónde está una estación, desarmado.
 *
 * Va en pedazos y no como una cadena armada porque la tabla muestra **sólo el
 * nombre** —una designación entera en cada renglón empuja las cifras fuera de la
 * pantalla— y el camino completo aparece al señalarlo. Armarlo acá obligaría a
 * partirlo de nuevo del otro lado.
 */
function placeOfStation(station: MarketStation | undefined, jumps: string): LugarOrden | null {
	if (!station) return null;
	return {
		station: station.name,
		orbits: station.parentName,
		system: station.systemName,
		region: station.regionName,
		jumps
	};
}

/**
 * La banda que ponen las estaciones para un ítem.
 *
 * **Se mira en todas las que el piloto alcanza**, y no sólo en la que está
 * amarrado. El mercado se lee desde cualquier parte —ésa es la decisión que lo
 * hace un mercado y no un mostrador—, así que esconder el precio de la estación
 * mientras uno está parado en un cinturón diría que no hay nada que comprar ni
 * quién compre, justo cuando hay que decidir adónde volver.
 *
 * Que la estación tenga el módulo Mercado sigue siendo el requisito: `stations`
 * sólo trae las que lo tienen. Lo que ya no hace falta es estar parado ahí.
 *
 * La estación **vende módulos y compra de todo**: es lo que cierra el ciclo del
 * minero —sale con lo puesto, trae mineral, lo vende y se compra el láser mejor—
 * sin depender de que otro piloto haya publicado algo.
 */
function stationBand(
	item: Item,
	hagglingLevel: number,
	stations: Map<number, MarketStation>
): {
	ask: number | null;
	askStation: number | null;
	bid: number | null;
	bidStation: number | null;
} {
	let ask: number | null = null;
	let askStation: number | null = null;
	let bid: number | null = null;
	let bidStation: number | null = null;

	for (const estacion of stations.values()) {
		const spread = spreadFor({
			itemKind: item.kind,
			corporation: estacion.corporationKind,
			hagglingLevel
		});

		// Sólo los módulos se compran en la estación: el mineral se lo vendés vos a
		// ella, no al revés.
		if (item.kind === 'module') {
			const precio = askPrice(item.basePrice, spread.percent);
			if (ask === null || precio < ask) {
				ask = precio;
				askStation = estacion.stationId;
			}
		}

		const pagan = bidPrice(item.basePrice, spread.percent);
		if (bid === null || pagan > bid) {
			bid = pagan;
			bidStation = estacion.stationId;
		}
	}

	return { ask, askStation, bid, bidStation };
}

/** Un renglón de la lista: lo mínimo para decidir si vale abrirlo. */
function line(
	item: Item,
	module: ShipModule | null,
	summary: BookSummary | undefined,
	desk: MarketDesk | null,
	hagglingLevel: number,
	held: number,
	stations: Map<number, MarketStation>
): FilaMercado {
	// El precio de la estación entra como una orden más del libro. Es la única que
	// no se agota, y la única que se negocia: del otro lado no hay otro piloto.
	const banda = stationBand(item, hagglingLevel, stations);
	const bestAsk = best([summary?.bestAsk, banda.ask], 'min');
	const bestBid = best([summary?.bestBid, banda.bid], 'max');

	// Dónde está el que gana: la estación que puso esa banda, o la de la orden que
	// la superó.
	const dondeAsk =
		bestAsk === null
			? null
			: banda.ask !== null && bestAsk === banda.ask
				? banda.askStation
				: (summary?.bestAskStation ?? null);
	const dondeBid =
		bestBid === null
			? null
			: banda.bid !== null && bestBid === banda.bid
				? banda.bidStation
				: (summary?.bestBidStation ?? null);

	return {
		itemCode: item.code,
		name: item.name,
		icon: module ? moduleIcon(module) : itemIcon(item),
		kindLabel: itemKindLabel(item.kind),
		group: module ? module.kind : GROUP_ORE,
		groupLabel: module ? slotKindLabel(module.kind) : itemKindLabel(item.kind),
		// Clase y escalón juntos, como los escribe el equipamiento: "2E".
		tier: module ? `${module.size}${module.tier}` : '',
		size: module?.size ?? 0,
		tierLetter: module?.tier ?? '',
		volume: cubicMeters(item.volumeTenths),
		summary: item.description,
		basePrice: item.basePrice,
		bestAsk,
		bestAskLabel: bestAsk === null ? '' : thousands(bestAsk),
		bestAskPlace: placeOfStation(
			stations.get(dondeAsk ?? -1),
			jumpsLabel(dondeAsk, desk?.stationId ?? null)
		),
		bestBid,
		bestBidLabel: bestBid === null ? '' : thousands(bestBid),
		bestBidPlace: placeOfStation(
			stations.get(dondeBid ?? -1),
			jumpsLabel(dondeBid, desk?.stationId ?? null)
		),
		sellOrders: summary?.sellOrders ?? 0,
		buyOrders: summary?.buyOrders ?? 0,
		held
	};
}

/** El árbol de categorías, con cuántos ítems cuelgan de cada rama. */
function buildGroups(items: readonly FilaMercado[]): GrupoMercado[] {
	const cuantos = (group: string) => items.filter((item) => item.group === group).length;

	return [
		{
			code: GROUP_HELD,
			label: 'En mi poder',
			icon: 'package',
			parent: '',
			count: items.filter((item) => item.held > 0).length
		},
		{
			code: GROUP_ORE,
			label: 'Minerales',
			icon: 'mountains',
			parent: '',
			count: cuantos(GROUP_ORE)
		},
		{
			code: GROUP_MODULE,
			label: 'Módulos',
			icon: 'squares-four',
			parent: '',
			count: items.filter((item) => item.group !== GROUP_ORE).length
		},
		...SLOT_KINDS.map((kind: SlotKind) => ({
			code: kind,
			label: slotKindLabel(kind),
			icon: slotKindIcon(kind),
			parent: GROUP_MODULE,
			count: cuantos(kind)
		}))
	];
}

/**
 * La región donde está el piloto, que es la que manda en lo que ve.
 *
 * Sale de **dónde está parado** y no de la primera estación con mercado: son lo
 * mismo mientras haya una sola región, y dejan de serlo apenas haya dos. Un
 * mercado que dice la región equivocada es peor que uno que no la dice.
 */
function placeOf(db: Db, row: Pilot): { body: string; system: string; region: string } {
	const vacio = { body: '', system: '', region: '' };
	if (!row.locationId) return vacio;

	const fila = db
		.select({ body: body.name, system: system.name, region: region.name })
		.from(body)
		.innerJoin(system, eq(system.id, body.systemId))
		.innerJoin(constellation, eq(constellation.id, system.constellationId))
		.innerJoin(region, eq(region.id, constellation.regionId))
		.where(eq(body.id, row.locationId))
		.get();
	return fila ?? vacio;
}

/** Lo que entra todavía en la bodega de la nave, en décimas. */
function freeCargo(db: Db, row: Pilot): number {
	const nave = activeShip(db, row.id);
	if (!nave) return 0;
	return cargoHold(db, shipContainer(db, nave.id).id, shipReadout(db, row)?.cargo ?? 0).freeTenths;
}

/**
 * Las órdenes propias de un lado del mostrador, para su pestaña.
 *
 * Van en su propia pantalla y no escondidas dentro de cada ítem porque la
 * pregunta "¿qué tengo puesto?" es de la mesa entera: con cincuenta y un ítems,
 * buscarlas abriendo uno por uno no es una respuesta.
 *
 * Y partidas por lado, porque **vender y comprar son dos oficios**: en una lista
 * mezclada hay que leer la etiqueta de cada renglón para saber de cuál se trata,
 * y con cincuenta órdenes eso deja de ser una lista y pasa a ser un trabajo.
 */
export function buildOrdersView(db: Db, row: Pilot, kind: OrderKind): MisOrdenes {
	const estaciones = marketStations(db);
	const todas = buildOwnOrders(db, row, estaciones);
	const mias = todas.filter((orden) => orden.kind === kind);

	return {
		kind,
		orders: mias,
		// Las del otro lado se cuentan igual: la pestaña de al lado lleva su número,
		// y así se sabe si hay trabajo allá sin ir a mirar.
		otherCount: todas.length - mias.length,
		balance: thousands(balance(db, row.id))
	};
}

function buildOwnOrders(
	db: Db,
	row: Pilot,
	stations: readonly MarketStation[]
): readonly OrdenPropia[] {
	const porId = new Map(stations.map((estacion) => [estacion.stationId, estacion]));
	const ahora = Date.now();

	return ordersOf(db, row.id).map((orden) => {
		const item = getItem(orden.itemCode);
		return {
			id: orden.id,
			kind: orden.kind,
			kindLabel: orden.kind === 'sell' ? 'Vendo' : 'Compro',
			itemCode: orden.itemCode,
			name: item.name,
			quantity: orden.quantity,
			initialQuantity: orden.initialQuantity,
			price: thousands(orden.price),
			value: thousands(orden.price * orden.quantity),
			stationName: porId.get(orden.stationId)?.name ?? '',
			// Mientras se acuerda no está en el libro, y decirlo es lo que evita que
			// el piloto la busque ahí y crea que se perdió.
			pending: orden.opensAt.getTime() > ahora,
			opensAt: orden.opensAt.getTime(),
			expiresAt: orden.expiresAt.getTime()
		};
	});
}

/** Por qué no se puede operar desde donde está el piloto, si no se puede. */
function dockedReason(desk: MarketDesk | null, inTransit: boolean): string {
	if (inTransit) return 'En viaje no se opera: hay que atracar en algún lado.';
	if (!desk) return 'Hay que estar atracado en una estación para comprar, vender o publicar.';
	if (!desk.services.trades) {
		return `${desk.stationName} no tiene módulo de Mercado: acá no se comercia.`;
	}
	return '';
}

/**
 * Todo lo que la pantalla del mercado necesita, en una sola pasada.
 *
 * El catálogo entero viaja porque son cincuenta y un ítems y caben de sobra; lo
 * que **no** viaja es el libro de cada uno, que se pide al abrirlo. El día que
 * haya seiscientos módulos, esto se pagina y la pantalla no se entera.
 */
export function buildMarketView(db: Db, row: Pilot): Mercado {
	const context = tradingContext(db, row);
	const lugar = placeOf(db, row);
	const desk = deskFor(db, row);
	const ahora = situation(db, row);
	const estaciones = marketStations(db);
	const resumen = summarize(
		db,
		estaciones.map((estacion) => estacion.stationId)
	);
	const tengo = holdings(db, row);
	const porId = new Map(estaciones.map((estacion) => [estacion.stationId, estacion]));
	// Los niveles se buscan una vez y no uno por renglón: son del piloto, no del
	// ítem, y con cincuenta ítems serían cincuenta consultas iguales. Viajan además
	// a la pantalla, que los usa para decir en cuánto está cada habilidad que mueve
	// un número de esta pantalla.
	const niveles = pilotSkillLevels(db, row.id);
	const regateo = niveles[HAGGLING_SKILL] ?? 0;

	const items = [
		...ORE_LIST.map((ore) =>
			line(
				getItem(ore.code),
				null,
				resumen.get(ore.code),
				desk,
				regateo,
				tengo.get(ore.code) ?? 0,
				porId
			)
		),
		...MODULES.filter((module) => module.code !== '').map((module) =>
			line(
				getItem(module.code),
				module,
				resumen.get(module.code),
				desk,
				regateo,
				tengo.get(module.code) ?? 0,
				porId
			)
		)
	].sort((a, b) => a.size - b.size || a.name.localeCompare(b.name) || a.tier.localeCompare(b.tier));

	return {
		regionName: lugar.region || (estaciones[0]?.regionName ?? ''),
		regionsInRange: context.regionsInRange,
		stationCount: estaciones.length,
		// Dónde está parado, que es lo único que decide dónde puede publicar y de
		// dónde puede sacar mercadería.
		pilotLevels: niveles,
		dockedAt: desk?.stationName ?? '',
		dockedStationId: desk?.services.trades ? desk.stationId : null,
		canTradeHere: desk?.services.trades ?? false,
		whyNot: dockedReason(desk, ahora.inTransit),
		balance: thousands(balance(db, row.id)),
		openBuys: context.openBuys,
		openSells: context.openSells,
		orderLimit: context.orderLimit,
		maxRange: context.maxRange,
		brokerPermille: context.brokerPermille,
		taxPermille: context.taxPermille,
		oreSpread: horquilla(desk, 'ore'),
		moduleSpread: horquilla(desk, 'module'),
		groups: buildGroups(items),
		items,
		durations: durationsFor(context.durationLevel).map((opcion) => ({
			days: opcion.days,
			label: opcion.label
		})),
		orders: buildOwnOrders(db, row, estaciones),
		cargoFree: cubicMeters(freeCargo(db, row))
	};
}
