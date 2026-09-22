/**
 * Lo que toda pantalla del juego sabe del piloto conectado.
 *
 * Es una función pura sobre datos ya leídos: recibe lo que hay en la base y
 * devuelve lo que la pantalla dibuja. Que sea pura es lo que permite probarla
 * sin levantar nada, igual que las reglas del juego.
 */

import { eq } from 'drizzle-orm';
import { body, corporation, pilot as pilotTable, system, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { getFaction } from '$lib/game/factions';
import { getProfession } from '$lib/game/professions';
import { roundHalfEven } from '$lib/game/math';
import { RATING_RANKS, nextRankFor, pilotIndex, rankFor } from '$lib/game/rating';
import { SKILL_FAMILIES, SKILL_LIST } from '$lib/game/skills';
import { skillXp } from '../services/pilots';
import { pools } from '../services/pools';
import { shipReadout } from '../services/ships';
import { situation } from '../services/status';
import { factionCrest, skillFamilyIcon, skillFamilyLabel, thousands } from '$lib/format';
import type {
	IndicePiloto,
	NaveDelPiloto,
	PerfilPiloto,
	PilotoConectado,
	RamaXp
} from '$lib/tipos';

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
 * Se recorre el catálogo y no lo que el piloto tiene, para que las ocho ramas
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

	// La nave, resumida: el nombre, el rol y las tres capas. El detalle entero está
	// a una pestaña de distancia y no tiene por qué repetirse acá.
	//
	// El tanque y la autonomía estaban en esta lista porque decidían si el próximo
	// salto se podía dar; hoy cruzar una puerta no gasta nada, así que no deciden
	// nada y una cifra que no decide nada en la credencial es ruido permanente.
	// Vuelven con el motor de salto de las capitales, que salta sin puerta.
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

	// El índice sale de lo que ya se calculó por rama: recorrer el árbol de nuevo
	// sería recorrerlo dos veces para llegar al mismo número.
	const familias = buildFamilyXp(xp, pozos);
	const indice = pilotIndex(Object.fromEntries(familias.map((rama) => [rama.family, rama.xp])));
	const rango = rankFor(indice);
	const siguiente = nextRankFor(indice);

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
		families: familias,
		rating: {
			value: thousands(indice),
			rank: rango.name,
			step: rango.step,
			steps: RATING_RANKS.length,
			// Lo que falta y **para qué**: un umbral sin su nombre es un número más.
			next: siguiente ? `${siguiente.name} a ${thousands(siguiente.at)}` : ''
		},
		privateProfile: row.private,
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

/** El índice vacío, para la ficha que no dice nada porque está cerrada. */
const SIN_INDICE: IndicePiloto = {
	value: '',
	rank: '',
	step: 0,
	steps: RATING_RANKS.length,
	next: ''
};

/**
 * La ficha pública de un piloto: la que se abre apretando un distintivo.
 *
 * **Muestra menos que la propia a propósito.** Lo de uno —créditos, el árbol
 * entero, dónde está parado— no es asunto de nadie: dónde está sería un radar, y
 * el juego ya decidió que un listado de compañeros no lo es. Lo que queda es lo
 * que sirve para saber con quién estás hablando: de dónde viene, a quién le
 * responde, desde cuándo vuela y qué tan lejos llegó.
 *
 * **El IPP sí entra**, y es la mitad de la ficha. Existe justamente para poder
 * compararse y para que una corporación pida un mínimo; un índice que nadie
 * puede ver no sirve para ninguna de las dos cosas.
 *
 * Y si la tiene cerrada, lo único que viaja es el distintivo: negarla en la
 * pantalla pero mandar los datos igual sería no cerrarla.
 */
export function buildPerfilPiloto(db: Db, row: Pilot, callsign: string): PerfilPiloto | null {
	const otro = db.select().from(pilotTable).where(eq(pilotTable.callsign, callsign)).get();
	if (!otro) return null;

	const mine = otro.id === row.id;
	const vacia = {
		callsign: otro.callsign,
		profession: '',
		faction: '',
		factionCode: '',
		factionColor: '',
		factionCrest: '',
		corporation: '',
		corporationCode: '',
		since: 0,
		rating: SIN_INDICE,
		families: [] as readonly RamaXp[],
		mine
	};

	if (otro.private && !mine) return { ...vacia, closed: true };

	const faccion = getFaction(otro.faction);
	const suya =
		otro.corporationId === null
			? undefined
			: db.select().from(corporation).where(eq(corporation.id, otro.corporationId)).get();

	// El índice, con la misma cuenta que la credencial: lo invertido por rama,
	// sumado. El pozo no entra —es potencial y no poder— y por eso no se lee.
	const familias = buildFamilyXp(skillXp(db, otro.id));
	const indice = pilotIndex(Object.fromEntries(familias.map((rama) => [rama.family, rama.xp])));
	const rango = rankFor(indice);
	const siguiente = nextRankFor(indice);

	return {
		...vacia,
		profession: getProfession(otro.profession).name,
		faction: faccion.name,
		factionCode: faccion.code,
		factionColor: faccion.color,
		factionCrest: factionCrest(faccion.code),
		corporation: suya?.name ?? '',
		corporationCode: suya?.code ?? '',
		since: otro.createdAt.getTime(),
		families: familias,
		rating: {
			value: thousands(indice),
			rank: rango.name,
			step: rango.step,
			steps: RATING_RANKS.length,
			next: siguiente ? `${siguiente.name} a ${thousands(siguiente.at)}` : ''
		},
		closed: false
	};
}
