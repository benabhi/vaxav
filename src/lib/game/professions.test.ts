/**
 * Las profesiones están balanceadas y son coherentes con el árbol de
 * habilidades.
 *
 * El presupuesto común es lo que hace que el balance sea verificable: si las
 * seis suman lo mismo, ninguna empieza mejor. Y ninguna puede entregar una
 * habilidad que el piloto no habría podido entrenar por su cuenta.
 */

import { describe, expect, it } from 'vitest';
import { kitSummary } from '$lib/format';
import { getItem } from './items';
import {
	PLAYABLE_PROFESSIONS,
	PROFESSIONS,
	STARTING_XP_BUDGET,
	getProfession,
	professionCost,
	startingLevels,
	startingXp
} from './professions';
import { MAX_LEVEL, levelFromXp } from './progression';
import { SKILLS, SKILL_FAMILIES, getSkill, unmetRequirements } from './skills';

const CODES = Object.keys(PROFESSIONS).sort();

describe('el catálogo', () => {
	it('tiene exactamente una profesión por familia de habilidades', () => {
		// La familia es la que tiene pozo propio: una sin oficio de entrada es una
		// rama a la que nadie llega con el repartidor puesto, y dos oficios en la
		// misma familia son dos formas de empezar en el mismo lugar.
		const suyas = Object.values(PROFESSIONS).map((profession) => profession.family);
		expect([...suyas].sort()).toEqual([...SKILL_FAMILIES].sort());
	});

	it('entrega al menos una habilidad de la familia que declara', () => {
		// Si ninguna lo fuera, la familia sería una etiqueta y no un oficio.
		for (const profession of Object.values(PROFESSIONS)) {
			const suyas = profession.grants.filter(
				(grant) => getSkill(grant.skill).family === profession.family
			);
			expect(suyas.length, profession.code).toBeGreaterThan(0);
		}
	});
});

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

describe('con qué sale a volar', () => {
	it('el minero trae su láser montado y un repuesto en la caja', () => {
		const kit = getProfession('miner').kit;

		// El escáner va montado como el láser: sin él un cinturón no dice qué tiene,
		// y un minero que no puede leer la roca no puede trabajar.
		expect(kit.filter((entrada) => entrada.fitted).map((e) => e.item)).toEqual([
			'mining_laser_i1',
			'cargo_rack_i1',
			'scanner_i1'
		]);
		expect(kit.filter((entrada) => !entrada.fitted).map((e) => e.item)).toEqual([
			'mining_laser_i1'
		]);
	});

	it('el equipo se puede leer en una línea, para la pantalla de alta', () => {
		// Elegir un oficio es elegir con qué arrancás, y eso tiene que poder leerse
		// antes de elegir: un minero sin láser es un minero que no puede minar.
		const linea = kitSummary('miner');

		expect(linea).toContain('Láser de extracción (montado)');
		expect(linea).toContain('Láser de extracción (en bodega)');
	});

	it('todo lo del kit existe en el catálogo de ítems', () => {
		// Un kit que nombra algo inexistente revienta recién al crear un piloto.
		for (const profession of Object.values(PROFESSIONS)) {
			for (const entrada of profession.kit) {
				expect(() => getItem(entrada.item), `${profession.code}: ${entrada.item}`).not.toThrow();
			}
		}
	});
});

describe('cuáles se ofrecen', () => {
	it('sólo se ofrece la que tiene algo que hacer', () => {
		// Una profesión se elige cuando hay actividades detrás. Ofrecer explorador
		// sin exploración es ofrecer un nombre.
		expect(PLAYABLE_PROFESSIONS.map((profession) => profession.code)).toEqual(['miner']);
	});

	it('las que no se ofrecen siguen en el catálogo', () => {
		// Se quedan para que el presupuesto las siga verificando y para que un
		// piloto que ya las tenga pueda seguir jugando.
		expect(Object.keys(PROFESSIONS).length).toBeGreaterThan(PLAYABLE_PROFESSIONS.length);
	});
});
