/**
 * La curva de experiencia es la que dice el diseño, y se lee en los dos
 * sentidos.
 *
 * Los números de acá salen de docs/systems/SKILLS.md. Si alguien los cambia,
 * tiene que cambiar el documento en el mismo commit: para eso están escritos a
 * mano y no calculados a partir del propio código.
 */

import { describe, expect, it } from 'vitest';
import {
	LEVEL_COSTS,
	LEVEL_THRESHOLDS,
	MAX_LEVEL,
	actionXpPool,
	levelFromXp,
	levelProgress,
	xpForLevel,
	xpToNextLevel
} from './progression';

const DIFFICULTIES = [1, 2, 3, 4, 5];

describe('la curva', () => {
	it('tiene umbrales que son la suma de los costos', () => {
		let acumulado = 0;
		const esperado = [0];
		for (const costo of LEVEL_COSTS) {
			acumulado += costo;
			esperado.push(acumulado);
		}
		expect([...LEVEL_THRESHOLDS]).toEqual(esperado);
	});

	/*
	 * La raíz de 32, que es la de EVE. Con el triple que había antes, el nivel 5
	 * costaba apenas el doble que los cuatro anteriores juntos y especializarse no
	 * dolía; con esto cuesta cinco veces y media lo que los cuatro juntos.
	 */
	it('cobra cada nivel 5,66 veces el anterior', () => {
		for (let i = 1; i < LEVEL_COSTS.length; i++) {
			expect(LEVEL_COSTS[i] / LEVEL_COSTS[i - 1]).toBeCloseTo(Math.sqrt(32), 2);
		}
	});

	it('deja el nivel 1 a diez minutos de juego', () => {
		// Cien de experiencia son diez minutos de acción a dificultad 1. Es lo que
		// hace que el primer nivel se sienta enseguida, y no se toca.
		expect(xpForLevel(1, 1)).toBe(100);
	});

	/*
	 * El último nivel es el que separa a un piloto de otro: tiene que costar mucho
	 * más que todo lo anterior junto, o llevar todo al 5 se vuelve una rutina.
	 */
	it('hace del nivel 5 una decisión y no un trámite', () => {
		const hastaCuatro = xpForLevel(4, 1);
		const elQuinto = xpForLevel(5, 1) - hastaCuatro;
		expect(elQuinto / hastaCuatro).toBeGreaterThan(4);
	});

	it('da la tabla del diseño para una habilidad fácil', () => {
		// 100 · 666 · 3.866 · 21.968 · 124.368, tal como está documentado.
		const tabla = [0, 1, 2, 3, 4, 5].map((nivel) => xpForLevel(nivel, 1));
		expect(tabla).toEqual([0, 100, 666, 3866, 21968, 124368]);
	});

	it('encarece de forma proporcional con el multiplicador', () => {
		for (const dificultad of DIFFICULTIES) {
			expect(xpForLevel(MAX_LEVEL, dificultad)).toBe(124368 * dificultad);
		}
	});

	it('no conoce niveles fuera de rango', () => {
		expect(() => xpForLevel(6, 1)).toThrow();
		expect(() => xpForLevel(-1, 1)).toThrow();
	});
});

describe('traducir experiencia a nivel', () => {
	it('da el nivel correcto', () => {
		expect(levelFromXp(0, 1)).toBe(0);
		expect(levelFromXp(99, 1)).toBe(0);
		expect(levelFromXp(100, 1)).toBe(1);
		expect(levelFromXp(665, 1)).toBe(1);
		expect(levelFromXp(124368, 1)).toBe(5);
	});

	it('no pasa del nivel máximo', () => {
		// Se puede seguir acumulando experiencia, pero no sube nada.
		expect(levelFromXp(999_999, 1)).toBe(MAX_LEVEL);
	});

	it('va y vuelve entre nivel y experiencia', () => {
		for (const dificultad of DIFFICULTIES) {
			for (let nivel = 0; nivel <= MAX_LEVEL; nivel++) {
				expect(levelFromXp(xpForLevel(nivel, dificultad), dificultad)).toBe(nivel);
			}
		}
	});

	it('dice lo que falta para el próximo nivel', () => {
		expect(xpToNextLevel(0, 1)).toBe(100);
		expect(xpToNextLevel(100, 1)).toBe(566);
		// Con multiplicador, el umbral se escala igual que el costo: el nivel 1 de
		// una x2 cuesta 200, así que a los 150 le faltan 50.
		expect(xpToNextLevel(150, 2)).toBe(50);
	});

	it('al máximo ya no tiene nada que pedir', () => {
		expect(xpToNextLevel(124368, 1)).toBeNull();
	});

	it('mide el avance dentro del nivel', () => {
		expect(levelProgress(100, 1)).toBe(0);
		// La mitad del segundo nivel: 100 de piso, 666 de techo, 383 en el medio.
		expect(levelProgress(383, 1)).toBe(0.5);
		expect(levelProgress(124368, 1)).toBe(1);
	});
});

describe('el pozo de una acción', () => {
	it('sale de su duración', () => {
		// El ejemplo del diseño: 40 minutos con dificultad 1,5 dan 600.
		expect(actionXpPool(40, 1.5)).toBe(600);
		expect(actionXpPool(12)).toBe(120);
	});

	it('no acepta una acción que dure menos que nada', () => {
		expect(() => actionXpPool(-1)).toThrow();
	});
});
