/**
 * Facciones: de dónde viene el piloto y en qué estación empieza.
 *
 * Por ahora su único efecto mecánico es el punto de partida. No dan bonos: el
 * oficio lo define la profesión, y duplicarlo convertiría la elección en un
 * cálculo en vez de una decisión de identidad.
 *
 * `startingStation` guarda por ahora el código de la estación como texto. Cuando
 * exista el universo (F4) va a pasar a ser una referencia al cuerpo real.
 *
 * Corresponde a docs/systems/FACTIONS.md.
 */

import { indexByCode, lookup } from './catalog';

/**
 * Una de las tres superpotencias del sector.
 *
 * `archetype` y `government` son la línea que en el HUD del juego va debajo del
 * nombre, del estilo `FEDERACIÓN | DEMOCRACIA`: dicen de un vistazo qué clase de
 * poder es cada una.
 */
export interface Faction {
	readonly code: string;
	readonly name: string;
	readonly archetype: string;
	readonly government: string;
	readonly motto: string;
	readonly description: string;
	readonly startingSystem: string;
	readonly startingStation: string;
	readonly startingStationName: string;
}

const CATALOG = [
	{
		code: 'dominion',
		name: 'El Dominio',
		archetype: 'Imperio',
		government: 'Aristocracia',
		motto: 'El orden se hereda',
		description:
			'El poder más viejo del sector, y el que más se nota que lo es. ' +
			'Linaje, protocolo y una idea muy clara de quiénes mandan. Elegante ' +
			'por fuera, durísimo por dentro.',
		startingSystem: 'Ánfora',
		startingStation: 'puerto_anfora',
		startingStationName: 'Puerto Ánfora'
	},
	{
		code: 'concord',
		name: 'La Concordia',
		archetype: 'Federación',
		government: 'Democracia corporativa',
		motto: 'Todo se vota',
		description:
			'La más grande y la más lenta. Democracia de corporaciones, con ' +
			'elecciones reales, lobbies reales y una flota enorme. Todo se puede ' +
			'discutir, y por eso todo tarda.',
		startingSystem: 'Ánfora',
		startingStation: 'muelle_de_los_anillos',
		startingStationName: 'Muelle de los Anillos'
	},
	{
		code: 'pact',
		name: 'El Pacto',
		archetype: 'Alianza',
		government: 'Coalición',
		motto: 'Lo acordado se cumple',
		description:
			'Sistemas independientes que se juntaron para no ser tragados por ' +
			'los otros dos. Sin capital y sin flota digna de ese nombre: lo que ' +
			'tienen son acuerdos, y los cumplen.',
		startingSystem: 'Ánfora',
		startingStation: 'habitat_talo',
		startingStationName: 'Hábitat Talo'
	}
] as const satisfies readonly Faction[];

/** El código de cualquier facción del catálogo. */
export type FactionCode = (typeof CATALOG)[number]['code'];

/**
 * Sistemas bajo control de cada facción. Hoy es uno solo y lo comparten las
 * tres, porque Ánfora es el único que existe; cuando el universo viva en la base
 * (F5) esto se cuenta de verdad.
 */
export const GOVERNED_SYSTEMS = 1;

/** El catálogo en orden de declaración, que es el que dibuja la pantalla de alta. */
export const FACTION_LIST: readonly Faction[] = CATALOG;

/** El catálogo indexado por código. */
export const FACTIONS = indexByCode(CATALOG);

/** Devuelve una facción por su código, o falla con un mensaje claro. */
export function getFaction(code: string): Faction {
	return lookup(FACTIONS, code, 'la facción');
}
