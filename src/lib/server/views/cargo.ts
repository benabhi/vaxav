/**
 * La bodega de la nave, lista para dibujar.
 *
 * La pregunta de una bodega nunca es cuánto llevás: es **cuánto más entra**, y
 * por eso lo ocupado viaja siempre con el tope y con lo que queda libre. En un
 * juego donde la capacidad limitada es el pilar —todo lo que se lleva obliga a
 * dejar otra cosa—, un número suelto no alcanza para decidir nada.
 *
 * El valor de referencia también va: saber que la bodega tiene 480 créditos
 * adentro es lo que convierte "está llena" en "conviene volver".
 */

import { eq } from 'drizzle-orm';
import { ship, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { cargoHold, shipContainer, type CargoHold } from '../services/containers';
import { shipReadout } from '../services/ships';
import { baseValueOf, getItem } from '$lib/game/items';
import { roundHalfEven } from '$lib/game/math';
import { cubicMeters, itemIcon, itemKindLabel, thousands } from '$lib/format';
import type { Bodega, FilaCarga } from '$lib/tipos';

/** Una bodega sin nave: el piloto todavía no tiene dónde guardar nada. */
const SIN_NAVE: Bodega = {
	shipName: '',
	lines: [],
	used: '0,0',
	capacity: '0,0',
	free: '0,0',
	percent: 0,
	totalValue: '0'
};

/** Pasa lo que hay en una bodega a filas dibujables. */
function buildLines(hold: CargoHold): FilaCarga[] {
	return (
		hold.lines
			.map((line) => {
				const item = getItem(line.itemCode);
				return {
					itemCode: line.itemCode,
					name: item.name,
					kindLabel: itemKindLabel(item.kind),
					icon: itemIcon(item),
					quantity: line.quantity,
					volume: cubicMeters(line.volumeTenths),
					// Cuánto de lo ocupado se lleva este montón. Compara contra lo cargado
					// y no contra el tope: con la bodega a medio llenar, todas las barras
					// serían igual de cortas y no se distinguiría qué la está llenando.
					share:
						hold.usedTenths > 0 ? roundHalfEven((line.volumeTenths * 100) / hold.usedTenths) : 0,
					value: thousands(baseValueOf(line.itemCode, line.quantity))
				};
			})
			// De lo que más ocupa a lo que menos: es el orden en que uno decide qué
			// tirar cuando no entra algo.
			.sort((a, b) => b.share - a.share || a.name.localeCompare(b.name))
	);
}

/** Todo lo que la pestaña Bodega necesita, en una sola pasada. */
export function buildCargoView(db: Db, row: Pilot): Bodega {
	const nave = db.select().from(ship).where(eq(ship.pilotId, row.id)).get();
	if (!nave) return SIN_NAVE;

	// La capacidad sale de la hoja de rendimiento y no del casco: los módulos de
	// bodega y el bono de Ingeniería de bodega también cuentan, y tienen que
	// contar igual acá que en la ficha de la nave.
	const readout = shipReadout(db, row);
	const capacidad = readout?.cargo ?? 0;
	const hold = cargoHold(db, shipContainer(db, nave.id).id, capacidad);

	const lines = buildLines(hold);

	return {
		shipName: nave.name || readout?.hull.name || '',
		lines,
		used: cubicMeters(hold.usedTenths),
		capacity: cubicMeters(hold.capacityTenths),
		free: cubicMeters(hold.freeTenths),
		percent:
			hold.capacityTenths > 0
				? Math.min(100, roundHalfEven((hold.usedTenths * 100) / hold.capacityTenths))
				: 0,
		totalValue: thousands(
			hold.lines.reduce((total, line) => total + baseValueOf(line.itemCode, line.quantity), 0)
		)
	};
}
