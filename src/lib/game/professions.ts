/**
 * Profesiones: el oficio previo del piloto y las habilidades con las que
 * arranca.
 *
 * Todas reparten el mismo presupuesto de experiencia inicial, así que ninguna
 * empieza mejor que otra: empiezan distinto. Que el balance se verifique con una
 * suma es justamente la gracia del diseño.
 *
 * Corresponde a docs/systems/PROFESSIONS.md.
 */

import { indexByCode, lookup } from './catalog';
import { xpForLevel } from './progression';
import { getSkill } from './skills';

/**
 * Experiencia inicial que reparte toda profesión, con el multiplicador de cada
 * habilidad ya aplicado.
 */
export const STARTING_XP_BUDGET = 1000;

/** Una habilidad que la profesión entrega ya entrenada, y a qué nivel. */
export interface SkillGrant {
	readonly skill: string;
	readonly level: number;
}

/** Algo con lo que la profesión te manda a volar. */
export interface KitEntry {
	/** El código del catálogo de `game/items`. */
	readonly item: string;
	readonly quantity: number;
	/**
	 * Si sale **montado** en la nave o guardado en la bodega.
	 *
	 * El oficio dice qué trae, no en qué ranura: la ranura depende del casco, y un
	 * día el minero va a salir en otra nave.
	 */
	readonly fitted: boolean;
}

/** El oficio que tenía el piloto antes de comprarse una nave. */
export interface Profession {
	readonly code: string;
	readonly name: string;
	readonly description: string;
	readonly grants: readonly SkillGrant[];
	/**
	 * Con qué sale a volar, además de la nave.
	 *
	 * **Es otra moneda que la experiencia**: no toca el presupuesto de 1.000
	 * puntos ni el test que lo verifica. Un oficio te deja lo que sabés y también
	 * las herramientas con las que trabajabas, y sin herramientas el primer día es
	 * mirar el espacio.
	 */
	readonly kit: readonly KitEntry[];

	/**
	 * Si se puede elegir en el alta.
	 *
	 * Una profesión se ofrece cuando hay algo que hacer con ella. Hoy sólo el
	 * minero tiene actividades propias —extraer, refinar, vender—, así que es la
	 * única jugable; elegir explorador sería elegir un nombre.
	 *
	 * Las otras **se quedan en el catálogo** aunque no se ofrezcan: siguen
	 * verificando el presupuesto de experiencia, y los pilotos que ya las tengan
	 * tienen que poder seguir jugando.
	 */
	readonly playable: boolean;
}

