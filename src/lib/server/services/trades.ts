/**
 * La historia de precios: a cuánto se estuvo comerciando cada cosa.
 *
 * **El precio de algo es su historia.** Una cifra suelta no dice si es buena: lo
 * que la vuelve una decisión es ver que el iridio viene subiendo hace cuatro
 * días, o que alguien acaba de tirar el hierro a la mitad. Sin esto, comerciar es
 * apostar.
 *
 * Se guarda una fila por operación y se agrega **por día** al consultar, que es
 * la granularidad que se mira: dentro de un mismo día lo que importa es entre qué
 * precios se movió y cuánto se movió, no el orden exacto de los renglones.
 */

import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { marketTrade, type MarketTrade } from '../db/schema';
import type { Db } from '../db/types';

/** Cuánto pasado se mira por defecto. Un mes es lo que cabe en un gráfico chico. */
export const HISTORY_DAYS = 30;

const MILLISECONDS_PER_DAY = 86_400_000;

/** Un día de mercado, que es la unidad en que se mira una tendencia. */
export interface TradingDay {
	/** El día, a medianoche UTC, en milisegundos. */
	readonly at: number;
	readonly low: number;
	readonly high: number;
	/** El precio medio ponderado por cantidad: lo que de verdad costó la unidad. */
	readonly average: number;
	/** Cuántas unidades cambiaron de manos. */
	readonly volume: number;
	readonly trades: number;
}

/** Deja escrito que algo se comerció, para que mañana se pueda dibujar. */
export function recordTrade(
	db: Db,
	trade: {
		itemCode: string;
		stationId: number;
		price: number;
		quantity: number;
		fromStation?: boolean;
	}
): void {
	db.insert(marketTrade)
		.values({
			itemCode: trade.itemCode,
			stationId: trade.stationId,
			price: trade.price,
			quantity: trade.quantity,
			fromStation: trade.fromStation ?? false
		})
		.run();
}

/** Las últimas operaciones de un ítem, de la más nueva a la más vieja. */
export function recentTrades(db: Db, itemCode: string, limit = 20): readonly MarketTrade[] {
	return db
		.select()
		.from(marketTrade)
		.where(eq(marketTrade.itemCode, itemCode))
		.orderBy(desc(marketTrade.createdAt), desc(marketTrade.id))
		.limit(limit)
		.all();
}

/**
 * La historia de un ítem, agrupada por día y del más viejo al más nuevo.
 *
 * El promedio va **ponderado por cantidad** y no por operación: una venta de mil
 * unidades dice mucho más sobre el precio del día que una de tres, y promediar
 * los renglones a secas dejaría que una operación mínima moviera la curva tanto
 * como una enorme.
 *
 * Los días sin operaciones **no aparecen**. Rellenarlos con ceros haría que la
 * curva se desplome a cero cada vez que nadie comerció, que es lo contrario de lo
 * que pasó; el gráfico une los días que hubo, y el hueco se ve como lo que es.
 */
export function priceHistory(db: Db, itemCode: string, days = HISTORY_DAYS): readonly TradingDay[] {
	const desde = new Date(Date.now() - days * MILLISECONDS_PER_DAY);

	const filas = db
		.select({
			// `unixepoch` está en segundos y el día en milisegundos: se trunca al día
			// en la base para no traerse un mes de operaciones y agruparlas en memoria.
			day: sql<number>`cast(${marketTrade.createdAt} / 86400 as integer)`,
			low: sql<number>`min(${marketTrade.price})`,
			high: sql<number>`max(${marketTrade.price})`,
			value: sql<number>`sum(${marketTrade.price} * ${marketTrade.quantity})`,
			volume: sql<number>`sum(${marketTrade.quantity})`,
			trades: sql<number>`count(*)`
		})
		.from(marketTrade)
		.where(and(eq(marketTrade.itemCode, itemCode), gte(marketTrade.createdAt, desde)))
		.groupBy(sql`cast(${marketTrade.createdAt} / 86400 as integer)`)
		.orderBy(sql`cast(${marketTrade.createdAt} / 86400 as integer)`)
		.all();

	return filas.map((fila) => ({
		at: fila.day * MILLISECONDS_PER_DAY,
		low: fila.low,
		high: fila.high,
		// Truncado y no redondeado: es un precio de referencia para leer, y en el
		// balance del proyecto no se redondea a la ligera.
		average: fila.volume > 0 ? Math.trunc(fila.value / fila.volume) : 0,
		volume: fila.volume,
		trades: fila.trades
	}));
}
