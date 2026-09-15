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
 * Desde que hay **órdenes de jugadores**, la estación dejó de ser la única
 * contraparte: es una orden más del libro, con la diferencia de que no se agota y
 * de que su precio es el único que se negocia —Regateo es literalmente eso, y no
 * tiene con quién regatear si del otro lado hay otro piloto—.
 *
 * Las órdenes de la estación **no se guardan**: se calculan. Guardarlas serían
 * doscientas filas que hay que resembrar cada vez que cambie una fórmula, y
 * además su precio depende de quién pregunta.
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

/** Qué se puede hacer en el mostrador de una estación. */
export interface MarketServices {
	/** Si hay mostrador: comprar, vender y publicar órdenes. */
	readonly trades: boolean;
}

/**
 * Si en una estación se puede comerciar, derivado de sus módulos.
 *
 * **Hace falta el módulo Mercado, sin excepciones.** Una estación que no lo tiene
 * no aparece en el libro de órdenes, no compra ni vende nada y nadie puede
 * publicar ahí: sin mostrador no hay con quién tratar. Es la misma regla que usa
 * el equipamiento —lo que una estación ofrece sale de lo que tiene instalado— y
 * es lo que hace que instalar un mercado sea una decisión con consecuencias el
 * día que los módulos de estación los pongan los jugadores.
 */
export function marketServices(services: readonly StationServiceKind[]): MarketServices {
	return { trades: new Set(services).has('market') };
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

/* ------------------------------------------------------------------------- *
 * Las órdenes
 * ------------------------------------------------------------------------- */

/** De qué lado del libro está una orden. */
export const ORDER_KINDS = ['buy', 'sell'] as const;
export type OrderKind = (typeof ORDER_KINDS)[number];

/**
 * Hasta dónde ve un piloto, en regiones, contando la propia.
 *
 * Es el techo de diseño: **cinco regiones y no más**. Que el mercado no sea
 * global es lo que hace que la galaxia tenga geografía económica —que el hierro
 * valga distinto de un lado y del otro, y que eso sea una oportunidad para quien
 * pueda moverlo—. Un mercado que se ve entero desde cualquier parte convierte a
 * todas las estaciones en la misma estación.
 */
export const MAX_REGIONS_IN_RANGE = 5;

/**
 * Qué habilidad de Comercio mueve cada número.
 *
 * Cada una tiene **un trabajo y se nota cuál**: lo que se negocia de palabra es
 * Regateo, lo que se arregla con papeles es Contabilidad, y hasta dónde llega tu
 * vista del mercado es Análisis. Contactos queda para los contratos.
 */
export const MARKET_RANGE_SKILL = 'market_analysis';
export const BROKER_SKILL = 'haggling';
export const TAX_SKILL = 'accounting';

/**
 * Cuántas regiones alcanza la vista de un piloto.
 *
 * Sin entrenar se ve **la propia**, y cada nivel suma una hasta el tope. Nunca
 * cero: un piloto que no ve ni el mercado donde está parado no podría vender lo
 * que acaba de minar, y eso no es progresión, es una pared.
 */
export function regionsInRange(level: number): number {
	return Math.min(MAX_REGIONS_IN_RANGE, 1 + Math.max(0, level));
}

/** Cuántas órdenes abiertas se pueden llevar a la vez, sin habilidad y por nivel. */
export const BASE_OPEN_ORDERS = 2;
export const ORDERS_PER_LEVEL = 2;

/**
 * El tope de órdenes abiertas, según **Contabilidad**.
 *
 * Es lo que separa a quien vende lo que le sobra de quien vive de comerciar: con
 * dos órdenes se liquida una bodega, con doce se sostiene un negocio en varias
 * estaciones a la vez. Llevar más libros a la vez es exactamente de lo que se
 * trata la habilidad.
 */
export function openOrderLimit(level: number): number {
	return BASE_OPEN_ORDERS + Math.max(0, level) * ORDERS_PER_LEVEL;
}

/**
 * Hasta dónde puede alcanzar una **orden de compra**, en regiones.
 *
 * Cero es "sólo en esta estación": quien quiera venderte tiene que venir hasta
 * acá. Uno es la región entera. Las de venta no tienen alcance —la mercadería
 * está en una estación y ahí se retira—, que es lo que hace que comprar lejos
 * siga costando un viaje.
 */
export function maxOrderRange(level: number): number {
	return regionsInRange(level) - 1;
}

/* ------------------------------------------------------------------------- *
 * Lo que se lleva la casa
 * ------------------------------------------------------------------------- */

/**
 * Los dos cobros del comercio, en **milésimos** del valor.
 *
 * En milésimos y no en porcentaje para que las habilidades puedan moverlos de a
 * poco sin decimales: "medio punto por nivel" no se escribe en enteros, y un
 * flotante en una cuenta de balance es una moneda que aparece o desaparece al
 * sumar.
 *
 * Son dos y no uno porque castigan cosas distintas, y ésa es la gracia:
 *
 * - **La comisión** se paga al *publicar* y **no se devuelve al cancelar**. Es lo
 *   que hace que llenar el libro de órdenes para tantear el mercado tenga costo.
 * - **El impuesto** se paga al *vender*, sobre lo cobrado. Es el sumidero de
 *   créditos de la economía: sin algo que saque plata del mundo, la plata sólo
 *   entra y todo termina valiendo nada.
 *
 * Los dos bajan con habilidad **hasta un piso**, nunca a cero. La casa siempre se
 * lleva lo suyo, igual que la horquilla y que el tiempo de una extracción: el
 * progreso mejora el número, no borra la mecánica.
 */
export const BROKER_FEE_PERMILLE = 30;
export const BROKER_FEE_RELIEF_PER_LEVEL = 4;
export const MIN_BROKER_FEE_PERMILLE = 10;

export const SALES_TAX_PERMILLE = 50;
export const SALES_TAX_RELIEF_PER_LEVEL = 6;
export const MIN_SALES_TAX_PERMILLE = 20;

/**
 * La comisión del corredor, según **Regateo**.
 *
 * Es la misma habilidad que angosta la horquilla de la estación, y es coherente:
 * las dos son lo que conseguís discutiendo en el mostrador. Contabilidad se
 * ocupa de lo que se arregla con papeles.
 */
export function brokerFeePermille(hagglingLevel: number): number {
	const bruto = BROKER_FEE_PERMILLE - Math.max(0, hagglingLevel) * BROKER_FEE_RELIEF_PER_LEVEL;
	return Math.max(MIN_BROKER_FEE_PERMILLE, bruto);
}

/** El impuesto sobre lo vendido, según **Contabilidad**. */
export function salesTaxPermille(accountingLevel: number): number {
	const bruto = SALES_TAX_PERMILLE - Math.max(0, accountingLevel) * SALES_TAX_RELIEF_PER_LEVEL;
	return Math.max(MIN_SALES_TAX_PERMILLE, bruto);
}

/**
 * Lo que se lleva la casa de un monto, en enteros.
 *
 * Mínimo un crédito sobre cualquier monto que no sea cero: un cobro de cero no
 * es un cobro, y dejaría un resquicio por donde operar gratis partiendo todo en
 * lotes diminutos.
 */
export function cut(amount: number, permille: number): number {
	if (amount < 0) throw new RangeError('El monto no puede ser negativo');
	if (amount === 0) return 0;
	return Math.max(1, roundHalfEven((amount * permille) / 1000));
}
