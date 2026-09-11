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
import { SKILL_FAMILIES, SKILL_LIST } from '$lib/game/skills';
import { skillXp } from '../services/pilots';
import { roman, skillFamilyIcon, skillFamilyLabel, starStates, thousands } from '$lib/format';
import type { FilaHabilidad, PilotoConectado, RamaXp } from '$lib/tipos';

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

/**
 * Cuánta experiencia lleva el piloto en cada rama del árbol.
 *
 * Es la suma de lo que tienen sus habilidades de esa familia. Se recorre el
 * catálogo y no lo que el piloto tiene, para que las seis ramas salgan siempre y
 * en el mismo orden: una rama en cero también informa —dice por dónde no fue—, y
 * una lista que cambia de largo según el piloto no se puede comparar de un
 * vistazo.
 *
 * **Cuando llegue el pozo por familia** —decidido y sin implementar, ver
 * docs/systems/SKILLS.md— este mismo número pasa a ser el pozo gastable: lo que
 * una acción deposita en la rama y el jugador reparte entre sus habilidades. La
 * ficha no cambia de lugar ni de forma; cambia lo que el número significa.
 */
export function buildFamilyXp(xpBySkill: Readonly<Record<string, number>>): RamaXp[] {
	const ramas = SKILL_FAMILIES.map((family) => {
		const skills = SKILL_LIST.filter((skill) => skill.family === family);
		const entrenadas = skills.filter((skill) => (xpBySkill[skill.code] ?? 0) > 0);
		return {
			family,
			name: skillFamilyLabel(family),
			icon: skillFamilyIcon(family),
			xp: skills.reduce((suma, skill) => suma + (xpBySkill[skill.code] ?? 0), 0),
			trained: entrenadas.length,
			total: skills.length,
			share: 0
		};
	});

	// La barra compara contra la rama más cargada: lo que interesa leer no es el
	// número absoluto sino dónde está puesto el esfuerzo.
	const techo = Math.max(...ramas.map((rama) => rama.xp), 1);
	return ramas.map((rama) => ({ ...rama, share: Math.round((rama.xp * 100) / techo) }));
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
	// Una sola lectura: la usan tanto las filas de habilidades como las ramas.
	const xp = skillXp(db, row.id);

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
		skills: buildSkillRows(xp),
		families: buildFamilyXp(xp)
	};
}
