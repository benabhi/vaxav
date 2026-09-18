/**
 * El catálogo de módulos: lo que se le monta a un casco.
 *
 * Un módulo se nombra por dos cosas: su **clase**, de 1 a 8, que es el tamaño y
 * decide en qué ranura entra; y su **calificación**, de A a E, que no es una
 * jerarquía sino un compromiso distinto. La A es la más capaz, la más cara y la
 * que más energía pide; la D es la liviana; la E, la modesta y barata.
 *
 * Que la D sea la liviana y la A la potente es lo que hace que armar una nave
 * sea una decisión y no una compra: **no hay una configuración óptima, hay una
 * para cada oficio**.
 *
 * Todos los números son enteros. No hay decimales en ninguna parte del juego:
 * dos pilotos nunca tienen que poder calcular distinto por un redondeo.
 *
 * **El escalón es la puerta de habilidad**, y ésa es la regla que ordena el
 * catálogo: el E no pide nada —es el que vuela una nave de astillero— y el A pide
 * la habilidad de su sistema al **nivel II**, o al **III** si es de clase 3.
 * Entrenar deja de ser un número que sube y pasa a ser una llave.
 *
 * Con una salvaguarda que no es negociable: **sólo se gatea con habilidades que
 * se puedan entrenar**. La experiencia se deposita por rama y hoy sólo cuatro
 * ramas tienen una acción que las pague, así que pedir una habilidad de
 * Ingeniería o de Combate sería cerrar la puerta con la llave adentro. Por eso la
 * planta y el distribuidor A todavía no piden Gestión de energía: la recogen
 * cuando el taller le dé a Ingeniería de dónde salir.
 *
 * Corresponde a docs/systems/SHIPS.md.
 */

import { lookup } from './catalog';
import type { SlotKind } from './hulls';
import type { Requirement } from './skills';

/**
 * Los escalones tecnológicos, **de entrada a avanzado**: I y II.
 *
 * No es una escala de calidad a secas: es la **puerta de habilidad**. El **I** no
 * pide nada y es con el que sale una nave del astillero; el **II** rinde más,
 * cuesta más, pide habilidades entrenadas y aprieta más la potencia y el cómputo,
 * así que en una nave chica o con el cómputo al límite el I puede ser la elección
 * correcta.
 *
 * **Corre hacia adelante**, y queda lugar para un III. Antes era una letra de la E
 * a la A que corría para atrás —la A era el tope— y había que aprenderse que la
 * escalera iba al revés; ésa era la mitad de por qué no se entendía. La otra mitad
 * era que la letra mezclaba dos cosas: el escalón tecnológico y el compromiso de
 * diseño, que ahora va en el adjetivo.
 *
 * Lo que decide si un módulo **entra** en la ranura es la clase, que es otra cosa.
 */
export const TIERS = ['I', 'II'] as const;
export type Tier = (typeof TIERS)[number] | '';

/**
 * Un módulo montable.
 *
 * Los campos se agrupan en tres: **qué cuesta** montarlo, **qué aporta** por
 * tenerlo puesto, y **qué hace** cuando se lo enciende. Casi todos los módulos
 * usan tres o cuatro campos y dejan el resto en cero; sumarlos así, campo a
 * campo, es lo que le permite a la calculadora recorrer las ranuras una sola vez
 * sin conocer ningún módulo en particular.
 */
export interface ShipModule {
	readonly code: string;
	readonly name: string;
	readonly kind: SlotKind;
	readonly size: number;
	readonly tier: Tier;
	readonly description: string;

	/**
	 * Qué hay que saber para montarlo.
	 *
	 * **Es la otra mitad de lo que significa el escalón.** Un módulo A rinde más y
	 * cuesta más, pero lo que lo vuelve una meta y no sólo un gasto es que haya que
	 * entrenar para poder usarlo. El escalón E no pide nada: es el que vuela una
	 * nave de astillero, y ponerle un requisito dejaría a un piloto nuevo con una
	 * nave que no despega.
	 */
	readonly requirements: readonly Requirement[];

