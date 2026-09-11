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
	distributeXp,
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

	it('cobra cada nivel al triple que el anterior', () => {
		for (let i = 1; i < LEVEL_COSTS.length; i++) {
			expect(LEVEL_COSTS[i]).toBe(LEVEL_COSTS[i - 1] * 3);
		}
	});

	it('da la tabla del diseño para una habilidad fácil', () => {
		// 100 · 400 · 1.300 · 4.000 · 12.100, tal como está documentado.
		const tabla = [0, 1, 2, 3, 4, 5].map((nivel) => xpForLevel(nivel, 1));
		expect(tabla).toEqual([0, 100, 400, 1300, 4000, 12100]);
	});

	it('encarece de forma proporcional con el multiplicador', () => {
		for (const dificultad of DIFFICULTIES) {
			expect(xpForLevel(MAX_LEVEL, dificultad)).toBe(12100 * dificultad);
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
		expect(levelFromXp(399, 1)).toBe(1);
		expect(levelFromXp(12100, 1)).toBe(5);
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
		expect(xpToNextLevel(100, 1)).toBe(300);
		expect(xpToNextLevel(150, 2)).toBe(50);
	});

	it('al máximo ya no tiene nada que pedir', () => {
		expect(xpToNextLevel(12100, 1)).toBeNull();
	});

	it('mide el avance dentro del nivel', () => {
		expect(levelProgress(100, 1)).toBe(0);
		expect(levelProgress(250, 1)).toBe(0.5);
		expect(levelProgress(12100, 1)).toBe(1);
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

	it('le da el pozo entero a la principal y su parte a cada secundaria', () => {
		// El otro ejemplo del diseño: 600 a Minería, 90 a cada secundaria.
		const reparto = distributeXp(600, 'mining', ['stowage', 'prospecting']);
		expect(reparto).toEqual({ mining: 600, stowage: 90, prospecting: 90 });
	});

	it('no reparte las secundarias entre ellas', () => {
		// Sumar secundarias no le baja la experiencia a las que ya estaban.
		const dos = distributeXp(600, 'mining', ['stowage', 'prospecting']);
		const tres = distributeXp(600, 'mining', ['stowage', 'prospecting', 'refining']);
		expect(tres.stowage).toBe(dos.stowage);
	});

	it('admite una acción sin secundarias', () => {
		expect(distributeXp(120, 'navigation')).toEqual({ navigation: 120 });
	});

	it('se niega a repartir a una habilidad inexistente', () => {
		expect(() => distributeXp(100, 'warp_drive')).toThrow();
		expect(() => distributeXp(100, 'mining', ['warp_drive'])).toThrow();
	});
});
