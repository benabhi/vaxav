/**
 * El pozo por familia, como regla pura: qué cuesta el salto y qué lo impide.
 *
 * Lo que se prueba acá no es sólo que el número dé bien, sino **cuál de los tres
 * bloqueos gana**: la pantalla muestra ese motivo, y decirle a alguien que le
 * falta pozo cuando en realidad le faltan requisitos lo manda a juntar
 * experiencia que no lo va a destrabar.
 */

import { describe, expect, it } from 'vitest';
import { investmentFor } from './pools';
import { MAX_LEVEL, xpForLevel } from './progression';

/** Un piloto con `navigation` en el nivel que se pida, y el pozo que se pida. */
function piloto(navegacion: number, pozo: number) {
	const xp = { navigation: xpForLevel(navegacion, 1) };
	return { xp, niveles: { navigation: navegacion }, pozos: { piloting: pozo } };
}

describe('el panorama de una inversión', () => {
	it('cobra exactamente lo que falta para el nivel siguiente', () => {
		const { xp, niveles, pozos } = piloto(1, 0);

		const plan = investmentFor('navigation', xp, niveles, pozos);

		// Tiene 100 y el nivel 2 pide 400: el salto cuesta la diferencia, no el
		// umbral entero.
		expect(plan.level).toBe(1);
		expect(plan.nextLevel).toBe(2);
		expect(plan.cost).toBe(300);
	});

	it('escala con la dificultad de la habilidad', () => {
		// Astrogación es x3, así que su nivel 1 cuesta el triple que el de una x1.
		const plan = investmentFor('astrogation', {}, { navigation: 5 }, { piloting: 9999 });

		expect(plan.cost).toBe(300);
		expect(plan.canInvest).toBe(true);
	});

	it('deja invertir cuando el pozo alcanza justo', () => {
		const { xp, niveles, pozos } = piloto(1, 300);

		const plan = investmentFor('navigation', xp, niveles, pozos);

		expect(plan.canInvest).toBe(true);
		expect(plan.blocker).toBeNull();
	});

	it('traba por pozo cuando falta uno solo', () => {
		const { xp, niveles, pozos } = piloto(1, 299);

		const plan = investmentFor('navigation', xp, niveles, pozos);

		expect(plan.canInvest).toBe(false);
		expect(plan.blocker).toBe('pool');
		expect(plan.pool).toBe(299);
	});

	it('una rama sin pozo es una rama en cero, no un error', () => {
		const plan = investmentFor('navigation', {}, {}, {});

		expect(plan.pool).toBe(0);
		expect(plan.blocker).toBe('pool');
	});
});

describe('el orden de los bloqueos', () => {
	it('los requisitos pesan más que el pozo', () => {
		// Astrogación pide Navegación 3 y el piloto no la tiene. Aunque le sobre
		// experiencia, el motivo que hay que mostrar es el requisito: juntar más no
		// lo destraba.
		const plan = investmentFor('astrogation', {}, { navigation: 1 }, { piloting: 999999 });

		expect(plan.blocker).toBe('requirements');
		expect(plan.missing).toEqual([{ skill: 'navigation', level: 3 }]);
	});

	it('estar al tope pesa más que todo lo demás', () => {
		const tope = { navigation: xpForLevel(MAX_LEVEL, 1) };

		const plan = investmentFor('navigation', tope, { navigation: MAX_LEVEL }, {});

		expect(plan.blocker).toBe('maxed');
		expect(plan.level).toBe(MAX_LEVEL);
		// No hay nivel siguiente que comprar, así que el costo no es un número a
		// mostrar: es cero, y la pantalla dibuja "al máximo" en su lugar.
		expect(plan.cost).toBe(0);
		expect(plan.nextLevel).toBe(MAX_LEVEL);
	});

	it('el pozo de otra rama no sirve', () => {
		// Navegación es de Pilotaje: lo que haya en Extracción le es indiferente.
		const plan = investmentFor('navigation', {}, {}, { extraction: 999999 });

		expect(plan.family).toBe('piloting');
		expect(plan.blocker).toBe('pool');
		expect(plan.pool).toBe(0);
	});
});
