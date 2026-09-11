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
import { SKILL_FAMILIES, SKILL_LIST } from '$lib/game/skills';
import { skillXp } from '../services/pilots';
import { pools } from '../services/pools';
import { shipReadout } from '../services/ships';
import { situation } from '../services/status';
import { skillFamilyIcon, skillFamilyLabel, thousands } from '$lib/format';
import type { NaveDelPiloto, PilotoConectado, RamaXp } from '$lib/tipos';

/**
 * Cómo le fue al piloto en cada rama del árbol: lo invertido y lo que hay en el
 * pozo.
 *
 * Son **dos números por rama y no uno**. Lo invertido es la suma de lo que
 * tienen sus habilidades: dice quién es el piloto hoy. El pozo es lo que una
 * acción depositó y todavía no se gastó: dice qué puede ser mañana. Mirar uno
 * solo deja afuera media respuesta —un piloto con cuatro mil sin invertir en
 * Extracción no es "alguien que no mina", es alguien a punto de serlo.
 *
 * Se recorre el catálogo y no lo que el piloto tiene, para que las seis ramas
 * salgan siempre y en el mismo orden: una rama en cero también informa —dice por
 * dónde no fue—, y una lista que cambia de largo según el piloto no se puede
 * comparar de un vistazo.
 */
export function buildFamilyXp(
	xpBySkill: Readonly<Record<string, number>>,
	pools: Readonly<Partial<Record<string, number>>> = {}
): RamaXp[] {
	const ramas = SKILL_FAMILIES.map((family) => {
		const skills = SKILL_LIST.filter((skill) => skill.family === family);
		const entrenadas = skills.filter((skill) => (xpBySkill[skill.code] ?? 0) > 0);
		return {
			family,
			name: skillFamilyLabel(family),
			icon: skillFamilyIcon(family),
			xp: skills.reduce((suma, skill) => suma + (xpBySkill[skill.code] ?? 0), 0),
			pool: pools[family] ?? 0,
			trained: entrenadas.length,
			total: skills.length,
			share: 0,
			poolShare: 0
		};
	});

	// **Un solo techo para los dos números**: lo que interesa leer no es el valor
	// absoluto sino dónde está puesto el esfuerzo, y dos escalas distintas harían
	// que un pozo chico se dibujara tan grande como una rama entera.
	const techo = Math.max(...ramas.map((rama) => Math.max(rama.xp, rama.pool)), 1);
	return ramas.map((rama) => ({
		...rama,
		share: Math.round((rama.xp * 100) / techo),
		poolShare: Math.round((rama.pool * 100) / techo)
	}));
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
	const ahora = situation(db, row);
	const pozos = pools(db, row.id);

	// La nave, resumida: el nombre, el rol y las tres capas. El detalle entero
	// está a una pestaña de distancia y no tiene por qué repetirse acá.
	const readout = shipReadout(db, row);
	const ship: NaveDelPiloto | null = readout
		? {
				name: readout.hull.name,
				role: readout.hull.role,
				shield: thousands(readout.shield),
				armor: thousands(readout.armor),
				structure: thousands(readout.structure),
				flyable: readout.flyable
			}
		: null;

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
		families: buildFamilyXp(xp, pozos),
		since: row.createdAt.getTime(),
		// Las corporaciones de jugadores llegan en F12: hoy no hay ninguna a la
		// que pertenecer, y decirlo es mejor que esconder el renglón.
		corporation: '',
		statusLabel: ahora.inTransit ? 'En tránsito' : 'Atracado',
		inTransit: ahora.inTransit,
		ship
	};
}
