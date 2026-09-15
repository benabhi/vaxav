/**
 * El libro de órdenes de **un** ítem, listo para dibujar.
 *
 * Se arma aparte del catálogo y se pide al abrir la ventana del ítem: traer las
 * órdenes de los cincuenta y un renglones para dibujar una lista sería pedir
 * miles de filas de las que se miran dos.
 *
 * Las dos tablas son las de EVE —vendedores arriba, compradores abajo— y llevan
 * las mismas columnas: cuánto hay, a cuánto, dónde y a qué distancia. La orden de
 * la estación entra como una fila más, marcada: es la única que no se agota y la
 * única que se negocia, porque del otro lado no hay otro piloto.
 */

import { and, eq, inArray } from 'drizzle-orm';
import { marketOrder, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { quantityOf, shipContainer, stationContainer } from '../services/containers';
import { deskFor, quote } from '../services/market';
import { bodyDistance } from '../services/universe';
import { activeShip } from '../services/ships';
import { priceHistory } from '../services/trades';
import { aliveNow } from '../services/orders';
import { marketStations } from './market';
import { getItem } from '$lib/game/items';
import { thousands } from '$lib/format';
import type { LibroMercado, OrdenMercado } from '$lib/tipos';

/** Una orden de jugador, lista para dibujar. */
function playerRow(
	order: typeof marketOrder.$inferSelect,
	place: {
		name: string;
		parentName: string;
		systemName: string;
		regionName: string;
		bodyId: number;
	},
	distance: number,
	mine: boolean
): OrdenMercado {
	return {
		id: order.id,
		npc: false,
		mine,
		quantity: order.quantity,
		quantityLabel: thousands(order.quantity),
		price: order.price,
		priceLabel: thousands(order.price),
		stationId: order.stationId,
		stationName: place.name,
		place: {
			station: place.name,
			orbits: place.parentName,
			system: place.systemName,
			region: place.regionName,
			jumps: distance === 0 ? 'Acá' : '0'
		},
		systemName: place.systemName,
		distance,
		distanceLabel: distance === 0 ? 'Acá' : `${thousands(distance)} ud`,
		// Cero es "vení hasta este mostrador"; de ahí para arriba, regiones.
		rangeLabel:
			order.kind === 'buy'
				? order.rangeRegions === 0
					? 'Estación'
					: `${order.rangeRegions} reg.`
				: ''
	};
}

/**
 * Los dos libros de un ítem, el historial y lo que el piloto tiene a mano.
 *
 * Todo en una pasada porque la ventana los muestra juntos: comprar sin ver a
 * cuánto se está pagando del otro lado es la mitad de la información.
 */
export function buildBookView(db: Db, row: Pilot, itemCode: string): LibroMercado {
	const item = getItem(itemCode);
	const desk = deskFor(db, row);
	const estaciones = marketStations(db);
	const porId = new Map(estaciones.map((estacion) => [estacion.stationId, estacion]));

	/** Cuán lejos está cada estación del piloto, calculado una vez por estación. */
	const distancias = new Map<number, number>();
	for (const estacion of estaciones) {
		distancias.set(
			estacion.stationId,
			row.locationId ? bodyDistance(db, row.locationId, estacion.bodyId) : 0
		);
	}

	const ordenes = db
		.select()
		.from(marketOrder)
		.where(
			and(
				eq(marketOrder.itemCode, itemCode),
				inArray(marketOrder.stationId, [...porId.keys()]),
				// Una orden que todavía se está acordando o que ya venció no está en el
				// libro: mostrarla sería ofrecer un trato que nadie puede tomar.
				aliveNow()
			)
		)
		.all();

	const deJugadores = (kind: 'sell' | 'buy') =>
		ordenes
			.filter((orden) => orden.kind === kind)
			.map((orden) =>
				playerRow(
					orden,
					porId.get(orden.stationId)!,
					distancias.get(orden.stationId) ?? 0,
					orden.pilotId === row.id
				)
			);

	// La orden de la estación donde está parado el piloto. No hay de las otras:
	// su precio se negocia en el mostrador, y a distancia no se negocia nada.
	const cotizacion = desk?.services.trades ? quote(desk, itemCode) : null;
	const estacionRow = (kind: 'sell' | 'buy'): OrdenMercado[] => {
		if (!cotizacion || !desk) return [];
		if (kind === 'sell' && item.kind !== 'module') return [];
		return [
			{
				id: null,
				npc: true,
				mine: false,
				quantity: null,
				quantityLabel: 'Sin tope',
				price: kind === 'sell' ? cotizacion.ask : cotizacion.bid,
				priceLabel: thousands(kind === 'sell' ? cotizacion.ask : cotizacion.bid),
				stationId: desk.stationId,
				stationName: desk.stationName,
				systemName: '',
				place: {
					station: desk.stationName,
					orbits: porId.get(desk.stationId)?.parentName ?? '',
					system: porId.get(desk.stationId)?.systemName ?? '',
					region: porId.get(desk.stationId)?.regionName ?? '',
					jumps: 'Acá'
				},
				distance: 0,
				distanceLabel: 'Acá',
				rangeLabel: kind === 'buy' ? 'Estación' : ''
			}
		];
	};

	// Vendedores del más barato al más caro, compradores del que más paga al que
	// menos: en los dos casos, lo mejor para quien mira arriba de todo.
	const sellers = [...estacionRow('sell'), ...deJugadores('sell')].sort(
		(a, b) => a.price - b.price || a.distance - b.distance
	);
	const buyers = [...estacionRow('buy'), ...deJugadores('buy')].sort(
		(a, b) => b.price - a.price || a.distance - b.distance
	);

	const nave = activeShip(db, row.id);
	const inShip = nave ? quantityOf(db, shipContainer(db, nave.id).id, itemCode) : 0;
	const inStation = desk
		? quantityOf(db, stationContainer(db, row.id, desk.stationId).id, itemCode)
		: 0;

	return {
		itemCode,
		name: item.name,
		sellers,
		buyers,
		history: priceHistory(db, itemCode),
		inShip,
		inStation
	};
}
