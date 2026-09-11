/**
 * Las profesiones están balanceadas y son coherentes con el árbol de
 * habilidades.
 *
 * El presupuesto común es lo que hace que el balance sea verificable: si las
 * seis suman lo mismo, ninguna empieza mejor. Y ninguna puede entregar una
 * habilidad que el piloto no habría podido entrenar por su cuenta.
 */

import { describe, expect, it } from 'vitest';
import {
	PROFESSIONS,
	STARTING_XP_BUDGET,
	getProfession,
	professionCost,
	startingLevels,
	startingXp
} from './professions';
import { MAX_LEVEL, levelFromXp } from './progression';
import { SKILLS, getSkill, unmetRequirements } from './skills';

const CODES = Object.keys(PROFESSIONS).sort();

describe.each(CODES)('la profesión %s', (code) => {
	it('gasta el presupuesto completo', () => {
		// Ninguna empieza mejor que otra: empiezan distinto.
		expect(professionCost(code)).toBe(STARTING_XP_BUDGET);
	});

	it('entrega habilidades que existen', () => {
		for (const grant of getProfession(code).grants) {
			expect(Object.hasOwn(SKILLS, grant.skill)).toBe(true);
		}
	});

	it('no entrega dos veces la misma habilidad', () => {
		const { grants } = getProfession(code);
		expect(new Set(grants.map((g) => g.skill)).size).toBe(grants.length);
	});

	it('entrega niveles válidos', () => {
		for (const grant of getProfession(code).grants) {
			expect(grant.level).toBeGreaterThanOrEqual(1);
			expect(grant.level).toBeLessThanOrEqual(MAX_LEVEL);
		}
	});

	it('respeta los prerrequisitos en el reparto', () => {
		// El Técnico tiene Gestión de energía porque también tiene Mecánica II.
		const levels = startingLevels(code);
		for (const skill of Object.keys(levels)) {
			const faltantes = unmetRequirements(skill, levels);
			expect(
				faltantes.map((r) => r.skill),
				`${code} entrega ${skill} sin cumplir sus requisitos`
			).toEqual([]);
		}
	});

	it('deja al piloto justo en el nivel prometido', () => {
		// Lo que se entrega como experiencia se lee después como el nivel prometido.
		const xp = startingXp(code);
		const levels = startingLevels(code);
		for (const [skill, amount] of Object.entries(xp)) {
			expect(levelFromXp(amount, getSkill(skill).difficulty)).toBe(levels[skill]);
		}
	});
});

describe('el catálogo de profesiones', () => {
	it('tiene códigos únicos que coinciden con la clave', () => {
		for (const [code, profession] of Object.entries(PROFESSIONS)) {
			expect(profession.code).toBe(code);
		}
	});

	it('ofrece variedad de oficios', () => {
		// Si quedan menos de cuatro, la elección de inicio deja de ser una elección.
		expect(Object.keys(PROFESSIONS).length).toBeGreaterThanOrEqual(4);
	});

	it('falla con el nombre si la profesión no existe', () => {
		expect(() => getProfession('pirata')).toThrow(/pirata/);
	});
});
