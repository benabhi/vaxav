/**
 * Las bodegas: qué hay adentro y cómo entra y sale.
 *
 * Mismo patrón que el resto de los servicios: la base entra como primer
 * argumento, así que mover carga puede ir dentro de la transacción que resuelve
 * una acción —y tiene que ir, o una extracción deja mineral sin informe o un
 * informe sin mineral—.
 *
 * **Nada se mueve sin asiento.** Cada entrada y cada salida escribe su fila en el
 * libro de ítems en la misma transacción que toca el montón, así que la cantidad
 * guardada es siempre un caché de algo recalculable. Cuando una economía no
 * cierra, la única forma de averiguar dónde se rompió es tener el libro; cuando
 * ya se rompió, es tarde para empezar a llevarlo.
 *
 * Ver docs/systems/ARCHITECTURE.md.
 */

import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { container, itemEntry, itemStack, type Container, type ItemStack } from '../db/schema';
import type { Db } from '../db/types';
import { capacityTenths, getItem, volumeOf } from '$lib/game/items';

/** No se puede mover la carga. El mensaje se le muestra al jugador. */
export class CargoError extends Error {}

/** Por qué se movió algo. Queda escrito en el asiento. */
export const ITEM_MOVES = [
	'mined',
	'sold',
	'bought',
	'granted',
	'transferred',
	/** Salió de la bodega para montarse en una ranura. */
	'fitted',
	/** Se bajó de una ranura y volvió a la bodega. */
	'unfitted',
	/** Salió de la bodega a quedar en garantía de una orden de venta. */
	'listed',
	/** Volvió de una orden de venta que se canceló. */
	'unlisted',
	/**
	 * Salió de la bodega al tanque de la nave.
	 *
	 * Es una salida sin destino: el combustible deja de ser carga y pasa a ser
	 * autonomía, así que no hay contraparte a la que anotarle la entrada. Se llama
	 * igual que el asiento de la billetera a propósito —el mismo hecho contado en
	 * los dos libros— aunque el de acá mueva unidades y el otro créditos.
	 */
	'refuel'
] as const;
export type ItemMove = (typeof ITEM_MOVES)[number];

/** Lo que hay en una bodega, con lo que ocupa. */
export interface CargoLine {
	readonly itemCode: string;
	readonly quantity: number;
	/** Lo que ocupa este montón, en décimas de m³. */
	readonly volumeTenths: number;
}

/** Una bodega y lo que lleva adentro. */
export interface CargoHold {
	readonly containerId: number;
	readonly lines: readonly CargoLine[];
	/** Lo ocupado y el tope, los dos en décimas de m³. */
	readonly usedTenths: number;
	readonly capacityTenths: number;
	readonly freeTenths: number;
}

/**
 * La bodega de una nave, creándola si es la primera vez.
 *
 * Se crea al pedirla y no al crear la nave, aunque el alta también la pida: así
 * las naves que ya existían desde antes de que hubiera bodegas no quedan sin
 * una, y no hace falta una migración de datos para algo que se resuelve solo.
 */
export function shipContainer(db: Db, shipId: number): Container {
	const found = db.select().from(container).where(eq(container.shipId, shipId)).get();
	if (found) return found;

	return db.insert(container).values({ kind: 'ship', shipId }).returning().get();
}

/**
 * La bodega que un piloto tiene en una estación, creándola si es la primera vez.
 *
 * Es el hangar de EVE: **lo que dejás ahí se queda ahí**. Lo que llevás en la
 * nave viaja con vos; lo que está en una estación hay que ir a buscarlo. Esa
 * diferencia es la que hace que el mapa tenga logística y no sólo distancias.
 *
 * Se crea al pedirla, igual que la de la nave: nadie alquila un espacio antes de
 * tener algo que poner en él.
 */
export function stationContainer(db: Db, pilotId: number, stationId: number): Container {
	const found = db
		.select()
		.from(container)
		.where(and(eq(container.pilotId, pilotId), eq(container.stationId, stationId)))
		.get();
	if (found) return found;

	return db.insert(container).values({ kind: 'station', pilotId, stationId }).returning().get();
}

/** Los montones de una bodega, en orden estable. */
export function stacks(db: Db, containerId: number): readonly ItemStack[] {
	return db
		.select()
		.from(itemStack)
		.where(eq(itemStack.containerId, containerId))
		.orderBy(asc(itemStack.itemCode))
		.all();
}

/** Lo que ocupa todo lo que hay en una bodega, en décimas de m³. */
export function usedVolume(db: Db, containerId: number): number {
	return stacks(db, containerId).reduce(
		(total, stack) => total + volumeOf(stack.itemCode, stack.quantity),
		0
	);
}

/**
 * Una bodega lista para mostrar o para decidir si algo entra.
 *
 * `capacity` llega en metros cúbicos —es lo que dice la hoja de rendimiento de la
 * nave— y se convierte una sola vez, acá, para que no haya dos ideas de cuánto
 * entra dando vueltas.
 */
export function cargoHold(db: Db, containerId: number, capacityCubicMeters: number): CargoHold {
	const lines = stacks(db, containerId).map((stack) => ({
		itemCode: stack.itemCode,
		quantity: stack.quantity,
		volumeTenths: volumeOf(stack.itemCode, stack.quantity)
	}));

	const used = lines.reduce((total, line) => total + line.volumeTenths, 0);
	const tope = capacityTenths(capacityCubicMeters);

	return {
		containerId,
		lines,
		usedTenths: used,
		capacityTenths: tope,
		// Nunca negativo: una bodega puede quedar pasada de peso si la nave pierde
		// capacidad al desmontar algo, y "queda -30" no es una lectura útil.
		freeTenths: Math.max(0, tope - used)
	};
}

