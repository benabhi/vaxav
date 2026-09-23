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
import { HULLS, type BonusTarget, type Hull, type SlotSpec } from './hulls';
import { floorDiv, roundHalfEven } from './math';
import { EMPTY, type ShipModule, getModule } from './modules';
import { getSkill, unmetFrom, type Requirement } from './skills';
import { agility, alignSeconds } from './warp';

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
	/**
	 * **Dormida hasta el combate**, con el empuje del que sale.
	 *
	 * Movía el reloj de los viajes dentro del sistema hasta que ese reloj pasó a
	 * ser alineación más warp, y ninguna de las dos cosas mira la velocidad
	 * sub-warp. Sigue en la tabla porque maniobrar cerca de otra nave —acercarse,
	 * abrir distancia, orbitar— es todo sub-warp, y ése es el verbo que la
	 * despierta.
	 *
	 * Lo que Navegación gobierna mientras tanto es **el acceso**: es la llave de
	 * los dos optimizadores de warp, que sí acortan un viaje.
	 */
	speed: { skill: 'navigation', percentPerLevel: 3 },
	/**
	 * Maniobra, que **estrena verbo con esta tabla**: hasta acá prometía «tiempo
	 * de alineación antes de salir» y no movía nada, porque no había alineación.
	 *
	 * El cinco por nivel es **el número por omisión de SKILLS.md**, que es el que
	 * vale mientras el balance no le escriba uno propio. Al 5 son un 25 % de
	 * agilidad, que como la agilidad se divide se siente como un 20 % menos de
	 * alineación: en la carguera son tres segundos menos en cada salida.
	 *
	 * **Es lo único que el piloto puede mejorar del viaje**, y es la mitad fija:
	 * la parte que escala con la distancia es de la nave y ninguna habilidad la
	 * toca. Es la división de EVE y es la que hace que el casco siga importando
	 * con todo entrenado.
	 */
	agility: { skill: 'maneuvering', percentPerLevel: 5 },
	jump_range: { skill: 'astrogation', percentPerLevel: 4 },
	mining_yield: { skill: 'mining', percentPerLevel: 5 },
	damage: { skill: 'gunnery', percentPerLevel: 4 },
	shield: { skill: 'shields', percentPerLevel: 5 },
	armor: { skill: 'armor', percentPerLevel: 5 },
	sensor_range: { skill: 'scanning', percentPerLevel: 6 },
	capacitor_recharge: { skill: 'power_management', percentPerLevel: 4 },
	/**
	 * **Dormida**: cruzar una puerta no consume nada, así que hoy este porcentaje
	 * no le descuenta gasto a ningún verbo. Sigue en la tabla porque el consumo por
	 * salto sin puerta —el de las capitales— es lo que la habilidad gobierna, y
	 * porque sacarla y volver a ponerla es la misma fila dos veces.
	 *
	 * El cinco por nivel es **el número por omisión de SKILLS.md**, que es el que
	 * vale mientras el balance no le escriba uno propio: los otros ocho se movieron
	 * de ahí a propósito y éste no tiene ninguna razón documentada para moverse.
	 * Al 5 son un 25 % arriba, que en el consumo es un 20 % menos de gasto.
	 */
	fuel_efficiency: { skill: 'fuel_efficiency', percentPerLevel: 5 }
};

/** Nivel máximo de una habilidad, para el modo "con todo entrenado". */
export const MAX_SKILL_LEVEL = 5;

/**
 * Cuántas décimas tiene una unidad. Las magnitudes que necesitan fracción se
 * guardan multiplicadas por esto.
 */

export const SECONDS_PER_HOUR = 3600;

/**
 * Cuántas toneladas de nave gasta una unidad de combustible por salto.
 *
 * Se vuelve a exportar desde acá porque el equipamiento la usaba primero, pero
 * **vive con el salto**, que es de donde sale la regla.
 */
