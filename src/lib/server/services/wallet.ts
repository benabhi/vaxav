/**
 * La billetera del piloto: el saldo y el libro que lo explica.
 *
 * Regla del proyecto, de las que no se negocian: **todo movimiento de valor deja
 * asiento**, y el saldo es la suma de los asientos y no un número que se edita.
 * Ver docs/systems/ARCHITECTURE.md.
 *
 * Con una salvedad práctica: sumar años de asientos en cada carga de pantalla no
 * es viable, así que `pilot.credits` se conserva como **caché**. Lo que se
 * prohíbe es *editarlo*, no cachearlo. De ahí la regla dura de este módulo:
 *
 * > **`wallet.ts` es el único lugar del repositorio que escribe `pilot.credits`.**
 *
 * Hay un test que lo verifica recorriendo el código. Si alguna vez hace falta
 * mover plata desde otro lado, se llama a `credit` o a `debit`, no se toca la
 * columna.
 *
 * Cada asiento guarda además el saldo con el que quedó, así una desviación se
 * detecta comparando dos números y no recorriendo el libro entero.
 */

import { desc, eq, sql } from 'drizzle-orm';
import { creditEntry, pilot, type CreditEntry } from '../db/schema';
import type { Db } from '../db/types';

/** No se puede mover la plata. El mensaje se le muestra al jugador. */
export class WalletError extends Error {}

/** Por qué se movió la plata. Queda escrito en el asiento. */
export const CREDIT_MOVES = [
	'ore_sale',
	'module_purchase',
	'module_sale',
	'injector_purchase',
	'refuel',
	'adjustment',
	// --- El mercado entre jugadores ---
	/** Lo que reserva una orden de compra al publicarse. */
	'order_escrow',
	/** Lo reservado que vuelve porque la orden se canceló. */
	'order_refund',
	/** Lo que cobra el corredor por publicar. No se devuelve. */
	'broker_fee',
	/** Lo que se lleva la estación de una venta cumplida. */
	'sales_tax',
	/** Lo cobrado por una orden propia que se cumplió. */
	'order_sale',
	/** Lo pagado por comprarle a la orden de otro. */
	'order_purchase'
] as const;
export type CreditMove = (typeof CREDIT_MOVES)[number];

/** Lo que hace falta para escribir un asiento. */
export interface LedgerNote {
	readonly kind: CreditMove;
	readonly bodyId?: number;
	readonly logId?: number;
	readonly memo?: string;
}

/** El saldo del piloto, del caché. */
export function balance(db: Db, pilotId: number): number {
	const fila = db.select({ credits: pilot.credits }).from(pilot).where(eq(pilot.id, pilotId)).get();
	if (!fila) throw new WalletError('Ese piloto no existe');
	return fila.credits;
}

/**
 * Mueve plata y lo asienta, en una sola transacción.
 *
 * `amount` va con signo. Es una sola función para las dos direcciones porque son
 * la misma operación: separarlas invita a que una escriba el asiento y la otra se
 * olvide, que es exactamente el bug que este módulo existe para evitar.
 *
 * **No se permite saldo negativo.** Un piloto que debe plata es una mecánica
 * —deuda, embargo— y no un accidente de redondeo; el día que exista, se decide a
 * propósito y no porque una resta se pasó.
 */
function post(db: Db, pilotId: number, amount: number, note: LedgerNote): CreditEntry {
	if (!Number.isInteger(amount)) throw new WalletError('Los créditos son enteros');

	return db.transaction((tx) => {
		// Se relee adentro de la transacción: entre que la pantalla mostró el saldo
		// y llegó este pedido, el piloto pudo gastar en otra pestaña.
		const antes = balance(tx, pilotId);
		const despues = antes + amount;
		if (despues < 0) {
			throw new WalletError(`No te alcanza: tenés ${antes} y hacen falta ${-amount}.`);
		}

		tx.update(pilot).set({ credits: despues }).where(eq(pilot.id, pilotId)).run();

		return tx
			.insert(creditEntry)
			.values({
				pilotId,
				amount,
				balanceAfter: despues,
				kind: note.kind,
				bodyId: note.bodyId ?? null,
				logId: note.logId ?? null,
				memo: note.memo ?? ''
			})
			.returning()
			.get();
	});
}

/** Le entra plata al piloto. */
export function credit(db: Db, pilotId: number, amount: number, note: LedgerNote): CreditEntry {
	if (amount <= 0) throw new WalletError('Un cobro tiene que ser positivo');
	return post(db, pilotId, amount, note);
}

/** Le sale plata al piloto. `amount` es lo que paga, en positivo. */
export function debit(db: Db, pilotId: number, amount: number, note: LedgerNote): CreditEntry {
	if (amount <= 0) throw new WalletError('Un pago tiene que ser positivo');
	return post(db, pilotId, -amount, note);
}

/** Los últimos movimientos, del más nuevo al más viejo. */
export function history(db: Db, pilotId: number, limit = 20): readonly CreditEntry[] {
	return db
		.select()
		.from(creditEntry)
		.where(eq(creditEntry.pilotId, pilotId))
		.orderBy(desc(creditEntry.createdAt), desc(creditEntry.id))
		.limit(limit)
		.all();
}

/** Cuántos asientos tiene el piloto, para el paginador. */
export function entryCount(db: Db, pilotId: number): number {
	const fila = db
		.select({ total: sql<number>`count(*)` })
		.from(creditEntry)
		.where(eq(creditEntry.pilotId, pilotId))
		.get();
	return fila?.total ?? 0;
}

/**
 * Cuánto entró y cuánto salió en total, en positivo los dos.
 *
 * Se suma en la base y no en memoria a propósito: el libro crece para siempre, y
 * traerse seis años de asientos para sumarlos acá sería el clásico error que no
 * se nota con veinte movimientos y tumba la pantalla con veinte mil.
 *
 * Son los dos números que convierten un listado en un balance. El saldo dice
 * dónde estás; ingresos contra egresos dice **cómo llegaste**, que es lo que uno
 * quiere saber cuando abre la billetera después de un viaje largo.
 */
export function walletTotals(db: Db, pilotId: number): { incoming: number; outgoing: number } {
	const fila = db
		.select({
			incoming: sql<number>`coalesce(sum(case when ${creditEntry.amount} > 0 then ${creditEntry.amount} else 0 end), 0)`,
			outgoing: sql<number>`coalesce(-sum(case when ${creditEntry.amount} < 0 then ${creditEntry.amount} else 0 end), 0)`
		})
		.from(creditEntry)
		.where(eq(creditEntry.pilotId, pilotId))
		.get();

	return { incoming: fila?.incoming ?? 0, outgoing: fila?.outgoing ?? 0 };
}

/**
 * Si el saldo cacheado coincide con lo que dice el libro.
 *
 * Devuelve `null` cuando cierra. Es la contrapartida de haber cacheado el saldo:
 * si alguna vez se separan, esto lo encuentra sin tener que sospechar primero.
 */
export function auditBalance(db: Db, pilotId: number): { stored: number; ledger: number } | null {
	const stored = balance(db, pilotId);
	const fila = db
		.select({ total: sql<number>`coalesce(sum(${creditEntry.amount}), 0)` })
		.from(creditEntry)
		.where(eq(creditEntry.pilotId, pilotId))
		.get();
	const ledger = fila?.total ?? 0;

	return stored === ledger ? null : { stored, ledger };
}
