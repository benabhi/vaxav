/** Las facciones son distinguibles y cada una tiene su propio punto de partida. */

import { describe, expect, it } from 'vitest';
import { FACTIONS, getFaction } from './factions';

describe('las facciones', () => {
	it('tienen códigos únicos que coinciden con la clave', () => {
		for (const [code, faction] of Object.entries(FACTIONS)) {
			expect(faction.code).toBe(code);
		}
	});

	it('empiezan cada una en una estación distinta', () => {
		// Si dos comparten origen, elegir facción no cambia nada.
		const estaciones = Object.values(FACTIONS).map((f) => f.startingStation);
		expect(new Set(estaciones).size).toBe(estaciones.length);
	});

	it('tienen nombre, historia y estación', () => {
		for (const faction of Object.values(FACTIONS)) {
			expect(faction.name.trim()).not.toBe('');
			expect(faction.description.trim()).not.toBe('');
			expect(faction.startingStation.trim()).not.toBe('');
			expect(faction.startingStationName.trim()).not.toBe('');
		}
	});

	it('son las tres superpotencias', () => {
		// Tres y no cuatro: la cuarta siempre termina siendo "los independientes".
		expect(Object.keys(FACTIONS)).toHaveLength(3);
	});

	it('fallan con el nombre si la facción no existe', () => {
		expect(() => getFaction('imperio')).toThrow(/imperio/);
	});
});
