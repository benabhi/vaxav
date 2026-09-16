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
	/** Grados desde arriba, en el sentido del reloj. */
	readonly angle: number;
	readonly left: string;
	readonly top: string;
}

/**
 * Un punto del anillo, en grados desde arriba.
 *
 * Se guarda el ángulo además de la posición porque la pantalla lo necesita para
 * decidir dónde cae cada ranura sin volver a hacer la trigonometría.
 */
function pointAt(angleDegrees: number): RingPosition {
	const radianes = ((angleDegrees - 90) * Math.PI) / 180;
	return {
		angle: angleDegrees,
		left: `${(50 + RING_RADIUS * Math.cos(radianes)).toFixed(2)}%`,
		top: `${(50 + RING_RADIUS * Math.sin(radianes)).toFixed(2)}%`
	};
}

/**
 * Reparte las ranuras alrededor del anillo, **todas a la misma distancia**.
 *
 * Van agrupadas por categoría —eso lo decide `ringOrder`— pero sin ningún corte
 * entre una y otra, y esa uniformidad no es pereza: es lo único que se ve bien.
 *
 * El intento anterior separaba las categorías con un hueco, para que el tamaño
 * de cada arco fuera la firma del casco. La idea no sobrevive a los datos: **los
 * siete internos esenciales son siempre siete**, en los cinco cascos, así que
 * ocupan más de la mitad del círculo y todo lo que de verdad varía —una a tres
 * armas, dos a cuatro opcionales— se amontona en la otra mitad. Con huecos de por
 * medio, esa mitad queda con el doble de separación que la otra y el anillo se ve
 * torcido, por mucho que las cuentas cierren.
 *
 * Qué categoría es cada ranura se lee igual, por otros tres caminos que no
 * deforman el círculo: el ícono del nodo, su tamaño —que es la clase— y la
 * leyenda de abajo. El día que los esenciales salgan del anillo se podrá volver a
 * intentar; mientras estén, la separación pareja es la que manda.
 *
 * El cero apunta arriba y no a la derecha: en pantalla el ángulo cero apunta a
 * la derecha, y un anillo que arranca de costado se lee torcido.
 */
export function ringPositions(counts: readonly number[]): readonly RingPosition[] {
	const total = counts.reduce((suma, cuantas) => suma + Math.max(0, cuantas), 0);
	if (total === 0) return [];

	return Array.from({ length: total }, (_, puesto) => pointAt((puesto * 360) / total));
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
	position: RingPosition = { angle: 0, left: '50%', top: '50%' }
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
		badge: montado ? `${module.size}${module.tier}` : `c${slot.size}`,
		filled: montado,
		selected: index === selected,
		// La clase de la ranura, para que el nodo la diga por su tamaño: una nave
		// que traga módulos grandes se reconoce sin leer una cifra.
		size: slot.size,
		angle: position.angle,
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
	// Cuántas ranuras tiene cada categoría, en el orden en que se recorre el
	// anillo: es lo que decide el tamaño de cada arco.
	const cuentas = RING_ORDER.map((kind) => hull.slots.filter((slot) => slot.kind === kind).length);
	const posiciones = ringPositions(cuentas);

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
