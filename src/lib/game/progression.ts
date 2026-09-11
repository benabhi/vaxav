/**
 * Experiencia: cuánto cuesta cada nivel y cómo se reparte lo que da una acción.
 *
 * Todo lo de acá son funciones puras sobre números. El estado del piloto
 * —cuánta experiencia lleva en cada habilidad— vive en la capa de datos; este
 * módulo sólo sabe traducir experiencia a niveles y acciones a experiencia.
 *
 * Corresponde a docs/systems/SKILLS.md y docs/systems/ACTIONS.md.
 */

import { truncate } from './math';
import { getSkill } from './skills';

export const MAX_LEVEL = 5;

/**
 * Experiencia que cuesta *cada* nivel, antes del multiplicador de la habilidad.
 * Son potencias de tres: cada nivel cuesta el triple que el anterior.
 */
export const LEVEL_COSTS: readonly number[] = [100, 300, 900, 2700, 8100];

/**
 * Experiencia acumulada necesaria para *tener* cada nivel, con el nivel 0 en
 * cero.
 */
export const LEVEL_THRESHOLDS: readonly number[] = [0, 100, 400, 1300, 4000, 12100];

/** Cuánta experiencia reparte un minuto de acción, antes de la dificultad. */
export const XP_PER_MINUTE = 10;

/**
 * Fracción del pozo que recibe cada habilidad secundaria. No se divide entre
 * ellas: cada una recibe esta porción, así una acción con muchas secundarias no
 * castiga a ninguna.
 */
export const SECONDARY_SHARE = 0.15;

/**
 * Experiencia acumulada que hace falta para *tener* `level`.
 *
 * El nivel 0 no cuesta nada; el 5 de una habilidad x1 cuesta 12.100.
 */
export function xpForLevel(level: number, difficulty: number): number {
	if (level < 0 || level > MAX_LEVEL) throw new RangeError(`Nivel fuera de rango: ${level}`);
	return LEVEL_THRESHOLDS[level] * difficulty;
}

/**
 * Nivel alcanzado con esa experiencia acumulada.
 *
 * Devuelve 0 mientras no alcance para el primer nivel, y nunca pasa de 5: la
 * experiencia de más allá del nivel máximo se sigue acumulando pero no sube
 * nada.
 */
export function levelFromXp(xp: number, difficulty: number): number {
	let level = 0;
	for (let candidate = 1; candidate <= MAX_LEVEL; candidate++) {
		if (xp >= xpForLevel(candidate, difficulty)) level = candidate;
		else break;
	}
	return level;
}

/** Cuánta experiencia falta para el próximo nivel, o `null` si ya está al 5. */
export function xpToNextLevel(xp: number, difficulty: number): number | null {
	const level = levelFromXp(xp, difficulty);
	if (level >= MAX_LEVEL) return null;
	return xpForLevel(level + 1, difficulty) - xp;
}

/**
 * Avance dentro del nivel actual, de 0 a 1.
 *
 * Sirve para la barra de progreso de la pantalla de habilidades. Una habilidad
 * al nivel máximo devuelve 1.
 */
export function levelProgress(xp: number, difficulty: number): number {
	const level = levelFromXp(xp, difficulty);
	if (level >= MAX_LEVEL) return 1;
	const floor = xpForLevel(level, difficulty);
	const ceiling = xpForLevel(level + 1, difficulty);
	return (xp - floor) / (ceiling - floor);
}

/**
 * Experiencia que reparte una acción según lo que duró y lo exigente que fue.
 *
 * `difficultyFactor` va de 0,5 a 3 y es propio de cada tipo de acción: no es el
 * multiplicador de la habilidad, que es otra cosa.
 */
export function actionXpPool(minutes: number, difficultyFactor: number = 1): number {
	if (minutes < 0) throw new RangeError('Una acción no puede durar menos que nada');
	return truncate(minutes * XP_PER_MINUTE * difficultyFactor);
}

/**
 * Reparte el pozo de una acción entre la habilidad principal y las secundarias.
 *
 * La principal se lleva el pozo completo; cada secundaria, su fracción. Si una
 * habilidad aparece como principal y como secundaria, se le suman las dos
 * porciones en vez de perderse una.
 */
export function distributeXp(
	pool: number,
	primary: string,
	secondaries: readonly string[] = []
): Record<string, number> {
	// Falla temprano y con un mensaje claro si el catálogo no la conoce.
	getSkill(primary);

	const awarded: Record<string, number> = { [primary]: pool };
	for (const code of secondaries) {
		getSkill(code);
		awarded[code] = (awarded[code] ?? 0) + truncate(pool * SECONDARY_SHARE);
	}
	return awarded;
}

/**
 * Lo que cuesta llevar una habilidad al nivel siguiente.
 *
 * Es exactamente lo que le falta: el umbral del nivel que viene menos lo que ya
 * tiene. `null` cuando está al tope, porque no hay nivel siguiente que comprar.
 *
 * El costo sale de la misma curva que todo lo demás, así que una habilidad
 * difícil cuesta más sin que haya una segunda tabla que mantener sincronizada.
 */
export function levelUpCost(xp: number, difficulty: number): number | null {
	return xpToNextLevel(xp, difficulty);
}