export { MASS_PER_FUEL_UNIT, TENTHS } from './jumps';
import { TENTHS, jumpsWithFuel } from './jumps';

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
	/**
	 * El de los refuerzos, y el único que no se recupera.
	 *
	 * Los otros tres se deshacen desmontando; un refuerzo sacado se destruye, así
	 * que gastar calibración es definitivo.
	 */
	readonly calibration: Budget;

	// Movimiento
	readonly mass: number;
	/**
	 * Velocidad sub-warp, en unidades por hora.
	 *
	 * **Dormida hasta el combate**: ningún viaje la mira desde que la duración es
	 * alineación más warp. Se sigue calculando porque es la velocidad de maniobrar
	 * cerca de otra nave, que es el verbo que la despierta.
	 */
	readonly speed: number;
	/**
	 * Velocidad de warp, en décimas de unidad de distancia por segundo.
	 *
	 * La del casco más lo que sumen los optimizadores. Es la que decide el tramo
	 * largo de un viaje, y **ninguna habilidad la mueve**.
	 */
	readonly warpSpeed: number;
	/**
	 * Agilidad: masa por inercia, ya con Maniobra descontada. **Menos es mejor.**
	 *
	 * Redondeada, y **sólo sirve para mostrarla**: la alineación de acá al lado se
	 * calculó con la exacta, para no redondear dos veces la misma cuenta.
	 *
	 * Viaja en la hoja además de la alineación que sale de ella porque es el
	 * número que explica *por qué* esta nave sale tarde: la alineación dice cuánto
	 * y la agilidad dice de dónde, que es lo que se mira antes de sacarle una
	 * placa de blindaje.
	 */
	readonly agility: number;
	/** Cuánto tarda en alinearse antes de entrar en warp, en segundos. */
	readonly alignSeconds: number;
	/** En décimas de año luz. */
	readonly jumpRange: number;
	readonly fuel: number;
	readonly jumps: number;
	/**
	 * Cuánto le descuenta al consumo de un salto, en puntos de porcentaje.
	 *
	 * Viaja en la hoja y no se recalcula al lado de cada cuenta que lo use. Hoy no
	 * hay ninguna —nada quema combustible desde que cruzar es gratis—, y el día que
	 * lo gaste el motor de salto de las capitales, el número que muestre la ficha y
	 * el que use el salto tienen que ser el mismo.
	 */
	readonly fuelEfficiency: number;

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
 * Cómo se nombra un requisito dentro de un problema: «Navegación II».
 *
 * Se arma acá con el catálogo y el romano en vez de tirar del módulo de formato,
 * porque las reglas no pueden depender de la presentación: `format.ts` importa de
 * `game/`, y al revés sería un círculo.
 */
function label(requirement: Requirement): string {
	return `${getSkill(requirement.skill).name} ${ROMAN[requirement.level] ?? requirement.level}`;
}

/** Los cinco niveles, en romanos. Son cinco: una tabla es más clara que un algoritmo. */
const ROMAN: readonly string[] = ['', 'I', 'II', 'III', 'IV', 'V'];

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

	// El bono de rol del casco, que escala con su propia habilidad. **Puede no
	// haber**: la lanzadera inicial no tiene ninguno a propósito, para no empujar
	// al piloto hacia una especialidad antes de que la elija.
	if (hull.bonus && hull.bonus.target === target) {
		total += (skills[hull.bonus.skill] ?? 0) * hull.bonus.percentPerLevel;
	}

	return total;
}

/** Aplica un porcentaje entero a un valor entero. */
function withBonus(value: number, percent: number): number {
	return roundHalfEven((value * (100 + percent)) / 100);
}

/**
 * La configuración con la que sale una nave del astillero: **vacía**.
 *
 * Antes venía con los siete internos esenciales puestos, porque sin propulsores
 * no se movía. Ahora el casco los trae de fábrica —son atributos suyos— así que
 * una nave de astillero vuela pelada, y todas sus ranuras son del piloto desde el
 * primer minuto. Lo que el oficio le agregue encima lo pone el kit de la
 * profesión, que es otra cosa y se ve en el registro.
 */
