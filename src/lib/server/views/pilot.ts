/**
 * Lo que toda pantalla del juego sabe del piloto conectado.
 *
 * Es una función pura sobre datos ya leídos: recibe lo que hay en la base y
 * devuelve lo que la pantalla dibuja. Que sea pura es lo que permite probarla
 * sin levantar nada, igual que las reglas del juego.
 */

import { portraitVersion } from '../services/portraits';
import { eq } from 'drizzle-orm';
import { body, corporation, system, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { getFaction } from '$lib/game/factions';
import { getProfession } from '$lib/game/professions';
import { roundHalfEven } from '$lib/game/math';
import { jumpsWithFuel } from '$lib/game/jumps';
import { RATING_RANKS, nextRankFor, pilotIndex, rankFor } from '$lib/game/rating';
import { SKILL_FAMILIES, SKILL_LIST } from '$lib/game/skills';
import { skillXp } from '../services/pilots';
import { pools } from '../services/pools';
import { activeShip, shipReadout } from '../services/ships';
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
		share: roundHalfEven((rama.xp * 100) / techo),
		poolShare: roundHalfEven((rama.pool * 100) / techo)
	}));
}

/** Créditos con separador de miles y su unidad, como en el HUD. */
export function creditsLabel(credits: number): string {
	return `${thousands(credits)} CR`;
}

/** Dónde está el piloto: estación y sistema, de mayor a menor detalle. */
/**
 * El nombre de su corporación, o vacío si no pertenece a ninguna.
 *
 * Una consulta por credencial, y sólo cuando hay a quién preguntarle: un
 * independiente no cuesta un viaje a la base.
 */
function corporationName(db: Db, id: number | null): string {
	if (id === null) return '';
	return db.select().from(corporation).where(eq(corporation.id, id)).get()?.name ?? '';
}

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

	// La nave, resumida: el nombre, el rol, las tres capas y el tanque. El detalle
	// entero está a una pestaña de distancia y no tiene por qué repetirse acá; el
	// combustible sí, porque es lo único de la lista que **se gasta** y que decide
	// si el próximo salto se puede dar.
	const readout = shipReadout(db, row);
	const nave = activeShip(db, row.id);
	// Acotado igual que en la ficha: desmontar un tanque deja la nave con más
	// combustible del que ahora le entra, y mostrar `140 / 120` es mostrar un error.
	const combustible = nave ? Math.min(nave.fuel, readout?.fuel ?? 0) : 0;
	const ship: NaveDelPiloto | null = readout
		? {
				name: readout.hull.name,
				role: readout.hull.role,
				shield: thousands(readout.shield),
				armor: thousands(readout.armor),
				structure: thousands(readout.structure),
				fuel: `${combustible} / ${readout.fuel}`,
				jumps: String(jumpsWithFuel(combustible, readout.mass)),
				flyable: readout.flyable
			}
		: null;

	// El retrato, si subió uno. La marca de tiempo va en la consulta porque el
	// archivo se llama siempre igual: sin algo que cambie, el navegador se queda
	// con el anterior en la caché y el jugador cree que la subida no funcionó.
	const version = portraitVersion(row.id);

	// El índice sale de lo que ya se calculó por rama: recorrer el árbol de nuevo
	// sería recorrerlo dos veces para llegar al mismo número.
	const familias = buildFamilyXp(xp, pozos);
	const indice = pilotIndex(Object.fromEntries(familias.map((rama) => [rama.family, rama.xp])));
	const rango = rankFor(indice);
	const siguiente = nextRankFor(indice);

	return {
		callsign: row.callsign,
		portrait: version > 0 ? `/retratos/${row.id}?v=${version}` : '',
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
		families: familias,
		rating: {
			value: thousands(indice),
			rank: rango.name,
			step: rango.step,
			steps: RATING_RANKS.length,
			// Lo que falta y **para qué**: un umbral sin su nombre es un número más.
			next: siguiente ? `${siguiente.name} a ${thousands(siguiente.at)}` : ''
		},
		since: row.createdAt.getTime(),
		// A quién le rinde cuentas. **Vacío quiere decir independiente**, que es un
		// estado legítimo: la credencial lo dice con esa palabra en vez de dejar el
		// renglón en blanco.
		corporation: corporationName(db, row.corporationId),
		statusLabel: ahora.inTransit ? 'En tránsito' : 'Atracado',
		inTransit: ahora.inTransit,
		ship
	};
}
