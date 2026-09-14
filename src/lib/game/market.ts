/**
 * A qué precio comercia una estación.
 *
 * Mientras no haya órdenes de jugadores, la estación es la contraparte de todo:
 * **compra a precio fijo y vende a precio fijo**, los dos derivados del precio de
 * referencia que cada ítem declara en `items.ts`. No hay tabla de precios y no
 * hace falta: un precio guardado por estación y por ítem serían miles de filas
 * que nadie decidió una por una.
 *
 * Lo que hace que no sea lo mismo comerciar en un lado que en otro es **la
 * horquilla**: la estación siempre paga menos de lo que cobra, y esa diferencia
 * es su ganancia. Todo lo que el piloto mejora —Regateo, el rubro de la
 * corporación— **angosta la horquilla**, nunca da vuelta el signo.
 *
 * > **La horquilla tiene piso.** Por mucho que se junte, la estación se queda con
 * > su parte. Es la misma regla que el piso de tiempo de una extracción: el
 * > progreso mejora el número, no borra la mecánica.
 *
 * Reglas puras: acá no hay base de datos ni piloto. Corresponde a
 * docs/systems/MARKET.md.
 */

import type { ItemKind } from './items';
import { roundHalfEven } from './math';
import type { CorporationKind, StationServiceKind } from './universe';

/**
 * Lo que se queda la estación, en puntos de porcentaje sobre el precio de
 * referencia, antes de cualquier mejora.
 *
 * Se reparte en dos mitades iguales: paga un 20 % menos de lo que vale y cobra
 * un 20 % más. Comprar y vender de inmediato deja al piloto un 40 % abajo, que
 * es lo que hace que revender no sea una máquina de hacer plata.
 */
export const BASE_SPREAD_PERCENT = 20;

/**
 * Lo mínimo que se queda la estación, pase lo que pase.
 *
 * Sin este piso, un piloto con Regateo al 5 en la estación del rubro correcto
 * llegaría a comprar y vender al mismo precio, y ahí el comercio deja de tener
 * costo y pasa a ser un botón que se aprieta.
 */
export const MIN_SPREAD_PERCENT = 5;

/** Cuánto angosta la horquilla cada nivel de Regateo. */
export const HAGGLING_PERCENT_PER_LEVEL = 2;

/** La habilidad que mueve el margen. */
export const HAGGLING_SKILL = 'haggling';

/**
 * Qué le mejora al piloto el rubro de la corporación que opera la estación.
 *
 * Es lo que hace que **dónde se vende importe**: una minera vive de comprar
 * mineral y paga mejor que una casa comercial; una industrial fabrica módulos y
 * los vende más barato. Elegir la estación es una decisión con números atrás y
 * no una cuestión de qué queda más cerca.
 *
 * Los valores son de balance y se van a mover. Están en puntos de horquilla, que
 * es lo mismo que decir "puntos de porcentaje sobre el precio de referencia".
 */
export const CORPORATION_EDGE: Readonly<
	Record<CorporationKind, Readonly<Record<ItemKind, number>>>
> = {
	/** Compra mineral todo el día: es su negocio y lo paga mejor que nadie. */
	mining: { ore: 6, module: 0 },
	/** Los fabrica, así que los suelta más barato. */
	industry: { ore: 0, module: 6 },
	/** No produce nada y vive del volumen: un poco mejor en todo. */
	trade: { ore: 3, module: 3 },
	/** Mueve carga ajena; algo de eso se le pega al mostrador. */
	logistics: { ore: 2, module: 2 },
	/** Pasa por los cinturones y trae mineral de vuelta. */
	exploration: { ore: 2, module: 0 },
	/** No comercia: cobra por patrullar. */
	security: { ore: 0, module: 0 }
};

/** Qué compra y qué vende una estación, según los módulos que tenga. */
export interface MarketServices {
	/** Cualquiera que procese mineral lo compra, tenga mostrador o no. */
	readonly buysOre: boolean;
	/** Vender y comprar módulos necesita mostrador. */
	readonly tradesModules: boolean;
}

/**
 * Qué se puede comerciar en una estación, derivado de sus módulos.
 *
 * **La regla es la misma que usa el equipamiento**: lo que una estación ofrece
 * sale de lo que tiene instalado, no de una lista aparte que haya que mantener
 * sincronizada. Una refinería sin mercado igual compra mineral —lo necesita para
 * trabajar—, y eso le da sentido a una parada que de otro modo sería decorativa.
 */
