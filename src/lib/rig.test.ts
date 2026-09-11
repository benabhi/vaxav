/** El anillo reparte las ranuras parejo y la lista es su mismo índice. */

import { describe, expect, it } from 'vitest';
import { defaultFit } from './game/fitting';
import { HULLS, getHull, STARTING_HULL } from './game/hulls';
import { MODULES } from './game/modules';
import {
	RING_ORDER,
	RING_RADIUS,
	buildRingSlots,
	buildSlotGroups,
	moduleSummary,
	ringOrder,
	ringPositions
} from './rig';

/** Un porcentaje escrito como "37.50%" vuelto número. */
function percent(value: string): number {
	return Number(value.replace('%', ''));
}

describe('las posiciones del anillo', () => {
	it('arranca arriba, que es donde el ojo empieza a leer', () => {
		const [primera] = ringPositions(8);

		expect(percent(primera.left)).toBeCloseTo(50, 1);
		expect(percent(primera.top)).toBeCloseTo(50 - RING_RADIUS, 1);
	});

	it('reparte parejo: todas caen sobre el mismo círculo', () => {
		for (const total of [1, 3, 8, 11, 15]) {
			for (const { left, top } of ringPositions(total)) {
				const dx = percent(left) - 50;
				const dy = percent(top) - 50;
				expect(Math.hypot(dx, dy)).toBeCloseTo(RING_RADIUS, 1);
			}
		}
	});

	it('no repite lugar: dos ranuras nunca se pisan', () => {
		for (const total of [2, 9, 11, 15]) {
			const lugares = ringPositions(total).map(({ left, top }) => `${left}|${top}`);
			expect(new Set(lugares).size).toBe(total);
		}
	});

	it('las separa por el mismo ángulo', () => {
		const posiciones = ringPositions(12);
		const grados = (p: { left: string; top: string }) =>
			(Math.atan2(percent(p.top) - 50, percent(p.left) - 50) * 180) / Math.PI;

		// `atan2` corta en ±180, así que una de las doce vueltas cruza esa
		// discontinuidad: la diferencia se normaliza antes de compararla.
		const saltos = posiciones
			.slice(1)
			.map((p, i) => ((grados(p) - grados(posiciones[i]) + 540) % 360) - 180);

		for (const salto of saltos) expect(salto).toBeCloseTo(30, 1);
	});
});

describe('el orden del anillo', () => {
	it('agrupa por categoría y deja los esenciales al final', () => {
		for (const hull of HULLS) {
			const orden = ringOrder(hull);
			const categorias = orden.map((index) => hull.slots[index].kind);
			const esperado = [...categorias].sort(
				(a, b) => RING_ORDER.indexOf(a) - RING_ORDER.indexOf(b)
			);
			expect(categorias).toEqual(esperado);
		}
	});

	it('recorre todas las ranuras del casco, una sola vez', () => {
		for (const hull of HULLS) {
			const orden = ringOrder(hull);
			expect(orden).toHaveLength(hull.slots.length);
			expect(new Set(orden).size).toBe(hull.slots.length);
		}
	});
});

describe('las ranuras dibujadas', () => {
	const hull = getHull(STARTING_HULL);
	const deFabrica = defaultFit(hull).map((module) => module.code);

	it('marcan como llena la que tiene algo montado', () => {
		const slots = buildRingSlots(STARTING_HULL, deFabrica, -1);

		for (const slot of slots) {
			expect(slot.filled).toBe(deFabrica[slot.index] !== '');
			// Lo montado muestra clase y calificación; lo vacío, la clase de la
			// ranura. Es lo que se lee adentro del círculo sin pasar el mouse.
			expect(slot.badge).toMatch(slot.filled ? /^\d[A-E]$/ : /^c\d$/);
		}
	});

	it('sólo una queda elegida, y es la que se pidió', () => {
		const slots = buildRingSlots(STARTING_HULL, deFabrica, 2);
		const elegidas = slots.filter((slot) => slot.selected);

		expect(elegidas).toHaveLength(1);
		expect(elegidas[0].index).toBe(2);
	});

	it('sin elegir ninguna, ninguna queda encendida', () => {
		expect(buildRingSlots(STARTING_HULL, deFabrica, -1).some((s) => s.selected)).toBe(false);
	});

	it('la lista es el mismo índice del anillo', () => {
		const slots = buildRingSlots(STARTING_HULL, deFabrica, 3);
		const groups = buildSlotGroups(STARTING_HULL, deFabrica, 3);
		const enLista = groups.flatMap((group) => group.rows);

		// Las mismas ranuras, una sola vez cada una, con la misma elegida.
		expect(enLista.map((s) => s.index).sort((a, b) => a - b)).toEqual(
			slots.map((s) => s.index).sort((a, b) => a - b)
		);
		expect(enLista.filter((s) => s.selected).map((s) => s.index)).toEqual([3]);
	});
});

describe('el resumen de un módulo', () => {
	it('dice lo que aporta y lo que cuesta', () => {
		const canon = MODULES.find((module) => module.code.startsWith('mass_cannon'))!;
		const resumen = moduleSummary(canon);

		expect(resumen).toContain('Cinético +');
		expect(resumen).toContain('cuesta');
		expect(resumen).toContain('MW');
	});

	it('una ranura vacía no tiene nada que resumir', () => {
		const vacio = { ...MODULES[0] };
		for (const clave of Object.keys(vacio) as (keyof typeof vacio)[]) {
			if (typeof vacio[clave] === 'number') (vacio as Record<string, unknown>)[clave] = 0;
		}
		expect(moduleSummary(vacio)).toBe('');
	});
});