	// --- Qué cuesta montarlo ---
	readonly mass: number;
	readonly powerDraw: number;
	readonly computingDraw: number;
	/**
	 * Cuánta calibración gasta, si es un refuerzo.
	 *
	 * Es el único costo que no se recupera: sacar un refuerzo lo destruye, así que
	 * gastar calibración es definitivo.
	 */
	readonly calibrationDraw: number;

	// --- Qué aporta por estar puesto ---
	readonly powerOutput: number;
	/** Empuje. La velocidad sale de dividirlo por la masa total. */
	readonly thrust: number;
	/** Potencia de salto. El alcance sale de dividirla por la masa total. */
	readonly jumpPower: number;
	readonly capacitor: number;
	readonly capacitorRecharge: number;
	readonly shield: number;
	readonly armor: number;
	readonly cargo: number;
	readonly fuel: number;
	readonly sensorRange: number;
	readonly signature: number;

	// --- Qué hace encendido ---
	readonly cycleSeconds: number;
	/** Cuánto acumulador se lleva cada ciclo. */
	readonly activationCost: number;
	/** Metros cúbicos de mineral por ciclo. */
	readonly miningYield: number;
	readonly kinetic: number;
	readonly ionic: number;
	readonly thermal: number;
}

/** Lo que vale un campo que el módulo no declara: cero, siempre. */
const NOTHING = {
	description: '',
	requirements: [] as readonly Requirement[],
	mass: 0,
	powerDraw: 0,
	computingDraw: 0,
	calibrationDraw: 0,
	powerOutput: 0,
	thrust: 0,
	jumpPower: 0,
	capacitor: 0,
	capacitorRecharge: 0,
	shield: 0,
	armor: 0,
	cargo: 0,
	fuel: 0,
	sensorRange: 0,
	signature: 0,
	cycleSeconds: 0,
	activationCost: 0,
	miningYield: 0,
	kinetic: 0,
	ionic: 0,
	thermal: 0
} as const;

/** Lo que hay que declarar sí o sí; el resto queda en cero. */
type ModuleSpec = Partial<ShipModule> &
	Pick<ShipModule, 'code' | 'name' | 'kind' | 'size' | 'tier'>;

/**
 * Declara un módulo completando en cero todo lo que no aporta.
 *
 * Así el catálogo se lee por lo que cada módulo *hace* —tres o cuatro líneas—
 * mientras la calculadora sigue viendo los veintidós campos siempre presentes.
 */
function defineModule(spec: ModuleSpec): ShipModule {
	return { ...NOTHING, ...spec };
}

/**
 * La ranura vacía. Existe como valor y no como `null` para que la pantalla no
 * tenga que preguntar en cada lugar si hay algo montado.
 */
export const EMPTY: ShipModule = defineModule({
	code: '',
	name: 'Vacía',
	kind: 'low',
	size: 0,
	tier: '',
	description: 'Sin nada montado.'
});