export function marketServices(services: readonly StationServiceKind[]): MarketServices {
	const instalados = new Set(services);
	return {
		buysOre: instalados.has('market') || instalados.has('refinery'),
		tradesModules: instalados.has('market')
	};
}

/** De dónde sale la horquilla de una operación concreta. */
export interface SpreadSources {
	readonly itemKind: ItemKind;
	/** El rubro de quien opera la estación, o `null` si no la opera nadie. */
	readonly corporation: CorporationKind | null;
	readonly hagglingLevel: number;
}

/** La horquilla desarmada, para poder explicarla en pantalla. */
export interface Spread {
	/** Lo que se queda la estación, en porcentaje. Nunca menos que el piso. */
	readonly percent: number;
	readonly base: number;
	/** Cuánto descontó el rubro de la corporación. */
	readonly corporationEdge: number;
	/** Cuánto descontó Regateo. */
	readonly haggling: number;
	/** Si el piso fue lo que terminó decidiendo el número. */
	readonly atFloor: boolean;
}

/**
 * Cuánto se queda la estación en esta operación, y por qué.
 *
 * Se devuelve desarmada y no como un solo número porque **la pantalla tiene que
 * poder explicarla**: un margen del 12 % no dice nada, "20 base, −6 por ser una
 * minera, −2 por Regateo" enseña el juego mientras se lo juega.
 *
 * Las mejoras se **suman**, como fija ACTIONS.md para todos los bonos del
 * proyecto: más fácil de explicar y de balancear que multiplicarlas.
 */
export function spreadFor({ itemKind, corporation, hagglingLevel }: SpreadSources): Spread {
	const corporationEdge = corporation ? CORPORATION_EDGE[corporation][itemKind] : 0;
	const haggling = Math.max(0, hagglingLevel) * HAGGLING_PERCENT_PER_LEVEL;
	const bruto = BASE_SPREAD_PERCENT - corporationEdge - haggling;

	return {
		percent: Math.max(MIN_SPREAD_PERCENT, bruto),
		base: BASE_SPREAD_PERCENT,
		corporationEdge,
		haggling,
		atFloor: bruto < MIN_SPREAD_PERCENT
	};
}

/**
 * Lo que cuesta un lote entero, con la horquilla aplicada.
 *
 * **El precio se calcula sobre el lote y no por unidad.** No es un detalle de
 * implementación: con mineral barato, redondear cien veces borra la diferencia
 * entre una estación y otra —el silicato vale 12, y tanto un 17 % como un 14 %
 * de horquilla dan 10 créditos la unidad— y el rubro de la corporación deja de
 * significar nada justo en el mineral que un minero nuevo vende todo el día.
 * Redondeando una sola vez al final, esos mismos cien silicatos valen 996 o
 * 1.032 según dónde se descarguen, que es lo que hace que el mapa importe.
 *
 * Redondeo al par y no hacia arriba: la regla del proyecto para todo número de
 * balance.
 */
export function askTotal(basePrice: number, quantity: number, spreadPercent: number): number {
	if (quantity < 0) throw new RangeError('Una cantidad no puede ser negativa');
	return roundHalfEven((basePrice * quantity * (100 + spreadPercent)) / 100);
}

/**
 * Lo que la estación paga por un lote entero.
 *
 * Nunca menos de un crédito por unidad: algo que se compra con plata no puede
 * valer cero al venderlo, o la bodega se llena de cosas que no hay forma de
 * sacarse de encima.
 */
export function bidTotal(basePrice: number, quantity: number, spreadPercent: number): number {
	if (quantity < 0) throw new RangeError('Una cantidad no puede ser negativa');
	return Math.max(quantity, roundHalfEven((basePrice * quantity * (100 - spreadPercent)) / 100));
}

/**
 * Lo que la estación cobra por una unidad. Es la cifra **de vitrina**: la que se
 * muestra en la lista, no la que se cobra por un lote.
 */
export function askPrice(basePrice: number, spreadPercent: number): number {
	return askTotal(basePrice, 1, spreadPercent);
}

/** Lo que la estación paga por una unidad, para mostrar en la lista. */
export function bidPrice(basePrice: number, spreadPercent: number): number {
	return bidTotal(basePrice, 1, spreadPercent);
}
