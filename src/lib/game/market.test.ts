/**
 * Las reglas del mostrador.
 *
 * El test que más importa es el del piso de la horquilla: es una promesa de
 * diseño —que la estación siempre se quede con su parte, por mucho que el piloto
 * mejore— y sin una prueba es una intención escrita en un comentario.
 */

import { describe, expect, it } from 'vitest';
import { MAX_SKILL_LEVEL } from './fitting';
import { getItem } from './items';
import {
	BASE_SPREAD_PERCENT,
	MIN_SPREAD_PERCENT,
	askPrice,
	askTotal,
	bidPrice,
	bidTotal,
	marketServices,
	spreadFor
} from './market';

describe('la horquilla', () => {
	it('parte del margen base cuando nada la mejora', () => {
		const spread = spreadFor({ itemKind: 'ore', corporation: null, hagglingLevel: 0 });

		expect(spread.percent).toBe(BASE_SPREAD_PERCENT);
		expect(spread.atFloor).toBe(false);
	});

	it('se angosta con el rubro de la corporación', () => {
		const minera = spreadFor({ itemKind: 'ore', corporation: 'mining', hagglingLevel: 0 });
		const comercial = spreadFor({ itemKind: 'ore', corporation: 'trade', hagglingLevel: 0 });

		// Una minera vive de comprar mineral: paga mejor que una casa comercial.
		expect(minera.percent).toBeLessThan(comercial.percent);
		expect(minera.corporationEdge).toBe(6);
	});

	it('mide cada rubro contra lo que comercia y no en general', () => {
		const mineral = spreadFor({ itemKind: 'ore', corporation: 'industry', hagglingLevel: 0 });
		const modulo = spreadFor({ itemKind: 'module', corporation: 'industry', hagglingLevel: 0 });

		// La industrial fabrica módulos, no compra piedras.
		expect(modulo.percent).toBeLessThan(mineral.percent);
	});

	it('se angosta con Regateo', () => {
		const novato = spreadFor({ itemKind: 'ore', corporation: null, hagglingLevel: 0 });
		const experto = spreadFor({ itemKind: 'ore', corporation: null, hagglingLevel: 3 });

		expect(experto.percent).toBe(novato.percent - 6);
		expect(experto.haggling).toBe(6);
	});

	it('explica de dónde salió cada punto', () => {
		const spread = spreadFor({ itemKind: 'ore', corporation: 'mining', hagglingLevel: 2 });

		// La pantalla tiene que poder decir "20 base, −6 por minera, −4 por Regateo".
		expect(spread.base - spread.corporationEdge - spread.haggling).toBe(spread.percent);
	});

	it('nunca baja del piso, ni con todo a favor', () => {
		const spread = spreadFor({
			itemKind: 'ore',
			corporation: 'mining',
			hagglingLevel: MAX_SKILL_LEVEL
		});

		// 20 − 6 − 10 daría 4, y el piso lo sostiene en 5.
		expect(spread.percent).toBe(MIN_SPREAD_PERCENT);
		expect(spread.atFloor).toBe(true);
	});

	it('no da vuelta el signo por mucho que se acumule', () => {
		const spread = spreadFor({ itemKind: 'ore', corporation: 'mining', hagglingLevel: 99 });
		const item = getItem('ferrous_silicate');

		// Lo que la estación cobra sigue siendo más que lo que paga. Si esto se
		// invirtiera, comprar y vender en el acto sería una máquina de imprimir.
		expect(askPrice(item.basePrice, spread.percent)).toBeGreaterThan(
			bidPrice(item.basePrice, spread.percent)
		);
	});
});

describe('los precios', () => {
	it('salen del precio de referencia del ítem', () => {
		// 12 de base con un 20 % de horquilla: paga 10, cobra 14.
		expect(bidPrice(12, 20)).toBe(10);
		expect(askPrice(12, 20)).toBe(14);
	});

	it('son enteros, siempre', () => {
		for (const base of [1, 7, 13, 44, 130, 6400]) {
			for (const percent of [5, 11, 17, 20]) {
				expect(Number.isInteger(bidPrice(base, percent))).toBe(true);
				expect(Number.isInteger(askPrice(base, percent))).toBe(true);
			}
		}
	});

	it('nunca pagan cero por algo que se compra con plata', () => {
		// Una bodega llena de cosas que no se pueden sacar de encima es una bodega
		// rota, así que el mínimo es un crédito.
		expect(bidPrice(1, 99)).toBe(1);
	});
});

describe('el lote', () => {
	it('se redondea una vez y no cien', () => {
		// Cien silicatos a 12 con un 17 % de horquilla: 996, no 100 × 10.
		expect(bidTotal(12, 100, 17)).toBe(996);
		expect(bidPrice(12, 17) * 100).toBe(1000);
	});

	it('deja que el rubro de la corporación se note en el mineral barato', () => {
		// Es el punto de calcular sobre el lote: por unidad, el 17 % del puerto y
		// el 14 % de la minera dan los dos 10 créditos, y elegir dónde descargar
		// dejaría de tener consecuencia justo en el mineral que más se vende.
		expect(bidPrice(12, 17)).toBe(bidPrice(12, 14));
		expect(bidTotal(12, 100, 14)).toBeGreaterThan(bidTotal(12, 100, 17));
	});

	it('nunca paga menos de un crédito por unidad', () => {
		expect(bidTotal(1, 50, 99)).toBe(50);
	});

	it('un lote de una unidad es el precio de vitrina', () => {
		expect(bidTotal(44, 1, 12)).toBe(bidPrice(44, 12));
		expect(askTotal(44, 1, 12)).toBe(askPrice(44, 12));
	});

	it('no acepta cantidades negativas', () => {
		expect(() => bidTotal(12, -1, 20)).toThrow(RangeError);
		expect(() => askTotal(12, -1, 20)).toThrow(RangeError);
	});
});

describe('qué comercia una estación', () => {
	it('deriva de los módulos que tiene instalados', () => {
		const puerto = marketServices(['market', 'refinery', 'outfitting']);

		expect(puerto.buysOre).toBe(true);
		expect(puerto.tradesModules).toBe(true);
	});

	it('una refinería compra mineral aunque no tenga mostrador', () => {
		// Lo necesita para trabajar, y eso le da sentido a una parada que de otro
		// modo sería decorativa.
		const planta = marketServices(['refinery', 'storage']);

		expect(planta.buysOre).toBe(true);
		expect(planta.tradesModules).toBe(false);
	});

	it('sin mercado ni refinería no se comercia nada', () => {
		const puesto = marketServices(['storage', 'contacts']);

		expect(puesto.buysOre).toBe(false);
		expect(puesto.tradesModules).toBe(false);
	});
});
