/**
 * La calculadora de equipamiento: todo lo que sale de un casco más sus módulos.
 *
 * **Nada de esto se guarda.** Se guardará el casco, qué módulo hay en cada
 * ranura y el daño actual de cada capa; el resto —masa total, velocidad,
 * alcance, puntos efectivos, rendimiento, si el acumulador aguanta— se calcula
 * acá cada vez. Es el mismo criterio con el que la seguridad de un sistema sale
 * de su gobierno: con las dos cosas guardadas, tarde o temprano se contradicen,
 * y una nave que dice tener 400 de escudo y aguanta 250 es de los errores que el
 * jugador descubre justo cuando lo perjudica.
 *
 * Y lo que más importa: **ésta es la misma calculadora que usa el motor de
 * acciones**. En EVE las herramientas de equipamiento son de terceros,
 * reimplementan la matemática y se desfasan del juego. Acá tenemos las dos
 * puntas, así que la pantalla no puede mentir por construcción: si dice 340 m³
 * por hora, el motor va a extraer 340.
 *
 * Todo entero. Lo que necesita fracción se lleva en **décimas** —alcance de
 * salto, daño por segundo— igual que el dinero se lleva en la unidad más chica.
 *
 * Corresponde a docs/systems/SHIPS.md.
 */

import { DAMAGE_TYPES, type DamageType, totalEffectiveHp, weakestAgainst } from './damage';
import { HULLS, type BonusTarget, type CoreSystem, type Hull, type SlotSpec } from './hulls';
import { floorDiv, roundHalfEven } from './math';
import { EMPTY, type ShipModule, getModule, modulesForSlot } from './modules';

/**
 * Qué habilidad mejora cada cosa, y cuánto por nivel.
 *
 * Es una tabla y no código repartido por la calculadora: sumar una habilidad
 * nueva que mejore algo debería ser agregar una fila. Los porcentajes son datos
 * de balance y se van a mover.
 */
export const SKILL_BONUSES: Readonly<
	Record<BonusTarget, { readonly skill: string; readonly percentPerLevel: number }>
> = {
	cargo: { skill: 'cargo_engineering', percentPerLevel: 5 },
	speed: { skill: 'navigation', percentPerLevel: 3 },
	jump_range: { skill: 'astrogation', percentPerLevel: 4 },
	mining_yield: { skill: 'mining', percentPerLevel: 5 },
	damage: { skill: 'gunnery', percentPerLevel: 4 },
	shield: { skill: 'shields', percentPerLevel: 5 },
	armor: { skill: 'armor', percentPerLevel: 5 },
	sensor_range: { skill: 'scanning', percentPerLevel: 6 },
	capacitor_recharge: { skill: 'power_management', percentPerLevel: 4 }
};

/** Nivel máximo de una habilidad, para el modo "con todo entrenado". */
export const MAX_SKILL_LEVEL = 5;

/**
 * Cuántas décimas tiene una unidad. Las magnitudes que necesitan fracción se
 * guardan multiplicadas por esto.
 */
export const TENTHS = 10;

export const SECONDS_PER_HOUR = 3600;

/**
 * Cuántas toneladas de nave gasta una unidad de combustible por salto. Es el
 * número que hace que cargar la bodega hasta el tope también acorte la
 * autonomía, y no sólo la velocidad.
 */
export const MASS_PER_FUEL_UNIT = 40;

/** Los niveles de habilidad de un piloto, por código. */
export type SkillLevels = Readonly<Record<string, number>>;

/**
 * Un presupuesto: cuánto se usa de cuánto hay.
 *
 * Lo derivado viene calculado y no como funciones: este objeto viaja entero a la
 * pantalla, y allá tiene que poder dibujarse sin volver a razonar nada.
 */
export interface Budget {
	readonly used: number;
	readonly total: number;
	/** ¿Se pasó? Un fit que se pasa no se puede volar. */
	readonly over: boolean;
	/** Lo que queda. Negativo si se pasó, que es lo que hay que informar. */
	readonly free: number;
	/** Cuánto se ocupó, para dibujar la barra. Nunca pasa de 100. */
	readonly percent: number;
}

/** Arma un presupuesto con todo lo derivado ya resuelto. */
export function budget(used: number, total: number): Budget {
	const percent =
		total <= 0 ? (used > 0 ? 100 : 0) : Math.min(100, roundHalfEven((used * 100) / total));
	return { used, total, over: used > total, free: total - used, percent };
}

/**
 * La hoja de rendimiento de una configuración.
 *
 * Es lo que la pantalla dibuja y lo que el motor de acciones consulta.
 */
export interface Readout {
	readonly hull: Hull;

	// Presupuestos
	readonly power: Budget;
	readonly computing: Budget;

	// Movimiento
	readonly mass: number;
	readonly speed: number;
	/** En décimas de año luz. */
	readonly jumpRange: number;
	readonly fuel: number;
	readonly jumps: number;

	// Capacidad e información
	readonly cargo: number;
	readonly sensorRange: number;
	readonly signature: number;

