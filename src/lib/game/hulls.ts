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

import type { Requirement } from './skills';
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
/**
 * Las cuatro bandejas de una nave, y qué contesta cada una.
 *
 * | Bandeja       | Qué va                             | La regla                    |
 * | ------------- | ---------------------------------- | --------------------------- |
 * | `hardpoint`   | Armas, láseres, rayos              | Actúa sobre otra cosa       |
 * | `console`     | Escudos, propulsores, sensores     | Se enciende y gasta acumulador |
 * | `chassis`     | Blindaje, bodega, relés            | Está puesto y ya            |
 * | `rig`         | Refuerzos soldados al casco        | No se desmonta: se destruye |
 *
 * La regla de la derecha es la que evita que se discuta dónde va un módulo
 * nuevo. Y el reparto —la **terna** `2·4·3`— es la personalidad del casco: la
 * Mula lleva casi todo en el bastidor y el Vencejo casi todo en consolas, así
 * que se equipan de maneras que no se parecen en nada.
 *
 * **Antes había una quinta bandeja** de siete internos esenciales que todo casco
 * tenía que llevar. No eran una decisión: de las once ranuras de la Pioner, siete
 * estaban decididas de antemano, y veinticuatro de los cuarenta y nueve módulos
 * del catálogo existían sólo para llenarlas. Ahora los siete son atributos del
 * casco —una nave *tiene* planta de energía, igual que tiene masa— y lo que esos
 * módulos daban de más vuelve como módulo opcional que **cuesta una ranura**.
 */
export const SLOT_KINDS = ['high', 'mid', 'low', 'rig'] as const;
export type SlotKind = (typeof SLOT_KINDS)[number];

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
}

/**
 * Qué hay que saber para poder volarla.
 *
 * Es una **lista** y no un requisito suelto porque un casco puede pedir dos
 * cosas: la nave de guerra que exige puntería y blindaje no es una rareza, es lo
 * normal en cuanto el catálogo crece. Empezar con uno solo y descubrirlo después
 * obliga a migrar cinco literales y todo lo que los lee.
 *
 * **La Pioner no pide nada, y ésa es la regla que la sostiene**: es el casco que
 * el astillero le entrega a cualquiera que se dé de alta, así que pedirle una
 * habilidad sería empezar la partida con una nave que no despega.
 */

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

	/**
	 * Cuánta potencia da su planta. El presupuesto que castiga lo grande y lo
	 * bruto.
	 *
	 * **Antes salía de un módulo** y por lo tanto se podía comprar; ahora es fijo
	 * por casco y sólo se estira con habilidades o con un relé que cuesta una
	 * ranura. Es lo que convierte al equipamiento en un rompecabezas en vez de una
	 * lista de compras.
	 */
	readonly power: number;

	/**
	 * Empuje de sus propulsores. La velocidad sale de dividirlo por la masa total,
	 * así que **todo lo que se monta frena**, aunque no consuma nada.
	 */
	readonly thrust: number;

	/** Fuerza de su motor de salto. El alcance sale de dividirla por la masa. */
	readonly jumpPower: number;

	readonly capacitor: number;
	/** Unidades de acumulador que se rehacen por segundo. */
	readonly capacitorRecharge: number;

	/**
	 * El presupuesto de los refuerzos, y el único que no se recupera.
	 *
	 * Los otros tres se deshacen desmontando; un refuerzo sacado se destruye, así
	 * que gastar calibración es definitivo. Es el único presupuesto que obliga a
	 * decidir antes y no después.
	 */
	readonly calibration: number;

	readonly fuel: number;
	readonly sensorRange: number;

	/**
	 * Cuán fácil es encontrarla. Le da al carguero la decisión de ir lleno o ir
	 * discreto.
	 */
	readonly signature: number;

	readonly slots: readonly SlotSpec[];
	readonly bonus: RoleBonus;
	readonly requirements: readonly Requirement[];
}

/** Una ranura del casco. */
function slot(kind: SlotKind, size: number): SlotSpec {
	return { kind, size };
}

