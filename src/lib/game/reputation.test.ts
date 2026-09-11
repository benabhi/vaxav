/**
 * La escalera de reputación abre los niveles de misión en el orden correcto.
 *
 * Es la regla que decide a quién le puede pedir trabajo un piloto, así que un
 * error acá se ve como "este agente no me atiende" sin ninguna explicación.
 */

import { describe, expect, it } from 'vitest';
import {
	MAX_REPUTATION,
	MIN_REPUTATION,
	MISSION_LEVELS,
	TIERS,
	canBeHired,
	missionLevelFor,
	requiredReputation,
	tierFor,
	tierForLevel
} from './reputation';

describe('la escalera', () => {
	it('tiene un escalón por nivel de misión', () => {
		expect(TIERS).toHaveLength(MISSION_LEVELS);
	});

	it('va del uno al cinco sin saltos', () => {
		const niveles = TIERS.map((tier) => tier.level);
		expect(niveles).toEqual([1, 2, 3, 4, 5]);
	});

	it('pide más en cada escalón que en el anterior', () => {
		// Una escalera que no sube no es una escalera.
		const exigencias = TIERS.map((tier) => tier.reputation);
		expect(exigencias).toEqual([...exigencias].sort((a, b) => a - b));
		expect(new Set(exigencias).size).toBe(exigencias.length);
	});

	it('no pide nada en el primer nivel', () => {
		// Un piloto recién creado tiene que poder trabajar para alguien.
		expect(TIERS[0].reputation).toBe(MIN_REPUTATION);
	});

	it('mantiene el último escalón dentro de la escala', () => {
		expect(TIERS[TIERS.length - 1].reputation).toBeLessThanOrEqual(MAX_REPUTATION);
	});

	it('le da nombre a todo escalón', () => {
		for (const tier of TIERS) expect(tier.name.trim()).not.toBe('');
	});
});

describe('a qué nivel de misión se llega', () => {
	it('sin reputación, sólo al primero', () => {
		expect(missionLevelFor(MIN_REPUTATION)).toBe(1);
	});

	it('con la reputación máxima, al último', () => {
		expect(missionLevelFor(MAX_REPUTATION)).toBe(MISSION_LEVELS);
	});

	it('cuenta el escalón justo en el umbral', () => {
		// El escalón se alcanza al llegar, no al pasarlo.
		for (const tier of TIERS) {
			expect(missionLevelFor(tier.reputation)).toBeGreaterThanOrEqual(tier.level);
		}
	});

	it('no cuenta un punto antes del umbral', () => {
		for (const tier of TIERS.slice(1)) {
			expect(missionLevelFor(tier.reputation - 1)).toBe(tier.level - 1);
		}
	});

	it('devuelve el escalón más alto alcanzado y no el primero', () => {
		expect(tierFor(MAX_REPUTATION).level).toBe(MISSION_LEVELS);
	});

	it('falla claro si el nivel no existe', () => {
		expect(() => tierForLevel(MISSION_LEVELS + 1)).toThrow(/nivel de misión/);
		expect(() => tierForLevel(0)).toThrow();
	});
});

describe('quién atiende a quién', () => {
	it('no pide papeles si la corporación no tiene bandera', () => {
		// Es el atractivo de un puerto franco: se llega antes y sin caerle bien a nadie.
		for (let level = 1; level <= MISSION_LEVELS; level++) {
			expect(requiredReputation(level, '')).toBe(MIN_REPUTATION);
			expect(canBeHired(level, '', MIN_REPUTATION)).toBe(true);
		}
	});

	it('con bandera, pide reputación en los niveles altos', () => {
		expect(requiredReputation(4, 'dominion')).toBeGreaterThan(MIN_REPUTATION);
		expect(canBeHired(4, 'dominion', MIN_REPUTATION)).toBe(false);
	});

	it('atiende con la reputación justa y no con una menos', () => {
		const needed = requiredReputation(3, 'concord');
		expect(canBeHired(3, 'concord', needed)).toBe(true);
		expect(canBeHired(3, 'concord', needed - 1)).toBe(false);
	});
});
