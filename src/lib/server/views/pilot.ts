/**
 * Lo que toda pantalla del juego sabe del piloto conectado.
 *
 * Es una función pura sobre datos ya leídos: recibe lo que hay en la base y
 * devuelve lo que la pantalla dibuja. Que sea pura es lo que permite probarla
 * sin levantar nada, igual que las reglas del juego.
 */

import { eq } from 'drizzle-orm';
import { body, system, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { getFaction } from '$lib/game/factions';
import { getProfession } from '$lib/game/professions';
import { levelFromXp, levelProgress } from '$lib/game/progression';
import { SKILL_LIST } from '$lib/game/skills';
import { skillXp } from '../services/pilots';
import { roman, starStates, thousands } from '$lib/format';
import type { FilaHabilidad, PilotoConectado } from '$lib/tipos';

/**
 * Traduce experiencia cruda a filas listas para mostrar.
 *
 * Se recorre el catálogo y no el diccionario para que el orden sea siempre el
 * mismo: el del árbol de habilidades, agrupado por familia.
 */
export function buildSkillRows(xpBySkill: Readonly<Record<string, number>>): FilaHabilidad[] {
	const rows: FilaHabilidad[] = [];
	for (const skill of SKILL_LIST) {
		const xp = xpBySkill[skill.code];
		if (!xp) continue;
		const level = levelFromXp(xp, skill.difficulty);
		const progress = levelProgress(xp, skill.difficulty);
		rows.push({
			code: skill.code,
			name: skill.name,
			family: skill.family,
			level: roman(level),
			xp,
			progress: Math.trunc(progress * 100),
			stars: starStates(level, progress)
		});
	}
	return rows;
}

/** Créditos con separador de miles y su unidad, como en el HUD. */
export function creditsLabel(credits: number): string {
	return `${thousands(credits)} CR`;
}

/** Dónde está el piloto: estación y sistema, de mayor a menor detalle. */
export function locationLabel(station: string, systemName: string): string {
	if (station && systemName) return `${station} · ${systemName}`;
	return station || systemName;
}

/** Todo lo que la interfaz necesita del piloto, en una sola pasada. */
export function buildPilotView(db: Db, row: Pilot): PilotoConectado {
	const faction = getFaction(row.faction);
	const place = db.select().from(body).where(eq(body.id, row.locationId)).get();
	const home = place
		? db.select().from(system).where(eq(system.id, place.systemId)).get()
		: undefined;

	const station = place?.name ?? '';
	const systemName = home?.name ?? '';

	return {
		callsign: row.callsign,
		professionName: getProfession(row.profession).name,
		factionName: faction.name,
		factionCode: faction.code,
		factionArchetype: faction.archetype,
		factionGovernment: faction.government,
		factionMotto: faction.motto,
		station,
		system: systemName,
		credits: row.credits,
		creditsLabel: creditsLabel(row.credits),
		locationLabel: locationLabel(station, systemName),
		skills: buildSkillRows(skillXp(db, row.id))
	};
}