/** Varias ranuras iguales de una bandeja, que es como se declara una terna. */
function slots(kind: SlotKind, size: number, count: number): SlotSpec[] {
	return Array.from({ length: count }, () => slot(kind, size));
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
		mass: 250,
		/**
		 * Treinta metros cúbicos: dos personas y un cajón.
		 *
		 * Eran doscientos, que no era una lanzadera humilde sino **un tercio de una
		 * carguera**. Tres cosas se arreglan al achicarla:
		 *
		 * - **La primera sesión toma forma.** Con doscientos, llenar la bodega
		 *   minando eran casi seis horas: se apretaba «extraer» y no pasaba nada en
		 *   toda la tarde. Con treinta más la bodega auxiliar del kit son poco más de
		 *   una hora, que es salir, minar, volver y vender.
		 * - **Deja lugar para que la nave minera sea un salto.** Si la nave de alta
		 *   lleva doscientos, la primera minera tiene que llevar ochocientos para
		 *   sentirse mejor. Con treinta, la escalera entera respira.
		 * - **Hace que la bodega sea una decisión.** Es la misma razón por la que el
		 *   kit del minero deja ranuras vacías: el repuesto que lleva ocupa cinco de
		 *   estos treinta, y eso ahora se siente.
		 *
		 * Lo que **no** cambia es cuánto se saca por hora, que es cosa del láser. Si
		 * el problema fuera el ritmo y no la forma del viaje, la perilla es otra.
		 */
		cargo: 30,
		armor: 120,
		structure: 400,
		computing: 45,
		power: 30,
		thrust: 48_000,
		jumpPower: 720,
		capacitor: 240,
		capacitorRecharge: 8,
		calibration: 100,
		fuel: 120,
		sensorRange: 50,
		signature: 30,
		slots: [
			...slots('high', 1, 1),
			...slots('mid', 1, 2),
			...slots('low', 2, 2),
			...slots('rig', 1, 1)
		],
		// El bono de rol pasó de Navegación a Manejo de lanzaderas. Navegación ya
		// empuja la velocidad de toda nave desde el bono general, y sumarla otra vez
		// acá era contar dos veces lo mismo — lo que ACTIONS.md prohíbe por escrito—.
		// Con el cambio, la Pioner queda como las otras cuatro: su bono de rol es la
		// habilidad de su especialidad, y Manejo de lanzaderas pasa a gobernar algo
		// de verdad en vez de ser el requisito de un casco que no puede pedir nada.
		bonus: { target: 'speed', skill: 'shuttle_handling', percentPerLevel: 2 },
		requirements: []
	},
	{
		code: 'mula',
		name: 'Mula',
		role: 'Carguera',
		description:
			'Una bodega con motores. Lenta, gorda y visible desde el otro lado ' +
			'del sistema, pero es la columna vertebral de todo el comercio.',
		dockSize: 'medium',
		mass: 545,
		cargo: 600,
		armor: 180,
		structure: 620,
		computing: 55,
		power: 45,
		thrust: 88_000,
		jumpPower: 1360,
		capacitor: 380,
		capacitorRecharge: 13,
		calibration: 300,
		fuel: 200,
		sensorRange: 50,
		signature: 70,
		slots: [
			...slots('high', 1, 1),
			...slots('mid', 2, 3),
			...slots('low', 3, 5),
			...slots('rig', 2, 3)
		],
		bonus: { target: 'cargo', skill: 'cargo_engineering', percentPerLevel: 5 },
		requirements: [{ skill: 'cargo_engineering', level: 2 }]
	},
	{
		code: 'percal',
		name: 'Percal',
		role: 'Minera',
		description:
			'Casco reforzado y sitio para dos láseres. Se mueve como una casa, ' +
			'pero saca más de un asteroide que cualquier otra cosa de su porte.',
		dockSize: 'medium',
		mass: 505,
		cargo: 400,
		armor: 220,
		structure: 700,
		computing: 65,
		power: 50,
		thrust: 88_000,
		jumpPower: 1360,
		capacitor: 400,
		capacitorRecharge: 15,
		calibration: 300,
		fuel: 185,
		sensorRange: 60,
		signature: 60,
		slots: [
			...slots('high', 2, 2),
			...slots('mid', 2, 4),
			...slots('low', 3, 3),
			...slots('rig', 2, 3)
		],
		bonus: { target: 'mining_yield', skill: 'mining', percentPerLevel: 5 },
		requirements: [{ skill: 'mining', level: 2 }]
	},
	{
		code: 'vencejo',
		name: 'Vencejo',
		role: 'Exploradora',
		description:
			'Liviana, callada y con más sensores que bodega. Llega adonde nadie ' +
			'llegó y vuelve a contarlo, siempre que no la encuentren.',
		dockSize: 'small',
		mass: 275,
		cargo: 120,
		armor: 100,
		structure: 360,
		computing: 115,
		power: 40,
		thrust: 88_000,
		jumpPower: 1360,
		capacitor: 360,
		capacitorRecharge: 16,
		calibration: 300,
		fuel: 265,
		sensorRange: 135,
		signature: 18,
		slots: [
			...slots('high', 1, 1),
			...slots('mid', 2, 5),
			...slots('low', 2, 2),
			...slots('rig', 1, 3)
		],
		bonus: { target: 'sensor_range', skill: 'scanning', percentPerLevel: 8 },
		requirements: [{ skill: 'scanning', level: 2 }]
	},
	{
		code: 'alabarda',
		name: 'Alabarda',
		role: 'Combate',
		description:
			'Tres anclajes y blindaje de sobra. La bodega alcanza para munición ' +
			'y poco más: esta nave no va a ningún lado a trabajar.',
		dockSize: 'medium',
		mass: 585,
		cargo: 90,
		armor: 420,
		structure: 900,
		computing: 60,
		power: 55,
		thrust: 96_000,
		jumpPower: 1360,
		capacitor: 440,
		capacitorRecharge: 14,
		calibration: 300,
		fuel: 195,
		sensorRange: 75,
		signature: 55,
		slots: [
			...slots('high', 2, 4),
			...slots('mid', 2, 3),
			...slots('low', 3, 4),
			...slots('rig', 2, 3)
		],
		bonus: { target: 'damage', skill: 'gunnery', percentPerLevel: 5 },
		requirements: [{ skill: 'gunnery', level: 2 }]
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
