/**
 * El árbol de habilidades del piloto, listo para dibujar.
 *
 * Trae **el catálogo entero** y no sólo lo entrenado: la pantalla es dónde se
 * decide en qué gastar el pozo, así que tiene que mostrar lo que todavía no se
 * tiene. Una lista de lo que ya sabés no ayuda a elegir.
 *
 * De cada habilidad viene resuelto el costo del salto y **por qué no se puede
 * dar**, si no se puede: un botón apagado que no explica nada es peor que uno
 * que no está.
 */

import type { Db } from '../db/types';
import { skillXp } from '../services/pilots';
import { levelsFrom, pools } from '../services/pools';
import { investmentFor } from '$lib/game/pools';
import { levelFromXp, levelProgress } from '$lib/game/progression';
import { SKILL_FAMILIES, SKILL_LIST, getSkill } from '$lib/game/skills';
import { roman, skillFamilyIcon, skillFamilyLabel } from '$lib/format';
import type { Arbol, FilaArbol, PozoRama } from '$lib/tipos';

/** Por qué no se puede invertir, escrito para que lo lea el jugador. */
function blockedLabel(blocker: string | null, cost: number, pool: number): string {
	if (blocker === 'maxed') return 'Ya está al máximo';
	if (blocker === 'requirements') return 'Te faltan requisitos';
	if (blocker === 'pool') return `Te faltan ${cost - pool} del pozo`;
	return '';
}

/** El árbol entero con el pozo de cada rama, en una sola pasada. */
export function buildSkillTree(db: Db, pilotId: number): Arbol {
	const xp = skillXp(db, pilotId);
	const levels = levelsFrom(xp);
	const pozos = pools(db, pilotId);

	const skills: FilaArbol[] = SKILL_LIST.map((skill) => {
		const propio = xp[skill.code] ?? 0;
		const inversion = investmentFor(skill.code, xp, levels, pozos);
		const nivel = levelFromXp(propio, skill.difficulty);

		return {
			code: skill.code,
			name: skill.name,
			family: skill.family,
			familyName: skillFamilyLabel(skill.family),
			familyIcon: skillFamilyIcon(skill.family),
			governs: skill.governs,
			difficulty: skill.difficulty,
			level: nivel,
			levelLabel: roman(nivel) || '0',
			xp: propio,
			progress: Math.trunc(levelProgress(propio, skill.difficulty) * 100),
			cost: inversion.cost,
			nextLevel: inversion.nextLevel,
			canInvest: inversion.canInvest,
			blocked: blockedLabel(inversion.blocker, inversion.cost, inversion.pool),
			// Con su nombre y su nivel: "Navegación 3" se entiende, `navigation` no.
			missing: inversion.missing.map((req) => `${getSkill(req.skill).name} ${req.level}`),
			trained: propio > 0,
			maxed: inversion.blocker === 'maxed'
		};
	});

	const pozosRama: PozoRama[] = SKILL_FAMILIES.map((family) => {
		const deLaRama = skills.filter((skill) => skill.family === family);
		return {
			family,
			name: skillFamilyLabel(family),
			icon: skillFamilyIcon(family),
			xp: pozos[family] ?? 0,
			// Cuántas se pueden subir **ahora mismo**: es lo que convierte un número
			// suelto en una decisión.
			affordable: deLaRama.filter((skill) => skill.canInvest).length,
			total: deLaRama.length
		};
	});

	return {
		pools: pozosRama,
		skills,
		trained: skills.filter((skill) => skill.trained).length,
		total: skills.length
	};
}