	// Supervivencia
	readonly shield: number;
	readonly armor: number;
	readonly structure: number;
	readonly effectiveHp: Readonly<Record<DamageType, number>>;
	readonly weakSpot: DamageType;

	// Ofensiva, en décimas de daño por segundo
	readonly dps: Readonly<Record<DamageType, number>>;
	readonly totalDps: number;

	// Trabajo
	readonly miningPerHour: number;

	// Acumulador
	readonly capacitor: number;
	readonly rechargePerHour: number;
	readonly drainPerHour: number;
	readonly stable: boolean;

	readonly problems: readonly string[];
	/** ¿Se puede volar? Cualquier problema la deja en tierra. */
	readonly flyable: boolean;
}

/** Una ranura sin nada montado. */
function isEmpty(module: ShipModule): boolean {
	return module.code === '';
}

/**
 * Cuánto mejora esa magnitud, en porcentaje, sumando habilidad y casco.
 *
 * **Los bonos se suman, no se multiplican**, como fija ACTIONS.md: es más fácil
 * de explicar, más fácil de balancear, y evita que apilar seis fuentes chicas
 * rompa el juego.
 */
export function bonusPercent(target: BonusTarget, hull: Hull, skills: SkillLevels): number {
	let total = 0;

	const source = SKILL_BONUSES[target];
	if (source) total += (skills[source.skill] ?? 0) * source.percentPerLevel;

	// El bono de rol del casco, que escala con su propia habilidad.
	if (hull.bonus.target === target) {
		total += (skills[hull.bonus.skill] ?? 0) * hull.bonus.percentPerLevel;
	}

	return total;
}

/** Aplica un porcentaje entero a un valor entero. */
function withBonus(value: number, percent: number): number {
	return roundHalfEven((value * (100 + percent)) / 100);
}

/**
 * La configuración con la que sale una nave del astillero.
 *
 * Los internos esenciales vienen puestos —sin propulsores no se mueve— con lo
 * más modesto que entre; el resto de las ranuras van vacías. Es a propósito: la
 * nave inicial tiene que ser un punto de partida, no un regalo.
 */
export function defaultFit(hull: Hull): readonly ShipModule[] {
	return hull.slots.map((slot) => {
		if (slot.kind !== 'core') return EMPTY;

		const options = modulesForSlot(slot.kind, slot.size, slot.core);
		if (options.length === 0) {
			throw new Error(
				`${hull.name} pide un ${slot.core} de clase ${slot.size} y no hay ninguno en el catálogo`
			);
		}
		// El más grande que entre, en su calificación más modesta: una nave de
		// astillero viene completa, no viene buena.
		const largest = Math.max(...options.map((module) => module.size));
		const sized = options.filter((module) => module.size === largest);
		return sized.reduce((best, module) => (module.rating > best.rating ? module : best));
	});
}

/** Reconstruye una configuración desde los códigos guardados por ranura. */
export function fitFromCodes(hull: Hull, codes: readonly string[]): readonly ShipModule[] {
	if (codes.length !== hull.slots.length) {
		throw new Error(`${hull.name} tiene ${hull.slots.length} ranuras y llegaron ${codes.length}`);
	}
	return codes.map((code) => (code ? getModule(code) : EMPTY));
}

/** El módulo montado en ese sistema esencial, o la ranura vacía. */
function findCore(modules: readonly ShipModule[], core: CoreSystem): ShipModule {
	return modules.find((module) => module.core === core) ?? EMPTY;
}

/**
 * Calcula la hoja de rendimiento completa de una configuración.
 *
 * Recorre las ranuras una sola vez sumando campo a campo: la calculadora no
 * conoce ningún módulo en particular, y por eso agregar uno nuevo al catálogo no
 * obliga a tocarla.
 */
