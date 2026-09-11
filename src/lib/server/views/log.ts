/**
 * Los informes de la bitácora, listos para dibujar.
 *
 * Un informe dice qué se hizo, dónde, cuánto tardó y cuánta experiencia dejó a
 * cada habilidad —con el nivel al que quedó, que es lo que convierte un número
 * suelto en un avance. El formato está en docs/systems/ACTIONS.md.
 *
 * La misma forma alimenta el aviso que salta al resolverse una acción y cada
 * fila de la bitácora: es el mismo hecho contado una sola vez.
 */

import { inArray } from 'drizzle-orm';
import { body, type PilotLog } from '../db/schema';
import type { Db } from '../db/types';
import { logPage, type LogPage, type XpChange } from '../services/log';
import { MAX_LEVEL, levelFromXp, levelProgress, xpForLevel } from '$lib/game/progression';
import { getSkill } from '$lib/game/skills';
import { remainingLabel, roman, skillFamilyLabel } from '$lib/format';
import type { IconName } from '$lib/icons';
import type { GananciaXp, Informe, PaginaBitacora } from '$lib/tipos';

/**
 * El titular de todo informe de acción.
 *
 * Es el mismo siempre y a propósito: van a ser muchas acciones —viajar, minar,
 * refinar, entregar— y todas responden a la misma pregunta al volver, "¿terminó
 * lo que había pedido?". Qué acción fue lo dice el renglón de abajo.
 */
const ACTION_TITLE = 'Acción terminada';

/** Cómo se llama cada clase de acción, y con qué se la dibuja. */
const KINDS: Record<string, { label: string; icon: IconName }> = {
	travel: { label: 'Viaje', icon: 'rocket-launch' }
};

/** El nombre y el ícono de una clase de acción, o algo genérico si es nueva. */
function kindOf(kind: string): { label: string; icon: IconName } {
	return KINDS[kind] ?? { label: 'Acción', icon: 'clipboard-text' };
}

/**
 * Lo que la acción le dejó a cada habilidad, con el nivel de **ese** momento.
 *
 * El antes y el después salen de la fila y no del piloto de hoy: la bitácora es
 * un registro, y un informe de la semana pasada tiene que seguir contando lo que
 * pasó la semana pasada.
 */
function buildXp(cambios: readonly XpChange[]): GananciaXp[] {
	const filas: GananciaXp[] = [];

	for (const cambio of cambios) {
		if (!cambio.xp) continue;
		const spec = getSkill(cambio.skill);

		const nivelAntes = levelFromXp(cambio.before, spec.difficulty);
		const nivel = levelFromXp(cambio.after, spec.difficulty);
		const siguiente =
			nivel >= MAX_LEVEL ? 0 : Math.max(0, xpForLevel(nivel + 1, spec.difficulty) - cambio.after);

		filas.push({
			skill: cambio.skill,
			name: spec.name,
			family: skillFamilyLabel(spec.family),
			xp: cambio.xp,
			before: cambio.before,
			after: cambio.after,
			// El nivel 0 no tiene romano, y "nivel · 11 %" se lee roto. Acá es
			// legítimo decirlo con un cero: una habilidad recién empezada está en
			// cero y el informe tiene que poder contarlo.
			level: roman(nivel) || '0',
			levelBefore: roman(nivelAntes) || '0',
			leveledUp: nivel > nivelAntes,
			progress: Math.trunc(levelProgress(cambio.after, spec.difficulty) * 100),
			toNext: siguiente
		});
	}

	// El que más dio primero: es el que explica la acción. Un salto de nivel se
	// adelanta a todo, porque es lo único que el jugador estaba esperando.
	return filas.sort((a, b) => Number(b.leveledUp) - Number(a.leveledUp) || b.xp - a.xp);
}

/**
 * Lo que se guardó como JSON, de vuelta a cambios, sin romperse si vino mal.
 *
 * Acepta también la forma vieja —un objeto de código a puntos, sin el antes— que
 * es lo que se escribió antes de que la bitácora guardara el salto de nivel.
 * Esas filas no pueden decir si subieron, y es lo honesto: no se guardó.
 */
function parseXp(raw: string): XpChange[] {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		// Una fila corrupta no puede dejar la bitácora entera sin dibujar.
		return [];
	}

	if (Array.isArray(parsed)) return parsed as XpChange[];

	if (parsed && typeof parsed === 'object') {
		return Object.entries(parsed as Record<string, number>).map(([skill, xp]) => ({
			skill,
			xp,
			before: 0,
			after: xp
		}));
	}

	return [];
}

/**
 * Arma un informe a partir de su fila.
 *
 * Los nombres de los cuerpos llegan ya resueltos: la bitácora es una lista y
 * consultarlos por fila sería una consulta por renglón para nombrar dos lugares.
 */
function buildEntry(row: PilotLog, names: ReadonlyMap<number, string>): Informe {
	const { label, icon } = kindOf(row.kind);
	const origin = row.originBodyId === null ? '' : (names.get(row.originBodyId) ?? '');
	const destination =
		row.destinationBodyId === null ? '' : (names.get(row.destinationBodyId) ?? '');

	const details: { label: string; value: string }[] = [];
	if (origin) details.push({ label: 'Salida', value: origin });
	if (row.durationSeconds) {
		details.push({ label: 'Duración', value: remainingLabel(row.durationSeconds) });
	}

	const xp = buildXp(parseXp(row.xpAwarded));

	return {
		id: row.id,
		kind: row.kind,
		title: ACTION_TITLE,
		kindLabel: label,
		icon,
		place: destination || origin,
		at: row.createdAt.getTime(),
		details,
		xp,
		xpTotal: xp.reduce((suma, fila) => suma + fila.xp, 0),
		unread: row.readAt === null
	};
}

/** Los nombres de todos los cuerpos que menciona una tanda de informes. */
function bodyNames(db: Db, rows: readonly PilotLog[]): Map<number, string> {
	const ids = new Set<number>();
	for (const row of rows) {
		if (row.originBodyId !== null) ids.add(row.originBodyId);
		if (row.destinationBodyId !== null) ids.add(row.destinationBodyId);
	}
	if (ids.size === 0) return new Map();

	const found = db
		.select({ id: body.id, name: body.name })
		.from(body)
		.where(inArray(body.id, [...ids]))
		.all();
	return new Map(found.map((fila) => [fila.id, fila.name]));
}

/** Convierte una página cruda de la bitácora en informes listos para dibujar. */
export function buildLogPage(db: Db, pilotId: number, page: LogPage): PaginaBitacora {
	const names = bodyNames(db, page.entries);

	return {
		entries: page.entries.map((row) => buildEntry(row, names)),
		total: page.total,
		page: page.page,
		pages: page.pages
	};
}

/** La página que pidió la pantalla de la bitácora. */
export function buildBitacora(db: Db, pilotId: number, page = 1): PaginaBitacora {
	return buildLogPage(db, pilotId, logPage(db, pilotId, page));
}

/**
 * El informe de una fila suelta, que es lo que muestra el aviso al volver.
 *
 * Se lo arma desde la fila ya escrita y no desde lo que devolvió la resolución
 * para que el aviso y la bitácora digan literalmente lo mismo: si alguna vez se
 * separan, es porque hay dos fuentes.
 */
export function buildInforme(db: Db, row: PilotLog): Informe {
	return buildEntry(row, bodyNames(db, [row]));
}
