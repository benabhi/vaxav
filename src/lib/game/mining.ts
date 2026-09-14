/**
 * Minar: cuánto tarda, cuánto sale, y cuánto queda en el cinturón.
 *
 * Reglas puras sobre números, sin base de datos, como el resto de `game/`.
 *
 * **La progresión no está en el reloj.** Un minero veterano no extrae diez veces
 * más rápido: llena una bodega diez veces más grande con mineral que el novato no
 * puede tocar. Por eso los bonos empujan sobre todo el **rendimiento por ciclo**
 * y la **capacidad**, y sobre el tiempo empujan poco y con tope —ningún bono baja
 * un ciclo por debajo de una fracción fija de su base—. Sin ese tope, el techo de
 * eficiencia terminaría siendo "cero segundos", que es donde un juego de esperar
 * deja de ser un juego.
 *
 * La base de cada ciclo sale de la **rareza del mineral** y no del piloto, que es
 * lo que hace que lo difícil siga siendo difícil por mucho que uno mejore.
 *
 * Corresponde a docs/systems/ACTIONS.md y docs/systems/SKILLS.md.
 */

import { floorDiv, truncate } from './math';
import { getOre, type Ore } from './items';
import type { SkillFamily } from './skills';

/** La rama a la que minar le deposita la experiencia. */
export const MINING_FAMILY: SkillFamily = 'extraction';

/**
 * Lo mínimo que puede durar un ciclo, como porcentaje de su base.
 *
 * Es el techo de eficiencia, y es parte del balance y no un efecto colateral:
 * por muchos bonos que junte nadie extrae en cero segundos.
 */
export const MIN_CYCLE_PERCENT = 40;

/**
 * Lo mínimo que puede durar una orden de extracción, en segundos.
 *
 * Con la bodega casi llena, una orden que saca tres unidades no puede resolverse
 * en el acto: dar una orden y que ya esté hecha no es jugar, es un botón.
 */
export const MIN_ORDER_SECONDS = 60;

/**
 * Un tope de ciclos por orden, para que una bodega enorme no encargue un día
 * entero de trabajo de una sola vez.
 *
 * Es una red de contención, no un número de balance: la bodega llena es lo que
 * normalmente corta la orden mucho antes.
 */
export const MAX_CYCLES = 240;

/** Lo que rinde y lo que cuesta una orden de extracción, ya resuelto. */
export interface MiningPlan {
	readonly ore: string;
	/** Cuántos ciclos se van a hacer. Cero si no hay nada que sacar. */
	readonly cycles: number;
	readonly cycleSeconds: number;
	readonly durationSeconds: number;
	/** Unidades que va a traer. */
	readonly units: number;
	/** Por qué no se puede minar, o cadena vacía si se puede. */
	readonly blocked: string;
}

/**
 * Lo que tarda un ciclo sobre un mineral, con los bonos ya aplicados.
 *
 * El bono llega como porcentaje entero y acorta el ciclo, pero nunca por debajo
 * de `MIN_CYCLE_PERCENT` de la base.
 */
export function cycleSeconds(ore: Ore, bonusPercent = 0): number {
	if (bonusPercent < 0) throw new RangeError('Un bono no puede ser negativo');

	const acortado = floorDiv(ore.cycleSeconds * 100, 100 + bonusPercent);
	const piso = floorDiv(ore.cycleSeconds * MIN_CYCLE_PERCENT, 100);
	return Math.max(1, piso, acortado);
}

/**
 * El ciclo contra el que está calibrada la hoja de rendimiento de la nave.
 *
 * Los láseres del catálogo trabajan en ciclos de un minuto, así que
 * `miningPerHour` es lo que sacan en sesenta de esos ciclos.
 */
export const REFERENCE_CYCLE_SECONDS = 60;

/**
 * Lo que sale de **un** ciclo, en décimas de m³.
 *
 * `miningPerHour` es lo que dice la hoja de rendimiento de la nave, que ya trae
 * adentro los láseres montados, el bono de Minería y el del casco. Que salga de
 * ahí y no de una cuenta propia es lo que garantiza que la orden rinda
 * exactamente lo que la ficha promete.
 *
 * **No depende de cuánto dure el ciclo**, y ahí está toda la gracia de la dureza:
 * el láser saca lo mismo de una roca blanda que de una dura, pero sobre la dura
 * tarda más en sacarlo. Si el rendimiento escalara con la duración, un mineral
 * difícil rendiría exactamente igual por hora que uno fácil y la dureza no
 * significaría nada.
 */