export function buildReadout(
	hull: Hull,
	modules: readonly ShipModule[],
	skills: SkillLevels = {}
): Readout {
	if (modules.length !== hull.slots.length) {
		throw new Error(`${hull.name} tiene ${hull.slots.length} ranuras y llegaron ${modules.length}`);
	}

	// --- Una sola pasada, sumando lo que aporta cada módulo ---
	let mass = hull.mass;
	let powerUsed = 0;
	let computingUsed = 0;
	let cargo = hull.cargo;
	let shield = 0;
	let armor = hull.armor;
	let fuel = hull.fuel;
	let sensorRange = hull.sensorRange;
	let signature = hull.signature;
	let miningPerHour = 0;
	let drainPerHour = 0;
	const damage: Record<DamageType, number> = { kinetic: 0, ionic: 0, thermal: 0 };

	for (const module of modules) {
		mass += module.mass;
		powerUsed += module.powerDraw;
		computingUsed += module.computingDraw;
		cargo += module.cargo;
		shield += module.shield;
		armor += module.armor;
		fuel += module.fuel;
		sensorRange += module.sensorRange;
		signature += module.signature;

		if (module.cycleSeconds > 0) {
			const cycles = SECONDS_PER_HOUR / module.cycleSeconds;
			miningPerHour += roundHalfEven(module.miningYield * cycles);
			drainPerHour += roundHalfEven(module.activationCost * cycles);
			// Décimas de daño por segundo, que es como se compara un arma.
			damage.kinetic += roundHalfEven((module.kinetic * TENTHS) / module.cycleSeconds);
			damage.ionic += roundHalfEven((module.ionic * TENTHS) / module.cycleSeconds);
			damage.thermal += roundHalfEven((module.thermal * TENTHS) / module.cycleSeconds);
		}
	}

	const plant = findCore(modules, 'power_plant');
	const thrusters = findCore(modules, 'thrusters');
	const jumpDrive = findCore(modules, 'jump_drive');
	const distributor = findCore(modules, 'distributor');

	// --- Bonos de habilidad y de casco ---
	cargo = Math.max(0, withBonus(cargo, bonusPercent('cargo', hull, skills)));
	shield = withBonus(shield, bonusPercent('shield', hull, skills));
	armor = withBonus(armor, bonusPercent('armor', hull, skills));
	sensorRange = withBonus(sensorRange, bonusPercent('sensor_range', hull, skills));
	miningPerHour = withBonus(miningPerHour, bonusPercent('mining_yield', hull, skills));

	const damageBonus = bonusPercent('damage', hull, skills);
	for (const type of DAMAGE_TYPES) damage[type] = withBonus(damage[type], damageBonus);

	// --- Lo que se divide por la masa ---
	//
	// Velocidad y alcance salen los dos de dividir por la masa total, y no es
	// casualidad: es lo que hace que **toda** decisión de equipamiento cueste
	// tiempo. Un módulo que pesa te frena aunque no consuma nada.
	const speed = withBonus(
		mass ? floorDiv(thrusters.thrust, mass) : 0,
		bonusPercent('speed', hull, skills)
	);
	const jumpRange = withBonus(
		mass ? floorDiv(jumpDrive.jumpPower * TENTHS, mass) : 0,
		bonusPercent('jump_range', hull, skills)
	);

	// --- Acumulador ---
	const recharge = withBonus(
		distributor.capacitorRecharge,
		bonusPercent('capacitor_recharge', hull, skills)
	);
	const rechargePerHour = recharge * SECONDS_PER_HOUR;
	const stable = drainPerHour <= rechargePerHour;

	// Sin acumulador para sostenerlo, el trabajo rinde en proporción a lo que la
	// recarga alcanza a pagar. Es la traducción honesta de la gestión en vivo de
	// EVE a un juego que se resuelve de una sola cuenta.
	if (!stable && drainPerHour > 0) {
		miningPerHour = floorDiv(miningPerHour * rechargePerHour, drainPerHour);
	}

	// --- Presupuestos y problemas ---
	const power = budget(powerUsed, plant.powerOutput);
	const computing = budget(computingUsed, hull.computing);

	const problems: string[] = [];
	if (power.over) problems.push(`La planta no alcanza: faltan ${-power.free} MW`);
	if (computing.over) problems.push(`Falta cómputo: ${-computing.free} u`);
	hull.slots.forEach((slot: SlotSpec, index: number) => {
		const module = modules[index];
		if (isEmpty(module) && slot.kind === 'core') {
			problems.push(`Falta un interno esencial: ${slot.core}`);
		} else if (!isEmpty(module) && module.size > slot.size) {
			problems.push(`${module.name} es de clase ${module.size} y la ranura es de ${slot.size}`);
		}
	});

	const structure = hull.structure;
	const effectiveHp = {
		kinetic: totalEffectiveHp(shield, armor, structure, 'kinetic'),
		ionic: totalEffectiveHp(shield, armor, structure, 'ionic'),
		thermal: totalEffectiveHp(shield, armor, structure, 'thermal')
	};

	return {
		hull,
		power,
		computing,
		mass,
		speed,
		jumpRange,
		fuel,
		// Cuántos saltos podés dar no es un atributo: es combustible sobre consumo,
		// y el consumo de un salto es proporcional a la masa.
		jumps: floorDiv(fuel, Math.max(1, floorDiv(mass, MASS_PER_FUEL_UNIT))),
		cargo,
		sensorRange,
		signature: Math.max(1, signature),
		shield,
		armor,
		structure,
		effectiveHp,
		weakSpot: weakestAgainst(shield, armor, structure),
		dps: damage,
		totalDps: damage.kinetic + damage.ionic + damage.thermal,
		miningPerHour,
		capacitor: distributor.capacitor,
		rechargePerHour,
		drainPerHour,
		stable,
		problems,
		flyable: problems.length === 0
	};
}

/**
 * Todas las habilidades que tocan a una nave, al máximo.
 *
 * Es el modo "qué compraría entrenar" de la pantalla: comparar la hoja actual
 * con ésta es la forma más directa de explicar la progresión sin un tutorial.
 */
export function maxedSkills(): Record<string, number> {
	const codes = new Set(Object.values(SKILL_BONUSES).map((bonus) => bonus.skill));
	for (const hull of HULLS) codes.add(hull.bonus.skill);
	return Object.fromEntries([...codes].map((code) => [code, MAX_SKILL_LEVEL]));
}
