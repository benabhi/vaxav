/**
 * El anillo de equipamiento, resuelto para dibujar.
 *
 * Vive en `$lib` y no bajo `server/` porque lo necesitan los dos lados: el
 * servidor manda el casco y qué hay montado —que es lo único que sale de la
 * base— y la pantalla arma con eso las ranuras, sus posiciones y la lista que
 * las acompaña. Son funciones puras sobre datos ya leídos, así que se prueban
 * como las reglas del juego.
 */

import { getHull, type CoreSystem, type Hull, type SlotKind } from '$lib/game/hulls';
import { fitFromCodes } from '$lib/game/fitting';
import type { ShipModule } from '$lib/game/modules';
import { coreSystemLabel, moduleIcon, slotKindIcon, slotKindLabel } from '$lib/format';
import type { FilaRanura, GrupoRanuras } from '$lib/tipos';

/**
 * Radio del anillo de ranuras, en porcentaje del lado del cuadro. Deja aire
 * para que una baldosa no se salga por el borde.
 */
export const RING_RADIUS = 39;

/**
 * En qué orden se recorre el anillo. Los esenciales van últimos y por eso caen
 * abajo: son los que menos se tocan.
 */
export const RING_ORDER: readonly SlotKind[] = ['hardpoint', 'utility', 'optional', 'core'];

/** Dónde cae una ranura del anillo, en porcentaje del cuadro. */
export interface RingPosition {
	readonly left: string;
	readonly top: string;
}

/**
 * Reparte `total` ranuras alrededor del anillo, arrancando arriba.
 *
 * El menos noventa es lo que pone la primera en las doce y no en las tres: en
 * pantalla el ángulo cero apunta a la derecha, y un anillo que arranca de
 * costado se lee torcido.
 */
export function ringPositions(total: number): readonly RingPosition[] {
	const posiciones: RingPosition[] = [];
	for (let puesto = 0; puesto < total; puesto++) {
		const angulo = ((-90 + (puesto * 360) / total) * Math.PI) / 180;
		posiciones.push({
			left: `${(50 + RING_RADIUS * Math.cos(angulo)).toFixed(2)}%`,
			top: `${(50 + RING_RADIUS * Math.sin(angulo)).toFixed(2)}%`
		});
	}
	return posiciones;
}

/**
 * El orden en que se recorre el anillo.
 *
 * Por categoría, para que las del mismo tipo queden juntas, y repartidas parejo:
 * así ninguna se pisa, tenga el casco nueve ranuras o quince.
 */
export function ringOrder(hull: Hull): readonly number[] {
	return hull.slots
		.map((slot, index) => ({ slot, index }))
		.sort(
			(a, b) =>
				RING_ORDER.indexOf(a.slot.kind) - RING_ORDER.indexOf(b.slot.kind) || a.index - b.index
		)
		.map(({ index }) => index);
}

/** Qué es esta ranura: el sistema esencial, o el tipo con su clase. */
function slotTitle(kind: SlotKind, core: CoreSystem | null): string {
	return core !== null ? coreSystemLabel(core) : slotKindLabel(kind);
}

/** Una ranura resuelta para dibujar, la use el anillo o la lista. */
function slotRow(
	hull: Hull,
	modules: readonly ShipModule[],
	index: number,
	selected: number,
	position: RingPosition = { left: '50%', top: '50%' }
): FilaRanura {
	const slot = hull.slots[index];
	const module = modules[index];
	const montado = module.code !== '';

	return {
		index,
		kind: slot.kind,
		kindLabel: slotKindLabel(slot.kind),
		// El ícono del módulo montado, no el de la categoría: es lo que hace que
		// el círculo diga qué tiene sin pasarle el mouse por encima.
		icon: montado ? moduleIcon(module) : slotKindIcon(slot.kind),
		title: slotTitle(slot.kind, slot.core),
		classLabel: `Clase ${slot.size}`,
		moduleName: montado ? module.name : 'Vacía',
		badge: montado ? `${module.size}${module.rating}` : `c${slot.size}`,
		filled: montado,
		selected: index === selected,
		left: position.left,
		top: position.top
	};
}

/** Los módulos montados hoy, o los de fábrica si lo guardado no cuadra. */
export function fittedModules(hullCode: string, fitted: readonly string[]): readonly ShipModule[] {
	return fitFromCodes(getHull(hullCode), fitted);
}

/** Las ranuras del casco, ordenadas y ubicadas en el anillo. */
export function buildRingSlots(
	hullCode: string,
	fitted: readonly string[],
	selected: number
): readonly FilaRanura[] {
	const hull = getHull(hullCode);
	const modules = fittedModules(hullCode, fitted);
	const orden = ringOrder(hull);
	const posiciones = ringPositions(orden.length);

	return orden.map((index, puesto) => slotRow(hull, modules, index, selected, posiciones[puesto]));
}

/**
 * Las mismas ranuras, agrupadas por categoría para la lista.
 *
 * La lista es un índice del anillo, no una segunda interfaz: lee las mismas
 * filas y comparte la ranura elegida, así que señalar en cualquiera de los dos
 * prende los dos.
 */
export function buildSlotGroups(
	hullCode: string,
	fitted: readonly string[],
	selected: number
): readonly GrupoRanuras[] {
	const hull = getHull(hullCode);
	const modules = fittedModules(hullCode, fitted);
	const grupos: GrupoRanuras[] = [];

	for (const kind of RING_ORDER) {
		const indices = hull.slots
			.map((slot, index) => ({ slot, index }))
			.filter(({ slot }) => slot.kind === kind)
			.map(({ index }) => index);
		if (indices.length === 0) continue;

		grupos.push({
			label: slotKindLabel(kind),
			icon: slotKindIcon(kind),
			rows: indices.map((index) => slotRow(hull, modules, index, selected))
		});
	}

	return grupos;
}

/**
 * Lo que cuesta y lo que aporta un módulo, en una línea.
 *
 * Se arma con lo que el módulo *tiene*, así que un módulo nuevo aparece descrito
 * solo sin tocar esta función.
 */
export function moduleSummary(module: ShipModule): string {
	const partes: string[] = [];
	const aportes: [string, number, string][] = [
		['Potencia', module.powerOutput, 'MW'],
		['Empuje', Math.floor(module.thrust / 1000), 'kN'],
		['Salto', module.jumpPower, ''],
		['Acumulador', module.capacitor, 'u'],
		['Recarga', module.capacitorRecharge, 'u/s'],
		['Escudo', module.shield, ''],
		['Blindaje', module.armor, ''],
		['Bodega', module.cargo, 'm³'],
		['Combustible', module.fuel, ''],
		['Sensores', module.sensorRange, 'u'],
		['Firma', module.signature, ''],
		['Extracción', module.miningYield, 'm³'],
		['Cinético', module.kinetic, ''],
		['Iónico', module.ionic, ''],
		['Térmico', module.thermal, '']
	];

	for (const [etiqueta, valor, unidad] of aportes) {
		if (!valor) continue;
		partes.push(`${etiqueta} ${valor > 0 ? '+' : ''}${valor}${unidad}`);
	}

	const costos: string[] = [];
	if (module.powerDraw) costos.push(`${module.powerDraw} MW`);
	if (module.computingDraw) costos.push(`${module.computingDraw} u`);
	if (module.mass) costos.push(`${module.mass} t`);
	if (costos.length) partes.push(`cuesta ${costos.join(' · ')}`);

	return partes.join(' · ');
}