export function yieldPerCycleTenths(miningPerHour: number): number {
	if (miningPerHour < 0) throw new RangeError('El rendimiento no puede ser negativo');
	// Se multiplica antes de dividir: al revés se perderían décimas que no vuelven.
	return truncate((miningPerHour * REFERENCE_CYCLE_SECONDS * 10) / 3600);
}

/**
 * La orden completa: cuántos ciclos, cuánto tarda y cuánto trae.
 *
 * Se mina **hasta llenar la bodega o agotar lo que queda**, lo que pase primero.
 * Es la unidad natural: nadie sale a un cinturón a sacar media bodega, y así la
 * decisión que importa —cuánta bodega llevo— es la que fija cuánto dura el viaje.
 */
export function planMining(options: {
	oreCode: string;
	/** Lo que rinde la nave por hora, de la hoja de rendimiento. */
	miningPerHour: number;
	/** Lo que queda libre en la bodega, en décimas de m³. */
	freeTenths: number;
	/** Unidades que quedan en el cinturón. */
	remainingUnits: number;
	/** Bono que acorta el ciclo, en porcentaje entero. */
	speedBonusPercent?: number;
}): MiningPlan {
	const ore = getOre(options.oreCode);
	const seconds = cycleSeconds(ore, options.speedBonusPercent ?? 0);
	const porCiclo = yieldPerCycleTenths(options.miningPerHour);

	const vacio: MiningPlan = {
		ore: ore.code,
		cycles: 0,
		cycleSeconds: seconds,
		durationSeconds: 0,
		units: 0,
		blocked: ''
	};

	if (porCiclo <= 0) {
		return { ...vacio, blocked: 'Tu nave no tiene con qué extraer.' };
	}
	if (options.remainingUnits <= 0) {
		return { ...vacio, blocked: 'Este cinturón está agotado. Dale tiempo o probá otro.' };
	}

	// Cuántas unidades entran en lo que queda de bodega, y cuántas hay para sacar.
	const cabenEnBodega = floorDiv(options.freeTenths, ore.volumeTenths);
	const objetivo = Math.min(cabenEnBodega, options.remainingUnits);
	if (objetivo <= 0) {
		return { ...vacio, blocked: 'No te entra nada más en la bodega.' };
	}

	// Los ciclos se redondean hacia arriba y después se recorta el botín al
	// objetivo: es mejor que el último ciclo salga corto a que la orden termine
	// dejando lugar sin llenar.
	const porCicloUnidades = Math.max(1, floorDiv(porCiclo, ore.volumeTenths));
	const cycles = Math.min(MAX_CYCLES, Math.ceil(objetivo / porCicloUnidades));

	return {
		ore: ore.code,
		cycles,
		cycleSeconds: seconds,
		durationSeconds: Math.max(MIN_ORDER_SECONDS, cycles * seconds),
		units: Math.min(objetivo, cycles * porCicloUnidades),
		blocked: ''
	};
}

/**
 * Cuánto se recuperó un depósito desde la última vez que se lo miró.
 *
 * **Perezoso, como las acciones**: un cinturón sólo le importa a alguien cuando
 * alguien lo mira o lo trabaja, así que no hace falta ningún proceso de fondo
 * recorriendo el universo. La cuenta es idempotente —depende del tiempo
 * transcurrido y no de cuántas veces se la llame— y el día que exista un
 * planificador para los cinturones que nadie visita, va a llamar a esta misma
 * función. Dos matemáticas para lo mismo es una que se desfasa.
 */
export function restored(options: {
	remaining: number;
	capacity: number;
	regenPerHour: number;
	secondsElapsed: number;
}): number {
	if (options.secondsElapsed < 0) throw new RangeError('El tiempo no va para atrás');

	const recuperado = floorDiv(options.secondsElapsed * options.regenPerHour, 3600);
	return Math.min(options.capacity, options.remaining + recuperado);
}
