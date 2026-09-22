/** Cruzar una puerta: gratis, nunca instantáneo y siempre igual para todos. */

import { describe, expect, it } from 'vitest';
import { TENTHS } from './fitting';
import {
	MIN_JUMP_FUEL,
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
	return { flyable: true, ...cambios };
}

describe('cuánto tarda', () => {
	it('lo dice la distancia de la puerta y nada más', () => {
		expect(jumpSeconds(TENTHS)).toBe(SECONDS_PER_LIGHT_YEAR);
		expect(jumpSeconds(2 * TENTHS)).toBe(2 * SECONDS_PER_LIGHT_YEAR);
	});

	/*
	 * **La misma puerta tarda lo mismo para todos.** Es la consecuencia directa de
	 * que la puerta haga el trabajo: sin esto, el equipo volvería a decidir cuánto
	 * se tarda en cruzar, que es justamente lo que se sacó.
	 */
	it('no depende de la nave: sólo recibe la distancia', () => {
		expect(jumpSeconds).toHaveLength(1);
	});

	/*
	 * **El número se escribe a mano y sale de `docs/systems/ACTIONS.md`**, que dice
	 * «240 s por año luz». Derivarlo de la constante del módulo haría que moverla
	 * mueva también la expectativa, y entonces el test no vigilaría nada: quien
	 * cambie el ritmo del cruce tiene que cambiar el documento en el mismo commit.
	 */
	it('un año luz de puerta son cuatro minutos', () => {
		expect(jumpSeconds(TENTHS)).toBe(240);
		expect(jumpSeconds(25)).toBe(600);
	});

	it('nunca es menos de un segundo, ni con una distancia mínima', () => {
		expect(jumpSeconds(1)).toBeGreaterThanOrEqual(1);
		expect(jumpSeconds(0)).toBeGreaterThanOrEqual(1);
	});

	it('no acepta una distancia negativa', () => {
		expect(() => jumpSeconds(-1)).toThrow(RangeError);
	});
});

/*
 * El consumo está **dormido**: cruzar una puerta no gasta nada y ningún verbo
 * llama a estas dos funciones todavía. Se prueban igual porque son la regla que
 * el motor de salto de las capitales va a usar tal cual, y una regla sin prueba
 * es una que se rompe sin que nadie se entere.
 */
describe('cuánto consumiría un salto sin puerta', () => {
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
	 * La autonomía de la ficha y el gasto salen de la misma función: si se
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
	it('con una nave que vuela y una puerta abierta, se puede', () => {
		expect(jumpProblem(nave(), TENTHS)).toBeNull();
	});

	/*
	 * **Lo que no pide.** Cualquier nave cruza cualquier puerta: no hay alcance que
	 * ganarse con equipo ni tanque que llenar, y por eso lo único que decide es que
	 * la nave se pueda volar. Con la distancia más larga que cualquier alcance de
	 * casco del catálogo, sigue dando que sí.
	 */
	it('no pide alcance ni combustible, por lejos que esté', () => {
		expect(jumpProblem(nave(), 500)).toBeNull();
	});

	it('una nave que no vuela no salta', () => {
		expect(jumpProblem(nave({ flyable: false }), TENTHS)).not.toBeNull();
	});

	it('una puerta sin destino no lleva a ninguna parte', () => {
		expect(jumpProblem(nave(), null)).not.toBeNull();
	});

	it('una puerta cerrada no se cruza', () => {
		expect(jumpProblem(nave(), TENTHS, true)).toContain('cerrado');
	});

	/* El orden importa: lo que no se arregla de ninguna forma se dice primero. */
	it('una nave que no vuela lo dice antes que la puerta cerrada', () => {
		expect(jumpProblem(nave({ flyable: false }), TENTHS, true)).toContain('volar');
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
