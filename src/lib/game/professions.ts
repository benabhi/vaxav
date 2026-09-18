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
import { getSkill, type SkillFamily } from './skills';

/**
 * Experiencia inicial que reparte toda profesión, con el multiplicador de cada
 * habilidad ya aplicado.
 *
 * **Sale de la curva y no de un número redondo**, porque la curva se mueve y el
 * presupuesto tiene que moverse con ella: escrito a mano, el día que se empine
 * —como acaba de pasar— los seis oficios quedan pidiendo más de lo que hay.
 *
 * La forma que compra es la misma para los seis: **dos habilidades que el piloto
 * hace bien y una que conoce**. Es lo que un oficio previo deja, y es lo que hace
 * que ninguno empiece mejor que otro: empiezan distinto.
 */
export const STARTING_XP_BUDGET = 2 * xpForLevel(2, 1) + xpForLevel(1, 2);

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
	 * De qué familia de habilidades es el oficio.
	 *
	 * **Hay exactamente una profesión por familia**, y un test lo hace cumplir. No
	 * es simetría por gusto: la familia es la que tiene pozo propio, así que una
	 * familia sin oficio de entrada es una rama a la que nadie llega con el
	 * repartidor puesto, y dos oficios en la misma familia son dos formas de
	 * empezar en el mismo lugar.
	 *
	 * Se declara en vez de deducirse de la primera habilidad: varias profesiones
	 * arrancan con una habilidad de otra rama —el explorador es de Ciencias pero su
	 * primer nivel es de Pilotaje— y deducirlo daría la respuesta equivocada.
	 */
	readonly family: SkillFamily;

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
	 *
	 * Esto no limita a nadie: **la profesión no cierra ninguna puerta**. Es el
	 * punto de partida y nada más, y cualquier piloto puede entrenar cualquier
	 * habilidad del catálogo desde el primer día.
	 */
	readonly playable: boolean;
}