const CATALOG = [
	{
		code: 'miner',
		name: 'Minero',
		description:
			'Trabajó en los anillos hasta que juntó para su propia nave. Sabe sacar ' +
			'mineral y sabe acomodarlo.',
		grants: [
			{ skill: 'mining', level: 2 },
			{ skill: 'stowage', level: 2 },
			{ skill: 'navigation', level: 1 },
			{ skill: 'mechanics', level: 1 }
		],
		// Sale con un equipo de minería armado, no con piezas sueltas: alguien que
		// trabajó en los anillos hasta juntar para su nave le monta lo que sabe
		// usar. Sin armas: no es su oficio, y una nave que sale artillada sugiere
		// que pelear es el plan.
		kit: [
			{ item: 'mining_laser_e1', quantity: 1, fitted: true },
			{ item: 'collector_e1', quantity: 1, fitted: true }
		],
		playable: true
	},
	{
		code: 'explorer',
		name: 'Explorador',
		description: 'Vivió de vender coordenadas. Llega más lejos y ve antes lo que hay.',
		grants: [
			{ skill: 'navigation', level: 2 },
			{ skill: 'shuttle_handling', level: 2 },
			{ skill: 'scanning', level: 1 }
		],
		kit: [],
		playable: false
	},
	{
		code: 'hauler',
		name: 'Transportista',
		description: 'Llevó carga ajena media vida. Nadie mete más cosas en menos bodega.',
		grants: [
			{ skill: 'stowage', level: 2 },
			{ skill: 'navigation', level: 2 },
			{ skill: 'haggling', level: 1 },
			{ skill: 'shuttle_handling', level: 1 }
		],
		kit: [],
		playable: false
	},
	{
		code: 'trader',
		name: 'Mercader',
		description: 'Empezó revendiendo en el muelle. Compra bien y sabe qué le están cobrando.',
		grants: [
			{ skill: 'haggling', level: 2 },
			{ skill: 'accounting', level: 1 },
			{ skill: 'navigation', level: 1 },
			{ skill: 'stowage', level: 1 },
			{ skill: 'mechanics', level: 1 },
			{ skill: 'shuttle_handling', level: 1 }
		],
		kit: [],
		playable: false
	},
	{
		code: 'escort',
		name: 'Escolta',
		description: 'Cobró por proteger convoyes. Tira derecho y arregla lo que le rompen.',
		grants: [
			{ skill: 'gunnery', level: 2 },
			{ skill: 'mechanics', level: 2 },
			{ skill: 'navigation', level: 1 },
			{ skill: 'shuttle_handling', level: 1 }
		],
		kit: [],
		playable: false
	},
	{
		code: 'technician',
		name: 'Técnico',
		description: 'Fue mecánico de hangar. Entiende la nave por dentro mejor que nadie.',
		grants: [
			{ skill: 'mechanics', level: 2 },
			{ skill: 'power_management', level: 1 },
			{ skill: 'mining', level: 1 },
			{ skill: 'stowage', level: 1 },
			{ skill: 'navigation', level: 1 },
			{ skill: 'shuttle_handling', level: 1 }
		],
		kit: [],
		playable: false
	}
] as const satisfies readonly Profession[];

/** El código de cualquier profesión del catálogo. */
export type ProfessionCode = (typeof CATALOG)[number]['code'];

/** El catálogo entero, en orden de declaración. */
export const PROFESSION_LIST: readonly Profession[] = CATALOG;

/**
 * Las que se pueden elegir en el alta.
 *
 * Es una lista aparte y no un filtro en la pantalla: quién se puede elegir es
 * contenido del juego, y la pantalla sólo dibuja lo que le den.
 */
export const PLAYABLE_PROFESSIONS: readonly Profession[] = CATALOG.filter(
	(profession) => profession.playable
);

/** Si esa profesión se puede elegir al crear un piloto. */
export function isPlayable(code: string): boolean {
	return getProfession(code).playable;
}

/** El catálogo indexado por código. */
export const PROFESSIONS = indexByCode(CATALOG);

/** Devuelve una profesión por su código, o falla con un mensaje claro. */
export function getProfession(code: string): Profession {
	return lookup(PROFESSIONS, code, 'la profesión');
}

/** Cuánta experiencia vale una habilidad entregada, con su multiplicador. */
export function grantCost(grant: SkillGrant): number {
	return xpForLevel(grant.level, getSkill(grant.skill).difficulty);
}

/** Presupuesto total que gasta una profesión. Debe dar `STARTING_XP_BUDGET`. */
export function professionCost(code: string): number {
	return getProfession(code).grants.reduce((total, grant) => total + grantCost(grant), 0);
}

/**
 * Experiencia inicial por habilidad para un piloto de esta profesión.
 *
 * Se entrega como experiencia y no como nivel a secas para que el piloto
 * arranque justo en el umbral del nivel: todo lo que sume después cuenta desde
 * ahí.
 */
export function startingXp(code: string): Record<string, number> {
	return Object.fromEntries(
		getProfession(code).grants.map((grant) => [grant.skill, grantCost(grant)])
	);
}

/** Con qué manda a volar la profesión: lo montado y lo guardado. */
export function startingKit(code: string): readonly KitEntry[] {
	return getProfession(code).kit;
}

/** Niveles iniciales por habilidad para un piloto de esta profesión. */
export function startingLevels(code: string): Record<string, number> {
	return Object.fromEntries(getProfession(code).grants.map((grant) => [grant.skill, grant.level]));
}