export function defaultFit(hull: Hull): readonly ShipModule[] {
	return hull.slots.map(() => EMPTY);
}

/**
 * Pone un módulo en la primera ranura libre donde entre.
 *
 * Existe para el equipo con el que arranca una profesión: el oficio dice **qué**
 * trae, no en qué ranura, porque la ranura depende del casco y un día el minero
 * va a salir en otra nave. Devuelve `null` si no entra en ninguna, que es
 * información —el kit no encaja en ese casco— y no un error que haya que atrapar.
 *
 * La primera libre y no la mejor: elegir la mejor sería una decisión de
 * equipamiento, y ésa es del jugador.
 */
export function placeInFreeSlot(
	hull: Hull,
	codes: readonly string[],
	module: ShipModule
): string[] | null {
	const index = hull.slots.findIndex(
		(slot, i) => codes[i] === '' && slot.kind === module.kind && slot.size >= module.size
	);
	if (index < 0) return null;

	const puesto = [...codes];
	puesto[index] = module.code;
	return puesto;
}

/** Reconstruye una configuración desde los códigos guardados por ranura. */
export function fitFromCodes(hull: Hull, codes: readonly string[]): readonly ShipModule[] {
	if (codes.length !== hull.slots.length) {
		throw new Error(`${hull.name} tiene ${hull.slots.length} ranuras y llegaron ${codes.length}`);
	}
	return codes.map((code) => (code ? getModule(code) : EMPTY));
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
	let calibrationUsed = 0;
	// Lo que el casco trae de fábrica, que antes venía de un interno esencial. Los
	// módulos suman encima, igual que con la bodega y el blindaje.
	let powerOutput = hull.power;
	let thrust = hull.thrust;
	let jumpPower = hull.jumpPower;
	let warpSpeed = hull.warpSpeed;
	let capacitor = hull.capacitor;
	let capacitorRecharge = hull.capacitorRecharge;
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
		calibrationUsed += module.calibrationDraw;
		cargo += module.cargo;
		shield += module.shield;
		armor += module.armor;
		fuel += module.fuel;
		sensorRange += module.sensorRange;
		signature += module.signature;
		powerOutput += module.powerOutput;
		thrust += module.thrust;
		jumpPower += module.jumpPower;
		warpSpeed += module.warpSpeed;
		capacitor += module.capacitor;
		capacitorRecharge += module.capacitorRecharge;

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
	const speed = withBonus(mass ? floorDiv(thrust, mass) : 0, bonusPercent('speed', hull, skills));
	const jumpRange = withBonus(
		mass ? floorDiv(jumpPower * TENTHS, mass) : 0,
		bonusPercent('jump_range', hull, skills)
	);

	// --- Lo que se paga al salir ---
	//
	// La masa entra otra vez, y por otra puerta: acá decide **cuánto tarda en
	// arrancar** en vez de cuánto tarda en llegar. Son dos castigos distintos de
	// la misma decisión, y el de la alineación lo paga igual el viaje más corto
	// del sistema, que es lo que hace que un salto de una luna a su planeta ya no
	// sea gratis.
	//
	// Maniobra **divide** la agilidad, que es la forma de que mejorarla sea bajar
	// el número. La velocidad de warp no lleva bono ninguno a propósito: es de la
	// nave, como en EVE.
	// **Exacta**, que es como la devuelve `agility`: la alineación redondea una
	// sola vez y lo hace al final. Lo que se guarda en la hoja para mostrar es la
	// redondeada, unas líneas más abajo.
	const shipAgility = agility(mass, hull.inertia, bonusPercent('agility', hull, skills));

	// --- Acumulador ---
	// No multiplica nada acá: es el porcentaje que `jumps.ts` divide al calcular el
	// gasto. Se resuelve igual que los demás para que Eficiencia de combustible sea
	// una fila de la tabla de bonos y no un caso aparte.
	const fuelEfficiency = bonusPercent('fuel_efficiency', hull, skills);

	const recharge = withBonus(capacitorRecharge, bonusPercent('capacitor_recharge', hull, skills));
	const rechargePerHour = recharge * SECONDS_PER_HOUR;
	const stable = drainPerHour <= rechargePerHour;

	// Sin acumulador para sostenerlo, el trabajo rinde en proporción a lo que la
	// recarga alcanza a pagar. Es la traducción honesta de la gestión en vivo de
	// EVE a un juego que se resuelve de una sola cuenta.
	if (!stable && drainPerHour > 0) {
		miningPerHour = floorDiv(miningPerHour * rechargePerHour, drainPerHour);
	}

	// --- Presupuestos y problemas ---
	const power = budget(powerUsed, powerOutput);
	const computing = budget(computingUsed, hull.computing);
	const calibration = budget(calibrationUsed, hull.calibration);

	const problems: string[] = [];
	if (power.over) problems.push(`La planta no alcanza: faltan ${-power.free} MW`);
	if (computing.over) problems.push(`Falta cómputo: ${-computing.free} u`);
	if (calibration.over) problems.push(`Falta calibración: ${-calibration.free} u`);

	// **Los requisitos se hacen cumplir acá, y acá es un solo lugar.** Volar exige
	// que no haya problemas, y todas las acciones ya consultan eso antes de
	// empezar: con esta docena de líneas, saber pilotar el casco y saber usar cada
	// módulo pasan a decidir si se puede viajar, minar o escanear, sin tocar una
	// línea de ninguna de las tres.
	//
	// El mensaje dice **qué falta**, no "no podés": un piloto que lee "te falta
	// Navegación II" sabe adónde ir; uno que lee "no cumplís los requisitos" sólo
	// sabe que algo está mal.
	for (const missing of unmetFrom(hull.requirements, skills)) {
		problems.push(`No sabés volar un ${hull.name}: te falta ${label(missing)}`);
	}

	hull.slots.forEach((slot: SlotSpec, index: number) => {
		const module = modules[index];
		if (isEmpty(module)) return;

		if (module.kind !== slot.kind) {
			problems.push(`${module.name} no va en una ranura de ${slot.kind}`);
		}

		if (module.size > slot.size) {
			problems.push(`${module.name} es de clase ${module.size} y la ranura es de ${slot.size}`);
		}
		for (const missing of unmetFrom(module.requirements, skills)) {
			problems.push(`No sabés usar ${module.name}: te falta ${label(missing)}`);
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
		calibration,
		mass,
		speed,
		warpSpeed,
		// Redondeada **sólo para mostrarla**: la que decide los segundos es la
		// exacta, y pasa entera a `alignSeconds`.
		agility: roundHalfEven(shipAgility),
		alignSeconds: alignSeconds(shipAgility),
		jumpRange,
		fuel,
		// Cuántos saltos podés dar no es un atributo: es combustible sobre consumo,
		// y el consumo de un salto es proporcional a la masa. Sale de la misma
		// función que usaría el salto de verdad, para que la hoja y el salto no
		// puedan decir cosas distintas.
		// **Hoy no cuenta ningún salto y no lo lee nadie**: cruzar una puerta es
		// gratis y la ficha dejó de mostrar la autonomía. Se sigue calculando porque
		// habla del motor de salto de las capitales, que todavía no existe.
		jumps: jumpsWithFuel(fuel, mass, fuelEfficiency),
		fuelEfficiency,
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
		capacitor,
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
	// El casco sin bono de rol no aporta ninguna habilidad a la lista, que es
	// exactamente lo que significa no tenerlo.
	for (const hull of HULLS) if (hull.bonus) codes.add(hull.bonus.skill);
	return Object.fromEntries([...codes].map((code) => [code, MAX_SKILL_LEVEL]));
}
