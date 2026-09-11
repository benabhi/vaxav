/**
 * El pozo por familia: dónde está la escasez de la progresión.
 *
 * Una acción no le paga experiencia a una habilidad, se la paga a la **familia**
 * de la actividad, y el piloto decide en qué habilidad de esa rama gastarla. Ver
 * docs/systems/SKILLS.md.
 *
 * Acá viven las reglas puras de ese gasto: cuánto cuesta un nivel, si alcanza y
 * si la habilidad está habilitada. Como el resto de `game/`, no sabe de la base
 * ni de SvelteKit, así que se prueba sin levantar nada.
 */

import { MAX_LEVEL, levelFromXp, levelUpCost } from './progression';
import { getSkill, unmetRequirements, type Requirement, type SkillFamily } from './skills';

/** Cuánto tiene el piloto en cada rama. Una rama ausente es una rama en cero. */
export type Pools = Readonly<Partial<Record<SkillFamily, number>>>;

/** Por qué no se puede invertir en una habilidad, o `null` si se puede. */
export type Blocker = 'maxed' | 'requirements' | 'pool';

/** Lo que hace falta saber para ofrecer —o no— el salto de nivel. */
export interface Investment {
	readonly skill: string;
	readonly family: SkillFamily;
	/** El nivel actual y al que llevaría la inversión. */
	readonly level: number;
	readonly nextLevel: number;
	/** Lo que cuesta el salto. Cero si ya está al tope. */
	readonly cost: number;
	/** Lo que hay en el pozo de su rama. */
	readonly pool: number;
	readonly canInvest: boolean;
	/** Qué lo impide, si algo lo impide. */
	readonly blocker: Blocker | null;
	/** Las habilidades que le faltan al piloto, con el nivel que exigen. */
	readonly missing: readonly Requirement[];
}

/**
 * Qué puede hacer el piloto con una habilidad, ahora mismo.
 *
 * Devuelve el panorama entero —costo, pozo y el motivo del bloqueo— en vez de un
 * booleano, porque la pantalla necesita **decir por qué**: un botón apagado que
 * no explica nada es peor que uno que no está.
 */
export function investmentFor(
	code: string,
	xpBySkill: Readonly<Record<string, number>>,
	levels: Readonly<Record<string, number>>,
	pools: Pools
): Investment {
	const skill = getSkill(code);
	const xp = xpBySkill[code] ?? 0;
	const level = levelFromXp(xp, skill.difficulty);
	const pool = pools[skill.family] ?? 0;
	const missing = unmetRequirements(code, levels);
	const cost = levelUpCost(xp, skill.difficulty);

	// El orden importa: primero lo que no cambia con el tiempo. A quien está al
	// tope no se le dice que le falta pozo, porque juntarlo no lo va a destrabar.
	let blocker: Blocker | null = null;
	if (level >= MAX_LEVEL || cost === null) blocker = 'maxed';
	else if (missing.length > 0) blocker = 'requirements';
	else if (pool < cost) blocker = 'pool';

	return {
		skill: code,
		family: skill.family,
		level,
		nextLevel: Math.min(MAX_LEVEL, level + 1),
		cost: cost ?? 0,
		pool,
		canInvest: blocker === null,
		blocker,
		missing
	};
}
