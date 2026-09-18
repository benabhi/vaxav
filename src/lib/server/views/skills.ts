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
import { paginate, readListing, sift, type Ordenes } from './listing';
import type { Arbol, ConsultaArbol, FilaArbol, PozoRama } from '$lib/tipos';

/**
 * Cuántas habilidades entran en una página.
 *
 * Con ciento once en una sola lista, encontrar una es bajar con la rueda del
 * mouse. Veinte entran en una pantalla sin que haya que buscar el final.
 */
export const SKILLS_PER_PAGE = 20;

/**
 * Por qué se puede ordenar el árbol.
 *
 * El orden de entrada es **el del catálogo**, que agrupa por rama y va de la
 * habilidad de entrada a la más profunda: es cómo está pensado el árbol y cómo se
 * lee cuando uno no busca nada en particular.
 */
export const SKILL_SORTS: Ordenes<FilaArbol> = {
	arbol: (fila) => fila.order,
	nombre: (fila) => fila.name.toLocaleLowerCase('es'),
	rango: (fila) => fila.difficulty,
	nivel: (fila) => fila.level,
	costo: (fila) => fila.cost
};

/**
 * Los filtros, cada uno con su pregunta. Se apilan: entra la que pasa todas.
 *
 * El de estado es el que más se usa y por eso está: con el catálogo entero en
 * pantalla, **«qué puedo subir ahora»** es la única pregunta que uno le hace a
 * esta lista cuando tiene experiencia guardada.
 */
const SKILL_FILTERS: readonly ((fila: FilaArbol, query: ConsultaArbol) => boolean)[] = [
	(fila, query) => !query.family || fila.family === query.family,
	(fila, query) => query.state !== 'entrenadas' || fila.trained,
	(fila, query) => query.state !== 'disponibles' || fila.canInvest,
	(fila, query) => query.state !== 'bloqueadas' || (!fila.canInvest && !fila.maxed),
	(fila, query) => {
		if (!query.search) return true;
		const texto = query.search.toLocaleLowerCase('es');
		return (
			fila.name.toLocaleLowerCase('es').includes(texto) ||
			fila.familyName.toLocaleLowerCase('es').includes(texto) ||
			fila.governs.toLocaleLowerCase('es').includes(texto)
		);
	}
];

/** Los estados por los que se puede recortar la lista. */
export const SKILL_STATES = ['todas', 'entrenadas', 'disponibles', 'bloqueadas'] as const;

/** Lee la consulta del árbol desde la URL, validada contra los catálogos. */
export function readSkillQuery(params: URLSearchParams): ConsultaArbol {
	const family = params.get('rama') ?? '';
	const state = params.get('estado') ?? '';

	return {
		...readListing(params, SKILL_SORTS, 'arbol'),
		family: SKILL_FAMILIES.includes(family as (typeof SKILL_FAMILIES)[number]) ? family : '',
		state: SKILL_STATES.includes(state as (typeof SKILL_STATES)[number]) ? state : 'todas'
	};
}

/** Por qué no se puede invertir, escrito para que lo lea el jugador. */
function blockedLabel(blocker: string | null, cost: number, pool: number): string {
	if (blocker === 'maxed') return 'Ya está al máximo';
	if (blocker === 'requirements') return 'Te faltan requisitos';
	if (blocker === 'pool') return `Te faltan ${cost - pool} del pozo`;
	return '';
}

/** El árbol entero con el pozo de cada rama, en una sola pasada. */
export function buildSkillTree(
	db: Db,
	pilotId: number,
	query = readSkillQuery(new URLSearchParams())
): Arbol {
	const xp = skillXp(db, pilotId);
	const levels = levelsFrom(xp);
	const pozos = pools(db, pilotId);

	const skills: FilaArbol[] = SKILL_LIST.map((skill, indice) => {
		const propio = xp[skill.code] ?? 0;
		const inversion = investmentFor(skill.code, xp, levels, pozos);
		const nivel = levelFromXp(propio, skill.difficulty);

		return {
			code: skill.code,
			name: skill.name,
			// El lugar que ocupa en el catálogo: es el orden de entrada de la lista, y
			// hace falta como clave porque «el orden del árbol» no se deduce de ningún
			// campo de la fila.
			order: indice,
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

	// Los pozos y los contadores miran el árbol entero: filtrar recorta la lista, no
	// cambia cuántas habilidades hay ni cuánto pozo se juntó.
	const pasan = sift(skills, query, SKILL_FILTERS);
	// El desempate es el orden del catálogo, que es único: dos habilidades del mismo
	// rango no pueden salir en cualquier orden entre dos cargas.
	const pagina = paginate(pasan, query, SKILL_SORTS, SKILLS_PER_PAGE, (a, b) => a.order - b.order);

	return {
		pools: pozosRama,
		skills: pagina.rows,
		trained: skills.filter((skill) => skill.trained).length,
		total: skills.length,
		found: pagina.found,
		pages: pagina.pages,
		query: { ...query, page: pagina.page }
	};
}
