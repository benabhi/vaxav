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
	bidPrice,
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
