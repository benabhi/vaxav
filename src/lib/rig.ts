/**
 * El anillo de equipamiento, resuelto para dibujar.
 *
 * Vive en `$lib` y no bajo `server/` porque lo necesitan los dos lados: el
 * servidor manda el casco y qué hay montado —que es lo único que sale de la
 * base— y la pantalla arma con eso las ranuras, sus posiciones y la lista que
 * las acompaña. Son funciones puras sobre datos ya leídos, así que se prueban
 * como las reglas del juego.
 */

import { getHull, type Hull, type SlotKind } from '$lib/game/hulls';
import { fitFromCodes } from '$lib/game/fitting';
import type { ShipModule } from '$lib/game/modules';
import { moduleIcon, slotKindHint, slotKindIcon, slotKindLabel, tenths } from '$lib/format';
import type { FilaRanura, GrupoRanuras } from '$lib/tipos';

/**
 * En qué orden se leen las bandejas, de arriba hacia abajo.
 *
 * Es el orden de EVE y el del propio nombre: altos, medios, bajos. Los refuerzos
 * van últimos porque son los que menos se tocan — y los únicos que no se pueden
 * deshacer.
 */
export const SLOT_ORDER: readonly SlotKind[] = ['high', 'mid', 'low', 'rig'];

/** Qué es esta ranura: el sistema esencial, o el tipo con su clase. */
function slotTitle(kind: SlotKind): string {
	return slotKindLabel(kind);
}

/** Una ranura resuelta para dibujar. */
function slotRow(
	hull: Hull,
	modules: readonly ShipModule[],
	index: number,
	selected: number
): FilaRanura {
	const slot = hull.slots[index];
	const module = modules[index];
	const montado = module.code !== '';

	return {
		index,
		kind: slot.kind,
		kindLabel: slotKindLabel(slot.kind),
		// El ícono del módulo montado, no el de la bandeja: la ranura dice qué tiene
		// sin que haya que abrirla.
		icon: montado ? moduleIcon(module) : slotKindIcon(slot.kind),
		title: slotTitle(slot.kind),
		classLabel: `Clase ${slot.size}`,
		moduleName: montado ? module.name : 'Vacía',
		badge: String(montado ? module.size : slot.size),
		filled: montado,
		selected: index === selected,
		size: slot.size
	};
}

/** Los módulos montados hoy, o los de fábrica si lo guardado no cuadra. */
export function fittedModules(hullCode: string, fitted: readonly string[]): readonly ShipModule[] {
	return fitFromCodes(getHull(hullCode), fitted);
}

/**
 * Las ranuras del casco, agrupadas por bandeja.
 *
 * **Es la única forma en que se ven las ranuras**, y eso es lo que arregló esta
 * pantalla. Antes había un anillo a un lado y esta lista al otro diciendo lo
 * mismo dos veces, y no por gusto: un círculo tiene sus elementos repartidos en
 * trescientos sesenta grados, así que **no tiene ningún costado donde abrir el
 * panel de una ranura** — abajo obliga a bajar, al lado achica el círculo,
 * flotando tapa algo. Hacía falta una lista al lado para poder trabajar.
 *
 * En filas el problema no existe: la bandeja se abre debajo de sí misma,
 * empujando sólo lo que tiene abajo. Y el largo de cada fila sigue diciendo la
 * terna del casco, que era lo único que el anillo hacía mejor.
 */
export function buildSlotGroups(
	hullCode: string,
	fitted: readonly string[],
	selected: number
): readonly GrupoRanuras[] {
	const hull = getHull(hullCode);
	const modules = fittedModules(hullCode, fitted);
	const grupos: GrupoRanuras[] = [];

	for (const kind of SLOT_ORDER) {
		const indices = hull.slots
			.map((slot, index) => ({ slot, index }))
			.filter(({ slot }) => slot.kind === kind)
			.map(({ index }) => index);
		if (indices.length === 0) continue;

		grupos.push({
			kind,
			label: slotKindLabel(kind),
			icon: slotKindIcon(kind),
			hint: slotKindHint(kind),
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
		['Grilla', module.powerOutput, 'MW'],
		['Empuje', Math.floor(module.thrust / 1000), 'kN'],
		['Salto', module.jumpPower, ''],
		['Capacitor', module.capacitor, 'u'],
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

	// El warp va aparte de la tabla de enteros: se guarda en décimas, así que
	// pasarlo por el mismo molde lo mostraría como «+3» cuando son tres décimas.
	if (module.warpSpeed) partes.push(`Warp +${tenths(module.warpSpeed)} ud/s`);

	// **El empuje está dormido y el renglón lo dice.** La velocidad sub-warp no
	// mueve ningún reloj desde que viajar es alineación más warp, así que los tres
	// propulsores auxiliares son, hoy, tres compras que no hacen nada. Escribir
	// «Empuje +14 kN» y callar eso es vender una mejora que no llega — el mismo
	// error que el helio-3 tenía en su descripción. Va en esta línea porque es
	// donde el jugador está mirando cuando decide comprarlo.
	if (module.thrust) partes.push('sin efecto hasta el combate');

	const costos: string[] = [];
	if (module.powerDraw) costos.push(`${module.powerDraw} MW`);
	if (module.computingDraw) costos.push(`${module.computingDraw} u`);
	if (module.mass) costos.push(`${module.mass} t`);
	if (costos.length) partes.push(`cuesta ${costos.join(' · ')}`);

	return partes.join(' · ');
}