/** Cuántas unidades de un ítem hay en una bodega. */
export function quantityOf(db: Db, containerId: number, itemCode: string): number {
	const found = db
		.select()
		.from(itemStack)
		.where(and(eq(itemStack.containerId, containerId), eq(itemStack.itemCode, itemCode)))
		.get();
	return found?.quantity ?? 0;
}

/**
 * Cuántas unidades de un ítem entran todavía en lo que queda de bodega.
 *
 * Se pregunta antes de extraer: el rendimiento de un ciclo no puede pasarse del
 * lugar disponible, y truncar la última unidad es mejor que rechazar la carga
 * entera o que dejarla en el aire.
 */
export function fitsUnits(freeTenths: number, itemCode: string): number {
	const unidad = getItem(itemCode).volumeTenths;
	if (unidad <= 0) throw new CargoError(`${itemCode} no declara volumen`);
	return Math.max(0, Math.trunc(freeTenths / unidad));
}

/**
 * Suma o resta unidades de un ítem en una bodega, y lo asienta.
 *
 * Una sola función para las dos direcciones porque son la misma operación con el
 * signo cambiado, y tenerlas separadas invita a que una escriba el asiento y la
 * otra se olvide.
 *
 * **No valida capacidad.** Quién puede meter cuánto depende de la nave, y eso lo
 * sabe quien llama; acá se protege lo que no puede depender de nadie: que no
 * quede una cantidad negativa y que todo movimiento deje su rastro.
 */
export function moveItem(
	db: Db,
	containerId: number,
	itemCode: string,
	quantity: number,
	move: ItemMove,
	options: { counterpartId?: number; logId?: number } = {}
): number {
	// Falla temprano si el catálogo no lo conoce: un código inventado guardado en
	// un inventario es carga que después nadie puede valuar ni mostrar.
	getItem(itemCode);
	if (!Number.isInteger(quantity)) throw new CargoError('Las unidades son enteras');
	if (quantity === 0) return quantityOf(db, containerId, itemCode);

	return db.transaction((tx) => {
		const antes = quantityOf(tx, containerId, itemCode);
		const despues = antes + quantity;
		if (despues < 0) {
			throw new CargoError(`No tenés tanto: hay ${antes} y se piden ${-quantity}.`);
		}

		if (despues === 0) {
			// Cero es una fila que se borra. Un inventario lleno de ceros crece para
			// siempre y ensucia toda consulta que recorra montones.
			tx.delete(itemStack)
				.where(and(eq(itemStack.containerId, containerId), eq(itemStack.itemCode, itemCode)))
				.run();
		} else {
			tx.insert(itemStack)
				.values({ containerId, itemCode, quantity: despues })
				.onConflictDoUpdate({
					target: [itemStack.containerId, itemStack.itemCode],
					set: { quantity: despues }
				})
				.run();
		}

		tx.insert(itemEntry)
			.values({
				containerId,
				itemCode,
				quantity,
				quantityAfter: despues,
				kind: move,
				counterpartId: options.counterpartId ?? null,
				logId: options.logId ?? null
			})
			.run();

		return despues;
	});
}

/**
 * Pasa carga de una bodega a otra, con los dos asientos apuntándose entre sí.
 *
 * Es una sola transacción: media transferencia es carga duplicada o carga
 * perdida, y las dos son peores que un error.
 */
export function transferItem(
	db: Db,
	fromId: number,
	toId: number,
	itemCode: string,
	quantity: number
): void {
	if (quantity <= 0) throw new CargoError('Hay que mover al menos una unidad');
	if (fromId === toId) throw new CargoError('Origen y destino son la misma bodega');

	db.transaction((tx) => {
		moveItem(tx, fromId, itemCode, -quantity, 'transferred', { counterpartId: toId });
		moveItem(tx, toId, itemCode, quantity, 'transferred', { counterpartId: fromId });
	});
}

/**
 * Recalcula las cantidades desde el libro y dice dónde no coinciden.
 *
 * Es la contrapartida de haber cacheado la cantidad en el montón: si el caché y
 * los asientos se separan alguna vez, esto lo encuentra sin tener que sospechar
 * primero. Devuelve vacío cuando todo cierra, así un test puede exigir eso.
 */
export function auditStacks(
	db: Db,
	containerId: number
): readonly { itemCode: string; stored: number; ledger: number }[] {
	const delLibro = db
		.select({
			itemCode: itemEntry.itemCode,
			total: sql<number>`sum(${itemEntry.quantity})`
		})
		.from(itemEntry)
		.where(eq(itemEntry.containerId, containerId))
		.groupBy(itemEntry.itemCode)
		.all();

	const guardado = new Map(
		stacks(db, containerId).map((stack) => [stack.itemCode, stack.quantity])
	);
	const problemas: { itemCode: string; stored: number; ledger: number }[] = [];

	for (const fila of delLibro) {
		const stored = guardado.get(fila.itemCode) ?? 0;
		if (stored !== fila.total) {
			problemas.push({ itemCode: fila.itemCode, stored, ledger: fila.total });
		}
		guardado.delete(fila.itemCode);
	}

	// Lo que está guardado y el libro no menciona: apareció sin asiento.
	for (const [itemCode, stored] of guardado) {
		problemas.push({ itemCode, stored, ledger: 0 });
	}

	return problemas;
}

/** Los últimos movimientos de una bodega, del más nuevo al más viejo. */
export function itemHistory(db: Db, containerId: number, limit = 20) {
	return db
		.select()
		.from(itemEntry)
		.where(eq(itemEntry.containerId, containerId))
		.orderBy(desc(itemEntry.createdAt), desc(itemEntry.id))
		.limit(limit)
		.all();
}
