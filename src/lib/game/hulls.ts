/**
 * Los cascos: qué trae puesto una nave antes de montarle nada.
 *
 * Datos puros, igual que el plano del universo. Un casco no es "la nave": es el
 * chasis, sus ranuras y sus límites. Lo que la nave *hace* sale de los módulos
 * que se le monten, y de eso se ocupa `fitting`.
 *
 * Qué provee el casco y qué no, que es la parte que se olvida:
 *
 * - **Provee**: masa vacía, bodega, blindaje, casco, cómputo, combustible,
 *   sensores, firma, y las ranuras.
 * - **No provee**: potencia, velocidad, alcance de salto ni acumulador. Todo eso
 *   viene de los internos esenciales, que por eso son esenciales — un chasis sin
 *   propulsores no se mueve.
 *
 * Corresponde a docs/systems/SHIPS.md.
 */

import { lookup } from './catalog';

/**
 * En qué amarre entra la nave.
 *
 * Es el atributo que hace que el mapa importe: un carguero grande no entra en un
 * puesto de hielo, y eso convierte a la ruta en una decisión y no en una línea
 * recta.
 */
export const DOCK_SIZES = ['small', 'medium', 'large'] as const;
export type DockSize = (typeof DOCK_SIZES)[number];

/**
 * Los cuatro tipos de ranura, tomados de Elite Dangerous.
 *
 * Separan bien las decisiones: lo que apunta hacia afuera, lo que va colgado
 * afuera pero no dispara, lo que la nave necesita para volar, y lo que define a
 * qué se dedica.
 */
export const SLOT_KINDS = ['hardpoint', 'utility', 'core', 'optional'] as const;
export type SlotKind = (typeof SLOT_KINDS)[number];

/**
 * Los siete internos esenciales. **Se mejoran, no se quitan.**
 *
 * Cada uno ocupa una ranura fija del casco, así que un casco no elige *si* tiene
 * planta de energía: elige cuál. El orden es el de la interfaz y el de la
 * siembra, de lo que más se toca a lo que menos.
 */
export const CORE_ORDER = [
	'power_plant',
	'thrusters',
	'jump_drive',
	'distributor',
	'sensors',
	'life_support',
	'tank'
] as const;
export type CoreSystem = (typeof CORE_ORDER)[number];

/**
 * Sobre qué actúa un bono, sea de casco o de habilidad.
 *
 * Existe para que los bonos sean **datos y no código**: agregar un casco con un
 * bono nuevo no debería obligar a tocar la calculadora.
 */
export const BONUS_TARGETS = [
	'cargo',
	'speed',
	'jump_range',
	'mining_yield',
	'damage',
	'shield',
	'armor',
	'sensor_range',
	'capacitor_recharge'
] as const;
export type BonusTarget = (typeof BONUS_TARGETS)[number];

/**
 * El bono de rol de un casco, que **escala con una habilidad**.
 *
 * Es lo que evita que la nave reemplace al piloto: una minera en manos sin
 * entrenar es una nave con bodega y nada más. Y hace que dos pilotos con el
 * mismo casco rindan distinto, que es la mitad de la progresión.
 */
export interface RoleBonus {
	readonly target: BonusTarget;
	readonly skill: string;
	readonly percentPerLevel: number;
}

/**
 * Una ranura del casco: qué acepta y de qué tamaño.
 *
 * `size` es la clase, de 1 a 8: en una ranura de clase 4 entra un módulo de
 * clase 4 o menor, nunca uno mayor. `core` sólo lo llevan los internos
 * esenciales, y dice cuál de los siete es.
 */
export interface SlotSpec {
	readonly kind: SlotKind;
	readonly size: number;
	readonly core: CoreSystem | null;
}

/** Qué hay que saber para poder volarla. */
export interface HullRequirement {
	readonly skill: string;
	readonly level: number;
}

/** Un casco del catálogo. */
export interface Hull {
	readonly code: string;
	readonly name: string;
	readonly role: string;
	readonly description: string;
	readonly dockSize: DockSize;

	/**
	 * Masa vacía, en toneladas. Es el número del que cuelga todo lo demás:
	 * divide la velocidad y el alcance de salto.
	 */
	readonly mass: number;

	readonly cargo: number;
	readonly armor: number;
	readonly structure: number;

	/**
	 * Cuánto cómputo trae el chasis. Es el presupuesto que castiga lo
	 * electrónico: escáneres, escudos, refinerías.
	 */
	readonly computing: number;

	readonly fuel: number;
	readonly sensorRange: number;

	/**
	 * Cuán fácil es encontrarla. Le da al carguero la decisión de ir lleno o ir
	 * discreto.
	 */
	readonly signature: number;

	readonly slots: readonly SlotSpec[];
	readonly bonus: RoleBonus;
	readonly requirement: HullRequirement;
}

/** Una ranura que no es de un interno esencial. */
function slot(kind: SlotKind, size: number): SlotSpec {
	return { kind, size, core: null };
}

/** Las siete ranuras esenciales de un casco, todas de la misma clase. */
function coreSlots(size: number): SlotSpec[] {
	return CORE_ORDER.map((core) => ({ kind: 'core' as const, size, core }));
}

