/**
 * Las reglas de las rocas, sin base de datos.
 *
 * Lo que se prueba acá es lo que hace que un campo de rocas se sienta un campo y
 * no una tabla: que **no salgan todas iguales**, que el tamaño dependa de lo rico
 * que sea el cinturón y que reponer siga costando el mismo tiempo que costaba
 * cuando el mineral estaba a nivel del cuerpo entero.
 */

import { describe, expect, it } from 'vitest';
import {
	ASTEROIDS_PER_BELT,
	MAX_ASTEROID_PERCENT,
	MIN_ASTEROID_PERCENT,
	rolledUnits,
	spawnsIn,
	typicalUnits
} from './asteroids';

describe('el tamaño típico de una roca', () => {
	it('reparte lo que el cinturón aguanta entre sus rocas', () => {
		expect(typicalUnits(8_000)).toBe(8_000 / ASTEROIDS_PER_BELT);
	});

	it('un cinturón rico da rocas grandes y uno pobre las da chicas', () => {
		expect(typicalUnits(80_000)).toBeGreaterThan(typicalUnits(8_000));
	});

	it('nunca baja de una unidad', () => {
		// Un cinturón casi vacío sigue dando piedras, aunque sean miserables: una
		// roca de cero unidades no es una roca.
		expect(typicalUnits(1)).toBe(1);
	});
});

describe('lo que trae una roca', () => {
	it('el sorteo más bajo da el mínimo y el más alto casi el máximo', () => {
		const tipica = typicalUnits(8_000);

		expect(rolledUnits(8_000, 0)).toBe((tipica * MIN_ASTEROID_PERCENT) / 100);
		expect(rolledUnits(8_000, 99)).toBeLessThan((tipica * MAX_ASTEROID_PERCENT) / 100);
		expect(rolledUnits(8_000, 99)).toBeGreaterThan(tipica);
	});

	it('el rango es ancho: encontrar una grande tiene que ser un hallazgo', () => {
		// Si todas tuvieran lo mismo, mirar cuál es cuál no aportaría nada y el
		// escáner sería un trámite.
		expect(rolledUnits(8_000, 99)).toBeGreaterThan(rolledUnits(8_000, 0) * 2);
	});

	it('más sorteo, nunca menos mineral', () => {
		let anterior = 0;
		for (let roll = 0; roll < 100; roll++) {
			const unidades = rolledUnits(8_000, roll);
			expect(unidades).toBeGreaterThanOrEqual(anterior);
			anterior = unidades;
		}
	});

	it('un sorteo fuera de rango se recorta en vez de romper', () => {
		expect(rolledUnits(8_000, -5)).toBe(rolledUnits(8_000, 0));
		expect(rolledUnits(8_000, 500)).toBe(rolledUnits(8_000, 99));
	});

	it('siempre sale un entero, sin un solo decimal en la cadena', () => {
		for (let roll = 0; roll < 100; roll += 7) {
			expect(Number.isInteger(rolledUnits(7_777, roll))).toBe(true);
		}
	});
});

describe('cuántas rocas repone un cinturón', () => {
	it('en un rato corto no repone ninguna', () => {
		// Un cinturón vaciado no se encuentra lleno cinco minutos después.
		expect(spawnsIn(600, 8_000, 60)).toBe(0);
	});

	it('el ritmo del plano es el que manda', () => {
		const lento = spawnsIn(600, 8_000, 86_400);
		const rapido = spawnsIn(6_000, 8_000, 86_400);

		expect(rapido).toBeGreaterThan(lento);
	});

	it('un cinturón de rocas grandes tarda más en poner una', () => {
		// El ritmo se cuenta en unidades por hora: con rocas más gordas, la misma
		// cantidad de mineral es menos piedras.
		expect(spawnsIn(6_000, 80_000, 86_400)).toBeLessThan(spawnsIn(6_000, 8_000, 86_400));
	});

	it('sin ritmo o sin tiempo no repone nada', () => {
		expect(spawnsIn(0, 8_000, 86_400)).toBe(0);
		expect(spawnsIn(600, 8_000, 0)).toBe(0);
		expect(spawnsIn(600, 8_000, -100)).toBe(0);
	});
});
