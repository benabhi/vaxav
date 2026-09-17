/**
 * La escalera de reputación abre los niveles de misión en el orden correcto.
 *
 * Es la regla que decide a quién le puede pedir trabajo un piloto, así que un
 * error acá se ve como "este agente no me atiende" sin ninguna explicación.
 */

import { describe, expect, it } from 'vitest';
import {
	MAX_REPUTATION,
	MAX_REPUTATION_RAW,
	MIN_REPUTATION,
	MIN_REPUTATION_RAW,
	MISSION_LEVELS,
	REPUTATION_SCALE,
	TIERS,
	canBeHired,
	effectiveMissionLevel,
	missionLevelFor,
	missionLevelForRaw,
	reputationGain,
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

/** Lo que se guarda para tener esos puntos de reputación. */
function puntos(valor: number): number {
	return valor * REPUTATION_SCALE;
}

describe('quién atiende a quién', () => {
	it('no pide papeles si la corporación no tiene bandera', () => {
		// Es el atractivo de un puerto franco: se llega antes y sin caerle bien a nadie.
		for (let level = 1; level <= MISSION_LEVELS; level++) {
			expect(requiredReputation(level, '')).toBe(MIN_REPUTATION);
			expect(canBeHired(level, '', MIN_REPUTATION_RAW, MIN_REPUTATION_RAW)).toBe(true);
		}
	});

	it('con bandera, pide reputación en los niveles altos', () => {
		expect(requiredReputation(4, 'dominion')).toBeGreaterThan(MIN_REPUTATION);
		expect(canBeHired(4, 'dominion', MIN_REPUTATION_RAW, MIN_REPUTATION_RAW)).toBe(false);
	});

	it('atiende en el umbral justo y no un escalón antes', () => {
		const escalon = TIERS[2];
		expect(canBeHired(escalon.level, 'concord', puntos(escalon.reputation), 0)).toBe(true);
		expect(canBeHired(escalon.level, 'concord', puntos(escalon.reputation) - 1, 0)).toBe(false);
	});

	/*
	 * Las dos escaleras: la de la corporación abre a los suyos y la de la facción
	 * abre ese nivel en todas las de su bandera. Al agente le alcanza con una.
	 */
	it('abre con la corporación aunque la facción esté en cero', () => {
		expect(canBeHired(3, 'dominion', puntos(25), 0)).toBe(true);
	});

	it('abre con la facción aunque la corporación esté en cero', () => {
		expect(canBeHired(3, 'dominion', 0, puntos(25))).toBe(true);
	});

	it('vale la más alta de las dos y no la suma', () => {
		// Dos escalones a medio subir no hacen uno entero: si se sumaran, ninguna de
		// las dos escaleras significaría nada por sí sola.
		expect(effectiveMissionLevel(puntos(9), puntos(9))).toBe(1);
		expect(effectiveMissionLevel(puntos(50), puntos(10))).toBe(4);
		expect(effectiveMissionLevel(puntos(10), puntos(50))).toBe(4);
	});
});

describe('cuánto cuesta subir', () => {
	it('se gana una fracción de lo que falta y no una cantidad fija', () => {
		const desdeCero = reputationGain(0, 1);
		const desdeArriba = reputationGain(puntos(80), 1);

		expect(desdeCero).toBe(250);
		expect(desdeArriba).toBeLessThan(desdeCero);
	});

	it('una misión de nivel alto mueve más que una de nivel bajo', () => {
		expect(reputationGain(0, 5)).toBeGreaterThan(reputationGain(0, 1));
	});

	it('nunca pasa del techo, y en el techo ya no da nada', () => {
		expect(reputationGain(MAX_REPUTATION_RAW, 5)).toBe(0);
		expect(reputationGain(MAX_REPUTATION_RAW - 1, 5)).toBeLessThanOrEqual(1);
	});

	it('cerca del último escalón todavía mueve algo, que es para lo que hay decimales', () => {
		// Con enteros esto daría cero y la escalera se moriría justo acá.
		expect(reputationGain(puntos(80), 4)).toBe(200);
	});

	/*
	 * El largo del juego, recorrido de verdad. No es un número lindo: es la
	 * decisión de balance, y si alguien mueve la constante este test se lo dice.
	 */
	it('de cero a Leal con una corporación son doscientas veinticinco misiones', () => {
		const tramos: number[] = [];
		let raw = MIN_REPUTATION_RAW;
		let nivel = missionLevelForRaw(raw);
		let hechas = 0;

		while (missionLevelForRaw(raw) < MISSION_LEVELS && hechas < 5000) {
			// Se hacen las misiones del nivel más alto que esté abierto.
			const abierto = missionLevelForRaw(raw);
			if (abierto !== nivel) {
				tramos.push(hechas);
				nivel = abierto;
			}
			raw += reputationGain(raw, abierto);
			hechas++;
		}
		tramos.push(hechas);

		expect(hechas).toBe(225);
		// Y cada tramo es del orden del anterior: ninguno es un muro.
		expect(tramos).toEqual([43, 79, 133, 225]);
	});
});
