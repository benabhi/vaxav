/** El índice del piloto: suma lo invertido, y los rangos ordenan esa suma. */

import { describe, expect, it } from 'vitest';
import { RATING_RANKS, nextRankFor, pilotIndex, rankFor, rankProgress } from './rating';

describe('el índice', () => {
	it('suma lo invertido en todas las ramas', () => {
		expect(pilotIndex({ piloting: 1_200, extraction: 800, combat: 0 })).toBe(2_000);
	});

	it('un piloto recién creado arranca cerca de cero', () => {
		expect(pilotIndex({})).toBe(0);
	});

	/*
	 * Se extiende solo: una rama nueva entra en la cuenta sin tocar nada. Es la
	 * razón de que sea la XP y no una fórmula con pesos por rama.
	 */
	it('una rama que antes no estaba entra sola en la cuenta', () => {
		const antes = pilotIndex({ piloting: 5_000 });
		const despues = pilotIndex({ piloting: 5_000, mecatronica: 3_000 });

		expect(despues - antes).toBe(3_000);
	});

	it('no descuenta con un valor negativo', () => {
		expect(pilotIndex({ piloting: 5_000, raro: -9_999 })).toBe(5_000);
	});
});

describe('los rangos', () => {
	it('van de menor a mayor, sin repetir umbral', () => {
		const umbrales = RATING_RANKS.map((rango) => rango.at);
		expect(umbrales).toEqual([...umbrales].sort((a, b) => a - b));
		expect(new Set(umbrales).size).toBe(umbrales.length);
	});

	it('el primero no pide nada: todo piloto tiene rango', () => {
		expect(RATING_RANKS[0].at).toBe(0);
		expect(rankFor(0).name).toBe(RATING_RANKS[0].name);
	});

	it('se alcanza en el umbral justo, no uno antes', () => {
		for (const rango of RATING_RANKS.slice(1)) {
			expect(rankFor(rango.at).step).toBe(rango.step);
			expect(rankFor(rango.at - 1).step).toBe(rango.step - 1);
		}
	});

	it('numera los escalones de corrido, para que la pantalla sepa cuánto encender', () => {
		expect(RATING_RANKS.map((rango) => rango.step)).toEqual([0, 1, 2, 3, 4, 5, 6]);
	});

	it('dice cuál sigue, y que no hay ninguno después del último', () => {
		expect(nextRankFor(0)?.step).toBe(1);
		expect(nextRankFor(RATING_RANKS[RATING_RANKS.length - 1].at)).toBeNull();
	});
});

describe('cuánto falta para el que sigue', () => {
	it('arranca en cero y llega a uno justo antes del salto', () => {
		const segundo = RATING_RANKS[1];
		expect(rankProgress(0)).toBe(0);
		expect(rankProgress(segundo.at / 2)).toBeCloseTo(0.5, 5);
		expect(rankProgress(segundo.at)).toBe(0);
	});

	/*
	 * En el último no hay tramo que recorrer. Devolver cero dibujaría vacío justo
	 * al que más lejos llegó.
	 */
	it('en el último rango está lleno', () => {
		const ultimo = RATING_RANKS[RATING_RANKS.length - 1];
		expect(rankProgress(ultimo.at)).toBe(1);
		expect(rankProgress(ultimo.at * 10)).toBe(1);
	});
});
