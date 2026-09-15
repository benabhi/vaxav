/**
 * Las propiedades del piloto, listas para dibujar.
 *
 * La pregunta que contesta esta pantalla no es "qué tengo" sino **"qué tengo y
 * dónde"**, y por eso viaja agrupada por lugar y no como una lista de ítems. Con
 * una lista plana, doscientas unidades de hierro repartidas en cuatro estaciones
 * se ven como doscientas unidades de hierro, y lo que hay que decidir es a cuál
 * de las cuatro conviene ir.
 *
 * Cada lugar lleva **su valor de referencia**: es lo que convierte "tengo cosas
 * en el Muelle" en "tengo catorce mil créditos parados en el Muelle", que es una
 * frase que hace actuar.
 */

import { eq } from 'drizzle-orm';
import { body, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { assetsOf, type AssetLine, type AssetPlace } from '../services/assets';
import { baseValueOf, getItem } from '$lib/game/items';
import { getModule } from '$lib/game/modules';
import { roundHalfEven } from '$lib/game/math';
import { cubicMeters, itemIcon, itemKindLabel, moduleIcon, thousands } from '$lib/format';
import type { FilaPropiedad, LugarPropiedad, Propiedades } from '$lib/tipos';

/** Lo que valen unos renglones a precio de referencia. */
function valueOf(lines: readonly AssetLine[]): number {
	return lines.reduce((total, line) => total + baseValueOf(line.itemCode, line.quantity), 0);
}

/** Un montón, listo para dibujar. */
function buildLine(line: AssetLine, listed: boolean): FilaPropiedad {
	const item = getItem(line.itemCode);
	return {
		itemCode: line.itemCode,
		name: item.name,
		icon: item.kind === 'module' ? moduleIcon(getModule(line.itemCode)) : itemIcon(item),
		kindLabel: itemKindLabel(item.kind),
		quantity: line.quantity,
		volume: cubicMeters(line.volumeTenths),
		value: thousands(baseValueOf(line.itemCode, line.quantity)),
		listed
	};
}

/** Un lugar con todo lo que hay en él, ordenado por lo que más vale. */
function buildPlace(place: AssetPlace, hereBodyId: number | null): LugarPropiedad {
	const lines = [
		...place.lines.map((line) => buildLine(line, false)),
		// Lo publicado va al final y marcado: sigue siendo del piloto, pero no lo
		// puede tocar sin cancelar la orden.
		...place.listed.map((line) => buildLine(line, true))
	].sort((a, b) => Number(a.listed) - Number(b.listed) || b.quantity - a.quantity);

	const total = valueOf(place.lines) + valueOf(place.listed);

	return {
		key: `${place.kind}-${place.containerId}`,
		kind: place.kind,
		name: place.name,
		// El lugar completo en una línea: sin la región, "Muelle de los Anillos" no
		// dice a cuántos saltos está de donde uno se encuentra.
		where: place.kind === 'ship' ? 'Con vos' : `${place.systemName} · ${place.regionName}`,
		bodyId: place.bodyId,
		lines,
		used: cubicMeters(place.usedTenths),
		capacity: place.capacityTenths > 0 ? cubicMeters(place.capacityTenths) : '',
		percent:
			place.capacityTenths > 0
				? Math.min(100, roundHalfEven((place.usedTenths * 100) / place.capacityTenths))
				: 0,
		value: thousands(total),
		valueRaw: total,
		here: place.bodyId !== null && place.bodyId === hereBodyId,
		listedCount: place.listed.length
	};
}

/** Todo lo que la pantalla de Propiedades necesita, en una sola pasada. */
export function buildAssetsView(db: Db, row: Pilot): Propiedades {
	const aqui = row.locationId
		? (db.select().from(body).where(eq(body.id, row.locationId)).get()?.id ?? null)
		: null;

	const places = assetsOf(db, row).map((place) => buildPlace(place, aqui));
	const total = places.reduce((suma, place) => suma + place.valueRaw, 0);

	return {
		places,
		totalValue: thousands(total),
		// Se cuentan los lugares con algo adentro: la nave vacía sale igual, pero
		// "tenés cosas en 1 lugar" cuando ese lugar está vacío sería mentira.
		placeCount: places.filter((place) => place.lines.length > 0).length
	};
}
