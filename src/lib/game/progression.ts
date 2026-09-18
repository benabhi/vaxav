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

export const MAX_LEVEL = 5;

/**
 * Cuánto crece el costo de un nivel al siguiente: **la raíz de 32**.
 *
 * Es la misma proporción que usa EVE, y la razón por la que la usa es la que nos
 * sirve: con un crecimiento suave —el triple, que es lo que había acá— el nivel 5
 * cuesta apenas el doble que los cuatro anteriores juntos, y entonces
 * especializarse no duele. Con 5,66 el último nivel cuesta **cinco veces y media**
 * lo que los cuatro juntos, y ahí el 5 deja de ser un trámite y pasa a ser una
 * decisión de identidad.
 *
 * Es el número que hay que mover si las habilidades suben demasiado rápido. No el
 * de la experiencia por minuto: bajar aquél no hace el juego más largo, hace cada
 * sesión más aburrida.
 */
const CRECIMIENTO = Math.sqrt(32);

/**
 * Lo que cuesta el primer nivel.
 *
 * Cien, como siempre: **el nivel 1 se siente a los diez minutos de jugar** y eso
 * había que cuidarlo. Lo que se empinó es lo que viene después.
 */
const COSTO_BASE = 100;

/**
 * Experiencia que cuesta *cada* nivel, antes del multiplicador de la habilidad.
 *
 * **Se calcula, no se escribe.** Dos listas a mano son dos listas que se
 * desfasan: la de costos y la de umbrales tienen que decir lo mismo, y la única
 * forma de garantizarlo es que una salga de la otra.
 *
 * Da 100 · 566 · 3.200 · 18.102 · 102.400.
 */
export const LEVEL_COSTS: readonly number[] = Array.from({ length: MAX_LEVEL }, (_, i) =>
	Math.round(COSTO_BASE * CRECIMIENTO ** i)
);

/**
 * Experiencia acumulada necesaria para *tener* cada nivel, con el nivel 0 en cero.
 *
 * Da 0 · 100 · 666 · 3.866 · 21.968 · 124.368. A seiscientos de experiencia por
 * hora de acción, un rango x1 llega al nivel 5 en unas doscientas horas y un x16
 * en más de tres mil. Ver docs/RESEARCH.md §4.
 */
export const LEVEL_THRESHOLDS: readonly number[] = LEVEL_COSTS.reduce(
	(acumulado: number[], costo) => [...acumulado, acumulado[acumulado.length - 1] + costo],
	[0]
);

/** Cuánta experiencia reparte un minuto de acción, antes de la dificultad. */
export const XP_PER_MINUTE = 10;

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
