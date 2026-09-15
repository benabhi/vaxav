/**
 * Sólo se monta lo que se tiene.
 *
 * Antes la estación surtía el catálogo entero y gratis, y la ranura era una
 * lista de compras sin precio. Comprar es del mercado; equipar es mover lo tuyo
 * de la bodega a una ranura.
 */

import { describe, expect, it } from 'vitest';
import { getModule } from './modules';
import { availableForSlot } from './inventory';

const LASER = getModule('mining_laser_e1');
const CANON = getModule('mass_cannon_e1');
const BODEGA_GRANDE = getModule('cargo_rack_e3');
const PLANTA = getModule('plant_e2');
/** Escalón A: pide Minería II para montarse. */
const LASER_A = getModule('mining_laser_a1');

describe('qué se le puede montar a una ranura', () => {
	it('sin nada en la bodega, no hay nada que montar', () => {
		// No es un error: es lo que significa no tener repuestos.
		expect(availableForSlot('hardpoint', 1, null)).toEqual([]);
	});

	it('ofrece lo que llevás y nada más', () => {
		// La estación no surte: un catálogo entero y gratis convierte la ranura en
		// una lista de compras sin precio.
		const disponibles = availableForSlot('hardpoint', 1, null, [LASER, CANON]);

		expect(disponibles.map((module) => module.code)).toEqual(['mass_cannon_e1', 'mining_laser_e1']);
	});

	it('no ofrece lo que no entra en la ranura', () => {
		// De otro tipo, o más grande que la ranura.
		expect(availableForSlot('utility', 1, null, [LASER])).toEqual([]);
		expect(availableForSlot('optional', 1, null, [BODEGA_GRANDE])).toEqual([]);
	});

	it('en una ranura grande entra uno más chico', () => {
		const disponibles = availableForSlot('optional', 3, null, [BODEGA_GRANDE]);

		expect(disponibles.map((module) => module.code)).toEqual(['cargo_rack_e3']);
	});

	it('un montón es un renglón, aunque lleves varios iguales', () => {
		// Cuál de los tres se monta es indistinto: son fungibles.
		const disponibles = availableForSlot('hardpoint', 1, null, [LASER, LASER, LASER]);

		expect(disponibles).toHaveLength(1);
	});

	it('los internos esenciales filtran además por cuál de los siete son', () => {
		expect(availableForSlot('core', 2, 'power_plant', [PLANTA]).map((m) => m.code)).toEqual([
			'plant_e2'
		]);
		expect(availableForSlot('core', 2, 'thrusters', [PLANTA])).toEqual([]);
	});
});

describe('y lo que sabe usar', () => {
	it('sin la habilidad, el módulo avanzado no se ofrece', () => {
		// Montarlo dejaría la nave en tierra: ofrecer algo que la rompe no es
		// ofrecer, es tender una trampa.
		const disponibles = availableForSlot('hardpoint', 1, null, [LASER, LASER_A]);

		expect(disponibles.map((module) => module.code)).toEqual(['mining_laser_e1']);
	});

	it('con la habilidad, aparece', () => {
		const disponibles = availableForSlot('hardpoint', 1, null, [LASER, LASER_A], { mining: 2 });

		expect(disponibles.map((module) => module.code)).toContain('mining_laser_a1');
	});

	it('el nivel justo por debajo todavía no alcanza', () => {
		const disponibles = availableForSlot('hardpoint', 1, null, [LASER_A], { mining: 1 });

		expect(disponibles).toEqual([]);
	});

	it('el escalón de entrada no pide nada, nunca', () => {
		// Es el que vuela una nave de astillero: si pidiera algo, un piloto nuevo
		// no podría montar lo que ya trae puesto.
		expect(availableForSlot('hardpoint', 1, null, [LASER])).toHaveLength(1);
	});
});
