/** Cruzar una puerta: nunca gratis, nunca instantáneo, nunca sin alcance. */

import { describe, expect, it } from 'vitest';
import { TENTHS } from './fitting';
import {
	JUMP_FLOOR_PERCENT,
	MIN_JUMP_FUEL,
	REFERENCE_JUMP_RANGE,
	SECONDS_PER_LIGHT_YEAR,
	jumpFuel,
	jumpProblem,
	jumpSeconds,
	jumpsWithFuel,
	lightYears,
	type JumpShip
} from './jumps';

/** Una nave capaz de cruzar, lista para retocarle lo que el test necesite. */
function nave(cambios: Partial<JumpShip> = {}): JumpShip {
	return { jumpRange: REFERENCE_JUMP_RANGE, mass: 400, fuel: 40, flyable: true, ...cambios };
}

describe('cuánto tarda', () => {
	it('con el alcance de referencia, la distancia manda', () => {
		expect(jumpSeconds(TENTHS, REFERENCE_JUMP_RANGE)).toBe(SECONDS_PER_LIGHT_YEAR);
		expect(jumpSeconds(2 * TENTHS, REFERENCE_JUMP_RANGE)).toBe(2 * SECONDS_PER_LIGHT_YEAR);
	});

	it('más alcance es menos tiempo, y menos alcance es más', () => {
		const referencia = jumpSeconds(TENTHS, REFERENCE_JUMP_RANGE);
		expect(jumpSeconds(TENTHS, REFERENCE_JUMP_RANGE * 2)).toBeLessThan(referencia);
		expect(jumpSeconds(TENTHS, Math.floor(REFERENCE_JUMP_RANGE / 2))).toBeGreaterThan(referencia);
	});

	/*
	 * El techo de eficiencia es parte del balance, no un efecto colateral: por
	 * muchos bonos que junte nadie salta en cero.
	 */
	it('nunca baja del piso, por mucho alcance que tenga', () => {
		const base = SECONDS_PER_LIGHT_YEAR;
		const piso = (base * JUMP_FLOOR_PERCENT) / 100;

		for (const alcance of [100, 1_000, 100_000]) {
			expect(jumpSeconds(TENTHS, alcance)).toBeGreaterThanOrEqual(piso);
		}
	});

	it('nunca es menos de un segundo, ni con una distancia mínima', () => {
		expect(jumpSeconds(1, 100_000)).toBeGreaterThanOrEqual(1);
		expect(jumpSeconds(0, REFERENCE_JUMP_RANGE)).toBeGreaterThanOrEqual(1);
	});

	it('no acepta una nave sin motor ni una distancia negativa', () => {
		expect(() => jumpSeconds(TENTHS, 0)).toThrow(RangeError);
		expect(() => jumpSeconds(-1, REFERENCE_JUMP_RANGE)).toThrow(RangeError);
	});
});

describe('cuánto consume', () => {
	/*
	 * Sin la distancia, un salto corto costaría lo mismo que uno largo y
	 * convendría siempre el más largo: la galaxia se quedaría sin geografía.
	 */
	it('escala con la distancia', () => {
		const corto = jumpFuel(TENTHS, 400);
		const largo = jumpFuel(3 * TENTHS, 400);

		expect(largo).toBeGreaterThan(corto);
	});

	/* Y sin la masa, cargar la bodega hasta el tope saldría gratis. */
	it('escala con la masa', () => {
		expect(jumpFuel(TENTHS, 800)).toBeGreaterThan(jumpFuel(TENTHS, 400));
	});

	it('la eficiencia lo baja', () => {
		expect(jumpFuel(3 * TENTHS, 800, 25)).toBeLessThan(jumpFuel(3 * TENTHS, 800));
	});

	/* Un salto gratis convertiría el combustible en un adorno. */
	it('nunca cuesta menos de una unidad', () => {
		expect(jumpFuel(1, 1)).toBe(MIN_JUMP_FUEL);
		expect(jumpFuel(TENTHS, 10, 500)).toBe(MIN_JUMP_FUEL);
		expect(jumpFuel(0, 0)).toBe(MIN_JUMP_FUEL);
	});

	/*
	 * La autonomía de la ficha y el gasto real salen de la misma función: si se
	 * calcularan aparte, la nave podría decir «te quedan tres saltos» y quedarse
	 * sin combustible en el segundo.
	 */
	it('la autonomía del tanque coincide con lo que gasta', () => {
		const masa = 600;
		const porSalto = jumpFuel(TENTHS, masa);
		const tanque = porSalto * 3;

		expect(jumpsWithFuel(tanque, masa)).toBe(3);
		expect(jumpsWithFuel(tanque - 1, masa)).toBe(2);
	});
});

describe('si se puede cruzar', () => {
	it('con nave, alcance y tanque, se puede', () => {
		expect(jumpProblem(nave(), TENTHS)).toBeNull();
	});

	it('una nave que no vuela no salta', () => {
		expect(jumpProblem(nave({ flyable: false }), TENTHS)).not.toBeNull();
	});

	it('una puerta sin destino no lleva a ninguna parte', () => {
		expect(jumpProblem(nave(), null)).not.toBeNull();
	});

	it('sin motor de salto, tampoco', () => {
		expect(jumpProblem(nave({ jumpRange: 0 }), TENTHS)).not.toBeNull();
	});

	/*
	 * Es lo que convierte al alcance en mecánica: una puerta más lejos de lo que
	 * la nave llega es una puerta que hay que ganarse con equipo.
	 */
	it('no se cruza una puerta más lejos que el alcance', () => {
		const problema = jumpProblem(nave({ jumpRange: 20 }), 30);
		expect(problema).not.toBeNull();
		expect(problema).toContain('alcanza');
	});

	it('sin combustible suficiente, dice cuánto falta', () => {
		const problema = jumpProblem(nave({ fuel: 0 }), TENTHS);
		expect(problema).toContain('combustible');
	});

	/* El orden importa: lo que no se arregla comprando se dice primero. */
	it('una nave que no vuela lo dice antes que el combustible', () => {
		expect(jumpProblem(nave({ flyable: false, fuel: 0 }), TENTHS)).toContain('volar');
	});
});

describe('cómo se lee una distancia', () => {
	it('se guarda en décimas y se muestra en años luz', () => {
		expect(lightYears(14)).toBe('1,4 al');
		expect(lightYears(10)).toBe('1,0 al');
		expect(lightYears(7)).toBe('0,7 al');
		expect(lightYears(0)).toBe('0,0 al');
	});
});
