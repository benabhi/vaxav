/**
 * De dónde sale un módulo: la bodega de la nave, o la estación donde estás.
 *
 * Sin esto, la pantalla de equipamiento ofrece el catálogo entero como si los
 * módulos no fueran de nadie ni estuvieran en ningún lado. **Un módulo tiene que
 * estar en algún lugar para poder montarlo**, y ese lugar cambia según dónde
 * esté parado el piloto.
 *
 * Qué surte una estación no es una tabla nueva: sale de **sus propios módulos**.
 * Una estación ofrece equipamiento si y sólo si tiene el módulo Equipamiento.
 * Puerto Ánfora, el Muelle, Talo y el Amarre Franco lo tienen; la Planta
 * Escarcha no, así que ahí no se puede reconfigurar la nave. Es una regla de una
 * línea que hace que el mapa importe, con datos que ya existen.
 *
 * Reglas puras: acá no hay base de datos ni piloto. Corresponde a
 * docs/systems/SHIPS.md.
 */

import type { CoreSystem, SlotKind } from './hulls';
import { type ShipModule, modulesForSlot } from './modules';
import type { StationServiceKind } from './universe';

/** Dónde está un módulo que se puede montar. */
export const MODULE_SOURCES = [
	/** Lo traés puesto: viaja con la nave y lo tenés en cualquier lado. */
	'cargo',
	/** Lo tiene la estación donde estás atracado. Si te vas, se queda. */
	'station'
] as const;

export type ModuleSource = (typeof MODULE_SOURCES)[number];

/** Un módulo que se puede montar ahora mismo, y de dónde sale. */
export interface Available {
	readonly module: ShipModule;
	readonly source: ModuleSource;
}

/**
 * El módulo de estación que habilita reconfigurar una nave. Sin él, la estación
 * es un lugar donde atracar y nada más.
 */
export const OUTFITTING: StationServiceKind = 'outfitting';

/**
 * ¿Esta estación surte equipamiento?
 *
 * Se pregunta por el módulo de Equipamiento y no por el Astillero: el astillero
 * vende cascos, el equipamiento es el que monta y desmonta piezas. Es la misma
 * división que hacen los dos juegos que se imitan.
 */
export function stationStocksModules(services: Iterable<StationServiceKind>): boolean {
	return [...services].includes(OUTFITTING);
}

/**
 * Qué se le puede montar a una ranura, acá y ahora.
 *
 * Primero lo que está en la bodega —lo que traés puesto se usa antes que lo que
 * hay que conseguir— y después lo de la estación. Un módulo que está en los dos
 * lugares aparece una sola vez, como de la bodega: es el que realmente se va a
 * usar.
 *
 * Sin estación que surta y sin nada en bodega, la lista sale vacía. Eso **no es
 * un error**: es lo que significa estar atracado en un puesto de hielo.
 */
export function availableForSlot(
	kind: SlotKind,
	size: number,
	core: CoreSystem | null,
	stationServices: Iterable<StationServiceKind> = [],
	cargo: Iterable<ShipModule> = []
): readonly Available[] {
	const fit = modulesForSlot(kind, size, core);
	const fitCodes = new Set(fit.map((module) => module.code));

	const available: Available[] = [];
	const seen = new Set<string>();

	for (const module of cargo) {
		if (fitCodes.has(module.code) && !seen.has(module.code)) {
			available.push({ module, source: 'cargo' });
			seen.add(module.code);
		}
	}

	if (stationStocksModules(stationServices)) {
		for (const module of fit) {
			if (!seen.has(module.code)) {
				available.push({ module, source: 'station' });
				seen.add(module.code);
			}
		}
	}

	return available;
}