/**
 * El catálogo.
 *
 * Cinco cascos, uno por forma de jugar más la lanzadera inicial. Los números son
 * de balance y se van a mover; lo que no se mueve es que cada uno sea bueno en
 * una cosa y flojo en el resto. Una nave que sirve para todo no hace elegir.
 */
export const HULLS: readonly Hull[] = [
	{
		code: 'pioner',
		name: 'Pioner',
		role: 'Lanzadera inicial',
		description:
			'El casco con el que se abrió el sector, y con el que sigue entrando ' +
			'todo el mundo. Mediocre en todo a propósito: vuela, carga poco y ' +
			'aguanta menos, pero es tuya desde el primer minuto.',
		dockSize: 'small',
		mass: 180,
		cargo: 200,
		armor: 120,
		structure: 400,
		computing: 55,
		fuel: 100,
		sensorRange: 40,
		signature: 30,
		slots: [
			slot('hardpoint', 1),
			slot('utility', 1),
			...coreSlots(2),
			slot('optional', 2),
			slot('optional', 1)
		],
		bonus: { target: 'speed', skill: 'navigation', percentPerLevel: 2 },
		requirement: { skill: 'shuttle_handling', level: 1 }
	},
	{
		code: 'mula',
		name: 'Mula',
		role: 'Carguera',
		description:
			'Una bodega con motores. Lenta, gorda y visible desde el otro lado ' +
			'del sistema, pero es la columna vertebral de todo el comercio.',
		dockSize: 'medium',
		mass: 420,
		cargo: 600,
		armor: 180,
		structure: 620,
		computing: 70,
		fuel: 160,
		sensorRange: 35,
		signature: 70,
		slots: [
			slot('hardpoint', 1),
			slot('utility', 1),
			slot('utility', 1),
			...coreSlots(3),
			slot('optional', 3),
			slot('optional', 3),
			slot('optional', 2),
			slot('optional', 1)
		],
		bonus: { target: 'cargo', skill: 'cargo_engineering', percentPerLevel: 5 },
		requirement: { skill: 'cargo_engineering', level: 2 }
	},
	{
		code: 'percal',
		name: 'Percal',
		role: 'Minera',
		description:
			'Casco reforzado y sitio para dos láseres. Se mueve como una casa, ' +
			'pero saca más de un asteroide que cualquier otra cosa de su porte.',
		dockSize: 'medium',
		mass: 380,
		cargo: 400,
		armor: 220,
		structure: 700,
		computing: 80,
		fuel: 140,
		sensorRange: 45,
		signature: 60,
		slots: [
			slot('hardpoint', 2),
			slot('hardpoint', 2),
			slot('utility', 1),
			slot('utility', 1),
			...coreSlots(3),
			slot('optional', 3),
			slot('optional', 2),
			slot('optional', 2)
		],
		bonus: { target: 'mining_yield', skill: 'mining', percentPerLevel: 5 },
		requirement: { skill: 'mining', level: 2 }
	},
	{
		code: 'vencejo',
		name: 'Vencejo',
		role: 'Exploradora',
		description:
			'Liviana, callada y con más sensores que bodega. Llega adonde nadie ' +
			'llegó y vuelve a contarlo, siempre que no la encuentren.',
		dockSize: 'small',
		mass: 150,
		cargo: 120,
		armor: 100,
		structure: 360,
		computing: 130,
		fuel: 220,
		sensorRange: 120,
		signature: 18,
		slots: [
			slot('hardpoint', 1),
			slot('utility', 2),
			slot('utility', 2),
			...coreSlots(3),
			slot('optional', 2),
			slot('optional', 2),
			slot('optional', 1)
		],
		bonus: { target: 'sensor_range', skill: 'scanning', percentPerLevel: 8 },
		requirement: { skill: 'scanning', level: 2 }
	},
	{
		code: 'alabarda',
		name: 'Alabarda',
		role: 'Combate',
		description:
			'Tres anclajes y blindaje de sobra. La bodega alcanza para munición ' +
			'y poco más: esta nave no va a ningún lado a trabajar.',
		dockSize: 'medium',
		mass: 460,
		cargo: 90,
		armor: 420,
		structure: 900,
		computing: 85,
		fuel: 150,
		sensorRange: 60,
		signature: 55,
		slots: [
			slot('hardpoint', 2),
			slot('hardpoint', 2),
			slot('hardpoint', 2),
			slot('utility', 2),
			slot('utility', 2),
			...coreSlots(3),
			slot('optional', 3),
			slot('optional', 2),
			slot('optional', 2)
		],
		bonus: { target: 'damage', skill: 'gunnery', percentPerLevel: 5 },
		requirement: { skill: 'gunnery', level: 2 }
	}
];

/** Con qué casco arranca un piloto recién creado. */
export const STARTING_HULL = 'pioner';

/** El catálogo indexado por código. */
const BY_CODE: Readonly<Record<string, Hull>> = Object.fromEntries(
	HULLS.map((hull) => [hull.code, hull])
);

/** Busca un casco por código, o falla diciendo cuál falta. */
export function getHull(code: string): Hull {
	return lookup(BY_CODE, code, 'el casco');
}

/** En qué ranura del casco va ese interno esencial. */
export function coreSlotIndex(hull: Hull, core: CoreSystem): number {
	const index = hull.slots.findIndex((spec) => spec.core === core);
	if (index < 0) throw new Error(`${hull.name} no tiene ranura para '${core}'`);
	return index;
}
