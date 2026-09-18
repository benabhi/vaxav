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

const LASER = getModule('mining_laser_i1');
const CANON = getModule('mass_cannon_i1');
const BODEGA_GRANDE = getModule('cargo_rack_i3');
const PROPULSOR = getModule('thruster_i2');
/** Escalón A: pide Minería II para montarse. */
const LASER_A = getModule('mining_laser_ii1');

describe('qué se le puede montar a una ranura', () => {
	it('sin nada en la bodega, no hay nada que montar', () => {
		// No es un error: es lo que significa no tener repuestos.
		expect(availableForSlot('high', 1)).toEqual([]);
	});

	it('ofrece lo que llevás y nada más', () => {
		// La estación no surte: un catálogo entero y gratis convierte la ranura en
		// una lista de compras sin precio.
		const disponibles = availableForSlot('high', 1, [LASER, CANON]);

		expect(disponibles.map((module) => module.code)).toEqual(['mass_cannon_i1', 'mining_laser_i1']);
	});

	it('no ofrece lo que no entra en la ranura', () => {
		// De otro tipo, o más grande que la ranura.
		expect(availableForSlot('low', 1, [LASER])).toEqual([]);
		expect(availableForSlot('low', 1, [BODEGA_GRANDE])).toEqual([]);
	});

	it('en una ranura grande entra uno más chico', () => {
		const disponibles = availableForSlot('low', 3, [BODEGA_GRANDE]);

		expect(disponibles.map((module) => module.code)).toEqual(['cargo_rack_i3']);
	});

	it('un montón es un renglón, aunque lleves varios iguales', () => {
		// Cuál de los tres se monta es indistinto: son fungibles.
		const disponibles = availableForSlot('high', 1, [LASER, LASER, LASER]);

		expect(disponibles).toHaveLength(1);
	});

	it('no mezcla bandejas: lo de una consola no entra en el bastidor', () => {
		expect(availableForSlot('low', 2, [PROPULSOR])).toEqual([]);
		expect(availableForSlot('mid', 2, [PROPULSOR]).map((m) => m.code)).toEqual(['thruster_i2']);
	});
});

describe('y lo que sabe usar', () => {
	it('sin la habilidad, el módulo avanzado no se ofrece', () => {
		// Montarlo dejaría la nave en tierra: ofrecer algo que la rompe no es
		// ofrecer, es tender una trampa.
		const disponibles = availableForSlot('high', 1, [LASER, LASER_A]);

		expect(disponibles.map((module) => module.code)).toEqual(['mining_laser_i1']);
	});

	it('con la habilidad, aparece', () => {
		const disponibles = availableForSlot('high', 1, [LASER, LASER_A], { mining: 2 });

		expect(disponibles.map((module) => module.code)).toContain('mining_laser_ii1');
	});

	it('el nivel justo por debajo todavía no alcanza', () => {
		const disponibles = availableForSlot('high', 1, [LASER_A], { mining: 1 });

		expect(disponibles).toEqual([]);
	});

	it('el escalón de entrada no pide nada, nunca', () => {
		// Es el que vuela una nave de astillero: si pidiera algo, un piloto nuevo
		// no podría montar lo que ya trae puesto.
		expect(availableForSlot('high', 1, [LASER])).toHaveLength(1);
	});
});
