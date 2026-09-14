/**
 * Las reglas de la extracción.
 *
 * El test que más importa es el del piso: es una promesa de diseño —que el
 * tiempo nunca llegue a cero por muchos bonos que junte nadie— y sin una prueba
 * es una intención escrita en un comentario.
 */

import { describe, expect, it } from 'vitest';
import { getOre } from './items';
import {
	MAX_CYCLES,
	MIN_CYCLE_PERCENT,
	MIN_ORDER_SECONDS,
	cycleSeconds,
	planMining,
	restored,
	yieldPerCycleTenths
} from './mining';

/** La Pioner de fábrica con su láser: 396 m³/h. */
const PIONER = 396;

describe('el ciclo', () => {
	it('sale de la rareza del mineral y no del piloto', () => {
		// Lo común se desprende rápido; lo escaso hay que trabajarlo.
		expect(cycleSeconds(getOre('ferrous_silicate'))).toBe(60);
		expect(cycleSeconds(getOre('iridium_vein'))).toBe(150);
	});

	it('los bonos lo acortan', () => {
		expect(cycleSeconds(getOre('ferrous_silicate'), 50)).toBe(40);
	});

	it('**pero nunca por debajo del piso**', () => {
		const silicato = getOre('ferrous_silicate');
		const piso = (silicato.cycleSeconds * MIN_CYCLE_PERCENT) / 100;

		// Un bono absurdo, del orden de lo que juntaría alguien con todo al máximo
		// y el mejor equipo. El techo de eficiencia es parte del balance.
		expect(cycleSeconds(silicato, 100_000)).toBe(piso);
		expect(cycleSeconds(silicato, 10_000)).toBeGreaterThanOrEqual(piso);
	});

	it('no acepta un bono negativo', () => {
		expect(() => cycleSeconds(getOre('ferrous_silicate'), -1)).toThrow(RangeError);
	});
});

describe('lo que sale de un ciclo', () => {
	it('sale de la hoja de rendimiento de la nave', () => {
		// 396 m³/h en un ciclo de referencia de 60 s son 6,6 m³: 66 décimas.
		expect(yieldPerCycleTenths(PIONER)).toBe(66);
	});

	it('una nave sin láser no saca nada', () => {
		expect(yieldPerCycleTenths(0)).toBe(0);
	});
});

describe('la orden', () => {
	const base = {
		oreCode: 'ferrous_silicate',
		miningPerHour: PIONER,
		freeTenths: 2250,
		remainingUnits: 5000
	};

	it('mina hasta llenar la bodega', () => {
		const plan = planMining(base);

		// 225 m³ libres, el silicato ocupa 1 m³ la unidad.
		expect(plan.units).toBe(225);
		expect(plan.blocked).toBe('');
	});

	it('o hasta agotar lo que queda, lo que pase primero', () => {
		const plan = planMining({ ...base, remainingUnits: 40 });

		expect(plan.units).toBe(40);
	});

	it('tarda los ciclos que hagan falta', () => {
		const plan = planMining(base);

		expect(plan.durationSeconds).toBe(plan.cycles * plan.cycleSeconds);
		// Con la Pioner de fábrica, llenar la bodega es un rato largo y no un
		// click: el ritmo del juego es entrar, dar la orden y volver.
		expect(plan.durationSeconds).toBeGreaterThan(20 * 60);
	});

	it('nunca se resuelve en el acto, por poco que saque', () => {
		// Con lugar para una sola unidad. Dar una orden y que ya esté hecha no es
		// jugar, es apretar un botón.
		const plan = planMining({ ...base, freeTenths: 10 });

		expect(plan.units).toBe(1);
		expect(plan.durationSeconds).toBeGreaterThanOrEqual(MIN_ORDER_SECONDS);
	});

	it('no encarga un día entero de trabajo de una sola vez', () => {
		const plan = planMining({ ...base, freeTenths: 10_000_000, remainingUnits: 10_000_000 });

		expect(plan.cycles).toBe(MAX_CYCLES);
	});

	it('dice por qué no se puede, y no devuelve una orden vacía sin motivo', () => {
		expect(planMining({ ...base, miningPerHour: 0 }).blocked).toMatch(/extraer/);
		expect(planMining({ ...base, remainingUnits: 0 }).blocked).toMatch(/agotado/);
		expect(planMining({ ...base, freeTenths: 0 }).blocked).toMatch(/bodega/);
	});

	it('un mineral más duro tarda más por la misma bodega', () => {
		const comun = planMining(base);
		const escaso = planMining({ ...base, oreCode: 'iridium_vein' });

		// El láser saca lo mismo de una roca blanda que de una dura, pero sobre la
		// dura tarda más. Ir a buscar lo bueno tiene que doler.
		expect(escaso.durationSeconds).toBeGreaterThan(comun.durationSeconds);
	});
});

describe('la recuperación de un cinturón', () => {
	it('suma lo que corresponde al tiempo transcurrido', () => {
		expect(
			restored({ remaining: 100, capacity: 1000, regenPerHour: 60, secondsElapsed: 3600 })
		).toBe(160);
	});

	it('no pasa de su tope', () => {
		expect(
			restored({ remaining: 990, capacity: 1000, regenPerHour: 600, secondsElapsed: 3600 })
		).toBe(1000);
	});

	it('es idempotente: llamarla dos veces sin que pase tiempo no cambia nada', () => {
		// Es lo que permite que la recuperación sea perezosa en vez de un proceso
		// de fondo: mirarla no puede regalar mineral.
		const una = restored({ remaining: 100, capacity: 1000, regenPerHour: 60, secondsElapsed: 0 });
		expect(una).toBe(100);
	});

	it('el tiempo no va para atrás', () => {
		expect(() =>
			restored({ remaining: 100, capacity: 1000, regenPerHour: 60, secondsElapsed: -1 })
		).toThrow(RangeError);
	});
});