export const MODULES: readonly ShipModule[] = [
	// --- Consolas: lo que se enciende ---
	//
	// Los propulsores, los sensores y el acumulador **eran internos esenciales**:
	// toda nave tenía que llevar uno y elegir cuál era una compra, no una
	// decisión. Ahora el casco los trae de fábrica y esto es la mejora, que
	// cuesta una ranura. Eso es lo que separa mejorar de comprar.
	defineModule({
		code: 'thruster_i2',
		name: 'Propulsor auxiliar',
		kind: 'mid',
		size: 2,
		tier: 'I',
		description: 'Empuje de más, encendido cuando hace falta.',
		mass: 14,
		powerDraw: 6,
		thrust: 14_000
	}),
	defineModule({
		code: 'thruster_ii2',
		requirements: [{ skill: 'navigation', level: 2 }],
		name: 'Propulsor auxiliar',
		kind: 'mid',
		size: 2,
		tier: 'II',
		description: 'Caro y sediento, pero acorta cada viaje.',
		mass: 22,
		powerDraw: 12,
		thrust: 26_000
	}),
	defineModule({
		code: 'thruster_ii3',
		requirements: [{ skill: 'navigation', level: 3 }],
		name: 'Propulsor auxiliar',
		kind: 'mid',
		size: 3,
		tier: 'II',
		description: 'Mueve una casa. Pide una planta a la altura.',
		mass: 40,
		powerDraw: 18,
		thrust: 44_000
	}),
	defineModule({
		code: 'sensor_amp_i2',
		name: 'Amplificador de sensores',
		kind: 'mid',
		size: 2,
		tier: 'I',
		description: 'Estira el alcance a cambio de cómputo.',
		mass: 10,
		powerDraw: 5,
		computingDraw: 22,
		sensorRange: 45
	}),
	defineModule({
		code: 'sensor_amp_ii3',
		requirements: [{ skill: 'scanning', level: 3 }],
		name: 'Amplificador de sensores',
		kind: 'mid',
		size: 3,
		tier: 'II',
		description: 'Ve lo que nadie, y se come el cómputo de la nave.',
		mass: 15,
		powerDraw: 7,
		computingDraw: 34,
		sensorRange: 70
	}),
	defineModule({
		code: 'capacitor_battery_i2',
		name: 'Batería de acumulador',
		kind: 'mid',
		size: 2,
		tier: 'I',
		description: 'Más reserva para sostener lo que está encendido.',
		mass: 14,
		powerDraw: 4,
		capacitor: 120,
		capacitorRecharge: 4
	}),
	defineModule({
		code: 'capacitor_battery_ii3',
		name: 'Batería de acumulador',
		kind: 'mid',
		size: 3,
		tier: 'II',
		description: 'Aguanta dos láseres grandes sin pestañear.',
		mass: 22,
		powerDraw: 8,
		capacitor: 220,
		capacitorRecharge: 9
	}),

	// --- Bastidor: lo que está puesto y ya ---
	defineModule({
		code: 'power_relay_i2',
		name: 'Relé de energía',
		kind: 'low',
		size: 2,
		tier: 'I',
		description: 'Aprovecha mejor la planta. No se apaga nunca.',
		mass: 16,
		powerOutput: 12
	}),
	defineModule({
		code: 'power_relay_ii3',
		name: 'Relé de energía',
		kind: 'low',
		size: 3,
		tier: 'II',
		description: 'El que hace entrar el módulo que no entraba.',
		mass: 28,
		powerOutput: 26
	}),
	defineModule({
		code: 'jump_calibrator_i2',
		name: 'Calibrador de salto',
		kind: 'low',
		size: 2,
		tier: 'I',
		description: 'Estira el alcance de cada salto.',
		mass: 20,
		powerDraw: 4,
		jumpPower: 360
	}),
	defineModule({
		code: 'jump_calibrator_ii3',
		requirements: [{ skill: 'astrogation', level: 3 }],
		name: 'Calibrador de salto',
		kind: 'low',
		size: 3,
		tier: 'II',
		description: 'Cruza de un tirón lo que otros hacen en dos.',
		mass: 34,
		powerDraw: 7,
		jumpPower: 600
	}),

	// --- Anclajes: lo que apunta hacia afuera ---
	defineModule({
		code: 'mining_laser_i1',
		name: 'Láser de extracción',
		kind: 'high',
		size: 1,
		tier: 'I',
		description: 'El primero de todos. Lento, pero paga la nave.',
		mass: 6,
		powerDraw: 4,
		computingDraw: 6,
		cycleSeconds: 60,
		activationCost: 180,
		miningYield: 6
	}),
	defineModule({
		code: 'mining_laser_ii1',
		requirements: [{ skill: 'mining', level: 2 }],
		name: 'Láser de extracción',
		kind: 'high',
		size: 1,
		tier: 'II',
		description: 'Casi el doble de mineral, y el acumulador lo siente.',
		mass: 9,
		powerDraw: 9,
		computingDraw: 14,
		cycleSeconds: 60,
		activationCost: 330,
		miningYield: 10
	}),
	defineModule({
		code: 'mining_laser_i2',
		name: 'Láser de extracción',
		kind: 'high',
		size: 2,
		tier: 'I',
		description: 'Para una nave hecha para esto y nada más.',
		mass: 16,
		powerDraw: 15,
		computingDraw: 20,
		cycleSeconds: 60,
		activationCost: 480,
		miningYield: 18
	}),
	defineModule({
		code: 'mass_cannon_i1',
		name: 'Cañón de masa',
		kind: 'high',
		size: 1,
		tier: 'I',
		description: 'Metralla. Le rebota a un escudo y le abre el metal.',
		mass: 8,
		powerDraw: 5,
		computingDraw: 4,
		cycleSeconds: 5,
		activationCost: 18,
		kinetic: 30
	}),
	defineModule({
		code: 'mass_cannon_i2',
		name: 'Cañón de masa',
		kind: 'high',
		size: 2,
		tier: 'I',
		description: 'El mismo argumento, más grande.',
		mass: 15,
		powerDraw: 9,
		computingDraw: 7,
		cycleSeconds: 5,
		activationCost: 30,
		kinetic: 52
	}),
	defineModule({
		code: 'ion_emitter_i1',
		name: 'Emisor iónico',
		kind: 'high',
		size: 1,
		tier: 'I',
		description: 'Atraviesa un escudo como si no estuviera. Contra blindaje, poco.',
		mass: 7,
		powerDraw: 8,
		computingDraw: 12,
		cycleSeconds: 5,
		activationCost: 26,
		ionic: 26
	}),
	defineModule({
		code: 'ion_emitter_i2',
		name: 'Emisor iónico',
		kind: 'high',
		size: 2,
		tier: 'I',
		description: 'Baja escudos rápido y te deja el trabajo a medias.',
		mass: 13,
		powerDraw: 16,
		computingDraw: 24,
		cycleSeconds: 5,
		activationCost: 44,
		ionic: 46
	}),
	defineModule({
		code: 'thermal_lance_i1',
		name: 'Lanza térmica',
		kind: 'high',
		size: 1,
		tier: 'I',
		description: 'Pega menos, pero nunca le rebota del todo. La de la duda.',
		mass: 8,
		powerDraw: 7,
		computingDraw: 8,
		cycleSeconds: 5,
		activationCost: 24,
		thermal: 22
	}),
	defineModule({
		code: 'thermal_lance_i2',
		name: 'Lanza térmica',
		kind: 'high',
		size: 2,
		tier: 'I',
		description: 'Sirve contra todo y contra nadie en particular.',
		mass: 14,
		powerDraw: 12,
		computingDraw: 13,
		cycleSeconds: 5,
		activationCost: 38,
		thermal: 39
	}),

	// --- Utilitarios ---
	defineModule({
		code: 'scanner_i1',
		name: 'Escáner de superficie',
		kind: 'mid',
		size: 1,
		tier: 'I',
		description: 'Lee un cuerpo desde lejos. Barato en todo menos cómputo.',
		mass: 3,
		powerDraw: 2,
		computingDraw: 10,
		sensorRange: 25
	}),
	defineModule({
		code: 'scanner_i2',
		name: 'Escáner de superficie',
		kind: 'mid',
		size: 2,
		tier: 'I',
		description: 'Ve lo que otros tienen que ir a mirar de cerca.',
		mass: 5,
		powerDraw: 4,
		computingDraw: 28,
		sensorRange: 65
	}),
	defineModule({
		code: 'shield_booster_i1',
		name: 'Refuerzo de escudo',
		kind: 'mid',
		size: 1,
		tier: 'I',
		description: 'Un poco más de campo, si hay generador que reforzar.',
		mass: 4,
		powerDraw: 5,
		computingDraw: 9,
		shield: 40
	}),
	defineModule({
		code: 'armor_plate_i1',
		name: 'Placa de blindaje',
		kind: 'low',
		size: 1,
		tier: 'I',
		description: 'Metal y nada más: no pide energía, pero pesa como plomo.',
		mass: 16,
		armor: 90
	}),
	defineModule({
		code: 'dampener_i2',
		name: 'Amortiguador de firma',
		kind: 'mid',
		size: 2,
		tier: 'I',
		description: 'Te hace difícil de encontrar. La póliza del carguero.',
		mass: 5,
		powerDraw: 3,
		computingDraw: 16,
		signature: -14
	}),

	// --- Internos opcionales ---
	// Acá se decide a qué se dedica la nave.
	defineModule({
		code: 'cargo_rack_i1',
		name: 'Bodega adicional',
		kind: 'low',
		size: 1,
		tier: 'I',
		description: 'Espacio. Sin energía, sin cómputo, sin excusas.',
		mass: 4,
		cargo: 25
	}),
	defineModule({
		code: 'cargo_rack_i2',
		name: 'Bodega adicional',
		kind: 'low',
		size: 2,
		tier: 'I',
		description: 'El módulo que paga el viaje.',
		mass: 9,
		powerDraw: 1,
		cargo: 90
	}),
	defineModule({
		code: 'cargo_rack_i3',
		name: 'Bodega adicional',
		kind: 'low',
		size: 3,
		tier: 'I',
		description: 'Media nave convertida en depósito.',
		mass: 18,
		powerDraw: 2,
		cargo: 200
	}),
	defineModule({
		code: 'shield_gen_i2',
		name: 'Generador de escudo',
		kind: 'mid',
		size: 2,
		tier: 'I',
		description: 'Sin esto no hay escudo. Se lleva el cómputo de un tirón.',
		mass: 12,
		powerDraw: 10,
		computingDraw: 30,
		shield: 180
	}),
	defineModule({
		code: 'shield_gen_i3',
		name: 'Generador de escudo',
		kind: 'mid',
		size: 3,
		tier: 'I',
		description: 'Un campo serio, para una nave que puede alimentarlo.',
		mass: 22,
		powerDraw: 17,
		computingDraw: 48,
		shield: 330
	}),
	defineModule({
		code: 'collector_i1',
		name: 'Recolectores',
		kind: 'low',
		size: 1,
		tier: 'I',
		description: 'Levantan lo que el láser desprende. Poco espacio, mucho ahorro.',
		mass: 5,
		powerDraw: 2,
		computingDraw: 6,
		cargo: 15
	}),
	defineModule({
		code: 'refinery_i2',
		name: 'Refinería de a bordo',
		kind: 'mid',
		size: 2,
		tier: 'I',
		description:
			'Convierte en el sitio y te ahorra el viaje. Ocupa parte de la bodega que viene a mejorar.',
		mass: 20,
		powerDraw: 8,
		computingDraw: 34,
		cargo: -30
	}),
	defineModule({
		code: 'fuel_tank_i2',
		name: 'Depósito auxiliar',
		kind: 'low',
		size: 2,
		tier: 'I',
		description: 'Más saltos antes de volver a puerto.',
		mass: 7,
		fuel: 40
	}),
	defineModule({
		code: 'armor_bulkhead_i2',
		name: 'Mamparo reforzado',
		kind: 'low',
		size: 2,
		tier: 'I',
		description: 'Blindaje de verdad, al precio de la velocidad.',
		mass: 34,
		armor: 220
	})
];

