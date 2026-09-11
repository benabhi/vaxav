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
 * Corresponde a docs/systems/SHIPS.md.
 */

import { lookup } from './catalog';
import type { CoreSystem, SlotKind } from './hulls';

/** Las cinco calificaciones, de la más capaz a la más modesta. */
export const RATINGS = ['A', 'B', 'C', 'D', 'E'] as const;
export type Rating = (typeof RATINGS)[number] | '';

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
	readonly rating: Rating;
	readonly description: string;

	/** Sólo los internos esenciales lo llevan: dice cuál de los siete es. */
	readonly core: CoreSystem | null;

	// --- Qué cuesta montarlo ---
	readonly mass: number;
	readonly powerDraw: number;
	readonly computingDraw: number;

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
	core: null,
	mass: 0,
	powerDraw: 0,
	computingDraw: 0,
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
	Pick<ShipModule, 'code' | 'name' | 'kind' | 'size' | 'rating'>;

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
	kind: 'optional',
	size: 0,
	rating: '',
	description: 'Sin nada montado.'
});

export const MODULES: readonly ShipModule[] = [
	// --- Internos esenciales ---
	// Se mejoran, no se quitan. Hay uno de clase 1 a 3 para cada sistema, que es
	// lo que necesitan los cinco cascos del catálogo.
	// Planta de energía: define cuánta potencia hay para repartir.
	defineModule({
		code: 'plant_2e',
		name: 'Planta de energía',
		kind: 'core',
		size: 2,
		rating: 'E',
		description: 'Da lo justo. Barata y liviana.',
		core: 'power_plant',
		mass: 18,
		powerOutput: 45
	}),
	defineModule({
		code: 'plant_2a',
		name: 'Planta de energía',
		kind: 'core',
		size: 2,
		rating: 'A',
		description: 'Mucha potencia y mucho peso. La que habilita el resto.',
		core: 'power_plant',
		mass: 30,
		powerOutput: 70
	}),
	defineModule({
		code: 'plant_3e',
		name: 'Planta de energía',
		kind: 'core',
		size: 3,
		rating: 'E',
		description: 'La modesta de su clase.',
		core: 'power_plant',
		mass: 34,
		powerOutput: 72
	}),
	defineModule({
		code: 'plant_3a',
		name: 'Planta de energía',
		kind: 'core',
		size: 3,
		rating: 'A',
		description: 'Alimenta una nave entera y se nota en la balanza.',
		core: 'power_plant',
		mass: 55,
		powerOutput: 108
	}),
	// Propulsores: de acá sale la velocidad de crucero.
	defineModule({
		code: 'thrusters_2e',
		name: 'Propulsores',
		kind: 'core',
		size: 2,
		rating: 'E',
		description: 'Empujan. No mucho más.',
		core: 'thrusters',
		mass: 14,
		powerDraw: 6,
		thrust: 48000
	}),
	defineModule({
		code: 'thrusters_2a',
		name: 'Propulsores',
		kind: 'core',
		size: 2,
		rating: 'A',
		description: 'Caros y sedientos, pero acortan cada viaje.',
		core: 'thrusters',
		mass: 22,
		powerDraw: 12,
		thrust: 62000
	}),
	defineModule({
		code: 'thrusters_3e',
		name: 'Propulsores',
		kind: 'core',
		size: 3,
		rating: 'E',
		description: 'Para cascos medianos, sin pretensiones.',
		core: 'thrusters',
		mass: 26,
		powerDraw: 9,
		thrust: 88000
	}),
	defineModule({
		code: 'thrusters_3a',
		name: 'Propulsores',
		kind: 'core',
		size: 3,
		rating: 'A',
		description: 'Mueven una casa. Piden una planta a la altura.',
		core: 'thrusters',
		mass: 40,
		powerDraw: 18,
		thrust: 116000
	}),
	// Motor de salto: de acá sale el alcance entre sistemas.
	defineModule({
		code: 'jump_2d',
		name: 'Motor de salto',
		kind: 'core',
		size: 2,
		rating: 'D',
		description: 'Liviano, y por eso llega lejos pese a ser modesto.',
		core: 'jump_drive',
		mass: 10,
		powerDraw: 5,
		jumpPower: 720
	}),
	defineModule({
		code: 'jump_2a',
		name: 'Motor de salto',
		kind: 'core',
		size: 2,
		rating: 'A',
		description: 'El que más empuja, si podés cargar con él.',
		core: 'jump_drive',
		mass: 20,
		powerDraw: 9,
		jumpPower: 1080
	}),
	defineModule({
		code: 'jump_3d',
		name: 'Motor de salto',
		kind: 'core',
		size: 3,
		rating: 'D',
		description: 'La opción de quien piensa en la vuelta.',
		core: 'jump_drive',
		mass: 18,
		powerDraw: 7,
		jumpPower: 1360
	}),
	defineModule({
		code: 'jump_3a',
		name: 'Motor de salto',
		kind: 'core',
		size: 3,
		rating: 'A',
		description: 'Alcance de sobra a cambio de masa.',
		core: 'jump_drive',
		mass: 34,
		powerDraw: 13,
		jumpPower: 1960
	}),
	// Distribuidor: el acumulador y su recarga.
	defineModule({
		code: 'distributor_2e',
		name: 'Distribuidor',
		kind: 'core',
		size: 2,
		rating: 'E',
		description: 'Reserva chica. Obliga a trabajar de a ratos.',
		core: 'distributor',
		mass: 8,
		powerDraw: 3,
		capacitor: 240,
		capacitorRecharge: 8
	}),
	defineModule({
		code: 'distributor_2a',
		name: 'Distribuidor',
		kind: 'core',
		size: 2,
		rating: 'A',
		description: 'Aguanta un láser encendido sin pestañear.',
		core: 'distributor',
		mass: 14,
		powerDraw: 7,
		capacitor: 340,
		capacitorRecharge: 14
	}),
	defineModule({
		code: 'distributor_3e',
		name: 'Distribuidor',
		kind: 'core',
		size: 3,
		rating: 'E',
		description: 'Reserva mediana para trabajos largos.',
		core: 'distributor',
		mass: 13,
		powerDraw: 5,
		capacitor: 380,
		capacitorRecharge: 13
	}),
	defineModule({
		code: 'distributor_3a',
		name: 'Distribuidor',
		kind: 'core',
		size: 3,
		rating: 'A',
		description: 'Sostiene dos anclajes a la vez, si la planta acompaña.',
		core: 'distributor',
		mass: 22,
		powerDraw: 11,
		capacitor: 520,
		capacitorRecharge: 22
	}),
	// Sensores.
	defineModule({
		code: 'sensors_2e',
		name: 'Sensores',
		kind: 'core',
		size: 2,
		rating: 'E',
		description: 'Ven lo que tienen delante.',
		core: 'sensors',
		mass: 6,
		powerDraw: 2,
		computingDraw: 8,
		sensorRange: 10
	}),
	defineModule({
		code: 'sensors_2a',
		name: 'Sensores',
		kind: 'core',
		size: 2,
		rating: 'A',
		description: 'Caros en cómputo, y ahí está el precio real.',
		core: 'sensors',
		mass: 10,
		powerDraw: 5,
		computingDraw: 22,
		sensorRange: 45
	}),
	defineModule({
		code: 'sensors_3e',
		name: 'Sensores',
		kind: 'core',
		size: 3,
		rating: 'E',
		description: 'Lo mínimo para no volar a ciegas.',
		core: 'sensors',
		mass: 9,
		powerDraw: 3,
		computingDraw: 12,
		sensorRange: 16
	}),
	defineModule({
		code: 'sensors_3a',
		name: 'Sensores',
		kind: 'core',
		size: 3,
		rating: 'A',
		description: 'Encuentran lo que nadie cartografió.',
		core: 'sensors',
		mass: 15,
		powerDraw: 7,
		computingDraw: 34,
		sensorRange: 70
	}),
	// Soporte vital y tanque: no se eligen, se llevan.
	defineModule({
		code: 'life_2e',
		name: 'Soporte vital',
		kind: 'core',
		size: 2,
		rating: 'E',
		description: 'Aire y calor. Nadie lo mejora hasta que lo necesita.',
		core: 'life_support',
		mass: 7,
		powerDraw: 3,
		computingDraw: 4
	}),
	defineModule({
		code: 'life_3e',
		name: 'Soporte vital',
		kind: 'core',
		size: 3,
		rating: 'E',
		description: 'Lo mismo, para un casco más grande.',
		core: 'life_support',
		mass: 11,
		powerDraw: 4,
		computingDraw: 6
	}),
	defineModule({
		code: 'tank_2e',
		name: 'Tanque',
		kind: 'core',
		size: 2,
		rating: 'E',
		description: 'Combustible. Cuanto más lleva, más pesa.',
		core: 'tank',
		mass: 9,
		powerDraw: 1,
		fuel: 20
	}),
	defineModule({
		code: 'tank_3e',
		name: 'Tanque',
		kind: 'core',
		size: 3,
		rating: 'E',
		description: 'El depósito de una nave que sale del sistema.',
		core: 'tank',
		mass: 15,
		powerDraw: 1,
		fuel: 45
	}),

	// --- Anclajes ---
	// pega en todo un poco menos.
	defineModule({
		code: 'mining_laser_1e',
		name: 'Láser de extracción',
		kind: 'hardpoint',
		size: 1,
		rating: 'E',
		description: 'El primero de todos. Lento, pero paga la nave.',
		mass: 6,
		powerDraw: 4,
		computingDraw: 6,
		cycleSeconds: 60,
		activationCost: 180,
		miningYield: 6
	}),
	defineModule({
		code: 'mining_laser_1a',
		name: 'Láser de extracción',
		kind: 'hardpoint',
		size: 1,
		rating: 'A',
		description: 'Casi el doble de mineral, y el acumulador lo siente.',
		mass: 9,
		powerDraw: 9,
		computingDraw: 14,
		cycleSeconds: 60,
		activationCost: 330,
		miningYield: 10
	}),
	defineModule({
		code: 'mining_laser_2a',
		name: 'Láser de extracción',
		kind: 'hardpoint',
		size: 2,
		rating: 'A',
		description: 'Para una nave hecha para esto y nada más.',
		mass: 16,
		powerDraw: 15,
		computingDraw: 20,
		cycleSeconds: 60,
		activationCost: 480,
		miningYield: 18
	}),
	defineModule({
		code: 'mass_cannon_1e',
		name: 'Cañón de masa',
		kind: 'hardpoint',
		size: 1,
		rating: 'E',
		description: 'Metralla. Le rebota a un escudo y le abre el metal.',
		mass: 8,
		powerDraw: 5,
		computingDraw: 4,
		cycleSeconds: 5,
		activationCost: 18,
		kinetic: 30
	}),
	defineModule({
		code: 'mass_cannon_2c',
		name: 'Cañón de masa',
		kind: 'hardpoint',
		size: 2,
		rating: 'C',
		description: 'El mismo argumento, más grande.',
		mass: 15,
		powerDraw: 9,
		computingDraw: 7,
		cycleSeconds: 5,
		activationCost: 30,
		kinetic: 52
	}),
	defineModule({
		code: 'ion_emitter_1c',
		name: 'Emisor iónico',
		kind: 'hardpoint',
		size: 1,
		rating: 'C',
		description: 'Atraviesa un escudo como si no estuviera. Contra blindaje, poco.',
		mass: 7,
		powerDraw: 8,
		computingDraw: 12,
		cycleSeconds: 5,
		activationCost: 26,
		ionic: 26
	}),
	defineModule({
		code: 'ion_emitter_2a',
		name: 'Emisor iónico',
		kind: 'hardpoint',
		size: 2,
		rating: 'A',
		description: 'Baja escudos rápido y te deja el trabajo a medias.',
		mass: 13,
		powerDraw: 16,
		computingDraw: 24,
		cycleSeconds: 5,
		activationCost: 44,
		ionic: 46
	}),
	defineModule({
		code: 'thermal_lance_1c',
		name: 'Lanza térmica',
		kind: 'hardpoint',
		size: 1,
		rating: 'C',
		description: 'Pega menos, pero nunca le rebota del todo. La de la duda.',
		mass: 8,
		powerDraw: 7,
		computingDraw: 8,
		cycleSeconds: 5,
		activationCost: 24,
		thermal: 22
	}),
	defineModule({
		code: 'thermal_lance_2c',
		name: 'Lanza térmica',
		kind: 'hardpoint',
		size: 2,
		rating: 'C',
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
		code: 'scanner_1e',
		name: 'Escáner de superficie',
		kind: 'utility',
		size: 1,
		rating: 'E',
		description: 'Lee un cuerpo desde lejos. Barato en todo menos cómputo.',
		mass: 3,
		powerDraw: 2,
		computingDraw: 10,
		sensorRange: 25
	}),
	defineModule({
		code: 'scanner_2a',
		name: 'Escáner de superficie',
		kind: 'utility',
		size: 2,
		rating: 'A',
		description: 'Ve lo que otros tienen que ir a mirar de cerca.',
		mass: 5,
		powerDraw: 4,
		computingDraw: 28,
		sensorRange: 65
	}),
	defineModule({
		code: 'shield_booster_1c',
		name: 'Refuerzo de escudo',
		kind: 'utility',
		size: 1,
		rating: 'C',
		description: 'Un poco más de campo, si hay generador que reforzar.',
		mass: 4,
		powerDraw: 5,
		computingDraw: 9,
		shield: 40
	}),
	defineModule({
		code: 'armor_plate_1d',
		name: 'Placa de blindaje',
		kind: 'utility',
		size: 1,
		rating: 'D',
		description: 'Metal y nada más: no pide energía, pero pesa como plomo.',
		mass: 16,
		armor: 90
	}),
	defineModule({
		code: 'dampener_2d',
		name: 'Amortiguador de firma',
		kind: 'utility',
		size: 2,
		rating: 'D',
		description: 'Te hace difícil de encontrar. La póliza del carguero.',
		mass: 5,
		powerDraw: 3,
		computingDraw: 16,
		signature: -14
	}),

	// --- Internos opcionales ---
	// Acá se decide a qué se dedica la nave.
	defineModule({
		code: 'cargo_rack_1d',
		name: 'Bodega adicional',
		kind: 'optional',
		size: 1,
		rating: 'D',
		description: 'Espacio. Sin energía, sin cómputo, sin excusas.',
		mass: 4,
		cargo: 25
	}),
	defineModule({
		code: 'cargo_rack_2c',
		name: 'Bodega adicional',
		kind: 'optional',
		size: 2,
		rating: 'C',
		description: 'El módulo que paga el viaje.',
		mass: 9,
		powerDraw: 1,
		cargo: 90
	}),
	defineModule({
		code: 'cargo_rack_3c',
		name: 'Bodega adicional',
		kind: 'optional',
		size: 3,
		rating: 'C',
		description: 'Media nave convertida en depósito.',
		mass: 18,
		powerDraw: 2,
		cargo: 200
	}),
	defineModule({
		code: 'shield_gen_2a',
		name: 'Generador de escudo',
		kind: 'optional',
		size: 2,
		rating: 'A',
		description: 'Sin esto no hay escudo. Se lleva el cómputo de un tirón.',
		mass: 12,
		powerDraw: 10,
		computingDraw: 30,
		shield: 180
	}),
	defineModule({
		code: 'shield_gen_3a',
		name: 'Generador de escudo',
		kind: 'optional',
		size: 3,
		rating: 'A',
		description: 'Un campo serio, para una nave que puede alimentarlo.',
		mass: 22,
		powerDraw: 17,
		computingDraw: 48,
		shield: 330
	}),
	defineModule({
		code: 'collector_1e',
		name: 'Recolectores',
		kind: 'optional',
		size: 1,
		rating: 'E',
		description: 'Levantan lo que el láser desprende. Poco espacio, mucho ahorro.',
		mass: 5,
		powerDraw: 2,
		computingDraw: 6,
		cargo: 15
	}),
	defineModule({
		code: 'refinery_2c',
		name: 'Refinería de a bordo',
		kind: 'optional',
		size: 2,
		rating: 'C',
		description:
			'Convierte en el sitio y te ahorra el viaje. Ocupa parte de la bodega que viene a mejorar.',
		mass: 20,
		powerDraw: 8,
		computingDraw: 34,
		cargo: -30
	}),
	defineModule({
		code: 'fuel_tank_2d',
		name: 'Depósito auxiliar',
		kind: 'optional',
		size: 2,
		rating: 'D',
		description: 'Más saltos antes de volver a puerto.',
		mass: 7,
		fuel: 40
	}),
	defineModule({
		code: 'armor_bulkhead_2b',
		name: 'Mamparo reforzado',
		kind: 'optional',
		size: 2,
		rating: 'B',
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
 */
export function modulesForSlot(
	kind: SlotKind,
	size: number,
	core: CoreSystem | null = null
): readonly ShipModule[] {
	return MODULES.filter(
		(module) => module.kind === kind && module.size <= size && module.core === core
	).sort((a, b) => b.size - a.size || (a.rating < b.rating ? -1 : a.rating > b.rating ? 1 : 0));
}
