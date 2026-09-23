/** Las ranuras del casco, agrupadas por bandeja y listas para dibujar. */

import { describe, expect, it } from 'vitest';
import { defaultFit } from './game/fitting';
import { HULLS, getHull, STARTING_HULL } from './game/hulls';
import { MODULES } from './game/modules';
import { SLOT_ORDER, buildSlotGroups, moduleSummary } from './rig';

describe('las bandejas', () => {
	const deFabrica = (code: string) => defaultFit(getHull(code)).map((module) => module.code);

	it('reúnen todas las ranuras del casco, una sola vez', () => {
		for (const hull of HULLS) {
			const filas = buildSlotGroups(hull.code, deFabrica(hull.code), -1).flatMap((g) => g.rows);
			expect(filas, hull.name).toHaveLength(hull.slots.length);
			expect(new Set(filas.map((f) => f.index)).size, hull.name).toBe(hull.slots.length);
		}
	});

	it('van en el orden de EVE: altos, medios, bajos y al final los refuerzos', () => {
		for (const hull of HULLS) {
			const orden = buildSlotGroups(hull.code, deFabrica(hull.code), -1).map((g) => g.kind);
			const esperado = [...orden].sort(
				(a, b) => SLOT_ORDER.indexOf(a as never) - SLOT_ORDER.indexOf(b as never)
			);
			expect(orden, hull.name).toEqual(esperado);
		}
	});

	it('el largo de cada bandeja es la terna del casco', () => {
		// Es lo que reemplaza a la figura: dos naves se distinguen por la forma del
		// bloque de ranuras, sin dibujar nada.
		const mula = buildSlotGroups('mula', deFabrica('mula'), -1);
		const vencejo = buildSlotGroups('vencejo', deFabrica('vencejo'), -1);
		const largo = (grupos: ReturnType<typeof buildSlotGroups>, kind: string) =>
			grupos.find((g) => g.kind === kind)?.rows.length ?? 0;

		// La carguera lleva casi todo abajo; la exploradora, casi todo en el medio.
		expect(largo(mula, 'low')).toBeGreaterThan(largo(mula, 'mid'));
		expect(largo(vencejo, 'mid')).toBeGreaterThan(largo(vencejo, 'low'));
	});

	it('dice qué entra en cada una, porque el nombre ya no lo dice', () => {
		for (const grupo of buildSlotGroups(STARTING_HULL, deFabrica(STARTING_HULL), -1)) {
			expect(grupo.hint, grupo.label).not.toBe('');
		}
	});
});

describe('las ranuras dibujadas', () => {
	const hull = getHull(STARTING_HULL);
	const deFabrica = defaultFit(hull).map((module) => module.code);
	const filas = (selected: number) =>
		buildSlotGroups(STARTING_HULL, deFabrica, selected).flatMap((g) => g.rows);

	it('marcan como llena la que tiene algo montado', () => {
		for (const slot of filas(-1)) {
			expect(slot.filled).toBe(deFabrica[slot.index] !== '');
			// La insignia dice **la clase y nada más**: es lo único que decide si un
			// módulo entra. El escalón va en el nombre, sin cifrar.
			expect(slot.badge).toMatch(/^\d$/);
		}
	});

	it('sólo una queda elegida, y es la que se pidió', () => {
		const elegidas = filas(2).filter((slot) => slot.selected);
		expect(elegidas).toHaveLength(1);
		expect(elegidas[0].index).toBe(2);
	});

	it('sin elegir ninguna, ninguna queda encendida', () => {
		expect(filas(-1).some((slot) => slot.selected)).toBe(false);
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

	it('escribe el warp en décimas y no como un entero suelto', () => {
		// La velocidad de warp se guarda en décimas, así que pasarla por el molde de
		// los enteros la mostraría como «+3» cuando son tres décimas: diez veces más
		// de lo que el módulo da. Es la clase de error que nadie ve hasta que compara
		// el tiempo prometido con el que la orden tarda.
		const optimizador = MODULES.find((module) => module.code === 'warp_optimizer_i2')!;
		expect(moduleSummary(optimizador)).toContain('Warp +0,3 ud/s');
	});

	it('avisa que el empuje no mueve ningún reloj todavía', () => {
		// **Los tres propulsores auxiliares son hoy tres compras que no hacen nada**:
		// la velocidad sub-warp no mueve ningún reloj desde que viajar es alineación
		// más warp. Escribir el empuje y callar eso es vender una mejora que no llega,
		// y el renglón se lee justo cuando el jugador está decidiendo comprarlo.
		const dormidos = MODULES.filter((module) => module.thrust > 0);
		expect(dormidos.length).toBeGreaterThan(0);

		for (const module of dormidos) {
			expect(moduleSummary(module), module.code).toContain('sin efecto hasta el combate');
		}
	});

	it('una ranura vacía no tiene nada que resumir', () => {
		const vacio = { ...MODULES[0] };
		for (const clave of Object.keys(vacio) as (keyof typeof vacio)[]) {
			if (typeof vacio[clave] === 'number') (vacio as Record<string, unknown>)[clave] = 0;
		}
		expect(moduleSummary(vacio)).toBe('');
	});
});