/** El catálogo indexado por código. */
const BY_CODE: Readonly<Record<string, ShipModule>> = Object.fromEntries(
	MODULES.map((module) => [module.code, module])
);

/** Busca un módulo por código, o falla diciendo cuál falta. */
export function getModule(code: string): ShipModule {
	return lookup(BY_CODE, code, 'el módulo');
}

/**
 * Qué se le puede montar a una ranura, de mayor a menor clase.
 *
 * Un módulo entra si es del tipo correcto y **de clase igual o menor**: en una
 * ranura de clase 3 entra un módulo de clase 2, nunca uno de clase 4. Los
 * internos esenciales filtran además por cuál de los siete sistemas son.
 *
 * Dentro de una clase van del escalón más modesto al más capaz, que es el orden
 * en que se desbloquean: la lista se lee como la escalera que el piloto tiene por
 * delante.
 */
export function modulesForSlot(kind: SlotKind, size: number): readonly ShipModule[] {
	return MODULES.filter((module) => module.kind === kind && module.size <= size).sort(
		// De la clase más grande a la más chica, y dentro de cada una el escalón
		// más alto primero: es el orden en que uno mira una lista de repuestos.
		(a, b) => b.size - a.size || b.tier.length - a.tier.length || a.name.localeCompare(b.name)
	);
}
