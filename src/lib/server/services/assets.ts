/**
 * Dónde está todo lo que el piloto tiene, en toda la galaxia.
 *
 * Nace de una regla del mercado: **lo comprado queda en la estación de la
 * orden**. Eso le da consecuencias económicas al mapa —un precio bueno a cuatro
 * sistemas es un precio bueno más un viaje— pero también reparte las cosas de uno
 * por lugares que después hay que poder encontrar. Sin esta pantalla, comprar
 * lejos sería una forma elegante de perder la compra.
 *
 * Lo publicado en una orden de venta **también es propiedad**, aunque no esté en
 * ninguna bodega: salió del inventario para quedar en garantía, y sigue siendo
 * del piloto hasta que alguien la compre. Que no aparezca en ningún lado sería la
 * peor clase de error, el que parece un robo.
 */

import { eq } from 'drizzle-orm';
import {
	body,
	constellation,
	container,
	marketOrder,
	region,
	ship,
	station,
	system,
	type Pilot
} from '../db/schema';
import type { Db } from '../db/types';
import { shipContainer, stacks } from './containers';
import { activeShip, shipReadout } from './ships';
import { capacityTenths, volumeOf } from '$lib/game/items';

/** Un montón de algo, en algún lugar. */
export interface AssetLine {
	readonly itemCode: string;
	readonly quantity: number;
	readonly volumeTenths: number;
}

/** Un lugar donde el piloto tiene cosas. */
export interface AssetPlace {
	readonly containerId: number;
	readonly kind: 'ship' | 'station';
	/** El nombre de la nave, o el del cuerpo donde está la estación. */
	readonly name: string;
	readonly systemName: string;
	readonly regionName: string;
	/** A dónde hay que viajar para tocar esto. Nulo en la bodega de la nave. */
	readonly bodyId: number | null;
	readonly stationId: number | null;
	readonly lines: readonly AssetLine[];
	/** Lo que está publicado en una orden de venta acá. */
	readonly listed: readonly AssetLine[];
	readonly usedTenths: number;
	/** El tope, sólo en la nave: una estación no cobra por metro cúbico todavía. */
	readonly capacityTenths: number;
}

/** Pasa los montones de una bodega a renglones con su volumen. */
function linesOf(db: Db, containerId: number): AssetLine[] {
	return stacks(db, containerId).map((stack) => ({
		itemCode: stack.itemCode,
		quantity: stack.quantity,
		volumeTenths: volumeOf(stack.itemCode, stack.quantity)
	}));
}

/** Lo que el piloto tiene publicado en cada estación, por bodega de estación. */
function listedByStation(db: Db, pilotId: number): Map<number, AssetLine[]> {
	const porEstacion = new Map<number, AssetLine[]>();

	for (const orden of db.select().from(marketOrder).where(eq(marketOrder.pilotId, pilotId)).all()) {
		if (orden.kind !== 'sell') continue;
		const renglones = porEstacion.get(orden.stationId) ?? [];
		renglones.push({
			itemCode: orden.itemCode,
			quantity: orden.quantity,
			volumeTenths: volumeOf(orden.itemCode, orden.quantity)
		});
		porEstacion.set(orden.stationId, renglones);
	}

	return porEstacion;
}

/** Lo que suman unos renglones. */
function volumeOfLines(lines: readonly AssetLine[]): number {
	return lines.reduce((total, line) => total + line.volumeTenths, 0);
}

/**
 * Todo lo del piloto, lugar por lugar.
 *
 * Los lugares vacíos **no salen**: una estación donde alguna vez se guardó algo
 * deja su bodega creada para siempre, y una lista con veinte renglones en cero
 * esconde los tres que importan. Salvo la nave, que sale siempre: estar vacía es
 * información.
 */
export function assetsOf(db: Db, row: Pilot): readonly AssetPlace[] {
	const publicado = listedByStation(db, row.id);
	const lugares: AssetPlace[] = [];

	const nave = activeShip(db, row.id);
	if (nave) {
		const bodega = shipContainer(db, nave.id);
		const lines = linesOf(db, bodega.id);
		const naveRow = db.select().from(ship).where(eq(ship.id, nave.id)).get();
		const readout = shipReadout(db, row);
		lugares.push({
			containerId: bodega.id,
			kind: 'ship',
			// Sin nombre propio se la llama por su casco, igual que en la bodega: una
			// nave se reconoce por lo que es antes que por cómo la bautizaron.
			name: naveRow?.name || readout?.hull.name || 'Tu nave',
			systemName: '',
			regionName: '',
			bodyId: null,
			stationId: null,
			lines,
			listed: [],
			usedTenths: volumeOfLines(lines),
			capacityTenths: capacityTenths(readout?.cargo ?? 0)
		});
	}

	// Las bodegas de estación, con el lugar entero resuelto en una sola consulta:
	// preguntar cuerpo, sistema, constelación y región por separado sería cuatro
	// viajes por cada estación donde el piloto alguna vez dejó algo.
	const enTierra = db
		.select({
			containerId: container.id,
			stationId: station.id,
			bodyId: body.id,
			bodyName: body.name,
			systemName: system.name,
			regionName: region.name
		})
		.from(container)
		.innerJoin(station, eq(station.id, container.stationId))
		.innerJoin(body, eq(body.id, station.bodyId))
		.innerJoin(system, eq(system.id, body.systemId))
		.innerJoin(constellation, eq(constellation.id, system.constellationId))
		.innerJoin(region, eq(region.id, constellation.regionId))
		.where(eq(container.pilotId, row.id))
		.all();

	for (const lugar of enTierra) {
		const lines = linesOf(db, lugar.containerId);
		const listed = publicado.get(lugar.stationId) ?? [];
		if (lines.length === 0 && listed.length === 0) continue;

		lugares.push({
			containerId: lugar.containerId,
			kind: 'station',
			name: lugar.bodyName,
			systemName: lugar.systemName,
			regionName: lugar.regionName,
			bodyId: lugar.bodyId,
			stationId: lugar.stationId,
			lines,
			listed,
			usedTenths: volumeOfLines(lines) + volumeOfLines(listed),
			capacityTenths: 0
		});
	}

	// La nave primero —es lo que uno lleva encima— y después las estaciones por
	// nombre, para que la lista no cambie de orden entre dos cargas.
	return lugares.sort((a, b) => {
		if (a.kind !== b.kind) return a.kind === 'ship' ? -1 : 1;
		return a.name.localeCompare(b.name);
	});
}
