/**
 * La billetera del piloto: el saldo y el libro que lo explica.
 *
 * El saldo solo no dice nada; lo que hace auditable a una economía es poder
 * seguir cada movimiento hasta el hecho que lo causó. Por eso cada asiento viene
 * con **el saldo que dejó**: leyendo la columna de arriba a abajo se reconstruye
 * la historia sin tener que sumar.
 *
 * Ver docs/systems/ARCHITECTURE.md.
 */

import { inArray } from 'drizzle-orm';
import { body, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { balance, entryCount, history } from '../services/wallet';
import { thousands } from '$lib/format';
import type { IconName } from '$lib/icons';
import type { Billetera, MovimientoBilletera } from '$lib/tipos';

/**
 * Cómo se llama cada clase de movimiento, y con qué se lo dibuja.
 *
 * Vive acá y no en el servicio por la misma razón que el nombre de una facción:
 * qué pasó es dato, cómo se lo cuenta es presentación.
 */
const MOVES: Record<string, { label: string; icon: IconName }> = {
	ore_sale: { label: 'Venta de mineral', icon: 'diamond' },
	module_purchase: { label: 'Compra de módulo', icon: 'wrench' },
	module_sale: { label: 'Venta de módulo', icon: 'wrench' },
	injector_purchase: { label: 'Inyección', icon: 'atom' },
	refuel: { label: 'Combustible', icon: 'gas-can' },
	adjustment: { label: 'Ajuste', icon: 'scales' }
};

/** El nombre y el ícono de un movimiento, o algo genérico si es nuevo. */
function moveOf(kind: string): { label: string; icon: IconName } {
	return MOVES[kind] ?? { label: 'Movimiento', icon: 'coins' };
}

/**
 * Los nombres de todos los cuerpos que menciona una tanda de asientos.
 *
 * En una sola consulta: el libro es una lista, y preguntarlos fila por fila sería
 * una consulta por renglón para nombrar un lugar.
 */
function bodyNames(db: Db, ids: readonly (number | null)[]): Map<number, string> {
	const pedidos = [...new Set(ids.filter((id): id is number => id !== null))];
	if (pedidos.length === 0) return new Map();

	const found = db
		.select({ id: body.id, name: body.name })
		.from(body)
		.where(inArray(body.id, pedidos))
		.all();
	return new Map(found.map((fila) => [fila.id, fila.name]));
}

/** El saldo y los últimos movimientos, listos para dibujar. */
export function buildWalletView(db: Db, row: Pilot, limit = 20): Billetera {
	const asientos = history(db, row.id, limit);
	const names = bodyNames(
		db,
		asientos.map((asiento) => asiento.bodyId)
	);

	const entries: MovimientoBilletera[] = asientos.map((asiento) => {
		const { label, icon } = moveOf(asiento.kind);
		const entra = asiento.amount >= 0;
		return {
			id: asiento.id,
			at: asiento.createdAt.getTime(),
			kindLabel: label,
			icon,
			// El signo va escrito y no sólo pintado: un daltónico también tiene que
			// poder leer si entró o salió plata.
			amount: `${entra ? '+' : '−'}${thousands(Math.abs(asiento.amount))} CR`,
			incoming: entra,
			balanceAfter: `${thousands(asiento.balanceAfter)} CR`,
			memo: asiento.memo,
			place: asiento.bodyId === null ? '' : (names.get(asiento.bodyId) ?? '')
		};
	});

	return {
		balance: `${thousands(balance(db, row.id))} CR`,
		entries,
		total: entryCount(db, row.id)
	};
}