const CATALOG = [
	{
		code: 'miner',
		family: 'extraction',
		name: 'Minero',
		description:
			'Trabajó en los anillos hasta que juntó para su propia nave. Sabe sacar ' +
			'mineral, sabe acomodarlo y sabe leer una roca antes de picarla.',
		// **Escaneo entra al oficio.** Desde que el cinturón es un campo de rocas,
		// un minero que no sabe leerlas ve bultos: sabe que la piedra es de silicato
		// pero no cuánto tiene, que es justo el dato con el que se decide a cuál
		// apuntarle. Traerlo de fábrica es decir que eso es parte del trabajo y no
		// un accesorio.
		//
		// Los mil de presupuesto salen de algún lado: se van Navegación y Mecánica,
		// que eran las dos de relleno —una mejora un viaje que igual hay que hacer,
		// la otra repara algo que todavía no se rompe—. Quedan tres habilidades y
		// las tres son el bucle: sacar, guardar y mirar.
		grants: [
			{ skill: 'mining', level: 2 },
			{ skill: 'stowage', level: 2 },
			{ skill: 'scanning', level: 1 }
		],
		// Lo justo para trabajar y nada más: el láser puesto, una bodega chica, un
		// escáner y un láser de repuesto en la caja. Alguien que trabajó en los
		// anillos hasta juntar para su nave le monta lo que sabe usar, pero no le
		// sobra para llenar las ranuras —y que sobren es media gracia del juego,
		// porque la ranura vacía es la que hace pensar—.
		//
		// El escáner no es un lujo: **sin él un cinturón no dice qué tiene**, y un
		// minero que no puede leer la roca no puede trabajar. Es el instrumento del
		// oficio tanto como el láser.
		//
		// El repuesto no es adorno: un láser es lo primero que se rompe y lo
		// primero que se mejora, y tenerlo en bodega enseña que la bodega también
		// sirve para eso.
		//
		// Sin armas: no es su oficio, y una nave que sale artillada sugiere que
		// pelear es el plan.
		kit: [
			{ item: 'mining_laser_i1', quantity: 1, fitted: true },
			{ item: 'cargo_rack_i1', quantity: 1, fitted: true },
			{ item: 'scanner_i1', quantity: 1, fitted: true },
			{ item: 'mining_laser_i1', quantity: 1, fitted: false }
		],
		playable: true
	},
	{
		code: 'explorer',
		family: 'science',
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
		family: 'piloting',
		name: 'Transportista',
		description: 'Llevó carga ajena media vida. Nadie mete más cosas en menos bodega.',
		// Estiba y Navegación son el oficio; Eficiencia de combustible es lo que
		// distingue al que vive de acarrear del que acarrea una vez: el margen de un
		// viaje largo se lo come el tanque.
		grants: [
			{ skill: 'stowage', level: 2 },
			{ skill: 'navigation', level: 2 },
			{ skill: 'fuel_efficiency', level: 1 }
		],
		kit: [],
		playable: false
	},
	{
		code: 'trader',
		family: 'trade',
		name: 'Mercader',
		description: 'Empezó revendiendo en el muelle. Compra bien y sabe qué le están cobrando.',
		// Regatear y saber acomodar lo que compró son el oficio; Contabilidad es lo
		// que separa al que revende del que sabe cuánto le queda después del
		// impuesto.
		grants: [
			{ skill: 'haggling', level: 2 },
			{ skill: 'stowage', level: 2 },
			{ skill: 'accounting', level: 1 }
		],
		kit: [],
		playable: false
	},
	{
		code: 'escort',
		family: 'combat',
		name: 'Escolta',
		description: 'Cobró por proteger convoyes. Tira derecho y arregla lo que le rompen.',
		// Puntería y Mecánica son el oficio; Blindaje es lo primero que aprende
		// alguien que cobró por ponerse adelante.
		grants: [
			{ skill: 'gunnery', level: 2 },
			{ skill: 'mechanics', level: 2 },
			{ skill: 'armor', level: 1 }
		],
		kit: [],
		playable: false
	},
	{
		code: 'technician',
		family: 'engineering',
		name: 'Técnico',
		description: 'Fue mecánico de hangar. Entiende la nave por dentro mejor que nadie.',
		// Mecánica y Estiba son el oficio del hangar —abrir la nave y volver a
		// cerrarla con todo adentro—; Gestión de energía es lo que lo vuelve técnico
		// y no ayudante.
		grants: [
			{ skill: 'mechanics', level: 2 },
			{ skill: 'stowage', level: 2 },
			{ skill: 'power_management', level: 1 }
		],
		kit: [],
		playable: false
	},
	{
		code: 'smelter',
		family: 'industry',
		name: 'Fundidor',
		description:
			'Pasó años en un horno de estación. Sabe qué sale de cada piedra y ' +
			'cuánto se pierde en el intento.',
		// Refinado y Fabricación son el oficio entero —convertir una cosa en otra—;
		// Reciclaje es lo que separa al que funde mineral del que además sabe sacarle
		// algo a lo que los demás tiran.
		grants: [
			{ skill: 'refining', level: 2 },
			{ skill: 'manufacturing', level: 2 },
			{ skill: 'recycling', level: 1 }
		],
		kit: [],
		playable: false
	},
	{
		code: 'boatswain',
		family: 'command',
		name: 'Contramaestre',
		description:
			'Manejó la tripulación de un carguero ajeno. Repartir trabajo y ' +
			'cuentas es lo único que sabe hacer, y lo hace muy bien.',
		// Liderazgo y Navegación son el oficio de quien lleva gente de un lado a
		// otro; Maniobra es lo que lo separa del pasajero: el que da la orden de
		// salir sabe cuánto tarda la nave en alinearse.
		grants: [
			{ skill: 'leadership', level: 2 },
			{ skill: 'navigation', level: 2 },
			{ skill: 'maneuvering', level: 1 }
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
