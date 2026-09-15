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
	MAX_REGIONS_IN_RANGE,
	MIN_BROKER_FEE_PERMILLE,
	MIN_SALES_TAX_PERMILLE,
	MIN_SPREAD_PERCENT,
	brokerFeePermille,
	cut,
	maxOrderRange,
	openOrderLimit,
	ORDER_DURATIONS,
	allowsDuration,
	dealFactorTenths,
	durationsFor,
	maxOrderDays,
	regionsInRange,
	salesTaxPermille,
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
	it('con el módulo Mercado se comercia', () => {
		expect(marketServices(['market', 'refinery', 'outfitting']).trades).toBe(true);
	});

	it('una refinería sin mostrador no alcanza', () => {
		// Sin módulo de Mercado no hay con quién tratar: la estación no aparece en
		// ningún libro y nadie puede publicar ahí.
		expect(marketServices(['refinery', 'storage']).trades).toBe(false);
	});

	it('sin mercado no se comercia nada', () => {
		expect(marketServices(['storage', 'contacts']).trades).toBe(false);
	});
});

describe('hasta dónde llega el mercado', () => {
	it('sin entrenar se ve la región propia, nunca menos', () => {
		// Cero regiones sería un piloto que no puede vender lo que acaba de minar:
		// eso no es progresión, es una pared.
		expect(regionsInRange(0)).toBe(1);
	});

	it('cada nivel suma una región', () => {
		expect(regionsInRange(1)).toBe(2);
		expect(regionsInRange(3)).toBe(4);
	});

	it('nunca pasa del tope de diseño', () => {
		// Que el mercado no sea global es lo que le da geografía económica a la
		// galaxia. Un tope que se pueda saltear no es un tope.
		expect(regionsInRange(99)).toBe(MAX_REGIONS_IN_RANGE);
	});

	it('una orden de compra alcanza una región menos que la vista', () => {
		// Sin entrenar, la orden vale sólo en la estación donde se puso.
		expect(maxOrderRange(0)).toBe(0);
		expect(maxOrderRange(2)).toBe(2);
	});
});

describe('cuántas órdenes se pueden llevar', () => {
	it('arranca en dos y sube con Contabilidad', () => {
		expect(openOrderLimit(0)).toBe(2);
		expect(openOrderLimit(5)).toBe(12);
	});

	it('un nivel negativo no resta órdenes', () => {
		expect(openOrderLimit(-3)).toBe(2);
	});
});

describe('lo que se lleva la casa', () => {
	it('la comisión baja con Regateo hasta un piso', () => {
		expect(brokerFeePermille(0)).toBeGreaterThan(brokerFeePermille(3));
		expect(brokerFeePermille(99)).toBe(MIN_BROKER_FEE_PERMILLE);
	});

	it('el impuesto baja con Contabilidad hasta un piso', () => {
		expect(salesTaxPermille(0)).toBeGreaterThan(salesTaxPermille(3));
		expect(salesTaxPermille(99)).toBe(MIN_SALES_TAX_PERMILLE);
	});

	it('ninguno de los dos llega nunca a cero', () => {
		// Si llegaran, comerciar dejaría de costar y la plata sólo entraría al
		// mundo sin salir nunca.
		expect(brokerFeePermille(99)).toBeGreaterThan(0);
		expect(salesTaxPermille(99)).toBeGreaterThan(0);
	});

	it('cobra al menos un crédito sobre cualquier monto', () => {
		// Sin mínimo, partir una operación en lotes de a uno saldría gratis.
		expect(cut(1, 10)).toBe(1);
		expect(cut(0, 30)).toBe(0);
	});

	it('cobra en enteros', () => {
		for (const monto of [7, 133, 2191, 74880]) {
			for (const permille of [10, 20, 30, 50]) {
				expect(Number.isInteger(cut(monto, permille))).toBe(true);
			}
		}
	});

	it('una comisión del 3 % sobre 10.000 son 300', () => {
		expect(cut(10_000, brokerFeePermille(0))).toBe(300);
	});
});

describe('acordar una orden', () => {
	it('un trato chico casi no enseña nada', () => {
		// Es lo que impide granjear experiencia publicando cien órdenes de un
		// crédito: pagan lo mismo que publicar una, que es casi nada.
		expect(dealFactorTenths(1)).toBe(5);
		expect(dealFactorTenths(1_000)).toBe(5);
	});

	it('un trato grande enseña más, hasta un tope', () => {
		expect(dealFactorTenths(250_000)).toBeGreaterThan(dealFactorTenths(10_000));
		expect(dealFactorTenths(500_000)).toBe(30);
		// Y de ahí no sube: sin tope, una fortuna compraría la rama entera.
		expect(dealFactorTenths(50_000_000)).toBe(30);
	});

	it('crece sin saltos entre los dos extremos', () => {
		let anterior = dealFactorTenths(1_000);
		for (const valor of [10_000, 50_000, 100_000, 300_000, 499_000]) {
			const actual = dealFactorTenths(valor);
			expect(actual).toBeGreaterThanOrEqual(anterior);
			expect(actual).toBeLessThanOrEqual(30);
			anterior = actual;
		}
	});
});

describe('cuánto dura una orden', () => {
	it('sin entrenar se publica por un día', () => {
		expect(durationsFor(0)).toHaveLength(1);
		expect(maxOrderDays(0)).toBe(1);
	});

	it('Contactos va abriendo la escalera', () => {
		expect(maxOrderDays(2)).toBe(7);
		expect(maxOrderDays(5)).toBe(90);
		expect(durationsFor(5)).toHaveLength(ORDER_DURATIONS.length);
	});

	it('no deja elegir una duración que no tiene entrenada', () => {
		expect(allowsDuration(0, 1)).toBe(true);
		expect(allowsDuration(0, 30)).toBe(false);
		expect(allowsDuration(4, 30)).toBe(true);
	});

	it('ninguna orden es eterna', () => {
		// Sin vencimiento, el libro se llena de precios viejos de pilotos que
		// dejaron de jugar, y eso es peor que un libro vacío.
		for (const opcion of ORDER_DURATIONS) expect(opcion.days).toBeGreaterThan(0);
	});
});
