/**
 * Los tres tipos de daño y las tres capas se comportan como dice el diseño.
 *
 * Son las reglas que deciden si una nave sobrevive, y están hechas de una tabla:
 * un número mal puesto ahí no rompe nada visible, sólo hace que un arma sea
 * siempre la respuesta correcta.
 */

import { describe, expect, it } from 'vitest';
import {
	BASE_RESISTANCE,
	DAMAGE_TYPES,
	LAYERS,
	LAYER_ORDER,
	effectiveHp,
	resistance,
	totalEffectiveHp,
	weakestAgainst
} from './damage';

describe('la tabla de resistencias', () => {
	it('cubre toda capa contra todo tipo', () => {
		// Un hueco en la tabla sería una división por cero en pleno combate.
		for (const layer of LAYERS) {
			for (const damageType of DAMAGE_TYPES) {
				expect(Number.isInteger(resistance(layer, damageType))).toBe(true);
			}
		}
	});

	it('nunca llega a cien', () => {
		// Al 100 % la nave sería invulnerable a ese tipo, y no habría contrajuego.
		for (const fila of Object.values(BASE_RESISTANCE)) {
			for (const porcentaje of Object.values(fila)) {
				expect(porcentaje).toBeGreaterThanOrEqual(0);
				expect(porcentaje).toBeLessThan(100);
			}
		}
	});

	it('deja entrar el daño por el escudo y salir por el casco', () => {
		expect([...LAYER_ORDER]).toEqual(['shield', 'armor', 'structure']);
	});
});

describe('el carácter de cada tipo', () => {
	it('deja pasar lo iónico por el escudo y rebota lo cinético', () => {
		// Es la razón de ser de los dos tipos especializados.
		expect(resistance('shield', 'ionic')).toBe(0);
		expect(resistance('shield', 'kinetic')).toBeGreaterThan(0);
	});

	it('invierte la relación contra el blindaje', () => {
		expect(resistance('armor', 'ionic')).toBeGreaterThan(resistance('armor', 'kinetic'));
	});

	it('no le da al casco desnudo con qué frenar', () => {
		// Es la última capa: si llegaron ahí, ya no hay dónde esconderse.
		for (const damageType of DAMAGE_TYPES) {
			expect(resistance('structure', damageType)).toBe(0);
		}
	});

	it('deja lo térmico en el medio en todas partes', () => {
		// Por eso pega menos: gana cuando no sabés a qué te enfrentás.
		for (const layer of ['shield', 'armor'] as const) {
			const contraTermico = resistance(layer, 'thermal');
			const otros = DAMAGE_TYPES.filter((t) => t !== 'thermal').map((t) => resistance(layer, t));
			expect(Math.min(...otros)).toBeLessThan(contraTermico);
			expect(contraTermico).toBeLessThan(Math.max(...otros));
		}
	});

	it('no deja que un tipo sea el mejor contra las dos capas', () => {
		// Si uno ganara en todo, elegir arma dejaría de ser una decisión.
		for (const damageType of DAMAGE_TYPES) {
			const mejorEnEscudo =
				resistance('shield', damageType) ===
				Math.min(...DAMAGE_TYPES.map((t) => resistance('shield', t)));
			const mejorEnBlindaje =
				resistance('armor', damageType) ===
				Math.min(...DAMAGE_TYPES.map((t) => resistance('armor', t)));
			expect(mejorEnEscudo && mejorEnBlindaje).toBe(false);
		}
	});
});

describe('los puntos efectivos', () => {
	it('sin resistencia son los crudos', () => {
		expect(effectiveHp(500, 'structure', 'kinetic')).toBe(500);
	});

	it('con la mitad de resistencia duplican lo que aguanta', () => {
		expect(resistance('shield', 'kinetic')).toBe(50);
		expect(effectiveHp(100, 'shield', 'kinetic')).toBe(200);
	});

	it('crecen con la resistencia', () => {
		expect(effectiveHp(100, 'shield', 'kinetic')).toBeGreaterThan(
			effectiveHp(100, 'shield', 'ionic')
		);
	});

	it('son cero en una capa vacía', () => {
		expect(effectiveHp(0, 'shield', 'ionic')).toBe(0);
	});

	it('no admiten puntos negativos', () => {
		expect(() => effectiveHp(-1, 'shield', 'ionic')).toThrow();
	});

	it('suman las tres capas', () => {
		// Se suman porque el daño las atraviesa en orden: no hay atajo al casco.
		const total = totalEffectiveHp(100, 100, 100, 'thermal');
		const esperado =
			effectiveHp(100, 'shield', 'thermal') +
			effectiveHp(100, 'armor', 'thermal') +
			effectiveHp(100, 'structure', 'thermal');
		expect(total).toBe(esperado);
	});
});

describe('el punto débil', () => {
	it('deja floja contra lo iónico a una nave con mucho escudo', () => {
		// Es la lectura que le importa al piloto: por dónde se la van a romper.
		expect(weakestAgainst(800, 50, 200)).toBe('ionic');
	});

	it('deja floja contra lo cinético a una nave blindada y sin escudo', () => {
		expect(weakestAgainst(0, 800, 200)).toBe('kinetic');
	});
});
